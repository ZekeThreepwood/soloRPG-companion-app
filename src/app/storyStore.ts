import { create } from "zustand";
import type { Item, Quest, Scene, Story } from "../types/story";

type StoryStore = {
    storyId: string;
    storyTitle: string;
    storyAuthor: string;
    startScene: string | null;
    scenes: Scene[];
    items: Item[];
    quests: Quest[];
    filePath: string | null;
    isDirty: boolean;

    initStory: (id: string, title: string, author: string) => void;
    setStoryMeta: (title: string, author: string) => void;
    setFilePath: (path: string | null) => void;
    markSaved: () => void;
    loadStory: (story: Story, path: string) => void;

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
    storyAuthor: "",
    startScene: null,
    scenes: [],
    items: [],
    quests: [],
    filePath: null,
    isDirty: false,

    initStory: (id, title, author) =>
        set({
            storyId: id,
            storyTitle: title,
            storyAuthor: author,
            startScene: null,
            scenes: [],
            items: [],
            quests: [],
            filePath: null,
            isDirty: false,
        }),

    setStoryMeta: (title, author) =>
        set({ storyTitle: title, storyAuthor: author, isDirty: true }),

    setFilePath: (path) => set({ filePath: path }),

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
            filePath: path,
            isDirty: false,
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
}));
