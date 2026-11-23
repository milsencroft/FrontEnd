import { mediaUrl, type ProductImage } from "@/lib/media";

/* eslint-disable @next/next/no-img-element */
export function Photo({ image, className = "" }: { image: ProductImage; className?: string }) {
  return <img src={mediaUrl(image.path)} alt={image.alt} loading="lazy" decoding="async" className={`h-full w-full object-cover ${className}`} />;
}
