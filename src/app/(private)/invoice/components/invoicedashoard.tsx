import React from "react";
import Createinvoice from "./createinvoice";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Invoicedashoard() {
  return (
    <div>
      Invoice overview
      <Link href={"/invoice/create"}>
        <Button>
          <Plus /> Add Invoice
        </Button>
      </Link>
    </div>
  );
}
