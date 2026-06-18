import { useState } from "react";
import { LandingPage } from "./features/home/LandingPage";
import { NewStorySetup } from "./features/home/NewStorySetup";
import { StoryWorkspace } from "./features/story/StoryWorkspace";
import { TemplateDesignerView } from "./features/templates/TemplateDesignerView";
import { openCampaign } from "./app/saveLoad";

type AppScreen = "landing" | "setup" | "editing" | "template-editor";

export default function App() {
    const [screen, setScreen] = useState<AppScreen>("landing");

    async function handleLoadStory() {
        const loaded = await openCampaign();
        if (loaded) setScreen("editing");
    }

    return (
        <>
            {screen === "landing" && (
                <LandingPage
                    onNewStory={() => setScreen("setup")}
                    onLoadStory={handleLoadStory}
                    onOpenTemplateEditor={() => setScreen("template-editor")}
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
            {screen === "template-editor" && (
                <TemplateDesignerView onBack={() => setScreen("landing")} />
            )}
        </>
    );
}
