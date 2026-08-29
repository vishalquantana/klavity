// Share-picker hover hint (KLA snap-share-hint). On hover of a capture control (the composer's "Snap" button
// or the launcher FAB), when a screen-share hasn't been granted yet, we surface a small preview that mimics
// the browser's "Allow <site> to see this tab?" dialog and steers the reporter to click **Allow** — so a
// first-timer knows exactly what the upcoming system prompt is and what to click. Self-contained: the element
// carries its own <style>, so it drops into ANY shadow root (composer or launcher) with no external CSS.

/**
 * Best-effort "is a screen-share already granted?" check. getDisplayMedia has NO persistent grant and the
 * `display-capture` Permissions API query is unsupported in most browsers — so we treat ONLY an explicit
 * `granted` as "already allowed" (skip the hint). Everything else (prompt / denied / unsupported / throws)
 * means the browser will show its dialog, so the hint is worth showing. Never throws.
 */
export async function shareCaptureLikelyGranted(): Promise<boolean> {
  try {
    const perms = (navigator as unknown as { permissions?: { query?: (d: { name: string }) => Promise<{ state?: string }> } }).permissions
    if (!perms?.query) return false
    const status = await perms.query({ name: 'display-capture' })
    return status?.state === 'granted'
  } catch {
    return false
  }
}

// A tiny host label (the site the browser will name in the dialog), e.g. "bookjoy.co". Falls back gracefully.
function currentHostLabel(): string {
  try { return location.host || location.hostname || 'this site' } catch { return 'this site' }
}

let _seq = 0

/**
 * Build the share-picker hint element (matches the approved mockup): a Klavity card wrapping a mini mock of
 * the browser's "Allow … to see this tab?" dialog (preview thumbnail + Cancel / **Allow**, with a pulse ring
 * on Allow) and a one-line steer. The caller owns positioning + show/hide (toggle the `kl-show` class) and
 * appends it wherever it wants. `align` only tweaks which corner the little pointer tail sits on.
 */
