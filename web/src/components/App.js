import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createSigningJob } from '../actionCreators';
import { authenticateFailed, authenticateSuccess } from '../actions';
import implicitAuthManager from '../auth';
import { AC_ROLE } from '../constants';
import './App.css';
import FileUpload from './FileUpload/FileUpload';
import Instruction from './Instruction/Instruction';
import JobStatusIndicator from './JobStatusIndicator/JobStatusIndicator';
import Footer from './UI/Footer';
import Header from './UI/Header';

export class App extends Component {
  state = {
    loading: true,
    userAgreedToTerms: false,
  };

  componentDidMount = () => {
    implicitAuthManager.registerHooks({
      onAuthenticateSuccess: () => this.props.login(),
      onAuthenticateFail: () => this.props.logout(),
      // onAuthLocalStorageCleared: () => this.props.logout(),
    });
    // don't call function if on localhost
    if (!window.location.host.match(/localhost/)) {
      implicitAuthManager.handleOnPageLoad();
    }
  };

  onUserDoesAgree = e => {
    this.setState({ userAgreedToTerms: !this.state.userAgreedToTerms });
  };

  onPlatformChanged = e => {
    this.setState({ platform: e.currentTarget.value });
  };

  onFileAccepted = files => {
    this.setState({ files });
  };

  validateForm = () => {
    if (!implicitAuthManager.isAuthenticated()) {
      alert('You need to login before you can submit signing jobs.');
      return false;
    }

    if (!implicitAuthManager.roles.includes(AC_ROLE)) {
      alert('You need the proper role to be able to create signing jobs');
      return false;
    }

    if (!this.state.files) {
      alert('You need to add a file to be uploaded for signing.');
      return false;
    }

    if (!this.state.platform) {
      alert('You need to select a platform for your signing job.');
      return false;
    }

    if (!this.state.userAgreedToTerms) {
      alert('You need to agree to complete a STRA & PIA before you can submit signing jobs.');
      return false;
    }

    return true;
  };

  render() {
    return (
      <div>
        <Header authentication={this.props.authentication} />
        <div className="container">
          {/* <form> */}
          <ul className="flex-outer">
            <li>
              <label>Drag and drop the archive you with to sign onto this area.</label>
              <FileUpload files={this.state.files || []} onFileAccepted={this.onFileAccepted} />
            </li>
            <li>
              <label>What is the deployment platform this archive is meant for?</label>
              <ul className="flex-inner">
                <li>
                  <input
                    type="radio"
                    id="platform-ios"
                    name="platform"
                    value="ios"
                    onChange={this.onPlatformChanged}
                  />
                  <label htmlFor="platform-ios">iOS</label>
                </li>
                <li>
                  <input
                    type="radio"
                    id="platform-android"
                    name="platform"
                    value="android"
                    onChange={this.onPlatformChanged}
                  />
                  <label htmlFor="platform-android">Android</label>
                </li>
              </ul>
            </li>
            <li>
              <label>You must complete a STRA &amp; PIA before your production release.</label>
              <ul className="flex-inner">
                <li>
                  <input
                    type="checkbox"
                    id="i-agree"
                    name="i-agree"
                    value="agree"
                    onChange={this.onUserDoesAgree}
                  />
                  <label htmlFor="i-agree">Yes, I will</label>
                </li>
              </ul>
            </li>
            <li>
              <button
                onClick={() => {
                  if (!this.validateForm()) {
                    return;
                  }

                  this.props.createSigningJob(this.state.files, this.state.platform);
                }}
              >
                Start
              </button>
            </li>
          </ul>
          {/* </form> */}
          <JobStatusIndicator job={this.props.job} />
        </div>
        <div className="container">
          <Instruction />
        </div>
        <Footer />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    job: state.job,
    api: state.api,
    authentication: state.authentication,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      createSigningJob,
      login: () => dispatch(authenticateSuccess()),
      logout: () => dispatch(authenticateFailed()),
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
