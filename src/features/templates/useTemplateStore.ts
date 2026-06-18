import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export type SlotType = "title" | "narrative" | "asset" | "separator" | "menu";

export interface TemplateSlot {
    id: string;
    type: SlotType;
    x: number;
    y: number;
    width?: number;
    height?: number;
    x0?: number;
    x1?: number;
    width_chars?: number;
    max_lines?: number;
    line_height?: number;
}

interface TemplateDesignerState {
    templateName: string;
    description: string;
    width: number;
    height: number;
    slots: TemplateSlot[];
    selectedSlotId: string | null;
    isDirty: boolean;
    campaignPath: string | null;

    setTemplateName: (name: string) => void;
    setDescription: (desc: string) => void;
    setResolution: (width: number, height: number) => void;
    addSlot: (type: SlotType) => void;
    updateSlot: (id: string, changes: Partial<Omit<TemplateSlot, "id">>) => void;
    removeSlot: (id: string) => void;
    selectSlot: (id: string | null) => void;
    loadFromJSON: (layout: object) => void;
    reset: () => void;
    setCampaignPath: (path: string | null) => void;
}

function defaultForType(type: SlotType): Partial<TemplateSlot> {
    switch (type) {
        case "title":     return { x: 4, y: 4 };
        case "narrative": return { x: 4, y: 20, width_chars: 30, max_lines: 5, line_height: 10 };
        case "asset":     return { x: 0, y: 0, width: 60, height: 60 };
        case "separator": return { x: 0, y: 14, x0: 1, x1: 248 };
        case "menu":      return { x: 4, y: 80, line_height: 12 };
    }
}

const INITIAL: Pick<TemplateDesignerState,
    "templateName" | "description" | "width" | "height" |
    "slots" | "selectedSlotId" | "isDirty" | "campaignPath"
> = {
    templateName: "my_template",
    description: "",
    width: 250,
    height: 122,
    slots: [],
    selectedSlotId: null,
    isDirty: false,
    campaignPath: null,
};

export const useTemplateStore = create<TemplateDesignerState>()((set) => ({
    ...INITIAL,

    setTemplateName: (name) => set({ templateName: name, isDirty: true }),
    setDescription: (desc) => set({ description: desc, isDirty: true }),
    setResolution: (width, height) => set({ width, height, isDirty: true }),

    addSlot: (type) => set((s) => ({
        slots: [...s.slots, { id: uuidv4(), type, ...defaultForType(type) } as TemplateSlot],
        isDirty: true,
    })),

    updateSlot: (id, changes) => set((s) => ({
        slots: s.slots.map((slot) => slot.id === id ? { ...slot, ...changes } : slot),
        isDirty: true,
    })),

    removeSlot: (id) => set((s) => ({
        slots: s.slots.filter((slot) => slot.id !== id),
        selectedSlotId: s.selectedSlotId === id ? null : s.selectedSlotId,
        isDirty: true,
    })),

    selectSlot: (id) => set({ selectedSlotId: id }),

    loadFromJSON: (layout) => {
        const l = layout as Record<string, unknown>;
        const slots = ((l.slots as unknown[]) ?? []).map((raw) => {
            const s = raw as Record<string, unknown>;
            return { id: uuidv4(), ...s } as TemplateSlot;
        });
        set({
            templateName: (l.template_name as string) ?? "my_template",
            description: (l.description as string) ?? "",
            width: (l.width as number) ?? 250,
            height: (l.height as number) ?? 122,
            slots,
            selectedSlotId: null,
            isDirty: false,
        });
    },

    reset: () => set({ ...INITIAL }),

    setCampaignPath: (path) => set({ campaignPath: path }),
}));
