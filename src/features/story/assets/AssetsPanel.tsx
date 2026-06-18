import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { useStoryStore } from "../../../app/storyStore";
import "./AssetsPanel.css";

type AssetEntry = { rel: string; src: string };

function mimeFor(rel: string): string {
    const ext = rel.split(".").pop()?.toLowerCase() ?? "";
    if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
    if (ext === "gif") return "image/gif";
    if (ext === "webp") return "image/webp";
    return "image/png";
}

export function AssetsPanel() {
    const assetsDir = useStoryStore((s) => s.assetsDir);
    const setAssetsDir = useStoryStore((s) => s.setAssetsDir);
    const [assets, setAssets] = useState<AssetEntry[]>([]);
    const [loading, setLoading] = useState(false);

    const refreshAssets = useCallback(async () => {
        if (!assetsDir) { setAssets([]); return; }
        setLoading(true);
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
    }, [assetsDir]);

    useEffect(() => { refreshAssets(); }, [refreshAssets]);

    async function handleSetFolder() {
        const dir = await open({ title: "Select assets folder", directory: true });
        if (dir && typeof dir === "string") {
            setAssetsDir(dir);
        }
    }

    async function handleImport() {
        if (!assetsDir) return;
        const result = await open({
            title: "Import images",
            filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "webp", "gif"] }],
            multiple: true,
        });
        if (!result) return;
        const files = Array.isArray(result) ? result : [result];
        await Promise.all(
            files.map((src) => {
                const filename = src.split(/[/\\]/).pop() ?? "image.png";
                return invoke("copy_file", { src, dest: `${assetsDir}/${filename}` });
            })
        );
        await refreshAssets();
    }

    return (
        <div className="assetsPanel">
            <div className="assetsHeader">
                <div className="assetsFolderInfo">
                    <span className="assetsFolderLabel">Assets Folder</span>
                    <span className="assetsFolderPath">{assetsDir ?? "Not set"}</span>
                </div>
                <div className="assetsHeaderActions">
                    <button type="button" className="assetsBtnSecondary" onClick={handleSetFolder}>
                        {assetsDir ? "Change Folder" : "Set Folder"}
                    </button>
                    {assetsDir && (
                        <button type="button" className="assetsBtnPrimary" onClick={handleImport}>
                            Import Images
                        </button>
                    )}
                </div>
            </div>

            {!assetsDir ? (
                <div className="assetsEmpty">
                    <p className="assetsEmptyHint">
                        Set an assets folder to start managing your campaign images. Once set, this
                        folder is saved with your project and its contents are copied to the campaign
                        bundle when you export.
                    </p>
                </div>
            ) : loading ? (
                <div className="assetsLoading">Loading…</div>
            ) : assets.length === 0 ? (
                <div className="assetsEmpty">
                    <p className="assetsEmptyHint">
                        No images found. Click <strong>Import Images</strong> to copy image files
                        into your assets folder.
                    </p>
                </div>
            ) : (
                <>
                    <div className="assetsCount">{assets.length} {assets.length === 1 ? "image" : "images"}</div>
                    <div className="assetsGrid">
                        {assets.map(({ rel, src }) => (
                            <div key={rel} className="assetsThumb">
                                <img src={src} alt={rel} className="assetsThumbImg" />
                                <span className="assetsThumbLabel" title={rel}>{rel}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
