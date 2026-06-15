import { useStoryStore } from "../../../app/storyStore";
import { EntityManager } from "./EntityManager";

export function QuestsPanel() {
    const quests = useStoryStore((s) => s.quests);
    const addQuest = useStoryStore((s) => s.addQuest);
    const replaceQuest = useStoryStore((s) => s.replaceQuest);
    const deleteQuest = useStoryStore((s) => s.deleteQuest);

    return (
        <EntityManager
            noun="Quest"
            placeholder="e.g. Explore the Ruins"
            entities={quests}
            hint="No quests yet. Quests can be started, completed, or failed by story choices."
            onAdd={addQuest}
            onReplace={replaceQuest}
            onDelete={deleteQuest}
        />
    );
}
