import { Editor } from "@/editor/Editor";

// Редактор рендерится динамически: иначе статический кеш (s-maxage на год)
// сохраняет старые ID серверных действий и после пересборки падает
// «Server Reference ID did not match».
export const dynamic = "force-dynamic";

export default function Home() {
  return <Editor />;
}
