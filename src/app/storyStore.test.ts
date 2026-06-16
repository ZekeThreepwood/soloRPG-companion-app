import { describe, it, expect, beforeEach } from "vitest";
import { useStoryStore } from "./storyStore";
import type { Scene, Choice } from "../types/story";

function makeScene(id: string): Scene {
    return { id, title: id, text: "", choices: [] };
}

function makeChoice(key: string): Choice {
    return {
        _key: key,
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
    };
}

beforeEach(() => {
    useStoryStore.getState().initStory("test_id", "Test Story", "Tester");
});

describe("initStory", () => {
    it("sets id, title and author", () => {
        const s = useStoryStore.getState();
        expect(s.storyId).toBe("test_id");
        expect(s.storyTitle).toBe("Test Story");
        expect(s.storyAuthor).toBe("Tester");
    });

    it("clears all collections", () => {
        useStoryStore.getState().addScene(makeScene("intro"));
        useStoryStore.getState().initStory("x", "X", "");
        const s = useStoryStore.getState();
        expect(s.scenes).toHaveLength(0);
        expect(s.items).toHaveLength(0);
        expect(s.quests).toHaveLength(0);
        expect(s.monsters).toHaveLength(0);
        expect(s.classes).toHaveLength(0);
        expect(s.spells).toHaveLength(0);
    });

    it("resets isDirty to false", () => {
        useStoryStore.getState().addScene(makeScene("a"));
        useStoryStore.getState().initStory("x", "X", "");
        expect(useStoryStore.getState().isDirty).toBe(false);
    });
});

describe("scenes", () => {
    it("adds a scene and marks dirty", () => {
        useStoryStore.getState().addScene(makeScene("intro"));
        expect(useStoryStore.getState().scenes).toHaveLength(1);
        expect(useStoryStore.getState().isDirty).toBe(true);
    });

    it("replaces a scene by id", () => {
        useStoryStore.getState().addScene(makeScene("intro"));
        useStoryStore.getState().replaceScene("intro", { ...makeScene("intro"), title: "Updated" });
        expect(useStoryStore.getState().scenes[0].title).toBe("Updated");
    });

    it("replaceScene updates startScene when the id changes", () => {
        useStoryStore.getState().addScene(makeScene("intro"));
        useStoryStore.getState().setStartScene("intro");
        useStoryStore.getState().replaceScene("intro", makeScene("prologue"));
        expect(useStoryStore.getState().startScene).toBe("prologue");
    });

    it("deletes a scene", () => {
        useStoryStore.getState().addScene(makeScene("intro"));
        useStoryStore.getState().deleteScene("intro");
        expect(useStoryStore.getState().scenes).toHaveLength(0);
    });

    it("clears startScene when the start scene is deleted", () => {
        useStoryStore.getState().addScene(makeScene("intro"));
        useStoryStore.getState().setStartScene("intro");
        useStoryStore.getState().deleteScene("intro");
        expect(useStoryStore.getState().startScene).toBeNull();
    });

    it("keeps startScene when a different scene is deleted", () => {
        useStoryStore.getState().addScene(makeScene("intro"));
        useStoryStore.getState().addScene(makeScene("battle"));
        useStoryStore.getState().setStartScene("intro");
        useStoryStore.getState().deleteScene("battle");
        expect(useStoryStore.getState().startScene).toBe("intro");
    });
});

describe("choices", () => {
    it("adds a choice to a scene", () => {
        useStoryStore.getState().addScene(makeScene("intro"));
        useStoryStore.getState().addChoiceToScene("intro", makeChoice("c1"));
        expect(useStoryStore.getState().scenes[0].choices).toHaveLength(1);
    });

    it("removes a choice by _key", () => {
        useStoryStore.getState().addScene(makeScene("intro"));
        useStoryStore.getState().addChoiceToScene("intro", makeChoice("c1"));
        useStoryStore.getState().addChoiceToScene("intro", makeChoice("c2"));
        useStoryStore.getState().removeChoiceFromScene("intro", "c1");
        const choices = useStoryStore.getState().scenes[0].choices;
        expect(choices).toHaveLength(1);
        expect(choices[0]._key).toBe("c2");
    });
});

describe("items", () => {
    it("adds, replaces, and deletes an item", () => {
        useStoryStore.getState().addItem({ id: "sword", name: "Sword", description: "" });
        expect(useStoryStore.getState().items).toHaveLength(1);

        useStoryStore.getState().replaceItem("sword", { id: "sword", name: "Magic Sword", description: "Glows" });
        expect(useStoryStore.getState().items[0].name).toBe("Magic Sword");

        useStoryStore.getState().deleteItem("sword");
        expect(useStoryStore.getState().items).toHaveLength(0);
    });
});

describe("quests", () => {
    it("adds, replaces, and deletes a quest", () => {
        useStoryStore.getState().addQuest({ id: "main", name: "Main Quest", description: "" });
        useStoryStore.getState().replaceQuest("main", { id: "main", name: "Epic Journey", description: "Long" });
        expect(useStoryStore.getState().quests[0].name).toBe("Epic Journey");

        useStoryStore.getState().deleteQuest("main");
        expect(useStoryStore.getState().quests).toHaveLength(0);
    });
});

describe("monsters", () => {
    it("adds, replaces, and deletes a monster", () => {
        useStoryStore.getState().addMonster({ id: "goblin", name: "Goblin", hp: 10, armor_class: 12, initiative: 2, attack_bonus: 1, damage: 3, spells: [] });
        useStoryStore.getState().replaceMonster("goblin", { id: "goblin", name: "Cave Goblin", hp: 15, armor_class: 12, initiative: 2, attack_bonus: 1, damage: 3, spells: [] });
        expect(useStoryStore.getState().monsters[0].name).toBe("Cave Goblin");

        useStoryStore.getState().deleteMonster("goblin");
        expect(useStoryStore.getState().monsters).toHaveLength(0);
    });
});

describe("spells", () => {
    it("adds, replaces, and deletes a spell", () => {
        useStoryStore.getState().addSpell({ id: "fireball", name: "Fireball", type: "damage", power: 5 });
        useStoryStore.getState().replaceSpell("fireball", { id: "fireball", name: "Greater Fireball", type: "damage", power: 8 });
        expect(useStoryStore.getState().spells[0].name).toBe("Greater Fireball");

        useStoryStore.getState().deleteSpell("fireball");
        expect(useStoryStore.getState().spells).toHaveLength(0);
    });
});

describe("loadStory", () => {
    it("loads all fields and clears isDirty", () => {
        useStoryStore.getState().addScene(makeScene("old"));
        useStoryStore.getState().loadStory(
            {
                id: "loaded_id",
                title: "Loaded",
                version: "1.0",
                start_scene: "chapter1",
                scenes: [makeScene("chapter1")],
                items: [{ id: "key", name: "Key", description: "" }],
                quests: [],
                monsters: [],
                classes: [],
                spells: [],
            },
            "/path/to/story.json"
        );
        const s = useStoryStore.getState();
        expect(s.storyId).toBe("loaded_id");
        expect(s.storyTitle).toBe("Loaded");
        expect(s.startScene).toBe("chapter1");
        expect(s.scenes).toHaveLength(1);
        expect(s.items).toHaveLength(1);
        expect(s.filePath).toBe("/path/to/story.json");
        expect(s.isDirty).toBe(false);
    });
});
