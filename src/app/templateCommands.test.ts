import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@tauri-apps/api/core", () => ({ invoke: vi.fn() }));

import { invoke } from "@tauri-apps/api/core";
import { saveTemplate, listTemplates } from "./templateCommands";

const mockInvoke = vi.mocked(invoke);

beforeEach(() => {
    mockInvoke.mockReset();
});

describe("saveTemplate", () => {
    it("calls invoke with save_template and correct args", async () => {
        mockInvoke.mockResolvedValueOnce(undefined);
        await saveTemplate("/campaigns/blackwood", "portrait_left", '{"template_name":"portrait_left"}');
        expect(mockInvoke).toHaveBeenCalledWith("save_template", {
            campaignPath: "/campaigns/blackwood",
            templateName: "portrait_left",
            content: '{"template_name":"portrait_left"}',
        });
    });

    it("resolves to undefined on success", async () => {
        mockInvoke.mockResolvedValueOnce(undefined);
        const result = await saveTemplate("/campaigns/blackwood", "my_template", "{}");
        expect(result).toBeUndefined();
    });

    it("rejects when invoke rejects", async () => {
        mockInvoke.mockRejectedValueOnce(new Error("disk full"));
        await expect(
            saveTemplate("/campaigns/blackwood", "bad", "{}")
        ).rejects.toThrow("disk full");
    });

    it("passes content verbatim without modification", async () => {
        mockInvoke.mockResolvedValueOnce(undefined);
        const json = JSON.stringify({ template_name: "x", width: 250, height: 122, slots: [] });
        await saveTemplate("/p", "x", json);
        expect(mockInvoke).toHaveBeenCalledWith("save_template", {
            campaignPath: "/p",
            templateName: "x",
            content: json,
        });
    });
});

describe("listTemplates", () => {
    it("calls invoke with list_templates and correct args", async () => {
        mockInvoke.mockResolvedValueOnce([]);
        await listTemplates("/campaigns/blackwood");
        expect(mockInvoke).toHaveBeenCalledWith("list_templates", {
            campaignPath: "/campaigns/blackwood",
        });
    });

    it("returns empty array when no templates exist", async () => {
        mockInvoke.mockResolvedValueOnce([]);
        const result = await listTemplates("/campaigns/empty");
        expect(result).toEqual([]);
    });

    it("returns sorted template names", async () => {
        mockInvoke.mockResolvedValueOnce(["portrait_left", "minimal", "wide_art"]);
        const result = await listTemplates("/campaigns/blackwood");
        expect(result).toEqual(["portrait_left", "minimal", "wide_art"]);
    });

    it("rejects when invoke rejects", async () => {
        mockInvoke.mockRejectedValueOnce(new Error("not a directory"));
        await expect(listTemplates("/bad/path")).rejects.toThrow("not a directory");
    });
});
