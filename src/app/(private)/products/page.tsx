import { Button } from "@/components/ui/button";
import React from "react";
import ProductList from "./ProductList";

export default function page() {
  return (
    <div className="flex min-h-svh w-full  justify-center p-3 md:px-10">
      <div className="w-full ">
        <ProductList />
      </div>
    </div>
  );
}
