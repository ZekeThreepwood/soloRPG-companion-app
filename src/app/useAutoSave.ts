import { useEffect, useRef } from "react";
import { useStoryStore } from "./storyStore";
import { saveProject } from "./saveLoad";

export function useAutoSave() {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return useStoryStore.subscribe((state, prevState) => {
            if (!state.filePath || !state.isDirty) return;
            if (
                state.scenes === prevState.scenes &&
                state.items === prevState.items &&
                state.quests === prevState.quests &&
                state.startScene === prevState.startScene
            )
                return;

            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                saveProject();
            }, 1500);
        });
    }, []);
}
