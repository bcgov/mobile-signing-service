import React from 'react';
import { XML_SAMPLES } from '../../constants';
import Toggle from '../Toggle/Toggle';
import './Instruction.css';

const Instruction = () => {
  return (
    <div className="instructions">
      <h3>Steps to Upload Your App</h3>
      <Toggle title="XcodeArchive">
        <p>To package up an xcarchive to submit for signing you need to:</p>
        <ol>
          <li>
            <p>Create a folder to hold the xcarchive and options.plist</p>
          </li>
          <li>
            <p>Copy the xcarchive from xcode into the folder from step 1</p>
          </li>
          <li>
            <p>
              Create or copy your options.plist from step 1, you could update the content from
              sample below:
            </p>
            <pre>{XML_SAMPLES.PLIST}</pre>
          </li>
          <li>
            <p>ZIP up the folder for submission</p>
          </li>
        </ol>
      </Toggle>
      <Toggle title="IPA">
        <p>Signing IPA files is currently Alpha. Please use xcarchive.</p>
      </Toggle>
      <Toggle title="APK">
        <p>To package up an android package to submit for signing you need to:</p>
        <ol>
          <li>
            <p>Select RELEASE mode in the Build Variant, and build APK</p>
          </li>
          <li>
            <p>Drag and drop the apk</p>
          </li>
        </ol>
      </Toggle>
    </div>
  );
};

export default Instruction;
