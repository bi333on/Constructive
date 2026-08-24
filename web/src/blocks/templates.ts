import type { BlockInstance, BlockProps } from "./types";
import { blockDefinitions } from "./definitions";
import { uid } from "@/lib/utils";

export interface TemplateBlock {
  type: string;
  props?: BlockProps;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  blocks: TemplateBlock[];
}

/** Готовые шаблоны страниц (наборы блоков). */
export const templates: Template[] = [
  {
    id: "landing",
    name: "Лендинг",
    description: "Продуктовый лендинг: обложка, преимущества, тарифы, FAQ.",
    blocks: [
      { type: "header" },
      { type: "hero" },
      { type: "features" },
      { type: "stats" },
      { type: "pricing" },
      { type: "testimonials" },
      { type: "faq" },
      { type: "cta" },
      { type: "footer" },
    ],
  },
  {
    id: "portfolio",
    name: "Портфолио",
    description: "Галерея работ, кейсы и отзывы.",
    blocks: [
      { type: "header" },
      {
        type: "hero",
        props: { title: "Мои работы", subtitle: "Подборка проектов и кейсов" },
      },
      { type: "gallery" },
      { type: "text-image" },
      { type: "testimonials" },
      { type: "cta" },
      { type: "footer" },
    ],
  },
  {
    id: "about",
    name: "О компании",
    description: "Команда, этапы работы и контакты.",
    blocks: [
      { type: "header" },
      { type: "text", props: { title: "О нас" } },
      { type: "text-image" },
      { type: "team" },
      { type: "steps" },
      { type: "contact" },
      { type: "footer" },
    ],
  },
];

/** Собирает экземпляры блоков из шаблона (с новыми id и дефолтными пропсами). */
export function buildTemplateBlocks(template: Template): BlockInstance[] {
  return template.blocks.map((item) => {
    const def = blockDefinitions.find((d) => d.type === item.type);
    return {
      id: uid(),
      type: item.type,
      props: { ...(def?.defaultProps ?? {}), ...(item.props ?? {}) },
    };
  });
}
