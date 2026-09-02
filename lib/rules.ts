// The colour logic, in plain English, read by both AI passes.
//
// Product level and shared: every white-label client gets this file as-is.
// The photographer's own language rules live in config.voice, NOT here.
// Ina's boundary, 12 July 2026: her personal bans are hers, not the product's.
//
// Every future colour correction from Ina belongs in this file, not in a
// prompt string and not in a session note. That is the whole point of it.


export const COLOUR_THEORY = `
HOW COLOUR ACTUALLY WORKS. This is the mechanics behind every rule below.

THE THREE DIMENSIONS. Every colour has three, and you need all three to tell two
colours apart.
Hue is which colour it is, its position on the wheel.
Value is how light or dark it is.
Chroma is how vivid or muted it is, how much grey is in it.
Two colours are only genuinely different if they differ clearly on at least one
of these. Two names are not two colours. Rust and sienna share hue, share value
and share chroma, so they are one colour written twice.

PERCEPTUAL DISTANCE. Whether two colours read as one shape in a photograph is a
measurable thing, not a matter of taste. They merge when they are close in hue
AND close in value at the same time. They separate when either one opens up
enough. This is the test to apply between every pair you recommend, and between
every colour and the animal.

SEPARATION DEPENDS ON WHERE THE COAT SITS.
A very dark or very light coat separates on value: go clearly the other way.
A mid-tone coat cannot be separated on value alone, because clearing it by
enough in either direction leaves the wearable middle entirely. For a mid coat
the separation has to come from hue instead. This is why a slate teal works
beside a golden sable even though they are close in lightness, and why a warm
camel does not.

AREA AND CHROMA. The larger the area a colour covers, the lower its chroma has
to be. This is why a vivid colour reads as a lovely accent and as an assault
when it is the whole outfit, and it is the reason for the roles.
Roughly: the main piece is half of what is seen and must be low to mid chroma.
The second piece is around a quarter and is the neutral anchor.
The layer is around fifteen percent and breaks up the main.
The accent is five percent and is the only place high chroma belongs.

HARMONY. Colours that sit next to each other on the wheel, within about sixty
degrees, are calm and cohesive, and that is the right register for a portrait
where the animal is the subject. Colours from opposite sides of the wheel are
striking and grab the eye, so they belong only in the accent. Never build the
main pieces on an opposition: that is what makes a palette shout.

SKIN TONE. The coat decides what cannot be worn. The skin decides which of the
survivors is best.
Warm skin, which looks golden or peachy: earthy tones, rust, terracotta, camel,
olive, cream, warm browns. Avoid icy blue, cold grey, stark white and cool
purples, which drain it.
Cool skin, which looks pink or rosy: jewel tones, emerald, sapphire, ruby, true
blue, charcoal, clean white. Avoid mustard, orange and tomato red, which turn it
sallow.
Neutral skin: most things work. Choose on the coat and the location, then use
the skin only to rule out the known clashes above.
Depth matters as well as temperature. Very light skin is washed out by very pale
clothing. Deep skin is flattened by pale pastels and lifted by rich, saturated
colour.

WHAT THE CAMERA DOES.
Fine stripes, small checks and tight patterns clash with the sensor grid and
come out as rainbow banding. This is moire and it cannot be fixed afterwards.
Pure white beside a very dark animal exceeds what the sensor can hold, so either
the white blows out or the animal goes black. Off-white solves it.
Neon and fluorescent colours bounce their own colour onto skin and fur, which
puts a green or pink cast under the chin and through the coat.
Texture is the answer to all of this. Physical texture catches real light and
gives depth without any of these problems, which is why texture beats pattern
every time.
`.trim()

