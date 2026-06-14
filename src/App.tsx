import "./styles/app.css";
import { EngineRootPicker } from "./features/engine/EngineRootPicker";
import { ContractViewer } from "./features/engine/ContractViewer";

export default function App() {
    return (
        <main className="app">
            <header className="header">
                <p className="eyebrow">soloRPG Companion App</p>
                <h1>soloRPG Writer</h1>
                <p>
                    Campaign authoring tool for the soloRPG engine. MVP-0 loads the engine
                    contracts directly from your local Python project.
                </p>
            </header>

            <EngineRootPicker />
            <ContractViewer />
        </main>
    );
}