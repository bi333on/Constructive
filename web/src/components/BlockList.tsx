import { blockRegistry } from "@/blocks/registry";
import { Reveal } from "@/blocks/components/Reveal";
import { visibilityClasses, type BlockInstance } from "@/blocks/types";

/** Рендерит список блоков страницы (используется на публичных страницах и в предпросмотре). */
export function BlockList({ blocks }: { blocks: BlockInstance[] }) {
  return (
    <>
      {blocks.map((block) => {
        const reg = blockRegistry[block.type];
        if (!reg) return null;
        return (
          <Reveal key={block.id} className={visibilityClasses(block.props)}>
            {reg.render({ props: block.props })}
          </Reveal>
        );
      })}
    </>
  );
}
