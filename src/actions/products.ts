"use server";

import { db } from "@/lib/db";
import { products, organization } from "@/db/orgSchema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

type ProductInput = {
  name: string;
  description?: string;
};

export async function createProduct(data: ProductInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  const org = await db.query.organization.findFirst({
    where: eq(organization.userId, session.user.id),
  });

  if (!org) return { error: "No organization found. Please create one first." };

  try {
    await db.insert(products).values({
      organizationId: org.id,
      name: data.name,
      description: data.description || null,
    });

    return { success: true };
  } catch (err) {
    console.error("Failed to create product:", err);
    return { error: "Something went wrong. Please try again." };
  }
}
