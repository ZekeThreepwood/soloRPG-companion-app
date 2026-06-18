import { useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useTemplateStore } from "./useTemplateStore";
import { TemplateDesigner } from "./TemplateDesigner";
import "./TemplateDesignerView.css";

type TemplateDesignerViewProps = {
    onBack: () => void;
};

export function TemplateDesignerView({ onBack }: TemplateDesignerViewProps) {
    const didResize = useRef(false);
    const isDirty = useTemplateStore((s) => s.isDirty);

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

    function handleBack() {
        if (isDirty) {
            const ok = confirm("You have unsaved changes. Leave without saving?");
            if (!ok) return;
        }
        onBack();
    }

    return (
        <main className="templateDesignerPage">
            <div className="templateDesignerHeader">
                <button type="button" className="backBtn" onClick={handleBack}>
                    ← Back
                </button>
                <h1 className="templateDesignerTitle">Template Editor</h1>
                {isDirty && <span className="unsavedBadge">Unsaved</span>}
            </div>
            <div className="templateDesignerContent">
                <TemplateDesigner />
            </div>
        </main>
    );
}
