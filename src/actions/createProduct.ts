"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { organization, products } from "@/db/orgSchema";

type ProductInput = {
  name: string;
  description?: string;
};

export async function createProduct(data: ProductInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  try {
    // Get the organization belonging to the logged-in user
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

    // Validate product name
    const name = data.name.trim();

    if (!name) {
      return {
        error: "Product name is required.",
      };
    }

    // Create the product
    await db.insert(products).values({
      organizationId: org.id,
      name,
      description: data.description?.trim() || null,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to create product:", error);

    return {
      error: "Something went wrong. Please try again.",
    };
  }
}
