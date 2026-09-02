// Audits bench output against the colour theory the redesign was built on,
// by measuring rather than asserting. Reads the fixture photo to estimate the
// coat, then tests each principle we took from the research.
//
// Run: npm run theory
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { analyseImage } from '../lib/analyse'
import { locationById, backdropById } from '../lib/locations'
import type { Intake, PaletteResult, MediaType, WearColour } from '../lib/types'

const FIXTURES = join(process.cwd(), 'bench', 'fixtures')

interface HSL { h: number; s: number; l: number }

function hsl(hex: string): HSL {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = ((max + min) / 2) * 100
  const d = max - min
  const s = d === 0 ? 0 : (d / (1 - Math.abs((max + min) - 1))) * 100
  if (d === 0) return { h: 0, s: 0, l }
  let h: number
  if (max === r) h = ((g - b) / d) % 6
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return { h: (h * 60 + 360) % 360, s, l }
}

// The research specifies CIE Lab and a perceptual distance, not lightness
// alone. That matters most for mid-tone coats: a coat at L50 cannot be cleared
// by 20 points in either direction without leaving the wearable middle, so
// separation there has to come from hue instead. Measuring lightness only was
// failing colours that separate perfectly well.
function lab(hex: string): [number, number, number] {
  const srgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const [r, g, b] = srgb.map((v) => (v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92))
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const [fx, fy, fz] = [f(x), f(y), f(z)]
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

function deltaE(a: string, b: string): number {
  const [l1, a1, b1] = lab(a)
  const [l2, a2, b2] = lab(b)
  return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2)
}

const hueGap = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

// The model states the coat in words. Turn that into a lightness band so the
// separation test has something to measure against, without pretending to
// sample pixels we cannot reliably isolate from the background.
function coatBand(group: string, primary: string): { l: number; label: string; hex: string } {
  const g = `${group} ${primary}`.toLowerCase()
  const warm = /gold|sable|tan|red|ginger|brown|cream|fawn/.test(g)
  if (/black|very dark|near-black/.test(g)) return { l: 12, label: 'very dark', hex: '#1E1C1A' }
  if (/white|very light/.test(g)) return { l: 88, label: 'very light', hex: '#EFEDE8' }
  if (/dark|espresso|chocolate/.test(g)) return { l: 25, label: 'dark', hex: '#41342A' }
  if (/light|pale|blonde|cream/.test(g)) return { l: 75, label: 'light', hex: '#D9CBB4' }
  return { l: 50, label: 'mid', hex: warm ? '#C8974F' : '#82807A' }
}

function relation(colourHue: number, coatWarm: boolean): string {
  const warmish = colourHue < 70 || colourHue > 330
  if (warmish === coatWarm) return 'analogous'
  return 'opposed'
}

interface Row { slug: string; result: PaletteResult; intake: Intake }

function audit(rows: Row[]) {
  const satByRole: Record<string, number[]> = { main: [], second: [], layer: [], accent: [] }
  let sepPass = 0, sepTotal = 0
  let brightMains = 0, totalMains = 0
  const maxSats: number[] = []

  for (const { slug, result, intake } of rows) {
    const coat = coatBand(result.coat?.group ?? '', result.coat?.primary ?? '')
    const coatWarm = /warm|gold|sable|tan|red|ginger|brown|cream/.test(
      `${result.coat?.primary ?? ''}`.toLowerCase(),
    )
    const loc = locationById(intake.locationId)
    const bd = intake.backdropId ? backdropById(intake.backdropId) : undefined

    console.log(`\n${'='.repeat(76)}`)
    console.log(`${slug}`)
    console.log(`coat: ${result.coat?.primary} (${result.coat?.group}), read as ${coat.label}, L~${coat.l}`)
    console.log(`session: ${loc?.label}${bd ? ` on ${bd.label}` : ''}${intake.season ? `, ${intake.season}` : ''}`)
    console.log(`${'colour'.padEnd(24)}${'role'.padEnd(9)}${'L'.padEnd(6)}${'sat'.padEnd(6)}${'dL/dE'.padEnd(14)}hue vs coat`)

    for (const w of result.wear as WearColour[]) {
      const c = hsl(w.hex)
      const dL = Math.abs(c.l - coat.l)
      const dE = deltaE(w.hex, coat.hex)
      // 25 is the threshold at which two colours stop reading as one shape at
      // portrait distance. Lightness alone is no longer the test.
      const ok = dE >= 25
      sepTotal++; if (ok) sepPass++
      satByRole[w.role]?.push(c.s)
      if (w.role === 'main') {
        totalMains++
        // Only a fault if bright is not what they said they wear.
        const wearsBright =
          intake.wardrobe.includes('brights') || intake.wardrobe.includes('jewel')
        if (c.s > 45 && !wearsBright) brightMains++
      }
      console.log(
        `${w.name.padEnd(24)}${w.role.padEnd(9)}${Math.round(c.l).toString().padEnd(6)}${Math.round(c.s).toString().padEnd(6)}${(`${Math.round(dL)}/${Math.round(dE)}` + (ok ? ' ok' : ' THIN')).padEnd(14)}${c.s < 12 ? 'neutral' : relation(c.h, coatWarm)}`,
      )
    }
    maxSats.push(Math.max(...(result.wear as WearColour[]).map((w) => hsl(w.hex).s)))
  }

  const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0)

  console.log(`\n${'='.repeat(76)}\nACROSS ALL CASES\n`)
  console.log('1. Moon-Spencer, chroma should fall as area rises.')
  console.log(`   mean saturation by role: main ${avg(satByRole.main).toFixed(0)}, second ${avg(satByRole.second).toFixed(0)}, layer ${avg(satByRole.layer).toFixed(0)}, accent ${avg(satByRole.accent).toFixed(0)}`)
  console.log(`   ${avg(satByRole.accent) > avg(satByRole.main) ? 'HOLDS: the accent is the most saturated slot' : 'BROKEN: the accent is not the most saturated slot'}`)
  console.log('\n2. Anti-camouflage, every colour clear of the coat in tone.')
  console.log(`   ${sepPass}/${sepTotal} colours at a perceptual distance of 25 or more from the coat (${Math.round((100 * sepPass) / sepTotal)}%)`)
  console.log('\n3. Chroma discipline, the original complaint.')
  console.log(`   mean peak saturation per palette: ${avg(maxSats).toFixed(0)}`)
  console.log(`   bright on a main slot where they did NOT say they wear bright: ${brightMains}/${totalMains}`)
}

async function main() {
  const slugs = readdirSync(FIXTURES).filter((s) => existsSync(join(FIXTURES, s, 'photo.jpg'))).sort()
  const rows: Row[] = []
  await Promise.all(
    slugs.map(async (slug) => {
      const dir = join(FIXTURES, slug)
      const intake = JSON.parse(readFileSync(join(dir, 'intake.json'), 'utf8')) as Intake
      const base64 = readFileSync(join(dir, 'photo.jpg')).toString('base64')
      try {
        const result = await analyseImage(base64, 'image/jpeg' as MediaType, intake)
        rows.push({ slug, result, intake })
      } catch {
        console.error(`${slug}: failed`)
      }
    }),
  )
  rows.sort((a, b) => a.slug.localeCompare(b.slug))
  audit(rows)
}

main()
