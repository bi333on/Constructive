import { describe, expect, it } from "vitest";
import { blockList, blockRegistry, getBlockDefinition } from "./registry";

describe("реестр блоков", () => {
  it("содержит все стартовые блоки", () => {
    expect(blockList.length).toBe(10);
  });

  it("каждый блок имеет схему, иконку и компонент рендера", () => {
    for (const block of blockList) {
      expect(block.definition.type).toBeTruthy();
      expect(block.definition.name).toBeTruthy();
      expect(block.definition.fields.length).toBeGreaterThan(0);
      expect(typeof block.render).toBe("function");
      expect(block.icon).toBeTruthy();
    }
  });

  it("defaultProps содержат значения для всех полей схемы", () => {
    for (const block of blockList) {
      for (const field of block.definition.fields) {
        expect(block.definition.defaultProps).toHaveProperty(field.key);
      }
    }
  });

  it("getBlockDefinition возвращает определение по типу", () => {
    expect(getBlockDefinition("hero")?.name).toBe("Обложка (Hero)");
    expect(getBlockDefinition("unknown")).toBeUndefined();
  });

  it("типы блоков уникальны", () => {
    const types = blockList.map((b) => b.definition.type);
    expect(new Set(types).size).toBe(types.length);
  });

  it("registry согласован со списком", () => {
    for (const block of blockList) {
      expect(blockRegistry[block.definition.type]).toBeDefined();
    }
  });
});
