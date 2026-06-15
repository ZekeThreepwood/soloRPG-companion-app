import { useStoryStore } from "../../../app/storyStore";
import { EntityManager } from "./EntityManager";

export function ItemsPanel() {
    const items = useStoryStore((s) => s.items);
    const addItem = useStoryStore((s) => s.addItem);
    const replaceItem = useStoryStore((s) => s.replaceItem);
    const deleteItem = useStoryStore((s) => s.deleteItem);

    return (
        <EntityManager
            noun="Item"
            placeholder="e.g. Old Iron Key"
            entities={items}
            hint="No items yet. Items can be required, added, or removed by story choices."
            onAdd={addItem}
            onReplace={replaceItem}
            onDelete={deleteItem}
        />
    );
}
