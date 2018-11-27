//
// SecureImage
//
// Copyright © 2018 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Created by Jason Leach on 2018-06-10.
//

'use strict';

import { getObject, logger } from '@bcgov/nodejs-common-utils';
import fs from 'fs';
import cp from 'child_process';
import util from 'util';
import path from 'path';
import shortid from 'shortid';
import config from '../config';
import shared from './shared';
import { fetchKeychainValue } from './utils';

const exec = util.promisify(cp.exec);
const writeFile = util.promisify(fs.writeFile);

const bucket = config.get('minio:bucket');

/**
 * Fetch all the currently available signing identities for iOS
 *
 * @returns
 */
const currentValidSigningIdentities = async () => {
  const { stdout } = await exec(`
    security find-identity -p codesigning -v
  `);

  const items = stdout
    .split('\n')
    .slice(0, -2)
    .map(item => item.trim().substr(3));

  return items;
};

/**
 * Retrieve the identifier used to sign an iOS app
 *
 * @param {string} apath
 * @returns
 */
const extractCurrentSigningIdentifier = async apath => {
  const { stdout } = await exec(`
    cd "${apath}" && \
    codesign -d --verbose=4 Payload/*.app 2>&1 | \
    grep 'Authority' | \
    head -1 | \
    awk -F '=' '{ print $2 }'
  `);

  return stdout.trim();
};

/**
 * Return the matching UUID for a given text based identifier
 *
 * @param {string} value
 * @returns
 */
const uniqueSigningIdentifierForValue = async value => {
  const cids = await currentValidSigningIdentities();
  const matches = await cids.find(item => item.includes(value));
  if (matches.length === 0) {
    return undefined;
  }

  return matches.split(' ')[0].trim();
};

const fetchFileFromStorage = async (archiveFilePath, workspace) => {
  const outFileName = shortid.generate();
  const apath = path.join(workspace, shortid.generate());
  const outFilePath = path.join(apath, outFileName);
  const buffer = await getObject(shared.minio, bucket, archiveFilePath);

  await exec(`mkdir -p ${apath}`);
  await writeFile(outFilePath, buffer, 'utf8');

  return outFilePath;
};

/**
 * Package a signed artifact for delivery into a ZIP.
 *
 * @param {string} archiveFilePath The path to the uploaded archive (ZIP)
 * @param {string} workspace The workspace to use
 * @returns A `string` containing the path to extracted contents
 */
const extractArchiveContents = async (archiveFilePath, workspace) => {
  try {
    const inFilePath = await fetchFileFromStorage(archiveFilePath, workspace);
    const outpath = path.dirname(inFilePath);

    await exec(`unzip -q ${inFilePath} -d ${outpath}`);

    return outpath;
  } catch (error) {
    const message = `Unable to write file to workspace, error = ${error.message}`;
    logger.error(message);

    throw new Error(message);
  }
};

/**
 * Package a signed artifact for delivery into a ZIP.
 *
 * @param {string} apath The path to the signed artifacts
 * @param {string} items The items to be included in the archive
 * @returns A `string` containing the path to the newly minted ZIP archive
 */
const packageForDelivery = async (apath, items) => {
  const fileName = `${shortid.generate()}.zip`;
  const zipResult = await exec(`
    cd ${apath} && \
    zip -6rq -n 'ipa' ${fileName} ${items.map(i => path.basename(i)).join(' ')} && \
    echo 'OK' || echo 'FAIL'
  `);

  if (zipResult.stderr !== '' || zipResult.stdout.includes('FAIL')) {
    throw new Error('Unable to create delivery package');
  }

  return Promise.resolve(path.join(apath, fileName));
};

/**
 * Get the bundle ID of the app package
 *
 * @param {String} apkPackage The name of the app
 * @returns The bundle ID
 */
const getApkBundleID = async apkPackage => {
  try {
    // Use Android Asset Packaging Tool to get package bundle ID:
    const apkBundle = await exec(`
    aapt dump badging ${apkPackage} | \
    grep package: | \
    cut -d "'" -f2
    `);
    // Get rid of the linebreak at the end:
    return apkBundle.stdout.replace(/(\r\n\t|\n|\r\t)/gm, '');
  } catch (error) {
    throw new Error(`Unable to find package name! ${error}`);
  }
};

