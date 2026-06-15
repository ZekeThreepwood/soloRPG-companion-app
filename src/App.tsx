import { useState } from "react";
import "./styles/app.css";
import { LandingPage } from "./features/home/LandingPage";
import { StoryWorkspace } from "./features/story/StoryWorkspace";

type AppScreen = "landing" | "new-story";

export default function App() {
    const [screen, setScreen] = useState<AppScreen>("landing");

    function handleNewStory() {
        setScreen("new-story");
    }

    function handleLoadStory() {
        // Disabled for now.
        // Later this will load a story JSON/package and hydrate the editor UI.
    }

    if (screen === "new-story") {
        return (
            <StoryWorkspace
                onBackToLanding={() => setScreen("landing")}
            />
        );
    }

    return (
        <LandingPage
            onNewStory={handleNewStory}
            onLoadStory={handleLoadStory}
        />
    );
}