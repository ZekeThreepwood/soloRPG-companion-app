import { useStoryStore } from "./storyStore";

export function useKnownFlags(): string[] {
    const scenes = useStoryStore((s) => s.scenes);
    const flags = new Set<string>();
    scenes.forEach((scene) => {
        scene.choices.forEach((choice) => {
            Object.keys(choice.set_flags).forEach((k) => flags.add(k));
            Object.keys(choice.requires_flags).forEach((k) => flags.add(k));
        });
    });
    return Array.from(flags).sort();
}