/**
 * Create a keystore pair for android app if not existing,
 * and save in the keychain on agent
 * @param {String} apkBundleID The bundle of app
 * @param {Object} keystoreKeys The keywords for keystore pair
 */
const createKeyStore = async (keystoreKeys, apkBundleID) => {
  const keystorePassword = Math.random()
    .toString(36)
    .substring(7);

  try {
    // 1. create keystore:
    await exec(`
      keytool -genkey -v \
      -keystore ${apkBundleID}-ks.jks \
      -keyalg RSA -keysize 2048 -validity 10000 \
      -alias ${apkBundleID} \
      -storepass ${keystorePassword} -keypass ${keystorePassword} \
      -dname "cn=BCGOV, ou=BCGOV, o=BCGOV, c=CA"
    `);

    // 1.1 Verify success creation and get the jks path:
    const keystoreResult = await exec(`ls "$(pwd)" | grep ${apkBundleID}-ks.jks`);
    if (keystoreResult.stdout === '') {
      throw new Error('Unable to create new keystore pair!');
    }

    // 2. Save into keychain:
    /* eslint-disable */
    await exec(`
      security add-generic-password -a ${apkBundleID} -s ${keystoreKeys[0]} -p ${apkBundleID} -T /usr/bin/security -U
      security add-generic-password -a ${apkBundleID} -s ${keystoreKeys[1]} -p ${keystorePassword} -T /usr/bin/security -U
      security add-generic-password -a ${apkBundleID} -s ${keystoreKeys[2]} -p "$(pwd)"/${apkBundleID}-ks.jks -T /usr/bin/security -U
    `);
    /* eslint-enable */
  } catch (err) {
    throw new Error(`Unable to generate and save keystore for this app: ${err}`);
  }
};

/**
 * Check if the android keystore pair exists in agent keychain,
 * if non-existing, create one and return the pair
 * @param {String} apkBundleID The bundle of app
 * @returns keyPairs
 */
const getKeyStore = async apkBundleID => {
  const keystoreKeys = ['keyAlias', 'keyPassword', 'keyStorePath'];

  // 1. Use security to check for android keystore in keychain:
  try {
    await exec(`security find-generic-password -w -a ${apkBundleID}`);
  } catch (err) {
    logger.info('No keystore for this app...start to create one now:');

    // 2. Create a pair of keystore:
    await createKeyStore(keystoreKeys, apkBundleID);
    logger.info('Done creating a new keystore');
  }

  return fetchKeychainValue(keystoreKeys, apkBundleID);
};

/**
 * Parse out the meaningful error message from a failed xcode build message
 *
 * @param {string} message Multiline message from xcode build
 * @returns A `string` containing the meaningful error message
 */
export const parseXcodebuildError = message => {
  const key = 'error:';
  const aLine = message.split('\n').find(line => line.startsWith(key));

  return aLine.substr(key.length).trim();
};

/**
 * Sign an xcode xcarchive file.
 *
 * @param {string} archiveFilePath The path to the xcarchive file
 * @param {string} [workspace='/tmp/'] The workspace to use
 * @returns A `string` containing the path to the newly minted archive
 */
// eslint-disable-next-line import/prefer-default-export
export const signxcarchive = async (archiveFilePath, workspace = '/tmp/') => {
  try {
    const outputDir = 'signed';
    const apath = await extractArchiveContents(archiveFilePath, workspace);
    const findResult = await exec(`find ${apath} -iname '*.xcarchive'`);
    const plistPath = await exec(`find ${apath} -iname 'options.plist'`);
    if (findResult.stderr || plistPath.stderr) {
      throw new Error('Unable to find xcarchive(s) or options.plist in package');
    }

    const promises = findResult.stdout
      .trim()
      .split('\n')
      .filter(item => !item.includes('__MACOSX'))
      .map(async element => {
        const exppath = `${path.join(
          apath,
          outputDir,
          path.basename(element).split('.')[0]
        )}`.replace(/ /g, '_');
        return exec(`
          xcodebuild \
          -exportArchive \
          -archivePath "${element}" \
          -exportPath "${exppath}"  \
          -exportOptionsPlist ${path.join(path.dirname(element), 'options.plist')} 
        `);
      });

    const response = await Promise.all(promises);

    const items = [];
    response.forEach(value => {
      const { stdout } = value;
      if (stdout.includes('EXPORT SUCCEEDED')) {
        const lines = stdout.trim().split('\n');
        const components = lines[0].split('to:').map(item => item.trim());
        if (components.length !== 2) {
          throw new Error('Unexpected response from archive export');
        }

        items.push(components.pop());
      }
    });

    return packageForDelivery(path.join(apath, outputDir), items);
  } catch (err) {
    const errorMessage = parseXcodebuildError(err.message);
    const message = 'Unable to sign xcarchive';
    logger.error(`${message}, err = ${err.message}`);

    throw new Error(errorMessage);
  }
};

