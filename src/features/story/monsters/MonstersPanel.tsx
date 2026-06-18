import { useState } from "react";
import { useStoryStore } from "../../../app/storyStore";
import type { Monster, Spell } from "../../../types/story";
import { AssetPickerInput } from "../../../components/ui/AssetPickerInput";
import "./MonstersPanel.css";

function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9\s_]/g, "").trim().replace(/\s+/g, "_");
}

type View = "table" | "create" | "edit";

const EMPTY_STATS = { hp: 10, armor_class: 10, initiative: 0, attack_bonus: 0, damage: 4 };

export function MonstersPanel() {
    const monsters = useStoryStore((s) => s.monsters);
    const spells = useStoryStore((s) => s.spells);
    const addMonster = useStoryStore((s) => s.addMonster);
    const replaceMonster = useStoryStore((s) => s.replaceMonster);
    const deleteMonster = useStoryStore((s) => s.deleteMonster);

    const [view, setView] = useState<View>("table");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [asset, setAsset] = useState("");
    const [hp, setHp] = useState(10);
    const [ac, setAc] = useState(10);
    const [initiative, setInitiative] = useState(0);
    const [attackBonus, setAttackBonus] = useState(0);
    const [damage, setDamage] = useState(4);
    const [assignedSpells, setAssignedSpells] = useState<string[]>([]);
    const [nameError, setNameError] = useState("");

    function openCreate() {
        setName(""); setAsset("");
        setHp(EMPTY_STATS.hp); setAc(EMPTY_STATS.armor_class);
        setInitiative(EMPTY_STATS.initiative); setAttackBonus(EMPTY_STATS.attack_bonus);
        setDamage(EMPTY_STATS.damage); setAssignedSpells([]);
        setNameError(""); setEditingId(null); setView("create");
    }

    function openEdit(m: Monster) {
        setName(m.name); setAsset(m.asset ?? "");
        setHp(m.hp); setAc(m.armor_class);
        setInitiative(m.initiative); setAttackBonus(m.attack_bonus);
        setDamage(m.damage);
        setAssignedSpells(m.spells.map((s) => (typeof s === "string" ? s : (s as Spell).id)));
        setNameError(""); setEditingId(m.id); setView("edit");
    }

    function handleSave() {
        if (!name.trim()) { setNameError("Name is required"); return; }
        const id = editingId ?? slugify(name);
        const spellObjects: Spell[] = assignedSpells
            .map((sid) => spells.find((s) => s.id === sid))
            .filter(Boolean) as Spell[];

        const monster: Monster = {
            id, name: name.trim(),
            asset: asset.trim() || undefined,
            hp, armor_class: ac, initiative, attack_bonus: attackBonus, damage,
            spells: spellObjects,
        };

        if (view === "create") addMonster(monster);
        else if (editingId) replaceMonster(editingId, monster);

        setView("table"); setEditingId(null);
    }

    function toggleSpell(spellId: string) {
        setAssignedSpells((prev) =>
            prev.includes(spellId) ? prev.filter((s) => s !== spellId) : [...prev, spellId]
        );
    }

    if (view === "create" || view === "edit") {
        return (
            <div className="monsterForm">
                <div className="monsterFormHeader">
                    <h3 className="monsterFormTitle">{view === "create" ? "New Monster" : "Edit Monster"}</h3>
                    <div className="monsterFormActions">
                        <button type="button" className="entityBtnSecondary" onClick={() => setView("table")}>Cancel</button>
                        <button type="button" className="entityBtnPrimary" onClick={handleSave}>Save Monster</button>
                    </div>
                </div>

                <div className="monsterFormBody">
                    <div className="monsterFormGroup">
                        <label className="monsterFieldLabel">Name <span className="monsterFieldRequired">*</span></label>
                        <input
                            className={`monsterFieldInput ${nameError ? "monsterFieldInputError" : ""}`}
                            value={name} autoFocus
                            onChange={(e) => { setName(e.target.value); setNameError(""); }}
                            placeholder="e.g. Forest Troll"
                        />
                        {nameError && <span className="monsterFieldErrorMsg">{nameError}</span>}
                        {name.trim() && (
                            <span className="monsterFieldHint">ref: <code className="monsterFieldCode">{editingId ?? slugify(name)}</code></span>
                        )}
                    </div>

                    <div className="monsterFormGroup">
                        <label className="monsterFieldLabel">Asset</label>
                        <AssetPickerInput
                            value={asset}
                            onChange={setAsset}
                            placeholder="campaign://assets/monsters/troll.png"
                        />
                    </div>

                    <div className="monsterFormSection">
                        <span className="monsterFormSectionLabel">Combat Stats</span>
                        <div className="monsterStatsGrid">
                            {([
                                ["HP", hp, setHp],
                                ["AC", ac, setAc],
                                ["Initiative", initiative, setInitiative],
                                ["Atk Bonus", attackBonus, setAttackBonus],
                                ["Damage", damage, setDamage],
                            ] as [string, number, (v: number) => void][]).map(([label, val, setter]) => (
                                <div key={label} className="monsterStatField">
                                    <span className="monsterStatLabel">{label}</span>
                                    <input
                                        type="number" className="monsterStatInput"
                                        value={val}
                                        onChange={(e) => setter(parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {spells.length > 0 && (
                        <div className="monsterFormSection">
                            <span className="monsterFormSectionLabel">Spells</span>
                            <div className="monsterSpellList">
                                {spells.map((s) => (
                                    <label key={s.id} className="monsterSpellOption">
                                        <input type="checkbox"
                                            checked={assignedSpells.includes(s.id)}
                                            onChange={() => toggleSpell(s.id)}
                                        />
                                        <span className="monsterSpellName">{s.name}</span>
                                        <span className="monsterSpellMeta">{s.type} · pwr {s.power}</span>
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
        <div className="monstersSection">
            <div className="monstersHeader">
                <span className="monstersCount">
                    {monsters.length > 0 ? `${monsters.length} ${monsters.length === 1 ? "monster" : "monsters"}` : "Monsters"}
                </span>
                <button type="button" className="entityAddBtn" onClick={openCreate}>+ Add Monster</button>
            </div>

            {monsters.length === 0 ? (
                <div className="monstersEmpty">
                    <p className="monstersEmptyHint">
                        No monsters yet. Add one here or load a campaign with a <code>monster_definitions.json</code>.
                    </p>
                </div>
            ) : (
                <table className="monstersTable">
                    <thead>
                        <tr>
                            <th className="monstersTh monstersThRef">Ref</th>
                            <th className="monstersTh monstersThName">Name</th>
                            <th className="monstersTh monstersThAsset">Asset</th>
                            <th className="monstersTh monstersThStat">HP</th>
                            <th className="monstersTh monstersThStat">AC</th>
                            <th className="monstersTh monstersThStat">Init</th>
                            <th className="monstersTh monstersThStat">Atk</th>
                            <th className="monstersTh monstersThStat">Dmg</th>
                            <th className="monstersTh">Spells</th>
                            <th className="monstersTh monstersThActions" />
                        </tr>
                    </thead>
                    <tbody>
                        {monsters.map((m) => (
                            <tr key={m.id} className="monstersRow">
                                <td className="monstersTd monstersRef">{m.id}</td>
                                <td className="monstersTd monstersName">{m.name}</td>
                                <td className="monstersTd monstersAsset">{m.asset ?? <span className="monstersNone">—</span>}</td>
                                <td className="monstersTd monstersStat">{m.hp}</td>
                                <td className="monstersTd monstersStat">{m.armor_class}</td>
                                <td className="monstersTd monstersStat">{m.initiative >= 0 ? `+${m.initiative}` : m.initiative}</td>
                                <td className="monstersTd monstersStat">{m.attack_bonus >= 0 ? `+${m.attack_bonus}` : m.attack_bonus}</td>
                                <td className="monstersTd monstersStat">{m.damage}</td>
                                <td className="monstersTd monstersSpells">
                                    {m.spells.length === 0 ? (
                                        <span className="monstersNone">—</span>
                                    ) : (
                                        m.spells.map((s) => (
                                            <span key={typeof s === "string" ? s : s.id} className="monstersSpellTag">
                                                {typeof s === "string" ? s : s.name}
                                            </span>
                                        ))
                                    )}
                                </td>
                                <td className="monstersTd monstersActions">
                                    <div className="itemTableRowActions">
                                        <button type="button" className="entityCardBtn" onClick={() => openEdit(m)}>Edit</button>
                                        <button type="button" className="entityCardBtnDanger" onClick={() => deleteMonster(m.id)}>Delete</button>
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
