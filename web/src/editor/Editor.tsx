"use client";

import { useState } from "react";
import { BlockCanvas } from "./BlockCanvas";
import { PreviewModal } from "./PreviewModal";
import { SettingsPanel } from "./SettingsPanel";
import { Sidebar } from "./Sidebar";
import { Toolbar } from "./Toolbar";
import { useAutosave } from "./useAutosave";
import { useEditorHotkeys } from "./useEditorHotkeys";

export function Editor() {
  const [previewOpen, setPreviewOpen] = useState(false);

  useAutosave();
  useEditorHotkeys();

  return (
    <div className="flex h-screen flex-col bg-neutral-100 text-neutral-900">
      <Toolbar onPreview={() => setPreviewOpen(true)} />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <BlockCanvas />
        </main>
        <SettingsPanel />
      </div>
      <PreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} />
    </div>
  );
}
