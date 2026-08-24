import { describe, expect, it } from "vitest";
import { cn, slugify, uid } from "./utils";

describe("slugify", () => {
  it("транслитерирует кириллицу", () => {
    expect(slugify("Привет мир")).toBe("privet-mir");
  });

  it("приводит к нижнему регистру и заменяет спецсимволы на дефисы", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  it("возвращает fallback для пустой строки", () => {
    expect(slugify("")).toBe("page");
  });
});

describe("cn", () => {
  it("объединяет классы", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("разрешает конфликты tailwind-классов", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("uid", () => {
  it("генерирует уникальные значения", () => {
    const a = uid();
    const b = uid();
    expect(a).toBeTruthy();
    expect(a).not.toBe(b);
  });
});
