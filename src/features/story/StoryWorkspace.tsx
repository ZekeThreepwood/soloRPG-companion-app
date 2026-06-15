import { useEffect, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { BackButton } from "../../components/ui/BackButton";
import { SideTabButton } from "../../components/ui/SideTabButton";
import { ScenesPanel } from "./scenes/ScenesPanel";
import { ItemsPanel } from "./items/ItemsPanel";
import { useStoryStore } from "../../app/storyStore";
import { useAutoSave } from "../../app/useAutoSave";
import { saveProject } from "../../app/saveLoad";
import "./StoryWorkspace.css";

type StoryWorkspaceProps = {
    onBackToLanding: () => void;
};

type StoryMode = "scenes" | "structure" | "items" | "assets";

type SideTabSize = "small" | "medium" | "long";

const STORY_MODES: Array<{
    id: StoryMode;
    label: string;
    tabSize: SideTabSize;
}> = [
        { id: "scenes", label: "Scenes", tabSize: "small" },
        { id: "structure", label: "Structure", tabSize: "medium" },
        { id: "items", label: "Items", tabSize: "small" },
        { id: "assets", label: "Assets", tabSize: "small" },
    ];

export function StoryWorkspace({ onBackToLanding }: StoryWorkspaceProps) {
    const [activeMode, setActiveMode] = useState<StoryMode>("scenes");
    const [isSaving, setIsSaving] = useState(false);
    const didResize = useRef(false);

    const storyTitle = useStoryStore((s) => s.storyTitle);
    const isDirty = useStoryStore((s) => s.isDirty);

    useAutoSave();

    useEffect(() => {
        if (didResize.current) return;
        didResize.current = true;

        async function expandWindow() {
            try {
                const win = getCurrentWindow();
                await win.hide();
                await win.setResizable(true);
                const alreadyMaximized = await win.isMaximized();
                if (!alreadyMaximized) {
                    await win.maximize();
                }
                await win.show();
                await win.setFocus();
            } catch (error) {
                console.error("Failed to expand window:", error);
            }
        }

        expandWindow();
    }, []);

    async function handleSave() {
        setIsSaving(true);
        await saveProject();
        setIsSaving(false);
    }

    return (
        <main className="workspacePage">
            <aside className="workspaceSidebar">
                <BackButton onClick={onBackToLanding} />

                <nav className="sideTabs" aria-label="Story editor modes">
                    {STORY_MODES.map((mode) => (
                        <SideTabButton
                            key={mode.id}
                            label={mode.label}
                            size={mode.tabSize}
                            active={activeMode === mode.id}
                            onClick={() => setActiveMode(mode.id)}
                        />
                    ))}
                </nav>
            </aside>

            <section className="workspaceMain">
                <header className="workspaceHeader">
                    <div className="workspaceHeaderLeft">
                        <p className="eyebrow">{storyTitle || "Untitled Story"}</p>
                        <h1>{getModeTitle(activeMode)}</h1>
                    </div>
                    <div className="workspaceHeaderActions">
                        {isDirty && !isSaving && (
                            <span className="saveStatus">Unsaved</span>
                        )}
                        <button
                            type="button"
                            className="saveBtn"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving…" : "Save"}
                        </button>
                    </div>
                </header>

                <div className="workspacePanel">
                    {activeMode === "scenes" && <ScenesPanel />}

                    {activeMode === "structure" && (
                        <>
                            <h2>Structure</h2>
                            <p>
                                This section will handle the high-level flow of the story. It
                                will later become the place for branch organization, scene graph
                                structure, entry flow, and overall navigation logic.
                            </p>
                        </>
                    )}

                    {activeMode === "items" && <ItemsPanel />}

                    {activeMode === "assets" && (
                        <>
                            <h2>Assets</h2>
                            <p>
                                This section will manage story images and other imported
                                campaign assets, and map them to the campaign package structure.
                            </p>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}

function getModeTitle(mode: StoryMode): string {
    switch (mode) {
        case "scenes":
            return "Scenes";
        case "structure":
            return "Structure";
        case "items":
            return "Items";
        case "assets":
            return "Assets";
    }
}
