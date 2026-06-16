import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    Controls,
    MiniMap,
    Panel,
    useNodesState,
    useEdgesState,
    useReactFlow,
    BackgroundVariant,
    type Node,
    type Edge,
    type NodeTypes,
    type Connection,
    type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useStoryStore } from "../../../app/storyStore";
import type { Choice, Scene } from "../../../types/story";
import { SceneNode } from "./SceneNode";
import { applyDagreLayout } from "./layout";
import "./StructurePanel.css";

const nodeTypes: NodeTypes = { scene: SceneNode as NodeTypes[string] };

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s_]/g, "")
        .trim()
        .replace(/\s+/g, "_");
}

function makeEmptyChoice(nextScene: string): Choice {
    return {
        _key: crypto.randomUUID(),
        text: "",
        next_scene: nextScene,
        requires_items: [],
        requires_missing_items: [],
        requires_flags: {},
        add_items: [],
        remove_items: [],
        start_quests: [],
        complete_quests: [],
        fail_quests: [],
        set_flags: {},
    };
}

function buildEdges(scenes: Scene[], sceneIds: Set<string>): Edge[] {
    const result: Edge[] = [];
    scenes.forEach((scene) => {
        scene.choices.forEach((choice) => {
            if (!choice.next_scene || !sceneIds.has(choice.next_scene)) return;
            const text = choice.text ?? "";
            const label = text.length > 36 ? text.slice(0, 36) + "…" : text || "[write choice text]";
            result.push({
                id: `${scene.id}__${choice._key}`,
                source: scene.id,
                target: choice.next_scene,
                label,
                type: "smoothstep",
                style: { stroke: "#374151", strokeWidth: 1.5 },
                labelStyle: {
                    fill: text ? "#6b7280" : "#374151",
                    fontSize: 10,
                    fontFamily: "inherit",
                    fontStyle: text ? "normal" : "italic",
                },
                labelBgStyle: { fill: "rgba(15, 23, 42, 0.9)" },
                labelBgPadding: [4, 4] as [number, number],
                labelBgBorderRadius: 4,
            });
        });
    });
    return result;
}

type NewSceneIntent = {
    flowPos: { x: number; y: number };
    formPos: { x: number; y: number };
    sourceId?: string;
};

type StructurePanelProps = {
    onEditScene?: (id: string) => void;
};

