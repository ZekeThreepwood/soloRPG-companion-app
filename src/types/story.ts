export type SceneTemplate = string;

export type Item = {
    id: string;
    name: string;
    description: string;
};

export type Quest = {
    id: string;
    name: string;
    description: string;
};

export type Spell = {
    id: string;
    name: string;
    type: string;
    stat?: string;
    power: number;
    attack_bonus?: number;
};

export type Monster = {
    id: string;
    name: string;
    asset?: string;
    hp: number;
    armor_class: number;
    initiative: number;
    attack_bonus: number;
    damage: number;
    spells: Spell[];
};

export type ClassStats = {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
};

export type ClassCombat = {
    armor_class: number;
    attack_stat: string;
    attack_bonus: number;
    damage: number;
};

export type CharacterClass = {
    id: string;
    name: string;
    description: string;
    asset?: string;
    base_hp: number;
    stats: ClassStats;
    combat: ClassCombat;
    spells: string[];
    inventory: string[];
};

export type AbilityCheck = {
    stat: string;
    difficulty: number;
    success_scene?: string;
    failure_scene?: string;
};

export type Encounter = {
    monster: string;
    win_scene?: string;
    lose_scene?: string;
    flee_scene?: string;
    flee_difficulty?: number;
    win_add_items?: string[];
    win_remove_items?: string[];
    win_set_flags?: Record<string, boolean>;
    win_start_quests?: string[];
    win_complete_quests?: string[];
    win_fail_quests?: string[];
    lose_add_items?: string[];
    lose_remove_items?: string[];
    lose_set_flags?: Record<string, boolean>;
    lose_start_quests?: string[];
    lose_complete_quests?: string[];
    lose_fail_quests?: string[];
    flee_add_items?: string[];
    flee_remove_items?: string[];
    flee_set_flags?: Record<string, boolean>;
    flee_start_quests?: string[];
    flee_complete_quests?: string[];
    flee_fail_quests?: string[];
};

export type Choice = {
    _key: string;
    text: string;
    next_scene?: string;
    action?: string;
    check?: AbilityCheck;
    requires_items: string[];
    requires_missing_items: string[];
    requires_flags: Record<string, boolean>;
    add_items: string[];
    remove_items: string[];
    start_quests: string[];
    complete_quests: string[];
    fail_quests: string[];
    set_flags: Record<string, boolean>;
    heal?: number;
    full_heal?: boolean;
};

export type Scene = {
    id: string;
    title: string;
    text: string;
    scene_template?: SceneTemplate;
    speaker?: string;
    can_revisit?: boolean;
    can_go_back?: boolean;
    asset?: string;
    encounter?: Encounter;
    choices: Choice[];
};

export type Story = {
    id: string;
    title: string;
    version: string;
    author?: string;
    description?: string;
    start_scene: string;
    scenes: Scene[];
    items: Item[];
    quests: Quest[];
    monsters: Monster[];
    classes: CharacterClass[];
    spells: Spell[];
    assetsDir?: string;
};
