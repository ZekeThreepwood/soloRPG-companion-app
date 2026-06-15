import { useEffect } from "react";
import { LogicalSize } from "@tauri-apps/api/dpi";
import { getCurrentWindow } from "@tauri-apps/api/window";
import soloRpgLogo from "../../assets/branding/asset_main_logo_full.png";
import { StoryButton } from "../../components/ui/StoryButton";
import "./LandingPage.css";

type LandingPageProps = {
    onNewStory: () => void;
    onLoadStory: () => void;
};

export function LandingPage({ onNewStory, onLoadStory }: LandingPageProps) {
    useEffect(() => {
        async function restoreLandingWindowSize() {
            try {
                const currentWindow = getCurrentWindow();

                await currentWindow.unmaximize();
                await currentWindow.setSize(new LogicalSize(800, 600));
                await currentWindow.center();
            } catch (error) {
                console.error("Failed to restore landing window size:", error);
            }
        }

        restoreLandingWindowSize();
    }, []);

    return (
        <main className="landingPage">
            <section className="landingContent">
                <img
                    className="mainLogo"
                    src={soloRpgLogo}
                    alt="soloRPG Engine"
                    draggable={false}
                />

                <div className="landingActions">
                    <StoryButton onClick={onNewStory}>
                        New Story
                    </StoryButton>

                    <StoryButton onClick={onLoadStory} disabled>
                        Load Story
                    </StoryButton>
                </div>
            </section>
        </main>
    );
}