// Inner component — has access to useReactFlow because it's inside ReactFlowProvider
function StructurePanelInner({ onEditScene }: StructurePanelProps) {
    const { screenToFlowPosition, fitView } = useReactFlow();

    const scenes = useStoryStore((s) => s.scenes);
    const startScene = useStoryStore((s) => s.startScene);
    const addScene = useStoryStore((s) => s.addScene);
    const deleteScene = useStoryStore((s) => s.deleteScene);
    const addChoiceToScene = useStoryStore((s) => s.addChoiceToScene);
    const removeChoiceFromScene = useStoryStore((s) => s.removeChoiceFromScene);

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    const positionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
    const connectingSourceId = useRef<string | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    const [newSceneIntent, setNewSceneIntent] = useState<NewSceneIntent | null>(null);
    const [newSceneTitle, setNewSceneTitle] = useState("");
    const newSceneTitleRef = useRef("");

    const sceneIdSet = useMemo(() => new Set(scenes.map((s) => s.id)), [scenes]);

    const handleNodeEdit = useCallback(
        (id: string) => {
            onEditScene?.(id);
        },
        [onEditScene]
    );

    // Sync store → React Flow nodes (without re-running dagre automatically)
    useEffect(() => {
        const currentEdges = buildEdges(scenes, sceneIdSet);
        setEdges(currentEdges);

        setNodes((prevNodes) => {
            const prevMap = new Map(prevNodes.map((n) => [n.id, n]));
            return scenes.map((scene) => {
                const existing = prevMap.get(scene.id);
                const savedPos = positionsRef.current.get(scene.id);
                const position =
                    savedPos ?? existing?.position ?? { x: 0, y: 0 };
                return {
                    id: scene.id,
                    type: "scene",
                    position,
                    data: {
                        scene,
                        isStart: scene.id === startScene,
                        onEdit: handleNodeEdit,
                    },
                };
            });
        });
    }, [scenes, startScene, sceneIdSet, handleNodeEdit, setNodes, setEdges]);

    // Auto-organize on first load when there are scenes
    const didInitialLayout = useRef(false);
    useEffect(() => {
        if (didInitialLayout.current || scenes.length === 0) return;
        didInitialLayout.current = true;

        const initialEdges = buildEdges(scenes, sceneIdSet);
        const initialNodes = scenes.map((scene) => ({
            id: scene.id,
            type: "scene",
            position: { x: 0, y: 0 },
            data: {
                scene,
                isStart: scene.id === startScene,
                onEdit: handleNodeEdit,
            },
        }));

        const laid = applyDagreLayout(initialNodes, initialEdges);
        laid.forEach((n) => positionsRef.current.set(n.id, n.position));
        setNodes(laid);
        setEdges(initialEdges);
        setTimeout(() => fitView({ padding: 0.25 }), 50);
    }, [scenes, startScene, sceneIdSet, handleNodeEdit, setNodes, setEdges, fitView]);

    // Track node positions when dragged
    const handleNodesChange = useCallback(
        (changes: NodeChange[]) => {
            changes.forEach((change) => {
                if (
                    change.type === "position" &&
                    change.position &&
                    !change.dragging
                ) {
                    positionsRef.current.set(change.id, change.position);
                }
            });
            onNodesChange(changes);
        },
        [onNodesChange]
    );

    // Drag handle → existing node: create choice link
    const onConnect = useCallback(
        (connection: Connection) => {
            if (!connection.source || !connection.target) return;
            addChoiceToScene(connection.source, makeEmptyChoice(connection.target));
        },
        [addChoiceToScene]
    );

    const onConnectStart = useCallback((_: unknown, params: { nodeId?: string | null }) => {
        connectingSourceId.current = params.nodeId ?? null;
    }, []);

    // Drag handle → empty canvas: show floating form for new scene
    const onConnectEnd = useCallback(
        (event: MouseEvent | TouchEvent, connectionState: { isValid?: boolean | null }) => {
            if (connectionState.isValid) {
                connectingSourceId.current = null;
                return;
            }
            const sourceId = connectingSourceId.current;
            connectingSourceId.current = null;
            if (!sourceId) return;

            const mouseEvent = "changedTouches" in event
                ? (event as TouchEvent).changedTouches[0]
                : (event as MouseEvent);

            const canvasRect = canvasRef.current?.getBoundingClientRect();
            if (!canvasRect) return;

            const flowPos = screenToFlowPosition({
                x: mouseEvent.clientX,
                y: mouseEvent.clientY,
            });

            setNewSceneTitle("");
            newSceneTitleRef.current = "";
            setNewSceneIntent({
                flowPos,
                formPos: {
                    x: mouseEvent.clientX - canvasRect.left,
                    y: mouseEvent.clientY - canvasRect.top,
                },
                sourceId,
            });
        },
        [screenToFlowPosition]
    );

    // Double-click canvas background: create standalone scene
    const onCanvasDoubleClick = useCallback(
        (event: React.MouseEvent) => {
            const target = event.target as Element;
            // Ignore if clicking on a node, edge, form, or UI control
            if (
                target.closest(".react-flow__node") ||
                target.closest(".react-flow__edge") ||
                target.closest(".floatingForm") ||
                target.closest(".react-flow__controls") ||
                target.closest(".react-flow__minimap")
            )
                return;

            const canvasRect = canvasRef.current?.getBoundingClientRect();
            if (!canvasRect) return;

            const flowPos = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            setNewSceneTitle("");
            newSceneTitleRef.current = "";
            setNewSceneIntent({
                flowPos,
                formPos: {
                    x: event.clientX - canvasRect.left,
                    y: event.clientY - canvasRect.top,
                },
            });
        },
        [screenToFlowPosition]
    );

    // Create a scene from any intent (floating form or inline form)
    function createScene(title: string, intent: NewSceneIntent) {
        if (!title.trim()) return;
        const id = slugify(title.trim()) || `scene_${Date.now()}`;
        const scene: Scene = { id, title: title.trim(), text: "", choices: [] };
        positionsRef.current.set(id, intent.flowPos);
        addScene(scene);
        if (intent.sourceId) {
            addChoiceToScene(intent.sourceId, makeEmptyChoice(id));
        }
    }

    function confirmNewScene() {
        const title = newSceneTitleRef.current.trim();
        if (!title || !newSceneIntent) return;
        createScene(title, newSceneIntent);
        setNewSceneIntent(null);
        setNewSceneTitle("");
        newSceneTitleRef.current = "";
    }

    function confirmFirstScene() {
        const title = newSceneTitleRef.current.trim();
        if (!title) return;
        createScene(title, { flowPos: { x: 100, y: 100 }, formPos: { x: 0, y: 0 } });
        setNewSceneTitle("");
        newSceneTitleRef.current = "";
    }

    function cancelNewScene() {
        setNewSceneIntent(null);
        setNewSceneTitle("");
        newSceneTitleRef.current = "";
    }

    // Toolbar "+ New Scene" button — opens floating form at canvas center
    function openNewSceneAtCenter() {
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (!canvasRect) return;
        const centerX = canvasRect.left + canvasRect.width / 2;
        const centerY = canvasRect.top + canvasRect.height / 2;
        const flowPos = screenToFlowPosition({ x: centerX, y: centerY });
        setNewSceneTitle("");
        newSceneTitleRef.current = "";
        setNewSceneIntent({
            flowPos,
            formPos: {
                x: canvasRect.width / 2 - 115,
                y: canvasRect.height / 2 - 55,
            },
        });
    }

    // Select + Delete: remove from store
    const onNodesDelete = useCallback(
        (deletedNodes: Node[]) => {
            deletedNodes.forEach((n) => {
                deleteScene(n.id);
                positionsRef.current.delete(n.id);
            });
        },
        [deleteScene]
    );

    const onEdgesDelete = useCallback(
        (deletedEdges: Edge[]) => {
            deletedEdges.forEach((edge) => {
                const parts = edge.id.split("__");
                if (parts.length < 2) return;
                const sceneId = parts[0];
                const choiceKey = parts.slice(1).join("__");
                removeChoiceFromScene(sceneId, choiceKey);
            });
        },
        [removeChoiceFromScene]
    );

    // Organize button
    function handleOrganize() {
        const currentEdges = buildEdges(scenes, sceneIdSet);
        setNodes((currentNodes) => {
            const laid = applyDagreLayout(currentNodes, currentEdges);
            laid.forEach((n) => positionsRef.current.set(n.id, n.position));
            return laid;
        });
        setTimeout(() => fitView({ padding: 0.25, duration: 400 }), 50);
    }

    // Clamp form position so it doesn't go off-screen
    function clampFormPos(pos: { x: number; y: number }) {
        const canvasW = canvasRef.current?.offsetWidth ?? 800;
        const canvasH = canvasRef.current?.offsetHeight ?? 600;
        return {
            x: Math.min(pos.x, canvasW - 240),
            y: Math.min(pos.y, canvasH - 120),
        };
    }

    // Empty state — no React Flow canvas (it swallows pointer events)
    if (scenes.length === 0) {
        return (
            <div className="structureEmptyState">
                <div className="structureEmptyCard">
                    <p className="structureEmptyTitle">Start your story</p>
                    <p className="structureEmptyHint">
                        Create your first scene to begin building the story graph.
                    </p>
                    <div className="structureInlineForm">
                        <input
                            className="structureInlineInput"
                            placeholder="Scene title…"
                            value={newSceneTitle}
                            onChange={(e) => {
                                setNewSceneTitle(e.target.value);
                                newSceneTitleRef.current = e.target.value;
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") confirmNewScene();
                                if (e.key === "Escape") {
                                    setNewSceneTitle("");
                                    newSceneTitleRef.current = "";
                                }
                            }}
                            autoFocus
                        />
                        <button
                            type="button"
                            className="structureCreateBtn"
                            onClick={confirmFirstScene}
                        >
                            + Create Scene
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="structureCanvas" ref={canvasRef} onDoubleClick={onCanvasDoubleClick}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd as any}
                onNodesDelete={onNodesDelete}
                onEdgesDelete={onEdgesDelete}
                nodeTypes={nodeTypes}
                colorMode="dark"
                fitView
                fitViewOptions={{ padding: 0.25 }}
                minZoom={0.1}
                maxZoom={2.5}
                deleteKeyCode="Delete"
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    color="#1e293b"
                    gap={24}
                    size={1.5}
                />
                <Controls />
                <MiniMap
                    nodeColor={(n) =>
                        (n.data as { isStart?: boolean })?.isStart
                            ? "#3b82f6"
                            : "#374151"
                    }
                    maskColor="rgba(10, 14, 22, 0.75)"
                    style={{ background: "rgba(15, 23, 42, 0.85)" }}
                />
                <Panel position="top-right" className="structureToolbar">
                    <button
                        type="button"
                        className="structureToolbarBtnPrimary"
                        onClick={openNewSceneAtCenter}
                    >
                        + New Scene
                    </button>
                    <button
                        type="button"
                        className="structureToolbarBtn"
                        onClick={handleOrganize}
                        title="Auto-arrange all nodes"
                    >
                        Organize
                    </button>
                </Panel>
                <Panel position="bottom-center" className="structureHintPanel">
                    <span className="structureHint">
                        Drag handle → scene to connect · Drag handle → canvas to create · Delete to remove
                    </span>
                </Panel>
            </ReactFlow>

            {newSceneIntent && (
                <FloatingForm
                    pos={clampFormPos(newSceneIntent.formPos)}
                    sourceId={newSceneIntent.sourceId}
                    title={newSceneTitle}
                    onChange={(v) => {
                        setNewSceneTitle(v);
                        newSceneTitleRef.current = v;
                    }}
                    onConfirm={confirmNewScene}
                    onCancel={cancelNewScene}
                />
            )}
        </div>
    );
}

type FloatingFormProps = {
    pos: { x: number; y: number };
    sourceId?: string;
    title: string;
    onChange: (v: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
};

function FloatingForm({ pos, sourceId, title, onChange, onConfirm, onCancel }: FloatingFormProps) {
    return (
        <div
            className="floatingForm"
            style={{ left: pos.x, top: pos.y }}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <p className="floatingFormLabel">
                {sourceId ? "New connected scene" : "New scene"}
            </p>
            <input
                className="floatingFormInput"
                placeholder="Scene title…"
                value={title}
                onChange={(e) => onChange(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === "Enter") onConfirm();
                    if (e.key === "Escape") onCancel();
                    e.stopPropagation();
                }}
            />
            <p className="floatingFormHint">Enter to create · Esc to cancel</p>
        </div>
    );
}

export function StructurePanel({ onEditScene }: StructurePanelProps) {
    return (
        <ReactFlowProvider>
            <StructurePanelInner onEditScene={onEditScene} />
        </ReactFlowProvider>
    );
}
