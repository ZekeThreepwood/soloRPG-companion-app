import { useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { TemplateDesigner } from "./TemplateDesigner";
import "./TemplateDesignerView.css";

type TemplateDesignerViewProps = {
    onBack: () => void;
};

export function TemplateDesignerView({ onBack }: TemplateDesignerViewProps) {
    const didResize = useRef(false);

    useEffect(() => {
        if (didResize.current) return;
        didResize.current = true;

        async function expandWindow() {
            try {
                const win = getCurrentWindow();
                await win.hide();
                await win.setResizable(true);
                const alreadyMaximized = await win.isMaximized();
                if (!alreadyMaximized) await win.maximize();
                await win.show();
                await win.setFocus();
            } catch (error) {
                console.error("Failed to expand template editor window:", error);
            }
        }

        expandWindow();
    }, []);

    return (
        <main className="templateDesignerPage">
            <div className="templateDesignerHeader">
                <button type="button" className="backBtn" onClick={onBack}>
                    ← Back
                </button>
                <h1 className="templateDesignerTitle">Template Editor</h1>
            </div>
            <div className="templateDesignerContent">
                <TemplateDesigner />
            </div>
        </main>
    );
}
