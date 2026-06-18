import { useState } from "react";
import { useStoryStore } from "../../../app/storyStore";
import { useKnownFlags } from "../../../app/storySelectors";
import { EntitySelect } from "../../../components/ui/EntitySelect";
import type { Choice } from "../../../types/story";
import "./ChoiceEditor.css";

type FlagPair = { key: string; value: boolean };

type Toggles = {
    useAction: boolean;
    useCheck: boolean;
    // Conditions
    requiresItems: boolean;
    requiresMissingItems: boolean;
    requiresFlags: boolean;
    // Effects
    addItems: boolean;
    removeItems: boolean;
    startQuests: boolean;
    completeQuests: boolean;
    failQuests: boolean;
    setFlags: boolean;
    heal: boolean;
    fullHeal: boolean;
};

type ChoiceEditorProps = {
    choice: Choice;
    index: number;
    currentSceneId?: string;
    onChange: (choice: Choice) => void;
    onRemove: () => void;
    canMoveUp: boolean;
    canMoveDown: boolean;
    onMoveUp: () => void;
    onMoveDown: () => void;
};

function pairsFromRecord(record: Record<string, boolean>): FlagPair[] {
    return Object.entries(record).map(([key, value]) => ({ key, value }));
}

function recordFromPairs(pairs: FlagPair[]): Record<string, boolean> {
    const out: Record<string, boolean> = {};
    pairs.forEach(({ key, value }) => { if (key.trim()) out[key.trim()] = value; });
    return out;
}

