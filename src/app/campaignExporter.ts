import { invoke } from "@tauri-apps/api/core";
import type { Choice, Encounter, Scene, Story } from "../types/story";

// ---------------------------------------------------------------------------
// Scene / choice serialization
// ---------------------------------------------------------------------------

export function serializeChoice(choice: Choice): Record<string, unknown> {
    const out: Record<string, unknown> = { text: choice.text };
    if (choice.next_scene) out.next_scene = choice.next_scene;
    if (choice.action) out.action = choice.action;
    if (choice.heal != null) out.heal = choice.heal;
    if (choice.full_heal) out.full_heal = true;
    if (choice.add_items?.length) out.add_items = choice.add_items;
    if (choice.remove_items?.length) out.remove_items = choice.remove_items;
    if (choice.requires_items?.length) out.requires_items = choice.requires_items;
    if (choice.requires_missing_items?.length) out.requires_missing_items = choice.requires_missing_items;
    if (Object.keys(choice.requires_flags ?? {}).length) out.requires_flags = choice.requires_flags;
    if (Object.keys(choice.set_flags ?? {}).length) out.set_flags = choice.set_flags;
    if (choice.start_quests?.length) out.start_quests = choice.start_quests;
    if (choice.complete_quests?.length) out.complete_quests = choice.complete_quests;
    if (choice.fail_quests?.length) out.fail_quests = choice.fail_quests;
    if (choice.check) out.check = choice.check;
    return out;
}

export function serializeEncounter(enc: Encounter): Record<string, unknown> {
    const out: Record<string, unknown> = {
        monster: enc.monster,
        win_scene: enc.win_scene ?? "",
        lose_scene: enc.lose_scene ?? "",
    };
    if (enc.flee_scene) out.flee_scene = enc.flee_scene;
    if (enc.flee_difficulty != null) out.flee_difficulty = enc.flee_difficulty;
    if (enc.win_add_items?.length) out.win_add_items = enc.win_add_items;
    if (enc.win_remove_items?.length) out.win_remove_items = enc.win_remove_items;
    if (Object.keys(enc.win_set_flags ?? {}).length) out.win_set_flags = enc.win_set_flags;
    if (enc.win_start_quests?.length) out.win_start_quests = enc.win_start_quests;
    if (enc.win_complete_quests?.length) out.win_complete_quests = enc.win_complete_quests;
    if (enc.win_fail_quests?.length) out.win_fail_quests = enc.win_fail_quests;
    if (enc.lose_add_items?.length) out.lose_add_items = enc.lose_add_items;
    if (enc.lose_remove_items?.length) out.lose_remove_items = enc.lose_remove_items;
    if (Object.keys(enc.lose_set_flags ?? {}).length) out.lose_set_flags = enc.lose_set_flags;
    if (enc.lose_start_quests?.length) out.lose_start_quests = enc.lose_start_quests;
    if (enc.lose_complete_quests?.length) out.lose_complete_quests = enc.lose_complete_quests;
    if (enc.lose_fail_quests?.length) out.lose_fail_quests = enc.lose_fail_quests;
    if (enc.flee_add_items?.length) out.flee_add_items = enc.flee_add_items;
    if (enc.flee_remove_items?.length) out.flee_remove_items = enc.flee_remove_items;
    if (Object.keys(enc.flee_set_flags ?? {}).length) out.flee_set_flags = enc.flee_set_flags;
    if (enc.flee_start_quests?.length) out.flee_start_quests = enc.flee_start_quests;
    if (enc.flee_complete_quests?.length) out.flee_complete_quests = enc.flee_complete_quests;
    if (enc.flee_fail_quests?.length) out.flee_fail_quests = enc.flee_fail_quests;
    return out;
}

