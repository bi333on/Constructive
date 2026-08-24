// Типы системы блоков конструктора.
//
// Ключевая идея: страница — упорядоченный список блоков, каждый блок описывается
// JSON-схемой полей (fields). Панель настроек рендерится автоматически из схемы,
// а компонент рендера блока читает значения из props.

export type FieldGroup = "content" | "style";

interface FieldBase {
  /** Ключ в props блока. */
  key: string;
  /** Человекочитаемое название в панели настроек. */
  label: string;
  group?: FieldGroup;
}

export interface TextField extends FieldBase {
  type: "text";
  placeholder?: string;
  defaultValue?: string;
}

export interface TextareaField extends FieldBase {
  type: "textarea";
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
}

export interface ImageField extends FieldBase {
  type: "image";
  defaultValue?: string;
  aspect?: "video" | "square" | "auto";
}

export interface ColorField extends FieldBase {
  type: "color";
  defaultValue?: string;
}

export interface NumberField extends FieldBase {
  type: "number";
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface SelectField extends FieldBase {
  type: "select";
  options: { label: string; value: string }[];
  defaultValue?: string;
}

export interface ToggleField extends FieldBase {
  type: "toggle";
  defaultValue?: boolean;
}

export interface AlignField extends FieldBase {
  type: "align";
  defaultValue?: "left" | "center" | "right";
}

export interface LinkField extends FieldBase {
  type: "link";
  placeholder?: string;
  defaultValue?: string;
}

export type BlockField =
  | TextField
  | TextareaField
  | ImageField
  | ColorField
  | NumberField
  | SelectField
  | ToggleField
  | AlignField
  | LinkField;

export type BlockProps = Record<string, unknown>;

/** Схема блока: поля и значения по умолчанию. */
export interface BlockDefinition {
  type: string;
  name: string;
  category: string;
  fields: BlockField[];
  defaultProps: BlockProps;
}

/** Конкретный экземпляр блока на странице. */
export interface BlockInstance {
  id: string;
  type: string;
  props: BlockProps;
}

/** Страница сайта. */
export interface PageData {
  id: string;
  title: string;
  slug: string;
  description: string;
  blocks: BlockInstance[];
}

// Вспомогательные функции чтения props со значениями по умолчанию.

export const str = (props: BlockProps, key: string, def = ""): string =>
  (props[key] as string) ?? def;

export const num = (props: BlockProps, key: string, def = 0): number =>
  (props[key] as number) ?? def;

export const bool = (props: BlockProps, key: string, def = false): boolean =>
  (props[key] as boolean) ?? def;

export const col = (props: BlockProps, key: string, def = "#ffffff"): string =>
  (props[key] as string) ?? def;

/** Классы видимости блока по устройствам (для публичного рендера). */
export function visibilityClasses(props: BlockProps): string {
  const phone = !bool(props, "hideMobile", false);
  const tablet = !bool(props, "hideTablet", false);
  const desktop = !bool(props, "hideDesktop", false);
  if (phone && tablet && desktop) return "";
  const cls = ["hidden"];
  if (phone) cls.push("max-md:block");
  if (tablet) cls.push("md:max-lg:block");
  if (desktop) cls.push("lg:block");
  return cls.join(" ");
}
