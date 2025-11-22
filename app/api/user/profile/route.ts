import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function PUT(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "No authorization header" },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.replace("Bearer ", "");

    // Verify the user with the token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the update data from request body
    const updates = await request.json();
    const { full_name, mobile, address } = updates;

    // Update public.users table
    const { error: dbError } = await supabaseAdmin
      .from("users")
      .update({
        full_name: full_name || null,
        mobile: mobile || null,
        address: address || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (dbError) {
      console.error("Database update error:", dbError);
      return NextResponse.json(
        { error: "Failed to update profile in database" },
        { status: 500 }
      );
    }

    // Update auth.users metadata
    const { error: metadataError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          full_name: full_name || null,
          mobile: mobile || null,
          address: address || null,
        }
      }
    );

    if (metadataError) {
      console.error("Metadata update error:", metadataError);
      // Don't fail the request if metadata update fails
      // The database is the source of truth
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully"
    });

  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}

