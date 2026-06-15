import soloRpgLogo from "../../assets/branding/asset_main_logo_full.png";
import { StoryButton } from "../../components/ui/StoryButton";

type LandingPageProps = {
    onNewStory: () => void;
    onLoadStory: () => void;
};

export function LandingPage({ onNewStory, onLoadStory }: LandingPageProps) {
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