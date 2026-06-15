import { create } from "zustand";
import type { Scene } from "../types/story";

type StoryStore = {
    storyId: string;
    storyTitle: string;
    startScene: string | null;
    scenes: Scene[];

    initStory: (id: string, title: string) => void;
    addScene: (scene: Scene) => void;
    replaceScene: (oldId: string, scene: Scene) => void;
    deleteScene: (id: string) => void;
    setStartScene: (id: string) => void;
};

export const useStoryStore = create<StoryStore>((set) => ({
    storyId: "",
    storyTitle: "",
    startScene: null,
    scenes: [],

    initStory: (id, title) =>
        set({ storyId: id, storyTitle: title, startScene: null, scenes: [] }),

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
}));
