import React from 'react';
import { shallow } from 'enzyme';
import JobStatusIndicator from '../../components/JobStatusIndicator/JobStatusIndicator';

describe('JobStatusIndicator Component', () => {
  const url = 'https://www.google.ca';
  const job_creating = { status: 'JOB_STATUS_CREATING' };
  const job_created = { status: 'JOB_STATUS_CREATED' };
  const job_processing = { status: 'JOB_STATUS_PROCESSING' };
  const job_completed = { status: 'JOB_STATUS_COMPLETED', url };
  const job_completed_no_url = { status: 'JOB_STATUS_COMPLETED' };
  const job_failed = { status: 'JOB_STATUS_FAILED', message: 'error1' };

  it('when creating job', () => {
    const wrapper = shallow(<JobStatusIndicator job={job_creating} />);
    expect(wrapper.find('.job-status').text()).toContain('Creating');
  });

  it('when processing job', () => {
    const wrapper = shallow(<JobStatusIndicator job={job_processing} />);
    expect(wrapper.find('.job-status').text()).toContain('Processing');
  });

  it('when job is completed', () => {
    const wrapper = shallow(<JobStatusIndicator job={job_completed} />);
    expect(wrapper.find('.job-status a').text()).toContain('Download');
    expect(wrapper.find({ href: url }));
  });

  it('when job without url is completed', () => {
    const wrapper = shallow(<JobStatusIndicator job={job_completed_no_url} />);
    expect(wrapper.find('.job-status').text()).toContain('No Delivery URL');
  });

  it('when job failed', () => {
    const wrapper = shallow(<JobStatusIndicator job={job_failed} />);
    expect(wrapper.find('.job-status').text()).toBe('Failed. error1 ');
  });

  it('when job is created', () => {
    //When job is created, empty div will be passed in for now:
    const wrapper = shallow(<JobStatusIndicator job={job_created} />);
    expect(wrapper.find('div').text()).toBe('');
  });
});
