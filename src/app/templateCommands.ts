import { invoke } from "@tauri-apps/api/core";

export async function saveTemplate(
    campaignPath: string,
    templateName: string,
    content: string,
): Promise<void> {
    return invoke("save_template", { campaignPath, templateName, content });
}

export async function listTemplates(campaignPath: string): Promise<string[]> {
    return invoke("list_templates", { campaignPath });
}
