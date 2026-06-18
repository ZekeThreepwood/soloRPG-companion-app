import { vi, describe, it, expect } from "vitest";

vi.mock("@tauri-apps/api/core", () => ({ invoke: vi.fn() }));

import {
    serializeChoice,
    serializeEncounter,
    serializeScene,
    buildManifest,
    buildCampaignFile,
    buildItemsFile,
    buildQuestsFile,
    buildMonsterDefinitionsFile,
    buildClassesFile,
} from "./campaignExporter";
import type { Choice, Encounter, Scene, Story } from "../types/story";

function makeChoice(overrides: Partial<Choice> = {}): Choice {
    return {
        _key: "k1",
        text: "Go north",
        requires_items: [],
        requires_missing_items: [],
        requires_flags: {},
        add_items: [],
        remove_items: [],
        start_quests: [],
        complete_quests: [],
        fail_quests: [],
        set_flags: {},
        ...overrides,
    };
}

function makeScene(id: string, overrides: Partial<Scene> = {}): Scene {
    return { id, title: id, text: "Some text.", choices: [], ...overrides };
}

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: "test_campaign",
        title: "Test Campaign",
        version: "1.0",
        start_scene: "intro",
        scenes: [],
        items: [],
        quests: [],
        monsters: [],
        classes: [],
        spells: [],
        ...overrides,
    };
}

// ---------------------------------------------------------------------------
describe("serializeChoice", () => {
    it("strips the internal _key field", () => {
        const result = serializeChoice(makeChoice());
        expect(result).not.toHaveProperty("_key");
    });

    it("includes text", () => {
        expect(serializeChoice(makeChoice({ text: "Enter cave" })).text).toBe("Enter cave");
    });

    it("omits empty arrays", () => {
        const result = serializeChoice(makeChoice());
        expect(result).not.toHaveProperty("add_items");
        expect(result).not.toHaveProperty("requires_items");
        expect(result).not.toHaveProperty("start_quests");
    });

    it("includes non-empty arrays", () => {
        const result = serializeChoice(makeChoice({ add_items: ["sword"], start_quests: ["main"] }));
        expect(result.add_items).toEqual(["sword"]);
        expect(result.start_quests).toEqual(["main"]);
    });

    it("omits empty flag maps", () => {
        const result = serializeChoice(makeChoice());
        expect(result).not.toHaveProperty("set_flags");
        expect(result).not.toHaveProperty("requires_flags");
    });

    it("includes non-empty flag maps", () => {
        const result = serializeChoice(makeChoice({ set_flags: { found_key: true } }));
        expect(result.set_flags).toEqual({ found_key: true });
    });

    it("includes ability check when present", () => {
        const check = { stat: "strength", difficulty: 12, success_scene: "win", failure_scene: "lose" };
        const result = serializeChoice(makeChoice({ check }));
        expect(result.check).toEqual(check);
    });

    it("includes next_scene when set", () => {
        const result = serializeChoice(makeChoice({ next_scene: "forest" }));
        expect(result.next_scene).toBe("forest");
    });

    it("includes action when set", () => {
        const result = serializeChoice(makeChoice({ action: "return_to_main_menu" }));
        expect(result.action).toBe("return_to_main_menu");
    });
});

// ---------------------------------------------------------------------------
describe("serializeEncounter", () => {
    const baseEnc: Encounter = { monster: "wolf", win_scene: "victory", lose_scene: "defeat" };

    it("always includes monster, win_scene, lose_scene", () => {
        const result = serializeEncounter(baseEnc);
        expect(result.monster).toBe("wolf");
        expect(result.win_scene).toBe("victory");
        expect(result.lose_scene).toBe("defeat");
    });

    it("omits flee fields when not set", () => {
        const result = serializeEncounter(baseEnc);
        expect(result).not.toHaveProperty("flee_scene");
        expect(result).not.toHaveProperty("flee_difficulty");
    });

    it("includes flee fields when set", () => {
        const result = serializeEncounter({ ...baseEnc, flee_scene: "run", flee_difficulty: 12 });
        expect(result.flee_scene).toBe("run");
        expect(result.flee_difficulty).toBe(12);
    });

    it("includes win effects when non-empty", () => {
        const result = serializeEncounter({
            ...baseEnc,
            win_add_items: ["trophy"],
            win_set_flags: { wolf_dead: true },
            win_complete_quests: ["hunt"],
        });
        expect(result.win_add_items).toEqual(["trophy"]);
        expect(result.win_set_flags).toEqual({ wolf_dead: true });
        expect(result.win_complete_quests).toEqual(["hunt"]);
    });

    it("omits empty outcome arrays", () => {
        const result = serializeEncounter({ ...baseEnc, win_add_items: [] });
        expect(result).not.toHaveProperty("win_add_items");
    });
});

