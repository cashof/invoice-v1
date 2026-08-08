"use server";

import { revalidatePath } from "next/cache";
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

export async function getProductsList() {
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
      id: products.id,
      name: products.name,
      description: products.description,
      createdAt: products.createdAt,
    })
    .from(products)
    .where(eq(products.organizationId, org.id))
    .orderBy(products.createdAt);
}

export async function deleteProduct(productId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  try {
    await db.delete(products).where(eq(products.id, productId));
    revalidatePath("/products");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete product:", err);
    return { error: "Failed to delete product." };
  }
}

export async function updateProduct(
  productId: string,
  data: { name: string; description?: string },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  try {
    await db
      .update(products)
      .set({ name: data.name, description: data.description || null })
      .where(eq(products.id, productId));
    revalidatePath("/products");
    return { success: true };
  } catch (err) {
    console.error("Failed to update product:", err);
    return { error: "Failed to update product." };
  }
}
