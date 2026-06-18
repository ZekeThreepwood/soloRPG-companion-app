import type { Story } from "../types/story";

export type Issue = {
    severity: "error" | "warning";
    message: string;
};

export type ValidationResult = {
    issues: Issue[];
    hasErrors: boolean;
};

export function validateCampaign(story: Story): ValidationResult {
    const issues: Issue[] = [];
    const sceneIds = new Set(story.scenes.map((s) => s.id));
    const itemIds = new Set(story.items.map((i) => i.id));
    const questIds = new Set(story.quests.map((q) => q.id));
    const monsterIds = new Set(story.monsters.map((m) => m.id));

    function err(msg: string) { issues.push({ severity: "error", message: msg }); }
    function warn(msg: string) { issues.push({ severity: "warning", message: msg }); }

    // ── Top-level ────────────────────────────────────────────────────────────
    if (story.scenes.length === 0) {
        err("Campaign has no scenes.");
    }

    if (!story.start_scene) {
        err("No start scene is set.");
    } else if (!sceneIds.has(story.start_scene)) {
        err(`Start scene "${story.start_scene}" does not exist.`);
    }

    // ── Per-scene ────────────────────────────────────────────────────────────
    for (const scene of story.scenes) {
        const at = `Scene "${scene.id}"`;

        if (!scene.text?.trim()) {
            warn(`${at}: has no text.`);
        }

        const isDeadEnd = scene.choices.length === 0 && !scene.encounter;
        if (isDeadEnd && scene.id !== story.start_scene) {
            warn(`${at}: dead end — no choices and no encounter.`);
        }

        if (scene.choices.length > 3) {
            warn(`${at}: has ${scene.choices.length} choices — the engine only shows 3 at a time. Players won't see choices beyond #3.`);
        }

        // Encounter
        if (scene.encounter) {
            const enc = scene.encounter;

            if (!monsterIds.has(enc.monster)) {
                warn(`${at}: encounter references unknown monster "${enc.monster}".`);
            }
            if (enc.win_scene && !sceneIds.has(enc.win_scene)) {
                err(`${at}: encounter win_scene "${enc.win_scene}" does not exist.`);
            }
            if (enc.lose_scene && !sceneIds.has(enc.lose_scene)) {
                err(`${at}: encounter lose_scene "${enc.lose_scene}" does not exist.`);
            }
            if (enc.flee_scene && !sceneIds.has(enc.flee_scene)) {
                err(`${at}: encounter flee_scene "${enc.flee_scene}" does not exist.`);
            }

            checkItems([
                ...enc.win_add_items ?? [],
                ...enc.win_remove_items ?? [],
                ...enc.lose_add_items ?? [],
                ...enc.lose_remove_items ?? [],
                ...enc.flee_add_items ?? [],
                ...enc.flee_remove_items ?? [],
            ], itemIds, `${at}: encounter`, warn);

            checkQuests([
                ...enc.win_start_quests ?? [],
                ...enc.win_complete_quests ?? [],
                ...enc.win_fail_quests ?? [],
                ...enc.lose_start_quests ?? [],
                ...enc.lose_complete_quests ?? [],
                ...enc.lose_fail_quests ?? [],
                ...enc.flee_start_quests ?? [],
                ...enc.flee_complete_quests ?? [],
                ...enc.flee_fail_quests ?? [],
            ], questIds, `${at}: encounter`, warn);
        }

        // Choices
        for (const choice of scene.choices) {
            const label = choice.text ? `choice "${choice.text}"` : "unnamed choice";
            const atC = `${at}: ${label}`;

            if (!choice.text?.trim()) {
                warn(`${at}: has a choice with no text.`);
            }

            if (choice.next_scene && !sceneIds.has(choice.next_scene)) {
                err(`${atC}: next_scene "${choice.next_scene}" does not exist.`);
            }

            if (choice.check) {
                if (choice.check.success_scene && !sceneIds.has(choice.check.success_scene)) {
                    err(`${atC}: ability check success_scene "${choice.check.success_scene}" does not exist.`);
                }
                if (choice.check.failure_scene && !sceneIds.has(choice.check.failure_scene)) {
                    err(`${atC}: ability check failure_scene "${choice.check.failure_scene}" does not exist.`);
                }
            }

            checkItems([
                ...choice.add_items,
                ...choice.remove_items,
                ...choice.requires_items,
                ...choice.requires_missing_items,
            ], itemIds, atC, warn);

            checkQuests([
                ...choice.start_quests,
                ...choice.complete_quests,
                ...choice.fail_quests,
            ], questIds, atC, warn);
        }
    }

    return {
        issues,
        hasErrors: issues.some((i) => i.severity === "error"),
    };
}

function checkItems(
    ids: string[],
    known: Set<string>,
    context: string,
    warn: (msg: string) => void,
) {
    for (const id of ids) {
        if (!known.has(id)) {
            warn(`${context} references unknown item "${id}".`);
        }
    }
}

function checkQuests(
    ids: string[],
    known: Set<string>,
    context: string,
    warn: (msg: string) => void,
) {
    for (const id of ids) {
        if (!known.has(id)) {
            warn(`${context} references unknown quest "${id}".`);
        }
    }
}