// ---------------------------------------------------------------------------
describe("serializeScene", () => {
    it("always includes title and text", () => {
        const result = serializeScene(makeScene("intro", { text: "You awaken." }));
        expect(result.title).toBe("intro");
        expect(result.text).toBe("You awaken.");
    });

    it("does NOT include the id (it becomes the dict key)", () => {
        const result = serializeScene(makeScene("intro"));
        expect(result).not.toHaveProperty("id");
    });

    it("includes template when set", () => {
        const result = serializeScene(makeScene("s", { scene_template: "npc_chat" }));
        expect(result.scene_template).toBe("npc_chat");
    });

    it("omits template when not set", () => {
        const result = serializeScene(makeScene("s"));
        expect(result).not.toHaveProperty("scene_template");
    });

    it("includes speaker when set", () => {
        const result = serializeScene(makeScene("s", { speaker: "Old Man" }));
        expect(result.speaker).toBe("Old Man");
    });

    it("includes encounter when present", () => {
        const enc: Encounter = { monster: "goblin", win_scene: "w", lose_scene: "l" };
        const result = serializeScene(makeScene("s", { encounter: enc }));
        expect(result.encounter).toBeDefined();
        expect((result.encounter as Record<string, unknown>).monster).toBe("goblin");
    });

    it("omits choices when empty", () => {
        const result = serializeScene(makeScene("s", { choices: [] }));
        expect(result).not.toHaveProperty("choices");
    });

    it("serializes choices without _key", () => {
        const scene = makeScene("s", { choices: [makeChoice({ text: "Run" })] });
        const result = serializeScene(scene);
        const choices = result.choices as Record<string, unknown>[];
        expect(choices[0]).not.toHaveProperty("_key");
        expect(choices[0].text).toBe("Run");
    });
});

// ---------------------------------------------------------------------------
describe("buildManifest", () => {
    it("produces required manifest fields", () => {
        const story = makeStory({ author: "Zeke", description: "A dark story" });
        const result = buildManifest(story);
        expect(result.id).toBe("test_campaign");
        expect(result.title).toBe("Test Campaign");
        expect(result.start_scene).toBe("intro");
        expect(result.campaign_file).toBe("campaign.json");
        expect(result.items_file).toBe("items.json");
        expect(result.quests_file).toBe("quests.json");
        expect(result.author).toBe("Zeke");
        expect(result.description).toBe("A dark story");
    });

    it("omits author and description when absent", () => {
        const result = buildManifest(makeStory());
        expect(result).not.toHaveProperty("author");
        expect(result).not.toHaveProperty("description");
    });
});

// ---------------------------------------------------------------------------
describe("buildCampaignFile", () => {
    it("produces scenes as a dict keyed by scene id", () => {
        const story = makeStory({ scenes: [makeScene("intro"), makeScene("forest")] });
        const result = buildCampaignFile(story);
        const scenes = result.scenes as Record<string, unknown>;
        expect(Object.keys(scenes)).toEqual(["intro", "forest"]);
    });

    it("scene values do not contain their own id", () => {
        const story = makeStory({ scenes: [makeScene("intro")] });
        const scenes = buildCampaignFile(story).scenes as Record<string, unknown>;
        expect(scenes["intro"]).not.toHaveProperty("id");
    });
});

// ---------------------------------------------------------------------------
describe("buildItemsFile", () => {
    it("produces items as a dict keyed by item id", () => {
        const story = makeStory({ items: [{ id: "sword", name: "Sword", description: "Sharp" }] });
        const result = buildItemsFile(story);
        expect(result["sword"]).toEqual({ name: "Sword", description: "Sharp" });
    });

    it("returns empty object when no items", () => {
        expect(buildItemsFile(makeStory())).toEqual({});
    });
});