/**
 * Sign an xcode ipa file.
 *
 * @param {string} archiveFilePath The path to the ipa file
 * @param {string} [workspace='/tmp/'] The workspace to use
 * @returns A `string` containing the path to the newly minted archive
 */
// eslint-disable-next-line no-unused-vars
export const signipaarchive = async (archiveFilePath, workspace = '/tmp/') => {
  const outputDir = 'tmp';
  const apath = path.join(workspace, shortid.generate());
  const outBasePath = path.join(apath, outputDir);
  const ipaPath = `${path.join(apath, shortid.generate())}.ipa`;
  const outFileName = `${path.join(apath, shortid.generate())}.ipa`;

  await exec(`
    mkdir -p "${apath}" && \
    cp -a "${archiveFilePath}" "${ipaPath}"
  `);

  // extract the IPA (really just a ZIP) contents so we have access
  // to the `.app` file.
  await exec(`
    mkdir -p "${outBasePath}" && \
    unzip -q "${ipaPath}" -d "${outBasePath}"
  `);

  // Try and figure out what the current signing identifier is
  const certIdentifier = await extractCurrentSigningIdentifier(outBasePath);
  const signingIdentifier = await uniqueSigningIdentifierForValue(certIdentifier);
  if (!signingIdentifier) {
    throw new Error('No match to current signing identity');
  }

  // Force re-sign the .app and package it back into an IPA.
  await exec(`
    cd "${outBasePath}" && \
    rm -rf Payload/*.app/_CodeSignature && \
    codesign -f -s "${signingIdentifier}" Payload/*.app && \
    zip -qr "${outFileName}" *
  `);

  return outFileName;
};

/**
 * Sign an Android apk file.
 *
 * @param {string} archiveFilePath The path to the apk file
 * @param {string} [workspace='/tmp/'] The workspace to use
 * @returns A `string` containing the path to the newly minted archive
 *
 */
// eslint-disable-next-line no-unused-vars
/* eslint-disable global-require */
export const signapkarchive = async (archiveFilePath, workspace = '/tmp/') => {
  const apath = path.join(workspace, shortid.generate());
  const packagePath = path.join(apath, shortid.generate());
  const outFileName = `${path.join(packagePath, shortid.generate())}.apk`;
  const keystoreKeys = ['keyAlias', 'keyPassword', 'keyStorePath'];

  // Get the package from minio:
  const buffer = await getObject(shared.minio, bucket, archiveFilePath);
  await exec(`mkdir -p ${packagePath}`);
  await writeFile(outFileName, buffer, 'utf8');

  // Get the path of package locally:
  const apkPathFull = await exec(`find ${packagePath} -iname '*.apk'`);
  if (apkPathFull.stderr) {
    throw new Error('Cannot find the package.');
  }
  const apkPath = apkPathFull.stdout.trim().split('\n');

  // Fetch signing keystore, key alias and password from keyChain:
  const apkBundleID = await getApkBundleID(apkPath);
  const keystorePairs = await getKeyStore(apkBundleID);

  // Sign the apk:
  const response = await exec(`
    apksigner sign \
    -v \
    --ks ${keystorePairs[keystoreKeys[2]]} \
    --ks-key-alias ${keystorePairs[keystoreKeys[0]]} \
    --ks-pass pass:${keystorePairs[keystoreKeys[1]]} \
    --key-pass pass:${keystorePairs[keystoreKeys[1]]} \
    --out ${outFileName} \
    ${apkPath}`);

  if (!response.stdout.includes('Signed')) {
    throw new Error(response.stderr);
  }

  logger.info('Successfully signed package.');

  return outFileName;
};
