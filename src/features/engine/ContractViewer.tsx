import { useAppStore } from "../../app/store";

function formatJsonOrText(value: string): string {
    try {
        return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
        return value;
    }
}

export function ContractViewer() {
    const { inspection, error, loading } = useAppStore();

    if (loading) {
        return (
            <section className="panel">
                <h2>Loading engine contracts...</h2>
                <p>Running engine contract scripts.</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="panel error">
                <h2>Error</h2>
                <pre>{error}</pre>
            </section>
        );
    }

    if (!inspection) {
        return (
            <section className="panel">
                <h2>No engine loaded</h2>
                <p>Open your soloRPG engine root to load the current engine contracts.</p>
            </section>
        );
    }

    return (
        <section className="contracts">
            <div className="panel">
                <h2>Engine File Checks</h2>

                <ul className="checkList">
                    {inspection.checks.map((check) => (
                        <li key={check.path}>
                            <strong>{check.exists ? "✅" : "❌"} {check.label}</strong>
                            <br />
                            <code>{check.path}</code>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="panel">
                <h2>Effect Contract</h2>
                <p>Status: {inspection.effectContract.status ?? "unknown"}</p>

                {inspection.effectContract.stderr && (
                    <>
                        <h3>stderr</h3>
                        <pre className="stderr">{inspection.effectContract.stderr}</pre>
                    </>
                )}

                <pre>{formatJsonOrText(inspection.effectContract.stdout)}</pre>
            </div>

            <div className="panel">
                <h2>Navigation Contract</h2>
                <p>Status: {inspection.navigationContract.status ?? "unknown"}</p>

                {inspection.navigationContract.stderr && (
                    <>
                        <h3>stderr</h3>
                        <pre className="stderr">{inspection.navigationContract.stderr}</pre>
                    </>
                )}

                <pre>{formatJsonOrText(inspection.navigationContract.stdout)}</pre>
            </div>
        </section>
    );
}