// ---------------------------------------------------------------------------
describe("buildQuestsFile", () => {
    it("wraps quests in a quests key", () => {
        const story = makeStory({ quests: [{ id: "main", name: "Main Quest", description: "Go" }] });
        const result = buildQuestsFile(story);
        expect(result).toHaveProperty("quests");
        const quests = result.quests as Record<string, unknown>;
        expect(quests["main"]).toEqual({ name: "Main Quest", description: "Go" });
    });
});

// ---------------------------------------------------------------------------
describe("buildMonsterDefinitionsFile", () => {
    it("produces monster dict with all stats", () => {
        const story = makeStory({
            monsters: [{
                id: "wolf", name: "Wolf", hp: 20, armor_class: 12,
                initiative: 3, attack_bonus: 2, damage: 5, spells: [],
            }],
        });
        const result = buildMonsterDefinitionsFile(story);
        const wolf = result["wolf"] as Record<string, unknown>;
        expect(wolf.name).toBe("Wolf");
        expect(wolf.hp).toBe(20);
        expect(wolf.armor_class).toBe(12);
    });

    it("includes asset when set", () => {
        const story = makeStory({
            monsters: [{
                id: "wolf", name: "Wolf", asset: "campaign://assets/wolf.png",
                hp: 10, armor_class: 10, initiative: 0, attack_bonus: 0, damage: 3, spells: [],
            }],
        });
        const wolf = buildMonsterDefinitionsFile(story)["wolf"] as Record<string, unknown>;
        expect(wolf.asset).toBe("campaign://assets/wolf.png");
    });
});

// ---------------------------------------------------------------------------
describe("buildClassesFile", () => {
    it("wraps classes in character_classes key", () => {
        const story = makeStory({
            classes: [{
                id: "warrior", name: "Warrior", description: "", base_hp: 20,
                stats: { strength: 16, dexterity: 10, constitution: 14, intelligence: 8, wisdom: 10, charisma: 10 },
                combat: { armor_class: 14, attack_stat: "strength", attack_bonus: 4, damage: 8 },
                spells: [], inventory: [],
            }],
        });
        const result = buildClassesFile(story);
        expect(result).toHaveProperty("character_classes");
        const classes = result.character_classes as Record<string, unknown>;
        expect(classes).toHaveProperty("warrior");
    });

    it("resolves spell IDs to full spell objects", () => {
        const spell = { id: "fire_bolt", name: "Fire Bolt", type: "damage", power: 5 };
        const story = makeStory({
            spells: [spell],
            classes: [{
                id: "mage", name: "Mage", description: "", base_hp: 12,
                stats: { strength: 8, dexterity: 12, constitution: 10, intelligence: 18, wisdom: 14, charisma: 12 },
                combat: { armor_class: 10, attack_stat: "intelligence", attack_bonus: 5, damage: 4 },
                spells: ["fire_bolt"], inventory: [],
            }],
        });
        const classes = buildClassesFile(story).character_classes as Record<string, unknown>;
        const mageSpells = (classes["mage"] as Record<string, unknown>).spells as unknown[];
        expect(mageSpells).toHaveLength(1);
        expect((mageSpells[0] as Record<string, unknown>).id).toBe("fire_bolt");
        expect((mageSpells[0] as Record<string, unknown>).name).toBe("Fire Bolt");
    });

    it("skips unknown spell IDs gracefully", () => {
        const story = makeStory({
            spells: [],
            classes: [{
                id: "rogue", name: "Rogue", description: "", base_hp: 14,
                stats: { strength: 10, dexterity: 16, constitution: 10, intelligence: 12, wisdom: 10, charisma: 10 },
                combat: { armor_class: 12, attack_stat: "dexterity", attack_bonus: 3, damage: 6 },
                spells: ["unknown_spell"], inventory: [],
            }],
        });
        const classes = buildClassesFile(story).character_classes as Record<string, unknown>;
        const rogueSpells = (classes["rogue"] as Record<string, unknown>).spells as unknown[];
        expect(rogueSpells).toHaveLength(0);
    });
});
