"use client";

import { useState } from "react";
import Image from "next/image";
import { resolveAvatarUrl } from "@/lib/game-image";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string;
  name: string;
  className?: string;
  alt?: string;
}

export function UserAvatar({ src, name, className, alt = "" }: UserAvatarProps) {
  const fallback = resolveAvatarUrl(undefined, name);
  const [imgSrc, setImgSrc] = useState(() => resolveAvatarUrl(src, name));

  return (
    <span
      className={cn(
        "relative inline-block overflow-hidden bg-zinc-800",
        className
      )}
    >
      <Image
        src={imgSrc}
        alt={alt}
        fill
        unoptimized
        sizes="80px"
        className="object-cover"
        onError={() => {
          if (imgSrc !== fallback) setImgSrc(fallback);
        }}
      />
    </span>
  );
}
