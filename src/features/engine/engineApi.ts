import { invoke } from "@tauri-apps/api/core";
import type { EngineInspectionResult } from "./engineTypes";

export async function inspectEngineRoot(
    engineRoot: string
): Promise<EngineInspectionResult> {
    return invoke<EngineInspectionResult>("inspect_engine_root", {
        engineRoot,
    });
}