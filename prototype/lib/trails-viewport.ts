import type { TrailViewport, TrailViewportPreset } from "./trails-types"

export const TRAIL_VIEWPORT_PRESETS: Record<TrailViewportPreset, TrailViewport> = {
  desktop: { preset: "desktop", width: 1280, height: 720, isMobile: false, deviceScaleFactor: 1 },
  mobile: { preset: "mobile", width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 },
}

function boundedInt(v: unknown, name: string, min: number, max: number): number {
  const n = Number(v)
  if (!Number.isInteger(n) || n < min || n > max) throw new Error(`${name} must be an integer ${min}-${max}`)
  return n
}

export function normalizeTrailViewport(input: unknown): TrailViewport | null {
  if (input == null || input === "") return null
  if (typeof input === "string") {
    const preset = input as TrailViewportPreset
    if (!TRAIL_VIEWPORT_PRESETS[preset]) throw new Error("viewport preset must be 'desktop' or 'mobile'")
    return { ...TRAIL_VIEWPORT_PRESETS[preset] }
  }
  if (typeof input !== "object") throw new Error("viewport must be an object, preset string, or null")
  const raw = input as Record<string, unknown>
  const preset = raw.preset == null || raw.preset === "" ? undefined : String(raw.preset)
  const base = preset ? TRAIL_VIEWPORT_PRESETS[preset as TrailViewportPreset] : undefined
  if (preset && !base) throw new Error("viewport preset must be 'desktop' or 'mobile'")
  const hasWidth = raw.width != null && raw.width !== ""
  const hasHeight = raw.height != null && raw.height !== ""
  if (!base && (!hasWidth || !hasHeight)) throw new Error("viewport requires width and height or a preset")
  if (hasWidth !== hasHeight) throw new Error("viewport width and height must be provided together")
  const width = hasWidth ? boundedInt(raw.width, "viewport.width", 200, 3840) : base!.width
  const height = hasHeight ? boundedInt(raw.height, "viewport.height", 200, 2160) : base!.height
  const out: TrailViewport = { width, height }
  if (base?.preset) out.preset = base.preset
  out.isMobile = raw.isMobile == null ? (base?.isMobile ?? false) : Boolean(raw.isMobile)
  const dsfRaw = raw.deviceScaleFactor ?? base?.deviceScaleFactor
  if (dsfRaw != null) {
    const dsf = Number(dsfRaw)
    if (!Number.isFinite(dsf) || dsf < 1 || dsf > 4) throw new Error("viewport.deviceScaleFactor must be 1-4")
    out.deviceScaleFactor = dsf
  }
  return out
}

export function parseTrailViewportJson(raw: unknown): TrailViewport | null {
  if (raw == null || raw === "") return null
  try {
    return normalizeTrailViewport(JSON.parse(String(raw)))
  } catch {
    return null
  }
}
