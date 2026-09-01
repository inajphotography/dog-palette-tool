// The colour logic, in plain English, read by both AI passes.
//
// Product level and shared: every white-label client gets this file as-is.
// The photographer's own language rules live in config.voice, NOT here.
// Ina's boundary, 12 July 2026: her personal bans are hers, not the product's.
//
// Every future colour correction from Ina belongs in this file, not in a
// prompt string and not in a session note. That is the whole point of it.

export const COLOUR_RULES = `
PRIORITY ORDER. Resolve the constraints in this sequence.

1. Separate from the dog. Non-negotiable. Every colour must be clearly lighter
   or darker than the coat AND than the markings. This is the reason this tool
   exists. Nothing else matters if the person and the animal merge together.
2. Fit the location. Echo the setting, or take the opposite side of the colour
   wheel from it. Whichever survives step 1. Blending into the landscape is
   fine, because the animal is the subject and the person is not. Blending into
   the animal is never fine.
3. Suit their skin tone. Undertone and depth, chosen from what is still
   standing after steps 1 and 2.
4. Be wearable. At least half the palette from a colour family they said they
   already own.

GOVERNING RULES.

Bright is not banned, it gets a smaller piece. How loud a colour is decides how
much of it they wear, never whether they wear it at all. Nothing bright on a
main piece. A bright colour belongs on an accessory, and you should say so.

Shift the tone, do not ban the family. Never rule out a whole colour family the
animal happens to wear. Rule out its exact tone and offer a deeper or warmer
one instead. A corgi's white is chest and legs, a small area, not a frame-wide
merge risk. Cream stays available; stark white does not. Banning a colour that
most people already own is useless advice.

Six distinct ideas. No two recommended colours may share a family value.

Never recommend a colour that matches the studio backdrop. An accent in the
backdrop's own colour disappears into it. If you want to echo the backdrop,
go several shades deeper than it.

Outfit cap. Two or three colours all up, counting the neutrals.

Solid over pattern, and texture instead of pattern. Fine stripes clash with the
camera sensor and produce rainbow banding. Logos and busy prints pull the eye
off the animal. Do not explain either of those reasons in your output, just
give the instruction.

Ignore the background of the uploaded photo entirely. The person is preparing
for a session that has not happened yet, so the photo cannot possibly have been
taken at the venue. It is whatever picture they already had: the lounge room,
the back garden, a holiday, another city, another country. It tells you nothing
at all about the session. Use it only to read the animal. Separation is measured
against the session location given to you in this prompt, never against whatever
happens to be behind the animal in the snapshot.

Read the coat, the face and the body. Markings count. Most animals are not one
colour, and the markings often change the answer.
`.trim()

export const COAT_GROUPS = `
COAT GROUPS. One rule for every animal assumes they are all a mid-tone. They
are not. Identify the group first, then apply its strategy.

Black or very dark: the person goes lighter, and the separation comes from
lightness rather than from bright colour. A muted stone separates as well as a
jewel tone and stays soft. Rules out black, charcoal and deep navy on a main
piece.

White or very light: the person goes mid or deep so the fur keeps its detail.
Rules out white and pale pastels head to toe.

Golden or cream: cool colours separate best, but never on the biggest piece.
Rules out tan, mustard and warm cream, which merge into the coat.

Brown or chocolate: dusty blues, soft creams and muted turquoise. Rules out
head to toe brown, rust and tan, and very dark outfits in low light.

Grey or blue: warm colours balance them, so rust, camel and terracotta. This is
the only group where the answer runs warm. Rules out all-grey outfits, which go
flat under a grey sky.

Red or ginger: cool neutrals and blues. The animal is already the warm colour
in the photograph, so nothing should add more warmth on top of it.

Two-tone, merle or heavily marked: the main coat colour is ruled out, but the
markings only rule out their own exact tone. The person stays plain, in solid
blocks, with no pattern at all.
`.trim()

// Genuine AI tells, banned for every photographer using this product.
// Personal taste belongs in config.voice, per Ina's 12 July 2026 boundary.
export const UNIVERSAL_BANNED: readonly string[] = [
  'game-changer',
  'unleash',
  'elevate your',
  'seamless',
  'not just a',
  'it is not just',
]
