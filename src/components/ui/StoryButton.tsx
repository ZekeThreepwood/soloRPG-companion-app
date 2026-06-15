import { useState } from "react";
import buttonBubble from "../../assets/ui/button_bubble.png";
import buttonBubblePressed from "../../assets/ui/button_bubble_pressed.png";
import buttonBubbleDisabled from "../../assets/ui/button_bubble_disabled.png";
import "./StoryButton.css";

type StoryButtonProps = {
    children: string;
    onClick?: () => void;
    disabled?: boolean;
};

export function StoryButton({
    children,
    onClick,
    disabled = false,
}: StoryButtonProps) {
    const [isPressed, setIsPressed] = useState(false);

    const buttonImage = disabled
        ? buttonBubbleDisabled
        : isPressed
            ? buttonBubblePressed
            : buttonBubble;

    return (
        <button
            className="storyButton"
            type="button"
            disabled={disabled}
            onClick={onClick}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
        >
            <img
                className="storyButtonImage"
                src={buttonImage}
                alt=""
                draggable={false}
            />

            <span className="storyButtonText">
                {children}
            </span>
        </button>
    );
}
