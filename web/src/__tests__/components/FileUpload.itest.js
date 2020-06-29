import React from 'react';
import { shallow } from 'enzyme';
import FileUpload from '../../components/FileUpload/FileUpload';
import Dropzone from 'react-dropzone';

describe('FileUpload Component', () => {
  const onFileAccepted = jest.fn();
  const files = [{ name: 'file1', size: 100 }];
  // const files2 = [{ name: 'file1', size: 100 }, { name: 'file2', size: 200 }];

  it('matches snapshot', () => {
    const wrapper = shallow(<FileUpload onFileAccepted={onFileAccepted} files={files} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('enabled by default', () => {
    const wrapper = shallow(<FileUpload onFileAccepted={onFileAccepted} files={[]} />);
    expect(wrapper.find('.drop-zone').prop('disabled')).toBe(false);
  });

  it('disables after a file is added', () => {
    const wrapper = shallow(<FileUpload onFileAccepted={onFileAccepted} files={files} />);
    expect(wrapper.find('.drop-zone').prop('disabled')).toBe(true);
  });

  it('initial text is displayed', () => {
    const wrapper = shallow(<FileUpload onFileAccepted={onFileAccepted} files={files} />);
    expect(
      wrapper
        .find(Dropzone)
        .dive()
        .find('.title')
        .text()
    ).toBe('Only one file can be selected.');
  });
});
