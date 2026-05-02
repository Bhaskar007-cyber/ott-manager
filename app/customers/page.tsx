"use client";

import { Suspense } from "react";
import CustomersContent from "./CustomersContent";

export const dynamic = "force-dynamic";

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <CustomersContent />
    </Suspense>
  );
}