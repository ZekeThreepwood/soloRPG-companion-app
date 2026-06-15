import { useState } from "react";
import { useStoryStore } from "../../../app/storyStore";
import "./ItemsPanel.css";

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s_]/g, "")
        .trim()
        .replace(/\s+/g, "_");
}

type Entity = { id: string; name: string; description: string };

type EntityManagerProps = {
    noun: string;
    entities: Entity[];
    hint: string;
    onAdd: (e: Entity) => void;
    onReplace: (oldId: string, e: Entity) => void;
    onDelete: (id: string) => void;
};

function EntityManager({ noun, entities, hint, onAdd, onReplace, onDelete }: EntityManagerProps) {
    const [view, setView] = useState<"list" | "create" | "edit">("list");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [nameError, setNameError] = useState("");

    function openCreate() {
        setName("");
        setDescription("");
        setNameError("");
        setEditingId(null);
        setView("create");
    }

    function openEdit(entity: Entity) {
        setName(entity.name);
        setDescription(entity.description);
        setNameError("");
        setEditingId(entity.id);
        setView("edit");
    }

    function handleCancel() {
        setView("list");
        setEditingId(null);
    }

    function handleSave() {
        if (!name.trim()) {
            setNameError("Name is required");
            return;
        }
        const entity: Entity = {
            id: slugify(name),
            name: name.trim(),
            description: description.trim(),
        };
        if (view === "create") {
            onAdd(entity);
        } else if (editingId) {
            onReplace(editingId, entity);
        }
        setView("list");
        setEditingId(null);
    }

    const nounLower = noun.toLowerCase();

    if (view === "create" || view === "edit") {
        return (
            <div className="entityForm">
                <div className="entityFormHeader">
                    <h3 className="entityFormTitle">
                        {view === "create" ? `New ${noun}` : `Edit ${noun}`}
                    </h3>
                    <div className="entityFormActions">
                        <button type="button" className="entityBtnSecondary" onClick={handleCancel}>
                            Cancel
                        </button>
                        <button type="button" className="entityBtnPrimary" onClick={handleSave}>
                            Save {noun}
                        </button>
                    </div>
                </div>
                <div className="entityFormBody">
                    <div className="entityFormGroup">
                        <label className="entityFieldLabel">
                            Name <span className="entityFieldRequired">*</span>
                        </label>
                        <input
                            className={`entityFieldInput ${nameError ? "entityFieldInputError" : ""}`}
                            value={name}
                            onChange={(e) => { setName(e.target.value); setNameError(""); }}
                            placeholder={`e.g. ${noun === "Item" ? "Old Iron Key" : "Explore the Ruins"}`}
                            autoFocus
                        />
                        {nameError && <span className="entityFieldErrorMsg">{nameError}</span>}
                    </div>
                    <div className="entityFormGroup">
                        <label className="entityFieldLabel">Description</label>
                        <textarea
                            className="entityFieldTextarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={`What is this ${nounLower}?`}
                            rows={3}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="entitySection">
            <div className="entitySectionHeader">
                <span className="entitySectionCount">
                    {entities.length > 0
                        ? `${entities.length} ${entities.length === 1 ? nounLower : nounLower + "s"}`
                        : noun + "s"}
                </span>
                <button type="button" className="entityAddBtn" onClick={openCreate}>
                    + Create {noun}
                </button>
            </div>

            {entities.length === 0 ? (
                <div className="entityEmpty">
                    <p className="entityEmptyHint">{hint}</p>
                </div>
            ) : (
                <div className="entityList">
                    {entities.map((entity) => (
                        <div key={entity.id} className="entityCard">
                            <div className="entityCardMain">
                                <p className="entityCardName">{entity.name}</p>
                                <p className="entityCardId">{entity.id}</p>
                                {entity.description && (
                                    <p className="entityCardDesc">
                                        {entity.description.slice(0, 100)}
                                        {entity.description.length > 100 ? "…" : ""}
                                    </p>
                                )}
                            </div>
                            <div className="entityCardActions">
                                <button
                                    type="button"
                                    className="entityCardBtn"
                                    onClick={() => openEdit(entity)}
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    className="entityCardBtnDanger"
                                    onClick={() => onDelete(entity.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function ItemsPanel() {
    const items = useStoryStore((s) => s.items);
    const quests = useStoryStore((s) => s.quests);
    const addItem = useStoryStore((s) => s.addItem);
    const replaceItem = useStoryStore((s) => s.replaceItem);
    const deleteItem = useStoryStore((s) => s.deleteItem);
    const addQuest = useStoryStore((s) => s.addQuest);
    const replaceQuest = useStoryStore((s) => s.replaceQuest);
    const deleteQuest = useStoryStore((s) => s.deleteQuest);

    return (
        <div className="itemsPanel">
            <EntityManager
                noun="Item"
                entities={items}
                hint="No items yet. Items can be required, added, or removed by story choices."
                onAdd={addItem}
                onReplace={replaceItem}
                onDelete={deleteItem}
            />
            <div className="itemsPanelDivider" />
            <EntityManager
                noun="Quest"
                entities={quests}
                hint="No quests yet. Quests can be started, completed, or failed by story choices."
                onAdd={addQuest}
                onReplace={replaceQuest}
                onDelete={deleteQuest}
            />
        </div>
    );
}
