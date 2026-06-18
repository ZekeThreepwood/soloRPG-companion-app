import { useState } from "react";
import { useStoryStore } from "../../../app/storyStore";
import type { CharacterClass, ClassStats, ClassCombat } from "../../../types/story";
import { AssetPickerInput } from "../../../components/ui/AssetPickerInput";
import "./ClassesPanel.css";

const STATS: Array<keyof ClassStats> = [
    "strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma",
];

const STAT_LABELS: Record<keyof ClassStats, string> = {
    strength: "STR", dexterity: "DEX", constitution: "CON",
    intelligence: "INT", wisdom: "WIS", charisma: "CHA",
};

const ATTACK_STATS = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];

function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9\s_]/g, "").trim().replace(/\s+/g, "_");
}

function emptyStats(): ClassStats {
    return { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 };
}

function emptyCombat(): ClassCombat {
    return { armor_class: 10, attack_stat: "strength", attack_bonus: 0, damage: 2 };
}

type View = "table" | "create" | "edit";

export function ClassesPanel() {
    const classes = useStoryStore((s) => s.classes);
    const spells = useStoryStore((s) => s.spells);
    const addCharacterClass = useStoryStore((s) => s.addCharacterClass);
    const replaceCharacterClass = useStoryStore((s) => s.replaceCharacterClass);
    const deleteCharacterClass = useStoryStore((s) => s.deleteCharacterClass);

    const [view, setView] = useState<View>("table");
    const [editingId, setEditingId] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [asset, setAsset] = useState("");
    const [baseHp, setBaseHp] = useState(8);
    const [stats, setStats] = useState<ClassStats>(emptyStats());
    const [combat, setCombat] = useState<ClassCombat>(emptyCombat());
    const [selectedSpells, setSelectedSpells] = useState<string[]>([]);
    const [nameError, setNameError] = useState("");

    function openCreate() {
        setName(""); setDescription(""); setAsset(""); setBaseHp(8);
        setStats(emptyStats()); setCombat(emptyCombat());
        setSelectedSpells([]); setNameError(""); setEditingId(null);
        setView("create");
    }

    function openEdit(cls: CharacterClass) {
        setName(cls.name); setDescription(cls.description); setAsset(cls.asset ?? ""); setBaseHp(cls.base_hp);
        setStats({ ...cls.stats }); setCombat({ ...cls.combat });
        setSelectedSpells([...cls.spells]); setNameError(""); setEditingId(cls.id);
        setView("edit");
    }

    function handleCancel() { setView("table"); setEditingId(null); }

    function handleSave() {
        if (!name.trim()) { setNameError("Name is required"); return; }
        const cls: CharacterClass = {
            id: editingId ?? slugify(name),
            name: name.trim(),
            description: description.trim(),
            asset: asset.trim() || undefined,
            base_hp: baseHp,
            stats,
            combat,
            spells: selectedSpells,
            inventory: [],
        };
        if (view === "create") addCharacterClass(cls);
        else if (editingId) replaceCharacterClass(editingId, cls);
        setView("table"); setEditingId(null);
    }

    function setStat(key: keyof ClassStats, val: number) {
        setStats((prev) => ({ ...prev, [key]: val }));
    }

    function setCombatField(key: keyof ClassCombat, val: string | number) {
        setCombat((prev) => ({ ...prev, [key]: val }));
    }

    function toggleSpell(spellId: string) {
        setSelectedSpells((prev) =>
            prev.includes(spellId) ? prev.filter((s) => s !== spellId) : [...prev, spellId]
        );
    }

    if (view === "create" || view === "edit") {
        return (
            <div className="classForm">
                <div className="classFormHeader">
                    <h3 className="classFormTitle">{view === "create" ? "New Class" : "Edit Class"}</h3>
                    <div className="classFormActions">
                        <button type="button" className="entityBtnSecondary" onClick={handleCancel}>Cancel</button>
                        <button type="button" className="entityBtnPrimary" onClick={handleSave}>Save Class</button>
                    </div>
                </div>

                <div className="classFormBody">
                    <div className="classFormRow">
                        <div className="classFormGroup classFormGroupGrow">
                            <label className="classFieldLabel">Name <span className="classFieldRequired">*</span></label>
                            <input
                                className={`classFieldInput ${nameError ? "classFieldInputError" : ""}`}
                                value={name}
                                onChange={(e) => { setName(e.target.value); setNameError(""); }}
                                placeholder="e.g. Ranger"
                                autoFocus
                            />
                            {nameError && <span className="classFieldErrorMsg">{nameError}</span>}
                            {name.trim() && (
                                <span className="classFieldHint">ref: <code className="classFieldCode">{slugify(name)}</code></span>
                            )}
                        </div>
                        <div className="classFormGroup">
                            <label className="classFieldLabel">Base HP</label>
                            <input
                                className="classFieldInput classFieldInputNarrow"
                                type="number" min={1} max={30}
                                value={baseHp}
                                onChange={(e) => setBaseHp(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="classFormGroup">
                        <label className="classFieldLabel">Description</label>
                        <textarea
                            className="classFieldTextarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What defines this class?"
                            rows={2}
                        />
                    </div>

                    <div className="classFormGroup">
                        <label className="classFieldLabel">Asset</label>
                        <AssetPickerInput
                            value={asset}
                            onChange={setAsset}
                            placeholder="campaign://assets/characters/warrior.png"
                        />
                    </div>

                    <div className="classFormSection">
                        <span className="classFormSectionLabel">Stats</span>
                        <div className="classStatsGrid">
                            {STATS.map((key) => (
                                <div key={key} className="classStatField">
                                    <label className="classStatLabel">{STAT_LABELS[key]}</label>
                                    <input
                                        className="classStatInput"
                                        type="number" min={1} max={20}
                                        value={stats[key]}
                                        onChange={(e) => setStat(key, Number(e.target.value))}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="classFormSection">
                        <span className="classFormSectionLabel">Combat</span>
                        <div className="classCombatGrid">
                            <div className="classFormGroup">
                                <label className="classFieldLabel">Armor Class</label>
                                <input
                                    className="classFieldInput classFieldInputNarrow"
                                    type="number" min={1} max={20}
                                    value={combat.armor_class}
                                    onChange={(e) => setCombatField("armor_class", Number(e.target.value))}
                                />
                            </div>
                            <div className="classFormGroup">
                                <label className="classFieldLabel">Attack Stat</label>
                                <select
                                    className="classFieldSelect"
                                    value={combat.attack_stat}
                                    onChange={(e) => setCombatField("attack_stat", e.target.value)}
                                >
                                    {ATTACK_STATS.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="classFormGroup">
                                <label className="classFieldLabel">Attack Bonus</label>
                                <input
                                    className="classFieldInput classFieldInputNarrow"
                                    type="number" min={-5} max={10}
                                    value={combat.attack_bonus}
                                    onChange={(e) => setCombatField("attack_bonus", Number(e.target.value))}
                                />
                            </div>
                            <div className="classFormGroup">
                                <label className="classFieldLabel">Damage</label>
                                <input
                                    className="classFieldInput classFieldInputNarrow"
                                    type="number" min={1} max={20}
                                    value={combat.damage}
                                    onChange={(e) => setCombatField("damage", Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    {spells.length > 0 && (
                        <div className="classFormSection">
                            <span className="classFormSectionLabel">Spells</span>
                            <div className="classSpellList">
                                {spells.map((spell) => (
                                    <label key={spell.id} className="classSpellOption">
                                        <input
                                            type="checkbox"
                                            checked={selectedSpells.includes(spell.id)}
                                            onChange={() => toggleSpell(spell.id)}
                                        />
                                        <span className="classSpellName">{spell.name}</span>
                                        <span className="classSpellMeta">{spell.type} · {spell.stat ?? "—"} · {spell.power}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="classesSection">
            <div className="classesHeader">
                <span className="entitySectionCount">
                    {classes.length > 0 ? `${classes.length} ${classes.length === 1 ? "class" : "classes"}` : "Classes"}
                </span>
                <button type="button" className="entityAddBtn" onClick={openCreate}>+ Add Class</button>
            </div>

            {classes.length === 0 ? (
                <div className="entityEmpty">
                    <p className="entityEmptyHint">No classes yet. Load a campaign with a classes.json or create one from scratch.</p>
                </div>
            ) : (
                <table className="classesTable">
                    <thead>
                        <tr>
                            <th className="classesThRef">Ref</th>
                            <th className="classesTh">Name</th>
                            <th className="classesThStat">HP</th>
                            <th className="classesThStat">AC</th>
                            <th className="classesThStat">Atk</th>
                            <th className="classesThStat">Dmg</th>
                            <th className="classesTh">Spells</th>
                            <th className="classesThActions" />
                        </tr>
                    </thead>
                    <tbody>
                        {classes.map((cls) => (
                            <tr key={cls.id} className="classesRow">
                                <td className="classesTd classesRef">{cls.id}</td>
                                <td className="classesTd classesName">{cls.name}</td>
                                <td className="classesTd classesStat">{cls.base_hp}</td>
                                <td className="classesTd classesStat">{cls.combat.armor_class}</td>
                                <td className="classesTd classesStat">+{cls.combat.attack_bonus}</td>
                                <td className="classesTd classesStat">{cls.combat.damage}</td>
                                <td className="classesTd classesSpells">
                                    {cls.spells.length === 0 ? (
                                        <span className="classesNone">—</span>
                                    ) : (
                                        cls.spells.map((sid) => {
                                            const spell = spells.find((s) => s.id === sid);
                                            return (
                                                <span key={sid} className="classesSpellTag">
                                                    {spell?.name ?? sid}
                                                </span>
                                            );
                                        })
                                    )}
                                </td>
                                <td className="classesTd classesActions">
                                    <div className="itemTableRowActions">
                                        <button type="button" className="entityCardBtn" onClick={() => openEdit(cls)}>Edit</button>
                                        <button type="button" className="entityCardBtnDanger" onClick={() => deleteCharacterClass(cls.id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
