import { Panel } from '../core';

import * as d3 from 'd3';
import * as $ from 'jquery';

export class Palette extends Panel {

  showCategory(container: JQuery, open: boolean) {
    if (!open) {
      container.removeClass('palette-open')
        .addClass('palette-close')
        .find('.palette-content').css('display', 'none');
    }
    else {
      container.addClass('palette-open')
        .removeClass('palette-close')
        .find('.palette-content').css('display', 'block');
    }
  }
  constructor(me: HTMLElement) {
    super(me);

    $(me).find('.palette-category').click((a) => {
      let container = $(a.currentTarget);

      this.showCategory(container, !container.hasClass('palette-open'));
    });

    $('#palette-collapse-all').click(() => { this.showCategory($(me).find('.palette-category'), false); });
    $('#palette-expand-all').click(() => { this.showCategory($(me).find('.palette-category'), true); });

    var chart = $("#workspace-canvas");
    var chartOffset = chart.offset();
    var chartSVG = $("#workspace-canvas>svg").get(0);
    var activeSpliceLink;
    var mouseX;
    var mouseY;
    var spliceTimer;

    $(me).find('.palette_node').draggable(
      {
        helper: 'clone',
        appendTo: 'body',
        revert: false,
        revertDuration: 50,
        containment: '#main-container',
        start: function() { /*RED.view.focus();*/ },
        stop: function() { d3.select('.link_splice').classed('link_splice', false); if (spliceTimer) { clearTimeout(spliceTimer); spliceTimer = null; } },
        drag: function(e, ui) {

          // TODO: this is the margin-left of palette node. Hard coding
          // it here makes me sad
          //console.log(ui.helper.position());
          ui.position.left += 17.5;

          let def = { inputs: 1, outputs: 5 };

          if (def.inputs > 0 && def.outputs > 0) {
            let mouseX = ui.position.left + (ui.helper.width() / 2) - chartOffset.left + chart.scrollLeft();
            let mouseY = ui.position.top + (ui.helper.height() / 2) - chartOffset.top + chart.scrollTop();

            if (!spliceTimer) {
              spliceTimer = setTimeout(function() {
                var nodes = [];
                var bestDistance = Infinity;
                var bestLink = null;
                if (chartSVG["getIntersectionList"]) {
                  var svgRect = chartSVG["createSVGRect"]();
                  svgRect.x = mouseX;
                  svgRect.y = mouseY;
                  svgRect.width = 1;
                  svgRect.height = 1;
                  nodes = chartSVG["getIntersectionList"](svgRect, chartSVG);
                  //mouseX /= RED.view.scale();
                  //mouseY /= RED.view.scale();
                } else {
                  // Firefox doesn't do getIntersectionList and that
                  // makes us sad
                  //mouseX /= RED.view.scale();
                  //mouseY /= RED.view.scale();
                  //nodes = RED.view.getLinksAtPoint(mouseX, mouseY);
                }
                for (var i = 0; i < nodes.length; i++) {
                  if (d3.select(nodes[i]).classed('link_background')) {
                    var length = nodes[i].getTotalLength();
                    for (var j = 0; j < length; j += 10) {
                      var p = nodes[i].getPointAtLength(j);
                      var d2 = ((p.x - mouseX) * (p.x - mouseX)) + ((p.y - mouseY) * (p.y - mouseY));
                      if (d2 < 200 && d2 < bestDistance) {
                        bestDistance = d2;
                        bestLink = nodes[i];
                      }
                    }
                  }
                }
                if (activeSpliceLink && activeSpliceLink !== bestLink) {
                  d3.select(activeSpliceLink.parentNode).classed('link_splice', false);
                }
                if (bestLink) {
                  d3.select(bestLink.parentNode).classed('link_splice', true)
                } else {
                  d3.select('.link_splice').classed('link_splice', false);
                }
                if (activeSpliceLink !== bestLink) {
                  if (bestLink) {
                    $(ui.helper).data('splice', d3.select(bestLink).data()[0]);
                  } else {
                    $(ui.helper).removeData('splice');
                  }
                }
                activeSpliceLink = bestLink;
                spliceTimer = null;
              }, 200);
            }
          }
        }
      });
  }

  palette: number = 0;

