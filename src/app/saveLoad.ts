import { save, open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { useStoryStore } from "./storyStore";
import { loadCampaign } from "./campaignLoader";
import type { Story } from "../types/story";

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s_]/g, "")
        .trim()
        .replace(/\s+/g, "_");
}

function buildSnapshot(): Story {
    const s = useStoryStore.getState();
    return {
        id: s.storyId || slugify(s.storyTitle) || "untitled",
        title: s.storyTitle || "Untitled Story",
        version: "1.0",
        author: s.storyAuthor || undefined,
        start_scene: s.startScene ?? "",
        scenes: s.scenes,
        items: s.items,
        quests: s.quests,
        monsters: s.monsters,
        classes: s.classes,
        spells: s.spells,
    };
}

export async function saveProject(pathOverride?: string): Promise<boolean> {
    const { filePath, storyTitle, setFilePath, markSaved } = useStoryStore.getState();
    const targetPath = pathOverride ?? filePath;

    const finalPath =
        targetPath ??
        (await save({
            filters: [{ name: "soloRPG Story", extensions: ["json"] }],
            defaultPath: `${storyTitle || "story"}.json`,
        }));

    if (!finalPath) return false;

    try {
        const snapshot = buildSnapshot();
        await invoke("save_project", {
            path: finalPath,
            content: JSON.stringify(snapshot, null, 2),
        });
        setFilePath(finalPath);
        markSaved();
        return true;
    } catch (err) {
        console.error("Save failed:", err);
        return false;
    }
}

export async function openProject(): Promise<boolean> {
    const selected = await open({
        filters: [{ name: "soloRPG Story", extensions: ["json"] }],
        multiple: false,
    });

    if (!selected || typeof selected !== "string") return false;

    try {
        const content = await invoke<string>("load_project", { path: selected });
        const story: Story = JSON.parse(content);
        useStoryStore.getState().loadStory(story, selected);
        return true;
    } catch (err) {
        console.error("Load failed:", err);
        return false;
    }
}

export async function openCampaign(): Promise<boolean> {
    const selected = await open({
        title: "Select campaign manifest.json",
        filters: [{ name: "Campaign Manifest", extensions: ["json"] }],
        multiple: false,
    });

    if (!selected || typeof selected !== "string") return false;

    try {
        const story = await loadCampaign(selected);
        useStoryStore.getState().loadStory(story, selected);
        return true;
    } catch (err) {
        console.error("Campaign load failed:", err);
        return false;
    }
}
