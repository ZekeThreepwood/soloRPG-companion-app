import { useState } from "react";
import { TagInput } from "../../../components/ui/TagInput";
import type { Choice } from "../../../types/story";
import "./ChoiceEditor.css";

type FlagPair = { key: string; value: boolean };

type Toggles = {
    useAction: boolean;
    requiresItems: boolean;
    addItems: boolean;
    removeItems: boolean;
    startQuests: boolean;
    completeQuests: boolean;
    setFlags: boolean;
};

type ChoiceEditorProps = {
    choice: Choice;
    index: number;
    onChange: (choice: Choice) => void;
    onRemove: () => void;
    canMoveUp: boolean;
    canMoveDown: boolean;
    onMoveUp: () => void;
    onMoveDown: () => void;
};

export function ChoiceEditor({
    choice,
    index,
    onChange,
    onRemove,
    canMoveUp,
    canMoveDown,
    onMoveUp,
    onMoveDown,
}: ChoiceEditorProps) {
    const [expanded, setExpanded] = useState(true);
    const [toggles, setToggles] = useState<Toggles>({
        useAction: !!choice.action,
        requiresItems: choice.requires_items.length > 0,
        addItems: choice.add_items.length > 0,
        removeItems: choice.remove_items.length > 0,
        startQuests: choice.start_quests.length > 0,
        completeQuests: choice.complete_quests.length > 0,
        setFlags: Object.keys(choice.set_flags).length > 0,
    });
    const [flagPairs, setFlagPairs] = useState<FlagPair[]>(() =>
        Object.entries(choice.set_flags).map(([key, value]) => ({ key, value }))
    );

    function update(partial: Partial<Choice>) {
        onChange({ ...choice, ...partial });
    }

    function setToggle(key: keyof Toggles, on: boolean) {
        setToggles((prev) => ({ ...prev, [key]: on }));
        if (!on) {
            switch (key) {
                case "useAction":       update({ action: undefined }); break;
                case "requiresItems":   update({ requires_items: [] }); break;
                case "addItems":        update({ add_items: [] }); break;
                case "removeItems":     update({ remove_items: [] }); break;
                case "startQuests":     update({ start_quests: [] }); break;
                case "completeQuests":  update({ complete_quests: [] }); break;
                case "setFlags":
                    setFlagPairs([]);
                    update({ set_flags: {} });
                    break;
            }
        }
    }

    function updateFlagPairs(pairs: FlagPair[]) {
        setFlagPairs(pairs);
        const flags: Record<string, boolean> = {};
        pairs.forEach(({ key, value }) => {
            if (key.trim()) flags[key.trim()] = value;
        });
        update({ set_flags: flags });
    }

    const previewText = choice.text.trim() || `Choice ${index + 1}`;

    return (
        <div className="choiceEditor">
            <div className="choiceEditorHeader">
                <button
                    type="button"
                    className="choiceCollapseBtn"
                    onClick={() => setExpanded((v) => !v)}
                >
                    <span className="choiceCollapseIcon">{expanded ? "▾" : "▸"}</span>
                    <span className="choicePreviewText">
                        <span className="choiceIndex">Choice {index + 1}</span>
                        {choice.text && (
                            <span className="choicePreview"> — {previewText.slice(0, 60)}</span>
                        )}
                    </span>
                </button>
                <div className="choiceOrderBtns">
                    <button type="button" className="choiceOrderBtn" onClick={onMoveUp} disabled={!canMoveUp} title="Move up">↑</button>
                    <button type="button" className="choiceOrderBtn" onClick={onMoveDown} disabled={!canMoveDown} title="Move down">↓</button>
                    <button type="button" className="choiceDeleteBtn" onClick={onRemove} title="Remove choice">×</button>
                </div>
            </div>

            {expanded && (
                <div className="choiceEditorBody">
                    <div className="choiceField">
                        <label className="choiceFieldLabel">Choice Text</label>
                        <input
                            className="choiceInput"
                            value={choice.text}
                            onChange={(e) => update({ text: e.target.value })}
                            placeholder="What the player sees and clicks"
                        />
                    </div>

                    <div className="choiceField">
                        <div className="choiceDestRow">
                            <span className="choiceFieldLabel">Destination</span>
                            <div className="choiceDestToggle">
                                <label className="choiceRadioLabel">
                                    <input
                                        type="radio"
                                        name={`dest-${choice._key}`}
                                        checked={!toggles.useAction}
                                        onChange={() => {
                                            setToggles((p) => ({ ...p, useAction: false }));
                                            update({ action: undefined });
                                        }}
                                    />
                                    Next Scene
                                </label>
                                <label className="choiceRadioLabel">
                                    <input
                                        type="radio"
                                        name={`dest-${choice._key}`}
                                        checked={toggles.useAction}
                                        onChange={() => {
                                            setToggles((p) => ({ ...p, useAction: true }));
                                            update({ next_scene: undefined });
                                        }}
                                    />
                                    Action
                                </label>
                            </div>
                        </div>
                        {toggles.useAction ? (
                            <input
                                className="choiceInput choiceInputMono"
                                value={choice.action ?? ""}
                                onChange={(e) => update({ action: e.target.value })}
                                placeholder="e.g. return_to_main_menu"
                            />
                        ) : (
                            <input
                                className="choiceInput choiceInputMono"
                                value={choice.next_scene ?? ""}
                                onChange={(e) => update({ next_scene: e.target.value })}
                                placeholder="scene_id"
                            />
                        )}
                    </div>

                    <div className="choiceOptionals">
                        <p className="choiceOptionalsLabel">Optional Effects</p>

                        <div className="choiceToggleRow">
                            <label className="choiceCheckLabel">
                                <input
                                    type="checkbox"
                                    checked={toggles.requiresItems}
                                    onChange={(e) => setToggle("requiresItems", e.target.checked)}
                                />
                                Requires Items
                            </label>
                            {toggles.requiresItems && (
                                <TagInput
                                    tags={choice.requires_items}
                                    onChange={(tags) => update({ requires_items: tags })}
                                    placeholder="item_id"
                                />
                            )}
                        </div>

                        <div className="choiceToggleRow">
                            <label className="choiceCheckLabel">
                                <input
                                    type="checkbox"
                                    checked={toggles.addItems}
                                    onChange={(e) => setToggle("addItems", e.target.checked)}
                                />
                                Add Items
                            </label>
                            {toggles.addItems && (
                                <TagInput
                                    tags={choice.add_items}
                                    onChange={(tags) => update({ add_items: tags })}
                                    placeholder="item_id"
                                />
                            )}
                        </div>

                        <div className="choiceToggleRow">
                            <label className="choiceCheckLabel">
                                <input
                                    type="checkbox"
                                    checked={toggles.removeItems}
                                    onChange={(e) => setToggle("removeItems", e.target.checked)}
                                />
                                Remove Items
                            </label>
                            {toggles.removeItems && (
                                <TagInput
                                    tags={choice.remove_items}
                                    onChange={(tags) => update({ remove_items: tags })}
                                    placeholder="item_id"
                                />
                            )}
                        </div>

                        <div className="choiceToggleRow">
                            <label className="choiceCheckLabel">
                                <input
                                    type="checkbox"
                                    checked={toggles.startQuests}
                                    onChange={(e) => setToggle("startQuests", e.target.checked)}
                                />
                                Start Quests
                            </label>
                            {toggles.startQuests && (
                                <TagInput
                                    tags={choice.start_quests}
                                    onChange={(tags) => update({ start_quests: tags })}
                                    placeholder="quest_id"
                                />
                            )}
                        </div>

                        <div className="choiceToggleRow">
                            <label className="choiceCheckLabel">
                                <input
                                    type="checkbox"
                                    checked={toggles.completeQuests}
                                    onChange={(e) => setToggle("completeQuests", e.target.checked)}
                                />
                                Complete Quests
                            </label>
                            {toggles.completeQuests && (
                                <TagInput
                                    tags={choice.complete_quests}
                                    onChange={(tags) => update({ complete_quests: tags })}
                                    placeholder="quest_id"
                                />
                            )}
                        </div>

                        <div className="choiceToggleRow">
                            <label className="choiceCheckLabel">
                                <input
                                    type="checkbox"
                                    checked={toggles.setFlags}
                                    onChange={(e) => setToggle("setFlags", e.target.checked)}
                                />
                                Set Flags
                            </label>
                            {toggles.setFlags && (
                                <div className="flagEditor">
                                    {flagPairs.map((pair, i) => (
                                        <div key={i} className="flagRow">
                                            <input
                                                className="flagKeyInput"
                                                value={pair.key}
                                                onChange={(e) => {
                                                    const next = [...flagPairs];
                                                    next[i] = { ...pair, key: e.target.value };
                                                    updateFlagPairs(next);
                                                }}
                                                placeholder="flag_name"
                                            />
                                            <select
                                                className="flagValueSelect"
                                                value={pair.value ? "true" : "false"}
                                                onChange={(e) => {
                                                    const next = [...flagPairs];
                                                    next[i] = { ...pair, value: e.target.value === "true" };
                                                    updateFlagPairs(next);
                                                }}
                                            >
                                                <option value="true">true</option>
                                                <option value="false">false</option>
                                            </select>
                                            <button
                                                type="button"
                                                className="flagRemoveBtn"
                                                onClick={() => updateFlagPairs(flagPairs.filter((_, j) => j !== i))}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="flagAddBtn"
                                        onClick={() => updateFlagPairs([...flagPairs, { key: "", value: true }])}
                                    >
                                        + Add Flag
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
