import { useEffect, useRef } from "react";
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
    const didResize = useRef(false);

    useEffect(() => {
        if (didResize.current) return;
        didResize.current = true;

        async function restoreWindow() {
            try {
                const win = getCurrentWindow();
                await win.hide();
                await win.unmaximize();
                await win.setSize(new LogicalSize(800, 600));
                await win.center();
                await win.show();
            } catch (error) {
                console.error("Failed to restore landing window size:", error);
            }
        }

        restoreWindow();
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

                    <StoryButton onClick={onLoadStory}>
                        Load Story
                    </StoryButton>

                    <StoryButton disabled>
                        Template Editor
                    </StoryButton>
                </div>
            </section>
        </main>
    );
}
