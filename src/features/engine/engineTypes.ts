export type EngineFileCheck = {
    label: string;
    path: string;
    exists: boolean;
};

export type EngineCommandOutput = {
    status: number | null;
    stdout: string;
    stderr: string;
};

export type EngineInspectionResult = {
    engineRoot: string;
    checks: EngineFileCheck[];
    effectContract: EngineCommandOutput;
    navigationContract: EngineCommandOutput;
};