import Dagre from "@dagrejs/dagre";
import type { Node, Edge } from "@xyflow/react";

const NODE_W = 210;
const NODE_H = 105;

export function applyDagreLayout(nodes: Node[], edges: Edge[]): Node[] {
    const g = new Dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: "LR", nodesep: 80, ranksep: 150 });

    nodes.forEach((node) => g.setNode(node.id, { width: NODE_W, height: NODE_H }));
    edges.forEach((edge) => g.setEdge(edge.source, edge.target));

    Dagre.layout(g);

    return nodes.map((node) => {
        const pos = g.node(node.id);
        return {
            ...node,
            position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 },
        };
    });
}
