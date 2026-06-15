import { useState } from "react";
import { useStoryStore } from "../../../app/storyStore";
import type { Entity } from "./EntityManager";
import "./ItemsPanel.css";

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s_]/g, "")
        .trim()
        .replace(/\s+/g, "_");
}

export function QuestsPanel() {
    const quests = useStoryStore((s) => s.quests);
    const addQuest = useStoryStore((s) => s.addQuest);
    const replaceQuest = useStoryStore((s) => s.replaceQuest);
    const deleteQuest = useStoryStore((s) => s.deleteQuest);

    const [view, setView] = useState<"table" | "create" | "edit">("table");
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

    function openEdit(quest: Entity) {
        setName(quest.name);
        setDescription(quest.description);
        setNameError("");
        setEditingId(quest.id);
        setView("edit");
    }

    function handleCancel() {
        setView("table");
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
            addQuest(entity);
        } else if (editingId) {
            replaceQuest(editingId, entity);
        }
        setView("table");
        setEditingId(null);
    }

    if (view === "create" || view === "edit") {
        return (
            <div className="entityForm">
                <div className="entityFormHeader">
                    <h3 className="entityFormTitle">
                        {view === "create" ? "New Quest" : "Edit Quest"}
                    </h3>
                    <div className="entityFormActions">
                        <button type="button" className="entityBtnSecondary" onClick={handleCancel}>
                            Cancel
                        </button>
                        <button type="button" className="entityBtnPrimary" onClick={handleSave}>
                            Save Quest
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
                            placeholder="e.g. Explore the Ruins"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSave();
                                if (e.key === "Escape") handleCancel();
                            }}
                        />
                        {nameError && <span className="entityFieldErrorMsg">{nameError}</span>}
                        {name.trim() && (
                            <span className="entityFieldHint">
                                ref: <code className="entityFieldCode">{slugify(name)}</code>
                            </span>
                        )}
                    </div>
                    <div className="entityFormGroup">
                        <label className="entityFieldLabel">Description</label>
                        <textarea
                            className="entityFieldTextarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is the objective of this quest?"
                            rows={3}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="itemTableSection">
            <div className="itemTableHeader">
                <span className="entitySectionCount">
                    {quests.length > 0
                        ? `${quests.length} ${quests.length === 1 ? "quest" : "quests"}`
                        : "Quests"}
                </span>
                <button type="button" className="entityAddBtn" onClick={openCreate}>
                    + Add Quest
                </button>
            </div>

            {quests.length === 0 ? (
                <div className="entityEmpty">
                    <p className="entityEmptyHint">
                        No quests yet. Quests can be started, completed, or failed by story choices.
                    </p>
                </div>
            ) : (
                <table className="itemTable">
                    <thead>
                        <tr>
                            <th className="itemTableTh itemTableThRef">Ref</th>
                            <th className="itemTableTh itemTableThName">Name</th>
                            <th className="itemTableTh">Description</th>
                            <th className="itemTableTh itemTableThActions" />
                        </tr>
                    </thead>
                    <tbody>
                        {quests.map((quest) => (
                            <tr key={quest.id} className="itemTableRow">
                                <td className="itemTableTd itemTableTdRef">{quest.id}</td>
                                <td className="itemTableTd itemTableTdName">{quest.name}</td>
                                <td className="itemTableTd itemTableTdDesc">
                                    {quest.description || <span className="itemTableEmpty">—</span>}
                                </td>
                                <td className="itemTableTd itemTableTdActions">
                                    <div className="itemTableRowActions">
                                        <button
                                            type="button"
                                            className="entityCardBtn"
                                            onClick={() => openEdit(quest)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="entityCardBtnDanger"
                                            onClick={() => deleteQuest(quest.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
