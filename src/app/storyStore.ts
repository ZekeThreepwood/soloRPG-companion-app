import { create } from "zustand";
import type { Item, Quest, Scene } from "../types/story";

type StoryStore = {
    storyId: string;
    storyTitle: string;
    startScene: string | null;
    scenes: Scene[];
    items: Item[];
    quests: Quest[];

    initStory: (id: string, title: string) => void;
    addScene: (scene: Scene) => void;
    replaceScene: (oldId: string, scene: Scene) => void;
    deleteScene: (id: string) => void;
    setStartScene: (id: string) => void;
    addItem: (item: Item) => void;
    replaceItem: (oldId: string, item: Item) => void;
    deleteItem: (id: string) => void;
    addQuest: (quest: Quest) => void;
    replaceQuest: (oldId: string, quest: Quest) => void;
    deleteQuest: (id: string) => void;
};

export const useStoryStore = create<StoryStore>((set) => ({
    storyId: "",
    storyTitle: "",
    startScene: null,
    scenes: [],
    items: [],
    quests: [],

    initStory: (id, title) =>
        set({ storyId: id, storyTitle: title, startScene: null, scenes: [], items: [], quests: [] }),

    addScene: (scene) =>
        set((state) => ({ scenes: [...state.scenes, scene] })),

    replaceScene: (oldId, scene) =>
        set((state) => ({
            scenes: state.scenes.map((s) => (s.id === oldId ? scene : s)),
            startScene: state.startScene === oldId ? scene.id : state.startScene,
        })),

    deleteScene: (id) =>
        set((state) => ({
            scenes: state.scenes.filter((s) => s.id !== id),
            startScene: state.startScene === id ? null : state.startScene,
        })),

    setStartScene: (id) => set({ startScene: id }),

    addItem: (item) =>
        set((state) => ({ items: [...state.items, item] })),

    replaceItem: (oldId, item) =>
        set((state) => ({
            items: state.items.map((i) => (i.id === oldId ? item : i)),
        })),

    deleteItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

    addQuest: (quest) =>
        set((state) => ({ quests: [...state.quests, quest] })),

    replaceQuest: (oldId, quest) =>
        set((state) => ({
            quests: state.quests.map((q) => (q.id === oldId ? quest : q)),
        })),

    deleteQuest: (id) =>
        set((state) => ({ quests: state.quests.filter((q) => q.id !== id) })),
}));
