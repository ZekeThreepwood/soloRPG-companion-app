import { invoke } from "@tauri-apps/api/core";
import type {
    CharacterClass,
    Choice,
    ClassCombat,
    ClassStats,
    Encounter,
    Item,
    Monster,
    Quest,
    Scene,
    Spell,
    Story,
} from "../types/story";

function dirOf(filePath: string): string {
    return filePath.replace(/[/\\][^/\\]+$/, "");
}

async function readJson<T>(path: string): Promise<T> {
    const content = await invoke<string>("load_project", { path });
    return JSON.parse(content) as T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeChoice(raw: any): Choice {
    return {
        _key: crypto.randomUUID(),
        text: raw.text ?? "",
        next_scene: raw.next_scene,
        action: raw.action,
        check: raw.check,
        requires_items: raw.requires_items ?? [],
        requires_missing_items: raw.requires_missing_items ?? [],
        requires_flags: raw.requires_flags ?? {},
        add_items: raw.add_items ?? [],
        remove_items: raw.remove_items ?? [],
        start_quests: raw.start_quests ?? [],
        complete_quests: raw.complete_quests ?? [],
        fail_quests: raw.fail_quests ?? [],
        set_flags: raw.set_flags ?? {},
        heal: raw.heal,
        full_heal: raw.full_heal,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeScene(id: string, raw: any): Scene {
    return {
        id,
        title: raw.title ?? id,
        text: raw.text ?? "",
        scene_template: raw.scene_template,
        speaker: raw.speaker,
        can_revisit: raw.can_revisit,
        can_go_back: raw.can_go_back,
        asset: raw.asset,
        encounter: raw.encounter as Encounter | undefined,
        choices: (raw.choices ?? []).map(normalizeChoice),
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeItems(raw: Record<string, any>): Item[] {
    return Object.entries(raw).map(([id, data]) => ({
        id,
        name: data.name ?? id,
        description: data.description ?? "",
    }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeQuests(raw: Record<string, any>): Quest[] {
    return Object.entries(raw).map(([id, data]) => ({
        id,
        name: data.name ?? id,
        description: data.description ?? "",
    }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMonsters(raw: Record<string, any>): Monster[] {
    return Object.entries(raw).map(([id, data]) => ({
        id,
        name: data.name ?? id,
        asset: data.asset,
        hp: data.hp ?? 0,
        armor_class: data.armor_class ?? 0,
        initiative: data.initiative ?? 0,
        attack_bonus: data.attack_bonus ?? 0,
        damage: data.damage ?? 0,
        spells: data.spells ?? [],
    }));
}

const DEFAULT_STATS: ClassStats = {
    strength: 10, dexterity: 10, constitution: 10,
    intelligence: 10, wisdom: 10, charisma: 10,
};

const DEFAULT_COMBAT: ClassCombat = {
    armor_class: 10, attack_stat: "strength", attack_bonus: 0, damage: 2,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeClasses(raw: Record<string, any>): { classes: CharacterClass[]; spells: Spell[] } {
    const spellRegistry = new Map<string, Spell>();

    const classes: CharacterClass[] = Object.entries(raw).map(([id, data]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const embeddedSpells: any[] = data.spells ?? [];
        const spellIds: string[] = [];

        for (const s of embeddedSpells) {
            if (!spellRegistry.has(s.id)) {
                spellRegistry.set(s.id, {
                    id: s.id,
                    name: s.name ?? s.id,
                    type: s.type ?? "damage",
                    stat: s.stat,
                    power: s.power ?? 0,
                    attack_bonus: s.attack_bonus,
                });
            }
            spellIds.push(s.id);
        }

        return {
            id,
            name: data.name ?? id,
            description: data.description ?? "",
            asset: data.asset,
            base_hp: data.base_hp ?? 8,
            stats: { ...DEFAULT_STATS, ...(data.stats ?? {}) },
            combat: { ...DEFAULT_COMBAT, ...(data.combat ?? {}) },
            spells: spellIds,
            inventory: data.inventory ?? [],
        };
    });

    return { classes, spells: Array.from(spellRegistry.values()) };
}

export async function loadCampaign(manifestPath: string): Promise<Story> {
    const dir = dirOf(manifestPath);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const manifest = await readJson<any>(manifestPath);

    const campaignFile: string = manifest.campaign_file ?? "campaign.json";
    const itemsFile: string = manifest.items_file ?? "items.json";
    const questsFile: string = manifest.quests_file ?? "quests.json";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const campaign = await readJson<any>(`${dir}/${campaignFile}`);

    let items: Item[] = [];
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = await readJson<Record<string, any>>(`${dir}/${itemsFile}`);
        items = normalizeItems(raw);
    } catch { /* absent or malformed — skip */ }

    let quests: Quest[] = [];
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = await readJson<any>(`${dir}/${questsFile}`);
        quests = normalizeQuests(raw.quests ?? raw);
    } catch { /* absent — skip */ }

    let monsters: Monster[] = [];
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = await readJson<any>(`${dir}/monster_definitions.json`);
        monsters = normalizeMonsters(raw.monsters ?? raw);
    } catch { /* absent — skip */ }

    let classes: CharacterClass[] = [];
    let spells: Spell[] = [];
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = await readJson<any>(`${dir}/classes.json`);
        const result = normalizeClasses(raw.character_classes ?? raw);
        classes = result.classes;
        spells = result.spells;
    } catch { /* absent — skip */ }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scenesDict: Record<string, any> = campaign.scenes ?? {};
    const scenes = Object.entries(scenesDict).map(([id, raw]) => normalizeScene(id, raw));

    return {
        id: manifest.id ?? campaign.id ?? "untitled",
        title: manifest.title ?? campaign.title ?? "Untitled",
        version: manifest.version ?? campaign.version ?? "1.0",
        author: manifest.author,
        description: manifest.description,
        start_scene: manifest.start_scene ?? campaign.start_scene ?? "",
        scenes,
        items,
        quests,
        monsters,
        classes,
        spells,
    };
}
