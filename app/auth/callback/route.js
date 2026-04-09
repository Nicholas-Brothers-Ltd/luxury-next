import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(`${requestUrl.origin}/auth`);
    }

    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: (name, value, options) => {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (e) {
              // ⚠️ Ignore cookie errors in edge runtime
            }
          },
          remove: (name, options) => {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch (e) {
              // ⚠️ Ignore cookie errors
            }
          },
        },
      }
    );

    // 🔐 Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Exchange error:", error.message);
      return NextResponse.redirect(`${requestUrl.origin}/auth`);
    }

    // ✅ SUCCESS → go home
    return NextResponse.redirect(`${requestUrl.origin}`);
  } catch (err) {
    console.error("Callback crash:", err);
    return NextResponse.redirect("/");
  }
}