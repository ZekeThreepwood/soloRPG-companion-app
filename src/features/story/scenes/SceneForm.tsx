import { useState } from "react";
import { ChoiceEditor } from "./ChoiceEditor";
import type { Choice, Scene, SceneTemplate } from "../../../types/story";
import "./SceneForm.css";

type SceneFormProps = {
    initialScene?: Scene;
    currentSceneId?: string;
    onSave: (scene: Scene) => void;
    onCancel: () => void;
};

function makeEmptyChoice(): Choice {
    return {
        _key: crypto.randomUUID(),
        text: "",
        requires_items: [],
        requires_missing_items: [],
        requires_flags: {},
        add_items: [],
        remove_items: [],
        start_quests: [],
        complete_quests: [],
        fail_quests: [],
        set_flags: {},
    };
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s_]/g, "")
        .trim()
        .replace(/\s+/g, "_");
}

type FormErrors = {
    title?: string;
    id?: string;
    text?: string;
};

export function SceneForm({ initialScene, currentSceneId, onSave, onCancel }: SceneFormProps) {
    const [title, setTitle] = useState(initialScene?.title ?? "");
    const [id, setId] = useState(initialScene?.id ?? "");
    const [idManuallyEdited, setIdManuallyEdited] = useState(!!initialScene);
    const [text, setText] = useState(initialScene?.text ?? "");
    const [template, setTemplate] = useState<SceneTemplate | "">(
        initialScene?.scene_template ?? ""
    );
    const [canRevisit, setCanRevisit] = useState(initialScene?.can_revisit ?? false);
    const [canGoBack, setCanGoBack] = useState(initialScene?.can_go_back ?? false);
    const [hasAsset, setHasAsset] = useState(!!initialScene?.asset);
    const [asset, setAsset] = useState(initialScene?.asset ?? "");
    const [choices, setChoices] = useState<Choice[]>(
        initialScene?.choices ?? []
    );
    const [errors, setErrors] = useState<FormErrors>({});

    function handleTitleChange(value: string) {
        setTitle(value);
        if (!idManuallyEdited) {
            setId(slugify(value));
        }
    }

    function handleIdChange(value: string) {
        setId(value);
        setIdManuallyEdited(true);
    }

    function updateChoice(index: number, updated: Choice) {
        const next = [...choices];
        next[index] = updated;
        setChoices(next);
    }

    function removeChoice(index: number) {
        setChoices(choices.filter((_, i) => i !== index));
    }

    function moveChoice(index: number, direction: -1 | 1) {
        const next = [...choices];
        const target = index + direction;
        [next[index], next[target]] = [next[target], next[index]];
        setChoices(next);
    }

    function validate(): FormErrors {
        const errs: FormErrors = {};
        if (!title.trim()) errs.title = "Title is required";
        if (!id.trim()) errs.id = "Scene ID is required";
        if (!text.trim()) errs.text = "Narrative text is required";
        return errs;
    }

    function handleSave() {
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        const scene: Scene = {
            id: id.trim(),
            title: title.trim(),
            text: text.trim(),
            choices,
        };

        if (template) scene.scene_template = template;
        if (canRevisit) scene.can_revisit = true;
        if (canGoBack) scene.can_go_back = true;
        if (hasAsset && asset.trim()) scene.asset = asset.trim();

        onSave(scene);
    }

    const isEditing = !!initialScene;

    return (
        <div className="sceneForm">
            <div className="sceneFormTopBar">
                <h2 className="sceneFormHeading">
                    {isEditing ? `Editing: ${initialScene.title}` : "New Scene"}
                </h2>
                <div className="sceneFormTopActions">
                    <button type="button" className="sceneFormBtnSecondary" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="button" className="sceneFormBtnPrimary" onClick={handleSave}>
                        Save Scene
                    </button>
                </div>
            </div>

            <div className="sceneFormBody">
                <div className="sceneFormSection">
                    <div className="sceneFormRow">
                        <div className="sceneFormGroupGrow">
                            <label className="sceneFieldLabel">
                                Title <span className="sceneFieldRequired">*</span>
                            </label>
                            <input
                                className={`sceneFieldInput ${errors.title ? "sceneFieldInputError" : ""}`}
                                value={title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="e.g. Ruin Gate"
                            />
                            {errors.title && <span className="sceneFieldErrorMsg">{errors.title}</span>}
                        </div>

                        <div className="sceneFormGroupTemplate">
                            <label className="sceneFieldLabel">Template</label>
                            <select
                                className="sceneFieldSelect"
                                value={template}
                                onChange={(e) => setTemplate(e.target.value as SceneTemplate | "")}
                            >
                                <option value="">— none —</option>
                                <option value="location">location</option>
                                <option value="item_found">item_found</option>
                                <option value="text_scene">text_scene</option>
                            </select>
                        </div>
                    </div>

                    <div className="sceneFormGroup">
                        <label className="sceneFieldLabel">
                            Scene ID <span className="sceneFieldRequired">*</span>
                        </label>
                        <input
                            className={`sceneFieldInput sceneFieldInputMono ${errors.id ? "sceneFieldInputError" : ""}`}
                            value={id}
                            onChange={(e) => handleIdChange(e.target.value)}
                            placeholder="auto-generated from title"
                        />
                        {errors.id && <span className="sceneFieldErrorMsg">{errors.id}</span>}
                    </div>

                    <div className="sceneFormFlagsRow">
                        <label className="sceneCheckLabel">
                            <input
                                type="checkbox"
                                checked={canRevisit}
                                onChange={(e) => setCanRevisit(e.target.checked)}
                            />
                            Can Revisit
                        </label>
                        <label className="sceneCheckLabel">
                            <input
                                type="checkbox"
                                checked={canGoBack}
                                onChange={(e) => setCanGoBack(e.target.checked)}
                            />
                            Can Go Back
                        </label>
                        <label className="sceneCheckLabel">
                            <input
                                type="checkbox"
                                checked={hasAsset}
                                onChange={(e) => {
                                    setHasAsset(e.target.checked);
                                    if (!e.target.checked) setAsset("");
                                }}
                            />
                            Has Asset
                        </label>
                        {hasAsset && (
                            <input
                                className="sceneFieldInput sceneFieldInputAsset"
                                value={asset}
                                onChange={(e) => setAsset(e.target.value)}
                                placeholder="campaign://assets/..."
                            />
                        )}
                    </div>
                </div>

                <div className="sceneFormSection">
                    <div className="sceneFormGroup">
                        <label className="sceneFieldLabel">
                            Narrative Text <span className="sceneFieldRequired">*</span>
                        </label>
                        <textarea
                            className={`sceneFieldTextarea ${errors.text ? "sceneFieldInputError" : ""}`}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="What the player reads when they arrive at this scene…"
                            rows={6}
                        />
                        {errors.text && <span className="sceneFieldErrorMsg">{errors.text}</span>}
                    </div>
                </div>

                <div className="sceneFormSection">
                    <div className="sceneFormSectionHeader">
                        <span className="sceneFieldLabel">Choices</span>
                        <button
                            type="button"
                            className="sceneFormBtnAdd"
                            onClick={() => setChoices([...choices, makeEmptyChoice()])}
                        >
                            + Add Choice
                        </button>
                    </div>

                    {choices.length === 0 && (
                        <p className="sceneNoChoicesHint">
                            No choices — scenes without choices act as story endpoints.
                        </p>
                    )}

                    <div className="sceneChoiceList">
                        {choices.map((choice, i) => (
                            <ChoiceEditor
                                key={choice._key}
                                choice={choice}
                                index={i}
                                currentSceneId={currentSceneId}
                                onChange={(updated) => updateChoice(i, updated)}
                                onRemove={() => removeChoice(i)}
                                canMoveUp={i > 0}
                                canMoveDown={i < choices.length - 1}
                                onMoveUp={() => moveChoice(i, -1)}
                                onMoveDown={() => moveChoice(i, 1)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
