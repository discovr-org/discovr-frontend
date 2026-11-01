import Image from "next/image";
import { VerifiedTickIcon } from "./icons";
import styles from "./Avatar.module.css";

export type AvatarSize = "sm" | "md" | "lg";

export type AvatarProps = {
  /** Person's name — used for alt and initials. */
  name: string;
  /** Square face photo. Omit for the initials fallback. */
  src?: string;
  size?: AvatarSize;
  /** Green tick. Only renders on md and lg. */
  verified?: boolean;
};

/**
 * Host face at sm (32) / md (44) / lg (64). Pill only; no photo-lift.
 * Not a button — the row around it is the target.
 */
export function Avatar({ name, src, size = "md", verified = false }: AvatarProps) {
  const initials = initialsFrom(name);
  const showTick = verified && size !== "sm";

  return (
    <span
      className={`${styles.avatar} ${styles[size]}`}
      role={src ? undefined : "img"}
      aria-label={src ? undefined : name}
    >
      {src ? (
        <Image className={styles.face} src={src} alt={name} width={px(size)} height={px(size)} />
      ) : (
        <span className={styles.initials} aria-hidden="true">
          {initials}
        </span>
      )}
      {showTick && (
        <span className={styles.verified} aria-hidden="true">
          <VerifiedTickIcon />
        </span>
      )}
    </span>
  );
}

function px(size: AvatarSize): number {
  if (size === "sm") return 32;
  if (size === "lg") return 64;
  return 44;
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}
