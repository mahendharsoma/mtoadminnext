"use client";

import { Button } from "@/components/ui/button";

export function PrintGatePassButton() {
  return (
    <Button type="button" className="no-print mt-6" onClick={() => window.print()}>
      Print
    </Button>
  );
}
