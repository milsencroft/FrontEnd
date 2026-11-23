"use client";
import { useWishlist } from "@/lib/useSaved";
import { signInWithGoogle } from "@/lib/supabase";

export function WishlistButton({ code }: { code: string }) {
  const { codes, toggle, signedIn } = useWishlist();
  const on = codes.includes(code);
  return (
    <button type="button" className="btn-ghost" aria-pressed={on}
      onClick={() => (signedIn ? void toggle(code) : void signInWithGoogle())}>
      {on ? "Saved to wishlist" : "Save to wishlist"}
    </button>
  );
}
