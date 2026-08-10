Your role:

Act as a senior UI/UX designer and frontend engineer. Redesign the existing website project I provide by using the visual language and page-flow logic of the website shown in the reference video.

PRIMARY OBJECTIVE

Preserve every piece of existing content, data, page, feature and business function while transforming only the visual system, layout structure, card compositions, typography, spacing, responsive behavior and overall user experience.

I do not want the content, branding, text, images or company identity of the reference website to be copied. The reference video must only be used as inspiration for the design system, interaction patterns and page-flow structure.

NON-NEGOTIABLE RULES

1. Do not rewrite or modify any existing text.
2. Do not remove any information, heading, description, category, service, product, article, form field or contact detail.
3. Do not create fictional or additional content.
4. Do not use Lorem Ipsum or placeholder data.
5. Do not replace the existing logo, brand name or corporate identity.
6. Do not break existing routes, URLs or internal links.
7. Do not change the functional behavior of forms, filters, search fields, buttons or interactive components.
8. Do not break API connections, database operations or existing business logic.
9. Do not use any brand name, logo, text or image visible on the reference website.
10. Do not recreate the MacBook frame or the black presentation background visible in the video. Only reference the website displayed inside the laptop screen.
11. Do not summarize, shorten or rewrite existing content when placing it into the new layout.
12. Do not invent new sections when the current website has no relevant content for them. Map only existing content into suitable design components.

VISUAL DESIGN LANGUAGE

Apply the following visual characteristics from the reference:

- A modern, premium, editorial and minimal visual direction.
- White and very light gray surfaces as the primary background system.
- Black and dark gray for primary typography.
- Preserve the current brand colors and use them selectively for buttons, active states, icons or small accents.
- Use large, high-impact headings.
- Combine a clean modern sans-serif typeface with an elegant, high-contrast italic serif typeface.
- Do not make entire headings serif. Use the editorial serif style only for selected words or secondary lines.
- Use generous whitespace and large vertical section spacing.
- Prefer strong, wide visual sections instead of many small boxes.
- Use approximately 20–32 px corner radii on major cards and media containers.
- Avoid heavy shadows. Use subtle shadows or thin light-gray borders only when necessary.
- Present imagery in large, edge-to-edge media containers.
- Use object-fit: cover for card and section imagery.
- Use asymmetric grids, two-column compositions and bento-style layouts where suitable.
- Use simple right-arrow icons for calls to action.
- Use pill-shaped tabs or segmented controls for categories.
- Display active tabs with a dark background and light text.
- Display inactive tabs with a light background, subtle border and dark text.
- Avoid unnecessary gradients, neon effects, excessive shadows and visual clutter.

PAGE-FLOW STRUCTURE

Map the current website's existing content into the following flow whenever suitable:

1. HERO SECTION

- Begin the page with a large media panel with rounded corners.
- Use the current website's existing hero image, video or slider content.
- Display the existing main heading and description over or beside the media using strong typography.
- Preserve the current CTA button or link.
- The result should feel high-impact but restrained.

2. PRIMARY MESSAGE / VALUE PROPOSITION

- Follow the hero with a spacious, centrally aligned statement section.
- Use the current website's existing value proposition or the most relevant section heading.
- Use sans-serif typography for the main phrase and optionally emphasize one existing word or line using an italic editorial serif style.
- Preserve the existing supporting copy and CTA beneath it.

3. SERVICES, CATEGORIES OR AUDIENCE

- Transform existing services, categories or relevant content into large card compositions.
- A suitable structure is a heading and description on the left with interactive rows or cards on the right.
- Rows may include a minimal arrow icon on the right.
- Use narrow gaps between cards to create a connected but clearly separated surface system.

4. FULL-WIDTH MEDIA BREAK

- Use an existing website image as a large visual break between text-heavy sections.
- The media section should balance the content density and improve the page rhythm.
- Do not introduce unrelated stock imagery.

5. SPLIT MEDIA AND INFORMATION SECTION

- Place suitable existing content into a wide two-column composition.
- Use media on one side and a large heading, description and existing action on the other.
- The information panel may use a light-gray or subtly translucent surface.
- Convert the layout into one column on mobile devices.

