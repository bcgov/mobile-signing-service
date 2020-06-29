import React from 'react';
import { shallow } from 'enzyme';
import Toggle from '../../components/Toggle/Toggle';
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';

describe('Toggle Component', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<Toggle title="test toggle" children={<div>test toggle</div>} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('changes state', () => {
    const wrapper = shallow(<Toggle title="test toggle" children={<div>test toggle</div>} />);
    expect(wrapper.state('toggled')).toBe(false);
    wrapper
      .find('.toggle-header')
      .first()
      .simulate('click');
    expect(wrapper.state('toggled')).toBe(true);
  });

  it('changes the arrow icon', () => {
    const wrapper = shallow(<Toggle title="test toggle" children={<div>test toggle</div>} />);
    const button0 = wrapper.find('.toggle-icon').first();
    expect(button0.prop('icon')).toEqual(faArrowDown);
    wrapper
      .find('.toggle-header')
      .first()
      .simulate('click');
    const button1 = wrapper.find('.toggle-icon').first();
    expect(button1.prop('icon')).toEqual(faArrowUp);
  });
});
