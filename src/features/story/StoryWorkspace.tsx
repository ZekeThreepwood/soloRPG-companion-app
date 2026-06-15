import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { BackButton } from "../../components/ui/BackButton";
import { SideTabButton } from "../../components/ui/SideTabButton";
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

    useEffect(() => {
        async function maximizeWindow() {
            try {
                const currentWindow = getCurrentWindow();
                await currentWindow.maximize();
            } catch (error) {
                console.error("Failed to maximize app window:", error);
            }
        }

        maximizeWindow();
    }, []);

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
                    <p className="eyebrow">New Story</p>
                    <h1>{getModeTitle(activeMode)}</h1>
                </header>

                <div className="workspacePanel">
                    {activeMode === "scenes" && (
                        <>
                            <h2>Scenes</h2>
                            <p>
                                This section will be the main story scene editor. It will let
                                you create scenes, write scene text, assign templates, choose
                                assets, and define player choices.
                            </p>
                        </>
                    )}

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

                    {activeMode === "items" && (
                        <>
                            <h2>Items</h2>
                            <p>
                                This section will manage items that can be granted, removed,
                                required, or referenced by story choices and conditions.
                            </p>
                        </>
                    )}

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
