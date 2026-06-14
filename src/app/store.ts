import { create } from "zustand";
import type { EngineInspectionResult } from "../features/engine/engineTypes";

type AppState = {
    engineRoot: string | null;
    inspection: EngineInspectionResult | null;
    error: string | null;
    loading: boolean;

    setEngineRoot: (path: string | null) => void;
    setInspection: (inspection: EngineInspectionResult | null) => void;
    setError: (error: string | null) => void;
    setLoading: (loading: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
    engineRoot: null,
    inspection: null,
    error: null,
    loading: false,

    setEngineRoot: (engineRoot) => set({ engineRoot }),
    setInspection: (inspection) => set({ inspection }),
    setError: (error) => set({ error }),
    setLoading: (loading) => set({ loading }),
}));