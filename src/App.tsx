import { useState } from "react";
import { LandingPage } from "./features/home/LandingPage";
import { NewStorySetup } from "./features/home/NewStorySetup";
import { StoryWorkspace } from "./features/story/StoryWorkspace";
import { openProject } from "./app/saveLoad";

type AppScreen = "landing" | "setup" | "editing";

export default function App() {
    const [screen, setScreen] = useState<AppScreen>("landing");

    async function handleLoadStory() {
        const loaded = await openProject();
        if (loaded) setScreen("editing");
    }

    return (
        <>
            {screen === "landing" && (
                <LandingPage
                    onNewStory={() => setScreen("setup")}
                    onLoadStory={handleLoadStory}
                />
            )}
            {screen === "setup" && (
                <NewStorySetup
                    onCancel={() => setScreen("landing")}
                    onCreate={() => setScreen("editing")}
                />
            )}
            {screen === "editing" && (
                <StoryWorkspace onBackToLanding={() => setScreen("landing")} />
            )}
        </>
    );
}
