import { vi, describe, it, expect } from "vitest";

vi.mock("@tauri-apps/plugin-dialog", () => ({ save: vi.fn(), open: vi.fn() }));
vi.mock("@tauri-apps/api/core", () => ({ invoke: vi.fn() }));

import { slugify } from "./saveLoad";

describe("slugify", () => {
    it("lowercases the text", () => {
        expect(slugify("HERO")).toBe("hero");
    });

    it("replaces spaces with underscores", () => {
        expect(slugify("fire bolt")).toBe("fire_bolt");
    });

    it("collapses multiple spaces", () => {
        expect(slugify("fire   bolt")).toBe("fire_bolt");
    });

    it("removes special characters", () => {
        expect(slugify("fire-bolt!")).toBe("firebolt");
    });

    it("preserves underscores", () => {
        expect(slugify("fire_bolt")).toBe("fire_bolt");
    });

    it("trims leading and trailing whitespace", () => {
        expect(slugify("  hero  ")).toBe("hero");
    });

    it("handles an already-valid id", () => {
        expect(slugify("intro_scene")).toBe("intro_scene");
    });

    it("returns empty string for empty input", () => {
        expect(slugify("")).toBe("");
    });
});
