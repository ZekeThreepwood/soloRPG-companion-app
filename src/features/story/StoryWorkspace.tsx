import { useEffect, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { BackButton } from "../../components/ui/BackButton";
import { SideTabButton } from "../../components/ui/SideTabButton";
import { ScenesPanel } from "./scenes/ScenesPanel";
import { ItemsPanel } from "./items/ItemsPanel";
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
    const didResize = useRef(false);

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
