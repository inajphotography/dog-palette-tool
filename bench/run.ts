// Re-runs the new logic over the captured cases and writes a side-by-side
// sheet against what the live tool returned on 1 Sep 2026.
//
// Every case runs three times, because one sample from a model is not a
// regression test. The machine assertions must hold on all three. Whether a
// palette is too saturated is Ina's call and is deliberately not asserted.
//
// Run: npm run bench            (all cases)
//      npm run bench -- corgi   (only slugs containing "corgi")
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { analyseImage } from '../lib/analyse'
import { MODEL } from '../lib/modelCall'
import { checkPalette } from './assertions'
import { locationById, backdropById } from '../lib/locations'
import type { Intake, PaletteResult, MediaType } from '../lib/types'

const RUNS = 3
const FIXTURES = join(process.cwd(), 'bench', 'fixtures')
const OUT = join(process.cwd(), 'bench', 'out')

interface Baseline {
  source: string
  note: string
  wear: string[]
  avoid: string[]
}
interface CaseRun {
  result?: PaletteResult
  failures: string[]
  error?: string
}
interface BenchCase {
  slug: string
  intake: Intake
  baseline: Baseline
  runs: CaseRun[]
}

async function runCase(slug: string): Promise<BenchCase> {
  const dir = join(FIXTURES, slug)
  const intake = JSON.parse(readFileSync(join(dir, 'intake.json'), 'utf8')) as Intake
  const baseline = JSON.parse(readFileSync(join(dir, 'baseline.json'), 'utf8')) as Baseline
  const base64 = readFileSync(join(dir, 'photo.jpg')).toString('base64')

  // The three runs of a case are independent, so they go concurrently.
  const runs = await Promise.all(
    Array.from({ length: RUNS }, async (): Promise<CaseRun> => {
      try {
        const result = await analyseImage(base64, 'image/jpeg' as MediaType, intake)
        return { result, failures: checkPalette(result, intake) }
      } catch (error) {
        return {
          failures: ['threw'],
          error: error instanceof Error ? error.message : String(error),
        }
      }
    }),
  )
  return { slug, intake, baseline, runs }
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function swatches(colours: { hex: string; name: string; role?: string }[]): string {
  return colours
    .map(
      (c) =>
        `<span class="sw"><i style="background:${esc(c.hex)}"></i>${esc(c.name)}${
          c.role ? `<em>${esc(c.role)}</em>` : ''
        }</span>`,
    )
    .join('')
}

function names(list: string[]): string {
  return list.map((n) => `<span class="nm">${esc(n)}</span>`).join('')
}

function sessionLine(intake: Intake): string {
  const loc = intake.locationId ? locationById(intake.locationId) : undefined
  const bd = intake.backdropId ? backdropById(intake.backdropId) : undefined
  const bits = [
    loc?.label ?? intake.locationId,
    bd ? `backdrop ${bd.label}` : '',
    intake.season ?? '',
    `undertone ${intake.undertone}`,
    intake.skinDepth ? `depth ${intake.skinDepth}` : 'no depth',
    intake.wardrobe.length ? `wears ${intake.wardrobe.join(', ')}` : 'wardrobe not given',
  ].filter(Boolean)
  return bits.join(' &middot; ')
}

function render(cases: BenchCase[], stamp: string): string {
  const passed = cases.filter((c) => c.runs.every((r) => r.failures.length === 0)).length

  const rows = cases
    .map((c) => {
      const failed = c.runs.some((r) => r.failures.length)
      const runsHtml = c.runs
        .map(
          (r, i) => `
      <div class="run ${r.failures.length ? 'bad' : 'good'}">
        <b>run ${i + 1}</b>
        ${r.result ? swatches(r.result.wear) : ''}
        ${r.result ? `<div class="avoid">avoid ${swatches(r.result.avoid)}</div>` : ''}
        ${
          r.result?.howToWear
            ? `<div class="howto">${r.result.howToWear
                .map((l) => `<span><b>${esc(l.label)}</b> ${esc(l.text)}</span>`)
                .join('')}</div>`
            : ''
        }
        ${
          r.failures.length
            ? `<ul>${r.failures.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>`
            : '<p>all assertions passed</p>'
        }
        ${r.error ? `<ul><li>${esc(r.error)}</li></ul>` : ''}
      </div>`,
        )
        .join('')

      const breed = c.runs.find((r) => r.result?.detectedBreed)?.result?.detectedBreed
      const coat = c.runs.find((r) => r.result?.coat)?.result?.coat

      return `<section class="${failed ? 'bad' : 'good'}">
      <h2>${esc(c.slug)}${breed ? ` <em>${esc(breed)}</em>` : ''}</h2>
      <div class="meta">${sessionLine(c.intake)}</div>
      ${coat ? `<div class="meta">read as ${esc(coat.primary)}, group ${esc(coat.group)}${coat.markings?.length ? `, markings ${esc(coat.markings.join(', '))}` : ''}</div>` : ''}
      <div class="baseline"><b>live tool today</b>${names(c.baseline.wear)}<div class="avoid">avoid ${names(c.baseline.avoid)}</div></div>
      ${runsHtml}
    </section>`
    })
    .join('')

  return `<title>Coat Check bench, ${stamp}</title>
<style>
 body{font:15px/1.55 system-ui,-apple-system,sans-serif;margin:0;padding:32px;background:#14170F;color:#DDDFD2}
 h1{font-size:19px;margin:0 0 6px} .sub{color:#8C9481;font-size:13px;margin:0 0 26px}
 h2{font-size:14px;letter-spacing:.08em;text-transform:uppercase;margin:0 0 6px}
 h2 em{color:#8C9481;font-style:normal;text-transform:none;letter-spacing:0;font-size:12px}
 section{border:1px solid #333A2B;border-radius:6px;padding:16px 18px;margin:0 0 16px}
 section.bad{border-left:3px solid #C0503C} section.good{border-left:3px solid #7FA05A}
 .meta{font-size:11.5px;color:#8C9481;margin-bottom:4px}
 .sw{display:inline-flex;align-items:center;gap:6px;margin:0 12px 6px 0;font-size:11.5px}
 .sw i{width:20px;height:20px;border-radius:50%;display:inline-block;border:1px solid rgba(0,0,0,.25)}
 .sw em{font-style:normal;color:#6F7862;font-size:9.5px;text-transform:uppercase;letter-spacing:.08em}
 .nm{display:inline-block;margin:0 10px 4px 0;font-size:11.5px;color:#9AA28B}
 .run,.baseline{padding:9px 0;border-top:1px dashed #333A2B;margin-top:8px}
 .run>b,.baseline>b{display:block;font-size:10.5px;text-transform:uppercase;letter-spacing:.1em;color:#6F7862;margin-bottom:6px}
 .avoid{opacity:.72;font-size:11px;margin-top:2px}
 .howto{font-size:11.5px;color:#9AA28B;display:flex;flex-direction:column;gap:2px;margin-top:6px}
 .howto b{color:#B9C0A8}
 ul{margin:6px 0 0;padding-left:18px;color:#E08560;font-size:12px}
 p{margin:6px 0 0;color:#7FA05A;font-size:12px}
</style>
<h1>Coat Check bench &middot; ${cases.length} cases &middot; ${passed} clean on all ${RUNS} runs</h1>
<p class="sub">${MODEL}, temperature 0, ${RUNS} runs per case, ${stamp}. Assertions cover the mechanical faults only. Whether a palette is still too saturated is your call.</p>
${rows}`
}

async function main() {
  const filter = process.argv[2]
  const slugs = readdirSync(FIXTURES)
    .filter((s) => existsSync(join(FIXTURES, s, 'photo.jpg')))
    .filter((s) => !filter || s.includes(filter))
    .sort()

  if (!slugs.length) {
    console.error('No fixtures with a photo.jpg matching that filter.')
    process.exit(1)
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set. Put it in .env.local or export it.')
    process.exit(1)
  }

  // Two cases at a time, three runs each, so six calls in flight. Enough to
  // finish the full set in minutes without tripping rate limits.
  const CONCURRENCY = 2
  const cases: BenchCase[] = []
  const queue = [...slugs]

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      while (queue.length) {
        const slug = queue.shift()
        if (!slug) return
        const c = await runCase(slug)
        const bad = c.runs.filter((r) => r.failures.length).length
        console.log(`${slug.padEnd(24)}${bad ? `${bad}/${RUNS} runs failed assertions` : 'clean'}`)
        cases.push(c)
      }
    }),
  )
  cases.sort((a, b) => a.slug.localeCompare(b.slug))

  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ')
  mkdirSync(OUT, { recursive: true })
  const path = join(OUT, `${stamp.slice(0, 10)}-bench.html`)
  writeFileSync(path, render(cases, stamp))

  const failed = cases.filter((c) => c.runs.some((r) => r.failures.length))
  console.log(`\n${cases.length} cases, ${failed.length} with assertion failures`)
  console.log(`Sheet: ${path}`)
}

main()
