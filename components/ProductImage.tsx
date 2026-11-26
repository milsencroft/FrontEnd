"use client";
import { useEffect, useRef, useState } from "react";
import { mediaUrl, type ProductImage } from "@/lib/media";

/* eslint-disable @next/next/no-img-element */
/**
 * Library image with its alt text. Width and height are the library's display size; the parent frame fixes the
 * aspect ratio, so nothing shifts while it loads. The frame stays plain until the picture arrives, then the picture fades in.
 * Pass `priority` for the main image above the fold.
 */
export function Photo({ image, className = "", priority = false }: { image: ProductImage; className?: string; priority?: boolean }) {
  const ref = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(!!ref.current?.complete && ref.current.naturalWidth > 0); }, [image.path]);
  return <img ref={ref} src={mediaUrl(image.path)} alt={image.alt} width={800} height={1000} loading={priority ? "eager" : "lazy"} decoding="async" onLoad={() => setReady(true)} onError={() => setReady(true)} {...(priority ? { fetchPriority: "high" as const } : {})} className={`h-full w-full object-cover transition-opacity duration-500 motion-reduce:transition-none ${ready ? "opacity-100" : "opacity-0"} ${className}`} />;
}
