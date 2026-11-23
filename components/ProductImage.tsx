import { mediaUrl, type ProductImage } from "@/lib/media";

/* eslint-disable @next/next/no-img-element */
/**
 * Library image with its alt text. Width and height are the library's display size; the parent frame fixes the
 * aspect ratio, so nothing shifts while it loads. Pass `priority` for the main image above the fold.
 */
export function Photo({ image, className = "", priority = false }: { image: ProductImage; className?: string; priority?: boolean }) {
  return <img src={mediaUrl(image.path)} alt={image.alt} width={800} height={1000} loading={priority ? "eager" : "lazy"} decoding="async" {...(priority ? { fetchPriority: "high" as const } : {})} className={`h-full w-full object-cover ${className}`} />;
}
