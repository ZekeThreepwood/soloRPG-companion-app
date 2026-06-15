import backButtonImage from "../../assets/ui/button_back.png";

type BackButtonProps = {
    onClick: () => void;
};

export function BackButton({ onClick }: BackButtonProps) {
    return (
        <button
            className="backAssetButton"
            type="button"
            onClick={onClick}
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