import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useStoryStore } from "../../app/storyStore";
import "./AssetPickerInput.css";

type AssetEntry = { rel: string; src: string };

type Props = {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
};

function mimeFor(rel: string): string {
    const ext = rel.split(".").pop()?.toLowerCase() ?? "";
    if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
    if (ext === "gif") return "image/gif";
    if (ext === "webp") return "image/webp";
    return "image/png";
}

export function AssetPickerInput({ value, onChange, placeholder = "campaign://assets/..." }: Props) {
    const assetsDir = useStoryStore((s) => s.assetsDir);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [assets, setAssets] = useState<AssetEntry[]>([]);

    async function openPicker() {
        setOpen(true);
        if (!assetsDir) return;
        setLoading(true);
        setAssets([]);
        try {
            const paths = await invoke<string[]>("list_dir_images", { dir: assetsDir });
            const entries = await Promise.all(
                paths.map(async (rel) => {
                    const abs = `${assetsDir}/${rel}`;
                    const b64 = await invoke<string>("read_image_base64", { path: abs });
                    return { rel, src: `data:${mimeFor(rel)};base64,${b64}` };
                })
            );
            setAssets(entries);
        } finally {
            setLoading(false);
        }
    }

    function pick(rel: string) {
        onChange(`campaign://assets/${rel}`);
        setOpen(false);
    }

    return (
        <>
            <div className="assetPickerRow">
                <input
                    className="assetPickerInput"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                />
                <button type="button" className="assetPickerBtn" onClick={openPicker}>
                    Pick…
                </button>
                {value && (
                    <button type="button" className="assetPickerClear" onClick={() => onChange("")} title="Clear">
                        ×
                    </button>
                )}
            </div>

            {open && (
                <div className="assetPickerOverlay" onClick={() => setOpen(false)}>
                    <div className="assetPickerModal" onClick={(e) => e.stopPropagation()}>
                        <div className="assetPickerModalHeader">
                            <span className="assetPickerModalTitle">Asset Library</span>
                            <button type="button" className="assetPickerModalClose" onClick={() => setOpen(false)}>×</button>
                        </div>

                        {!assetsDir ? (
                            <div className="assetPickerEmpty">
                                No assets folder set. Go to the <strong>Assets</strong> tab to configure your library.
                            </div>
                        ) : loading ? (
                            <div className="assetPickerEmpty">Loading…</div>
                        ) : assets.length === 0 ? (
                            <div className="assetPickerEmpty">
                                No images in assets folder. Import some from the Assets tab.
                            </div>
                        ) : (
                            <div className="assetPickerGrid">
                                {assets.map(({ rel, src }) => (
                                    <button key={rel} type="button" className="assetPickerThumb" onClick={() => pick(rel)}>
                                        <img src={src} alt={rel} className="assetPickerThumbImg" />
                                        <span className="assetPickerThumbLabel">{rel.split("/").pop()}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
