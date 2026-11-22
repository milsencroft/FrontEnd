// Public values only. Nothing secret ever belongs here.
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
  apiBase: (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, ""),
  currentLaunch: process.env.NEXT_PUBLIC_CURRENT_LAUNCH_CODE ?? "KJ",
};
