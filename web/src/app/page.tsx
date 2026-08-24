import { redirect } from "next/navigation";
import { Editor } from "@/editor/Editor";
import { getSessionUser } from "@/lib/auth-session";

// Редактор рендерится динамически: иначе статический кеш (s-maxage на год)
// сохраняет старые ID серверных действий и после пересборки падает
// «Server Reference ID did not match».
export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return <Editor />;
}
