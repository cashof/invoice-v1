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

export async function getClientsList() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.userId, session.user.id))
    .limit(1);

  if (!org) return [];

  return db
    .select({
      id: clients.id,
      name: clients.name,
      email: clients.email,
      phone: clients.phone,
      address: clients.address,
      createdAt: clients.createdAt,
    })
    .from(clients)
    .where(eq(clients.organizationId, org.id))
    .orderBy(clients.createdAt);
}

export async function deleteClient(clientId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  try {
    await db.delete(clients).where(eq(clients.id, clientId));
    return { success: true };
  } catch (err) {
    console.error("Failed to delete client:", err);
    return { error: "Failed to delete client." };
  }
}

export async function updateClient(
  clientId: string,
  data: { name: string; email?: string; phone: string; address: string },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  try {
    await db
      .update(clients)
      .set({
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      })
      .where(eq(clients.id, clientId));
    return { success: true };
  } catch (err) {
    console.error("Failed to update client:", err);
    return { error: "Failed to update client." };
  }
}
