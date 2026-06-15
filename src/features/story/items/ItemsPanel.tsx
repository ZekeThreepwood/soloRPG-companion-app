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

export function ItemsPanel() {
    const items = useStoryStore((s) => s.items);
    const addItem = useStoryStore((s) => s.addItem);
    const replaceItem = useStoryStore((s) => s.replaceItem);
    const deleteItem = useStoryStore((s) => s.deleteItem);

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

    function openEdit(item: Entity) {
        setName(item.name);
        setDescription(item.description);
        setNameError("");
        setEditingId(item.id);
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
            addItem(entity);
        } else if (editingId) {
            replaceItem(editingId, entity);
        }
        setView("table");
        setEditingId(null);
    }

    if (view === "create" || view === "edit") {
        return (
            <div className="entityForm">
                <div className="entityFormHeader">
                    <h3 className="entityFormTitle">
                        {view === "create" ? "New Item" : "Edit Item"}
                    </h3>
                    <div className="entityFormActions">
                        <button type="button" className="entityBtnSecondary" onClick={handleCancel}>
                            Cancel
                        </button>
                        <button type="button" className="entityBtnPrimary" onClick={handleSave}>
                            Save Item
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
                            placeholder="e.g. Old Iron Key"
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
                            placeholder="What is this item?"
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
                    {items.length > 0
                        ? `${items.length} ${items.length === 1 ? "item" : "items"}`
                        : "Items"}
                </span>
                <button type="button" className="entityAddBtn" onClick={openCreate}>
                    + Add Item
                </button>
            </div>

            {items.length === 0 ? (
                <div className="entityEmpty">
                    <p className="entityEmptyHint">
                        No items yet. Items can be required, added, or removed by story choices.
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
                        {items.map((item) => (
                            <tr key={item.id} className="itemTableRow">
                                <td className="itemTableTd itemTableTdRef">{item.id}</td>
                                <td className="itemTableTd itemTableTdName">{item.name}</td>
                                <td className="itemTableTd itemTableTdDesc">
                                    {item.description || <span className="itemTableEmpty">—</span>}
                                </td>
                                <td className="itemTableTd itemTableTdActions">
                                    <div className="itemTableRowActions">
                                        <button
                                            type="button"
                                            className="entityCardBtn"
                                            onClick={() => openEdit(item)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="entityCardBtnDanger"
                                            onClick={() => deleteItem(item.id)}
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
