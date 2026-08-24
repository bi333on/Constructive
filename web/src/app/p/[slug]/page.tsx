import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlockList } from "@/components/BlockList";
import { getPublishedPage } from "@/lib/pages";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) return { title: "Страница не найдена" };
  return { title: page.title, description: page.description };
}

export default async function PublishedPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) notFound();

  return (
    <main className="bg-white">
      <BlockList blocks={page.blocks} />
    </main>
  );
}
