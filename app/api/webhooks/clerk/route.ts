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
    console.error("❌ Missing svix headers:", {
      has_svix_id: !!svix_id,
      has_svix_timestamp: !!svix_timestamp,
      has_svix_signature: !!svix_signature,
    });
    return new Response("Error: Missing svix headers", {
      status: 400,
    });
  }

  // Get the raw body as text (required for Svix verification)
  const body = await req.text();

  // Get the secret
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("❌ Missing CLERK_WEBHOOK_SECRET environment variable");
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
    console.log(`✅ Webhook verified: ${evt.type}`);
  } catch (err: any) {
    console.error("❌ Webhook verification failed:", {
      error: err?.message || err,
      has_secret: !!WEBHOOK_SECRET,
      secret_length: WEBHOOK_SECRET?.length || 0,
    });
    return new Response(`Error: Verification failed - ${err?.message || "Unknown error"}`, {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // Sync user to database
    try {
      // Get primary email address
      // From Clerk docs: email_addresses is an array of objects with email_address property
      const primaryEmailId = evt.data.primary_email_address_id;
      const primaryEmail = email_addresses?.find(
        (email: any) => email.id === primaryEmailId
      )?.email_address || email_addresses?.[0]?.email_address || null;

      if (!primaryEmail) {
        console.error(`❌ No email address for user ${id}`, {
          email_addresses: email_addresses,
          primary_email_address_id: primaryEmailId,
        });
        // Return 200 OK instead of 400 to prevent infinite retries
        // User will be created later when email is available via user.updated event
        return new Response("Warning: No email address", { status: 200 });
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
      // If user already exists (idempotency), return 200 OK
      if (error.code === "P2002") {
        console.log(`⏭️  User already exists: ${id}`);
        return new Response("", { status: 200 });
      }
      // Return 500 to Clerk so it retries
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // Update user in database
    try {
      // Get primary email address
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
      // If user doesn't exist, create them (handles out-of-order webhooks)
      if (error.code === "P2025") {
        console.log(`⚠️  User not found, creating: ${id}`);
        try {
          const primaryEmailId = evt.data.primary_email_address_id;
          const primaryEmail = email_addresses?.find(
            (email: any) => email.id === primaryEmailId
          )?.email_address || email_addresses?.[0]?.email_address || null;

          if (primaryEmail) {
            await prisma.user.create({
              data: {
                clerkId: id,
                email: primaryEmail,
                name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || null,
                imageUrl: image_url || null,
              },
            });
            console.log(`✅ User created from update event: ${id} - ${primaryEmail}`);
          }
        } catch (createError: any) {
          console.error("Error creating user from update:", createError);
          return new Response(`Error: ${createError.message}`, { status: 500 });
        }
      } else {
        console.error("Error updating user in database:", error);
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    // Delete user from database (Cascade will handle related records)
    // Idempotent: if user doesn't exist, return 200 OK
    try {
      await prisma.user.delete({
        where: { clerkId: id },
      });
      console.log(`✅ User deleted from database: ${id}`);
    } catch (error: any) {
      // P2025 = Record not found (idempotent - already deleted)
      if (error.code === "P2025") {
        console.log(`⏭️  User already deleted: ${id}`);
      } else {
        console.error("Error deleting user from database:", error);
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
  }

  return new Response("", { status: 200 });
}

