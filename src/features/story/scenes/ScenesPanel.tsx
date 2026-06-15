import { useState } from "react";
import { useStoryStore } from "../../../app/storyStore";
import { SceneForm } from "./SceneForm";
import type { Scene } from "../../../types/story";
import "./ScenesPanel.css";

type View = "list" | "create" | "edit";

export function ScenesPanel() {
    const [view, setView] = useState<View>("list");
    const [editingId, setEditingId] = useState<string | null>(null);

    const scenes = useStoryStore((s) => s.scenes);
    const startScene = useStoryStore((s) => s.startScene);
    const addScene = useStoryStore((s) => s.addScene);
    const replaceScene = useStoryStore((s) => s.replaceScene);
    const deleteScene = useStoryStore((s) => s.deleteScene);
    const setStartScene = useStoryStore((s) => s.setStartScene);

    function handleSave(scene: Scene) {
        if (view === "create") {
            addScene(scene);
        } else if (editingId) {
            replaceScene(editingId, scene);
        }
        setView("list");
        setEditingId(null);
    }

    function handleEdit(id: string) {
        setEditingId(id);
        setView("edit");
    }

    function handleCancel() {
        setView("list");
        setEditingId(null);
    }

    if (view === "create" || view === "edit") {
        const editingScene = editingId
            ? scenes.find((s) => s.id === editingId)
            : undefined;
        return (
            <SceneForm
                initialScene={editingScene}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        );
    }

    if (scenes.length === 0) {
        return (
            <div className="scenesEmpty">
                <p className="scenesEmptyHint">No scenes yet. Start building your story.</p>
                <button
                    type="button"
                    className="scenesAddBtn"
                    onClick={() => setView("create")}
                >
                    + Create Scene
                </button>
            </div>
        );
    }

    return (
        <div className="scenesList">
            <div className="scenesListHeader">
                <p className="scenesCount">{scenes.length} {scenes.length === 1 ? "scene" : "scenes"}</p>
                <button
                    type="button"
                    className="scenesAddBtn"
                    onClick={() => setView("create")}
                >
                    + Create Scene
                </button>
            </div>

            <div className="scenesGrid">
                {scenes.map((scene) => (
                    <div
                        key={scene.id}
                        className={`sceneCard ${startScene === scene.id ? "sceneCardIsStart" : ""}`}
                    >
                        <div className="sceneCardBadges">
                            {scene.scene_template && (
                                <span className="sceneCardTemplate">{scene.scene_template}</span>
                            )}
                            {startScene === scene.id && (
                                <span className="sceneCardStartBadge">start</span>
                            )}
                        </div>

                        <h3 className="sceneCardTitle">{scene.title}</h3>
                        <p className="sceneCardId">{scene.id}</p>

                        <p className="sceneCardExcerpt">
                            {scene.text.slice(0, 110)}{scene.text.length > 110 ? "…" : ""}
                        </p>

                        <p className="sceneCardMeta">
                            {scene.choices.length} {scene.choices.length === 1 ? "choice" : "choices"}
                            {scene.can_revisit && " · revisitable"}
                        </p>

                        <div className="sceneCardActions">
                            {startScene !== scene.id && (
                                <button
                                    type="button"
                                    className="sceneCardBtn"
                                    onClick={() => setStartScene(scene.id)}
                                >
                                    Set as Start
                                </button>
                            )}
                            <button
                                type="button"
                                className="sceneCardBtn"
                                onClick={() => handleEdit(scene.id)}
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                className="sceneCardBtnDanger"
                                onClick={() => deleteScene(scene.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
