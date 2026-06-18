import { create } from "zustand";
import type { CharacterClass, Item, Monster, Quest, Scene, Spell, Story } from "../types/story";

type StoryStore = {
    storyId: string;
    storyTitle: string;
    storyAuthor: string;
    startScene: string | null;
    scenes: Scene[];
    items: Item[];
    quests: Quest[];
    monsters: Monster[];
    classes: CharacterClass[];
    spells: Spell[];
    filePath: string | null;
    isDirty: boolean;
    assetsDir: string | null;

    initStory: (id: string, title: string, author: string) => void;
    setStoryMeta: (title: string, author: string) => void;
    setFilePath: (path: string | null) => void;
    setAssetsDir: (dir: string | null) => void;
    markSaved: () => void;
    loadStory: (story: Story, path: string) => void;

    addScene: (scene: Scene) => void;
    replaceScene: (oldId: string, scene: Scene) => void;
    deleteScene: (id: string) => void;
    setStartScene: (id: string) => void;
    addChoiceToScene: (sceneId: string, choice: import("../types/story").Choice) => void;
    removeChoiceFromScene: (sceneId: string, choiceKey: string) => void;

    addItem: (item: Item) => void;
    replaceItem: (oldId: string, item: Item) => void;
    deleteItem: (id: string) => void;

    addQuest: (quest: Quest) => void;
    replaceQuest: (oldId: string, quest: Quest) => void;
    deleteQuest: (id: string) => void;

    addMonster: (monster: Monster) => void;
    replaceMonster: (oldId: string, monster: Monster) => void;
    deleteMonster: (id: string) => void;

    addCharacterClass: (cls: CharacterClass) => void;
    replaceCharacterClass: (oldId: string, cls: CharacterClass) => void;
    deleteCharacterClass: (id: string) => void;

    addSpell: (spell: Spell) => void;
    replaceSpell: (oldId: string, spell: Spell) => void;
    deleteSpell: (id: string) => void;
};

export const useStoryStore = create<StoryStore>((set) => ({
    storyId: "",
    storyTitle: "",
    storyAuthor: "",
    startScene: null,
    scenes: [],
    items: [],
    quests: [],
    monsters: [],
    classes: [],
    spells: [],
    filePath: null,
    isDirty: false,
    assetsDir: null,

    initStory: (id, title, author) =>
        set({
            storyId: id,
            storyTitle: title,
            storyAuthor: author,
            startScene: null,
            scenes: [],
            items: [],
            quests: [],
            monsters: [],
            classes: [],
            spells: [],
            filePath: null,
            isDirty: false,
            assetsDir: null,
        }),

    setStoryMeta: (title, author) =>
        set({ storyTitle: title, storyAuthor: author, isDirty: true }),

    setFilePath: (path) => set({ filePath: path }),

    setAssetsDir: (dir) => set({ assetsDir: dir, isDirty: true }),

    markSaved: () => set({ isDirty: false }),

    loadStory: (story, path) =>
        set({
            storyId: story.id,
            storyTitle: story.title,
            storyAuthor: story.author ?? "",
            startScene: story.start_scene || null,
            scenes: story.scenes,
            items: story.items,
            quests: story.quests,
            monsters: story.monsters ?? [],
            classes: story.classes ?? [],
            spells: story.spells ?? [],
            filePath: path,
            isDirty: false,
            assetsDir: story.assetsDir ?? null,
        }),

    addScene: (scene) =>
        set((state) => ({ scenes: [...state.scenes, scene], isDirty: true })),

    replaceScene: (oldId, scene) =>
        set((state) => ({
            scenes: state.scenes.map((s) => (s.id === oldId ? scene : s)),
            startScene: state.startScene === oldId ? scene.id : state.startScene,
            isDirty: true,
        })),

    deleteScene: (id) =>
        set((state) => ({
            scenes: state.scenes.filter((s) => s.id !== id),
            startScene: state.startScene === id ? null : state.startScene,
            isDirty: true,
        })),

    setStartScene: (id) => set({ startScene: id, isDirty: true }),

    addChoiceToScene: (sceneId, choice) =>
        set((state) => ({
            scenes: state.scenes.map((s) =>
                s.id === sceneId ? { ...s, choices: [...s.choices, choice] } : s
            ),
            isDirty: true,
        })),

    removeChoiceFromScene: (sceneId, choiceKey) =>
        set((state) => ({
            scenes: state.scenes.map((s) =>
                s.id === sceneId
                    ? { ...s, choices: s.choices.filter((c) => c._key !== choiceKey) }
                    : s
            ),
            isDirty: true,
        })),

    addItem: (item) =>
        set((state) => ({ items: [...state.items, item], isDirty: true })),

    replaceItem: (oldId, item) =>
        set((state) => ({
            items: state.items.map((i) => (i.id === oldId ? item : i)),
            isDirty: true,
        })),

    deleteItem: (id) =>
        set((state) => ({
            items: state.items.filter((i) => i.id !== id),
            isDirty: true,
        })),

    addQuest: (quest) =>
        set((state) => ({ quests: [...state.quests, quest], isDirty: true })),

    replaceQuest: (oldId, quest) =>
        set((state) => ({
            quests: state.quests.map((q) => (q.id === oldId ? quest : q)),
            isDirty: true,
        })),

    deleteQuest: (id) =>
        set((state) => ({
            quests: state.quests.filter((q) => q.id !== id),
            isDirty: true,
        })),

    addMonster: (monster) =>
        set((state) => ({ monsters: [...state.monsters, monster], isDirty: true })),

    replaceMonster: (oldId, monster) =>
        set((state) => ({
            monsters: state.monsters.map((m) => (m.id === oldId ? monster : m)),
            isDirty: true,
        })),

    deleteMonster: (id) =>
        set((state) => ({
            monsters: state.monsters.filter((m) => m.id !== id),
            isDirty: true,
        })),

    addCharacterClass: (cls) =>
        set((state) => ({ classes: [...state.classes, cls], isDirty: true })),

    replaceCharacterClass: (oldId, cls) =>
        set((state) => ({
            classes: state.classes.map((c) => (c.id === oldId ? cls : c)),
            isDirty: true,
        })),

    deleteCharacterClass: (id) =>
        set((state) => ({
            classes: state.classes.filter((c) => c.id !== id),
            isDirty: true,
        })),

    addSpell: (spell) =>
        set((state) => ({ spells: [...state.spells, spell], isDirty: true })),

    replaceSpell: (oldId, spell) =>
        set((state) => ({
            spells: state.spells.map((s) => (s.id === oldId ? spell : s)),
            isDirty: true,
        })),

    deleteSpell: (id) =>
        set((state) => ({
            spells: state.spells.filter((s) => s.id !== id),
            isDirty: true,
        })),
}));
