import { Panel } from '../core';

import * as d3 from 'd3';
import * as $ from 'jquery';

export class Header extends Panel {
  constructor(me: HTMLElement) {
    super(me);
  }

  getTemplate() {
    return `
    <span class="logo"><img src="static/images/cgx-logo.png" title=""><span>Canvas</span></span>
    <ul class="header-toolbar hide" style="display: block; float: left;">
    <li>
      <span class="exec-button-group button-group"
      style="margin-left: 120px; margin-right: 20px; color: #a0c0f0 !important;
      border: 1px solid #aaa; border-radius: 3px; margin-top: 6px;">
        <a id="btn-reset" class="run-button" href="#">
          <span class="reset-button-content">
            <i class="fa fa-fast-backward"></i>
            <!--span>Reset</span-->
          </span>
        </a>
        <a id="btn-run" class="run-button" href="#">
          <span class="run-button-content" style="color: #900">
            <i class="fa fa-play"></i>
            <!--span>Run</span-->
          </span>
        </a>
        <a id="btn-pause" class="pause-button" href="#" style="display: none;">
          <span class="pause-button-content">
            <i class="fa fa-pause"></i>
            <span>Pause</span>
          </span>
        </a>
        <a id="btn-step" class="step-button" href="#" xstyle="border: 1px solid #aaa; border-radius: 3px;">
          <span class="step-button-content">
            <i class="fa fa-step-forward"></i>
            <!--span>Step</span-->
          </span>
        </a>
        <a id="btn-stop" class="stop-button" href="#" style="color: grey">
          <span class="stop-button-content">
            <i class="fa fa-stop"></i>
            <!--span>Stop</span-->
          </span>
        </a>
      </span>
    </li>
    </ul>

    <ul class="header-toolbar hide" style="display: block;">
    <li><span class="button-group" style="width: 200px!important"><a>&nbsp;</a></span></li>

      <li style="display:none">
      <span class="deploy-button-group button-group"><a id="btn-deploy" class="deploy-button" href="#"><span class="deploy-button-content"><img id="btn-deploy-icon" xsrc="red/images/deploy-full-o.png"> <span>Deploy</span></span><span class="deploy-button-spinner hide"><img xsrc="red/images/spin.svg"></span></a>
        <a id="btn-deploy-options" data-toggle="dropdown" class="deploy-button" href="#"><i class="fa fa-caret-down"></i></a>
          <ul id="btn-deploy-options-submenu" class="dropdown-menu pull-right hide">
            <li><a id="deploymenu-item-full" tabindex="-1" href="#" class="active"><i class="fa fa-square pull-left"></i><i class="fa fa-check-square pull-left"></i><img xsrc="red/images/deploy-full.png"> <span class="menu-label-container"><span class="menu-label">Full</span><span class="menu-sublabel">Deploys everything in the workspace</span></span></a></li>
            <li><a id="deploymenu-item-flow" tabindex="-1" href="#"><i class="fa fa-square pull-left"></i><i class="fa fa-check-square pull-left"></i><img xsrc="red/images/deploy-flows.png"> <span class="menu-label-container"><span class="menu-label">Modified Flows</span><span class="menu-sublabel">Only deploys flows that contain changed nodes</span></span></a></li>
            <li><a id="deploymenu-item-node" tabindex="-1" href="#"><i class="fa fa-square pull-left"></i><i class="fa fa-check-square pull-left"></i><img xsrc="red/images/deploy-nodes.png"> <span class="menu-label-container"><span class="menu-label">Modified Nodes</span><span class="menu-sublabel">Only deploys nodes that have changed</span></span></a></li>
          </ul>
          </span>
      </li>

      <li><a id="btn-sidemenu" class="button" data-toggle="dropdown" href="#"><i class="fa fa-bars"></i></a>
        <ul id="btn-sidemenu-submenu" class="dropdown-menu pull-right hide">
          <li class="dropdown-submenu pull-left"><a id="menu-item-view-menu" tabindex="-1" href="#"><span class="menu-label">View</span></a>
            <ul id="menu-item-view-menu-submenu" class="dropdown-menu">
              <li><a id="menu-item-sidebar" tabindex="-1" href="#" class="active"><i class="fa fa-square pull-left"></i><i class="fa fa-check-square pull-left"></i><span class="menu-label">Show sidebar</span></a></li>
              <li class="divider"></li>
              <li class="menu-group-sidebar-tabs"><a id="menu-item-view-menu-debug" tabindex="-1" href="#"><span class="menu-label">Debug messages</span></a></li>
            </ul>
          </li>
          <li class="divider"></li>
          <li class="dropdown-submenu pull-left"><a id="menu-item-import" tabindex="-1" href="#"><span class="menu-label">Import</span></a>
            <ul id="menu-item-import-submenu" class="dropdown-menu">
              <li><a id="menu-item-import-clipboard" tabindex="-1" href="#"><span class="menu-label">Clipboard</span></a></li>
              <li class="dropdown-submenu pull-left"><a id="menu-item-import-library" tabindex="-1" href="#"><span class="menu-label">Library</span></a>
                <ul id="menu-item-import-library-submenu" class="dropdown-menu"></ul>
              </li>
            </ul>
          </li>
          <li class="dropdown-submenu pull-left disabled"><a id="menu-item-export" tabindex="-1" href="#"><span class="menu-label">Export</span></a>
            <ul id="menu-item-export-submenu" class="dropdown-menu">
              <li class="disabled"><a id="menu-item-export-clipboard" tabindex="-1" href="#"><span class="menu-label">Clipboard</span></a></li>
              <li class="disabled"><a id="menu-item-export-library" tabindex="-1" href="#"><span class="menu-label">Library</span></a></li>
            </ul>
          </li>
          <li class="divider"></li>
          <li><a id="menu-item-search" tabindex="-1" href="#"><span class="menu-label">Search flows</span></a></li>
          <li class="divider"></li>
          <li><a id="menu-item-config-nodes" tabindex="-1" href="#"><span class="menu-label">Configuration nodes</span></a></li>
          <li class="dropdown-submenu pull-left hide"><a id="menu-item-workspace" tabindex="-1" href="#"><span class="menu-label">Flows</span></a>
            <ul id="menu-item-workspace-submenu" class="dropdown-menu">
              <li><a id="menu-item-workspace-add" tabindex="-1" href="#"><span class="menu-label">Add</span></a></li>
              <li><a id="menu-item-workspace-edit" tabindex="-1" href="#"><span class="menu-label">Rename</span></a></li>
              <li class="disabled"><a id="menu-item-workspace-delete" tabindex="-1" href="#"><span class="menu-label">Delete</span></a></li>
            </ul>
          </li>
          <li class="dropdown-submenu pull-left"><a id="menu-item-subflow" tabindex="-1" href="#"><span class="menu-label">Subflows</span></a>
            <ul id="menu-item-subflow-submenu" class="dropdown-menu">
              <li><a id="menu-item-subflow-create" tabindex="-1" href="#"><span class="menu-label">Create Subflow</span></a></li>
              <li class="disabled"><a id="menu-item-subflow-convert" tabindex="-1" href="#"><span class="menu-label">Selection to Subflow</span></a></li>
            </ul>
          </li>
          <li class="divider"></li>
          <li><a id="menu-item-edit-palette" tabindex="-1" href="#"><span class="menu-label">Manage palette</span></a></li>
          <li class="divider"></li>
          <li><a id="menu-item-user-settings" tabindex="-1" href="#"><span class="menu-label">Settings</span></a></li>
          <li class="divider"></li>
          <li><a id="menu-item-keyboard-shortcuts" tabindex="-1" href="#"><span class="menu-label">Keyboard shortcuts</span></a></li>
          <li><a id="menu-item-help" tabindex="-1" href="http://nodered.org/docs" target="_blank"><span class="menu-label">Node-RED website</span></a></li>
          <li><a id="menu-item-node-red-version" tabindex="-1" href="#"><span class="menu-label">v0.17.5-git</span></a></li>
        </ul>
      </li>
    </ul>
    <div id="header-shade" class="hide"></div>
`;
  }
}