  getTemplate(): string {
    return `
<img src="red/images/spin.svg" class="palette-spinner hide" style="display: none;">
<div id="palette-search" class="palette-search">
  <div class="red-ui-searchBox-container"><i class="fa fa-search"></i><input type="text" data-i18n="[placeholder]palette.filter" placeholder="filter nodes"><a href="#"><i class="fa fa-times"></i></a><span class="red-ui-searchBox-resultCount hide"></span></div>
</div>
<div id="palette-container" class="palette-scroll">
  <div id="palette-container-subflows" class="palette-category palette-close hide palette-open" style="display: block;">
    <div id="palette-header-subflows" class="palette-header"><i class="fa fa-angle-down expanded"></i><span>subflows</span></div>
    <div class="palette-content" id="palette-base-category-subflows" style="display: block;">
      <div id="palette-subflows-input"></div>
      <div id="palette-subflows-output"></div>
      <div id="palette-subflows-function"></div>
      <div id="palette-subflows">
        <div id="palette_node_subflow_5be64099_3f634" class="palette_node " style="background-color: rgb(221, 170, 153); height: 128px;">
          <div class="palette_label" dir="">Subflow<br>XXYZABCDABABABBCBABCBACBABCBACBAC<br>CBABCA<br>CAB ABCA<br>CBAC ACB B<br>ABCA C</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/subflow.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 59px;"></div>
          <div class="palette_port palette_port_input" style="top: 59px;"></div>
        </div>
      </div>
    </div>
  </div>
  <div id="palette-container-input" class="palette-category palette-close hide palette-open" style="display: block;">
    <div id="palette-header-input" class="palette-header"><i class="fa fa-angle-down expanded"></i><span>input</span></div>
    <div class="palette-content" id="palette-base-category-input" style="display: block;">
      <div id="palette-input-input"></div>
      <div id="palette-input-output"></div>
      <div id="palette-input-function"></div>
      <div id="palette-input">
        <div id="palette_node_inject" class="palette_node " style="background-color: rgb(166, 187, 207); height: 28px;">
          <div class="palette_label" dir="">inject</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/inject.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
        </div>
        <div id="palette_node_catch" class="palette_node " style="background-color: rgb(228, 145, 145); height: 28px;">
          <div class="palette_label" dir="">catch</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/alert.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
        </div>
        <div id="palette_node_status" class="palette_node " style="background-color: rgb(192, 237, 192); height: 28px;">
          <div class="palette_label" dir="">status</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/alert.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
        </div>
        <div id="palette_node_link_in" class="palette_node " style="background-color: rgb(221, 221, 221); height: 28px;">
          <div class="palette_label" dir="">link</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/link-out.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
        </div>
        <div id="palette_node_mqtt_in" class="palette_node " style="background-color: rgb(216, 191, 216); height: 28px;">
          <div class="palette_label" dir="">mqtt</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/bridge.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
        </div>
        <div id="palette_node_http_in" class="palette_node " style="background-color: rgb(231, 231, 174); height: 28px;">
          <div class="palette_label" dir="">http</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/white-globe.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
        </div>
        <div id="palette_node_websocket_in" class="palette_node " style="background-color: rgb(215, 215, 160); height: 28px;">
          <div class="palette_label" dir="">websocket</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/white-globe.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
        </div>
        <div id="palette_node_tcp_in" class="palette_node " style="background-color: silver; height: 28px;">
          <div class="palette_label" dir="">tcp</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/bridge-dash.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
        </div>
        <div id="palette_node_udp_in" class="palette_node " style="background-color: silver; height: 28px;">
          <div class="palette_label" dir="">udp</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/bridge-dash.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
        </div>
      </div>
    </div>
  </div>
  <div id="palette-container-output" class="palette-category palette-close hide palette-open" style="display: block;">
    <div id="palette-header-output" class="palette-header"><i class="fa fa-angle-down expanded"></i><span>output</span></div>
    <div class="palette-content" id="palette-base-category-output" style="display: block;">
      <div id="palette-output-input"></div>
      <div id="palette-output-output"></div>
      <div id="palette-output-function"></div>
      <div id="palette-output">
        <div id="palette_node_debug" class="palette_node " style="background-color: rgb(135, 169, 128); height: 28px;">
          <div class="palette_label palette_label_right" dir="">debug</div>
          <div class="palette_icon_container palette_icon_container_right">
            <div class="palette_icon" style="background-image: url(icons/node-red/debug.png)"></div>
          </div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
        <div id="palette_node_link_out" class="palette_node " style="background-color: rgb(221, 221, 221); height: 28px;">
          <div class="palette_label palette_label_right" dir="">link</div>
          <div class="palette_icon_container palette_icon_container_right">
            <div class="palette_icon" style="background-image: url(icons/node-red/link-out.png)"></div>
          </div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
        <div id="palette_node_mqtt_out" class="palette_node " style="background-color: rgb(216, 191, 216); height: 28px;">
          <div class="palette_label palette_label_right" dir="">mqtt</div>
          <div class="palette_icon_container palette_icon_container_right">
            <div class="palette_icon" style="background-image: url(icons/node-red/bridge.png)"></div>
          </div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
        <div id="palette_node_http_response" class="palette_node " style="background-color: rgb(231, 231, 174); height: 28px;">
          <div class="palette_label palette_label_right" dir="">http response</div>
          <div class="palette_icon_container palette_icon_container_right">
            <div class="palette_icon" style="background-image: url(icons/node-red/white-globe.png)"></div>
          </div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
        <div id="palette_node_websocket_out" class="palette_node " style="background-color: rgb(215, 215, 160); height: 28px;">
          <div class="palette_label palette_label_right" dir="">websocket</div>
          <div class="palette_icon_container palette_icon_container_right">
            <div class="palette_icon" style="background-image: url(icons/node-red/white-globe.png)"></div>
          </div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
        <div id="palette_node_tcp_out" class="palette_node " style="background-color: silver; height: 28px;">
          <div class="palette_label palette_label_right" dir="">tcp</div>
          <div class="palette_icon_container palette_icon_container_right">
            <div class="palette_icon" style="background-image: url(icons/node-red/bridge-dash.png)"></div>
          </div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
        <div id="palette_node_udp_out" class="palette_node " style="background-color: silver; height: 28px;">
          <div class="palette_label palette_label_right" dir="">udp</div>
          <div class="palette_icon_container palette_icon_container_right">
            <div class="palette_icon" style="background-image: url(icons/node-red/bridge-dash.png)"></div>
          </div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
      </div>
    </div>
  </div>
  <div id="palette-container-function" class="palette-category palette-close hide palette-open" style="display: block;">
    <div id="palette-header-function" class="palette-header"><i class="fa fa-angle-down expanded"></i><span>function</span></div>
    <div class="palette-content" id="palette-base-category-function" style="display: block;">
      <div id="palette-function-input"></div>
      <div id="palette-function-output"></div>
      <div id="palette-function-function"></div>
      <div id="palette-function">
        <div id="palette_node_function" class="palette_node " style="background-color: rgb(253, 208, 162); height: 28px;">
          <div class="palette_label" dir="">function</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/function.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
        <div id="palette_node_template" class="palette_node " style="background-color: rgb(243, 181, 103); height: 28px;">
          <div class="palette_label" dir="">template</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/template.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
        <div id="palette_node_delay" class="palette_node " style="background-color: rgb(230, 224, 248); height: 28px;">
          <div class="palette_label" dir="">delay</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/timer.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
        <div id="palette_node_trigger" class="palette_node " style="background-color: rgb(230, 224, 248); height: 28px;">
          <div class="palette_label" dir="">trigger</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/trigger.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
        <div id="palette_node_comment" class="palette_node " style="background-color: rgb(255, 255, 255); height: 28px;">
          <div class="palette_label" dir="">comment</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/comment.png)"></div>
          </div>
        </div>
        <div id="palette_node_http_request" class="palette_node " style="background-color: rgb(231, 231, 174); height: 28px;">
          <div class="palette_label" dir="">http request</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/white-globe.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
        <div id="palette_node_tcp_request" class="palette_node " style="background-color: silver; height: 28px;">
          <div class="palette_label" dir="">tcp request</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/bridge-dash.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
        <div id="palette_node_switch" class="palette_node " style="background-color: rgb(226, 217, 110); height: 28px;">
          <div class="palette_label" dir="">switch</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/switch.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
        <div id="palette_node_change" class="palette_node " style="background-color: rgb(226, 217, 110); height: 28px;">
          <div class="palette_label" dir="">change</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/swap.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
        <div id="palette_node_range" class="palette_node " style="background-color: rgb(226, 217, 110); height: 28px;">
          <div class="palette_label" dir="">range</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/range.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
        <div id="palette_node_split" class="palette_node " style="background-color: rgb(226, 217, 110); height: 28px;">
          <div class="palette_label" dir="">split</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/split.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
        <div id="palette_node_join" class="palette_node " style="background-color: rgb(226, 217, 110); height: 28px;">
          <div class="palette_label" dir="">join</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/join.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
        <div id="palette_node_csv" class="palette_node " style="background-color: rgb(222, 189, 92); height: 28px;">
          <div class="palette_label" dir="">csv</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/parser-csv.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
        <div id="palette_node_html" class="palette_node " style="background-color: rgb(222, 189, 92); height: 28px;">
          <div class="palette_label" dir="">html</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/parser-html.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
        <div id="palette_node_json" class="palette_node " style="background-color: rgb(222, 189, 92); height: 28px;">
          <div class="palette_label" dir="">json</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/parser-json.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
        <div id="palette_node_xml" class="palette_node " style="background-color: rgb(222, 189, 92); height: 28px;">
          <div class="palette_label" dir="">xml</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/parser-xml.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
        <div id="palette_node_yaml" class="palette_node " style="background-color: rgb(222, 189, 92); height: 28px;">
          <div class="palette_label" dir="">yaml</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/parser-yaml.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
      </div>
    </div>
  </div>
  <div id="palette-container-social" class="palette-category palette-close hide palette-open">
    <div id="palette-header-social" class="palette-header"><i class="fa fa-angle-down expanded"></i><span>social</span></div>
    <div class="palette-content" id="palette-base-category-social" style="display: block;">
      <div id="palette-social-input"></div>
      <div id="palette-social-output"></div>
      <div id="palette-social-function"></div>
    </div>
  </div>
  <div id="palette-container-mobile" class="palette-category palette-close hide palette-open">
    <div id="palette-header-mobile" class="palette-header"><i class="fa fa-angle-down expanded"></i><span>mobile</span></div>
    <div class="palette-content" id="palette-base-category-mobile" style="display: block;">
      <div id="palette-mobile-input"></div>
      <div id="palette-mobile-output"></div>
      <div id="palette-mobile-function"></div>
    </div>
  </div>
  <div id="palette-container-storage" class="palette-category palette-close hide palette-open" style="display: block;">
    <div id="palette-header-storage" class="palette-header"><i class="fa fa-angle-down expanded"></i><span>storage</span></div>
    <div class="palette-content" id="palette-base-category-storage" style="display: block;">
      <div id="palette-storage-input">
        <div id="palette_node_tail" class="palette_node " style="background-color: burlywood; height: 28px;">
          <div class="palette_label" dir="">tail</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/file.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
        </div>
        <div id="palette_node_file_in" class="palette_node " style="background-color: burlywood; height: 28px;">
          <div class="palette_label" dir="">file</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/file.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
      </div>
      <div id="palette-storage-output">
        <div id="palette_node_file" class="palette_node " style="background-color: burlywood; height: 28px;">
          <div class="palette_label palette_label_right" dir="">file</div>
          <div class="palette_icon_container palette_icon_container_right">
            <div class="palette_icon" style="background-image: url(icons/node-red/file.png)"></div>
          </div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
      </div>
      <div id="palette-storage-function"></div>
    </div>
  </div>
  <div id="palette-container-analysis" class="palette-category palette-close hide palette-open" style="display: block;">
    <div id="palette-header-analysis" class="palette-header"><i class="fa fa-angle-down expanded"></i><span>analysis</span></div>
    <div class="palette-content" id="palette-base-category-analysis" style="display: block;">
      <div id="palette-analysis-input"></div>
      <div id="palette-analysis-output"></div>
      <div id="palette-analysis-function">
        <div id="palette_node_sentiment" class="palette_node " style="background-color: rgb(230, 224, 248); height: 28px;">
          <div class="palette_label" dir="">sentiment</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/arrow-in.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
      </div>
    </div>
  </div>
  <div id="palette-container-advanced" class="palette-category palette-close hide palette-open" style="display: block;">
    <div id="palette-header-advanced" class="palette-header"><i class="fa fa-angle-down expanded"></i><span>advanced</span></div>
    <div class="palette-content" id="palette-base-category-advanced" style="display: block;">
      <div id="palette-advanced-input">
        <div id="palette_node_watch" class="palette_node " style="background-color: burlywood; height: 28px;">
          <div class="palette_label" dir="">watch</div>
          <div class="palette_icon_container">
            <div class="palette_icon" style="background-image: url(icons/node-red/watch.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
        </div>
      </div>
      <div id="palette-advanced-output"></div>
      <div id="palette-advanced-function">
        <div id="palette_node_exec" class="palette_node " style="background-color: darksalmon; height: 28px;">
          <div class="palette_label palette_label_right" dir="">exec</div>
          <div class="palette_icon_container palette_icon_container_right">
            <div class="palette_icon" style="background-image: url(icons/node-red/arrow-in.png)"></div>
          </div>
          <div class="palette_port palette_port_output" style="top: 9px;"></div>
          <div class="palette_port palette_port_input" style="top: 9px;"></div>
        </div>
      </div>
    </div>
  </div>
</div>
<div id="palette-footer"><div>
  <a class="palette-button" id="palette-collapse-all" href="#">
    <i class="fa fa-angle-double-up"></i>
  </a>
  <a class="palette-button" id="palette-expand-all" href="#">
    <i class="fa fa-angle-double-down"></i>
  </a>
</div></div>
<div id="palette-shade" class="hide" style="display: none;"></div>
    `;
  }
}
