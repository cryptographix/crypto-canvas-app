import { ComponentDefinition } from '@shared';
import { CanvasElement } from './canvas-element';
import { NodeElement, NodeInfo } from './node-element';
import { LinkElement, LinkInfo } from './link-element';

import { Graph, Node, Link } from '@cryptographix/sim-core';

export enum CanvasMode {
  IDLE,
  PANNING,
  LASSOING,
  MOVING,
  JOINING,
  MOVING_ACTIVE,
  IMPORT_DRAGGING, QUICK_JOINING,
}

export interface NodeMap extends Map<string, NodeElement> { }
export interface LinkMap extends Map<string, LinkElement> { }

export class CanvasState {
  private canvasMode: CanvasMode;

  inMode(mode: CanvasMode) { return this.canvasMode == mode; }
  inModes(modes: CanvasMode[]) { return modes.some((m) => { return this.canvasMode == m; }) }

  setMode(newMode: CanvasMode) {
    console.log("Mode <- " + CanvasMode[newMode]);

    this.canvasMode = newMode;
  }

  nodeMap: NodeMap;
  get nodes(): NodeElement[] {
    return Array.from<NodeElement>(this.nodeMap.values());
  }

  linkMap: LinkMap;
  get links(): LinkElement[] {
    return Array.from<LinkElement>(this.linkMap.values());
  }

  constructor(public canvas: CanvasElement, graph?: Graph) {
    this.canvasMode = CanvasMode.IDLE;

    this.nodeMap = new Map<string, NodeElement>();
    this.linkMap = new Map<string, LinkElement>();

    if (graph)
      this.updateGraph(graph);

    this.clearSelection();
  }

  updateGraph(graph: Graph) {
    let newNodeMap: NodeMap = new Map<string, NodeElement>();

    // rebuild nodeMap from graph nodes
    graph.nodes.forEach((node, key) => {
      let nodeEl = this.nodeMap.get(key);

      let view = node.metadata["view"];

      if (!nodeEl) {
        let info: NodeInfo = {
          id: key,
          x: view.x || 0,
          y: view.y || 0,
          //w: node.view.w,
          //h: node.view.h,
          description: node.metadata["description"] || node.id,
          icon_url: '',
          inputs: 1,
          outputs: node.ports.size - 1,
          type: 'node',
          _def: {
            colour: view.colour || "#999",
          }
        }

        nodeEl = new NodeElement(this.canvas, info);
      }

      newNodeMap.set(key, nodeEl);
    });

    let newLinkMap: LinkMap = new Map<string, LinkElement>();

    // rebuild linkMap from graph links
    graph.links.forEach((link, key) => {
      let linkEl = this.linkMap.get(key);

      if (!linkEl) {
        let info: LinkInfo = {
          id: key,
          source: newNodeMap.get(link.fromNode.id),
          sourcePort: link.fromPort.id,
          target: newNodeMap.get(link.toNode.id),
          targetPort: link.toPort.id,
        }

        linkEl = new LinkElement(this.canvas, info);
      }

      newLinkMap.set(key, linkEl);
    })

    this.nodeMap = newNodeMap;
    this.linkMap = newLinkMap;

  }

  deleteNodes(nodes: NodeElement[]) {

    nodes.forEach((node) => {
      let n = this.nodeMap.get(node.id);

      let links = this.getLinksForNodes([n]);

      this.deleteLinks(links);

      this.nodeMap.delete(n.id);
    })
  }

  deleteLinks(links: LinkElement[]) {

    links.forEach((link) => {
      this.linkMap.delete(link.id);
    })
  }

  getLinksForNodes(nodes: NodeElement[]): LinkElement[] {
    let links: LinkMap = new Map<string, LinkElement>();

    nodes.forEach((node) => {
      let n = this.nodeMap.get(node.id);

      this.linkMap.forEach((link) => {
        if ((link.source === n) || (link.target === n))
          links.set(link.id, link);
      });
    });

    return Array.from<LinkElement>(links.values());
  }

  makeLinkID(link: LinkElement) {
    return link.source.id + ":" + link.sourcePort + ":" + link.target.id + ":" + link.targetPort;
  }

  id: number = 1;
  getNodeID(): number {
    return this.id++;
  }

