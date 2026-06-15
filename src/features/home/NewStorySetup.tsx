import { useState } from "react";
import { useStoryStore } from "../../app/storyStore";
import "./NewStorySetup.css";

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s_]/g, "")
        .trim()
        .replace(/\s+/g, "_");
}

type NewStorySetupProps = {
    onCancel: () => void;
    onCreate: () => void;
};

export function NewStorySetup({ onCancel, onCreate }: NewStorySetupProps) {
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [titleError, setTitleError] = useState("");
    const initStory = useStoryStore((s) => s.initStory);

    function handleCreate() {
        if (!title.trim()) {
            setTitleError("Story title is required");
            return;
        }
        const id = slugify(title.trim()) || "untitled";
        initStory(id, title.trim(), author.trim());
        onCreate();
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter") handleCreate();
        if (e.key === "Escape") onCancel();
    }

    return (
        <main className="setupPage">
            <div className="setupCard">
                <h2 className="setupTitle">New Story</h2>

                <div className="setupField">
                    <label className="setupLabel">
                        Story Title <span className="setupRequired">*</span>
                    </label>
                    <input
                        className={`setupInput ${titleError ? "setupInputError" : ""}`}
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            setTitleError("");
                        }}
                        placeholder="e.g. The Ruin of Elara"
                        autoFocus
                        onKeyDown={handleKeyDown}
                    />
                    {titleError && <span className="setupErrorMsg">{titleError}</span>}
                </div>

                <div className="setupField">
                    <label className="setupLabel">Author</label>
                    <input
                        className="setupInput"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Optional"
                        onKeyDown={handleKeyDown}
                    />
                </div>

                <div className="setupActions">
                    <button type="button" className="setupBtnSecondary" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="button" className="setupBtnPrimary" onClick={handleCreate}>
                        Create Story
                    </button>
                </div>
            </div>
        </main>
    );
}
