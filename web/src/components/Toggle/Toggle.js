import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import './Toggle.css';

/**
 * Toggle component
 * This component has an arrow button to toggle the content open/collapse
 * @prop title for the toggle content
 * @prop children containing content
 */
class Toggle extends Component {
  state = {
    toggled: false,
  };

  toggledHandler = toggled => this.setState({ toggled });

  render() {
    const toggleClass = this.state.toggled ? 'on' : '';
    const toggleIcon = this.state.toggled ? (
      <FontAwesomeIcon icon={faArrowUp} className="toggle-icon" />
    ) : (
      <FontAwesomeIcon icon={faArrowDown} className="toggle-icon" />
    );
    const { children, title } = this.props;

    return (
      <div className={`instruction ${toggleClass}`}>
        <div
          className="toggle-header"
          onClick={() => {
            this.toggledHandler(!this.state.toggled);
          }}
        >
          <div>{title}</div>
          <div>{toggleIcon}</div>
        </div>
        <div>{children}</div>
      </div>
    );
  }
}

Toggle.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
};

export default Toggle;
