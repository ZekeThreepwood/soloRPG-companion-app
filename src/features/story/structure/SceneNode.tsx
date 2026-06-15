import { Handle, Position } from "@xyflow/react";
import type { Scene } from "../../../types/story";
import "./SceneNode.css";

export type SceneNodeData = {
    scene: Scene;
    isStart: boolean;
    onEdit?: (id: string) => void;
};

type Props = {
    data: SceneNodeData;
    selected?: boolean;
};

export function SceneNode({ data, selected }: Props) {
    const { scene, isStart, onEdit } = data;

    return (
        <div
            className={[
                "sceneNode",
                isStart ? "sceneNodeIsStart" : "",
                selected ? "sceneNodeSelected" : "",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <Handle type="target" position={Position.Left} id="in" />

            <div className="snBadges">
                {isStart && <span className="snBadgeStart">start</span>}
                {scene.scene_template && (
                    <span className="snBadgeTemplate">{scene.scene_template}</span>
                )}
            </div>

            <p className="snTitle">{scene.title}</p>
            <p className="snId">{scene.id}</p>

            <div className="snFooter">
                <p className="snMeta">
                    {scene.choices.length}{" "}
                    {scene.choices.length === 1 ? "choice" : "choices"}
                    {scene.can_revisit && " · revisitable"}
                </p>
                {onEdit && (
                    <button
                        type="button"
                        className="snEditBtn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(scene.id);
                        }}
                    >
                        Details
                    </button>
                )}
            </div>

            <Handle type="source" position={Position.Right} id="out" />
        </div>
    );
}
