import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { SideTabButton } from "../../components/ui/SideTabButton";

type StoryWorkspaceProps = {
    onBackToLanding: () => void;
};

type StoryMode =
    | "story"
    | "scenes"
    | "characters"
    | "items"
    | "quests"
    | "assets"
    | "export";

const STORY_MODES: Array<{
    id: StoryMode;
    label: string;
}> = [
        { id: "story", label: "Story" },
        { id: "scenes", label: "Scenes" },
        { id: "characters", label: "Characters" },
        { id: "items", label: "Items" },
        { id: "quests", label: "Quests" },
        { id: "assets", label: "Assets" },
        { id: "export", label: "Export" },
    ];

export function StoryWorkspace({ onBackToLanding }: StoryWorkspaceProps) {
    const [activeMode, setActiveMode] = useState<StoryMode>("story");

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
                <button
                    className="workspaceBackButton"
                    type="button"
                    onClick={onBackToLanding}
                >
                    ← Home
                </button>

                <nav className="sideTabs" aria-label="Story editor modes">
                    {STORY_MODES.map((mode) => (
                        <SideTabButton
                            key={mode.id}
                            label={mode.label}
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
                    {activeMode === "story" && (
                        <>
                            <h2>Story Setup</h2>
                            <p>
                                This is where the app will collect the story title, author,
                                description, campaign id, and create the first playable scene.
                            </p>
                        </>
                    )}

                    {activeMode === "scenes" && (
                        <>
                            <h2>Scenes</h2>
                            <p>
                                This mode will become the visual story graph where each scene is
                                a node and each choice can connect to another scene.
                            </p>
                        </>
                    )}

                    {activeMode === "characters" && (
                        <>
                            <h2>Characters</h2>
                            <p>
                                This mode will manage NPCs, companions, enemies, and reusable
                                character assets for the story.
                            </p>
                        </>
                    )}

                    {activeMode === "items" && (
                        <>
                            <h2>Items</h2>
                            <p>
                                This mode will manage items that can be found, required,
                                removed, or rewarded through choices.
                            </p>
                        </>
                    )}

                    {activeMode === "quests" && (
                        <>
                            <h2>Quests</h2>
                            <p>
                                This mode will manage basic quest states and story objectives
                                once the engine quest system is fully closed.
                            </p>
                        </>
                    )}

                    {activeMode === "assets" && (
                        <>
                            <h2>Assets</h2>
                            <p>
                                This mode will manage imported images and map them to campaign
                                asset paths.
                            </p>
                        </>
                    )}

                    {activeMode === "export" && (
                        <>
                            <h2>Export</h2>
                            <p>
                                This mode will export the current story into a soloRPG campaign
                                package that the engine can load.
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
        case "story":
            return "Story Setup";
        case "scenes":
            return "Scene Editor";
        case "characters":
            return "Characters";
        case "items":
            return "Items";
        case "quests":
            return "Quests";
        case "assets":
            return "Assets";
        case "export":
            return "Export";
    }
}