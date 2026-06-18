import type { TemplateSlot } from "./useTemplateStore";

interface LayoutState {
    templateName: string;
    description: string;
    width: number;
    height: number;
    slots: TemplateSlot[];
}

type SlotOutput = Omit<TemplateSlot, "id">;

function serializeSlot(slot: TemplateSlot): SlotOutput {
    const { id: _id, ...rest } = slot;
    // drop undefined fields so the JSON stays clean
    return Object.fromEntries(
        Object.entries(rest).filter(([, v]) => v !== undefined),
    ) as SlotOutput;
}

export function buildLayoutJSON(state: LayoutState): object {
    return {
        template_name: state.templateName,
        description: state.description,
        required_fields: [],
        optional_fields: [],
        width: state.width,
        height: state.height,
        slots: state.slots.map(serializeSlot),
    };
}
