import React from 'react';
import { shallow } from 'enzyme';
import Instruction from '../../components/Instruction/Instruction';

describe('Instruction Component', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<Instruction />);
    expect(wrapper).toMatchSnapshot();
  });
});
