import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * `cn()` — clsx + tailwind-merge.
 *
 * tailwind-merge has to be told about our custom type scale, otherwise it
 * cannot distinguish `text-display-xl` (a font size) from `text-text-primary`
 * (a colour): both look like `text-*`, so whichever comes last silently
 * deletes the other. Register the scale as font sizes and the palette
 * families as colours so both survive in the same class list.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-3xl",
            "display-2xl",
            "display-xl",
            "display-lg",
            "display-md",
            "display-sm",
            "eyebrow",
          ],
        },
      ],
    },
    theme: {
      color: [
        "text-primary",
        "text-secondary",
        "text-tertiary",
        "text-disabled",
        "text-on-ink",
        "text-on-ink-secondary",
        "text-on-ink-tertiary",
        "accent",
        "accent-bright",
        "accent-deep",
        "accent-soft",
        "promo",
        "promo-bright",
        "promo-deep",
        "promo-soft",
        "promo-foreground",
        "bg-canvas",
        "bg-elevated",
        "bg-raised",
        "bg-deep",
        "bg-ink",
        "border-hairline",
        "border-default",
        "border-strong",
        "border-on-ink",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