export function serializeScene(scene: Scene): Record<string, unknown> {
    const out: Record<string, unknown> = {
        title: scene.title,
        text: scene.text,
    };
    if (scene.scene_template) out.scene_template = scene.scene_template;
    if (scene.speaker) out.speaker = scene.speaker;
    if (scene.asset) out.asset = scene.asset;
    if (scene.can_go_back) out.can_go_back = true;
    if (scene.can_revisit) out.can_revisit = true;
    if (scene.encounter) out.encounter = serializeEncounter(scene.encounter);
    if (scene.choices.length > 0) out.choices = scene.choices.map(serializeChoice);
    return out;
}

// ---------------------------------------------------------------------------
// Top-level file builders
// ---------------------------------------------------------------------------

export function buildManifest(story: Story): Record<string, unknown> {
    const out: Record<string, unknown> = {
        id: story.id,
        title: story.title,
        version: story.version,
        start_scene: story.start_scene,
        campaign_file: "campaign.json",
        items_file: "items.json",
        quests_file: "quests.json",
    };
    if (story.author) out.author = story.author;
    if (story.description) out.description = story.description;
    return out;
}

export function buildCampaignFile(story: Story): Record<string, unknown> {
    const scenes: Record<string, unknown> = {};
    for (const scene of story.scenes) {
        scenes[scene.id] = serializeScene(scene);
    }
    return {
        id: story.id,
        title: story.title,
        start_scene: story.start_scene,
        scenes,
    };
}

export function buildItemsFile(story: Story): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const item of story.items) {
        out[item.id] = { name: item.name, description: item.description };
    }
    return out;
}

export function buildQuestsFile(story: Story): Record<string, unknown> {
    const quests: Record<string, unknown> = {};
    for (const quest of story.quests) {
        quests[quest.id] = { name: quest.name, description: quest.description };
    }
    return { quests };
}

export function buildMonsterDefinitionsFile(story: Story): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const monster of story.monsters) {
        const m: Record<string, unknown> = {
            name: monster.name,
            hp: monster.hp,
            armor_class: monster.armor_class,
            initiative: monster.initiative,
            attack_bonus: monster.attack_bonus,
            damage: monster.damage,
            spells: monster.spells,
        };
        if (monster.asset) m.asset = monster.asset;
        out[monster.id] = m;
    }
    return out;
}

export function buildClassesFile(story: Story): Record<string, unknown> {
    // Spell registry keyed by id for quick lookup
    const spellRegistry = new Map(story.spells.map((s) => [s.id, s]));

    const character_classes: Record<string, unknown> = {};
    for (const cls of story.classes) {
        // Resolve spell IDs back to full spell objects for engine format
        const spellObjects = cls.spells
            .map((id) => spellRegistry.get(id))
            .filter(Boolean);

        const c: Record<string, unknown> = {
            name: cls.name,
            description: cls.description,
            base_hp: cls.base_hp,
            stats: cls.stats,
            combat: cls.combat,
            spells: spellObjects,
            inventory: cls.inventory,
        };
        if (cls.asset) c.asset = cls.asset;
        character_classes[cls.id] = c;
    }
    return { character_classes };
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

async function writeJson(path: string, data: unknown): Promise<void> {
    await invoke("save_project", {
        path,
        content: JSON.stringify(data, null, 2),
    });
}

export async function exportCampaignToFolder(
    story: Story,
    dir: string,
    assetsDir?: string | null,
    templatesDir?: string | null,
): Promise<void> {
    const base = `${dir}/${story.id}`;
    await Promise.all([
        writeJson(`${base}/manifest.json`, buildManifest(story)),
        writeJson(`${base}/campaign.json`, buildCampaignFile(story)),
        writeJson(`${base}/items.json`, buildItemsFile(story)),
        writeJson(`${base}/quests.json`, buildQuestsFile(story)),
        writeJson(`${base}/monster_definitions.json`, buildMonsterDefinitionsFile(story)),
        writeJson(`${base}/classes.json`, buildClassesFile(story)),
        assetsDir
            ? invoke("copy_dir_all", { src: assetsDir, dest: `${base}/assets` })
            : Promise.resolve(),
        templatesDir
            ? invoke("copy_dir_all", { src: templatesDir, dest: `${base}/templates` })
            : Promise.resolve(),
    ]);
}
