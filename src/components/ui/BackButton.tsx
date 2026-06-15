import backButtonImage from "../../assets/ui/button_back.png";
import "./BackButton.css";

type BackButtonProps = {
    onClick: () => void;
};

export function BackButton({ onClick }: BackButtonProps) {
    return (
        <button
            className="backAssetButton"
            type="button"
            onClick={onClick}
            aria-label="Back to home"
        >
            <img
                className="backAssetButtonImage"
                src={backButtonImage}
                alt=""
                draggable={false}
            />
        </button>
    );
}
