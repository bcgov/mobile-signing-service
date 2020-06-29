import React from 'react';
import { shallow } from 'enzyme';
import { App } from '../../components/App';

describe('App Component', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(
      <App authentication={{ isAuthenticated: true }} job={{ status: 'testStatus' }} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
