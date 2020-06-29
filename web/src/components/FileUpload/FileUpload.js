//
// DevHub
//
// Copyright © 2018 Province of British Columbia
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
// Created by Jason Leach on 2018-09-04.
//

import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './FileUpload.css';

const size = sizeInBytes => {
  return (
    <div>
      &nbsp;&nbsp;
      {Math.round(sizeInBytes * 0.000001)}
      Mb
    </div>
  );
};

const isDisabled = files => {
  if (files.length >= 1) return true;
  return false;
};

const titleForCurrentState = files => {
  if (isDisabled(files)) {
    return <p className="title">Only one file can be selected.</p>;
  }

  return <p className="title">Drag a file to upload (ZIP format only).</p>;
};

const FileUpload = ({ onFileAccepted, files }) => {
  return (
    <div className="file-upload-container">
      <Dropzone className="drop-zone" onDrop={onFileAccepted} disabled={isDisabled(files)}>
        {({ getRootProps, getInputProps }) => (
          <div className="drop-zone-content" {...getRootProps()}>
            <input {...getInputProps()} />
            {titleForCurrentState(files)}
          </div>
        )}
      </Dropzone>
      <ul className="file-list">
        {files.map(file => (
          <li key={file.name}>
            {<FontAwesomeIcon icon="file" className="file-icon" />}
            <span className="file-name">{file.name}</span>
            <span className="file-size">{size(file.size)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

FileUpload.propTypes = {
  files: PropTypes.array.isRequired,
  onFileAccepted: PropTypes.func.isRequired,
};

export default FileUpload;
