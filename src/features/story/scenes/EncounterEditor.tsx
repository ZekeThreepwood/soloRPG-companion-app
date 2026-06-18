import { useStoryStore } from "../../../app/storyStore";
import { EntitySelect } from "../../../components/ui/EntitySelect";
import type { Encounter } from "../../../types/story";
import "./EncounterEditor.css";

type Props = {
    encounter: Encounter;
    currentSceneId?: string;
    onChange: (encounter: Encounter) => void;
    onRemove: () => void;
};

const EMPTY_ENCOUNTER: Encounter = {
    monster: "",
    win_scene: "",
    lose_scene: "",
};

export function makeEmptyEncounter(): Encounter {
    return { ...EMPTY_ENCOUNTER };
}

type OutcomeKey = "win" | "lose" | "flee";

export function EncounterEditor({ encounter, currentSceneId, onChange, onRemove }: Props) {
    const monsters = useStoryStore((s) => s.monsters);
    const items = useStoryStore((s) => s.items);
    const quests = useStoryStore((s) => s.quests);
    const scenes = useStoryStore((s) => s.scenes);

    const monsterOptions = monsters.map((m) => ({ id: m.id, name: m.name }));
    const itemOptions = items.map((i) => ({ id: i.id, name: i.name }));
    const questOptions = quests.map((q) => ({ id: q.id, name: q.name }));
    const sceneOptions = scenes
        .filter((s) => s.id !== currentSceneId)
        .map((s) => ({ id: s.id, name: s.title }));

    function set(partial: Partial<Encounter>) {
        onChange({ ...encounter, ...partial });
    }

    function setFlag(outcome: OutcomeKey, key: string, value: boolean | null) {
        const flagKey = `${outcome}_set_flags` as keyof Encounter;
        const current = (encounter[flagKey] as Record<string, boolean>) ?? {};
        if (value === null) {
            const { [key]: _, ...rest } = current;
            set({ [flagKey]: rest });
        } else {
            set({ [flagKey]: { ...current, [key]: value } });
        }
    }

    const hasFlee = encounter.flee_scene !== undefined && encounter.flee_scene !== "";

    return (
        <div className="encounterEditor">
            <div className="encounterEditorHeader">
                <span className="encounterEditorTitle">Combat Encounter</span>
                <button type="button" className="encounterRemoveBtn" onClick={onRemove}>Remove Encounter</button>
            </div>

            <div className="encounterBody">

                {/* Monster */}
                <div className="encounterField">
                    <label className="encounterFieldLabel">Monster <span className="encounterRequired">*</span></label>
                    {monsters.length === 0 ? (
                        <p className="encounterHint">No monsters loaded. Add monsters in the Monsters tab first.</p>
                    ) : (
                        <select
                            className="encounterSelect"
                            value={encounter.monster}
                            onChange={(e) => set({ monster: e.target.value })}
                        >
                            <option value="">— select monster —</option>
                            {monsterOptions.map((m) => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Outcome scenes */}
                <div className="encounterOutcomeRow">
                    <div className="encounterField encounterFieldGrow">
                        <label className="encounterFieldLabel">Win → Scene <span className="encounterRequired">*</span></label>
                        <select className="encounterSelect" value={encounter.win_scene ?? ""}
                            onChange={(e) => set({ win_scene: e.target.value })}>
                            <option value="">— select —</option>
                            {sceneOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="encounterField encounterFieldGrow">
                        <label className="encounterFieldLabel">Lose → Scene <span className="encounterRequired">*</span></label>
                        <select className="encounterSelect" value={encounter.lose_scene ?? ""}
                            onChange={(e) => set({ lose_scene: e.target.value })}>
                            <option value="">— select —</option>
                            {sceneOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Flee */}
                <div className="encounterFleeRow">
                    <label className="encounterCheckLabel">
                        <input type="checkbox" checked={hasFlee}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    set({ flee_scene: "", flee_difficulty: 12 });
                                } else {
                                    const { flee_scene, flee_difficulty, flee_add_items, flee_remove_items,
                                        flee_set_flags, flee_start_quests, flee_complete_quests, flee_fail_quests, ...rest } = encounter;
                                    onChange(rest as Encounter);
                                }
                            }} />
                        Allow Flee
                    </label>
                    {hasFlee && (
                        <>
                            <select className="encounterSelect encounterSelectMid" value={encounter.flee_scene ?? ""}
                                onChange={(e) => set({ flee_scene: e.target.value })}>
                                <option value="">Flee → Scene</option>
                                {sceneOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <div className="encounterFleeDC">
                                <span className="encounterFieldLabel">DC (DEX)</span>
                                <input type="number" min={1} max={30} className="encounterDCInput"
                                    value={encounter.flee_difficulty ?? 12}
                                    onChange={(e) => set({ flee_difficulty: parseInt(e.target.value) || 12 })} />
                            </div>
                        </>
                    )}
                </div>

                {/* Per-outcome effect panels */}
                {(["win", "lose", ...(hasFlee ? ["flee"] : [])] as OutcomeKey[]).map((outcome) => (
                    <OutcomePanel
                        key={outcome}
                        outcome={outcome}
                        encounter={encounter}
                        itemOptions={itemOptions}
                        questOptions={questOptions}
                        onSet={set}
                        onSetFlag={setFlag}
                    />
                ))}
            </div>
        </div>
    );
}

type OutcomePanelProps = {
    outcome: OutcomeKey;
    encounter: Encounter;
    itemOptions: { id: string; name: string }[];
    questOptions: { id: string; name: string }[];
    onSet: (partial: Partial<Encounter>) => void;
    onSetFlag: (outcome: OutcomeKey, key: string, value: boolean | null) => void;
};

const OUTCOME_LABELS: Record<OutcomeKey, string> = { win: "On Win", lose: "On Lose", flee: "On Flee" };
const OUTCOME_COLORS: Record<OutcomeKey, string> = { win: "encounterWin", lose: "encounterLose", flee: "encounterFlee" };

function OutcomePanel({ outcome, encounter, itemOptions, questOptions, onSet, onSetFlag }: OutcomePanelProps) {
    const addKey = `${outcome}_add_items` as keyof Encounter;
    const removeKey = `${outcome}_remove_items` as keyof Encounter;
    const flagKey = `${outcome}_set_flags` as keyof Encounter;
    const startKey = `${outcome}_start_quests` as keyof Encounter;
    const completeKey = `${outcome}_complete_quests` as keyof Encounter;
    const failKey = `${outcome}_fail_quests` as keyof Encounter;

    const flags = (encounter[flagKey] as Record<string, boolean>) ?? {};

    return (
        <div className={`encounterOutcome ${OUTCOME_COLORS[outcome]}`}>
            <p className="encounterOutcomeLabel">{OUTCOME_LABELS[outcome]}</p>

            <div className="encounterOutcomeGrid">
                <div className="encounterEffectGroup">
                    <span className="encounterEffectLabel">Add items</span>
                    <EntitySelect
                        options={itemOptions}
                        selected={(encounter[addKey] as string[]) ?? []}
                        onChange={(ids) => onSet({ [addKey]: ids })}
                        noun="item"
                    />
                </div>
                <div className="encounterEffectGroup">
                    <span className="encounterEffectLabel">Remove items</span>
                    <EntitySelect
                        options={itemOptions}
                        selected={(encounter[removeKey] as string[]) ?? []}
                        onChange={(ids) => onSet({ [removeKey]: ids })}
                        noun="item"
                    />
                </div>
                <div className="encounterEffectGroup">
                    <span className="encounterEffectLabel">Start quests</span>
                    <EntitySelect
                        options={questOptions}
                        selected={(encounter[startKey] as string[]) ?? []}
                        onChange={(ids) => onSet({ [startKey]: ids })}
                        noun="quest"
                    />
                </div>
                <div className="encounterEffectGroup">
                    <span className="encounterEffectLabel">Complete quests</span>
                    <EntitySelect
                        options={questOptions}
                        selected={(encounter[completeKey] as string[]) ?? []}
                        onChange={(ids) => onSet({ [completeKey]: ids })}
                        noun="quest"
                    />
                </div>
                <div className="encounterEffectGroup">
                    <span className="encounterEffectLabel">Fail quests</span>
                    <EntitySelect
                        options={questOptions}
                        selected={(encounter[failKey] as string[]) ?? []}
                        onChange={(ids) => onSet({ [failKey]: ids })}
                        noun="quest"
                    />
                </div>
                <div className="encounterEffectGroup encounterFlagGroup">
                    <span className="encounterEffectLabel">Set flags</span>
                    <div className="encounterFlagList">
                        {Object.entries(flags).map(([k, v]) => (
                            <div key={k} className="encounterFlagRow">
                                <input className="encounterFlagKey" value={k}
                                    onChange={(e) => {
                                        onSetFlag(outcome, k, null);
                                        if (e.target.value.trim()) onSetFlag(outcome, e.target.value.trim(), v);
                                    }}
                                    placeholder="flag_name"
                                />
                                <select className="encounterFlagValue"
                                    value={v ? "true" : "false"}
                                    onChange={(e) => onSetFlag(outcome, k, e.target.value === "true")}>
                                    <option value="true">true</option>
                                    <option value="false">false</option>
                                </select>
                                <button type="button" className="encounterFlagRemove"
                                    onClick={() => onSetFlag(outcome, k, null)}>×</button>
                            </div>
                        ))}
                        <button type="button" className="encounterFlagAdd"
                            onClick={() => onSetFlag(outcome, `${outcome}_flag`, true)}>
                            + flag
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
