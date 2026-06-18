import { describe, it, expect } from "vitest";
import { buildLayoutJSON } from "./templateSerializer";
import type { TemplateSlot } from "./useTemplateStore";

function makeSlot(overrides: Partial<TemplateSlot> & { type: TemplateSlot["type"] }): TemplateSlot {
    return { id: "test-uuid", x: 0, y: 0, ...overrides };
}

const BASE_STATE = {
    templateName: "portrait_left",
    description: "A test template",
    width: 250,
    height: 122,
    slots: [] as TemplateSlot[],
};

describe("buildLayoutJSON", () => {
    it("outputs template_name from state.templateName", () => {
        const result = buildLayoutJSON(BASE_STATE) as Record<string, unknown>;
        expect(result.template_name).toBe("portrait_left");
    });

    it("includes description", () => {
        const result = buildLayoutJSON(BASE_STATE) as Record<string, unknown>;
        expect(result.description).toBe("A test template");
    });

    it("includes width and height", () => {
        const result = buildLayoutJSON(BASE_STATE) as Record<string, unknown>;
        expect(result.width).toBe(250);
        expect(result.height).toBe(122);
    });

    it("strips id from each slot", () => {
        const state = {
            ...BASE_STATE,
            slots: [makeSlot({ type: "title", x: 10, y: 4 })],
        };
        const result = buildLayoutJSON(state) as Record<string, unknown>;
        const slots = result.slots as Record<string, unknown>[];
        expect(slots[0]).not.toHaveProperty("id");
    });

    it("preserves slot type and coordinates", () => {
        const state = {
            ...BASE_STATE,
            slots: [makeSlot({ type: "narrative", x: 6, y: 20, width_chars: 30, max_lines: 5, line_height: 10 })],
        };
        const result = buildLayoutJSON(state) as Record<string, unknown>;
        const slot = (result.slots as Record<string, unknown>[])[0];
        expect(slot.type).toBe("narrative");
        expect(slot.x).toBe(6);
        expect(slot.y).toBe(20);
        expect(slot.width_chars).toBe(30);
    });

    it("drops undefined fields from slots", () => {
        const state = {
            ...BASE_STATE,
            slots: [makeSlot({ type: "title", x: 10, y: 4 })],
        };
        const result = buildLayoutJSON(state) as Record<string, unknown>;
        const slot = (result.slots as Record<string, unknown>[])[0];
        expect(slot).not.toHaveProperty("width");
        expect(slot).not.toHaveProperty("height");
        expect(slot).not.toHaveProperty("width_chars");
    });

    it("serializes all slot types", () => {
        const state = {
            ...BASE_STATE,
            slots: [
                makeSlot({ type: "title", x: 100, y: 4 }),
                makeSlot({ id: "u2", type: "separator", y: 14, x0: 96, x1: 248, x: 0 }),
                makeSlot({ id: "u3", type: "narrative", x: 100, y: 20, width_chars: 20, max_lines: 5, line_height: 10 }),
                makeSlot({ id: "u4", type: "asset", x: 0, y: 0, width: 92, height: 122 }),
                makeSlot({ id: "u5", type: "menu", x: 100, y: 76, line_height: 12 }),
            ],
        };
        const result = buildLayoutJSON(state) as Record<string, unknown>;
        const slots = result.slots as Record<string, unknown>[];
        expect(slots).toHaveLength(5);
        expect(slots.map((s) => s.type)).toEqual(["title", "separator", "narrative", "asset", "menu"]);
    });

    it("output includes required_fields and optional_fields arrays", () => {
        const result = buildLayoutJSON(BASE_STATE) as Record<string, unknown>;
        expect(Array.isArray(result.required_fields)).toBe(true);
        expect(Array.isArray(result.optional_fields)).toBe(true);
    });

    it("round-trips through JSON serialization", () => {
        const state = {
            ...BASE_STATE,
            slots: [makeSlot({ type: "menu", x: 10, y: 80, line_height: 12 })],
        };
        const result = buildLayoutJSON(state);
        const roundTripped = JSON.parse(JSON.stringify(result)) as Record<string, unknown>;
        expect(roundTripped.template_name).toBe("portrait_left");
        const slot = (roundTripped.slots as Record<string, unknown>[])[0];
        expect(slot.type).toBe("menu");
        expect(slot.line_height).toBe(12);
    });
});
