import { Panel } from '../core';
import { CanvasElement } from './canvas-element';
import { NodeElement, NodeInfo } from './node-element';
import { LinkElement, LinkInfo } from './link-element';
import { ComponentRegistry } from '@shared';

import * as d3 from 'd3';
import * as $ from 'jquery';

declare function require(name: string): string;
require('./workspace.scss');


export class Workspace extends Panel {
  canvas: CanvasElement;

  constructor(public registry: ComponentRegistry, element: HTMLElement, ) {
    super(element);

    let canvasEl = $(element).find('#workspace-canvas')[0];
    var canvas = this.canvas = new CanvasElement(this, canvasEl);

    let actions = canvas.actions;

    $("#btn-zoom-out").click(function() { actions.zoomViewport(-1); });
    $("#btn-zoom-zero").click(function() { actions.zoomViewport(0); });
    $("#btn-zoom-in").click(function() { actions.zoomViewport(+1); });

    $("#canvas-zoom-out").click(function() { actions.zoomViewport(-1); });
    $("#canvas-zoom-reset").click(function() { actions.zoomViewport(0); });
    $("#canvas-zoom-in").click(function() { actions.zoomViewport(+1); });

    $("#btn-delete").click(function() { actions.deleteSelection(); });
    $("#btn-cut").click(function() { actions.copySelection(); actions.deleteSelection(); });
    $("#btn-copy").click(function() { actions.copySelection(); });
    $("#btn-paste").click(function() { actions.pasteSelection(); });

    $("#btn-undo").click(function() { actions.undo(); });
    $("#btn-repeat").click(function() { actions.repeat(); });

    $(canvasEl).on("DOMMouseScroll mousewheel", function(evt) {
      if (evt.altKey) {
        evt.preventDefault();
        evt.stopPropagation();
        var move = -((evt.originalEvent as any).detail) || (evt.originalEvent as any).wheelDelta;
        if (move <= 0) { actions.zoomViewport(+1); }
        else { actions.zoomViewport(+1); }
      }
    });

  }

  getTemplate(): string {
    return `
    <!--div id='workspace-header' style='background-color: #AC57A0;'><span style='height:100%;'>&nbsp;**&nbsp;</span>
    </div-->
    <div class="canvas-zoom">
      <ul>
        <li >
          <button type="button" title="Zoom In" id="canvas-zoom-in" >
          <i class="material-icons">&#xE145;</i></button>
        </li>
        <li>
          <button type="button" id="canvas-zoom-reset" title="Reset Viewport" >
          <i class="material-icons">&#xE1B7;</i></button>
        </li>
        <li>
          <button type="button" id="canvas-zoom-out" title="Zoom Out" >
          <i class="material-icons">&#xE15B</i></button>
        </li>
      </ul>
    </div>
    <div id='workspace-canvas' style='background-color: #0E1331; top: 0px;'>
    </div>
    <!--div id='workspace-footer' style='background-color: #0E1331; display: flex; '>
      <div style='position: absolute; left: 0px;'>
        <a id="btn-palette-toggle" class="sidebar-toggle-container" href="#" style="left: 2px;" >
          <i class="fa fa-angle-double-left" style="top: 2px; left: 0px; "></i>
          <i class="fa fa-angle-double-right hide" style="top: 2px; left: 0px;"></i>
        </a>
      </div>

      <div style='position: absolute;left: 100px;'>
        <a class="workspace-footer-button" id="btn-delete" href="#">
          <i class="fa fa-remove"></i>
        </a>
        <a class="workspace-footer-button" id="btn-cut" href="#">
          <i class="fa fa-cut"></i>
        </a>
        <a class="workspace-footer-button" id="btn-copy" href="#">
          <i class="fa fa-copy"></i>
        </a>
        <a class="workspace-footer-button" id="btn-paste" href="#">
          <i class="fa fa-paste"></i>
        </a>

        <a class="workspace-footer-button" href="#" style="background: transparent;border: none;">
          <i class="fa"></i>
        </a>

        <a class="workspace-footer-button" id="btn-undo" href="#">
          <i class="fa fa-undo"></i>
        </a>
        <a class="workspace-footer-button" id="btn-repeat" href="#">
          <i class="fa fa-repeat"></i>
        </a>
      </div>

      <div style='position: absolute; right: 10px;'>
        <a class="workspace-footer-button" id="btn-zoom-out" href="#">
          <i class="fa fa-minus"></i>
        </a>
        <a class="workspace-footer-button" id="btn-zoom-zero" href="#">
            <i class="fa fa-circle-o"></i>
        </a>
        <a class="workspace-footer-button" id="btn-zoom-in" href="#"><i class="fa fa-plus"></i>
        </a>

        <a id="btn-sidebar-toggle" class="sidebar-toggle-container" href="#" style="left: 2px;" >
          <i class="fa fa-angle-double-right" style="top: 2px; left: 0px; "></i>
          <i class="fa fa-angle-double-left hide" style="top: 2px; left: 0px;"></i>
        </a>
      </div>
    </div-->
    <!--div id='workspace-toolbar' style='background-color: rgb(2, 128, 105); display: block;     border-bottom: 1px solid #bbbbbb; top: 0px;'>
      <a class="button" id="workspace-subflow-edit" href="#" data-i18n="[append]subflow.editSubflowProperties"><i class="fa fa-pencil"></i> edit properties</a><span style="margin-left: 5px;" data-i18n="subflow.input">inputs:</span> <div style="display: inline-block;" class="button-group"><a id="workspace-subflow-input-remove" class="button" href="#">0</a><a id="workspace-subflow-input-add" class="button active" href="#">1</a></div><span style="margin-left: 5px;" data-i18n="subflow.output">outputs:</span> <div id="workspace-subflow-output" style="display: inline-block;" class="button-group spinner-group"><a id="workspace-subflow-output-remove" class="button" href="#"><i class="fa fa-minus"></i></a><div class="spinner-value">6</div><a id="workspace-subflow-output-add" class="button" href="#"><i class="fa fa-plus"></i></a></div><a class="button" id="workspace-subflow-delete" href="#" data-i18n="[append]subflow.deleteSubflow"><i class="fa fa-trash"></i> delete subflow</a>
    </div-->`;
  }
}
