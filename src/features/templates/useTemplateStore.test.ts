import { describe, it, expect, beforeEach } from "vitest";
import { useTemplateStore } from "./useTemplateStore";

beforeEach(() => {
    useTemplateStore.getState().reset();
});

describe("initial state", () => {
    it("has default dimensions 250x122", () => {
        const s = useTemplateStore.getState();
        expect(s.width).toBe(250);
        expect(s.height).toBe(122);
    });

    it("starts with no slots", () => {
        expect(useTemplateStore.getState().slots).toHaveLength(0);
    });

    it("starts with no selected slot", () => {
        expect(useTemplateStore.getState().selectedSlotId).toBeNull();
    });

    it("starts not dirty", () => {
        expect(useTemplateStore.getState().isDirty).toBe(false);
    });
});

describe("addSlot", () => {
    it("adds a title slot with uuid id", () => {
        useTemplateStore.getState().addSlot("title");
        const slots = useTemplateStore.getState().slots;
        expect(slots).toHaveLength(1);
        expect(slots[0].type).toBe("title");
        expect(slots[0].id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it("marks dirty after adding", () => {
        useTemplateStore.getState().addSlot("menu");
        expect(useTemplateStore.getState().isDirty).toBe(true);
    });

    it("applies type-specific defaults for narrative", () => {
        useTemplateStore.getState().addSlot("narrative");
        const slot = useTemplateStore.getState().slots[0];
        expect(slot.width_chars).toBe(30);
        expect(slot.max_lines).toBe(5);
        expect(slot.line_height).toBe(10);
    });

    it("applies type-specific defaults for separator", () => {
        useTemplateStore.getState().addSlot("separator");
        const slot = useTemplateStore.getState().slots[0];
        expect(slot.x0).toBe(1);
        expect(slot.x1).toBe(248);
    });

    it("accumulates multiple slots", () => {
        useTemplateStore.getState().addSlot("title");
        useTemplateStore.getState().addSlot("menu");
        expect(useTemplateStore.getState().slots).toHaveLength(2);
    });
});

describe("updateSlot", () => {
    it("updates x and y", () => {
        useTemplateStore.getState().addSlot("title");
        const id = useTemplateStore.getState().slots[0].id;
        useTemplateStore.getState().updateSlot(id, { x: 50, y: 10 });
        const slot = useTemplateStore.getState().slots[0];
        expect(slot.x).toBe(50);
        expect(slot.y).toBe(10);
    });

    it("marks dirty", () => {
        useTemplateStore.getState().addSlot("asset");
        useTemplateStore.setState({ isDirty: false });
        const id = useTemplateStore.getState().slots[0].id;
        useTemplateStore.getState().updateSlot(id, { width: 100 });
        expect(useTemplateStore.getState().isDirty).toBe(true);
    });

    it("ignores unknown id without throwing", () => {
        expect(() => useTemplateStore.getState().updateSlot("nonexistent", { x: 1 })).not.toThrow();
    });
});

describe("removeSlot", () => {
    it("removes the slot by id", () => {
        useTemplateStore.getState().addSlot("menu");
        const id = useTemplateStore.getState().slots[0].id;
        useTemplateStore.getState().removeSlot(id);
        expect(useTemplateStore.getState().slots).toHaveLength(0);
    });

    it("clears selectedSlotId if removed slot was selected", () => {
        useTemplateStore.getState().addSlot("title");
        const id = useTemplateStore.getState().slots[0].id;
        useTemplateStore.getState().selectSlot(id);
        useTemplateStore.getState().removeSlot(id);
        expect(useTemplateStore.getState().selectedSlotId).toBeNull();
    });

    it("keeps selectedSlotId if a different slot was removed", () => {
        useTemplateStore.getState().addSlot("title");
        useTemplateStore.getState().addSlot("menu");
        const [id1, id2] = useTemplateStore.getState().slots.map((s) => s.id);
        useTemplateStore.getState().selectSlot(id2);
        useTemplateStore.getState().removeSlot(id1);
        expect(useTemplateStore.getState().selectedSlotId).toBe(id2);
    });
});

describe("selectSlot", () => {
    it("sets the selected slot id", () => {
        useTemplateStore.getState().addSlot("asset");
        const id = useTemplateStore.getState().slots[0].id;
        useTemplateStore.getState().selectSlot(id);
        expect(useTemplateStore.getState().selectedSlotId).toBe(id);
    });

    it("can deselect with null", () => {
        useTemplateStore.getState().addSlot("asset");
        const id = useTemplateStore.getState().slots[0].id;
        useTemplateStore.getState().selectSlot(id);
        useTemplateStore.getState().selectSlot(null);
        expect(useTemplateStore.getState().selectedSlotId).toBeNull();
    });
});

describe("loadFromJSON", () => {
    it("loads template name and dimensions", () => {
        useTemplateStore.getState().loadFromJSON({
            template_name: "portrait_left",
            width: 200,
            height: 100,
            slots: [],
        });
        const s = useTemplateStore.getState();
        expect(s.templateName).toBe("portrait_left");
        expect(s.width).toBe(200);
        expect(s.height).toBe(100);
    });

    it("loads slots and assigns new uuids", () => {
        useTemplateStore.getState().loadFromJSON({
            template_name: "t",
            width: 250,
            height: 122,
            slots: [{ type: "title", x: 10, y: 4 }],
        });
        const slots = useTemplateStore.getState().slots;
        expect(slots).toHaveLength(1);
        expect(slots[0].type).toBe("title");
        expect(slots[0].id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it("resets isDirty to false after load", () => {
        useTemplateStore.getState().addSlot("title");
        useTemplateStore.getState().loadFromJSON({ template_name: "x", width: 250, height: 122, slots: [] });
        expect(useTemplateStore.getState().isDirty).toBe(false);
    });

    it("clears selected slot id", () => {
        useTemplateStore.getState().addSlot("menu");
        const id = useTemplateStore.getState().slots[0].id;
        useTemplateStore.getState().selectSlot(id);
        useTemplateStore.getState().loadFromJSON({ template_name: "x", width: 250, height: 122, slots: [] });
        expect(useTemplateStore.getState().selectedSlotId).toBeNull();
    });
});

describe("setResolution", () => {
    it("updates width and height", () => {
        useTemplateStore.getState().setResolution(200, 100);
        const s = useTemplateStore.getState();
        expect(s.width).toBe(200);
        expect(s.height).toBe(100);
    });

    it("marks dirty", () => {
        useTemplateStore.getState().setResolution(200, 100);
        expect(useTemplateStore.getState().isDirty).toBe(true);
    });
});

describe("setCampaignPath", () => {
    it("stores the path", () => {
        useTemplateStore.getState().setCampaignPath("/campaigns/blackwood");
        expect(useTemplateStore.getState().campaignPath).toBe("/campaigns/blackwood");
    });

    it("can be cleared with null", () => {
        useTemplateStore.getState().setCampaignPath("/campaigns/blackwood");
        useTemplateStore.getState().setCampaignPath(null);
        expect(useTemplateStore.getState().campaignPath).toBeNull();
    });
});

describe("reset", () => {
    it("restores default dimensions", () => {
        useTemplateStore.getState().setResolution(100, 50);
        useTemplateStore.getState().reset();
        const s = useTemplateStore.getState();
        expect(s.width).toBe(250);
        expect(s.height).toBe(122);
    });

    it("clears slots", () => {
        useTemplateStore.getState().addSlot("title");
        useTemplateStore.getState().reset();
        expect(useTemplateStore.getState().slots).toHaveLength(0);
    });

    it("preserves campaignPath so the user does not have to re-select it", () => {
        useTemplateStore.getState().setCampaignPath("/campaigns/blackwood");
        useTemplateStore.getState().reset();
        expect(useTemplateStore.getState().campaignPath).toBe("/campaigns/blackwood");
    });

    it("resets isDirty to false", () => {
        useTemplateStore.getState().addSlot("menu");
        useTemplateStore.getState().reset();
        expect(useTemplateStore.getState().isDirty).toBe(false);
    });
});
