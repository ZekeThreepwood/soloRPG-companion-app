import { useStoryStore } from "../../../app/storyStore";
import "./MonstersPanel.css";

export function MonstersPanel() {
    const monsters = useStoryStore((s) => s.monsters);

    if (monsters.length === 0) {
        return (
            <div className="monstersEmpty">
                <p className="monstersEmptyHint">
                    No monsters loaded. Add a <code>monster_definitions.json</code> to your
                    campaign folder and reload to populate this list.
                </p>
            </div>
        );
    }

    return (
        <div className="monstersSection">
            <div className="monstersHeader">
                <span className="monstersCount">
                    {monsters.length} {monsters.length === 1 ? "monster" : "monsters"}
                </span>
            </div>

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
                                        <span key={s.id} className="monstersSpellTag">
                                            {s.name}
                                        </span>
                                    ))
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
