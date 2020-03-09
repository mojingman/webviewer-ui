import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';

import Button from 'components/Button';

import core from 'core';
import getToolStyles from 'helpers/getToolStyles';
import { mapToolNameToKey } from 'constants/map';
import actions from 'actions';
import selectors from 'selectors';

import './ToolGroupButton.scss';

class ToolGroupButton extends React.PureComponent {
  static propTypes = {
    activeToolName: PropTypes.string.isRequired,
    toolGroup: PropTypes.string.isRequired,
    mediaQueryClassName: PropTypes.string.isRequired,
    dataElement: PropTypes.string.isRequired,
    img: PropTypes.string,
    title: PropTypes.string,
    toolNames: PropTypes.arrayOf(PropTypes.string),
    toolButtonObjects: PropTypes.object,
    allButtonsInGroupDisabled: PropTypes.bool,
    openElement: PropTypes.func.isRequired,
    toggleElement: PropTypes.func.isRequired,
    isToolsOverlayOpen: PropTypes.bool,
    closeElement: PropTypes.func.isRequired,
    setActiveToolGroup: PropTypes.func.isRequired,
    isActive: PropTypes.bool.isRequired,
    iconColor: PropTypes.oneOf(["TextColor", "StrokeColor", "FillColor"])
  };

  constructor(props) {
    super(props);
    this.state = {
      toolName: props.toolNames[0],
    };
  }

  componentDidUpdate(prevProps) {
    const activeToolNameChanged =
      prevProps.activeToolName !== this.props.activeToolName;
    const wasAcitveToolNameInGroup =
      prevProps.toolNames.indexOf(prevProps.activeToolName) > -1;
    const isAcitveToolNameInGroup =
      this.props.toolNames.indexOf(this.props.activeToolName) > -1;
    const toolNamesLengthChanged =
      prevProps.toolNames.length !== this.props.toolNames.length;

    if (activeToolNameChanged && isAcitveToolNameInGroup) {
      this.setState({ toolName: this.props.activeToolName });
    }

    if (
      toolNamesLengthChanged &&
      !this.props.toolNames.includes(this.state.toolName)
    ) {
      this.setState({ toolName: this.props.toolNames[0] });
    }
    if (
      toolNamesLengthChanged &&
      !wasAcitveToolNameInGroup &&
      isAcitveToolNameInGroup
    ) {
      this.setState({ toolName: this.props.activeToolName });
      this.props.setActiveToolGroup(this.props.toolGroup);
    }
  }

  onClick = () => {
    const {
      setActiveToolGroup,
      isActive,
      closeElement,
      openElement,
      toolGroup,
      isToolsOverlayOpen,
    } = this.props;
    const { toolName } = this.state;

    // toggleElement('toolsOverlay');
    if (isActive && !isToolsOverlayOpen) {
      openElement('toolsOverlay');
    } else if (isActive) {
      // core.setToolMode(defaultTool);
      // setActiveToolGroup('');
      closeElement('toolsOverlay');
    } else {
      core.setToolMode(toolName);
      setActiveToolGroup(toolGroup);
      openElement('toolsOverlay');
    }
  };

  render() {
    const {
      mediaQueryClassName,
      dataElement,
      toolButtonObjects,
      isActive,
      allButtonsInGroupDisabled,
      iconColor,
      title,
    } = this.props;

    const { toolName } = this.state;

    const toolButtonObject = toolButtonObjects[toolName];

    const img = this.props.img ? this.props.img : toolButtonObject.img;

    const currentToolTitle = toolButtonObject.title;

    const color =
      isActive && !this.props.img && iconColor
        ? getToolStyles(toolName)[iconColor] &&
          getToolStyles(toolName)[iconColor].toHexString()
        : '';

    return allButtonsInGroupDisabled ? null : (
      <Button
        className={classNames({
          'tool-group-button': true,
          active: isActive
        })}
        dataElement={dataElement}
        onClick={this.onClick}
        title={title}
        currentTool={currentToolTitle}
        mediaQueryClassName={mediaQueryClassName}
        isActive={isActive}
        img={img}
        color={color}
        aria-haspopup
      />
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  isToolsOverlayOpen: selectors.isElementOpen(state, 'toolsOverlay'),
  isActive: selectors.getActiveToolGroup(state) === ownProps.toolGroup,
  activeToolName: selectors.getActiveToolName(state),
  toolNames: selectors.getToolNamesByGroup(state, ownProps.toolGroup),
  toolButtonObjects: selectors.getToolButtonObjects(state),
  allButtonsInGroupDisabled: selectors.allButtonsInGroupDisabled(
    state,
    ownProps.toolGroup,
  ),
  iconColor: selectors.getIconColor(
    state,
    mapToolNameToKey(selectors.getActiveToolName(state)),
  ),
});

const mapDispatchToProps = {
  openElement: actions.openElement,
  toggleElement: actions.toggleElement,
  closeElement: actions.closeElement,
  setActiveToolGroup: actions.setActiveToolGroup,
};

export default connect(mapStateToProps, mapDispatchToProps)(ToolGroupButton);
