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

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import { css } from '@emotion/core';
import { MoonLoader } from 'react-spinners';
import { JOB_STATUS } from '../../constants';

const override = css`
  display: block;
  margin: 0 auto;
  border-color: #003366;
`;

const deliveryUrlForJob = job => {
  if (!job || (Object.keys(job).length === 0 && job.constructor === Object)) {
    return <i>No Delivery URL</i>;
  }

  if (!job.url) {
    return <i>No Delivery URL</i>;
  }

  return (
    <a href={job.url} download>
      Download
    </a>
  );
};

const titleForJobStatus = status => {
  switch (status) {
    case JOB_STATUS.CREATING:
      return 'Creating';
    case JOB_STATUS.PROCESSING:
      return 'Processing';
    default:
      return 'Unknown';
  }
};

const loader = (status, loading = true, color = '#003366') => {
  return (
    <div className="job-status">
      <MoonLoader className={override} sizeUnit={'px'} size={18} color={color} loading={loading} />
      &nbsp;&nbsp; {titleForJobStatus(status)}
    </div>
  );
};

const JobStatusIndicator = ({ job }) => {
  switch (job.status) {
    case JOB_STATUS.CREATING:
      return loader(job.status);
    case JOB_STATUS.PROCESSING:
      return loader(job.status);
    case JOB_STATUS.COMPLETED:
      return (
        <div className="job-status">
          <FontAwesomeIcon icon="file-download" className="file-download-icon" />
          &nbsp;&nbsp; {deliveryUrlForJob(job)}
        </div>
      );
    case JOB_STATUS.FAILED:
      return <div className="job-status">Failed. {job.message} </div>;
    default:
      return <div />;
  }
};

JobStatusIndicator.propTypes = {
  job: PropTypes.object.isRequired,
};

export default JobStatusIndicator;
