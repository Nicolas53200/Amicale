"use client";

import { useState } from "react";
import { Button } from "./button";

export function ExportButton({
  label = "Exporter CSV",
  filename = "export.csv",
  exportFn,
}: {
  label?: string;
  filename?: string;
  exportFn: () => Promise<string>;
}) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    const csv = await exportFn();
    const bom = "﻿";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleExport} disabled={loading}>
      {loading ? "Export..." : label}
    </Button>
  );
}
