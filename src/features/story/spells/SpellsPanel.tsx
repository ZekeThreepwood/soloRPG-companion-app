import { useState } from "react";
import { useStoryStore } from "../../../app/storyStore";
import type { Spell } from "../../../types/story";
import "./SpellsPanel.css";

const SPELL_STATS = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];

function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9\s_]/g, "").trim().replace(/\s+/g, "_");
}

type View = "table" | "create" | "edit";

export function SpellsPanel() {
    const spells = useStoryStore((s) => s.spells);
    const classes = useStoryStore((s) => s.classes);
    const addSpell = useStoryStore((s) => s.addSpell);
    const replaceSpell = useStoryStore((s) => s.replaceSpell);
    const deleteSpell = useStoryStore((s) => s.deleteSpell);
    const replaceCharacterClass = useStoryStore((s) => s.replaceCharacterClass);

    const [view, setView] = useState<View>("table");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [type, setType] = useState<"damage" | "heal">("damage");
    const [stat, setStat] = useState("intelligence");
    const [power, setPower] = useState(3);
    const [attackBonus, setAttackBonus] = useState<number | "">(2);
    const [assignedClasses, setAssignedClasses] = useState<string[]>([]);
    const [nameError, setNameError] = useState("");

    function classesWithSpell(spellId: string): string[] {
        return classes.filter((c) => c.spells.includes(spellId)).map((c) => c.id);
    }

    function openCreate() {
        setName(""); setType("damage"); setStat("intelligence");
        setPower(3); setAttackBonus(2); setAssignedClasses([]);
        setNameError(""); setEditingId(null); setView("create");
    }

    function openEdit(spell: Spell) {
        setName(spell.name); setType(spell.type as "damage" | "heal");
        setStat(spell.stat ?? "intelligence"); setPower(spell.power);
        setAttackBonus(spell.attack_bonus ?? "");
        setAssignedClasses(classesWithSpell(spell.id));
        setNameError(""); setEditingId(spell.id); setView("edit");
    }

    function handleCancel() { setView("table"); setEditingId(null); }

    function handleSave() {
        if (!name.trim()) { setNameError("Name is required"); return; }
        const spellId = editingId ?? slugify(name);
        const spell: Spell = {
            id: spellId,
            name: name.trim(),
            type,
            stat,
            power,
            attack_bonus: attackBonus !== "" ? attackBonus : undefined,
        };

        if (view === "create") addSpell(spell);
        else if (editingId) replaceSpell(editingId, spell);

        // Sync class assignments: add/remove this spell from each class
        for (const cls of classes) {
            const hasSpell = cls.spells.includes(spellId);
            const shouldHave = assignedClasses.includes(cls.id);
            if (hasSpell === shouldHave) continue;
            const updated = shouldHave
                ? { ...cls, spells: [...cls.spells, spellId] }
                : { ...cls, spells: cls.spells.filter((s) => s !== spellId) };
            replaceCharacterClass(cls.id, updated);
        }

        setView("table"); setEditingId(null);
    }

    function toggleClass(classId: string) {
        setAssignedClasses((prev) =>
            prev.includes(classId) ? prev.filter((c) => c !== classId) : [...prev, classId]
        );
    }

    if (view === "create" || view === "edit") {
        return (
            <div className="spellForm">
                <div className="spellFormHeader">
                    <h3 className="spellFormTitle">{view === "create" ? "New Spell" : "Edit Spell"}</h3>
                    <div className="spellFormActions">
                        <button type="button" className="entityBtnSecondary" onClick={handleCancel}>Cancel</button>
                        <button type="button" className="entityBtnPrimary" onClick={handleSave}>Save Spell</button>
                    </div>
                </div>

                <div className="spellFormBody">
                    <div className="spellFormGroup">
                        <label className="spellFieldLabel">Name <span className="spellFieldRequired">*</span></label>
                        <input
                            className={`spellFieldInput ${nameError ? "spellFieldInputError" : ""}`}
                            value={name}
                            onChange={(e) => { setName(e.target.value); setNameError(""); }}
                            placeholder="e.g. Fire Bolt"
                            autoFocus
                        />
                        {nameError && <span className="spellFieldErrorMsg">{nameError}</span>}
                        {name.trim() && (
                            <span className="spellFieldHint">ref: <code className="spellFieldCode">{slugify(name)}</code></span>
                        )}
                    </div>

                    <div className="spellFormRow">
                        <div className="spellFormGroup">
                            <label className="spellFieldLabel">Type</label>
                            <select
                                className="spellFieldSelect"
                                value={type}
                                onChange={(e) => setType(e.target.value as "damage" | "heal")}
                            >
                                <option value="damage">Damage</option>
                                <option value="heal">Heal</option>
                            </select>
                        </div>
                        <div className="spellFormGroup">
                            <label className="spellFieldLabel">Stat</label>
                            <select
                                className="spellFieldSelect"
                                value={stat}
                                onChange={(e) => setStat(e.target.value)}
                            >
                                {SPELL_STATS.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="spellFormGroup">
                            <label className="spellFieldLabel">Power</label>
                            <input
                                className="spellFieldInput spellFieldInputNarrow"
                                type="number" min={1} max={20}
                                value={power}
                                onChange={(e) => setPower(Number(e.target.value))}
                            />
                        </div>
                        {type === "damage" && (
                            <div className="spellFormGroup">
                                <label className="spellFieldLabel">Atk Bonus</label>
                                <input
                                    className="spellFieldInput spellFieldInputNarrow"
                                    type="number" min={-5} max={10}
                                    value={attackBonus}
                                    onChange={(e) => setAttackBonus(e.target.value === "" ? "" : Number(e.target.value))}
                                />
                            </div>
                        )}
                    </div>

                    {classes.length > 0 && (
                        <div className="spellFormSection">
                            <span className="spellFormSectionLabel">Assign to classes</span>
                            <div className="spellClassList">
                                {classes.map((cls) => (
                                    <label key={cls.id} className="spellClassOption">
                                        <input
                                            type="checkbox"
                                            checked={assignedClasses.includes(cls.id)}
                                            onChange={() => toggleClass(cls.id)}
                                        />
                                        <span className="spellClassName">{cls.name}</span>
                                        <span className="spellClassMeta">HP {cls.base_hp} · AC {cls.combat.armor_class}</span>
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
        <div className="spellsSection">
            <div className="spellsHeader">
                <span className="entitySectionCount">
                    {spells.length > 0 ? `${spells.length} ${spells.length === 1 ? "spell" : "spells"}` : "Spells"}
                </span>
                <button type="button" className="entityAddBtn" onClick={openCreate}>+ Add Spell</button>
            </div>

            {spells.length === 0 ? (
                <div className="entityEmpty">
                    <p className="entityEmptyHint">No spells yet. Spells are loaded from a campaign's classes.json or can be created here and assigned to classes.</p>
                </div>
            ) : (
                <table className="spellsTable">
                    <thead>
                        <tr>
                            <th className="spellsTh spellsThRef">Ref</th>
                            <th className="spellsTh spellsThName">Name</th>
                            <th className="spellsTh spellsThType">Type</th>
                            <th className="spellsTh spellsThStat">Stat</th>
                            <th className="spellsTh spellsThStat">Power</th>
                            <th className="spellsTh spellsThStat">Atk</th>
                            <th className="spellsTh">Classes</th>
                            <th className="spellsTh spellsThActions" />
                        </tr>
                    </thead>
                    <tbody>
                        {spells.map((spell) => {
                            const owningClasses = classesWithSpell(spell.id);
                            return (
                                <tr key={spell.id} className="spellsRow">
                                    <td className="spellsTd spellsRef">{spell.id}</td>
                                    <td className="spellsTd spellsName">{spell.name}</td>
                                    <td className="spellsTd">
                                        <span className={`spellsTypeBadge spellsType-${spell.type}`}>{spell.type}</span>
                                    </td>
                                    <td className="spellsTd spellsStat">{spell.stat ?? "—"}</td>
                                    <td className="spellsTd spellsStat">{spell.power}</td>
                                    <td className="spellsTd spellsStat">{spell.attack_bonus != null ? `+${spell.attack_bonus}` : "—"}</td>
                                    <td className="spellsTd spellsClasses">
                                        {owningClasses.length === 0 ? (
                                            <span className="spellsNone">—</span>
                                        ) : (
                                            owningClasses.map((cid) => {
                                                const cls = classes.find((c) => c.id === cid);
                                                return (
                                                    <span key={cid} className="spellsClassTag">{cls?.name ?? cid}</span>
                                                );
                                            })
                                        )}
                                    </td>
                                    <td className="spellsTd spellsActions">
                                        <div className="itemTableRowActions">
                                            <button type="button" className="entityCardBtn" onClick={() => openEdit(spell)}>Edit</button>
                                            <button type="button" className="entityCardBtnDanger" onClick={() => deleteSpell(spell.id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}
