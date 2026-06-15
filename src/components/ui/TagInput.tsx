import { useState } from "react";
import type { KeyboardEvent } from "react";
import "./TagInput.css";

type TagInputProps = {
    tags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
};

export function TagInput({ tags, onChange, placeholder = "Add and press Enter" }: TagInputProps) {
    const [input, setInput] = useState("");

    function commit() {
        const value = input.trim();
        if (value && !tags.includes(value)) {
            onChange([...tags, value]);
        }
        setInput("");
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
        } else if (e.key === "Backspace" && !input && tags.length > 0) {
            onChange(tags.slice(0, -1));
        }
    }

    return (
        <div className="tagInput">
            {tags.map((tag) => (
                <span key={tag} className="tagPill">
                    {tag}
                    <button
                        type="button"
                        className="tagPillRemove"
                        onClick={() => onChange(tags.filter((t) => t !== tag))}
                        aria-label={`Remove ${tag}`}
                    >
                        ×
                    </button>
                </span>
            ))}
            <input
                className="tagPillField"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={commit}
                placeholder={tags.length === 0 ? placeholder : ""}
            />
        </div>
    );
}
