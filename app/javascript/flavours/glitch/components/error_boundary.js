import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { preferencesLink } from 'flavours/glitch/util/backend_links';
import StackTrace from 'stacktrace-js';

export default class ErrorBoundary extends React.PureComponent {

  static propTypes = {
    children: PropTypes.node,
  };

  state = {
    hasError: false,
    errorMessage: undefined,
    stackTrace: undefined,
    mappedStackTrace: undefined,
    componentStack: undefined,
  }

  componentDidCatch(error, info) {
    this.setState({
      hasError: true,
      errorMessage: error.toString(),
      stackTrace: error.stack,
      componentStack: info && info.componentStack,
      mappedStackTrace: undefined,
    });

    StackTrace.fromError(error).then((stackframes) => {
      this.setState({
        mappedStackTrace: stackframes.map((sf) => sf.toString()).join('\n'),
      });
    }).catch(() => {
      this.setState({
        mappedStackTrace: undefined,
      });
    });
  }

  handleReload(e) {
    e.preventDefault();
    window.location.reload();
  }

  render() {
    const { hasError, errorMessage, stackTrace, mappedStackTrace, componentStack } = this.state;

    if (!hasError) return this.props.children;

    let debugInfo = '';
    if (stackTrace) {
      debugInfo += 'Stack trace\n-----------\n\n```\n' + errorMessage + '\n' + stackTrace.toString() + '\n```';
    }
    if (mappedStackTrace) {
      debugInfo += 'Mapped stack trace\n-----------\n\n```\n' + errorMessage + '\n' + mappedStackTrace.toString() + '\n```';
    }
    if (componentStack) {
      if (debugInfo) {
        debugInfo += '\n\n\n';
      }
      debugInfo += 'React component stack\n---------------------\n\n```\n' + componentStack.toString() + '\n```';
    }

    return (
      <div tabIndex='-1'>
        <div className='error-boundary'>
          <h1><FormattedMessage id='web_app_crash.title' defaultMessage="We're sorry, but something went wrong with the Mastodon app." /></h1>
          <p>
            <FormattedMessage id='web_app_crash.content' defaultMessage='You could try any of the following:' />
          </p>
          <ul>
            <li>
              <FormattedMessage
                id='web_app_crash.report_issue'
                defaultMessage='Report a bug in the {issuetracker}'
                values={{ issuetracker: <a href='https://github.com/glitch-soc/mastodon/issues' rel='noopener noreferrer' target='_blank'><FormattedMessage id='web_app_crash.issue_tracker' defaultMessage='issue tracker' /></a> }}
              />
              { debugInfo !== '' && (
                <details>
                  <summary><FormattedMessage id='web_app_crash.debug_info' defaultMessage='Debug information' /></summary>
                  <textarea
                    className='web_app_crash-stacktrace'
                    value={debugInfo}
                    rows='10'
                    readOnly
                  />
                </details>
              )}
            </li>
            <li>
              <FormattedMessage
                id='web_app_crash.reload_page'
                defaultMessage='{reload} the current page'
                values={{ reload: <a href='#' onClick={this.handleReload}><FormattedMessage id='web_app_crash.reload' defaultMessage='Reload' /></a> }}
              />
            </li>
            { preferencesLink !== undefined && (
              <li>
                <FormattedMessage
                  id='web_app_crash.change_your_settings'
                  defaultMessage='Change your {settings}'
                  values={{ settings: <a href={preferencesLink}><FormattedMessage id='web_app_crash.settings' defaultMessage='settings' /></a> }}
                />
              </li>
            )}
          </ul>
        </div>
      </div>
    );
  }

}
