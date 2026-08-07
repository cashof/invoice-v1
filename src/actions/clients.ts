"use server";

import { db } from "@/lib/db";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { clients, organization } from "@/db/orgSchema";

type ClientInput = {
  name: string;
  email?: string;
  phone: string;
  address: string;
};

export async function createClient(data: ClientInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.userId, session.user.id))
    .limit(1);

  if (!org) {
    return {
      error: "No organization found. Please create one first.",
    };
  }
  if (!org) return { error: "No organization found. Please create one first." };

  try {
    await db.insert(clients).values({
      organizationId: org.id,
      name: data.name,
      email: data.email || null,
      phone: data.phone,
      address: data.address,
    });

    return { success: true };
  } catch (err) {
    console.error("Failed to create client:", err);
    return { error: "Something went wrong. Please try again." };
  }
}
