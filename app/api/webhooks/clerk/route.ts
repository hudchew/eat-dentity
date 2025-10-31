import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  // Get the Svix headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Get the secret
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new Response("Error: Missing CLERK_WEBHOOK_SECRET", {
      status: 400,
    });
  }

  // Create a new Svix instance with the secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Verification failed", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // Sync user to database
    try {
      // Get primary email address (handle empty email_addresses array)
      const primaryEmailId = evt.data.primary_email_address_id;
      const primaryEmail = email_addresses?.find(
        (email: any) => email.id === primaryEmailId
      )?.email_address || email_addresses?.[0]?.email_address || null;

      if (!primaryEmail) {
        console.error(`❌ No email address for user ${id}`);
        return new Response("Error: No email address", { status: 400 });
      }

      await prisma.user.create({
        data: {
          clerkId: id,
          email: primaryEmail,
          name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || null,
          imageUrl: image_url || null,
        },
      });
      console.log(`✅ User synced to database: ${id} - ${primaryEmail}`);
    } catch (error: any) {
      console.error("Error syncing user to database:", error);
      // Return 500 to Clerk so it retries
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // Update user in database
    try {
      // Get primary email address (handle empty email_addresses array)
      const primaryEmailId = evt.data.primary_email_address_id;
      const primaryEmail = email_addresses?.find(
        (email: any) => email.id === primaryEmailId
      )?.email_address || email_addresses?.[0]?.email_address || null;

      if (!primaryEmail) {
        console.error(`❌ No email address for user ${id}`);
        return new Response("Error: No email address", { status: 400 });
      }

      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: primaryEmail,
          name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || null,
          imageUrl: image_url || null,
        },
      });
      console.log(`✅ User updated in database: ${id} - ${primaryEmail}`);
    } catch (error: any) {
      console.error("Error updating user in database:", error);
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    // Delete user from database (Cascade will handle related records)
    try {
      await prisma.user.delete({
        where: { clerkId: id },
      });
      console.log(`✅ User deleted from database: ${id}`);
    } catch (error) {
      console.error("Error deleting user from database:", error);
    }
  }

  return new Response("", { status: 200 });
}

