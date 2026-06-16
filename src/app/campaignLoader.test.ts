import { vi, describe, it, expect } from "vitest";

vi.mock("@tauri-apps/api/core", () => ({ invoke: vi.fn() }));

import {
    dirOf,
    normalizeChoice,
    normalizeScene,
    normalizeItems,
    normalizeQuests,
    normalizeMonsters,
    normalizeClasses,
} from "./campaignLoader";

describe("dirOf", () => {
    it("strips filename from a Unix path", () => {
        expect(dirOf("/home/user/campaign/manifest.json")).toBe("/home/user/campaign");
    });

    it("strips filename from a Windows path", () => {
        expect(dirOf("C:\\Users\\user\\campaign\\manifest.json")).toBe("C:\\Users\\user\\campaign");
    });

    it("handles a bare filename with no directory", () => {
        expect(dirOf("manifest.json")).toBe("manifest.json");
    });
});

describe("normalizeChoice", () => {
    it("fills missing array fields with empty defaults", () => {
        const result = normalizeChoice({ text: "Go north" });
        expect(result.text).toBe("Go north");
        expect(result.requires_items).toEqual([]);
        expect(result.requires_missing_items).toEqual([]);
        expect(result.add_items).toEqual([]);
        expect(result.remove_items).toEqual([]);
        expect(result.start_quests).toEqual([]);
        expect(result.complete_quests).toEqual([]);
        expect(result.fail_quests).toEqual([]);
    });

    it("fills missing flag maps with empty objects", () => {
        const result = normalizeChoice({});
        expect(result.requires_flags).toEqual({});
        expect(result.set_flags).toEqual({});
    });

    it("generates a UUID for _key", () => {
        const result = normalizeChoice({});
        expect(result._key).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it("each call gets a unique _key", () => {
        const a = normalizeChoice({});
        const b = normalizeChoice({});
        expect(a._key).not.toBe(b._key);
    });

    it("preserves existing values", () => {
        const result = normalizeChoice({
            text: "Fight",
            next_scene: "battle",
            add_items: ["sword"],
            set_flags: { fought: true },
        });
        expect(result.text).toBe("Fight");
        expect(result.next_scene).toBe("battle");
        expect(result.add_items).toEqual(["sword"]);
        expect(result.set_flags).toEqual({ fought: true });
    });

    it("defaults missing text to empty string", () => {
        expect(normalizeChoice({}).text).toBe("");
    });
});

describe("normalizeScene", () => {
    it("uses the id as title when title is absent", () => {
        const result = normalizeScene("intro", { text: "You awaken." });
        expect(result.title).toBe("intro");
    });

    it("uses explicit title when provided", () => {
        const result = normalizeScene("intro", { title: "A New Beginning", text: "" });
        expect(result.title).toBe("A New Beginning");
    });

    it("defaults missing text to empty string", () => {
        const result = normalizeScene("intro", {});
        expect(result.text).toBe("");
    });

    it("normalizes choices recursively", () => {
        const result = normalizeScene("intro", {
            choices: [{ text: "Leave", next_scene: "outside" }],
        });
        expect(result.choices).toHaveLength(1);
        expect(result.choices[0].text).toBe("Leave");
        expect(result.choices[0].requires_items).toEqual([]);
    });

    it("defaults to empty choices array", () => {
        const result = normalizeScene("intro", {});
        expect(result.choices).toEqual([]);
    });
});

describe("normalizeItems", () => {
    it("converts object map to array", () => {
        const result = normalizeItems({
            sword: { name: "Sword", description: "Sharp" },
            shield: { name: "Shield", description: "Sturdy" },
        });
        expect(result).toHaveLength(2);
        expect(result.find((i) => i.id === "sword")?.name).toBe("Sword");
    });

    it("falls back to id when name is absent", () => {
        const result = normalizeItems({ key_item: { description: "A mysterious key" } });
        expect(result[0].name).toBe("key_item");
    });

    it("defaults missing description to empty string", () => {
        const result = normalizeItems({ gem: { name: "Gem" } });
        expect(result[0].description).toBe("");
    });

    it("returns empty array for empty input", () => {
        expect(normalizeItems({})).toEqual([]);
    });
});

describe("normalizeQuests", () => {
    it("converts object map to array", () => {
        const result = normalizeQuests({
            main_quest: { name: "The Journey", description: "Begin the journey" },
        });
        expect(result[0].id).toBe("main_quest");
        expect(result[0].name).toBe("The Journey");
    });

    it("falls back to id when name is absent", () => {
        const result = normalizeQuests({ side_quest: {} });
        expect(result[0].name).toBe("side_quest");
    });
});

describe("normalizeMonsters", () => {
    it("converts object map to array with defaults", () => {
        const result = normalizeMonsters({ goblin: { name: "Goblin" } });
        expect(result[0].id).toBe("goblin");
        expect(result[0].hp).toBe(0);
        expect(result[0].armor_class).toBe(0);
        expect(result[0].initiative).toBe(0);
        expect(result[0].attack_bonus).toBe(0);
        expect(result[0].damage).toBe(0);
        expect(result[0].spells).toEqual([]);
    });

    it("preserves provided stat values", () => {
        const result = normalizeMonsters({
            dragon: { name: "Dragon", hp: 120, armor_class: 18, attack_bonus: 8, damage: 15 },
        });
        expect(result[0].hp).toBe(120);
        expect(result[0].armor_class).toBe(18);
        expect(result[0].attack_bonus).toBe(8);
    });

    it("preserves asset field", () => {
        const result = normalizeMonsters({ troll: { name: "Troll", asset: "troll.png" } });
        expect(result[0].asset).toBe("troll.png");
    });
});

describe("normalizeClasses", () => {
    it("extracts embedded spells into a global registry", () => {
        const { classes, spells } = normalizeClasses({
            warrior: {
                name: "Warrior",
                spells: [{ id: "slash", name: "Slash", type: "damage", power: 4 }],
            },
        });
        expect(spells).toHaveLength(1);
        expect(spells[0].id).toBe("slash");
        expect(classes[0].spells).toEqual(["slash"]);
    });

    it("deduplicates the same spell shared across classes", () => {
        const sharedSpell = { id: "fire_bolt", name: "Fire Bolt", type: "damage", power: 3 };
        const { classes, spells } = normalizeClasses({
            mage: { name: "Mage", spells: [sharedSpell] },
            wizard: { name: "Wizard", spells: [sharedSpell] },
        });
        expect(spells).toHaveLength(1);
        expect(classes.find((c) => c.id === "mage")?.spells).toContain("fire_bolt");
        expect(classes.find((c) => c.id === "wizard")?.spells).toContain("fire_bolt");
    });

    it("applies default stats when absent", () => {
        const { classes } = normalizeClasses({ rogue: { name: "Rogue" } });
        expect(classes[0].stats.strength).toBe(10);
        expect(classes[0].combat.armor_class).toBe(10);
        expect(classes[0].base_hp).toBe(8);
    });

    it("merges partial stats over defaults", () => {
        const { classes } = normalizeClasses({
            barbarian: { name: "Barbarian", stats: { strength: 18 }, combat: { armor_class: 14 } },
        });
        expect(classes[0].stats.strength).toBe(18);
        expect(classes[0].stats.dexterity).toBe(10);
        expect(classes[0].combat.armor_class).toBe(14);
        expect(classes[0].combat.attack_stat).toBe("strength");
    });

    it("returns empty arrays for empty input", () => {
        const { classes, spells } = normalizeClasses({});
        expect(classes).toEqual([]);
        expect(spells).toEqual([]);
    });
});
