# White-Label Deployment Guide

Deploy your own branded Dog Palette Tool in 5 steps.

## Prerequisites

- A Vercel account (free tier works)
- An Anthropic API key from console.anthropic.com
- Your logo as a PNG file (recommended: 240 x 80px, transparent background)

## Steps

### 1. Fork or clone this repo

git clone <repo-url> my-palette-tool
cd my-palette-tool

### 2. Replace the logo

Replace public/logo.png with your own logo file. Keep the filename logo.png.

### 3. Edit photographer.config.ts

Update every field:
- name: Your studio name
- ctaLabel: Your CTA button label (clients are already booked, so avoid "Book now". Try "Back to your session guide" or "Contact me with questions")
- ctaUrl: Where the CTA button links
- branding: Your brand colours as hex codes (update globals.css @theme block too)
- copy.pageTitle, copy.pageSubtitle, copy.uploadGuidelines: Your own copy
- headingFont, bodyFont: Google Fonts names (must be available on fonts.google.com. Update layout.tsx import too)

### 3b. Choose your animal(s)

In `photographer.config.ts`, set `subjects` to the species you photograph. Each entry has a singular noun, a plural, and the word for its colouring (coat or fur):

```ts
subjects: [
  { noun: "dog",   nounPlural: "dogs",   coatWord: "coat" },
  { noun: "cat",   nounPlural: "cats",   coatWord: "fur"  },
  { noun: "horse", nounPlural: "horses", coatWord: "coat" },
],
collectiveNoun: "animal",
```

- Shoot one species? List just that one. The whole tool speaks that animal, for example "your cat's fur".
- Shoot more than one? List them all. The tool auto-detects which animal is in each uploaded photo. `collectiveNoun` (default "animal", or use "pet") is the neutral word shown before analysis. Write your upload `pageSubtitle` and `uploadGuidelines` in neutral terms too.

### 4. Add your Anthropic API key to Vercel

In your Vercel project settings, go to Environment Variables and add:
  Name: ANTHROPIC_API_KEY
  Value: your-key-here

Each photographer needs their own key. Usage is billed to your account per request.

### 5. Deploy

npx vercel --prod

Or connect the repo to Vercel and it deploys automatically on every push to main.

## Sharing with clients

Your deployed URL (e.g. my-palette-tool.vercel.app) can be added to:
- Your session guide PDF as a clickable link or QR code
- Your booking confirmation email
- Your client welcome pack

Clients do not need an account to use it.

## Customising brand colours

Colours are defined in two places:
1. `photographer.config.ts` — used by `tailwind.config.ts` fontFamily extension
2. `app/globals.css` — the `@theme` block defines all `--color-brand-*` tokens

When changing colours, update the hex values in the `@theme` block in `globals.css`. The token names (e.g. `--color-brand-coral`) map directly to Tailwind classes (`bg-brand-coral`, `text-brand-coral`).
