import { open } from "@tauri-apps/plugin-dialog";
import { inspectEngineRoot } from "./engineApi";
import { useAppStore } from "../../app/store";

export function EngineRootPicker() {
    const {
        engineRoot,
        loading,
        setEngineRoot,
        setInspection,
        setError,
        setLoading,
    } = useAppStore();

    async function handleOpenEngineRoot() {
        setError(null);
        setInspection(null);
        setLoading(true);

        try {
            const selected = await open({
                directory: true,
                multiple: false,
                title: "Open soloRPG Engine Root",
            });

            if (!selected || Array.isArray(selected)) {
                return;
            }

            setEngineRoot(selected);

            const result = await inspectEngineRoot(selected);
            setInspection(result);
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="panel">
            <div className="panelHeader">
                <div>
                    <h2>Engine Root</h2>
                    <p>Select the existing Python soloRPG engine folder.</p>
                </div>

                <button onClick={handleOpenEngineRoot} disabled={loading}>
                    {loading ? "Loading..." : "Open Engine Root"}
                </button>
            </div>

            {engineRoot && (
                <p className="path">
                    {engineRoot}
                </p>
            )}
        </section>
    );
}