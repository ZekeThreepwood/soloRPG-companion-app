import { describe, it, expect } from "vitest";
import { validateCampaign } from "./campaignValidator";
import type { Story, Scene, Choice, Encounter } from "../types/story";

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: "test",
        title: "Test",
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

function makeScene(id: string, overrides: Partial<Scene> = {}): Scene {
    return {
        id,
        title: id,
        text: "Some text.",
        choices: [],
        ...overrides,
    };
}

function makeChoice(overrides: Partial<Choice> = {}): Choice {
    return {
        _key: "k1",
        text: "Go",
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

// ── No scenes ─────────────────────────────────────────────────────────────────
describe("no scenes", () => {
    it("errors when there are no scenes", () => {
        const r = validateCampaign(makeStory({ scenes: [] }));
        expect(r.hasErrors).toBe(true);
        expect(r.issues.some((i) => i.message.includes("no scenes"))).toBe(true);
    });
});

// ── Start scene ───────────────────────────────────────────────────────────────
describe("start scene", () => {
    it("errors when start_scene is empty", () => {
        const r = validateCampaign(makeStory({ start_scene: "", scenes: [makeScene("intro")] }));
        expect(r.hasErrors).toBe(true);
        expect(r.issues.some((i) => i.message.includes("No start scene"))).toBe(true);
    });

    it("errors when start_scene references a missing scene", () => {
        const r = validateCampaign(makeStory({ start_scene: "missing", scenes: [makeScene("intro")] }));
        expect(r.hasErrors).toBe(true);
        expect(r.issues.some((i) => i.message.includes('"missing"'))).toBe(true);
    });

    it("no error when start_scene exists", () => {
        const r = validateCampaign(makeStory({ start_scene: "intro", scenes: [makeScene("intro")] }));
        expect(r.issues.filter((i) => i.severity === "error")).toHaveLength(0);
    });
});

// ── Scene text ────────────────────────────────────────────────────────────────
describe("scene text", () => {
    it("warns when a scene has empty text", () => {
        const r = validateCampaign(makeStory({
            start_scene: "intro",
            scenes: [makeScene("intro", { text: "" })],
        }));
        expect(r.issues.some((i) => i.severity === "warning" && i.message.includes("no text"))).toBe(true);
    });

    it("no warning when scene has text", () => {
        const r = validateCampaign(makeStory({
            start_scene: "intro",
            scenes: [makeScene("intro", { text: "Hello" })],
        }));
        expect(r.issues.filter((i) => i.message.includes("no text"))).toHaveLength(0);
    });
});

// ── Dead ends ─────────────────────────────────────────────────────────────────
describe("dead end scenes", () => {
    it("warns when non-start scene has no choices and no encounter", () => {
        const r = validateCampaign(makeStory({
            start_scene: "intro",
            scenes: [makeScene("intro", { choices: [makeChoice({ next_scene: "end" })] }), makeScene("end")],
        }));
        expect(r.issues.some((i) => i.severity === "warning" && i.message.includes("dead end"))).toBe(true);
    });

    it("does not warn for start scene that is a dead end", () => {
        const r = validateCampaign(makeStory({
            start_scene: "intro",
            scenes: [makeScene("intro", { choices: [] })],
        }));
        expect(r.issues.filter((i) => i.message.includes("dead end"))).toHaveLength(0);
    });
});

// ── Choice next_scene ─────────────────────────────────────────────────────────
describe("choice next_scene", () => {
    it("errors when next_scene references a missing scene", () => {
        const choice = makeChoice({ next_scene: "ghost_scene" });
        const r = validateCampaign(makeStory({
            start_scene: "intro",
            scenes: [makeScene("intro", { choices: [choice] })],
        }));
        expect(r.hasErrors).toBe(true);
        expect(r.issues.some((i) => i.message.includes('"ghost_scene"'))).toBe(true);
    });

    it("no error when next_scene exists", () => {
        const choice = makeChoice({ next_scene: "forest" });
        const r = validateCampaign(makeStory({
            start_scene: "intro",
            scenes: [makeScene("intro", { choices: [choice] }), makeScene("forest")],
        }));
        expect(r.issues.filter((i) => i.severity === "error")).toHaveLength(0);
    });
});

// ── Ability check scene refs ───────────────────────────────────────────────────
describe("ability check scene refs", () => {
    it("errors when success_scene is missing", () => {
        const choice = makeChoice({ check: { stat: "strength", difficulty: 12, success_scene: "nope", failure_scene: "fail" } });
        const r = validateCampaign(makeStory({
            start_scene: "intro",
            scenes: [makeScene("intro", { choices: [choice] }), makeScene("fail")],
        }));
        expect(r.issues.some((i) => i.severity === "error" && i.message.includes("success_scene"))).toBe(true);
    });

    it("errors when failure_scene is missing", () => {
        const choice = makeChoice({ check: { stat: "strength", difficulty: 12, success_scene: "win", failure_scene: "nope" } });
        const r = validateCampaign(makeStory({
            start_scene: "intro",
            scenes: [makeScene("intro", { choices: [choice] }), makeScene("win")],
        }));
        expect(r.issues.some((i) => i.severity === "error" && i.message.includes("failure_scene"))).toBe(true);
    });
});

// ── Encounter scene refs ──────────────────────────────────────────────────────
describe("encounter scene refs", () => {
    const baseEnc: Encounter = { monster: "wolf", win_scene: "win", lose_scene: "lose" };

    it("errors when win_scene is missing", () => {
        const r = validateCampaign(makeStory({
            start_scene: "intro",
            scenes: [makeScene("intro", { encounter: { ...baseEnc, win_scene: "missing" } }), makeScene("lose")],
        }));
        expect(r.issues.some((i) => i.severity === "error" && i.message.includes("win_scene"))).toBe(true);
    });

    it("errors when lose_scene is missing", () => {
        const r = validateCampaign(makeStory({
            start_scene: "intro",
            scenes: [makeScene("intro", { encounter: { ...baseEnc, lose_scene: "missing" } }), makeScene("win")],
        }));
        expect(r.issues.some((i) => i.severity === "error" && i.message.includes("lose_scene"))).toBe(true);
    });

    it("errors when flee_scene is set but missing", () => {
        const r = validateCampaign(makeStory({
            start_scene: "intro",
            scenes: [makeScene("intro", { encounter: { ...baseEnc, flee_scene: "missing" } }), makeScene("win"), makeScene("lose")],
        }));
        expect(r.issues.some((i) => i.severity === "error" && i.message.includes("flee_scene"))).toBe(true);
    });

    it("warns when monster ID is not in monsters list", () => {
        const r = validateCampaign(makeStory({
            start_scene: "intro",
            monsters: [],
            scenes: [makeScene("intro", { encounter: baseEnc }), makeScene("win"), makeScene("lose")],
        }));
        expect(r.issues.some((i) => i.severity === "warning" && i.message.includes("wolf"))).toBe(true);
    });

    it("no monster warning when monster exists", () => {
        const monster = { id: "wolf", name: "Wolf", hp: 10, armor_class: 10, initiative: 0, attack_bonus: 0, damage: 3, spells: [] };
        const r = validateCampaign(makeStory({
            start_scene: "intro",
            monsters: [monster],
            scenes: [makeScene("intro", { encounter: baseEnc }), makeScene("win"), makeScene("lose")],
        }));
        expect(r.issues.filter((i) => i.message.includes("wolf"))).toHaveLength(0);
    });
});

// ── Item / quest refs in choices ──────────────────────────────────────────────
describe("item and quest refs", () => {
    it("warns when a choice references an unknown item", () => {
        const choice = makeChoice({ add_items: ["magic_sword"] });
        const r = validateCampaign(makeStory({
            start_scene: "intro",
            items: [],
            scenes: [makeScene("intro", { choices: [choice] })],
        }));
        expect(r.issues.some((i) => i.severity === "warning" && i.message.includes("magic_sword"))).toBe(true);
    });

    it("no warning when item exists", () => {
        const choice = makeChoice({ add_items: ["sword"] });
        const r = validateCampaign(makeStory({
            start_scene: "intro",
            items: [{ id: "sword", name: "Sword", description: "" }],
            scenes: [makeScene("intro", { choices: [choice] })],
        }));
        expect(r.issues.filter((i) => i.message.includes("sword"))).toHaveLength(0);
    });

    it("warns when a choice references an unknown quest", () => {
        const choice = makeChoice({ start_quests: ["main_quest"] });
        const r = validateCampaign(makeStory({
            start_scene: "intro",
            quests: [],
            scenes: [makeScene("intro", { choices: [choice] })],
        }));
        expect(r.issues.some((i) => i.severity === "warning" && i.message.includes("main_quest"))).toBe(true);
    });
});

// ── Choice count limit ────────────────────────────────────────────────────────
describe("choice count limit", () => {
    it("warns when a scene has more than 3 choices", () => {
        const choices = [1, 2, 3, 4].map((n) => makeChoice({ _key: String(n), text: `Choice ${n}` }));
        const r = validateCampaign(makeStory({
            start_scene: "intro",
            scenes: [makeScene("intro", { choices })],
        }));
        expect(r.issues.some((i) => i.severity === "warning" && i.message.includes("4 choices"))).toBe(true);
    });

    it("no warning with 3 or fewer choices", () => {
        const choices = [1, 2, 3].map((n) => makeChoice({ _key: String(n), text: `Choice ${n}`, next_scene: "intro" }));
        const r = validateCampaign(makeStory({
            start_scene: "intro",
            scenes: [makeScene("intro", { choices })],
        }));
        expect(r.issues.filter((i) => i.message.includes("choices"))).toHaveLength(0);
    });
});

// ── Clean campaign ────────────────────────────────────────────────────────────
describe("clean campaign", () => {
    it("returns no issues for a minimal valid campaign", () => {
        const r = validateCampaign(makeStory({
            start_scene: "intro",
            scenes: [makeScene("intro", { choices: [makeChoice({ next_scene: "end" })] }), makeScene("end")],
        }));
        expect(r.hasErrors).toBe(false);
    });
});
