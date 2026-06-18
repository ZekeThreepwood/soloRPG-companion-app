import { useTemplateStore } from "./useTemplateStore";
import type { SlotType } from "./useTemplateStore";
import "./SlotInspector.css";

const SLOT_TYPES: SlotType[] = ["title", "narrative", "asset", "separator", "menu"];

export function SlotInspector() {
    const { slots, selectedSlotId, width, updateSlot, removeSlot, selectSlot } = useTemplateStore();
    const slot = slots.find((s) => s.id === selectedSlotId);

    if (!slot) {
        return (
            <div className="slotInspector slotInspectorEmpty">
                <p>Select a slot on the canvas to edit its properties.</p>
            </div>
        );
    }

    function num(val: number | undefined, fallback: number) {
        return val ?? fallback;
    }

    return (
        <div className="slotInspector">
            <h3 className="inspectorTitle">Slot Properties</h3>

            <label className="inspectorField">
                <span>Type</span>
                <select
                    value={slot.type}
                    onChange={(e) => updateSlot(slot.id, { type: e.target.value as SlotType })}
                >
                    {SLOT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </label>

            {slot.type !== "separator" && (
                <label className="inspectorField">
                    <span>X</span>
                    <input
                        type="number"
                        value={slot.x}
                        onChange={(e) => updateSlot(slot.id, { x: parseInt(e.target.value) || 0 })}
                    />
                </label>
            )}

            <label className="inspectorField">
                <span>Y</span>
                <input
                    type="number"
                    value={slot.y}
                    onChange={(e) => updateSlot(slot.id, { y: parseInt(e.target.value) || 0 })}
                />
            </label>

            {slot.type === "narrative" && (
                <>
                    <label className="inspectorField">
                        <span>Width chars</span>
                        <input
                            type="number"
                            value={num(slot.width_chars, 30)}
                            onChange={(e) => updateSlot(slot.id, { width_chars: parseInt(e.target.value) || 30 })}
                        />
                    </label>
                    <label className="inspectorField">
                        <span>Max lines</span>
                        <input
                            type="number"
                            value={num(slot.max_lines, 5)}
                            onChange={(e) => updateSlot(slot.id, { max_lines: parseInt(e.target.value) || 5 })}
                        />
                    </label>
                    <label className="inspectorField">
                        <span>Line height</span>
                        <input
                            type="number"
                            value={num(slot.line_height, 10)}
                            onChange={(e) => updateSlot(slot.id, { line_height: parseInt(e.target.value) || 10 })}
                        />
                    </label>
                </>
            )}

            {slot.type === "asset" && (
                <>
                    <label className="inspectorField">
                        <span>Width</span>
                        <input
                            type="number"
                            value={num(slot.width, 60)}
                            onChange={(e) => updateSlot(slot.id, { width: parseInt(e.target.value) || 60 })}
                        />
                    </label>
                    <label className="inspectorField">
                        <span>Height</span>
                        <input
                            type="number"
                            value={num(slot.height, 60)}
                            onChange={(e) => updateSlot(slot.id, { height: parseInt(e.target.value) || 60 })}
                        />
                    </label>
                </>
            )}

            {slot.type === "separator" && (
                <>
                    <label className="inspectorField">
                        <span>X0 (left)</span>
                        <input
                            type="number"
                            value={num(slot.x0, 1)}
                            onChange={(e) => updateSlot(slot.id, { x0: parseInt(e.target.value) || 1 })}
                        />
                    </label>
                    <label className="inspectorField">
                        <span>X1 (right)</span>
                        <input
                            type="number"
                            value={num(slot.x1, width - 2)}
                            onChange={(e) => updateSlot(slot.id, { x1: parseInt(e.target.value) || width - 2 })}
                        />
                    </label>
                </>
            )}

            {slot.type === "menu" && (
                <label className="inspectorField">
                    <span>Line height</span>
                    <input
                        type="number"
                        value={num(slot.line_height, 12)}
                        onChange={(e) => updateSlot(slot.id, { line_height: parseInt(e.target.value) || 12 })}
                    />
                </label>
            )}

            <button
                type="button"
                className="deleteSlotBtn"
                onClick={() => { removeSlot(slot.id); selectSlot(null); }}
            >
                Delete Slot
            </button>
        </div>
    );
}