export const COLOUR_RULES = `
PRIORITY ORDER. Resolve the constraints in this sequence.

1. Separate from the dog. Non-negotiable. Every colour must be far enough from
   the coat AND from the markings that the two never read as one shape, judged
   by the perceptual distance above. For a very dark or very light coat that
   means going the other way in value. For a mid-tone coat it means going a
   different way in hue, because value alone cannot do it there. This is the
   reason this tool exists. Nothing else matters if the person and the animal
   merge together.
2. Fit the location. Echo the setting, or take the opposite side of the colour
   wheel from it. Whichever survives step 1. Blending into the landscape is
   fine, because the animal is the subject and the person is not. Blending into
   the animal is never fine.
3. Suit their skin tone. Undertone and depth, chosen from what is still
   standing after steps 1 and 2.
4. Be wearable. At least half the palette from a colour family they said they
   already own.

GOVERNING RULES.

Where a rule below gives a count or a slot, it is a requirement and not a
preference. If it says one of the six must be a particular kind of colour, the
answer is wrong without it.

Bright is not banned, it gets a smaller piece. How loud a colour is decides how
much of it they wear, never whether they wear it at all. So a bright colour
belongs on an accessory, and you should say so.

There is one exception and it matters. If they told you brights or jewel tones
are what they actually wear, then a bright main piece is the right answer for
them, not a mistake. Handing someone muted neutrals when their whole wardrobe is
colour is useless advice they will ignore. In that case keep the bright on the
main piece, choose the version of it that separates best from the coat, and use
the guidance to say where to place it so the animal still leads.

Black and white are both fine to wear, and most people own plenty of both.
They are only wrong in three specific places, and nowhere else.
Never black when the animal is black or very dark. Never black when the studio
backdrop is black. Never white when the animal is white or very light. In each
of those the person and the thing behind or beside them become one shape.
Outside those three, black is a good, wearable colour and you should offer it.

Never recommend a colour that matches the studio backdrop, whatever that
backdrop is. A person in the backdrop's own colour is a floating head.

White on a main piece has to be toned down. Not stark white, not optic white:
an off-white, an ivory, a soft oat. The brightest thing in a photograph takes
the eye, and if the person is wearing it then the person takes the eye. This
holds regardless of the coat, and it holds even when white is what they own.

Shift the tone, do not ban the family. Never rule out a whole colour family the
animal happens to wear. Rule out its exact tone and offer a deeper or warmer
one instead. A corgi's white is chest and legs, a small area, not a frame-wide
merge risk. Cream stays available; stark white does not. Banning a colour that
most people already own is useless advice, and it is the fastest way to make the
whole answer feel unusable.

Five or six distinct ideas, and they must have range. Five real colours beat six
with a repeat in them, every time. Never return six shades of the
same thing: a palette of six warm browns is one idea repeated, even when every
name is different. Two colours count as the same colour when they sit close on
the wheel and close in lightness, so walnut beside mahogany is one colour twice.
Where a coat group pushes the whole palette one way, as grey coats push it warm,
that is correct and you should follow it. A palette that is entirely warm is not
a fault.

What is a fault is six versions of one colour, and the way that happens is
everything landing at the same depth. So space the six evenly from deepest to
lightest, and this is a requirement rather than a preference. Think of it as six
rungs on a ladder running from very deep to clearly light, with a real step
between each rung. No two of the six may sit at the same depth.

Rust, sienna, brick and ochre are the same colour four times, because they are
all warm and all sitting at the same depth. Espresso, brick, clay, caramel and
oat are different colours in the same warm family, because each one is a clear
step lighter than the one before it.

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

THE FOUR COLOURS TO AVOID.

Each of the four must fail for a different reason, and there are only four
reasons available. One matches the main coat colour. One matches the markings.
One matches the session background. One is bright enough to pull the eye off the
animal. Four shades of the same problem is one warning repeated, and it wastes
three quarters of the list.

Only rule out a colour that would genuinely merge, not every colour in the same
broad family as the coat. A white dog is one specific white. Sand, oat, beige and
mid grey are not that white, and banning them alongside it makes the advice
unusable, since it rules out most of what people own. Name the tone that actually
merges and leave the neighbours alone.

Never contradict yourself: if you recommend a light colour in the palette, you
cannot then rule out the light range in this list.
`.trim()

export const COAT_GROUPS = `
COAT GROUPS. One rule for every animal assumes they are all a mid-tone. They
are not. Identify the group first, then apply its strategy.

Black or very dark: the person goes lighter, and the separation comes from
lightness rather than from bright colour. A muted stone separates as well as a
jewel tone and stays soft. Rules out black, charcoal and deep navy on a main
piece.

White or very light: most of the palette goes mid or deep so the fur keeps its
detail. But you must also offer exactly one light option, and it is not optional.
Nearly everyone owns white and cream, and a palette of six deep colours leaves
someone with a pale wardrobe nothing to wear, which makes the whole answer
useless to them.

That light option has to be clearly off the dog's own white: an oat, an
off-cream, a soft beige, warmer or deeper than the coat rather than the same
white. Give it the layer role, and say in the guidance that it works worn against
one of the deeper pieces rather than head to toe. What is ruled out is a
head to toe pale outfit in the same white as the coat, not the colour itself.

Golden or cream: cool colours separate best, but never on the biggest piece.
Rules out tan, mustard and warm cream, which merge into the coat.

Brown or chocolate: dusty blues, soft creams and muted turquoise. Rules out
head to toe brown, rust and tan, and very dark outfits in low light.

Grey or blue: warm colours balance them, so rust, terracotta and warm clay. This
is the only group where the answer runs warm, and it is easy to take too far.
Grey coats are rarely pure grey, they carry brown through them, so warm browns,
camel, taupe and tobacco land right on top of the coat rather than beside it.
Stay on the red and orange side of warm, keep it clearly deeper or lighter than
the coat, and put at least two cool or neutral options in the six so the whole
palette is not one warm smear. Rules out all-grey outfits, which go flat under a
grey sky, and rules out mid-toned browns.

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
