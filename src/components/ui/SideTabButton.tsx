import sideTabButton from "../../assets/ui/button_sidetabs.png";

type SideTabButtonProps = {
    label: string;
    active: boolean;
    onClick: () => void;
};

export function SideTabButton({ label, active, onClick }: SideTabButtonProps) {
    return (
        <button
            className={`sideTabButton ${active ? "sideTabButtonActive" : ""}`}
            type="button"
            onClick={onClick}
        >
            <img
                className="sideTabButtonImage"
                src={sideTabButton}
                alt=""
                draggable={false}
            />

            <span className="sideTabButtonText">
                {label}
            </span>
        </button>
    );
}