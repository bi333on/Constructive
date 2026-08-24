"use client";

import { useState } from "react";
import { BlockCanvas } from "./BlockCanvas";
import { InlineToolbar } from "./InlineToolbar";
import { PreviewModal } from "./PreviewModal";
import { Toolbar } from "./Toolbar";
import { InlineProvider } from "./inline";
import { useAutosave } from "./useAutosave";
import { useEditorHotkeys } from "./useEditorHotkeys";
import { useInlineStore } from "./store";

export function Editor() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const begin = useInlineStore((s) => s.begin);

  useAutosave();
  useEditorHotkeys();

  return (
    <div className="flex h-screen flex-col bg-neutral-100 text-neutral-900">
      <Toolbar onPreview={() => setPreviewOpen(true)} />
      <InlineProvider begin={begin}>
        <InlineToolbar />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <BlockCanvas />
        </main>
      </InlineProvider>
      <PreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} />
    </div>
  );
}
