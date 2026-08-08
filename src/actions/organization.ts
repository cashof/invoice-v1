"use server";

import { auth } from "@/lib/auth";
import { organizationSchema, orgType } from "@/types";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { organization } from "@/db/orgSchema";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

type ActionResult = { success: false; error: string };

export async function createOrganization(
  data: orgType,
): Promise<ActionResult | void> {
  const parsed = organizationSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Invalid organization data." };
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return {
      success: false,
      error: "You must be logged in to create an organization.",
    };
  }

  try {
    await db.insert(organization).values({
      userId: session.user.id,
      name: parsed.data.name,
      description: parsed.data.description,
      phone: parsed.data.phone,
      address: parsed.data.address,
      p_o_box: parsed.data.p_o_box,
    });
  } catch (err) {
    console.error("Failed to create organization:", err);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }

  revalidatePath("/org"); // moved here — old code, unreachable after `redirect()`
  redirect("/org"); // moved outside try/catch — must propagate to Next.js, not be caught
}
