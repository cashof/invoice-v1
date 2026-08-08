import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function ProductList() {
  return (
    <div>
      <Link href={"/products/createproduct"}>
        <Button>
          <Plus /> Add Product
        </Button>
      </Link>
    </div>
  );
}
