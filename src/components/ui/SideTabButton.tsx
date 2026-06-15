import sideTabButtonSmall from "../../assets/ui/button_sidetabs_small.png";
import sideTabButtonMedium from "../../assets/ui/button_sidetabs_medium.png";

type SideTabSize = "small" | "medium";

type SideTabButtonProps = {
    label: string;
    size: SideTabSize;
    active: boolean;
    onClick: () => void;
};

export function SideTabButton({
    label,
    size,
    active,
    onClick,
}: SideTabButtonProps) {
    const sideTabButtonImage =
        size === "medium" ? sideTabButtonMedium : sideTabButtonSmall;

    return (
        <button
            className={`sideTabButton sideTabButton-${size} ${active ? "sideTabButtonActive" : ""
                }`}
            type="button"
            onClick={onClick}
            aria-pressed={active}
        >
            <img
                className="sideTabButtonImage"
                src={sideTabButtonImage}
                alt=""
                draggable={false}
            />

            <span className="sideTabButtonText">{label}</span>
        </button>
    );
}