export function exportToPdf(title: string, content: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body { font-family: Inter, system-ui, sans-serif; padding: 24px; color: #1C1C1E; font-size: 13px; }
      h1 { font-size: 18px; margin-bottom: 8px; }
      h2 { font-size: 14px; margin-top: 16px; margin-bottom: 8px; color: #8E8E93; text-transform: uppercase; letter-spacing: 0.5px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #E5E5EA; font-size: 12px; }
      th { background: #F7F7F8; font-weight: 600; }
      .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; }
      .badge-green { background: #E8F5EE; color: #1E7A4A; }
      .badge-amber { background: #FEF7E0; color: #92400E; }
      .badge-red { background: #FFF0ED; color: #E8553A; }
      .badge-gray { background: #F7F7F8; color: #8E8E93; }
      .step { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
      .step-done { color: #1E7A4A; }
      .step-pending { color: #8E8E93; }
      .meta { color: #8E8E93; font-size: 11px; }
      @media print { body { padding: 0; } }
    </style>
  </head><body>${content}<script>window.print();</script></body></html>`);
  win.document.close();
}
