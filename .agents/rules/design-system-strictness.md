---
paths: apps/dashboard/**/*
---
# Design System Strictness Laws

- ALL styled components MUST use tokens derived from the centralized design system.
- Direct use of "magic numbers" (e.g., hardcoded `padding: 13px`, `margin-left: 17px`) is STRICTLY PROHIBITED.
- DO NOT use generic, AI-associated visual clichés (neon purple-on-black, pink gradients, etc.).
- Use a calm, high-end "Restaurant Ops" theme: slate backgrounds, soft emerald/sage accents for positive states, amber for primary actions.
- Emojis as UI icons are STRICTLY FORBIDDEN. Use SVG icon components from Lucide React Native.
- Hover, focus, and modal transition states must use smooth CSS easings between 150ms and 300ms.
- Every generated page must strictly maintain WCAG AA compliance (contrast ratio of at least 4.5:1).
- Typography must use the Inter font family loaded via Google Fonts / Expo.
- All spacing values must come from the 4px base unit scale (4, 8, 12, 16, 24, 32, 48).
- Border radius values must use the defined token scale (0, 4, 8, 12, 16, 9999).
