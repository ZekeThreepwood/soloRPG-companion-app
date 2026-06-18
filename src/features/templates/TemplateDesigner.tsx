import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { useTemplateStore } from "./useTemplateStore";
import { buildLayoutJSON } from "./templateSerializer";
import { TemplateCanvas } from "./TemplateCanvas";
import { SlotInspector } from "./SlotInspector";
import type { SlotType } from "./useTemplateStore";
import "./TemplateDesigner.css";

const SLOT_TYPES: { type: SlotType; label: string }[] = [
    { type: "title",     label: "+ Title" },
    { type: "narrative", label: "+ Narrative" },
    { type: "asset",     label: "+ Asset" },
    { type: "menu",      label: "+ Menu" },
    { type: "separator", label: "+ Separator" },
];

function isValidTemplateName(name: string): boolean {
    return /^[a-z0-9_]+$/.test(name.trim());
}

export function TemplateDesigner() {
    const store = useTemplateStore();

    async function handlePickCampaign() {
        const dir = await open({ directory: true, title: "Select Campaign Folder" });
        if (dir) store.setCampaignPath(dir as string);
    }

    async function handleSave() {
        const name = store.templateName.trim();
        if (!name) {
            alert("Template name is required.");
            return;
        }
        if (!isValidTemplateName(name)) {
            alert("Template name must use only lowercase letters, digits, and underscores (e.g. portrait_left).");
            return;
        }

        if (!store.campaignPath) {
            await handlePickCampaign();
            if (!useTemplateStore.getState().campaignPath) return;
        }
        const path = useTemplateStore.getState().campaignPath!;
        const layout = buildLayoutJSON(store);
        await invoke("save_template", {
            campaignPath: path,
            templateName: name,
            content: JSON.stringify(layout, null, 2),
        });
        useTemplateStore.setState({ isDirty: false });
    }

    async function handleLoad() {
        const file = await open({
            filters: [{ name: "JSON Template", extensions: ["json"] }],
            title: "Open Template JSON",
            multiple: false,
        });
        if (!file || typeof file !== "string") return;
        const content = await invoke<string>("load_project", { path: file });
        store.loadFromJSON(JSON.parse(content));
    }

    function handleNew() {
        if (store.isDirty) {
            const ok = confirm("Discard unsaved changes and start a new template?");
            if (!ok) return;
        }
        store.reset();
    }

    return (
        <div className="templateDesigner">
            <div className="designerToolbar">
                <div className="toolbarLeft">
                    <label className="toolbarField">
                        <span>Name</span>
                        <input
                            type="text"
                            value={store.templateName}
                            onChange={(e) => store.setTemplateName(e.target.value)}
                            placeholder="my_template"
                            className={!isValidTemplateName(store.templateName) && store.templateName !== "" ? "invalidName" : ""}
                        />
                    </label>
                    <label className="toolbarField">
                        <span>W</span>
                        <input
                            type="number"
                            value={store.width}
                            onChange={(e) => store.setResolution(parseInt(e.target.value) || 250, store.height)}
                            style={{ width: 60 }}
                        />
                    </label>
                    <label className="toolbarField">
                        <span>H</span>
                        <input
                            type="number"
                            value={store.height}
                            onChange={(e) => store.setResolution(store.width, parseInt(e.target.value) || 122)}
                            style={{ width: 60 }}
                        />
                    </label>
                </div>

                <div className="toolbarSlots">
                    {SLOT_TYPES.map(({ type, label }) => (
                        <button
                            key={type}
                            type="button"
                            className={`addSlotBtn addSlotBtn-${type}`}
                            onClick={() => store.addSlot(type)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="toolbarRight">
                    <button type="button" className="toolbarBtn" onClick={handlePickCampaign}>
                        {store.campaignPath ? "📁 Campaign Set" : "Set Campaign"}
                    </button>
                    <button type="button" className="toolbarBtn" onClick={handleNew}>
                        New
                    </button>
                    <button type="button" className="toolbarBtn" onClick={handleLoad}>
                        Load
                    </button>
                    <button
                        type="button"
                        className={`toolbarBtn saveBtn${store.isDirty ? " dirtyBtn" : ""}`}
                        onClick={handleSave}
                    >
                        {store.isDirty ? "Save*" : "Save"}
                    </button>
                </div>
            </div>

            <div className="designerBody">
                <div className="canvasArea">
                    <TemplateCanvas />
                </div>
                <div className="inspectorArea">
                    <SlotInspector />
                </div>
            </div>
        </div>
    );
}