6. TABBED INFORMATION PANEL

- When the existing website has related categories or corporate information, present them inside a large panel with wide tabs at the top.
- Use a dark active tab and light inactive tabs.
- Only display existing data within each tab.
- Do not change the current functional behavior when introducing the tab interface.

7. PRODUCT, SERVICE, PROJECT OR CONTENT CARDS

- Introduce the section with a large editorial heading.
- Display existing categories as tabs when categories already exist.
- Build large cards that combine text and imagery side by side.
- Alternate the image position between left and right where appropriate to create a dynamic page rhythm.
- Preserve the existing title and destination link.
- Include a minimal directional arrow.
- Preserve full-card click behavior when it currently exists.
- Use two columns on desktop and a single column on mobile.

8. RESOURCES AND QUICK LINKS

- Present existing documents, links, articles or resources as compact horizontal cards.
- Each card may contain its current title and a minimal arrow icon.
- Preserve every existing URL and destination.

9. FOOTER

- Design the footer as a large, clean, light-colored card surface.
- Preserve all existing footer headings and links.
- Use multiple columns on desktop and a structured stacked layout on mobile.
- Present an existing contact or email action as a clean action box when applicable.
- Preserve privacy, legal and copyright information.

MOTION AND INTERACTION

- Use subtle fade-in and translateY animations as sections enter the viewport.
- Apply restrained image-reveal transitions where appropriate.
- On hover, cards may move upward slightly, arrows may shift right and images may scale very subtly.
- Keep most transition durations between approximately 250 and 500 ms.
- Avoid heavy or distracting animation.
- Do not use unnecessary parallax effects.
- Tab transitions should feel smooth but responsive.
- Support prefers-reduced-motion.
- Reduce performance-intensive animation on mobile devices.

RESPONSIVE DESIGN

- Ensure the full experience works correctly on desktop, tablet and mobile.
- A maximum desktop container width of approximately 1320–1440 px may be used.
- Use clamp() for responsive horizontal padding.
- Use clamp() for fluid heading sizes.
- Convert two-column sections into one column on smaller screens.
- Reduce card radii and spacing proportionally on mobile.
- Allow tabs to scroll horizontally on narrow screens when necessary.
- Prevent text overflow and off-screen buttons.
- Define suitable aspect-ratio values for images and media.
- Preserve the existing mobile navigation functionality.

TECHNICAL IMPLEMENTATION

- First inspect the existing project structure, technology stack, pages and components.
- Continue using the existing technology, whether it is React, Vue, Next.js, Vite, Tailwind, CSS Modules or another framework.
- Do not migrate the project to a different framework without a technical requirement.
- Build reusable components for repeated visual patterns.
- Create shared design tokens for colors, spacing, border radii, container widths and typography.
- Use semantic HTML.
- Preserve keyboard accessibility.
- Add appropriate ARIA behavior to tab components.
- Preserve existing image alternative text.
- Maintain sufficient color contrast.
- Lazy-load non-critical images.
- Define image dimensions or aspect ratios to prevent layout shifts.
- Do not modify existing SEO titles or metadata.
- Do not leave console errors, broken links or non-functional interactions.

IMPLEMENTATION PROCESS

1. Inspect the complete existing project.
2. Identify every existing page section and content block.
3. Map each existing section to the most suitable reference-inspired layout.
4. Identify the files that must be updated.
5. Establish the shared design system and reusable components.
6. Apply the changes directly to the project files.
7. Do not provide only an explanation or isolated sample code; create the actual working implementation.
8. At the end, summarize the files changed and the design improvements made.
9. Verify that no original content has been changed, shortened or removed. Restore anything that was unintentionally altered.

ACCEPTANCE CRITERIA

The final implementation must meet all of the following:

- Every piece of existing website information is preserved.
- All existing functionality continues to work.
- The interface captures the premium, editorial and minimalist feeling of the reference.
- The result does not appear to be a copy of the reference company's branding or content.
- The current website's own brand identity remains intact.
- Desktop, tablet and mobile layouts work correctly.
- The page flow feels more spacious, visual and professional.
- No fabricated text, placeholder content or unrelated media is introduced.
- The laptop mockup shown in the video is not included in the website design.