'use client'
import { SkinTonePicker } from './SkinTonePicker'
import { BackdropPicker } from './BackdropPicker'
import { locations, locationById } from '@/lib/locations'
import { WARDROBE_FAMILIES, type Intake, type Season, type WardrobeFamily } from '@/lib/types'
import { displayNoun } from '@/lib/subjects'

const FAMILY_LABELS: Record<WardrobeFamily, string> = {
  neutrals: 'Neutrals',
  earthy: 'Earthy',
  'rust-spice': 'Rust & spice',
  jewel: 'Jewel tones',
  'dusty-muted': 'Dusty & muted',
  pastels: 'Pastels',
  'deep-dark': 'Deep & dark',
  'black-white': 'Black & white',
  denim: 'Denim',
  brights: 'Brights',
}

const SEASONS: Season[] = ['summer', 'autumn', 'winter', 'spring']

interface Props {
  value: Intake
  onChange: (next: Intake) => void
}

const chip = (active: boolean) =>
  `text-xs rounded-full px-3 py-1.5 border font-medium transition-colors ${
    active
      ? 'bg-brand-coral text-brand-ivory-light border-brand-coral font-bold'
      : 'bg-white text-brand-brown border-brand-pink'
  }`

export function IntakeQuestions({ value, onChange }: Props) {
  const set = (patch: Partial<Intake>) => onChange({ ...value, ...patch })
  const location = value.locationId ? locationById(value.locationId) : undefined

  const toggleFamily = (f: WardrobeFamily) =>
    set({
      wardrobe: value.wardrobe.includes(f)
        ? value.wardrobe.filter((x) => x !== f)
        : [...value.wardrobe, f],
    })

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="subjectName"
          className="text-[0.63rem] font-bold tracking-widest uppercase text-brand-coral"
        >
          Their name (optional)
        </label>
        <input
          id="subjectName"
          value={value.subjectName ?? ''}
          onChange={(e) => set({ subjectName: e.target.value })}
          placeholder={`Your ${displayNoun}'s name`}
          className="border border-brand-pink rounded-lg px-3 py-2 text-sm text-brand-dark bg-white"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[0.63rem] font-bold tracking-widest uppercase text-brand-coral">
          1 &middot; Your skin tone
        </p>
        <SkinTonePicker
          depth={value.skinDepth}
          onDepth={(d) => set({ skinDepth: d })}
          undertone={value.undertone}
          onUndertone={(u) => set({ undertone: u })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[0.63rem] font-bold tracking-widest uppercase text-brand-coral">
          2 &middot; What you actually wear
        </p>
        <div className="flex flex-wrap gap-1.5">
          {WARDROBE_FAMILIES.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={value.wardrobe.includes(f)}
              onClick={() => toggleFamily(f)}
              className={chip(value.wardrobe.includes(f))}
            >
              {FAMILY_LABELS[f]}
            </button>
          ))}
        </div>
        <p className="text-xs text-brand-light-green leading-relaxed">
          Pick what is already in your wardrobe, so we build from things you would actually put on.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[0.63rem] font-bold tracking-widest uppercase text-brand-coral">
          3 &middot; Where is your session
        </p>
        <div className="flex flex-wrap gap-1.5">
          {locations.map((l) => (
            <button
              key={l.id}
              type="button"
              aria-pressed={value.locationId === l.id}
              onClick={() => set({ locationId: l.id, backdropId: undefined, season: undefined })}
              className={chip(value.locationId === l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>

        {location?.kind === 'studio' && (
          <div className="border-l-2 border-brand-pink pl-3 flex flex-col gap-2 mt-1">
            <p className="text-[0.66rem] text-brand-light-green font-semibold">Which backdrop?</p>
            <BackdropPicker
              selected={value.backdropId}
              onSelect={(id) => set({ backdropId: id })}
            />
          </div>
        )}

        {location?.kind === 'outdoor' && (
          <div className="border-l-2 border-brand-pink pl-3 flex flex-col gap-2 mt-1">
            <p className="text-[0.66rem] text-brand-light-green font-semibold">Roughly when?</p>
            <div className="flex gap-1.5">
              {SEASONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={value.season === s}
                  onClick={() => set({ season: s })}
                  className={`flex-1 capitalize ${chip(value.season === s)}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
