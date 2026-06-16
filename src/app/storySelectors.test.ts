import { describe, it, expect } from "vitest";
import { extractKnownFlags } from "./storySelectors";
import type { Scene } from "../types/story";

function makeScene(id: string, setFlags: Record<string, boolean> = {}, requiresFlags: Record<string, boolean> = {}): Scene {
    return {
        id,
        title: id,
        text: "",
        choices: [
            {
                _key: "k",
                text: "",
                requires_items: [],
                requires_missing_items: [],
                requires_flags: requiresFlags,
                add_items: [],
                remove_items: [],
                start_quests: [],
                complete_quests: [],
                fail_quests: [],
                set_flags: setFlags,
            },
        ],
    };
}

describe("extractKnownFlags", () => {
    it("returns empty array for no scenes", () => {
        expect(extractKnownFlags([])).toEqual([]);
    });

    it("collects flags from set_flags", () => {
        const flags = extractKnownFlags([makeScene("intro", { talked_to_elder: true })]);
        expect(flags).toContain("talked_to_elder");
    });

    it("collects flags from requires_flags", () => {
        const flags = extractKnownFlags([makeScene("battle", {}, { has_sword: true })]);
        expect(flags).toContain("has_sword");
    });

    it("deduplicates flags that appear in multiple choices", () => {
        const scene: Scene = {
            id: "hub",
            title: "Hub",
            text: "",
            choices: [
                { _key: "a", text: "", requires_items: [], requires_missing_items: [], requires_flags: { visited: true }, add_items: [], remove_items: [], start_quests: [], complete_quests: [], fail_quests: [], set_flags: {} },
                { _key: "b", text: "", requires_items: [], requires_missing_items: [], requires_flags: { visited: true }, add_items: [], remove_items: [], start_quests: [], complete_quests: [], fail_quests: [], set_flags: {} },
            ],
        };
        const flags = extractKnownFlags([scene]);
        expect(flags.filter((f) => f === "visited")).toHaveLength(1);
    });

    it("returns flags sorted alphabetically", () => {
        const flags = extractKnownFlags([
            makeScene("a", { zebra: true }),
            makeScene("b", { apple: true }),
        ]);
        expect(flags).toEqual(["apple", "zebra"]);
    });

    it("collects flags across multiple scenes", () => {
        const flags = extractKnownFlags([
            makeScene("intro", { met_npc: true }),
            makeScene("forest", { found_map: true }),
        ]);
        expect(flags).toContain("met_npc");
        expect(flags).toContain("found_map");
    });
});
