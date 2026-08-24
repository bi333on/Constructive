import { blockRegistry } from "@/blocks/registry";
import type { BlockInstance } from "@/blocks/types";

/** Рендерит список блоков страницы (используется на публичных страницах и в предпросмотре). */
export function BlockList({ blocks }: { blocks: BlockInstance[] }) {
  return (
    <>
      {blocks.map((block) => {
        const reg = blockRegistry[block.type];
        if (!reg) return null;
        return <div key={block.id}>{reg.render({ props: block.props })}</div>;
      })}
    </>
  );
}
