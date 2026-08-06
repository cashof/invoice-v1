import React from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateOrg from "./createOrg";

const session = await auth.api.getSession({
  headers: await headers(), // you need to pass the headers object.
});

export default function page() {
  if (!session) {
    redirect("/login");
  }
  return (
    <div className="flex min-h-svh w-full items-center justify-center  md:p-10">
      <div className="w-full max-w-lg">
        <CreateOrg />
      </div>
    </div>
  );
}
