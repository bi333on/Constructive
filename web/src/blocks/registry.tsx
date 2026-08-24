import type { LucideIcon } from "lucide-react";
import {
  Columns2,
  CreditCard,
  HelpCircle,
  Images,
  LayoutGrid,
  Megaphone,
  PanelBottom,
  PanelTop,
  Sparkles,
  Type,
} from "lucide-react";
import type { BlockDefinition } from "./types";
import type { BlockRenderProps } from "./components/common";
import { blockDefinitions } from "./definitions";
import {
  CtaBlock,
  FaqBlock,
  FeaturesBlock,
  FooterBlock,
  GalleryBlock,
  HeaderBlock,
  HeroBlock,
  PricingBlock,
  TextBlock,
  TextImageBlock,
} from "./components/blocks";

export interface RegisteredBlock {
  definition: BlockDefinition;
  icon: LucideIcon;
  render: (props: BlockRenderProps) => React.ReactNode;
}

const renderMap: Record<string, (props: BlockRenderProps) => React.ReactNode> = {
  header: HeaderBlock,
  hero: HeroBlock,
  features: FeaturesBlock,
  "text-image": TextImageBlock,
  text: TextBlock,
  gallery: GalleryBlock,
  pricing: PricingBlock,
  faq: FaqBlock,
  cta: CtaBlock,
  footer: FooterBlock,
};

const iconMap: Record<string, LucideIcon> = {
  header: PanelTop,
  hero: Sparkles,
  features: LayoutGrid,
  "text-image": Columns2,
  text: Type,
  gallery: Images,
  pricing: CreditCard,
  faq: HelpCircle,
  cta: Megaphone,
  footer: PanelBottom,
};

export const blockRegistry: Record<string, RegisteredBlock> = Object.fromEntries(
  blockDefinitions.map((def) => [
    def.type,
    {
      definition: def,
      icon: iconMap[def.type] ?? Type,
      render: renderMap[def.type] ?? TextBlock,
    },
  ]),
);

/** Список блоков для палитры (в порядке определений). */
export const blockList: RegisteredBlock[] = blockDefinitions.map(
  (def) => blockRegistry[def.type],
);

/** Возвращает определение блока по типу. */
export function getBlockDefinition(type: string): BlockDefinition | undefined {
  return blockRegistry[type]?.definition;
}