export function ChoiceEditor({
    choice,
    index,
    currentSceneId,
    onChange,
    onRemove,
    canMoveUp,
    canMoveDown,
    onMoveUp,
    onMoveDown,
}: ChoiceEditorProps) {
    const scenes = useStoryStore((s) => s.scenes);
    const items = useStoryStore((s) => s.items);
    const quests = useStoryStore((s) => s.quests);
    const knownFlags = useKnownFlags();

    const sceneOptions = scenes
        .filter((s) => s.id !== currentSceneId)
        .map((s) => ({ id: s.id, name: s.title }));

    const itemOptions = items.map((i) => ({ id: i.id, name: i.name }));
    const questOptions = quests.map((q) => ({ id: q.id, name: q.name }));

    const [expanded, setExpanded] = useState(true);
    const [toggles, setToggles] = useState<Toggles>({
        useAction: !!choice.action,
        useCheck: !!choice.check,
        requiresItems: choice.requires_items.length > 0,
        requiresMissingItems: choice.requires_missing_items.length > 0,
        requiresFlags: Object.keys(choice.requires_flags).length > 0,
        addItems: choice.add_items.length > 0,
        removeItems: choice.remove_items.length > 0,
        startQuests: choice.start_quests.length > 0,
        completeQuests: choice.complete_quests.length > 0,
        failQuests: choice.fail_quests.length > 0,
        setFlags: Object.keys(choice.set_flags).length > 0,
        heal: !!choice.heal && choice.heal > 0,
        fullHeal: !!choice.full_heal,
    });

    const [requiresFlagPairs, setRequiresFlagPairs] = useState<FlagPair[]>(() =>
        pairsFromRecord(choice.requires_flags)
    );
    const [setFlagPairs, setSetFlagPairs] = useState<FlagPair[]>(() =>
        pairsFromRecord(choice.set_flags)
    );

    const flagDatalistId = `flags-${choice._key}`;

    function update(partial: Partial<Choice>) {
        onChange({ ...choice, ...partial });
    }

    function setToggle(key: keyof Toggles, on: boolean) {
        setToggles((prev) => ({ ...prev, [key]: on }));
        if (!on) {
            switch (key) {
                case "useAction":           update({ action: undefined }); break;
                case "useCheck":            update({ check: undefined }); break;
                case "requiresItems":       update({ requires_items: [] }); break;
                case "requiresMissingItems": update({ requires_missing_items: [] }); break;
                case "requiresFlags":
                    setRequiresFlagPairs([]);
                    update({ requires_flags: {} });
                    break;
                case "addItems":            update({ add_items: [] }); break;
                case "removeItems":         update({ remove_items: [] }); break;
                case "startQuests":         update({ start_quests: [] }); break;
                case "completeQuests":      update({ complete_quests: [] }); break;
                case "failQuests":          update({ fail_quests: [] }); break;
                case "setFlags":
                    setSetFlagPairs([]);
                    update({ set_flags: {} });
                    break;
                case "heal":                update({ heal: undefined }); break;
                case "fullHeal":            update({ full_heal: undefined }); break;
            }
        }
    }

    function updateRequiresFlagPairs(pairs: FlagPair[]) {
        setRequiresFlagPairs(pairs);
        update({ requires_flags: recordFromPairs(pairs) });
    }

    function updateSetFlagPairs(pairs: FlagPair[]) {
        setSetFlagPairs(pairs);
        update({ set_flags: recordFromPairs(pairs) });
    }

    const previewText = choice.text.trim() || `Choice ${index + 1}`;

    return (
        <div className="choiceEditor">
            {/* Datalist shared by both flag editors in this choice */}
            <datalist id={flagDatalistId}>
                {knownFlags.map((f) => <option key={f} value={f} />)}
            </datalist>

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

                    {/* Choice text */}
                    <div className="choiceField">
                        <label className="choiceFieldLabel">Choice Text</label>
                        <input
                            className="choiceInput"
                            value={choice.text}
                            onChange={(e) => update({ text: e.target.value })}
                            placeholder="What the player sees and clicks"
                        />
                    </div>

                    {/* Destination */}
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
                            <select
                                className="choiceInput choiceSelect"
                                value={choice.next_scene ?? ""}
                                onChange={(e) => update({ next_scene: e.target.value || undefined })}
                            >
                                <option value="">
                                    {sceneOptions.length === 0
                                        ? "No other scenes created yet"
                                        : "— select a scene —"}
                                </option>
                                {sceneOptions.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* ABILITY CHECK */}
                    <div className="choiceSection">
                        <div className="choiceToggleRow">
                            <label className="choiceCheckLabel">
                                <input type="checkbox" checked={toggles.useCheck}
                                    onChange={(e) => {
                                        setToggle("useCheck", e.target.checked);
                                        if (e.target.checked) update({ check: { stat: "strength", difficulty: 12, success_scene: "", failure_scene: "" } });
                                    }} />
                                Ability Check
                            </label>
                        </div>
                        {toggles.useCheck && (
                            <div className="choiceCheckEditor">
                                <div className="choiceCheckRow">
                                    <div className="choiceCheckGroup">
                                        <span className="choiceFieldLabel">Stat</span>
                                        <select
                                            className="choiceInput choiceSelect"
                                            value={choice.check?.stat ?? "strength"}
                                            onChange={(e) => update({ check: { ...choice.check!, stat: e.target.value } })}
                                        >
                                            <option value="strength">Strength</option>
                                            <option value="dexterity">Dexterity</option>
                                            <option value="constitution">Constitution</option>
                                            <option value="intelligence">Intelligence</option>
                                            <option value="wisdom">Wisdom</option>
                                            <option value="charisma">Charisma</option>
                                        </select>
                                    </div>
                                    <div className="choiceCheckGroup">
                                        <span className="choiceFieldLabel">DC</span>
                                        <input
                                            type="number" min={1} max={30}
                                            className="choiceInput choiceInputSmall"
                                            value={choice.check?.difficulty ?? 12}
                                            onChange={(e) => update({ check: { ...choice.check!, difficulty: parseInt(e.target.value) || 12 } })}
                                        />
                                    </div>
                                </div>
                                <div className="choiceCheckRow">
                                    <div className="choiceCheckGroup choiceCheckGroupGrow">
                                        <span className="choiceFieldLabel">Success → Scene</span>
                                        <select
                                            className="choiceInput choiceSelect"
                                            value={choice.check?.success_scene ?? ""}
                                            onChange={(e) => update({ check: { ...choice.check!, success_scene: e.target.value } })}
                                        >
                                            <option value="">— select —</option>
                                            {sceneOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="choiceCheckGroup choiceCheckGroupGrow">
                                        <span className="choiceFieldLabel">Failure → Scene</span>
                                        <select
                                            className="choiceInput choiceSelect"
                                            value={choice.check?.failure_scene ?? ""}
                                            onChange={(e) => update({ check: { ...choice.check!, failure_scene: e.target.value } })}
                                        >
                                            <option value="">— select —</option>
                                            {sceneOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CONDITIONS */}
                    <div className="choiceSection">
                        <p className="choiceSectionLabel">Conditions</p>
                        <p className="choiceSectionHint">This choice is hidden unless all checked conditions are met.</p>

                        <div className="choiceToggleRow">
                            <label className="choiceCheckLabel">
                                <input type="checkbox" checked={toggles.requiresItems}
                                    onChange={(e) => setToggle("requiresItems", e.target.checked)} />
                                Player has items
                            </label>
                            {toggles.requiresItems && (
                                <EntitySelect
                                    options={itemOptions}
                                    selected={choice.requires_items}
                                    onChange={(ids) => update({ requires_items: ids })}
                                    noun="item"
                                />
                            )}
                        </div>

                        <div className="choiceToggleRow">
                            <label className="choiceCheckLabel">
                                <input type="checkbox" checked={toggles.requiresMissingItems}
                                    onChange={(e) => setToggle("requiresMissingItems", e.target.checked)} />
                                Player is missing items
                            </label>
                            {toggles.requiresMissingItems && (
                                <EntitySelect
                                    options={itemOptions}
                                    selected={choice.requires_missing_items}
                                    onChange={(ids) => update({ requires_missing_items: ids })}
                                    noun="item"
                                />
                            )}
                        </div>

                        <div className="choiceToggleRow">
                            <label className="choiceCheckLabel">
                                <input type="checkbox" checked={toggles.requiresFlags}
                                    onChange={(e) => setToggle("requiresFlags", e.target.checked)} />
                                Flags match
                            </label>
                            {toggles.requiresFlags && (
                                <FlagEditor
                                    pairs={requiresFlagPairs}
                                    onChange={updateRequiresFlagPairs}
                                    datalistId={flagDatalistId}
                                />
                            )}
                        </div>
                    </div>

                    {/* EFFECTS */}
                    <div className="choiceSection">
                        <p className="choiceSectionLabel">Effects</p>
                        <p className="choiceSectionHint">These happen when the player picks this choice.</p>

                        <div className="choiceToggleRow">
                            <label className="choiceCheckLabel">
                                <input type="checkbox" checked={toggles.addItems}
                                    onChange={(e) => setToggle("addItems", e.target.checked)} />
                                Add items to inventory
                            </label>
                            {toggles.addItems && (
                                <EntitySelect
                                    options={itemOptions}
                                    selected={choice.add_items}
                                    onChange={(ids) => update({ add_items: ids })}
                                    noun="item"
                                />
                            )}
                        </div>

                        <div className="choiceToggleRow">
                            <label className="choiceCheckLabel">
                                <input type="checkbox" checked={toggles.removeItems}
                                    onChange={(e) => setToggle("removeItems", e.target.checked)} />
                                Remove items from inventory
                            </label>
                            {toggles.removeItems && (
                                <EntitySelect
                                    options={itemOptions}
                                    selected={choice.remove_items}
                                    onChange={(ids) => update({ remove_items: ids })}
                                    noun="item"
                                />
                            )}
                        </div>

                        <div className="choiceToggleRow">
                            <label className="choiceCheckLabel">
                                <input type="checkbox" checked={toggles.startQuests}
                                    onChange={(e) => setToggle("startQuests", e.target.checked)} />
                                Start quests
                            </label>
                            {toggles.startQuests && (
                                <EntitySelect
                                    options={questOptions}
                                    selected={choice.start_quests}
                                    onChange={(ids) => update({ start_quests: ids })}
                                    noun="quest"
                                />
                            )}
                        </div>

                        <div className="choiceToggleRow">
                            <label className="choiceCheckLabel">
                                <input type="checkbox" checked={toggles.completeQuests}
                                    onChange={(e) => setToggle("completeQuests", e.target.checked)} />
                                Complete quests
                            </label>
                            {toggles.completeQuests && (
                                <EntitySelect
                                    options={questOptions}
                                    selected={choice.complete_quests}
                                    onChange={(ids) => update({ complete_quests: ids })}
                                    noun="quest"
                                />
                            )}
                        </div>

                        <div className="choiceToggleRow">
                            <label className="choiceCheckLabel">
                                <input type="checkbox" checked={toggles.failQuests}
                                    onChange={(e) => setToggle("failQuests", e.target.checked)} />
                                Fail quests
                            </label>
                            {toggles.failQuests && (
                                <EntitySelect
                                    options={questOptions}
                                    selected={choice.fail_quests}
                                    onChange={(ids) => update({ fail_quests: ids })}
                                    noun="quest"
                                />
                            )}
                        </div>

                        <div className="choiceToggleRow">
                            <label className="choiceCheckLabel">
                                <input type="checkbox" checked={toggles.setFlags}
                                    onChange={(e) => setToggle("setFlags", e.target.checked)} />
                                Set flags
                            </label>
                            {toggles.setFlags && (
                                <FlagEditor
                                    pairs={setFlagPairs}
                                    onChange={updateSetFlagPairs}
                                    datalistId={flagDatalistId}
                                />
                            )}
                        </div>

                        <div className="choiceToggleRow">
                            <label className="choiceCheckLabel">
                                <input type="checkbox" checked={toggles.heal}
                                    onChange={(e) => {
                                        setToggle("heal", e.target.checked);
                                        if (e.target.checked) update({ heal: 1 });
                                    }} />
                                Heal HP
                            </label>
                            {toggles.heal && (
                                <input
                                    type="number"
                                    className="choiceInput choiceInputSmall"
                                    min={1}
                                    value={choice.heal ?? 1}
                                    onChange={(e) => update({ heal: Math.max(1, parseInt(e.target.value) || 1) })}
                                />
                            )}
                        </div>

                        <div className="choiceToggleRow">
                            <label className="choiceCheckLabel">
                                <input type="checkbox" checked={toggles.fullHeal}
                                    onChange={(e) => {
                                        setToggle("fullHeal", e.target.checked);
                                        update({ full_heal: e.target.checked || undefined });
                                    }} />
                                Full heal
                            </label>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}

type FlagEditorProps = {
    pairs: FlagPair[];
    onChange: (pairs: FlagPair[]) => void;
    datalistId: string;
};

function FlagEditor({ pairs, onChange, datalistId }: FlagEditorProps) {
    return (
        <div className="flagEditor">
            {pairs.map((pair, i) => (
                <div key={i} className="flagRow">
                    <input
                        list={datalistId}
                        className="flagKeyInput"
                        value={pair.key}
                        onChange={(e) => {
                            const next = [...pairs];
                            next[i] = { ...pair, key: e.target.value };
                            onChange(next);
                        }}
                        placeholder="flag_name"
                    />
                    <select
                        className="flagValueSelect"
                        value={pair.value ? "true" : "false"}
                        onChange={(e) => {
                            const next = [...pairs];
                            next[i] = { ...pair, value: e.target.value === "true" };
                            onChange(next);
                        }}
                    >
                        <option value="true">true</option>
                        <option value="false">false</option>
                    </select>
                    <button
                        type="button"
                        className="flagRemoveBtn"
                        onClick={() => onChange(pairs.filter((_, j) => j !== i))}
                    >
                        ×
                    </button>
                </div>
            ))}
            <button
                type="button"
                className="flagAddBtn"
                onClick={() => onChange([...pairs, { key: "", value: true }])}
            >
                + Add Flag
            </button>
        </div>
    );
}
