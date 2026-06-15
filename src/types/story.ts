export type SceneTemplate = "location" | "item_found" | "text_scene";

export type Choice = {
    _key: string;
    text: string;
    next_scene?: string;
    action?: string;
    start_quests: string[];
    complete_quests: string[];
    add_items: string[];
    remove_items: string[];
    requires_items: string[];
    set_flags: Record<string, boolean>;
};

export type Scene = {
    id: string;
    title: string;
    text: string;
    scene_template?: SceneTemplate;
    can_revisit?: boolean;
    can_go_back?: boolean;
    asset?: string;
    choices: Choice[];
};

export type Story = {
    id: string;
    title: string;
    version: string;
    start_scene: string;
    scenes: Scene[];
};
