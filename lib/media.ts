import { env } from "@/lib/env";

export interface ProductImage { path: string; alt: string }
export const mediaUrl = (path: string) => `${env.supabaseUrl}/storage/v1/object/public/product-media/${path}`;
export const imagesOf = (v: unknown): ProductImage[] =>
  Array.isArray(v) ? v.filter((x): x is ProductImage => !!x && typeof (x as ProductImage).path === "string" && typeof (x as ProductImage).alt === "string") : [];

const MSG: Record<string, string> = { reason_required: "A reason is required.", alt_required: "Describe the image in a few words (at least 3 characters).", invalid_path: "That file name is not allowed.", file_missing: "The upload did not finish. Please try again.", in_use: "This image is used by a product. Remove it from the product first.", too_many: "A product can have up to 8 images.", unknown_media: "One of those images is not in the library.", forbidden: "You do not have permission for this." };
export const mediaError = (m?: string) => (m && MSG[m]) || "Something went wrong. Please try again.";
