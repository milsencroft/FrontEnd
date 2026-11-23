// Public values only. Nothing secret ever belongs here.
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
export const env = {
  supabaseUrl,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
  // Falls back to the project's edge function so a missing variable can never send checkout to the website itself.
  apiBase: (process.env.NEXT_PUBLIC_API_BASE_URL || (supabaseUrl ? `${supabaseUrl}/functions/v1/api` : "")).replace(/\/$/, ""),
  currentLaunch: process.env.NEXT_PUBLIC_CURRENT_LAUNCH_CODE ?? "KJ",
};
