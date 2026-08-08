import InvoiceDashboard from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import React from "react";

export default function () {
  return (
    <div>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <InvoiceDashboard />
          </div>
        </div>
      </div>
    </div>
  );
}
