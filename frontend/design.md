# Design System Specification: Editorial Finance



## 1. Overview & Creative North Star

### Creative North Star: "The Ethereal Ledger"

This design system rejects the clinical, crowded aesthetic of traditional banking. Instead, it treats personal finance as a calm, curated experience. The "Ethereal Ledger" focuses on **high-end editorial layouts**, utilizing an emphasis on spaciousness (spacing: `2`), sophisticated tonal layering, and a "soft-touch" physicalism, evident in its highly rounded elements (roundedness: `3`). The current color mode is `dark`, establishing a refined and immersive atmosphere for financial interactions.



We break the "template" look by employing intentional asymmetry—balancing large-scale typography against minimalist data visualizations. By moving away from rigid borders and toward depth created through light and shadow, the UI feels less like a software tool and more like a premium digital concierge.



---



## 2. Colors

Our palette balances a clean, professional foundation with "high-chroma" accents that inject life into financial data. The overall `color_mode` is set to `dark`.



### The Foundation

- **Background (`#121212`)**: A deep, rich neutral that acts as the primary canvas for the `dark` mode. (corresponds to `neutral_color_hex`)

- **Surface Tiers**: We use a nested hierarchy to define importance.

    - `surface-container-lowest`: `#1A1A1A` (The highest elevation; used for active cards).

    - `surface-container-low`: `#212121` (Subtle nesting for grouping secondary information).

    - `surface-container-highest`: `#292929` (Deepest depth; used for recessed search bars or background tracks).



### The Accents

- **Primary Electric (`#2E5BFF`)**: Used for "Growth" and core CTAs. (corresponds to `primary_color_hex`)

- **Secondary Emerald (`#00C48C`)**: Reserved for "Savings" and positive cash flow. (corresponds to `secondary_color_hex`)

- **Tertiary Coral (`#FF6B6B`)**: Used for "Debits" and critical warnings. (corresponds to `tertiary_color_hex`)



### Core Principles

*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined through background color shifts. A `surface-container-low` section sitting on a `surface` background provides enough contrast to be felt without being "seen."

*   **The "Glass & Gradient" Rule:** Floating elements (like navigation bars or action sheets) should utilize **Glassmorphism**. Use `surface` colors at 80% opacity with a `24px` backdrop blur.

*   **Signature Textures:** Main CTAs should avoid flat fills. Use a subtle linear gradient from `primary` (`#2E5BFF`) to `primary-container` (`#859aff`) at a 135-degree angle to provide "visual soul."



---



## 3. Typography

We use a dual-typeface system to create an authoritative yet accessible editorial feel.



*   **Display & Headlines (Manrope):** A geometric sans-serif with a high x-height. (corresponds to `headline_font`)

    - `display-lg` (3.5rem): Reserved for total net worth or hero balances.

    - `headline-sm` (1.5rem): Used for section headers (e.g., "Monthly Spending").

*   **Body & Labels (Inter):** A highly legible workhorse for data. (corresponds to `body_font` and `label_font`)

    - `body-lg` (1rem): Used for transaction descriptions.

    - `label-md` (0.75rem): Used for timestamps and micro-metadata.



**Editorial Hierarchy:** Always pair a large `display` element with a `label-md` in `on-surface-variant` (`#9AA1A9`) to create a clear "Title/Subtitle" relationship that mirrors high-end magazine layouts.



---



## 4. Elevation & Depth

We eschew traditional material shadows in favor of **Tonal Layering**.



*   **The Layering Principle:** Depth is achieved by "stacking." A `surface-container-lowest` (#1A1A1A) card placed on a `surface` (#121212) background creates a natural lift in `dark` mode.

*   **Ambient Shadows:** When a card must float (e.g., a modal or a primary bucket), use an extra-diffused shadow:

    - **Y-Offset:** 16px | **Blur:** 40px | **Color:** `on-surface` at 15% opacity.

*   **The "Ghost Border" Fallback:** If accessibility requires a container edge, use the "Ghost Border": `outline-variant` (#6D727A) at **25% opacity**. Never use a 100% opaque border.



---



## 5. Components



### Buttons

*   **Primary:** Gradient fill (`primary` to `primary-container`), `maximum (3)` roundedness. No shadow.

*   **Secondary:** `surface-container-high` fill with `primary` text.

*   **Tertiary:** Ghost style; text-only with a `primary` color.



### Cards & Lists

*   **The Bucket Card:** Use `md` (1.5rem) or `lg` (2rem) corner radius. Forbid the use of divider lines. Separate list items using `1.5rem` of vertical white space or a 2% tonal shift in the background.

*   **Input Fields:** Use `surface-container-lowest` for the field fill. The "Ghost Border" rule applies here. Labels must be `label-md` and positioned 8px above the field—never inside.



### Interactive Elements

*   **Chips:** Use `maximum (3)` roundedness. Selected states should use `primary_container` with `on_primary_container` text.

*   **Modals:** Must use the Glassmorphism rule (80% opacity + blur) for the backdrop, creating a "frosted" focus on the financial task at hand.



---



## 6. Do’s and Don’ts



### Do

*   **Do** use asymmetrical margins. Giving more breathing room on the left side of a balance creates a modern, editorial rhythm.

*   **Do** use `secondary` (`#00C48C`) for all positive financial growth indicators.

*   **Do** use `xl` (3rem) corner radiuses for large containers to emphasize the "friendly/fun" tone, consistent with a `maximum (3)` roundedness.



### Don’t

*   **Don’t** use pure white (`#FFFFFF`) for text. Use `on-surface` (`#E0E0E0`) to maintain a softer, premium contrast in `dark` mode.

*   **Don’t** use "Drop Shadows" on small elements like buttons or chips; keep them flat or tonally differentiated.

*   **Don’t** use standard 12-column grids if they feel restrictive. Allow elements to overlap slightly to create a sense of three-dimensional space.