export function createSharePickerHint(opts: { title: string; steer: string; host?: string; align?: 'left' | 'right' }): HTMLElement {
  const host = opts.host || currentHostLabel()
  const id = 'kl-shp-' + (++_seq)
  const wrap = document.createElement('div')
  wrap.className = 'kl-shp ' + id
  wrap.setAttribute('role', 'status')

  // Scoped styles — class-prefixed so multiple hints (and the host page) never collide. @keyframes for the
  // Allow pulse live here too (inline styles can't express keyframes). Applies within the shadow root it's
  // appended to.
  const style = document.createElement('style')
  style.textContent = `
    .kl-shp{position:absolute;width:288px;max-width:calc(100vw - 24px);box-sizing:border-box;background:#fff;color:#2a2f3a;
      border:1px solid #e6e3f5;border-radius:16px;padding:13px 13px 14px;box-shadow:0 26px 60px -20px rgba(40,30,80,.5);
      font-family:system-ui,-apple-system,"Segoe UI",sans-serif;z-index:2147483647;opacity:0;transform:translateY(6px);
      transition:opacity .18s ease,transform .18s cubic-bezier(.2,.7,.2,1);pointer-events:none;}
    .kl-shp.kl-show{opacity:1;transform:translateY(0);pointer-events:auto;}
    .kl-shp .kl-shp-hd{display:flex;align-items:center;gap:8px;margin:2px 0 10px;}
    .kl-shp .kl-shp-k{flex:0 0 auto;width:22px;height:22px;border-radius:6px;background:#6366f1;color:#fff;display:grid;place-items:center;font-weight:800;font-size:12px;}
    .kl-shp .kl-shp-hd b{font-size:13px;font-weight:800;letter-spacing:-.01em;line-height:1.2;}
    .kl-shp .kl-shp-dlg{border:1px solid #33383f;border-radius:12px;overflow:hidden;background:#202124;color:#e8eaed;box-shadow:0 6px 18px -6px rgba(0,0,0,.55);}
    .kl-shp .kl-shp-dh{padding:11px 12px 2px;}
    .kl-shp .kl-shp-dt{font-size:12px;font-weight:700;color:#e8eaed;line-height:1.25;}
    .kl-shp .kl-shp-ds{font-size:10.5px;color:#9aa0a6;margin-top:3px;line-height:1.3;}
    .kl-shp .kl-shp-prev{margin:10px 12px 6px;border:1.5px solid #1a73e8;border-radius:8px;overflow:hidden;background:#fff;}
    .kl-shp .kl-shp-shot{height:74px;background:linear-gradient(180deg,#fff,#f3f5f8);position:relative;}
    .kl-shp .kl-shp-shot:before{content:"";position:absolute;left:0;top:0;bottom:0;width:26px;background:#f7f8fa;border-right:1px solid #eceef2;}
    .kl-shp .kl-shp-shot:after{content:"";position:absolute;left:36px;right:10px;top:12px;height:8px;border-radius:3px;background:#e7ebf1;box-shadow:0 16px 0 -2px #eef1f5,0 30px 0 -2px #eef1f5,0 44px 0 -2px #eef1f5;}
    .kl-shp .kl-shp-cap{display:flex;align-items:center;gap:7px;padding:6px 8px;background:#fff;border-top:1px solid #eef1f5;}
    .kl-shp .kl-shp-fav{flex:0 0 auto;width:15px;height:15px;border-radius:4px;background:linear-gradient(135deg,#ef4444,#f97316);display:grid;place-items:center;color:#fff;font-size:8px;font-weight:800;}
    .kl-shp .kl-shp-rt{font-size:10.5px;color:#3c4043;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .kl-shp .kl-shp-foot{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:8px 12px 11px;}
    .kl-shp .kl-shp-cancel{font-size:11px;font-weight:700;color:#c9ccd1;background:#33373d;border-radius:999px;padding:6px 14px;}
    .kl-shp .kl-shp-allow{position:relative;font-size:11px;font-weight:800;color:#fff;background:#1a73e8;border-radius:999px;padding:6px 18px;box-shadow:0 4px 12px -3px rgba(26,115,232,.7);}
    .kl-shp .kl-shp-allow:after{content:"";position:absolute;inset:-3px;border-radius:999px;border:2px solid #1a73e8;opacity:0;animation:kl-shp-ring 1.8s ease-out infinite;}
    .kl-shp .kl-shp-steer{display:flex;gap:7px;align-items:flex-start;margin-top:11px;font-size:12px;line-height:1.45;color:#4b5160;}
    .kl-shp .kl-shp-n{flex:0 0 auto;width:16px;height:16px;border-radius:50%;background:#6366f1;color:#fff;font-size:10px;font-weight:800;display:grid;place-items:center;margin-top:1px;}
    .kl-shp .kl-shp-steer b{color:#2a2f3a;font-weight:800;}
    .kl-shp .kl-shp-tail{position:absolute;width:13px;height:13px;background:#fff;border-right:1px solid #e6e3f5;border-bottom:1px solid #e6e3f5;}
    @keyframes kl-shp-ring{0%{opacity:.6;transform:scale(1)}70%{opacity:0;transform:scale(1.14)}100%{opacity:0}}
    @media (prefers-reduced-motion: reduce){.kl-shp{transition:none!important}.kl-shp .kl-shp-allow:after{animation:none!important}}
  `

  // Title row: K chip + heading (static copy).
  const head = document.createElement('div')
  head.className = 'kl-shp-hd'
  const k = document.createElement('span'); k.className = 'kl-shp-k'; k.textContent = 'K'
  const h = document.createElement('b'); h.textContent = opts.title
  head.append(k, h)

  // Mini "Allow … to see this tab?" dialog. Host is untrusted-ish → textContent (never innerHTML).
  const dlg = document.createElement('div'); dlg.className = 'kl-shp-dlg'
  const dh = document.createElement('div'); dh.className = 'kl-shp-dh'
  const dt = document.createElement('div'); dt.className = 'kl-shp-dt'; dt.textContent = `Allow ${host} to see this tab?`
  const ds = document.createElement('div'); ds.className = 'kl-shp-ds'; ds.textContent = 'The site will be able to see the contents of this tab'
  dh.append(dt, ds)
  const prev = document.createElement('div'); prev.className = 'kl-shp-prev'
  const shot = document.createElement('div'); shot.className = 'kl-shp-shot'
  const cap = document.createElement('div'); cap.className = 'kl-shp-cap'
  const fav = document.createElement('span'); fav.className = 'kl-shp-fav'; fav.textContent = (host[0] || 'K').toUpperCase()
  const rt = document.createElement('span'); rt.className = 'kl-shp-rt'; rt.textContent = 'This tab'
  cap.append(fav, rt); prev.append(shot, cap)
  const foot = document.createElement('div'); foot.className = 'kl-shp-foot'
  const cancel = document.createElement('span'); cancel.className = 'kl-shp-cancel'; cancel.textContent = 'Cancel'
  const allow = document.createElement('span'); allow.className = 'kl-shp-allow'; allow.textContent = 'Allow'
  foot.append(cancel, allow)
  dlg.append(dh, prev, foot)

  // Steer line.
  const steer = document.createElement('div'); steer.className = 'kl-shp-steer'
  const n = document.createElement('span'); n.className = 'kl-shp-n'; n.textContent = '1'
  const st = document.createElement('span'); st.textContent = opts.steer
  steer.append(n, st)

  wrap.append(style, head, dlg, steer)
  return wrap
}
