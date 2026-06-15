export type SceneTemplate =
    | "location"
    | "item_found"
    | "text_scene"
    | "npc_chat"
    | "battle_intro";

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

export type Choice = {
    _key: string;
    text: string;
    next_scene?: string;
    action?: string;
    // Conditions — control when this choice is visible to the player
    requires_items: string[];
    requires_missing_items: string[];
    requires_flags: Record<string, boolean>;
    // Effects — happen when the player picks this choice
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
};