  importNodes(nodes: NodeElement[], links: LinkElement[]) {

    if (nodes) {
      nodes.forEach((node) => {
        while (this.nodeMap.has(node.id)) {
          let newID = 'node-' + this.getNodeID();

          //renamedNodes.set(node.id, newID);

          node.id = newID;
        }
        node.dirty = true;

        this.nodeMap.set(node.id, node);
      });
    }

    if (links) {
      links.forEach((link) => {
        /*if (renamedNodes.has(link.source.id)) {
          link.source.id = renamedNodes.get(link.source.id);
        }
        if (renamedNodes.has(link.target.id)) {
          link.target.id = renamedNodes.get(link.target.id);
        }*/

        link.id = this.makeLinkID(link);

        this.linkMap.set(link.id, link);
      });
    }
  }

  addNode(defn: ComponentDefinition, attr?: any): NodeElement {
    let newID;

    do {
      newID = 'node-' + this.getNodeID();
    } while (this.nodeMap.has(newID));

    let node = new NodeElement(this.canvas, {
      id: newID,
      x: 0,
      y: 0,
      icon_url: defn.meta.iconURL,
      description: defn.name,
      _def: {
        colour: "#5a8",
        button: false,
        icon: defn.meta.iconURL,
        inputs: 2,
        outputs: 1,
      },
      inputs: 2,
      outputs: 1,
    });
    this.nodeMap.set(node.id, node);

    node.calculateSize(false, defn.name);

    return node;
  }

  addLink(fromNode: NodeElement, fromPort: number, toNode: NodeElement, toPort: number): LinkElement {
    let link = new LinkElement(this.canvas, {
      id: '',
      source: fromNode,
      sourcePort: fromPort,
      target: toNode,
      targetPort: toPort
    });

    link.id = this.makeLinkID(link);

    this.linkMap.set(link.id, link);

    return link;
  }


  /**
  *  Selection
  **/
  hasSelection(): boolean {
    return (this.selectedNodes.size + this.selectedLinks.size) > 0;
  }

  selectedNodes: NodeMap = new Map<string, NodeElement>();
  selectedLinks: LinkMap = new Map<string, LinkElement>();
  dragLinks: any[] = [];

  clearSelection() {
    this.deselectNodes();

    this.deselectLinks();
  }

  selectNodes(nodes: NodeElement[]) {
    nodes.forEach((n) => {
      if (n) {
        this.selectedNodes.set(n.id, n);

        n.selected = true;
        n.dirty = true;
      }
    });
  }

  deselectNodes(nodes?: any[]) {
    let des: any[] = [];

    if (nodes) {
      nodes.forEach((n) => {
        if (n && n.selected) {
          des.push(n);
        }
      });
    }
    else {
      des = Array.from(this.selectedNodes.values());
    }

    des.forEach((n) => {
      if (n) {
        n.selected = false;
        n.dirty = true;

        this.selectedNodes.delete(n.id);
      }
    });
  }

  selectLinks(links: LinkElement[]) {
    links.forEach((l) => {
      if (l) {
        l.selected = true;
        this.selectedLinks.set(l.id, l);
      }
    });
  }

  deselectLinks(links?: any[]) {
    let des: any[] = [];

    if (links) {
      links.forEach((l) => {
        if (l && l.selected) {
          des.push(l);
        }
      });
    }
    else {
      des = Array.from(this.selectedLinks.values());
    }

    des.forEach((l) => {
      if (l) {
        l.selected = false;
        this.selectedLinks.delete(l.id);
      }
    });
  }

  setDragLinks(dragLinks) {
    this.dragLinks = dragLinks;
  }


}

export function getTestGraph(): Graph {
  let graph = new Graph(null, );

  testNodes.forEach((node) => {
    graph.addNode(node.id, node);
  });

  testLinks.forEach((link) => {
    let id = link.from + "-" + link.to;

    link.id = id;

    graph.addLink(link.id, link);
  });

  return graph;
}


let testNodes: any[] = [
  {
    id: 'node-1111',
    ports: {
      "0": {},
      "1": {},
      "2": {},
      "3": {},
      "4": {},
      "5": {},
    },
    metadata: {
      inputs: 1,
      outputs: 5,
      description: 'Fire every 5 seconds ↻',

      view: {
        x: 220, y: 185,
        w: 180, h: 30,
        icon_url: 'icons/node-red/inject.png',
        colour: "#53A3F3",
      }
    },
  },
  {
    id: 'node-2222',
    ports: {
      "0": {},
      "1": {},
      "2": {},
      "3": {},
      "4": {},
      "5": {},
    },
    metadata: {
      description: 'Test Node 2',

      inputs: 1,
      outputs: 5,

      view: {
        x: 500, y: 185,
        w: 200, h: 30,
        icon_url: 'icons/node-red/inject.png',
        colour: "#898989",
      },
    }
  }
];

const testLinks: any[] = [
  {
    from: testNodes[0].id + ':1',
    to: testNodes[1].id + ':0',
  }
];
