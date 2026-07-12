var Ua = Object.defineProperty;
var Ba = (e, t, r) => t in e ? Ua(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var Bt = (e, t, r) => Ba(e, typeof t != "symbol" ? t + "" : t, r);
function Wa(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i))
    return e;
  const r = document.implementation.createHTMLDocument(), i = r.createElement("base"), n = r.createElement("a");
  return r.head.appendChild(i), r.body.appendChild(n), t && (i.href = t), n.href = e, n.href;
}
const ja = /* @__PURE__ */ (() => {
  let e = 0;
  const t = () => (
    // eslint-disable-next-line no-bitwise
    `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4)
  );
  return () => (e += 1, `u${t()}${e}`);
})();
function Ke(e) {
  const t = [];
  for (let r = 0, i = e.length; r < i; r++)
    t.push(e[r]);
  return t;
}
let dt = null;
function po(e = {}) {
  return dt || (e.includeStyleProperties ? (dt = e.includeStyleProperties, dt) : (dt = Ke(window.getComputedStyle(document.documentElement)), dt));
}
function nr(e, t) {
  const i = (e.ownerDocument.defaultView || window).getComputedStyle(e).getPropertyValue(t);
  return i ? parseFloat(i.replace("px", "")) : 0;
}
function qa(e) {
  const t = nr(e, "border-left-width"), r = nr(e, "border-right-width");
  return e.clientWidth + t + r;
}
function Ha(e) {
  const t = nr(e, "border-top-width"), r = nr(e, "border-bottom-width");
  return e.clientHeight + t + r;
}
function fo(e, t = {}) {
  const r = t.width || qa(e), i = t.height || Ha(e);
  return { width: r, height: i };
}
function Va() {
  let e, t;
  try {
    t = process;
  } catch {
  }
  const r = t && t.env ? t.env.devicePixelRatio : null;
  return r && (e = parseInt(r, 10), Number.isNaN(e) && (e = 1)), e || window.devicePixelRatio || 1;
}
const Ee = 16384;
function Ga(e) {
  (e.width > Ee || e.height > Ee) && (e.width > Ee && e.height > Ee ? e.width > e.height ? (e.height *= Ee / e.width, e.width = Ee) : (e.width *= Ee / e.height, e.height = Ee) : e.width > Ee ? (e.height *= Ee / e.width, e.width = Ee) : (e.width *= Ee / e.height, e.height = Ee));
}
function ir(e) {
  return new Promise((t, r) => {
    const i = new Image();
    i.onload = () => {
      i.decode().then(() => {
        requestAnimationFrame(() => t(i));
      });
    }, i.onerror = r, i.crossOrigin = "anonymous", i.decoding = "async", i.src = e;
  });
}
async function Ya(e) {
  return Promise.resolve().then(() => new XMLSerializer().serializeToString(e)).then(encodeURIComponent).then((t) => `data:image/svg+xml;charset=utf-8,${t}`);
}
async function Xa(e, t, r) {
  const i = "http://www.w3.org/2000/svg", n = document.createElementNS(i, "svg"), s = document.createElementNS(i, "foreignObject");
  return n.setAttribute("width", `${t}`), n.setAttribute("height", `${r}`), n.setAttribute("viewBox", `0 0 ${t} ${r}`), s.setAttribute("width", "100%"), s.setAttribute("height", "100%"), s.setAttribute("x", "0"), s.setAttribute("y", "0"), s.setAttribute("externalResourcesRequired", "true"), n.appendChild(s), s.appendChild(e), Ya(n);
}
const Ce = (e, t) => {
  if (e instanceof t)
    return !0;
  const r = Object.getPrototypeOf(e);
  return r === null ? !1 : r.constructor.name === t.name || Ce(r, t);
};
function Ja(e) {
  const t = e.getPropertyValue("content");
  return `${e.cssText} content: '${t.replace(/'|"/g, "")}';`;
}
function Ka(e, t) {
  return po(t).map((r) => {
    const i = e.getPropertyValue(r), n = e.getPropertyPriority(r);
    return `${r}: ${i}${n ? " !important" : ""};`;
  }).join(" ");
}
function Za(e, t, r, i) {
  const n = `.${e}:${t}`, s = r.cssText ? Ja(r) : Ka(r, i);
  return document.createTextNode(`${n}{${s}}`);
}
function bi(e, t, r, i) {
  const n = window.getComputedStyle(e, r), s = n.getPropertyValue("content");
  if (s === "" || s === "none")
    return;
  const l = ja();
  try {
    t.className = `${t.className} ${l}`;
  } catch {
    return;
  }
  const p = document.createElement("style");
  p.appendChild(Za(l, r, n, i)), t.appendChild(p);
}
function Qa(e, t, r) {
  bi(e, t, ":before", r), bi(e, t, ":after", r);
}
const vi = "application/font-woff", wi = "image/jpeg", el = {
  woff: vi,
  woff2: vi,
  ttf: "application/font-truetype",
  eot: "application/vnd.ms-fontobject",
  png: "image/png",
  jpg: wi,
  jpeg: wi,
  gif: "image/gif",
  tiff: "image/tiff",
  svg: "image/svg+xml",
  webp: "image/webp"
};
function tl(e) {
  const t = /\.([^./]*?)$/g.exec(e);
  return t ? t[1] : "";
}
function Yn(e) {
  const t = tl(e).toLowerCase();
  return el[t] || "";
}
function rl(e) {
  return e.split(/,/)[1];
}
function Un(e) {
  return e.search(/^(data:)/) !== -1;
}
function nl(e, t) {
  return `data:${t};base64,${e}`;
}
async function mo(e, t, r) {
  const i = await fetch(e, t);
  if (i.status === 404)
    throw new Error(`Resource "${i.url}" not found`);
  const n = await i.blob();
  return new Promise((s, l) => {
    const p = new FileReader();
    p.onerror = l, p.onloadend = () => {
      try {
        s(r({ res: i, result: p.result }));
      } catch (o) {
        l(o);
      }
    }, p.readAsDataURL(n);
  });
}
const Ir = {};
function il(e, t, r) {
  let i = e.replace(/\?.*/, "");
  return r && (i = e), /ttf|otf|eot|woff2?/i.test(i) && (i = i.replace(/.*\//, "")), t ? `[${t}]${i}` : i;
}
async function Xn(e, t, r) {
  const i = il(e, t, r.includeQueryParams);
  if (Ir[i] != null)
    return Ir[i];
  r.cacheBust && (e += (/\?/.test(e) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
  let n;
  try {
    const s = await mo(e, r.fetchRequestInit, ({ res: l, result: p }) => (t || (t = l.headers.get("Content-Type") || ""), rl(p)));
    n = nl(s, t);
  } catch (s) {
    n = r.imagePlaceholder || "";
    let l = `Failed to fetch resource: ${e}`;
    s && (l = typeof s == "string" ? s : s.message), l && console.warn(l);
  }
  return Ir[i] = n, n;
}
async function sl(e) {
  const t = e.toDataURL();
  return t === "data:," ? e.cloneNode(!1) : ir(t);
}
async function ol(e, t) {
  if (e.currentSrc) {
    const s = document.createElement("canvas"), l = s.getContext("2d");
    s.width = e.clientWidth, s.height = e.clientHeight, l == null || l.drawImage(e, 0, 0, s.width, s.height);
    const p = s.toDataURL();
    return ir(p);
  }
  const r = e.poster, i = Yn(r), n = await Xn(r, i, t);
  return ir(n);
}
async function al(e, t) {
  var r;
  try {
    if (!((r = e == null ? void 0 : e.contentDocument) === null || r === void 0) && r.body)
      return await fr(e.contentDocument.body, t, !0);
  } catch {
  }
  return e.cloneNode(!1);
}
async function ll(e, t) {
  return Ce(e, HTMLCanvasElement) ? sl(e) : Ce(e, HTMLVideoElement) ? ol(e, t) : Ce(e, HTMLIFrameElement) ? al(e, t) : e.cloneNode(go(e));
}
const cl = (e) => e.tagName != null && e.tagName.toUpperCase() === "SLOT", go = (e) => e.tagName != null && e.tagName.toUpperCase() === "SVG";
async function ul(e, t, r) {
  var i, n;
  if (go(t))
    return t;
  let s = [];
  return cl(e) && e.assignedNodes ? s = Ke(e.assignedNodes()) : Ce(e, HTMLIFrameElement) && (!((i = e.contentDocument) === null || i === void 0) && i.body) ? s = Ke(e.contentDocument.body.childNodes) : s = Ke(((n = e.shadowRoot) !== null && n !== void 0 ? n : e).childNodes), s.length === 0 || Ce(e, HTMLVideoElement) || await s.reduce((l, p) => l.then(() => fr(p, r)).then((o) => {
    o && t.appendChild(o);
  }), Promise.resolve()), t;
}
function dl(e, t, r) {
  const i = t.style;
  if (!i)
    return;
  const n = window.getComputedStyle(e);
  n.cssText ? (i.cssText = n.cssText, i.transformOrigin = n.transformOrigin) : po(r).forEach((s) => {
    let l = n.getPropertyValue(s);
    s === "font-size" && l.endsWith("px") && (l = `${Math.floor(parseFloat(l.substring(0, l.length - 2))) - 0.1}px`), Ce(e, HTMLIFrameElement) && s === "display" && l === "inline" && (l = "block"), s === "d" && t.getAttribute("d") && (l = `path(${t.getAttribute("d")})`), i.setProperty(s, l, n.getPropertyPriority(s));
  });
}
function hl(e, t) {
  Ce(e, HTMLTextAreaElement) && (t.innerHTML = e.value), Ce(e, HTMLInputElement) && t.setAttribute("value", e.value);
}
function pl(e, t) {
  if (Ce(e, HTMLSelectElement)) {
    const i = Array.from(t.children).find((n) => e.value === n.getAttribute("value"));
    i && i.setAttribute("selected", "");
  }
}
function fl(e, t, r) {
  return Ce(t, Element) && (dl(e, t, r), Qa(e, t, r), hl(e, t), pl(e, t)), t;
}
async function ml(e, t) {
  const r = e.querySelectorAll ? e.querySelectorAll("use") : [];
  if (r.length === 0)
    return e;
  const i = {};
  for (let s = 0; s < r.length; s++) {
    const p = r[s].getAttribute("xlink:href");
    if (p) {
      const o = e.querySelector(p), d = document.querySelector(p);
      !o && d && !i[p] && (i[p] = await fr(d, t, !0));
    }
  }
  const n = Object.values(i);
  if (n.length) {
    const s = "http://www.w3.org/1999/xhtml", l = document.createElementNS(s, "svg");
    l.setAttribute("xmlns", s), l.style.position = "absolute", l.style.width = "0", l.style.height = "0", l.style.overflow = "hidden", l.style.display = "none";
    const p = document.createElementNS(s, "defs");
    l.appendChild(p);
    for (let o = 0; o < n.length; o++)
      p.appendChild(n[o]);
    e.appendChild(l);
  }
  return e;
}
async function fr(e, t, r) {
  return !r && t.filter && !t.filter(e) ? null : Promise.resolve(e).then((i) => ll(i, t)).then((i) => ul(e, i, t)).then((i) => fl(e, i, t)).then((i) => ml(i, t));
}
const yo = /url\((['"]?)([^'"]+?)\1\)/g, gl = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, yl = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function bl(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
function vl(e) {
  const t = [];
  return e.replace(yo, (r, i, n) => (t.push(n), r)), t.filter((r) => !Un(r));
}
async function wl(e, t, r, i, n) {
  try {
    const s = r ? Wa(t, r) : t, l = Yn(t);
    let p;
    return n || (p = await Xn(s, l, i)), e.replace(bl(t), `$1${p}$3`);
  } catch {
  }
  return e;
}
function xl(e, { preferredFontFormat: t }) {
  return t ? e.replace(yl, (r) => {
    for (; ; ) {
      const [i, , n] = gl.exec(r) || [];
      if (!n)
        return "";
      if (n === t)
        return `src: ${i};`;
    }
  }) : e;
}
function bo(e) {
  return e.search(yo) !== -1;
}
async function vo(e, t, r) {
  if (!bo(e))
    return e;
  const i = xl(e, r);
  return vl(i).reduce((s, l) => s.then((p) => wl(p, l, t, r)), Promise.resolve(i));
}
async function ht(e, t, r) {
  var i;
  const n = (i = t.style) === null || i === void 0 ? void 0 : i.getPropertyValue(e);
  if (n) {
    const s = await vo(n, null, r);
    return t.style.setProperty(e, s, t.style.getPropertyPriority(e)), !0;
  }
  return !1;
}
async function kl(e, t) {
  await ht("background", e, t) || await ht("background-image", e, t), await ht("mask", e, t) || await ht("-webkit-mask", e, t) || await ht("mask-image", e, t) || await ht("-webkit-mask-image", e, t);
}
async function Sl(e, t) {
  const r = Ce(e, HTMLImageElement);
  if (!(r && !Un(e.src)) && !(Ce(e, SVGImageElement) && !Un(e.href.baseVal)))
    return;
  const i = r ? e.src : e.href.baseVal, n = await Xn(i, Yn(i), t);
  await new Promise((s, l) => {
    e.onload = s, e.onerror = t.onImageErrorHandler ? (...o) => {
      try {
        s(t.onImageErrorHandler(...o));
      } catch (d) {
        l(d);
      }
    } : l;
    const p = e;
    p.decode && (p.decode = s), p.loading === "lazy" && (p.loading = "eager"), r ? (e.srcset = "", e.src = n) : e.href.baseVal = n;
  });
}
async function Cl(e, t) {
  const i = Ke(e.childNodes).map((n) => wo(n, t));
  await Promise.all(i).then(() => e);
}
async function wo(e, t) {
  Ce(e, Element) && (await kl(e, t), await Sl(e, t), await Cl(e, t));
}
function El(e, t) {
  const { style: r } = e;
  t.backgroundColor && (r.backgroundColor = t.backgroundColor), t.width && (r.width = `${t.width}px`), t.height && (r.height = `${t.height}px`);
  const i = t.style;
  return i != null && Object.keys(i).forEach((n) => {
    r[n] = i[n];
  }), e;
}
const xi = {};
async function ki(e) {
  let t = xi[e];
  if (t != null)
    return t;
  const i = await (await fetch(e)).text();
  return t = { url: e, cssText: i }, xi[e] = t, t;
}
async function Si(e, t) {
  let r = e.cssText;
  const i = /url\(["']?([^"')]+)["']?\)/g, s = (r.match(/url\([^)]+\)/g) || []).map(async (l) => {
    let p = l.replace(i, "$1");
    return p.startsWith("https://") || (p = new URL(p, e.url).href), mo(p, t.fetchRequestInit, ({ result: o }) => (r = r.replace(l, `url(${o})`), [l, o]));
  });
  return Promise.all(s).then(() => r);
}
function Ci(e) {
  if (e == null)
    return [];
  const t = [], r = /(\/\*[\s\S]*?\*\/)/gi;
  let i = e.replace(r, "");
  const n = new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})", "gi");
  for (; ; ) {
    const o = n.exec(i);
    if (o === null)
      break;
    t.push(o[0]);
  }
  i = i.replace(n, "");
  const s = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi, l = "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})", p = new RegExp(l, "gi");
  for (; ; ) {
    let o = s.exec(i);
    if (o === null) {
      if (o = p.exec(i), o === null)
        break;
      s.lastIndex = p.lastIndex;
    } else
      p.lastIndex = s.lastIndex;
    t.push(o[0]);
  }
  return t;
}
async function Ml(e, t) {
  const r = [], i = [];
  return e.forEach((n) => {
    if ("cssRules" in n)
      try {
        Ke(n.cssRules || []).forEach((s, l) => {
          if (s.type === CSSRule.IMPORT_RULE) {
            let p = l + 1;
            const o = s.href, d = ki(o).then((a) => Si(a, t)).then((a) => Ci(a).forEach((h) => {
              try {
                n.insertRule(h, h.startsWith("@import") ? p += 1 : n.cssRules.length);
              } catch (u) {
                console.error("Error inserting rule from remote css", {
                  rule: h,
                  error: u
                });
              }
            })).catch((a) => {
              console.error("Error loading remote css", a.toString());
            });
            i.push(d);
          }
        });
      } catch (s) {
        const l = e.find((p) => p.href == null) || document.styleSheets[0];
        n.href != null && i.push(ki(n.href).then((p) => Si(p, t)).then((p) => Ci(p).forEach((o) => {
          l.insertRule(o, l.cssRules.length);
        })).catch((p) => {
          console.error("Error loading remote stylesheet", p);
        })), console.error("Error inlining remote css file", s);
      }
  }), Promise.all(i).then(() => (e.forEach((n) => {
    if ("cssRules" in n)
      try {
        Ke(n.cssRules || []).forEach((s) => {
          r.push(s);
        });
      } catch (s) {
        console.error(`Error while reading CSS rules from ${n.href}`, s);
      }
  }), r));
}
function Rl(e) {
  return e.filter((t) => t.type === CSSRule.FONT_FACE_RULE).filter((t) => bo(t.style.getPropertyValue("src")));
}
async function Ol(e, t) {
  if (e.ownerDocument == null)
    throw new Error("Provided element is not within a Document");
  const r = Ke(e.ownerDocument.styleSheets), i = await Ml(r, t);
  return Rl(i);
}
function xo(e) {
  return e.trim().replace(/["']/g, "");
}
function Il(e) {
  const t = /* @__PURE__ */ new Set();
  function r(i) {
    (i.style.fontFamily || getComputedStyle(i).fontFamily).split(",").forEach((s) => {
      t.add(xo(s));
    }), Array.from(i.children).forEach((s) => {
      s instanceof HTMLElement && r(s);
    });
  }
  return r(e), t;
}
async function Al(e, t) {
  const r = await Ol(e, t), i = Il(e);
  return (await Promise.all(r.filter((s) => i.has(xo(s.style.fontFamily))).map((s) => {
    const l = s.parentStyleSheet ? s.parentStyleSheet.href : null;
    return vo(s.cssText, l, t);
  }))).join(`
`);
}
async function Ll(e, t) {
  const r = t.fontEmbedCSS != null ? t.fontEmbedCSS : t.skipFonts ? null : await Al(e, t);
  if (r) {
    const i = document.createElement("style"), n = document.createTextNode(r);
    i.appendChild(n), e.firstChild ? e.insertBefore(i, e.firstChild) : e.appendChild(i);
  }
}
async function Tl(e, t = {}) {
  const { width: r, height: i } = fo(e, t), n = await fr(e, t, !0);
  return await Ll(n, t), await wo(n, t), El(n, t), await Xa(n, r, i);
}
async function Pl(e, t = {}) {
  const { width: r, height: i } = fo(e, t), n = await Tl(e, t), s = await ir(n), l = document.createElement("canvas"), p = l.getContext("2d"), o = t.pixelRatio || Va(), d = t.canvasWidth || r, a = t.canvasHeight || i;
  return l.width = d * o, l.height = a * o, t.skipAutoScale || Ga(l), l.style.width = `${d}`, l.style.height = `${a}`, t.backgroundColor && (p.fillStyle = t.backgroundColor, p.fillRect(0, 0, l.width, l.height)), p.drawImage(s, 0, 0, l.width, l.height), l;
}
async function Nl(e, t = {}) {
  return (await Pl(e, t)).toDataURL();
}
const _l = {
  "file-text": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /> <path d="M14 2v4a2 2 0 0 0 2 2h4" /> <path d="M10 9H8" /> <path d="M16 13H8" /> <path d="M16 17H8" />',
  "clipboard-list": '<rect width="8" height="4" x="8" y="2" rx="1" ry="1" /> <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /> <path d="M12 11h4" /> <path d="M12 16h4" /> <path d="M8 11h.01" /> <path d="M8 16h.01" />',
  dna: '<path d="m10 16 1.5 1.5" /> <path d="m14 8-1.5-1.5" /> <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" /> <path d="m16.5 10.5 1 1" /> <path d="m17 6-2.891-2.891" /> <path d="M2 15c6.667-6 13.333 0 20-6" /> <path d="m20 9 .891.891" /> <path d="M3.109 14.109 4 15" /> <path d="m6.5 12.5 1 1" /> <path d="m7 18 2.891 2.891" /> <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />',
  bug: '<path d="M12 20v-9" /> <path d="M14 7a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4z" /> <path d="M14.12 3.88 16 2" /> <path d="M21 21a4 4 0 0 0-3.81-4" /> <path d="M21 5a4 4 0 0 1-3.55 3.97" /> <path d="M22 13h-4" /> <path d="M3 21a4 4 0 0 1 3.81-4" /> <path d="M3 5a4 4 0 0 0 3.55 3.97" /> <path d="M6 13H2" /> <path d="m8 2 1.88 1.88" /> <path d="M9 7.13V6a3 3 0 1 1 6 0v1.13" />',
  search: '<path d="m21 21-4.34-4.34" /> <circle cx="11" cy="11" r="8" />',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />',
  lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /> <path d="M9 18h6" /> <path d="M10 22h4" />',
  moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />',
  sun: '<circle cx="12" cy="12" r="4" /> <path d="M12 2v2" /> <path d="M12 20v2" /> <path d="m4.93 4.93 1.41 1.41" /> <path d="m17.66 17.66 1.41 1.41" /> <path d="M2 12h2" /> <path d="M20 12h2" /> <path d="m6.34 17.66-1.41 1.41" /> <path d="m19.07 4.93-1.41 1.41" />',
  "mouse-pointer-2": '<path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /> <circle cx="12" cy="12" r="3" />',
  heart: '<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />',
  meh: '<circle cx="12" cy="12" r="10" /> <line x1="8" x2="16" y1="15" y2="15" /> <line x1="9" x2="9.01" y1="9" y2="9" /> <line x1="15" x2="15.01" y1="9" y2="9" />',
  angry: '<circle cx="12" cy="12" r="10" /> <path d="M16 16s-1.5-2-4-2-4 2-4 2" /> <path d="M7.5 8 10 9" /> <path d="m14 9 2.5-1" /> <path d="M9 10h.01" /> <path d="M15 10h.01" />',
  frown: '<circle cx="12" cy="12" r="10" /> <path d="M16 16s-1.5-2-4-2-4 2-4 2" /> <line x1="9" x2="9.01" y1="9" y2="9" /> <line x1="15" x2="15.01" y1="9" y2="9" />',
  check: '<path d="M20 6 9 17l-5-5" />',
  "check-circle": '<path d="M21.801 10A10 10 0 1 1 17 3.335" /> <path d="m9 11 3 3L22 4" />',
  x: '<path d="M18 6 6 18" /> <path d="m6 6 12 12" />',
  "x-circle": '<circle cx="12" cy="12" r="10" /> <path d="m15 9-6 6" /> <path d="m9 9 6 6" />',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /> <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /> <circle cx="12" cy="7" r="4" />',
  mic: '<path d="M12 19v3" /> <path d="M19 10v2a7 7 0 0 1-14 0v-2" /> <rect x="9" y="2" width="6" height="13" rx="3" />',
  puzzle: '<path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z" />',
  sprout: '<path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3" /> <path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4" /> <path d="M5 21h14" />',
  camera: '<path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" /> <circle cx="12" cy="13" r="3" />',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2" /> <circle cx="9" cy="9" r="2" /> <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />',
  "map-pin": '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /> <circle cx="12" cy="10" r="3" />',
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2" /> <line x1="8" x2="16" y1="21" y2="21" /> <line x1="12" x2="12" y1="17" y2="21" />',
  pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /> <path d="m15 5 4 4" />',
  scissors: '<circle cx="6" cy="6" r="3" /> <path d="M8.12 8.12 12 12" /> <path d="M20 4 8.12 15.88" /> <circle cx="6" cy="18" r="3" /> <path d="M14.8 14.8 20 20" />',
  square: '<rect width="18" height="18" x="3" y="3" rx="2" />',
  "trash-2": '<path d="M10 11v6" /> <path d="M14 11v6" /> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /> <path d="M3 6h18" /> <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />',
  chrome: '<path d="M10.88 21.94 15.46 14" /> <path d="M21.17 8H12" /> <path d="M3.95 6.06 8.54 14" /> <circle cx="12" cy="12" r="10" /> <circle cx="12" cy="12" r="4" />',
  "app-window": '<rect x="2" y="4" width="20" height="16" rx="2" /> <path d="M10 4v4" /> <path d="M2 8h20" /> <path d="M6 4v4" />',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />',
  plug: '<path d="M12 22v-5" /> <path d="M9 8V2" /> <path d="M15 8V2" /> <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />',
  ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /> <path d="M13 5v2" /> <path d="M13 17v2" /> <path d="M13 11v2" />',
  "message-circle": '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /> <path d="M16 3.128a4 4 0 0 1 0 7.744" /> <path d="M22 21v-2a4 4 0 0 0-3-3.87" /> <circle cx="9" cy="7" r="4" />',
  settings: '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" /> <circle cx="12" cy="12" r="3" />',
  "radio-tower": '<path d="M4.9 16.1C1 12.2 1 5.8 4.9 1.9" /> <path d="M7.8 4.7a6.14 6.14 0 0 0-.8 7.5" /> <circle cx="12" cy="9" r="2" /> <path d="M16.2 4.8c2 2 2.26 5.11.8 7.47" /> <path d="M19.1 1.9a9.96 9.96 0 0 1 0 14.1" /> <path d="M9.5 18h5" /> <path d="m8 22 4-11 4 11" />',
  palette: '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" /> <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /> <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /> <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /> <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2" /> <path d="M7 11V7a5 5 0 0 1 10 0v4" />',
  plus: '<path d="M5 12h14" /> <path d="M12 5v14" />',
  sparkles: '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" /> <path d="M20 2v4" /> <path d="M22 4h-4" /> <circle cx="4" cy="20" r="2" />',
  paperclip: '<path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" />',
  "triangle-alert": '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /> <path d="M12 9v4" /> <path d="M12 17h.01" />',
  hand: '<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" /> <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" /> <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" /> <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />',
  footprints: '<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z" /> <path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z" /> <path d="M16 17h4" /> <path d="M4 13h4" />',
  satellite: '<path d="m13.5 6.5-3.148-3.148a1.205 1.205 0 0 0-1.704 0L6.352 5.648a1.205 1.205 0 0 0 0 1.704L9.5 10.5" /> <path d="M16.5 7.5 19 5" /> <path d="m17.5 10.5 3.148 3.148a1.205 1.205 0 0 1 0 1.704l-2.296 2.296a1.205 1.205 0 0 1-1.704 0L13.5 14.5" /> <path d="M9 21a6 6 0 0 0-6-6" /> <path d="M9.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l4.296-4.296a1.205 1.205 0 0 0 0-1.704l-2.296-2.296a1.205 1.205 0 0 0-1.704 0z" />',
  play: '<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />',
  pause: '<rect x="14" y="3" width="5" height="18" rx="1" /> <rect x="5" y="3" width="5" height="18" rx="1" />',
  "rotate-cw": '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /> <path d="M21 3v5h-5" />',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0" /> <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />',
  "refresh-cw": '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /> <path d="M21 3v5h-5" /> <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /> <path d="M8 16H3v5" />',
  bot: '<path d="M12 8V4H8" /> <rect width="16" height="12" x="4" y="8" rx="2" /> <path d="M2 14h2" /> <path d="M20 14h2" /> <path d="M15 13v2" /> <path d="M9 13v2" />',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />',
  "chevron-left": '<path d="m15 18-6-6 6-6" />',
  "chevron-right": '<path d="m9 18 6-6-6-6" />',
  clock: '<path d="M12 6v6l4 2" /> <circle cx="12" cy="12" r="10" />',
  loader: '<path d="M12 2v4" /> <path d="m16.2 7.8 2.9-2.9" /> <path d="M18 12h4" /> <path d="m16.2 16.2 2.9 2.9" /> <path d="M12 18v4" /> <path d="m4.9 19.1 2.9-2.9" /> <path d="M2 12h4" /> <path d="m4.9 4.9 2.9 2.9" />'
};
function $l(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function ae(e, t = {}) {
  const r = _l[e];
  if (!r)
    return console.warn("[Klavity] unknown icon: " + e), "";
  const i = t.size ?? 18, n = t.class ? `icon ${t.class}` : "icon", s = t.label ? 'role="img"' : 'aria-hidden="true"', l = t.label ? `<title>${$l(t.label)}</title>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${n}" width="${i}" height="${i}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" ${s}>${l}${r}</svg>`;
}
const ft = {
  integration: "jira",
  backendUrl: "",
  autoFileErrors: !1,
  connectionMode: "direct",
  klavToken: "",
  jira: { baseUrl: "", email: "", token: "", projectKey: "" },
  linear: { apiKey: "", teamId: "" },
  github: { token: "", repo: "" },
  plane: { token: "", host: "https://api.plane.so", workspace: "", projectId: "" }
};
class Dl {
  constructor(t, r) {
    this.shapes = [], this.canvas = t, this.imageDataUrl = r;
  }
  computeLineWidth() {
    return Math.max(3, this.canvas.width / 400);
  }
  computeFontSize() {
    return Math.max(16, this.canvas.width / 60);
  }
  addShape(t) {
    this.shapes.push(t), this.redraw();
  }
  undo() {
    this.shapes.pop(), this.redraw();
  }
  clearAll() {
    this.shapes.length = 0, this.redraw();
  }
  redraw() {
    if (typeof Image > "u") return;
    const t = this.canvas.getContext("2d"), r = new Image();
    r.onload = () => {
      t.clearRect(0, 0, this.canvas.width, this.canvas.height), t.drawImage(r, 0, 0), this.shapes.forEach((i) => this.drawShape(t, i));
    }, r.src = this.imageDataUrl;
  }
  drawShape(t, r) {
    if (t.strokeStyle = r.color, t.fillStyle = r.color, t.lineWidth = this.computeLineWidth(), t.lineCap = "round", r.type === "pen")
      t.beginPath(), r.points.forEach(
        (i, n) => n === 0 ? t.moveTo(i.x, i.y) : t.lineTo(i.x, i.y)
      ), t.stroke();
    else if (r.type === "rect")
      t.strokeRect(r.x, r.y, r.w, r.h);
    else if (r.type === "arrow") {
      const i = Math.atan2(r.y2 - r.y1, r.x2 - r.x1), n = Math.max(12, this.computeLineWidth() * 4);
      t.beginPath(), t.moveTo(r.x1, r.y1), t.lineTo(r.x2, r.y2), t.lineTo(
        r.x2 - n * Math.cos(i - Math.PI / 6),
        r.y2 - n * Math.sin(i - Math.PI / 6)
      ), t.moveTo(r.x2, r.y2), t.lineTo(
        r.x2 - n * Math.cos(i + Math.PI / 6),
        r.y2 - n * Math.sin(i + Math.PI / 6)
      ), t.stroke();
    } else r.type === "circle" ? (t.beginPath(), t.ellipse(r.x, r.y, Math.abs(r.rx), Math.abs(r.ry), 0, 0, Math.PI * 2), t.stroke()) : r.type === "text" && (t.font = `bold ${this.computeFontSize()}px sans-serif`, t.fillText(r.text, r.x, r.y));
  }
  async save() {
    const t = this.canvas.toDataURL("image/png");
    return t.length > 5 * 1024 * 1024 ? this.canvas.toDataURL("image/jpeg", 0.85) : t;
  }
}
async function zl(e, t, r) {
  const i = {
    type: e.type,
    description: e.description,
    context: e.context,
    screenshots: e.screenshots,
    settings: t,
    ...e.projectId ? { projectId: e.projectId } : {},
    replayEvents: e.replayEvents
  };
  if (t.backendUrl) {
    if (!r.backend) throw new Error("No handler for backend mode");
    return r.backend(i);
  }
  const n = r[t.integration];
  if (!n) throw new Error(`No handler for integration: ${t.integration}`);
  return n(i);
}
const Fl = 50, Ul = 2e3, Bl = 1e3, Wl = 500, Ei = /^(?:token|access_token|refresh_token|api[_-]?key|apikey|key|secret|password|passwd|pwd|auth|authorization|session|sid|jwt|code|otp)$/i;
function Wt(e, t) {
  e.push(t), e.length > Fl && e.shift();
}
function Jn(e, t) {
  return e.length <= t ? e : e.slice(0, t) + "…[truncated]";
}
function Ar(e) {
  let t = String(e || "");
  try {
    const r = new URL(t, typeof location < "u" ? location.href : "http://localhost");
    let i = !1;
    r.searchParams.forEach((n, s) => {
      Ei.test(s) && (r.searchParams.set(s, "REDACTED"), i = !0);
    }), i && (t = r.toString());
  } catch {
    t = t.replace(/([?&])([^=&]+)=([^&]*)/g, (r, i, n, s) => Ei.test(n) ? `${i}${n}=REDACTED` : r);
  }
  return Jn(t, Bl);
}
function jl(e) {
  if (typeof e == "string") return e;
  if (e instanceof Error) return e.message;
  try {
    return Jn(JSON.stringify(e), Wl);
  } catch {
    return String(e);
  }
}
function ql(e, t = {}) {
  const r = {
    pageUrl: window.location.href,
    userAgent: navigator.userAgent,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    consoleErrors: [...e.consoleErrors],
    networkFailures: [...e.networkFailures]
  };
  return t.identity && Object.keys(t.identity).length && (r.identity = t.identity), t.metadata && Object.keys(t.metadata).length && (r.metadata = t.metadata), r;
}
function Hl(e, t = {}) {
  if (typeof window > "u") return e;
  const r = window;
  if (r.__klavityCaptureInstalled) return e;
  r.__klavityCaptureInstalled = !0;
  const i = () => t.isContextValid ? t.isContextValid() : !0, n = (o, d, a) => {
    Wt(e.consoleErrors, { message: Jn(d, Ul), stack: a, timestamp: Date.now(), level: o });
  }, s = window.onerror;
  if (window.onerror = (o, d, a, h, u) => {
    var c;
    if (i()) {
      const m = String(o);
      n("error", m, u == null ? void 0 : u.stack), (c = t.onError) == null || c.call(t, m, u == null ? void 0 : u.stack);
    }
    return typeof s == "function" ? s.call(window, o, d, a, h, u) : !1;
  }, window.addEventListener("unhandledrejection", (o) => {
    var h;
    if (!i()) return;
    const d = o.reason, a = String((d == null ? void 0 : d.message) ?? d);
    n("error", a, d == null ? void 0 : d.stack), (h = t.onError) == null || h.call(t, a, d == null ? void 0 : d.stack);
  }), t.consoleLevels) {
    const o = ["log", "info", "warn", "error"];
    for (const d of o) {
      const a = console[d];
      typeof a == "function" && (console[d] = (...h) => {
        try {
          i() && n(d, h.map(jl).join(" "));
        } catch {
        }
        return a.apply(console, h);
      });
    }
  }
  const l = window.fetch;
  window.fetch = async (...o) => {
    var u;
    if (!i()) return l(...o);
    const d = Date.now(), a = typeof o[0] == "string" ? o[0] : o[0] instanceof URL ? o[0].href : o[0].url, h = (typeof o[0] == "object" && o[0] && "method" in o[0] ? o[0].method : (u = o[1]) == null ? void 0 : u.method) || "GET";
    try {
      const c = await l(...o);
      return Wt(e.networkFailures, { url: Ar(a), status: c.status, method: String(h).toUpperCase(), timestamp: d, durationMs: Date.now() - d }), c;
    } catch (c) {
      throw Wt(e.networkFailures, { url: Ar(a), status: 0, method: String(h).toUpperCase(), timestamp: d, durationMs: Date.now() - d }), c;
    }
  };
  const p = window.XMLHttpRequest;
  if (p && p.prototype) {
    const o = p.prototype.open, d = p.prototype.send;
    p.prototype.open = function(a, h, ...u) {
      return this.__klav = { method: String(a || "GET").toUpperCase(), url: String(h || "") }, o.call(this, a, h, ...u);
    }, p.prototype.send = function(...a) {
      const h = this.__klav;
      if (h && i()) {
        const u = Date.now();
        this.addEventListener("loadend", () => {
          try {
            Wt(e.networkFailures, {
              url: Ar(h.url),
              status: Number(this.status) || 0,
              method: h.method,
              timestamp: u,
              durationMs: Date.now() - u
            });
          } catch {
          }
        });
      }
      return d.apply(this, a);
    };
  }
  return e;
}
const Vl = ["light", "dark", "glass", "neon", "custom", "liquid"], Gl = ["hidden", "icon", "full", "custom"], Yl = ["full", "reportOnly", "off"], Xl = /^#[0-9a-fA-F]{3,8}$/, Jl = /^[\w \-,'"().]+$/, Kl = (e) => typeof e == "object" && e !== null, jt = (e) => typeof e == "string" && Xl.test(e.trim()) ? e.trim() : void 0, Mi = (e, t) => typeof e == "string" && e.trim() ? e.trim().slice(0, t) : void 0, Zl = (e) => {
  if (typeof e != "string") return;
  const t = e.trim().slice(0, 120);
  return t && Jl.test(t) ? t : void 0;
}, Ri = {
  // Default = the marketing home surface: warm cream paper with Klavity-purple and amber atmosphere.
  // The panel is intentionally not stark white; chips/inputs are only a step lighter for affordance.
  light: {
    "--kl-overlay": "var(--ink-overlay, rgba(28,22,40,.30))",
    "--kl-bg": "var(--ink, #f5f3ee)",
    "--kl-fg": "var(--paper, #19140f)",
    "--kl-muted": "var(--paper-dim, #574f45)",
    "--kl-border": "var(--line, rgba(25,20,15,.12))",
    "--kl-chip": "var(--ink-2, #fffdf8)",
    "--kl-input-bg": "var(--ink-2, #fffdf8)",
    "--kl-accent": "var(--accent, #6366f1)",
    "--kl-on-accent": "var(--accent-on, #fff)",
    "--kl-accent2": "var(--accent2, var(--amber, #d98324))",
    "--kl-radius": "16px",
    "--kl-shadow": "0 24px 60px rgba(40,28,70,.18), 0 10px 30px rgba(99,102,241,.10)",
    "--kl-backdrop": "none"
  },
  dark: { "--kl-overlay": "rgba(0,0,0,.5)", "--kl-bg": "#1e1e2e", "--kl-fg": "#cdd6f4", "--kl-muted": "#a6adc8", "--kl-border": "#45475a", "--kl-chip": "#313244", "--kl-input-bg": "#181825", "--kl-accent": "#89b4fa", "--kl-on-accent": "#1e1e2e", "--kl-accent2": "#fab387", "--kl-radius": "12px", "--kl-shadow": "0 20px 60px rgba(0,0,0,.5)", "--kl-backdrop": "none" },
  glass: { "--kl-overlay": "rgba(10,10,18,.25)", "--kl-bg": "rgba(255,255,255,.14)", "--kl-fg": "#fff", "--kl-muted": "rgba(255,255,255,.7)", "--kl-border": "rgba(255,255,255,.28)", "--kl-chip": "rgba(255,255,255,.16)", "--kl-input-bg": "rgba(255,255,255,.10)", "--kl-accent": "rgba(255,255,255,.92)", "--kl-on-accent": "#15121d", "--kl-accent2": "rgba(255,255,255,.55)", "--kl-radius": "22px", "--kl-shadow": "0 24px 70px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.25)", "--kl-backdrop": "blur(22px) saturate(180%)" },
  neon: { "--kl-overlay": "rgba(8,4,20,.55)", "--kl-bg": "#0e0b1e", "--kl-fg": "#f4f0ff", "--kl-muted": "#a99fd6", "--kl-border": "#3a2d6b", "--kl-chip": "#1c1640", "--kl-input-bg": "#140f2c", "--kl-accent": "#ff2d95", "--kl-on-accent": "#fff", "--kl-accent2": "#15e0ff", "--kl-radius": "14px", "--kl-shadow": "0 0 0 1px rgba(255,45,149,.4), 0 24px 70px rgba(255,45,149,.25)", "--kl-backdrop": "none" },
  // 'liquid' on a real page can't do clone-refraction; render as frosted glass.
  liquid: { "--kl-overlay": "rgba(10,10,18,.25)", "--kl-bg": "rgba(255,255,255,.10)", "--kl-fg": "#fff", "--kl-muted": "rgba(255,255,255,.7)", "--kl-border": "rgba(255,255,255,.4)", "--kl-chip": "rgba(255,255,255,.16)", "--kl-input-bg": "rgba(255,255,255,.08)", "--kl-accent": "rgba(255,255,255,.92)", "--kl-on-accent": "#15121d", "--kl-accent2": "rgba(255,255,255,.55)", "--kl-radius": "22px", "--kl-shadow": "0 30px 90px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.5)", "--kl-backdrop": "blur(14px) saturate(170%)" }
};
function Oi(e) {
  let t = e.replace("#", "");
  t.length === 3 && (t = t.split("").map((l) => l + l).join(""));
  const r = parseInt(t.slice(0, 6), 16), i = r >> 16 & 255, n = r >> 8 & 255, s = r & 255;
  return 0.299 * i + 0.587 * n + 0.114 * s;
}
function ko(e) {
  const t = Kl(e) ? e : {}, i = { theme: typeof t.theme == "string" && Vl.includes(t.theme) ? t.theme : "light" }, n = jt(t.primary), s = jt(t.secondary), l = jt(t.background), p = Mi(t.thankYou, 140), o = Zl(t.font);
  n && (i.primary = n), s && (i.secondary = s), l && (i.background = l), o && (i.font = o), p && (i.thankYou = p), typeof t.launcherMode == "string" && Gl.includes(t.launcherMode) && (i.launcherMode = t.launcherMode);
  const d = Mi(t.launcherText, 60);
  d && (i.launcherText = d);
  const a = jt(t.launcherIconColor);
  return a && (i.launcherIconColor = a), typeof t.rightClickMode == "string" && Yl.includes(t.rightClickMode) && (i.rightClickMode = t.rightClickMode), t.maskNumbers === !0 && (i.maskNumbers = !0), i;
}
function Ql(e) {
  const t = ko(e), r = t.theme === "custom" ? { ...Ri.light } : { ...Ri[t.theme] };
  if (t.theme === "custom" && (t.primary && (r["--kl-accent"] = t.primary), t.secondary && (r["--kl-accent2"] = t.secondary), t.background)) {
    r["--kl-bg"] = t.background;
    const n = Oi(t.background) < 140;
    r["--kl-fg"] = n ? "#f4f4f7" : "#1d1d24", r["--kl-muted"] = n ? "rgba(255,255,255,.6)" : "#706560", r["--kl-border"] = n ? "rgba(255,255,255,.16)" : "#e6e6ec", r["--kl-chip"] = n ? "rgba(255,255,255,.08)" : "#f4f4f7", r["--kl-input-bg"] = n ? "rgba(255,255,255,.05)" : "#fafafb";
  }
  return t.font && (r["--kl-font"] = t.font), t.theme === "dark" || t.theme === "neon" || t.theme === "glass" || t.theme === "liquid" || t.theme === "custom" && t.background && Oi(t.background) < 140, r["--kl-img-outline"] = "var(--kl-img-outline-val, color-mix(in srgb, var(--kl-fg) 10%, transparent))", r["--kl-glow"] = "radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--kl-accent) 12%, transparent), transparent 60%), radial-gradient(80% 60% at 100% 110%, color-mix(in srgb, var(--kl-accent2) 6%, transparent), transparent 60%)", `:host{${Object.entries(r).map(([n, s]) => `${n}:${s};`).join("")}}`;
}
const ec = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
function Lr(e) {
  const t = [], r = [], i = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode(l) {
      let p = l.parentElement;
      for (; p && p !== e; ) {
        if (ec.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        p = p.parentElement;
      }
      return /\d/.test(l.textContent ?? "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  }), n = [];
  let s;
  for (; s = i.nextNode(); ) n.push(s);
  for (const l of n) {
    const o = (l.textContent ?? "").split(/(\d+)/);
    if (o.length <= 1) continue;
    const d = l.parentNode, a = l.nextSibling, h = o.map((u, c) => {
      if (c % 2 === 1) {
        const m = document.createElement("span");
        return m.style.cssText = "background:#111;color:transparent;border-radius:2px;", m.textContent = u, m;
      }
      return document.createTextNode(u);
    });
    d.removeChild(l);
    for (const u of h) d.insertBefore(u, a);
    t.push({ parent: d, original: l, replacements: h });
  }
  return e.querySelectorAll("input, select").forEach((l) => {
    const p = l.value;
    /\d/.test(p) && (r.push({ el: l, original: p }), l.value = "█".repeat(p.length));
  }), () => {
    for (const { parent: l, original: p, replacements: o } of t) {
      const d = o[0];
      if ((d == null ? void 0 : d.parentNode) === l) {
        l.insertBefore(p, d);
        for (const a of o) a.parentNode === l && l.removeChild(a);
      }
    }
    for (const { el: l, original: p } of r)
      l.value = p;
  };
}
function tc(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function Ii(e) {
  const t = /^fb_([0-9a-f]{8})[0-9a-f-]+$/i.exec(e);
  return t ? "fb_" + t[1] : e;
}
function Ai(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    return t.protocol === "https:" || t.protocol === "http:" ? t.href : "";
  } catch {
    return "";
  }
}
function rc(e, t, r = {}) {
  var se;
  const i = ko(r);
  let n = !!i.maskNumbers;
  const s = document.createElement("div");
  s.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const l = s.attachShadow({ mode: "open" });
  document.body.appendChild(s);
  let p = [], o = [];
  const d = 5, a = 10 * 1024 * 1024, h = {}, u = () => {
    const R = Object.keys(h);
    if (!R.length) return null;
    const T = {};
    for (const I of R) T[I] = h[I];
    return { ...h[0] ?? h[Number(R[0])] ?? {}, byIndex: T };
  };
  let c = e, m = null;
  const f = document.createElement("style");
  f.textContent = `
    ${Ql(i)}
    @keyframes kl-genie-in{from{opacity:0;transform:translateY(180px) scaleX(.04) scaleY(.06)}to{opacity:1;transform:translateY(0) scaleX(1) scaleY(1)}}
    @keyframes kl-genie-out{from{opacity:1;transform:translateY(0) scaleX(1) scaleY(1)}to{opacity:0;transform:translateY(180px) scaleX(.04) scaleY(.06)}}
    @keyframes kl-ov{from{opacity:0}to{opacity:1}}
    .klavity-overlay{position:fixed;inset:0;background:var(--kl-overlay);display:flex;align-items:center;justify-content:center;pointer-events:all;animation:kl-ov .3s ease both;}
    .klavity-modal{position:relative;overflow-y:auto;max-height:calc(100vh - 40px);isolation:isolate;background:var(--kl-glow,transparent),var(--kl-bg);color:var(--kl-fg);border-radius:var(--kl-radius);padding:24px;width:100%;max-width:480px;box-shadow:0 0 0 1px var(--kl-border),var(--kl-shadow);font-family:var(--kl-font,system-ui,sans-serif);-webkit-font-smoothing:antialiased;-webkit-backdrop-filter:var(--kl-backdrop);backdrop-filter:var(--kl-backdrop);transform-origin:bottom center;animation:kl-genie-in .6s cubic-bezier(.16,1,.3,1) both;}
    .klavity-modal::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:linear-gradient(to right,color-mix(in srgb,var(--kl-border) 58%,transparent) 1px,transparent 1px) 0 0/44px 44px,linear-gradient(to bottom,color-mix(in srgb,var(--kl-border) 58%,transparent) 1px,transparent 1px) 0 0/44px 44px;opacity:.36;}
    .klavity-modal>*{position:relative;z-index:1;}
    /* Staggered content reveal — the genie scales the panel in while its rows softly rise + fade so it feels
       alive (not a flat box). Subtle; zeroed under prefers-reduced-motion below. */
    @keyframes kl-rise{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
    .klavity-modal>.klavity-toggle,.klavity-modal>.klavity-page,.klavity-modal>.klavity-strip,.klavity-modal>.klavity-actions,.klavity-modal>textarea.klavity-desc,.klavity-modal>input.klavity-remail,.klavity-modal>.klavity-submit{animation:kl-rise .5s cubic-bezier(.16,1,.3,1) both;}
    .klavity-modal>.klavity-toggle{animation-delay:.05s}.klavity-modal>.klavity-page{animation-delay:.09s}.klavity-modal>.klavity-strip{animation-delay:.12s}.klavity-modal>.klavity-actions{animation-delay:.15s}.klavity-modal>textarea.klavity-desc{animation-delay:.18s}.klavity-modal>input.klavity-remail{animation-delay:.21s}.klavity-modal>.klavity-submit{animation-delay:.23s}
    .klavity-modal.kl-closing{animation:kl-genie-out .5s cubic-bezier(.55,0,.85,.25) both;}
    .klavity-toggle{display:flex;gap:8px;margin-bottom:16px;padding-right:34px;}
    .klavity-toggle button{flex:1;min-height:40px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 12px;border-radius:8px;border:none;cursor:pointer;font-size:14px;font-weight:600;background:var(--kl-chip);color:var(--kl-fg);line-height:1;}
    .klavity-toggle .bug.active{background:var(--kl-accent);color:var(--kl-on-accent);}
    .klavity-toggle .feat.active{background:var(--kl-accent);color:var(--kl-on-accent);}
    .klavity-page{font-size:12px;color:var(--kl-muted);margin-bottom:12px;}
    /* overflow-x:auto forces overflow-y to auto (not visible) per CSS spec — adding vertical padding gives
       the absolutely-positioned rm/mk badge ::after hit-area extensions room so they're not clipped. */
    .klavity-strip{display:flex;gap:8px;overflow-x:auto;padding:6px 4px 16px;margin-bottom:6px;min-height:64px;align-items:flex-start;}
    .klavity-thumb{position:relative;flex-shrink:0;}
    .klavity-thumb img{height:72px;width:104px;object-fit:cover;object-position:top center;background:var(--kl-chip);display:block;border-radius:8px;outline:1px solid var(--kl-img-outline);outline-offset:-1px;cursor:pointer;transition:filter .12s;}
    .klavity-thumb img:hover{filter:brightness(.85);}
    /* Portrait (tall) screenshots: widen the thumbnail vertically so more page content is visible. */
    .klavity-thumb.kl-tall img{width:68px;height:110px;}
    /* Remove badge: dark semi-transparent circle — universally visible on all themes/backgrounds. */
    .klavity-rm{position:absolute;top:4px;right:4px;z-index:2;background:rgba(0,0,0,.65);color:#fff;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.35);}
    .klavity-mk{position:absolute;bottom:4px;right:4px;z-index:2;background:var(--kl-accent);color:var(--kl-on-accent);border:none;border-radius:50%;width:22px;height:22px;font-size:13px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.35);}
    /* Extend the 22px badges to a ≥40px hit area without enlarging the visible button. The top (X) and
       bottom (pencil) pseudo-areas don't overlap each other; the pencil shares the image's markup action. */
    .klavity-rm::after,.klavity-mk::after{content:"";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;}
    .klavity-actions{display:flex;gap:8px;margin-bottom:12px;}
    .klavity-actions button{flex:1;min-height:40px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px;background:var(--kl-chip);color:var(--kl-fg);border:none;border-radius:8px;cursor:pointer;font-size:12px;line-height:1;}
    .klavity-actions .kl-cap-ic,.klavity-toggle .kl-cap-ic{display:inline-flex;align-items:center;justify-content:center;flex:none;transition:transform .2s cubic-bezier(.34,1.56,.64,1);line-height:1;}
    .klavity-actions .kl-cap-ic svg,.klavity-toggle .kl-cap-ic svg{display:block;width:15px;height:15px;vertical-align:middle;margin:0;}
    .klavity-actions button:hover .kl-cap-ic,.klavity-toggle button:hover .kl-cap-ic,.klavity-actions button:focus-visible .kl-cap-ic,.klavity-toggle button:focus-visible .kl-cap-ic{transform:scale(1.14) rotate(-6deg);}
    .klavity-actions button:active .kl-cap-ic,.klavity-toggle button:active .kl-cap-ic{transform:scale(1.04);}
    /* Re-entrancy state: while a capture/submit is in flight every capture button is disabled (dimmed, no
       hover/press), and the one doing the work pulses to read as "working". */
    .klavity-actions button:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none;}
    .klavity-actions button:disabled .kl-cap-ic{transform:none;}
    .klavity-actions button.kl-loading{opacity:.9;animation:kl-cap-pulse 1s ease-in-out infinite;}
    @keyframes kl-cap-pulse{0%,100%{opacity:.55}50%{opacity:.95}}
    .klav-mask-row{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--kl-muted);cursor:pointer;margin-bottom:10px;user-select:none;}
    .klav-mask-row input[type=checkbox]{accent-color:var(--kl-accent);width:13px;height:13px;cursor:pointer;}
    .klav-mask-row:hover{color:var(--kl-fg);}
    .klavity-counter{font-size:11px;color:var(--kl-muted);margin-bottom:8px;font-variant-numeric:tabular-nums;}
    textarea.klavity-desc{width:100%;min-height:100px;resize:vertical;background:var(--kl-input-bg);color:var(--kl-fg);border:1px solid var(--kl-border);border-radius:8px;padding:10px;font-size:14px;margin-bottom:16px;box-sizing:border-box;box-shadow:0 1px 2px rgba(25,20,15,.04);}
    input.klavity-remail{width:100%;background:var(--kl-input-bg);color:var(--kl-fg);border:1px solid var(--kl-border);border-radius:8px;padding:10px;font-size:14px;margin-bottom:10px;box-sizing:border-box;box-shadow:0 1px 2px rgba(25,20,15,.04);}
    .klavity-submit{width:100%;min-height:40px;padding:12px;background:var(--kl-accent);color:var(--kl-on-accent);border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;}
    .klavity-submit:disabled{opacity:.5;cursor:not-allowed;}
    /* Upload progress under Submit — collapsed until a submit is in flight; the fill is animated toward 90%
       over ~10s and snapped to 100% when the request resolves (fetch can't report real upload %). */
    .klavity-progress{height:5px;border-radius:999px;background:var(--kl-chip);overflow:hidden;opacity:0;max-height:0;margin-top:0;transition:opacity .2s ease,max-height .2s ease,margin-top .2s ease;}
    .klavity-progress.show{opacity:1;max-height:5px;margin-top:10px;}
    .klavity-progress-fill{height:100%;width:0;border-radius:999px;background:linear-gradient(90deg,color-mix(in srgb,var(--kl-accent) 65%,#fff),var(--kl-accent));}
    .klavity-toast-progress{position:absolute;top:0;left:0;height:3px;background:var(--kl-accent);width:100%;transform-origin:left;animation:kl-toast-decay 5s linear forwards;z-index:10;}
    @keyframes kl-toast-decay{from{transform:scaleX(1)}to{transform:scaleX(0)}}
    .klavity-error{color:#f38ba8;font-size:13px;margin-bottom:8px;display:none;}
    .klavity-success h2{margin:0 0 10px;font-size:24px;font-family:var(--kl-font-display, var(--display, 'Fraunces', serif));font-weight:480;color:var(--kl-fg);display:flex;align-items:center;gap:8px;line-height:1.2;letter-spacing:-.01em;}
    .klavity-success p{margin:0 0 20px;font-size:14.5px;color:var(--kl-muted);line-height:1.5;}
    .klavity-success>h2{animation:kl-rise .45s cubic-bezier(.16,1,.3,1) .05s both;}.klavity-success>p{animation:kl-rise .45s cubic-bezier(.16,1,.3,1) .12s both;}.klavity-lead,.klavity-thanks{animation:kl-rise .45s cubic-bezier(.16,1,.3,1) .18s both;}.klavity-success>.klavity-cta{animation:kl-rise .45s cubic-bezier(.16,1,.3,1) .24s both;}
    .klavity-lead{display:flex;gap:10px;margin-bottom:16px;}
    .klavity-lead input{flex:1;background:var(--kl-input-bg);color:var(--kl-fg);border:1px solid var(--kl-border);border-radius:99px;padding:9px 16px;font-size:14px;box-sizing:border-box;}
    .klavity-lead input:focus{outline:none;border-color:var(--kl-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--kl-accent) 20%,transparent);}
    .klavity-lead button{position:relative;overflow:hidden;min-height:40px;padding:9px 18px;background:var(--kl-accent);color:var(--kl-on-accent);border:none;border-radius:99px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;box-shadow:0 2px 8px color-mix(in srgb,var(--kl-accent) 30%,transparent);}
    .klavity-lead button::after, .klavity-cta::after{content:"";position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);transform:translateX(-100%);transition:transform .6s ease;}
    .klavity-lead button:hover::after, .klavity-cta:hover::after{transform:translateX(100%);}
    .klavity-lead button:disabled{opacity:.5;cursor:not-allowed;}
    .klavity-thanks{font-size:13px;color:var(--kl-fg);margin-bottom:12px;}
    .klavity-ref{margin:0 0 18px;font-size:13px;color:var(--kl-muted);display:flex;align-items:center;gap:8px;flex-wrap:wrap;animation:kl-rise .45s cubic-bezier(.16,1,.3,1) .15s both;}
    .klavity-ref code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;background:var(--kl-chip);color:var(--kl-fg);padding:2px 8px;border-radius:6px;user-select:all;}
    .klavity-ref a{color:var(--kl-accent);font-weight:600;text-decoration:underline;text-underline-offset:2px;transition:color .15s ease,transform .15s cubic-bezier(.2,.7,.2,1);display:inline-block;}
    .klavity-ref a:hover{transform:var(--kl-lift);}
    .klavity-ref a:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;border-radius:4px;}
    .klavity-cta{position:relative;overflow:hidden;display:inline-block;padding:12px 20px;background:linear-gradient(135deg,var(--kl-accent),color-mix(in srgb,var(--kl-accent) 70%,#8b5cf6));color:var(--kl-on-accent);border-radius:99px;font-size:14px;font-weight:700;text-decoration:none;margin-bottom:12px;text-align:center;box-shadow:0 4px 14px color-mix(in srgb,var(--kl-accent) 35%,transparent);}
    .klavity-pb{text-align:center;font-size:10px;color:var(--kl-muted);margin-top:12px;}
    .klavity-pb a{color:var(--kl-muted);text-decoration:none;transition:color .15s ease;}
    .klavity-pb a:hover{color:var(--kl-accent);}
    /* ── Button micro-interactions — subtle hover lift/scale + press, Klavity-accent on hover, focus
       rings. Same feel as the right-click menu + dashboard buttons. Transform amounts are CSS vars so
       prefers-reduced-motion can zero them (below). color-mix degrades gracefully if unsupported. ── */
    .klavity-modal{--kl-lift:translateY(-1px) scale(1.02);--kl-press:scale(.97);--kl-bhover:scale(1.05);--kl-bpress:scale(.97);}
    .klavity-toggle button,.klavity-actions button,.klavity-submit,.klavity-lead button,.klavity-cta,textarea.klavity-desc,input.klavity-remail,.klavity-lead input{transition:transform .15s cubic-bezier(.2,.7,.2,1),background .15s ease,border-color .15s ease,box-shadow .15s ease,color .15s ease,filter .15s ease;will-change:transform;}
    .klavity-rm,.klavity-mk{transition:transform .15s cubic-bezier(.2,.7,.2,1),background .15s ease,color .15s ease,box-shadow .15s ease;will-change:transform;}
    textarea.klavity-desc:hover,input.klavity-remail:hover,.klavity-lead input:hover{transform:var(--kl-lift);border-color:var(--kl-accent);box-shadow:0 7px 18px color-mix(in srgb,var(--kl-accent) 16%,transparent),0 0 0 1px color-mix(in srgb,var(--kl-accent) 14%,transparent);}
    textarea.klavity-desc:focus,input.klavity-remail:focus,.klavity-lead input:focus{outline:none;border-color:var(--kl-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--kl-accent) 20%,transparent),0 8px 20px color-mix(in srgb,var(--kl-accent) 14%,transparent);}
    /* Bug/Feature toggle — lift + soft accent glow (keeps the active chip's highlight intact) */
    .klavity-toggle button:hover{transform:var(--kl-lift);box-shadow:0 4px 12px color-mix(in srgb,var(--kl-accent) 20%,transparent);}
    .klavity-toggle button:active{transform:var(--kl-press);}
    /* Full Page / Upload / Region — lift + accent tint + accent text */
    .klavity-actions button:hover{transform:var(--kl-lift);color:var(--kl-accent);background:color-mix(in srgb,var(--kl-chip) 80%,var(--kl-accent) 20%);box-shadow:0 5px 14px color-mix(in srgb,var(--kl-accent) 22%,transparent);}
    .klavity-actions button:active{transform:var(--kl-press);}
    /* Submit + lead submit + CTA (accent buttons) — lift + brighten + accent-tinted glow */
    .klavity-submit:hover:not(:disabled),.klavity-lead button:hover:not(:disabled),.klavity-cta:hover{transform:var(--kl-lift);filter:brightness(1.05);background:linear-gradient(135deg,var(--kl-accent),color-mix(in srgb,var(--kl-accent) 70%,#8b5cf6));box-shadow:0 8px 22px color-mix(in srgb,var(--kl-accent) 45%,transparent);}
    .klavity-submit:active:not(:disabled),.klavity-lead button:active:not(:disabled),.klavity-cta:active{transform:var(--kl-press);}
    /* Thumbnail action badges (X remove, pencil edit) — pop on hover, press in */
    .klavity-rm:hover{transform:var(--kl-bhover);color:var(--kl-accent);background:color-mix(in srgb,var(--kl-chip) 82%,var(--kl-accent) 18%);box-shadow:0 3px 9px rgba(0,0,0,.22);}
    .klavity-mk:hover{transform:var(--kl-bhover);background:color-mix(in srgb,var(--kl-accent) 85%,#fff);box-shadow:0 3px 9px color-mix(in srgb,var(--kl-accent) 30%,transparent);}
    .klavity-rm:active,.klavity-mk:active{transform:var(--kl-bpress);}
    .klavity-rm svg,.klavity-mk svg{transition:transform .2s ease;will-change:transform;}
    .klavity-rm:hover svg{transform:rotate(90deg);}
    .klavity-mk:hover svg{transform:rotate(15deg) scale(1.1);}
    /* Close (×) — top-right corner; same lift+accent / press / focus feel as the rest. 30px visible button
       with a ::after pseudo extending the hit area to ≥40×40 (sits in the reserved toggle padding, so it
       never overlaps the Bug/Feature buttons). */
    .klavity-x{position:absolute;top:14px;right:14px;z-index:3;width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;padding:0;background:transparent;color:var(--kl-muted);border:none;border-radius:9px;cursor:pointer;transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease,color .15s ease;will-change:transform;}
    .klavity-x svg{display:block;transition:transform .25s ease;will-change:transform;}
    .klavity-x:hover svg{transform:rotate(90deg) scale(1.12);}
    .klavity-x::after{content:"";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;}
    .klavity-x:hover{transform:var(--kl-lift);color:var(--kl-accent);background:color-mix(in srgb,var(--kl-accent) 14%,transparent);}
    .klavity-x:active{transform:var(--kl-press);}
    /* Keyboard accessibility — visible focus ring on every control */
    .klavity-toggle button:focus-visible,.klavity-actions button:focus-visible,.klavity-submit:focus-visible,.klavity-lead button:focus-visible,.klavity-cta:focus-visible,.klavity-rm:focus-visible,.klavity-mk:focus-visible,.klavity-x:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    /* ── Screen button: the (i) badge is a purely visual affordance nested inside the button.
       Hovering the entire Screen button shows the floating tooltip (KLA-15/KLA-26/KLA-31). ── */
    #klavity-sharp{flex:1.4;}
    /* Faded (i) circle inside the Screen button — lights up on button hover to signal "info here". */
    .kl-info-badge{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;flex:none;opacity:0.4;transition:opacity .15s ease;}
    .klavity-actions button:hover .kl-info-badge,.klavity-actions button:focus-visible .kl-info-badge{opacity:0.85;}
    /* .klavity-info-pop is kept in markup for its text; visibility is JS-driven via .kl-float-tip so
       the tooltip is rendered outside the overflow:hidden modal and is never clipped. */
    .klavity-info-pop{display:none;}
    /* Floating tooltip — appended to the shadow root (sibling of overlay), position:fixed to viewport so
       overflow:hidden on .klavity-modal cannot clip it. JS positions it with full viewport edge-detection. */
    .kl-float-tip{position:fixed;width:228px;max-width:calc(100vw - 16px);padding:10px 12px;border-radius:10px;background:var(--kl-bg);color:var(--kl-fg);box-shadow:0 0 0 1px var(--kl-border),0 12px 30px rgba(20,16,40,.22);font-size:12px;line-height:1.45;text-align:left;text-wrap:pretty;z-index:2147483647;pointer-events:none;visibility:hidden;opacity:0;transition:opacity .15s ease,visibility .15s step-end;}
    .kl-float-tip.kl-show{visibility:visible;opacity:1;transition:opacity .15s ease;}
    .kl-float-tip b{color:var(--kl-fg);font-weight:600;}
    /* ── Capture-source active/selected indicator (KLA-21) ──────────────────────────────────────
       .kl-active is applied to whichever capture button the user most recently used successfully.
       Uses the same accent palette and transition system as the rest of the modal so it reads as
       "native" — no custom keyframes; the existing press→release spring on transform is enough.
       A small CSS checkmark (rotated L-shape border) appears at the top-right corner as a clear
       "selected" badge without adding any DOM weight. ── */
    .klavity-actions button.kl-active{
      position:relative;
      color:var(--kl-accent);
      background:color-mix(in srgb,var(--kl-accent) 12%,var(--kl-chip));
      box-shadow:0 0 0 1.5px var(--kl-accent),0 4px 14px color-mix(in srgb,var(--kl-accent) 18%,transparent);
    }
    .klavity-actions button.kl-active .kl-cap-ic,.klavity-toggle button.active .kl-cap-ic{color:var(--kl-accent);transform:scale(1.08) rotate(3deg);}
    .klavity-actions button.kl-active::after{
      content:"";position:absolute;top:-4px;right:-4px;
      width:14px;height:14px;border-radius:50%;
      background:var(--kl-accent);
      box-shadow:0 1px 3px rgba(0,0,0,.25);
      z-index:2;
    }
    .klavity-actions button.kl-active::before{
      content:"";position:absolute;top:-4px;right:-4px;
      width:14px;height:14px;
      background-color:var(--kl-on-accent);
      -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='4.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E") no-repeat center/8px;
      mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='4.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E") no-repeat center/8px;
      z-index:3;
    }
    @media (max-width:430px){.klavity-lead{flex-direction:column}.klavity-lead button{width:100%;}}
    @media (prefers-reduced-motion: reduce){.klavity-overlay,.klavity-modal,.klavity-modal.kl-closing,.klavity-modal>*, .klavity-toast-progress{animation-duration:.01ms!important;}.klavity-modal{--kl-lift:none;--kl-press:none;--kl-bhover:none;--kl-bpress:none;}.klavity-info,.klavity-rm,.klavity-mk{transition:none!important;}.klavity-actions button.kl-loading{animation:none;}.klavity-actions .kl-cap-ic,.klavity-toggle .kl-cap-ic{transition:none;transform:none!important;}}
  `, l.appendChild(f);
  const g = document.createElement("div");
  g.className = "klavity-overlay";
  const x = document.createElement("div");
  x.className = "klavity-modal", x.innerHTML = `
    <button class="klavity-x" id="klavity-x" type="button" aria-label="Close" title="Close (Esc)">${ae("x", { size: 16 })}</button>
    <div class="klavity-toggle">
      <button class="bug ${e === "bug" ? "active" : ""}"><span class="kl-cap-ic">${ae("bug")}</span>Bug</button>
      <button class="feat ${e === "feature" ? "active" : ""}"><span class="kl-cap-ic">${ae("lightbulb")}</span>Feature</button>
    </div>
    <div class="klavity-page">${ae("map-pin")} ${typeof window < "u" ? tc(window.location.pathname) : ""}</div>
    <div class="klavity-strip" id="klavity-strip"></div>
    <div class="klavity-actions">
      ${t.onCaptureSharp ? `<button id="klavity-sharp" aria-describedby="klavity-sharp-tip"><span class="kl-cap-ic">${ae("app-window")}</span><span class="kl-sharp-label">Screen</span><span class="kl-info-badge" aria-hidden="true"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span><span id="klavity-sharp-tip" class="klavity-info-pop" role="tooltip">Screen grabs the <b>whole page — every image, pixel-perfect</b> using your browser's screen-share. Your browser will ask you to <b>share this tab</b>.</span></button>` : ""}
      <button id="klavity-full" title="Full Page — instant capture; may miss some cross-origin images"><span class="kl-cap-ic">${ae("camera")}</span><span class="kl-full-label">Full Page</span></button>
      <button id="klavity-upload"><span class="kl-cap-ic">${ae("image")}</span><span class="kl-upload-label">Upload</span></button>
      ${t.onRegionCapture ? `<button id="klavity-region"><span class="kl-cap-ic">${ae("scissors")}</span><span class="kl-region-label">Region</span></button>` : ""}
    </div>
    <label class="klav-mask-row"><input type="checkbox" id="klavity-mask-numbers"${n ? " checked" : ""}>${ae("eye-off", { size: 13 })}<span>Mask numbers</span></label>
    <input type="file" id="klavity-file" accept="image/*,.heic,.heif" multiple style="display:none">
    <div class="klavity-counter" id="klavity-counter">0/5 images</div>
    <div class="klavity-error" id="klavity-err"></div>
    <textarea class="klavity-desc" id="klavity-desc" placeholder="Describe the bug..."></textarea>
    ${t.requireEmail ? '<input type="email" class="klavity-remail" id="klavity-remail" placeholder="your@email.com" autocomplete="email">' : ""}
    <button class="klavity-submit" id="klavity-submit" disabled>Submit</button>
    <div class="klavity-progress" id="klavity-progress" role="progressbar" aria-label="Uploading report"><div class="klavity-progress-fill" id="klavity-progress-fill"></div></div>
  `, g.appendChild(x), l.appendChild(g);
  const y = l.getElementById("klavity-mask-numbers");
  y && y.addEventListener("change", () => {
    n = y.checked;
  });
  const v = l.getElementById("klavity-sharp"), S = l.querySelector(".klavity-info-pop");
  if (v && S) {
    const R = document.createElement("div");
    R.className = "kl-float-tip", R.setAttribute("role", "tooltip"), R.innerHTML = S.innerHTML, l.appendChild(R);
    const T = () => {
      const I = v.getBoundingClientRect(), H = Math.min(228, window.innerWidth - 16), G = 8, Y = window.innerWidth, te = window.innerHeight, pe = I.left + I.width / 2 - H / 2, D = Math.max(G, Math.min(pe, Y - H - G));
      R.style.left = D + "px", R.style.top = "-9999px", R.style.visibility = "hidden", R.style.display = "block";
      const Z = R.offsetHeight;
      R.style.display = "", R.style.visibility = "";
      let X = I.bottom + 8;
      X + Z + G > te && (X = I.top - Z - 8), X = Math.max(G, Math.min(X, te - Z - G)), R.style.top = X + "px", R.classList.add("kl-show");
    }, N = () => R.classList.remove("kl-show");
    v.addEventListener("mouseenter", T), v.addEventListener("mouseleave", N), v.addEventListener("focus", T), v.addEventListener("blur", N);
  }
  const w = {
    shadowRoot: l,
    addScreenshot: A,
    close: P
  };
  function b() {
    const R = l.getElementById("klavity-strip"), T = l.getElementById("klavity-counter");
    R.innerHTML = "", p.forEach((N, I) => {
      const H = document.createElement("div");
      H.className = "klavity-thumb";
      const G = document.createElement("img");
      G.src = N, G.title = "Click to mark up", G.addEventListener("load", () => {
        G.naturalHeight > G.naturalWidth * 1.4 && H.classList.add("kl-tall");
      }, { once: !0 }), G.addEventListener("click", () => Te(I));
      const Y = document.createElement("button");
      Y.className = "klavity-rm", Y.innerHTML = ae("x", { size: 13 }), Y.title = "Remove", Y.addEventListener("click", (pe) => {
        pe.stopPropagation(), p.splice(I, 1), o.splice(I, 1), delete h[I];
        for (const D of Object.keys(h).map(Number).filter((Z) => Z > I).sort((Z, X) => Z - X))
          h[D - 1] = h[D], delete h[D];
        p.length === 0 && ce(null), b();
      });
      const te = document.createElement("button");
      te.className = "klavity-mk", te.innerHTML = ae("pencil", { size: 13 }), te.title = "Mark up", te.addEventListener("click", (pe) => {
        pe.stopPropagation(), Te(I);
      }), H.append(G, Y, te), R.appendChild(H);
    }), T.textContent = `${p.length}/5 images`;
  }
  function k(R) {
    const T = l.getElementById("klavity-err");
    T && (T.textContent = R, T.style.display = "block");
  }
  function E() {
    const R = l.getElementById("klavity-err");
    R && (R.style.display = "none");
  }
  function A(R) {
    if (p.length >= d) {
      k(`You can attach up to ${d} images.`);
      return;
    }
    E(), p.push(R), o.push(t.compressImage ? t.compressImage(R) : Promise.resolve(R)), b();
  }
  function M(R) {
    return R.type.startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(R.name);
  }
  async function _(R) {
    E();
    for (const T of R) {
      if (p.length >= d) {
        k(`You can attach up to ${d} images.`);
        break;
      }
      if (!M(T)) {
        k(`"${T.name}" isn't an image — only image files can be attached.`);
        continue;
      }
      if (T.size > a) {
        k(`"${T.name}" is too large — images must be under ${Math.round(a / 1024 / 1024)} MB.`);
        continue;
      }
      try {
        A(await ic(T));
      } catch {
        k(`Couldn't add "${T.name}". Please try a different image.`);
      }
    }
  }
  function P() {
    var N;
    m && (clearTimeout(m), m = null), document.removeEventListener("keydown", C, { capture: !0 }), document.removeEventListener("paste", we);
    try {
      (N = t.onClose) == null || N.call(t);
    } catch {
    }
    const R = l.querySelector(".klavity-modal");
    if (!R) {
      s.remove();
      return;
    }
    R.classList.add("kl-closing");
    const T = () => s.remove();
    R.addEventListener("animationend", T, { once: !0 }), setTimeout(T, 700);
  }
  function C(R) {
    R.key === "Escape" && (R.stopPropagation(), P());
  }
  document.addEventListener("keydown", C, { capture: !0 });
  const we = (R) => {
    if (!R.clipboardData) return;
    const T = Array.from(R.clipboardData.items).filter((N) => N.type.startsWith("image/")).map((N) => N.getAsFile()).filter((N) => !!N);
    T.length && _(T);
  };
  document.addEventListener("paste", we);
  const he = x.querySelector(".bug"), j = x.querySelector(".feat");
  he.addEventListener("click", () => {
    c = "bug", he.classList.add("active"), j.classList.remove("active");
  }), j.addEventListener("click", () => {
    c = "feature", j.classList.add("active"), he.classList.remove("active");
  });
  const B = x.querySelector("#klavity-desc"), K = x.querySelector("#klavity-submit"), ee = x.querySelector("#klavity-remail"), ie = () => !t.requireEmail || !!ee && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ee.value.trim()), q = () => {
    K.disabled = B.value.trim() === "" || !ie();
  };
  B.addEventListener("input", q), ee == null || ee.addEventListener("input", q), g.addEventListener("click", (R) => {
    R.target === g && P();
  }), (se = x.querySelector("#klavity-x")) == null || se.addEventListener("click", () => P());
  const Ie = () => Array.from(x.querySelectorAll(".klavity-actions button"));
  let O = !1;
  const le = (R) => {
    O = R, Ie().forEach((T) => {
      T.disabled = R;
    }), R ? K.disabled = !0 : q();
  }, ce = (R) => {
    Ie().forEach((T) => {
      T.classList.remove("kl-active"), T.removeAttribute("aria-pressed");
    }), R && (R.classList.add("kl-active"), R.setAttribute("aria-pressed", "true"));
  };
  K.addEventListener("click", async () => {
    if (O || K.disabled) return;
    const R = B.value.trim();
    le(!0), K.textContent = "Uploading…";
    const T = l.getElementById("klavity-err");
    T.style.display = "none";
    const N = l.getElementById("klavity-progress"), I = l.getElementById("klavity-progress-fill");
    N && I && (N.classList.add("show"), I.style.transition = "none", I.style.width = "8%", I.offsetWidth, I.style.transition = "width 10s cubic-bezier(.05,.7,.2,1)", requestAnimationFrame(() => {
      I.style.width = "90%";
    }));
    const H = () => {
      I && (I.style.transition = "width .25s ease", I.style.width = "100%");
    }, G = () => {
      N && I && (N.classList.remove("show"), I.style.transition = "none", I.style.width = "0");
    };
    try {
      const Y = await Promise.all(o), te = await t.onSubmit({ type: c, description: R, screenshots: Y, annotations: u(), reporterEmail: (ee == null ? void 0 : ee.value.trim()) || void 0 });
      if (H(), t.success)
        $(te.issueKey, te.issueUrl, t.success);
      else {
        const pe = document.createElement("div");
        pe.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:all;";
        const D = document.createElement("div");
        D.style.cssText = "background:var(--kl-bg);color:var(--kl-fg);border:1px solid var(--kl-border);border-radius:var(--kl-radius);padding:32px;font-family:var(--kl-font,system-ui),sans-serif;font-size:16px;text-align:center;box-shadow:var(--kl-shadow);";
        let Z = "";
        if (i.thankYou)
          D.textContent = i.thankYou;
        else if (D.innerHTML = `${ae("check-circle", { label: "Filed", size: 20 })} Filed as `, D.appendChild(document.createTextNode(Ii(te.issueKey))), Z = Ai(te.issueUrl), Z) {
          const X = document.createElement("a");
          X.href = Z, X.target = "_blank", X.rel = "noopener", X.textContent = "View in dashboard", X.style.cssText = "display:block;margin-top:12px;font-size:14px;font-weight:600;color:var(--kl-accent);text-decoration:underline;text-underline-offset:2px;", D.appendChild(X);
        }
        pe.appendChild(D), g.remove(), l.appendChild(pe), setTimeout(P, i.thankYou ? 2600 : Z ? 4e3 : 1500);
      }
    } catch (Y) {
      G(), T.textContent = Y.message, T.style.display = "block", K.textContent = "Submit", le(!1);
    }
  });
  const Ae = x.querySelector("#klavity-full");
  if (Ae.addEventListener("click", async () => {
    if (!O) {
      le(!0), Ae.classList.add("kl-loading");
      try {
        const R = n ? Lr(document.body) : null;
        try {
          A(await t.onCaptureFull()), ce(Ae);
        } finally {
          R == null || R();
        }
      } catch {
      } finally {
        Ae.classList.remove("kl-loading"), le(!1);
      }
    }
  }), v && t.onCaptureSharp) {
    const R = v.querySelector(".kl-sharp-label"), T = async () => {
      if (O) return;
      le(!0), v.classList.add("kl-loading"), s.style.display = "none";
      const N = R ?? v, I = N.textContent;
      N.textContent = "Capturing…";
      try {
        const H = n ? Lr(document.body) : null;
        let G;
        try {
          G = await t.onCaptureSharp();
        } finally {
          H == null || H();
        }
        G && (A(G), ce(v));
      } catch {
      } finally {
        s.style.display = "", N.textContent = I, v.classList.remove("kl-loading"), le(!1);
      }
    };
    v.addEventListener("click", () => {
      T();
    });
  }
  const de = x.querySelector("#klavity-file"), xe = x.querySelector("#klavity-upload");
  xe.addEventListener("click", () => {
    if (O || p.length >= d) {
      p.length >= d && k(`You can attach up to ${d} images.`);
      return;
    }
    de.click();
  }), de.addEventListener("change", async (R) => {
    const T = R.target, N = T.files ? Array.from(T.files) : [];
    if (T.value = "", N.length) {
      const I = p.length;
      await _(N), p.length > I && ce(xe);
    }
  });
  const Le = l.getElementById("klavity-region");
  Le && t.onRegionCapture && (Le.onclick = () => {
    O || (le(!0), document.removeEventListener("keydown", C, { capture: !0 }), s.style.display = "none", nc(async (R) => {
      document.addEventListener("keydown", C, { capture: !0 });
      try {
        const T = n ? Lr(document.body) : null;
        let N;
        try {
          N = await t.onRegionCapture(R);
        } finally {
          T == null || T();
        }
        N && (A(N), ce(Le));
      } finally {
        s.style.display = "", le(!1);
      }
    }, () => {
      document.addEventListener("keydown", C, { capture: !0 }), s.style.display = "", le(!1);
    }));
  });
  function Te(R) {
    const T = p[R], N = new Image();
    N.onload = () => {
      const I = document.createElement("canvas");
      I.width = N.naturalWidth, I.height = N.naturalHeight;
      const H = new Dl(I, T);
      H.redraw();
      const G = document.createElement("div");
      G.style.cssText = "position:fixed;inset:0;background:#000;z-index:2147483647;display:flex;flex-direction:column;pointer-events:all;";
      const Y = document.createElement("div");
      Y.className = "kl-edtb", Y.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px;background:#1e1e2e;flex-wrap:wrap;", Y.innerHTML = `
        <button data-tool="pen" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${ae("pencil", { size: 14 })} Pen</button>
        <button data-tool="rect" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${ae("square", { size: 14 })} Rect</button>
        <button data-tool="arrow" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">↗ Arrow</button>
        <button data-tool="text" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">T Text</button>
        <button data-color="#ef4444" style="background:#ef4444;width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;"></button>
        <button data-color="#f97316" style="background:#f97316;width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;"></button>
        <button data-color="#3b82f6" style="background:#3b82f6;width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;"></button>
        <button data-color="#111827" style="background:#111827;width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;border:1px solid #555;"></button>
        <span style="display:inline-flex;align-items:center;gap:4px;margin-left:6px;">
          <button id="klavity-zoom-out" class="kl-zb" title="Zoom out" aria-label="Zoom out">−</button>
          <span id="klavity-zoom-pct" style="min-width:46px;text-align:center;color:#a6adc8;font-size:12px;font-variant-numeric:tabular-nums;">100%</span>
          <button id="klavity-zoom-in" class="kl-zb" title="Zoom in" aria-label="Zoom in">+</button>
          <button id="klavity-fit-width" class="kl-zb" title="Fit to width (best for tall pages)" style="font-size:11.5px;">Fit&nbsp;W</button>
          <button id="klavity-fit-page" class="kl-zb" title="Fit the whole page" style="font-size:11.5px;">Fit&nbsp;page</button>
        </span>
        <button id="klavity-undo" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;margin-left:auto;">↩ Undo</button>
        <button id="klavity-clear-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${ae("trash-2", { size: 14 })} Clear</button>
        <button id="klavity-save-ann" style="padding:6px 10px;background:#89b4fa;color:#1e1e2e;border:none;border-radius:4px;cursor:pointer;font-weight:700;">${ae("check", { label: "Save", size: 14 })} Save</button>
        <button id="klavity-cancel-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${ae("x", { size: 14 })}</button>
      `, I.style.cssText = "cursor:crosshair;display:block;margin:12px auto;touch-action:none;background:#fff;border-radius:4px;outline:1px solid rgba(255,255,255,.12);outline-offset:-1px;box-shadow:0 12px 44px rgba(0,0,0,.55);";
      const te = document.createElement("div");
      te.style.cssText = "flex:1;min-height:0;overflow:auto;display:block;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);", te.appendChild(I);
      const pe = document.createElement("style");
      pe.textContent = ".kl-edtb button{transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease;will-change:transform;}.kl-edtb button:hover{transform:translateY(-1px) scale(1.02);background:#45475a;}.kl-edtb button[data-color]:hover{transform:scale(1.14);background:initial;}.kl-edtb button:active{transform:scale(.96);}.kl-edtb button:focus-visible{outline:2px solid #89b4fa;outline-offset:2px;}.kl-edtb .kl-zb{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 9px;background:#313244;color:#cdd6f4;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;line-height:1;}.kl-edtb .kl-zb:hover{background:#45475a;}@media (prefers-reduced-motion:reduce){.kl-edtb button{transition:none;}.kl-edtb button:hover,.kl-edtb button:active,.kl-edtb button[data-color]:hover{transform:none;}}", G.append(pe, Y, te), l.appendChild(G);
      let D = 1;
      const Z = (z) => Math.max(0.05, Math.min(5, z || 1));
      function X(z) {
        D = Z(z), I.style.width = Math.round(I.width * D) + "px", I.style.height = Math.round(I.height * D) + "px";
        const J = Y.querySelector("#klavity-zoom-pct");
        J && (J.textContent = Math.round(D * 100) + "%");
      }
      const Pe = () => Math.max(1, te.clientWidth - 24) / I.width, fe = () => Math.min(Math.max(1, te.clientWidth - 24) / I.width, Math.max(1, te.clientHeight - 24) / I.height), Ve = I.height / I.width > Math.max(1, te.clientHeight) / Math.max(1, te.clientWidth);
      X(Ve ? Pe() : fe()), Y.querySelector("#klavity-zoom-in").addEventListener("click", () => X(D * 1.25)), Y.querySelector("#klavity-zoom-out").addEventListener("click", () => X(D / 1.25)), Y.querySelector("#klavity-fit-width").addEventListener("click", () => X(Pe())), Y.querySelector("#klavity-fit-page").addEventListener("click", () => X(fe()));
      let Ne = "rect", Ge = "#ef4444", Ot = !1, Ut = [], Qe = 0, et = 0;
      function Mr(z) {
        Ne = z, Y.querySelectorAll("[data-tool]").forEach((J) => {
          const me = J.dataset.tool === z;
          J.style.background = me ? "#585b70" : "#313244", J.style.outline = me ? "2px solid #89b4fa" : "none";
        });
      }
      Y.querySelectorAll("[data-tool]").forEach((z) => z.addEventListener("click", () => Mr(z.dataset.tool))), Y.querySelectorAll("[data-color]").forEach((z) => z.addEventListener("click", () => {
        Ge = z.dataset.color;
      })), Y.querySelector("#klavity-undo").addEventListener("click", () => H.undo()), Y.querySelector("#klavity-clear-ann").addEventListener("click", () => H.clearAll());
      const gi = { p: "pen", r: "rect", c: "circle", a: "arrow", t: "text" };
      function yi(z) {
        const J = z.target;
        if (J && (J.tagName === "INPUT" || J.tagName === "TEXTAREA" || J.isContentEditable)) return;
        if (z.key === "Escape") {
          z.stopPropagation(), Rr();
          return;
        }
        if ((z.metaKey || z.ctrlKey) && z.key.toLowerCase() === "z") {
          z.preventDefault(), H.undo();
          return;
        }
        if (z.metaKey || z.ctrlKey || z.altKey) return;
        const me = z.key.toLowerCase();
        gi[me] ? (z.preventDefault(), Mr(gi[me])) : me === "u" && (z.preventDefault(), H.undo());
      }
      function Rr() {
        document.removeEventListener("keydown", yi, { capture: !0 }), G.remove();
      }
      document.addEventListener("keydown", yi, { capture: !0 }), Mr(Ne), Y.querySelector("#klavity-save-ann").addEventListener("click", async () => {
        H.shapes.length ? (h[R] = { w: I.width, h: I.height, shapes: H.shapes.map((z) => ({ ...z })) }, p[R] = T) : delete h[R], Rr(), b();
      }), Y.querySelector("#klavity-cancel-ann").addEventListener("click", () => Rr());
      function Or(z) {
        const J = I.getBoundingClientRect();
        return { x: (z.clientX - J.left) / J.width * I.width, y: (z.clientY - J.top) / J.height * I.height };
      }
      I.addEventListener("pointerdown", (z) => {
        Ot = !0;
        const J = Or(z);
        if ({ x: Qe, y: et } = J, Ne === "pen" && (Ut = [J]), Ne === "text") {
          Ot = !1;
          const me = document.createElement("input");
          me.style.cssText = `position:fixed;left:${z.clientX}px;top:${z.clientY}px;background:transparent;border:1px dashed ${Ge};color:${Ge};font-size:16px;outline:none;z-index:9999999;min-width:80px;`, document.body.appendChild(me), me.focus(), me.addEventListener("blur", () => {
            me.value.trim() && H.addShape({ type: "text", color: Ge, x: Qe, y: et, text: me.value.trim() }), me.remove();
          }, { once: !0 }), me.addEventListener("keydown", (Fa) => {
            Fa.key === "Enter" && me.blur();
          });
        }
      }), I.addEventListener("pointermove", (z) => {
        Ot && Ne === "pen" && Ut.push(Or(z));
      }), I.addEventListener("pointerup", (z) => {
        if (!Ot) return;
        Ot = !1;
        const J = Or(z);
        Ne === "pen" && Ut.length > 1 ? H.addShape({ type: "pen", color: Ge, points: Ut }) : Ne === "rect" ? H.addShape({ type: "rect", color: Ge, x: Math.min(Qe, J.x), y: Math.min(et, J.y), w: Math.abs(J.x - Qe), h: Math.abs(J.y - et) }) : Ne === "circle" ? H.addShape({ type: "circle", color: Ge, x: (Qe + J.x) / 2, y: (et + J.y) / 2, rx: Math.abs(J.x - Qe) / 2, ry: Math.abs(J.y - et) / 2 }) : Ne === "arrow" && H.addShape({ type: "arrow", color: Ge, x1: Qe, y1: et, x2: J.x, y2: J.y });
      });
    }, N.src = T;
  }
  function $(R, T, N) {
    const { copy: I, onLead: H } = N;
    x.innerHTML = "";
    const G = document.createElement("div");
    G.className = "klavity-success";
    const Y = document.createElement("h2");
    if (Y.innerHTML = I.headline, G.appendChild(Y), I.body) {
      const D = document.createElement("p");
      D.textContent = I.body, G.appendChild(D);
    }
    if (R) {
      const D = document.createElement("div");
      D.className = "klavity-ref";
      const Z = document.createElement("span");
      Z.textContent = "Filed as";
      const X = document.createElement("code");
      X.textContent = Ii(R), D.append(Z, X);
      const Pe = Ai(T);
      if (Pe) {
        const fe = document.createElement("a");
        fe.href = Pe, fe.target = "_blank", fe.rel = "noopener", fe.textContent = "View in dashboard", D.appendChild(fe);
      }
      G.appendChild(D);
    }
    const te = () => {
      if (m) return;
      const D = document.createElement("div");
      D.className = "klavity-toast-progress", x.appendChild(D);
      let Z = 5e3, X = Date.now();
      const Pe = () => {
        X = Date.now(), m = setTimeout(() => {
          P();
        }, Z);
      }, fe = () => {
        m && (clearTimeout(m), m = null, Z = Math.max(0, Z - (Date.now() - X)), D.style.animationPlayState = "paused");
      }, Ve = () => {
        m || x.classList.contains("kl-closing") || (D.style.animationPlayState = "running", Pe());
      };
      x.addEventListener("mouseenter", fe), x.addEventListener("mouseleave", Ve), x.addEventListener("focusin", fe), x.addEventListener("focusout", (Ne) => {
        x.contains(Ne.relatedTarget) || Ve();
      }), Pe();
    };
    if (I.showEmail) {
      const D = document.createElement("div");
      D.className = "klavity-lead";
      const Z = document.createElement("input");
      Z.type = "email", Z.placeholder = "you@company.com";
      const X = document.createElement("button");
      X.textContent = I.emailLabel;
      const Pe = async () => {
        const fe = Z.value.trim();
        if (!fe) return;
        X.disabled = !0;
        try {
          H && await H(R, fe);
        } catch {
        }
        const Ve = document.createElement("div");
        Ve.className = "klavity-thanks", Ve.textContent = "Thanks — we'll be in touch.", D.replaceWith(Ve), I.showCta || te();
      };
      X.addEventListener("click", Pe), Z.addEventListener("keydown", (fe) => {
        fe.key === "Enter" && Pe();
      }), D.append(Z, X), G.appendChild(D);
    }
    if (I.showCta && I.ctaUrl) {
      const D = document.createElement("a");
      D.className = "klavity-cta", D.href = I.ctaUrl, D.target = "_blank", D.rel = "noopener", D.textContent = I.ctaText, G.appendChild(D);
    }
    x.appendChild(G);
    const pe = document.createElement("div");
    pe.className = "klavity-pb", pe.innerHTML = 'Powered by <a href="https://klavity.in" target="_blank" rel="noopener">Klavity</a>', x.appendChild(pe), !I.showEmail && !I.showCta && te();
  }
  return t.autoCaptureOnOpen && setTimeout(() => {
    t.onCaptureFull().then((R) => {
      A(R), ce(Ae);
    }).catch(() => {
    });
  }, 200), w;
}
function nc(e, t) {
  const r = document.createElement("div");
  r.style.cssText = "position:fixed;inset:0;cursor:crosshair;z-index:2147483646;user-select:none;", r.setAttribute("data-klavity-region-overlay", ""), document.body.appendChild(r);
  const i = document.createElement("div");
  i.textContent = "Drag to select an area · Esc to cancel", i.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-family:system-ui;font-size:14px;background:rgba(0,0,0,.7);padding:8px 16px;border-radius:6px;pointer-events:none;z-index:2147483647;", document.body.appendChild(i);
  let n = 0, s = 0, l = !1;
  function p() {
    document.removeEventListener("keydown", o, { capture: !0 }), r.remove(), i.remove();
  }
  function o(d) {
    d.key === "Escape" && (d.stopPropagation(), p(), t());
  }
  document.addEventListener("keydown", o, { capture: !0 }), r.addEventListener("pointerdown", (d) => {
    l = !0, n = d.clientX, s = d.clientY, i.remove();
  }), r.addEventListener("pointermove", (d) => {
    if (!l) return;
    const a = Math.min(d.clientX, n), h = Math.min(d.clientY, s), u = Math.abs(d.clientX - n), c = Math.abs(d.clientY - s);
    r.style.background = `
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) 0 0/${a}px 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${a + u}px 0/calc(100% - ${a + u}px) 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${a}px 0/${u}px ${h}px,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${a}px ${h + c}px/${u}px calc(100% - ${h + c}px)
    `, r.style.backgroundRepeat = "no-repeat";
  }), r.addEventListener("pointerup", (d) => {
    if (!l) return;
    l = !1;
    const a = Math.abs(d.clientX - n), h = Math.abs(d.clientY - s);
    if (a < 8 || h < 8) {
      p(), t();
      return;
    }
    const u = { x: Math.min(d.clientX, n), y: Math.min(d.clientY, s), w: a, h };
    p(), e(u);
  });
}
async function ic(e) {
  if (e.type === "image/heic" || e.type === "image/heif" || e.name.endsWith(".heic") || e.name.endsWith(".heif"))
    try {
      const t = (await import("./heic2any-D6xzzX7R.js").then((i) => i.h)).default, r = await t({ blob: e, toType: "image/jpeg", quality: 0.85 });
      return Li(r);
    } catch {
    }
  return Li(e);
}
function Li(e) {
  return new Promise((t, r) => {
    const i = new FileReader();
    i.onload = () => t(i.result), i.onerror = r, i.readAsDataURL(e);
  });
}
const sc = {
  frustrated: { accent: "#e8849a", mark: "vein", label: "Frustrated" },
  confused: { accent: "#e8a24a", mark: "q", label: "Confused" },
  satisfied: { accent: "#7fd1c4", mark: "check", label: "Satisfied" },
  delighted: { accent: "#9fd6a0", mark: "spark", label: "Delighted" },
  neutral: { accent: "#8a8276", mark: "dots", label: "Neutral" },
  inspired: { accent: "#8b8bf5", mark: "bulb", label: "Inspired" },
  alarmed: { accent: "#ef6b6b", mark: "bang", label: "Alarmed" }
};
function oc(e) {
  const t = (e || "").trim().split(/\s+/).filter(Boolean);
  return t.length === 0 ? "?" : t.length === 1 ? t[0].slice(0, 2).toUpperCase() : (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
function ac(e) {
  switch (e) {
    case "vein":
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M11 3 L8 6 M11 3 L14 6 M21 11 L18 8 M21 11 L18 14 M13 21 L16 18 M13 21 L10 18 M3 13 L6 16 M3 13 L6 10"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>';
    case "spark":
      return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7Z"/><path d="M5.5 13c.3 1.9 1.3 2.9 3.2 3.2-1.9.3-2.9 1.3-3.2 3.2-.3-1.9-1.3-2.9-3.2-3.2 1.9-.3 2.9-1.3 3.2-3.2Z" opacity=".85"/></svg>';
    case "bulb":
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17.5h6M9.5 20.5h5"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3Z"/><path d="M10 9.5c.4-1 1-1.5 2-1.5" opacity=".7"/></svg>';
    case "check":
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4 10-11"/></svg>';
    case "dots":
      return '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2.3"/><circle cx="12" cy="12" r="2.3"/><circle cx="19" cy="12" r="2.3"/></svg>';
    case "bang":
      return '<span class="ksim-glyph">!</span>';
    case "q":
      return '<span class="ksim-glyph">?</span>';
  }
}
const lc = {
  vein: "ksim-m-vein",
  spark: "ksim-m-spark",
  bulb: "ksim-m-bulb",
  bang: "ksim-m-bang",
  q: "ksim-m-q",
  dots: "ksim-m-dots",
  check: "ksim-m-check"
};
function tt(e) {
  return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function cc(e) {
  const {
    name: t,
    photoUrl: r,
    color: i = "#6f6cf2",
    emotion: n = "none",
    size: s = 58,
    eyes: l = !0,
    legs: p = !0,
    animate: o = !0,
    className: d = ""
  } = e, a = tt(e.initials || oc(t)), h = n !== "none" ? sc[n] : null, u = h ? `<span class="ksim-mark ${o ? lc[h.mark] : ""}" style="color:${tt(h.accent)}">${ac(h.mark)}</span>` : "", m = r ? `<span class="ksim-head ksim-photo"><img src="${tt(r)}" alt="${tt(t)}" loading="lazy" onerror="this.style.display='none';this.parentNode.classList.add('ksim-fallback')"><span class="ksim-ini">${a}</span></span>` : `<span class="ksim-head ksim-mono"><span class="ksim-ini">${a}</span>${l ? '<span class="ksim-eyes"><i></i><i></i></span>' : ""}</span>`, f = p ? '<span class="ksim-legs"><i></i><i></i></span>' : "", g = ["ksim", o ? "is-animated" : "", d].filter(Boolean).join(" "), x = `--ksim-persona:${tt(i)};--ksim-size:${s}px;` + (h ? `--ksim-accent:${tt(h.accent)};` : "");
  return `<span class="${g}" style="${x}" data-emotion="${n}" title="${tt(t)}">${u}${m}${f}</span>`;
}
function uc(e) {
  const t = document.createElement("template");
  return t.innerHTML = cc(e).trim(), t.content.firstElementChild;
}
const dc = `
/* The Sim is a single rigid unit: head + legs must always move together.
   isolation:isolate + transform-style:flat rasterize head and legs into ONE
   compositing layer so the z-indexed head can never split onto its own GPU
   layer and visually detach from the legs when an ancestor is transformed
   (bob), focused (glow), or walked (left/top clone). */
.ksim{--ksim-size:58px;position:relative;display:inline-flex;flex-direction:column;align-items:center;line-height:1;vertical-align:bottom;
  isolation:isolate;transform-style:flat;backface-visibility:hidden}
.ksim.is-animated{animation:ksim-bob 3.1s ease-in-out infinite;will-change:transform}
@keyframes ksim-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
/* z-index:2 keeps the head above the legs WITHIN the .ksim isolation context;
   because .ksim isolates, this no longer promotes the head to its own layer. */
.ksim-head{position:relative;width:var(--ksim-size);height:var(--ksim-size);border-radius:50%;display:grid;place-items:center;
  box-shadow:0 8px 22px -6px rgba(0,0,0,.7);z-index:2}
.ksim-mono{background:radial-gradient(120% 120% at 30% 22%,color-mix(in srgb,var(--ksim-persona) 72%,#fff 14%),var(--ksim-persona) 58%,color-mix(in srgb,var(--ksim-persona) 55%,#000 38%));
  box-shadow:0 8px 22px -6px rgba(0,0,0,.7),inset 0 2px 4px rgba(255,255,255,.25),inset 0 -6px 12px rgba(0,0,0,.28)}
.ksim-ini{font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:700;color:#fff;letter-spacing:.02em;
  font-size:calc(var(--ksim-size)*.31);text-shadow:0 1px 2px rgba(0,0,0,.35)}
/* photo identity — thin persona ring, monogram fallback */
.ksim-photo{background:var(--ksim-persona);box-shadow:0 8px 22px -6px rgba(0,0,0,.7),0 0 0 2px var(--ksim-persona)}
.ksim-photo img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block}
.ksim-photo .ksim-ini{position:absolute;inset:0;display:none;place-items:center;border-radius:50%;
  background:radial-gradient(120% 120% at 30% 22%,color-mix(in srgb,var(--ksim-persona) 72%,#fff 12%),var(--ksim-persona) 60%)}
.ksim-photo.ksim-fallback .ksim-ini{display:grid}
/* character eyes (monogram) */
.ksim-eyes{position:absolute;bottom:calc(var(--ksim-size)*.16);left:50%;transform:translateX(-50%);display:flex;gap:calc(var(--ksim-size)*.1);z-index:3}
.ksim-eyes i{width:calc(var(--ksim-size)*.086);height:calc(var(--ksim-size)*.086);border-radius:50%;background:rgba(12,10,8,.8)}
.ksim-mono:has(.ksim-eyes) .ksim-ini{transform:translateY(calc(var(--ksim-size)*-.1));font-size:calc(var(--ksim-size)*.26)}
/* legs */
.ksim-legs{display:flex;gap:calc(var(--ksim-size)*.12);margin-top:calc(var(--ksim-size)*.07)}
.ksim-legs i{width:calc(var(--ksim-size)*.12);height:calc(var(--ksim-size)*.29);border-radius:calc(var(--ksim-size)*.07);
  background:color-mix(in srgb,var(--ksim-persona) 60%,#000 30%);transform-origin:top center}
.ksim.is-animated .ksim-legs i:nth-child(1){animation:ksim-la 1.6s ease-in-out infinite}
.ksim.is-animated .ksim-legs i:nth-child(2){animation:ksim-lb 1.6s ease-in-out infinite}
@keyframes ksim-la{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(7deg)}}
@keyframes ksim-lb{0%,100%{transform:rotate(6deg)}50%{transform:rotate(-7deg)}}
/* floating emotion mark */
.ksim-mark{position:absolute;top:calc(var(--ksim-size)*-.2);right:calc(var(--ksim-size)*-.2);
  width:calc(var(--ksim-size)*.45);height:calc(var(--ksim-size)*.45);color:var(--ksim-accent);z-index:5;
  display:grid;place-items:center;filter:drop-shadow(0 2px 5px rgba(0,0,0,.55));transform-origin:center}
.ksim-mark svg{width:100%;height:100%;display:block}
.ksim-glyph{font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:700;font-size:calc(var(--ksim-size)*.36);color:var(--ksim-accent)}
.ksim-m-vein{animation:ksim-vein 1.1s ease-in-out infinite}@keyframes ksim-vein{0%,100%{transform:scale(1) rotate(0)}45%{transform:scale(1.22) rotate(-6deg)}}
.ksim-m-spark{animation:ksim-tw 1.5s ease-in-out infinite}@keyframes ksim-tw{0%,100%{transform:scale(1) rotate(0);opacity:1}50%{transform:scale(1.18) rotate(18deg);opacity:.7}}
.ksim-m-bulb{animation:ksim-bulb 1.7s ease-in-out infinite}@keyframes ksim-bulb{0%,100%{filter:drop-shadow(0 0 0 transparent) drop-shadow(0 2px 5px rgba(0,0,0,.55))}50%{filter:drop-shadow(0 0 9px var(--ksim-accent)) drop-shadow(0 2px 5px rgba(0,0,0,.55))}}
.ksim-m-bang{animation:ksim-bang 1.2s ease-in-out infinite}@keyframes ksim-bang{0%,100%{transform:translateX(0) rotate(0)}25%{transform:translateX(-2px) rotate(-7deg)}75%{transform:translateX(2px) rotate(7deg)}}
.ksim-m-q{animation:ksim-q 2.2s ease-in-out infinite}@keyframes ksim-q{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(10deg)}}
.ksim-m-dots{animation:ksim-dots 2s linear infinite}@keyframes ksim-dots{0%,100%{opacity:.45}50%{opacity:1}}
.ksim-m-check{animation:ksim-check 2.4s ease-in-out infinite}@keyframes ksim-check{0%,100%{transform:scale(1)}50%{transform:scale(1.14)}}
@media (prefers-reduced-motion: reduce){.ksim,.ksim *{animation:none !important}}
`;
function hc(e = document) {
  var i;
  const t = e.head ?? e ?? null;
  if (!t || (i = t.querySelector) != null && i.call(t, "style[data-ksim]")) return;
  const r = document.createElement("style");
  r.setAttribute("data-ksim", ""), r.textContent = dc, t.appendChild(r);
}
function pc(e) {
  const { context: t, description: r } = e, i = t.consoleErrors.map((o) => `- [${o.level ?? "error"}] \`${o.message}\``).join(`
`) || "_none_", n = t.networkFailures.map((o) => `- ${o.method} ${o.url} → ${o.status}${o.durationMs != null ? ` (${o.durationMs}ms)` : ""}`).join(`
`) || "_none_", s = [
    `*Page:* ${t.pageUrl}`,
    `*Browser:* ${t.userAgent}`,
    `*Screen:* ${t.screenSize}  |  *Viewport:* ${t.viewportSize}`
  ], l = t.identity ? Object.entries(t.identity).filter(([, o]) => o != null) : [], p = t.metadata ? Object.entries(t.metadata) : [];
  return (l.length || p.length) && s.push(`*User / metadata:* ${[...l, ...p].map(([o, d]) => `${o}=${d}`).join(", ")}`), [
    ...s,
    "",
    "----",
    r,
    "",
    "*Console:*",
    i,
    "",
    "*Network:*",
    n
  ].join(`
`);
}
async function fc(e) {
  const { settings: t, type: r, description: i } = e, { baseUrl: n, email: s, token: l, projectKey: p } = t.jira, o = btoa(`${s}:${l}`), d = r === "bug" ? "Bug" : "Story", a = r === "bug" ? ["klavity", "klavity-bug"] : ["klavity", "klavity-feature"], h = `[Klavity] ${i.slice(0, 180)}`, u = await fetch(`${n}/rest/api/3/issue`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${o}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      fields: {
        project: { key: p },
        summary: h,
        description: { version: 1, type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: pc(e) }] }] },
        issuetype: { name: d },
        labels: a
      }
    })
  });
  if (!u.ok) {
    const g = await u.text();
    throw new Error(`Jira API error ${u.status}: ${g}`);
  }
  const m = (await u.json()).key, f = `${n}/browse/${m}`;
  for (const g of e.screenshots) {
    const x = await (await fetch(g)).blob(), y = new FormData();
    y.append("file", x, `klavity-screenshot-${Date.now()}.png`), await fetch(`${n}/rest/api/3/issue/${m}/attachments`, {
      method: "POST",
      headers: { Authorization: `Basic ${o}`, "X-Atlassian-Token": "no-check" },
      body: y
    });
  }
  return { issueKey: m, issueUrl: f };
}
async function mc(e) {
  var h, u, c;
  const { settings: t, type: r, description: i, context: n } = e, { apiKey: s, teamId: l } = t.linear, p = [
    i,
    "",
    `**Page:** ${n.pageUrl}`,
    `**Browser:** ${n.userAgent}`
  ].join(`
`), d = await (await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      Authorization: s,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: `
        mutation IssueCreate($input: IssueCreateInput!) {
          issueCreate(input: $input) {
            success
            issue { id identifier url }
          }
        }
      `,
      variables: {
        input: {
          teamId: l,
          title: `[Klavity] ${i.slice(0, 180)}`,
          description: p,
          labelNames: r === "bug" ? ["Bug"] : []
        }
      }
    })
  })).json();
  if ((h = d.errors) != null && h.length)
    throw new Error(`Linear API error: ${d.errors[0].message}`);
  const a = (c = (u = d.data) == null ? void 0 : u.issueCreate) == null ? void 0 : c.issue;
  if (!a) throw new Error("Linear: no issue returned");
  return { issueKey: a.identifier, issueUrl: a.url };
}
async function gc(e) {
  const { settings: t, type: r, description: i, context: n, screenshots: s } = e, { token: l, repo: p } = t.github, o = r === "bug" ? ["klavity", "klavity-bug"] : ["klavity", "klavity-feature"], d = s.length ? `

<details><summary>Screenshots (${s.length})</summary>

${s.map((c, m) => `![screenshot-${m + 1}](${c})`).join(`
`)}

</details>` : "", a = [
    i,
    "",
    `**Page:** ${n.pageUrl}`,
    `**Browser:** ${n.userAgent}`,
    `**Screen:** ${n.screenSize} | **Viewport:** ${n.viewportSize}`,
    d
  ].join(`
`), h = await fetch(`https://api.github.com/repos/${p}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${l}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: `[Klavity] ${i.slice(0, 180)}`,
      body: a,
      labels: o
    })
  });
  if (!h.ok)
    throw new Error(`GitHub API error ${h.status}: ${await h.text()}`);
  const u = await h.json();
  return { issueKey: `#${u.number}`, issueUrl: u.html_url };
}
async function yc(e) {
  const { settings: t, description: r, context: i } = e, { token: n, workspace: s, projectId: l } = t.plane, p = (t.plane.host || "https://api.plane.so").replace(/\/+$/, ""), o = p === "https://api.plane.so" ? "https://app.plane.so" : p, d = await fetch(
    `${p}/api/v1/workspaces/${s}/projects/${l}/issues/`,
    {
      method: "POST",
      headers: { "X-API-Key": n, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `[Klavity] ${r.slice(0, 180)}`,
        description_html: `<p>${r}</p><p><strong>Page:</strong> ${i.pageUrl}</p>`
      })
    }
  );
  if (!d.ok) throw new Error(`Plane API error ${d.status}: ${await d.text()}`);
  const a = await d.json();
  return {
    issueKey: String(a.sequence_id),
    issueUrl: `${o}/${s}/projects/${l}/issues/`
  };
}
function bc(e) {
  const t = new FormData();
  return t.set("type", e.type ?? "bug"), t.set("description", e.description), t.set("page_url", e.pageUrl), e.context && t.set("context", JSON.stringify(e.context)), e.projectId && t.set("project_id", e.projectId), e.replayEvents && e.replayEvents.length && t.set("replay_events", JSON.stringify(e.replayEvents)), t;
}
async function vc(e) {
  const { settings: t, type: r, description: i, context: n, screenshots: s, projectId: l, replayEvents: p } = e, o = bc({ type: r, description: i, pageUrl: n.pageUrl, context: n, projectId: l, replayEvents: p }), d = t.connectionMode === "klavity" && !!t.klavToken;
  if (!d) {
    const { plane: c } = t;
    o.append("plane_token", c.token), o.append("plane_workspace", c.workspace), o.append("plane_project_id", c.projectId), o.append("plane_host", c.host);
  }
  for (let c = 0; c < s.length; c++) {
    const m = await (await fetch(s[c])).blob();
    o.append("screenshots", m, `screenshot-${c}.png`);
  }
  const a = d ? { Authorization: `Bearer ${t.klavToken}` } : {}, h = await fetch(`${t.backendUrl}/api/feedback`, { method: "POST", headers: a, body: o });
  if (!h.ok) throw new Error(`Klavity backend error ${h.status}: ${await h.text()}`);
  const u = await h.json();
  return {
    issueKey: u.jira_key ?? u.id,
    issueUrl: u.issue_url ?? t.backendUrl
  };
}
var wc = Object.defineProperty, xc = (e, t, r) => t in e ? wc(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, L = (e, t, r) => xc(e, typeof t != "symbol" ? t + "" : t, r), Ti, kc = Object.defineProperty, Sc = (e, t, r) => t in e ? kc(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, Pi = (e, t, r) => Sc(e, typeof t != "symbol" ? t + "" : t, r), ue = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(ue || {});
const Ni = {
  Node: [
    "childNodes",
    "parentNode",
    "parentElement",
    "textContent",
    "ownerDocument"
  ],
  ShadowRoot: ["host", "styleSheets"],
  Element: ["shadowRoot", "querySelector", "querySelectorAll"],
  MutationObserver: []
}, _i = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, qt = {}, So = {}, Cc = () => !!globalThis.Zone;
function Kn(e) {
  if (qt[e])
    return qt[e];
  const t = globalThis[e], r = t.prototype, i = e in Ni ? Ni[e] : void 0, n = !!(i && // @ts-expect-error 2345
  i.every(
    (p) => {
      var o, d;
      return !!((d = (o = Object.getOwnPropertyDescriptor(r, p)) == null ? void 0 : o.get) != null && d.toString().includes("[native code]"));
    }
  )), s = e in _i ? _i[e] : void 0, l = !!(s && s.every(
    // @ts-expect-error 2345
    (p) => {
      var o;
      return typeof r[p] == "function" && ((o = r[p]) == null ? void 0 : o.toString().includes("[native code]"));
    }
  ));
  if (n && l && !Cc())
    return qt[e] = t.prototype, t.prototype;
  try {
    const p = document.createElement("iframe");
    p.style.display = "none", document.body.appendChild(p);
    const o = p.contentWindow;
    if (!o) return t.prototype;
    const d = o[e].prototype;
    if (!d)
      return p.remove(), r;
    const a = navigator.userAgent;
    return a.includes("Safari") && !a.includes("Chrome") ? (p.classList.add("rr-block"), p.setAttribute("__rrwebUntaintedMutationObserver", ""), So[e] = () => p.remove()) : p.remove(), qt[e] = d;
  } catch {
    return r;
  }
}
const Tr = {};
function qe(e, t, r) {
  var i;
  const n = `${e}.${String(r)}`;
  if (Tr[n])
    return Tr[n].call(
      t
    );
  const s = Kn(e), l = (i = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : i.get;
  return l ? (Tr[n] = l, l.call(t)) : t[r];
}
const Pr = {};
function Co(e, t, r) {
  const i = `${e}.${String(r)}`;
  if (Pr[i])
    return Pr[i].bind(
      t
    );
  const s = Kn(e)[r];
  return typeof s != "function" ? t[r] : (Pr[i] = s, s.bind(t));
}
function Ec(e) {
  return qe("Node", e, "ownerDocument");
}
function Mc(e) {
  return qe("Node", e, "childNodes");
}
function Rc(e) {
  return qe("Node", e, "parentNode");
}
function Oc(e) {
  return qe("Node", e, "parentElement");
}
function Ic(e) {
  return qe("Node", e, "textContent");
}
function Ac(e, t) {
  return Co("Node", e, "contains")(t);
}
function Lc(e) {
  return Co("Node", e, "getRootNode")();
}
function Tc(e) {
  return !e || !("host" in e) ? null : qe("ShadowRoot", e, "host");
}
function Pc(e) {
  return e.styleSheets;
}
function Nc(e) {
  return !e || !("shadowRoot" in e) ? null : qe("Element", e, "shadowRoot");
}
function _c(e, t) {
  return qe("Element", e, "querySelector")(t);
}
function $c(e, t) {
  return qe("Element", e, "querySelectorAll")(t);
}
function Dc() {
  return [
    Kn("MutationObserver").constructor,
    So.MutationObserver ?? (() => {
    })
  ];
}
let Eo = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (Eo = () => (/* @__PURE__ */ new Date()).getTime());
function zc(e, t, r) {
  try {
    if (!(t in e))
      return () => {
      };
    const i = e[t], n = r(i);
    return typeof n == "function" && (n.prototype = n.prototype || {}, Object.defineProperties(n, {
      __rrweb_original__: {
        enumerable: !1,
        value: i
      }
    })), e[t] = n, () => {
      e[t] = i;
    };
  } catch {
    return () => {
    };
  }
}
const ge = {
  ownerDocument: Ec,
  childNodes: Mc,
  parentNode: Rc,
  parentElement: Oc,
  textContent: Ic,
  contains: Ac,
  getRootNode: Lc,
  host: Tc,
  styleSheets: Pc,
  shadowRoot: Nc,
  querySelector: _c,
  querySelectorAll: $c,
  nowTimestamp: Eo,
  mutationObserverCtor: Dc,
  patch: zc
};
function Mo(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function At(e) {
  const t = (
    // anchor and textarea elements also have a `host` property
    // but only shadow roots have a `mode` property
    e && "host" in e && "mode" in e && ge.host(e) || null
  );
  return !!(t && "shadowRoot" in t && ge.shadowRoot(t) === e);
}
function Lt(e) {
  return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function Fc(e) {
  return e.includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(
    /\sbackground-clip:\s*text;/g,
    " -webkit-background-clip: text; background-clip: text;"
  )), e;
}
function Uc(e) {
  const { cssText: t } = e;
  if (t.split('"').length < 3) return t;
  const r = ["@import", `url(${JSON.stringify(e.href)})`];
  return e.layerName === "" ? r.push("layer") : e.layerName && r.push(`layer(${e.layerName})`), e.supportsText && r.push(`supports(${e.supportsText})`), e.media.length && r.push(e.media.mediaText), r.join(" ") + ";";
}
function Bn(e) {
  try {
    const t = e.rules || e.cssRules;
    if (!t)
      return null;
    let r = e.href;
    !r && e.ownerNode && (r = e.ownerNode.baseURI);
    const i = Array.from(
      t,
      (n) => Ro(n, r)
    ).join("");
    return Fc(i);
  } catch {
    return null;
  }
}
function Ro(e, t) {
  if (Wc(e)) {
    let r;
    try {
      r = // for same-origin stylesheets,
      // we can access the imported stylesheet rules directly
      Bn(e.styleSheet) || // work around browser issues with the raw string `@import url(...)` statement
      Uc(e);
    } catch {
      r = e.cssText;
    }
    return e.styleSheet.href ? ar(r, e.styleSheet.href) : r;
  } else {
    let r = e.cssText;
    return jc(e) && e.selectorText.includes(":") && (r = Bc(r)), t ? ar(r, t) : r;
  }
}
function Bc(e) {
  const t = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return e.replace(t, "$1\\$2");
}
function Wc(e) {
  return "styleSheet" in e;
}
function jc(e) {
  return "selectorText" in e;
}
class Oo {
  constructor() {
    Pi(this, "idNodeMap", /* @__PURE__ */ new Map()), Pi(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
  }
  getId(t) {
    var r;
    return t ? ((r = this.getMeta(t)) == null ? void 0 : r.id) ?? -1 : -1;
  }
  getNode(t) {
    return this.idNodeMap.get(t) || null;
  }
  getIds() {
    return Array.from(this.idNodeMap.keys());
  }
  getMeta(t) {
    return this.nodeMetaMap.get(t) || null;
  }
  // removes the node from idNodeMap
  // doesn't remove the node from nodeMetaMap
  removeNodeFromMap(t) {
    const r = this.getId(t);
    this.idNodeMap.delete(r), t.childNodes && t.childNodes.forEach(
      (i) => this.removeNodeFromMap(i)
    );
  }
  has(t) {
    return this.idNodeMap.has(t);
  }
  hasNode(t) {
    return this.nodeMetaMap.has(t);
  }
  add(t, r) {
    const i = r.id;
    this.idNodeMap.set(i, t), this.nodeMetaMap.set(t, r);
  }
  replace(t, r) {
    const i = this.getNode(t);
    if (i) {
      const n = this.nodeMetaMap.get(i);
      n && this.nodeMetaMap.set(r, n);
    }
    this.idNodeMap.set(t, r);
  }
  reset() {
    this.idNodeMap = /* @__PURE__ */ new Map(), this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }
}
function qc() {
  return new Oo();
}
function sr({
  element: e,
  maskInputOptions: t,
  tagName: r,
  type: i,
  value: n,
  maskInputFn: s
}) {
  let l = n || "";
  const p = i && at(i);
  return (t[r.toLowerCase()] || p && t[p]) && (s ? l = s(l, e) : l = "*".repeat(l.length)), l;
}
function at(e) {
  return e.toLowerCase();
}
const $i = "__rrweb_original__";
function Hc(e) {
  const t = e.getContext("2d");
  if (!t) return !0;
  const r = 50;
  for (let i = 0; i < e.width; i += r)
    for (let n = 0; n < e.height; n += r) {
      const s = t.getImageData, l = $i in s ? s[$i] : s;
      if (new Uint32Array(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        l.call(
          t,
          i,
          n,
          Math.min(r, e.width - i),
          Math.min(r, e.height - n)
        ).data.buffer
      ).some((o) => o !== 0)) return !1;
    }
  return !0;
}
function or(e) {
  const t = e.type;
  return e.hasAttribute("data-rr-is-password") ? "password" : t ? (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    at(t)
  ) : null;
}
function Io(e, t) {
  let r;
  try {
    r = new URL(e, t ?? window.location.href);
  } catch {
    return null;
  }
  const i = /\.([0-9a-z]+)(?:$)/i, n = r.pathname.match(i);
  return (n == null ? void 0 : n[1]) ?? null;
}
function Vc(e) {
  let t = "";
  return e.indexOf("//") > -1 ? t = e.split("/").slice(0, 3).join("/") : t = e.split("/")[0], t = t.split("?")[0], t;
}
const Gc = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, Yc = /^(?:[a-z+]+:)?\/\//i, Xc = /^www\..*/i, Jc = /^(data:)([^,]*),(.*)/i;
function ar(e, t) {
  return (e || "").replace(
    Gc,
    (r, i, n, s, l, p) => {
      const o = n || l || p, d = i || s || "";
      if (!o)
        return r;
      if (Yc.test(o) || Xc.test(o))
        return `url(${d}${o}${d})`;
      if (Jc.test(o))
        return `url(${d}${o}${d})`;
      if (o[0] === "/")
        return `url(${d}${Vc(t) + o}${d})`;
      const a = t.split("/"), h = o.split("/");
      a.pop();
      for (const u of h)
        u !== "." && (u === ".." ? a.pop() : a.push(u));
      return `url(${d}${a.join("/")}${d})`;
    }
  );
}
function Ht(e, t = !1) {
  return t ? e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "") : e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "").replace(/0px/g, "0");
}
function Kc(e, t, r = !1) {
  const i = Array.from(t.childNodes), n = [];
  let s = 0;
  if (i.length > 1 && e && typeof e == "string") {
    let l = Ht(e, r);
    const p = l.length / e.length;
    for (let o = 1; o < i.length; o++)
      if (i[o].textContent && typeof i[o].textContent == "string") {
        const d = Ht(
          i[o].textContent,
          r
        ), a = 100;
        let h = 3;
        for (; h < d.length && // keep consuming css identifiers (to get a decent chunk more quickly)
        (d[h].match(/[a-zA-Z0-9]/) || // substring needs to be unique to this section
        d.indexOf(d.substring(0, h), 1) !== -1); h++)
          ;
        for (; h < d.length; h++) {
          let u = d.substring(0, h), c = l.split(u), m = -1;
          if (c.length === 2)
            m = c[0].length;
          else if (c.length > 2 && c[0] === "" && i[o - 1].textContent !== "")
            m = l.indexOf(u, 1);
          else if (c.length === 1) {
            if (u = u.substring(
              0,
              u.length - 1
            ), c = l.split(u), c.length <= 1)
              return n.push(e), n;
            h = a + 1;
          } else h === d.length - 1 && (m = l.indexOf(u));
          if (c.length >= 2 && h > a) {
            const f = i[o - 1].textContent;
            if (f && typeof f == "string") {
              const g = Ht(f).length;
              m = l.indexOf(u, g);
            }
            m === -1 && (m = c[0].length);
          }
          if (m !== -1) {
            let f = Math.floor(m / p);
            for (; f > 0 && f < e.length; ) {
              if (s += 1, s > 50 * i.length)
                return n.push(e), n;
              const g = Ht(
                e.substring(0, f),
                r
              );
              if (g.length === m) {
                n.push(e.substring(0, f)), e = e.substring(f), l = l.substring(m);
                break;
              } else g.length < m ? f += Math.max(
                1,
                Math.floor((m - g.length) / p)
              ) : f -= Math.max(
                1,
                Math.floor((g.length - m) * p)
              );
            }
            break;
          }
        }
      }
  }
  return n.push(e), n;
}
function Zc(e, t) {
  return Kc(e, t).join("/* rr_split */");
}
let Qc = 1;
const eu = new RegExp("[^a-z0-9-_:]"), Pt = -2;
function Ao() {
  return Qc++;
}
function tu(e) {
  if (e instanceof HTMLFormElement)
    return "form";
  const t = at(e.tagName);
  return eu.test(t) ? "div" : t;
}
let pt, Di;
const ru = /^[^ \t\n\r\u000c]+/, nu = /^[, \t\n\r\u000c]+/;
function iu(e, t) {
  if (t.trim() === "")
    return t;
  let r = 0;
  function i(s) {
    let l;
    const p = s.exec(t.substring(r));
    return p ? (l = p[0], r += l.length, l) : "";
  }
  const n = [];
  for (; i(nu), !(r >= t.length); ) {
    let s = i(ru);
    if (s.slice(-1) === ",")
      s = yt(e, s.substring(0, s.length - 1)), n.push(s);
    else {
      let l = "";
      s = yt(e, s);
      let p = !1;
      for (; ; ) {
        const o = t.charAt(r);
        if (o === "") {
          n.push((s + l).trim());
          break;
        } else if (p)
          o === ")" && (p = !1);
        else if (o === ",") {
          r += 1, n.push((s + l).trim());
          break;
        } else o === "(" && (p = !0);
        l += o, r += 1;
      }
    }
  }
  return n.join(", ");
}
const zi = /* @__PURE__ */ new WeakMap();
function yt(e, t) {
  return !t || t.trim() === "" ? t : Zn(e, t);
}
function su(e) {
  return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function Zn(e, t) {
  let r = zi.get(e);
  if (r || (r = e.createElement("a"), zi.set(e, r)), !t)
    t = "";
  else if (t.startsWith("blob:") || t.startsWith("data:"))
    return t;
  return r.setAttribute("href", t), r.href;
}
function Lo(e, t, r, i) {
  return i && (r === "src" || r === "href" && !(t === "use" && i[0] === "#") || r === "xlink:href" && i[0] !== "#" || r === "background" && ["table", "td", "th"].includes(t) ? yt(e, i) : r === "srcset" ? iu(e, i) : r === "style" ? ar(i, Zn(e)) : t === "object" && r === "data" ? yt(e, i) : i);
}
function To(e, t, r) {
  return ["video", "audio"].includes(e) && t === "autoplay";
}
function ou(e, t, r) {
  try {
    if (typeof t == "string") {
      if (e.classList.contains(t))
        return !0;
    } else
      for (let i = e.classList.length; i--; ) {
        const n = e.classList[i];
        if (t.test(n))
          return !0;
      }
    if (r)
      return e.matches(r);
  } catch {
  }
  return !1;
}
function lr(e, t, r) {
  if (!e) return !1;
  if (e.nodeType !== e.ELEMENT_NODE)
    return r ? lr(ge.parentNode(e), t, r) : !1;
  for (let i = e.classList.length; i--; ) {
    const n = e.classList[i];
    if (t.test(n))
      return !0;
  }
  return r ? lr(ge.parentNode(e), t, r) : !1;
}
function Po(e, t, r, i) {
  let n;
  if (Mo(e)) {
    if (n = e, !ge.childNodes(n).length)
      return !1;
  } else {
    if (ge.parentElement(e) === null)
      return !1;
    n = ge.parentElement(e);
  }
  try {
    if (typeof t == "string") {
      if (i) {
        if (n.closest(`.${t}`)) return !0;
      } else if (n.classList.contains(t)) return !0;
    } else if (lr(n, t, i)) return !0;
    if (r) {
      if (i) {
        if (n.closest(r)) return !0;
      } else if (n.matches(r)) return !0;
    }
  } catch {
  }
  return !1;
}
function au(e, t, r) {
  const i = e.contentWindow;
  if (!i)
    return;
  let n = !1, s;
  try {
    s = i.document.readyState;
  } catch {
    return;
  }
  if (s !== "complete") {
    const p = setTimeout(() => {
      n || (t(), n = !0);
    }, r);
    e.addEventListener("load", () => {
      clearTimeout(p), n = !0, t();
    });
    return;
  }
  const l = "about:blank";
  if (i.location.href !== l || e.src === l || e.src === "")
    return setTimeout(t, 0), e.addEventListener("load", t);
  e.addEventListener("load", t);
}
function lu(e, t, r) {
  let i = !1, n;
  try {
    n = e.sheet;
  } catch {
    return;
  }
  if (n) return;
  const s = setTimeout(() => {
    i || (t(), i = !0);
  }, r);
  e.addEventListener("load", () => {
    clearTimeout(s), i = !0, t();
  });
}
function cu(e, t) {
  const {
    doc: r,
    mirror: i,
    blockClass: n,
    blockSelector: s,
    needsMask: l,
    inlineStylesheet: p,
    maskInputOptions: o = {},
    maskTextFn: d,
    maskInputFn: a,
    dataURLOptions: h = {},
    inlineImages: u,
    recordCanvas: c,
    keepIframeSrcFn: m,
    newlyAddedElement: f = !1,
    cssCaptured: g = !1
  } = t, x = uu(r, i);
  switch (e.nodeType) {
    case e.DOCUMENT_NODE:
      return e.compatMode !== "CSS1Compat" ? {
        type: ue.Document,
        childNodes: [],
        compatMode: e.compatMode
        // probably "BackCompat"
      } : {
        type: ue.Document,
        childNodes: []
      };
    case e.DOCUMENT_TYPE_NODE:
      return {
        type: ue.DocumentType,
        name: e.name,
        publicId: e.publicId,
        systemId: e.systemId,
        rootId: x
      };
    case e.ELEMENT_NODE:
      return hu(e, {
        doc: r,
        blockClass: n,
        blockSelector: s,
        inlineStylesheet: p,
        maskInputOptions: o,
        maskInputFn: a,
        dataURLOptions: h,
        inlineImages: u,
        recordCanvas: c,
        keepIframeSrcFn: m,
        newlyAddedElement: f,
        rootId: x
      });
    case e.TEXT_NODE:
      return du(e, {
        doc: r,
        needsMask: l,
        maskTextFn: d,
        rootId: x,
        cssCaptured: g
      });
    case e.CDATA_SECTION_NODE:
      return {
        type: ue.CDATA,
        textContent: "",
        rootId: x
      };
    case e.COMMENT_NODE:
      return {
        type: ue.Comment,
        textContent: ge.textContent(e) || "",
        rootId: x
      };
    default:
      return !1;
  }
}
function uu(e, t) {
  if (!t.hasNode(e)) return;
  const r = t.getId(e);
  return r === 1 ? void 0 : r;
}
function du(e, t) {
  const { needsMask: r, maskTextFn: i, rootId: n, cssCaptured: s } = t, l = ge.parentNode(e), p = l && l.tagName;
  let o = "";
  const d = p === "STYLE" ? !0 : void 0, a = p === "SCRIPT" ? !0 : void 0;
  return a ? o = "SCRIPT_PLACEHOLDER" : s || (o = ge.textContent(e), d && o && (o = ar(o, Zn(t.doc)))), !d && !a && o && r && (o = i ? i(o, ge.parentElement(e)) : o.replace(/[\S]/g, "*")), {
    type: ue.Text,
    textContent: o || "",
    rootId: n
  };
}
function hu(e, t) {
  const {
    doc: r,
    blockClass: i,
    blockSelector: n,
    inlineStylesheet: s,
    maskInputOptions: l = {},
    maskInputFn: p,
    dataURLOptions: o = {},
    inlineImages: d,
    recordCanvas: a,
    keepIframeSrcFn: h,
    newlyAddedElement: u = !1,
    rootId: c
  } = t, m = ou(e, i, n), f = tu(e);
  let g = {};
  const x = e.attributes.length;
  for (let v = 0; v < x; v++) {
    const S = e.attributes[v];
    To(f, S.name, S.value) || (g[S.name] = Lo(
      r,
      f,
      at(S.name),
      S.value
    ));
  }
  if (f === "link" && s) {
    const v = Array.from(r.styleSheets).find((w) => w.href === e.href);
    let S = null;
    v && (S = Bn(v)), S && (delete g.rel, delete g.href, g._cssText = S);
  }
  if (f === "style" && e.sheet) {
    let v = Bn(
      e.sheet
    );
    v && (e.childNodes.length > 1 && (v = Zc(v, e)), g._cssText = v);
  }
  if (["input", "textarea", "select"].includes(f)) {
    const v = e.value, S = e.checked;
    g.type !== "radio" && g.type !== "checkbox" && g.type !== "submit" && g.type !== "button" && v ? g.value = sr({
      element: e,
      type: or(e),
      tagName: f,
      value: v,
      maskInputOptions: l,
      maskInputFn: p
    }) : S && (g.checked = S);
  }
  if (f === "option" && (e.selected && !l.select ? g.selected = !0 : delete g.selected), f === "dialog" && e.open && (g.rr_open_mode = e.matches("dialog:modal") ? "modal" : "non-modal"), f === "canvas" && a) {
    if (e.__context === "2d")
      Hc(e) || (g.rr_dataURL = e.toDataURL(
        o.type,
        o.quality
      ));
    else if (!("__context" in e)) {
      const v = e.toDataURL(
        o.type,
        o.quality
      ), S = r.createElement("canvas");
      S.width = e.width, S.height = e.height;
      const w = S.toDataURL(
        o.type,
        o.quality
      );
      v !== w && (g.rr_dataURL = v);
    }
  }
  if (f === "img" && d) {
    pt || (pt = r.createElement("canvas"), Di = pt.getContext("2d"));
    const v = e, S = v.currentSrc || v.getAttribute("src") || "<unknown-src>", w = v.crossOrigin, b = () => {
      v.removeEventListener("load", b);
      try {
        pt.width = v.naturalWidth, pt.height = v.naturalHeight, Di.drawImage(v, 0, 0), g.rr_dataURL = pt.toDataURL(
          o.type,
          o.quality
        );
      } catch (k) {
        if (v.crossOrigin !== "anonymous") {
          v.crossOrigin = "anonymous", v.complete && v.naturalWidth !== 0 ? b() : v.addEventListener("load", b);
          return;
        } else
          console.warn(
            `Cannot inline img src=${S}! Error: ${k}`
          );
      }
      v.crossOrigin === "anonymous" && (w ? g.crossOrigin = w : v.removeAttribute("crossorigin"));
    };
    v.complete && v.naturalWidth !== 0 ? b() : v.addEventListener("load", b);
  }
  if (["audio", "video"].includes(f)) {
    const v = g;
    v.rr_mediaState = e.paused ? "paused" : "played", v.rr_mediaCurrentTime = e.currentTime, v.rr_mediaPlaybackRate = e.playbackRate, v.rr_mediaMuted = e.muted, v.rr_mediaLoop = e.loop, v.rr_mediaVolume = e.volume;
  }
  if (u || (e.scrollLeft && (g.rr_scrollLeft = e.scrollLeft), e.scrollTop && (g.rr_scrollTop = e.scrollTop)), m) {
    const { width: v, height: S } = e.getBoundingClientRect();
    g = {
      class: g.class,
      rr_width: `${v}px`,
      rr_height: `${S}px`
    };
  }
  f === "iframe" && !h(g.src) && (e.contentDocument || (g.rr_src = g.src), delete g.src);
  let y;
  try {
    customElements.get(f) && (y = !0);
  } catch {
  }
  return {
    type: ue.Element,
    tagName: f,
    attributes: g,
    childNodes: [],
    isSVG: su(e) || void 0,
    needBlock: m,
    rootId: c,
    isCustom: y
  };
}
function Q(e) {
  return e == null ? "" : e.toLowerCase();
}
function No(e) {
  return e === !0 || e === "all" ? {
    script: !0,
    comment: !0,
    headFavicon: !0,
    headWhitespace: !0,
    headMetaSocial: !0,
    headMetaRobots: !0,
    headMetaHttpEquiv: !0,
    headMetaVerification: !0,
    // the following are off for slimDOMOptions === true,
    // as they destroy some (hidden) info:
    headMetaAuthorship: e === "all",
    headMetaDescKeywords: e === "all",
    headTitleMutations: e === "all"
  } : e || {};
}
function pu(e, t) {
  if (t.comment && e.type === ue.Comment)
    return !0;
  if (e.type === ue.Element) {
    if (t.script && // script tag
    (e.tagName === "script" || // (module)preload link
    e.tagName === "link" && (e.attributes.rel === "preload" && e.attributes.as === "script" || e.attributes.rel === "modulepreload") || // prefetch link
    e.tagName === "link" && e.attributes.rel === "prefetch" && typeof e.attributes.href == "string" && Io(e.attributes.href) === "js"))
      return !0;
    if (t.headFavicon && (e.tagName === "link" && e.attributes.rel === "shortcut icon" || e.tagName === "meta" && (Q(e.attributes.name).match(
      /^msapplication-tile(image|color)$/
    ) || Q(e.attributes.name) === "application-name" || Q(e.attributes.rel) === "icon" || Q(e.attributes.rel) === "apple-touch-icon" || Q(e.attributes.rel) === "shortcut icon")))
      return !0;
    if (e.tagName === "meta") {
      if (t.headMetaDescKeywords && Q(e.attributes.name).match(/^description|keywords$/))
        return !0;
      if (t.headMetaSocial && (Q(e.attributes.property).match(/^(og|twitter|fb):/) || // og = opengraph (facebook)
      Q(e.attributes.name).match(/^(og|twitter):/) || Q(e.attributes.name) === "pinterest"))
        return !0;
      if (t.headMetaRobots && (Q(e.attributes.name) === "robots" || Q(e.attributes.name) === "googlebot" || Q(e.attributes.name) === "bingbot"))
        return !0;
      if (t.headMetaHttpEquiv && e.attributes["http-equiv"] !== void 0)
        return !0;
      if (t.headMetaAuthorship && (Q(e.attributes.name) === "author" || Q(e.attributes.name) === "generator" || Q(e.attributes.name) === "framework" || Q(e.attributes.name) === "publisher" || Q(e.attributes.name) === "progid" || Q(e.attributes.property).match(/^article:/) || Q(e.attributes.property).match(/^product:/)))
        return !0;
      if (t.headMetaVerification && (Q(e.attributes.name) === "google-site-verification" || Q(e.attributes.name) === "yandex-verification" || Q(e.attributes.name) === "csrf-token" || Q(e.attributes.name) === "p:domain_verify" || Q(e.attributes.name) === "verify-v1" || Q(e.attributes.name) === "verification" || Q(e.attributes.name) === "shopify-checkout-api-token"))
        return !0;
    }
  }
  return !1;
}
function bt(e, t) {
  const {
    doc: r,
    mirror: i,
    blockClass: n,
    blockSelector: s,
    maskTextClass: l,
    maskTextSelector: p,
    skipChild: o = !1,
    inlineStylesheet: d = !0,
    maskInputOptions: a = {},
    maskTextFn: h,
    maskInputFn: u,
    slimDOMOptions: c,
    dataURLOptions: m = {},
    inlineImages: f = !1,
    recordCanvas: g = !1,
    onSerialize: x,
    onIframeLoad: y,
    iframeLoadTimeout: v = 5e3,
    onStylesheetLoad: S,
    stylesheetLoadTimeout: w = 5e3,
    keepIframeSrcFn: b = () => !1,
    newlyAddedElement: k = !1,
    cssCaptured: E = !1
  } = t;
  let { needsMask: A } = t, { preserveWhiteSpace: M = !0 } = t;
  A || (A = Po(
    e,
    l,
    p,
    A === void 0
  ));
  const _ = cu(e, {
    doc: r,
    mirror: i,
    blockClass: n,
    blockSelector: s,
    needsMask: A,
    inlineStylesheet: d,
    maskInputOptions: a,
    maskTextFn: h,
    maskInputFn: u,
    dataURLOptions: m,
    inlineImages: f,
    recordCanvas: g,
    keepIframeSrcFn: b,
    newlyAddedElement: k,
    cssCaptured: E
  });
  if (!_)
    return console.warn(e, "not serialized"), null;
  let P;
  i.hasNode(e) ? P = i.getId(e) : pu(_, c) || !M && _.type === ue.Text && !_.textContent.replace(/^\s+|\s+$/gm, "").length ? P = Pt : P = Ao();
  const C = Object.assign(_, { id: P });
  if (i.add(e, C), P === Pt)
    return null;
  x && x(e);
  let we = !o;
  if (C.type === ue.Element) {
    we = we && !C.needBlock, delete C.needBlock;
    const j = ge.shadowRoot(e);
    j && Lt(j) && (C.isShadowHost = !0);
  }
  if ((C.type === ue.Document || C.type === ue.Element) && we) {
    c.headWhitespace && C.type === ue.Element && C.tagName === "head" && (M = !1);
    const j = {
      doc: r,
      mirror: i,
      blockClass: n,
      blockSelector: s,
      needsMask: A,
      maskTextClass: l,
      maskTextSelector: p,
      skipChild: o,
      inlineStylesheet: d,
      maskInputOptions: a,
      maskTextFn: h,
      maskInputFn: u,
      slimDOMOptions: c,
      dataURLOptions: m,
      inlineImages: f,
      recordCanvas: g,
      preserveWhiteSpace: M,
      onSerialize: x,
      onIframeLoad: y,
      iframeLoadTimeout: v,
      onStylesheetLoad: S,
      stylesheetLoadTimeout: w,
      keepIframeSrcFn: b,
      cssCaptured: !1
    };
    if (!(C.type === ue.Element && C.tagName === "textarea" && C.attributes.value !== void 0)) {
      C.type === ue.Element && C.attributes._cssText !== void 0 && typeof C.attributes._cssText == "string" && (j.cssCaptured = !0);
      for (const K of Array.from(ge.childNodes(e))) {
        const ee = bt(K, j);
        ee && C.childNodes.push(ee);
      }
    }
    let B = null;
    if (Mo(e) && (B = ge.shadowRoot(e)))
      for (const K of Array.from(ge.childNodes(B))) {
        const ee = bt(K, j);
        ee && (Lt(B) && (ee.isShadow = !0), C.childNodes.push(ee));
      }
  }
  const he = ge.parentNode(e);
  return he && At(he) && Lt(he) && (C.isShadow = !0), C.type === ue.Element && C.tagName === "iframe" && au(
    e,
    () => {
      const j = e.contentDocument;
      if (j && y) {
        const B = bt(j, {
          doc: j,
          mirror: i,
          blockClass: n,
          blockSelector: s,
          needsMask: A,
          maskTextClass: l,
          maskTextSelector: p,
          skipChild: !1,
          inlineStylesheet: d,
          maskInputOptions: a,
          maskTextFn: h,
          maskInputFn: u,
          slimDOMOptions: c,
          dataURLOptions: m,
          inlineImages: f,
          recordCanvas: g,
          preserveWhiteSpace: M,
          onSerialize: x,
          onIframeLoad: y,
          iframeLoadTimeout: v,
          onStylesheetLoad: S,
          stylesheetLoadTimeout: w,
          keepIframeSrcFn: b
        });
        B && y(
          e,
          B
        );
      }
    },
    v
  ), C.type === ue.Element && C.tagName === "link" && typeof C.attributes.rel == "string" && (C.attributes.rel === "stylesheet" || C.attributes.rel === "preload" && typeof C.attributes.href == "string" && Io(C.attributes.href) === "css") && lu(
    e,
    () => {
      if (S) {
        const j = bt(e, {
          doc: r,
          mirror: i,
          blockClass: n,
          blockSelector: s,
          needsMask: A,
          maskTextClass: l,
          maskTextSelector: p,
          skipChild: !1,
          inlineStylesheet: d,
          maskInputOptions: a,
          maskTextFn: h,
          maskInputFn: u,
          slimDOMOptions: c,
          dataURLOptions: m,
          inlineImages: f,
          recordCanvas: g,
          preserveWhiteSpace: M,
          onSerialize: x,
          onIframeLoad: y,
          iframeLoadTimeout: v,
          onStylesheetLoad: S,
          stylesheetLoadTimeout: w,
          keepIframeSrcFn: b
        });
        j && S(
          e,
          j
        );
      }
    },
    w
  ), C;
}
function fu(e, t) {
  const {
    mirror: r = new Oo(),
    blockClass: i = "rr-block",
    blockSelector: n = null,
    maskTextClass: s = "rr-mask",
    maskTextSelector: l = null,
    inlineStylesheet: p = !0,
    inlineImages: o = !1,
    recordCanvas: d = !1,
    maskAllInputs: a = !1,
    maskTextFn: h,
    maskInputFn: u,
    slimDOM: c = !1,
    dataURLOptions: m,
    preserveWhiteSpace: f,
    onSerialize: g,
    onIframeLoad: x,
    iframeLoadTimeout: y,
    onStylesheetLoad: v,
    stylesheetLoadTimeout: S,
    keepIframeSrcFn: w = () => !1
  } = t, b = a === !0 ? {
    color: !0,
    date: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0,
    textarea: !0,
    select: !0,
    password: !0
  } : a === !1 ? {
    password: !0
  } : a, k = No(c);
  return bt(e, {
    doc: e,
    mirror: r,
    blockClass: i,
    blockSelector: n,
    maskTextClass: s,
    maskTextSelector: l,
    skipChild: !1,
    inlineStylesheet: p,
    maskInputOptions: b,
    maskTextFn: h,
    maskInputFn: u,
    slimDOMOptions: k,
    dataURLOptions: m,
    inlineImages: o,
    recordCanvas: d,
    preserveWhiteSpace: f,
    onSerialize: g,
    onIframeLoad: x,
    iframeLoadTimeout: y,
    onStylesheetLoad: v,
    stylesheetLoadTimeout: S,
    keepIframeSrcFn: w,
    newlyAddedElement: !1
  });
}
function mu(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function gu(e) {
  if (e.__esModule) return e;
  var t = e.default;
  if (typeof t == "function") {
    var r = function i() {
      return this instanceof i ? Reflect.construct(t, arguments, this.constructor) : t.apply(this, arguments);
    };
    r.prototype = t.prototype;
  } else r = {};
  return Object.defineProperty(r, "__esModule", { value: !0 }), Object.keys(e).forEach(function(i) {
    var n = Object.getOwnPropertyDescriptor(e, i);
    Object.defineProperty(r, i, n.get ? n : {
      enumerable: !0,
      get: function() {
        return e[i];
      }
    });
  }), r;
}
var Vt = { exports: {} }, Fi;
function yu() {
  if (Fi) return Vt.exports;
  Fi = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return Vt.exports = t(), Vt.exports.createColors = t, Vt.exports;
}
const bu = {}, vu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: bu
}, Symbol.toStringTag, { value: "Module" })), Fe = /* @__PURE__ */ gu(vu);
var Nr, Ui;
function Qn() {
  if (Ui) return Nr;
  Ui = 1;
  let e = /* @__PURE__ */ yu(), t = Fe;
  class r extends Error {
    constructor(n, s, l, p, o, d) {
      super(n), this.name = "CssSyntaxError", this.reason = n, o && (this.file = o), p && (this.source = p), d && (this.plugin = d), typeof s < "u" && typeof l < "u" && (typeof s == "number" ? (this.line = s, this.column = l) : (this.line = s.line, this.column = s.column, this.endLine = l.line, this.endColumn = l.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, r);
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
    }
    showSourceCode(n) {
      if (!this.source) return "";
      let s = this.source;
      n == null && (n = e.isColorSupported), t && n && (s = t(s));
      let l = s.split(/\r?\n/), p = Math.max(this.line - 3, 0), o = Math.min(this.line + 2, l.length), d = String(o).length, a, h;
      if (n) {
        let { bold: u, gray: c, red: m } = e.createColors(!0);
        a = (f) => u(m(f)), h = (f) => c(f);
      } else
        a = h = (u) => u;
      return l.slice(p, o).map((u, c) => {
        let m = p + 1 + c, f = " " + (" " + m).slice(-d) + " | ";
        if (m === this.line) {
          let g = h(f.replace(/\d/g, " ")) + u.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return a(">") + h(f) + u + `
 ` + g + a("^");
        }
        return " " + h(f) + u;
      }).join(`
`);
    }
    toString() {
      let n = this.showSourceCode();
      return n && (n = `

` + n + `
`), this.name + ": " + this.message + n;
    }
  }
  return Nr = r, r.default = r, Nr;
}
var Gt = {}, Bi;
function ei() {
  return Bi || (Bi = 1, Gt.isClean = Symbol("isClean"), Gt.my = Symbol("my")), Gt;
}
var _r, Wi;
function _o() {
  if (Wi) return _r;
  Wi = 1;
  const e = {
    after: `
`,
    beforeClose: `
`,
    beforeComment: `
`,
    beforeDecl: `
`,
    beforeOpen: " ",
    beforeRule: `
`,
    colon: ": ",
    commentLeft: " ",
    commentRight: " ",
    emptyBody: "",
    indent: "    ",
    semicolon: !1
  };
  function t(i) {
    return i[0].toUpperCase() + i.slice(1);
  }
  class r {
    constructor(n) {
      this.builder = n;
    }
    atrule(n, s) {
      let l = "@" + n.name, p = n.params ? this.rawValue(n, "params") : "";
      if (typeof n.raws.afterName < "u" ? l += n.raws.afterName : p && (l += " "), n.nodes)
        this.block(n, l + p);
      else {
        let o = (n.raws.between || "") + (s ? ";" : "");
        this.builder(l + p + o, n);
      }
    }
    beforeAfter(n, s) {
      let l;
      n.type === "decl" ? l = this.raw(n, null, "beforeDecl") : n.type === "comment" ? l = this.raw(n, null, "beforeComment") : s === "before" ? l = this.raw(n, null, "beforeRule") : l = this.raw(n, null, "beforeClose");
      let p = n.parent, o = 0;
      for (; p && p.type !== "root"; )
        o += 1, p = p.parent;
      if (l.includes(`
`)) {
        let d = this.raw(n, null, "indent");
        if (d.length)
          for (let a = 0; a < o; a++) l += d;
      }
      return l;
    }
    block(n, s) {
      let l = this.raw(n, "between", "beforeOpen");
      this.builder(s + l + "{", n, "start");
      let p;
      n.nodes && n.nodes.length ? (this.body(n), p = this.raw(n, "after")) : p = this.raw(n, "after", "emptyBody"), p && this.builder(p), this.builder("}", n, "end");
    }
    body(n) {
      let s = n.nodes.length - 1;
      for (; s > 0 && n.nodes[s].type === "comment"; )
        s -= 1;
      let l = this.raw(n, "semicolon");
      for (let p = 0; p < n.nodes.length; p++) {
        let o = n.nodes[p], d = this.raw(o, "before");
        d && this.builder(d), this.stringify(o, s !== p || l);
      }
    }
    comment(n) {
      let s = this.raw(n, "left", "commentLeft"), l = this.raw(n, "right", "commentRight");
      this.builder("/*" + s + n.text + l + "*/", n);
    }
    decl(n, s) {
      let l = this.raw(n, "between", "colon"), p = n.prop + l + this.rawValue(n, "value");
      n.important && (p += n.raws.important || " !important"), s && (p += ";"), this.builder(p, n);
    }
    document(n) {
      this.body(n);
    }
    raw(n, s, l) {
      let p;
      if (l || (l = s), s && (p = n.raws[s], typeof p < "u"))
        return p;
      let o = n.parent;
      if (l === "before" && (!o || o.type === "root" && o.first === n || o && o.type === "document"))
        return "";
      if (!o) return e[l];
      let d = n.root();
      if (d.rawCache || (d.rawCache = {}), typeof d.rawCache[l] < "u")
        return d.rawCache[l];
      if (l === "before" || l === "after")
        return this.beforeAfter(n, l);
      {
        let a = "raw" + t(l);
        this[a] ? p = this[a](d, n) : d.walk((h) => {
          if (p = h.raws[s], typeof p < "u") return !1;
        });
      }
      return typeof p > "u" && (p = e[l]), d.rawCache[l] = p, p;
    }
    rawBeforeClose(n) {
      let s;
      return n.walk((l) => {
        if (l.nodes && l.nodes.length > 0 && typeof l.raws.after < "u")
          return s = l.raws.after, s.includes(`
`) && (s = s.replace(/[^\n]+$/, "")), !1;
      }), s && (s = s.replace(/\S/g, "")), s;
    }
    rawBeforeComment(n, s) {
      let l;
      return n.walkComments((p) => {
        if (typeof p.raws.before < "u")
          return l = p.raws.before, l.includes(`
`) && (l = l.replace(/[^\n]+$/, "")), !1;
      }), typeof l > "u" ? l = this.raw(s, null, "beforeDecl") : l && (l = l.replace(/\S/g, "")), l;
    }
    rawBeforeDecl(n, s) {
      let l;
      return n.walkDecls((p) => {
        if (typeof p.raws.before < "u")
          return l = p.raws.before, l.includes(`
`) && (l = l.replace(/[^\n]+$/, "")), !1;
      }), typeof l > "u" ? l = this.raw(s, null, "beforeRule") : l && (l = l.replace(/\S/g, "")), l;
    }
    rawBeforeOpen(n) {
      let s;
      return n.walk((l) => {
        if (l.type !== "decl" && (s = l.raws.between, typeof s < "u"))
          return !1;
      }), s;
    }
    rawBeforeRule(n) {
      let s;
      return n.walk((l) => {
        if (l.nodes && (l.parent !== n || n.first !== l) && typeof l.raws.before < "u")
          return s = l.raws.before, s.includes(`
`) && (s = s.replace(/[^\n]+$/, "")), !1;
      }), s && (s = s.replace(/\S/g, "")), s;
    }
    rawColon(n) {
      let s;
      return n.walkDecls((l) => {
        if (typeof l.raws.between < "u")
          return s = l.raws.between.replace(/[^\s:]/g, ""), !1;
      }), s;
    }
    rawEmptyBody(n) {
      let s;
      return n.walk((l) => {
        if (l.nodes && l.nodes.length === 0 && (s = l.raws.after, typeof s < "u"))
          return !1;
      }), s;
    }
    rawIndent(n) {
      if (n.raws.indent) return n.raws.indent;
      let s;
      return n.walk((l) => {
        let p = l.parent;
        if (p && p !== n && p.parent && p.parent === n && typeof l.raws.before < "u") {
          let o = l.raws.before.split(`
`);
          return s = o[o.length - 1], s = s.replace(/\S/g, ""), !1;
        }
      }), s;
    }
    rawSemicolon(n) {
      let s;
      return n.walk((l) => {
        if (l.nodes && l.nodes.length && l.last.type === "decl" && (s = l.raws.semicolon, typeof s < "u"))
          return !1;
      }), s;
    }
    rawValue(n, s) {
      let l = n[s], p = n.raws[s];
      return p && p.value === l ? p.raw : l;
    }
    root(n) {
      this.body(n), n.raws.after && this.builder(n.raws.after);
    }
    rule(n) {
      this.block(n, this.rawValue(n, "selector")), n.raws.ownSemicolon && this.builder(n.raws.ownSemicolon, n, "end");
    }
    stringify(n, s) {
      if (!this[n.type])
        throw new Error(
          "Unknown AST node type " + n.type + ". Maybe you need to change PostCSS stringifier."
        );
      this[n.type](n, s);
    }
  }
  return _r = r, r.default = r, _r;
}
var $r, ji;
function mr() {
  if (ji) return $r;
  ji = 1;
  let e = _o();
  function t(r, i) {
    new e(i).stringify(r);
  }
  return $r = t, t.default = t, $r;
}
var Dr, qi;
function gr() {
  if (qi) return Dr;
  qi = 1;
  let { isClean: e, my: t } = ei(), r = Qn(), i = _o(), n = mr();
  function s(p, o) {
    let d = new p.constructor();
    for (let a in p) {
      if (!Object.prototype.hasOwnProperty.call(p, a) || a === "proxyCache") continue;
      let h = p[a], u = typeof h;
      a === "parent" && u === "object" ? o && (d[a] = o) : a === "source" ? d[a] = h : Array.isArray(h) ? d[a] = h.map((c) => s(c, d)) : (u === "object" && h !== null && (h = s(h)), d[a] = h);
    }
    return d;
  }
  class l {
    constructor(o = {}) {
      this.raws = {}, this[e] = !1, this[t] = !0;
      for (let d in o)
        if (d === "nodes") {
          this.nodes = [];
          for (let a of o[d])
            typeof a.clone == "function" ? this.append(a.clone()) : this.append(a);
        } else
          this[d] = o[d];
    }
    addToError(o) {
      if (o.postcssNode = this, o.stack && this.source && /\n\s{4}at /.test(o.stack)) {
        let d = this.source;
        o.stack = o.stack.replace(
          /\n\s{4}at /,
          `$&${d.input.from}:${d.start.line}:${d.start.column}$&`
        );
      }
      return o;
    }
    after(o) {
      return this.parent.insertAfter(this, o), this;
    }
    assign(o = {}) {
      for (let d in o)
        this[d] = o[d];
      return this;
    }
    before(o) {
      return this.parent.insertBefore(this, o), this;
    }
    cleanRaws(o) {
      delete this.raws.before, delete this.raws.after, o || delete this.raws.between;
    }
    clone(o = {}) {
      let d = s(this);
      for (let a in o)
        d[a] = o[a];
      return d;
    }
    cloneAfter(o = {}) {
      let d = this.clone(o);
      return this.parent.insertAfter(this, d), d;
    }
    cloneBefore(o = {}) {
      let d = this.clone(o);
      return this.parent.insertBefore(this, d), d;
    }
    error(o, d = {}) {
      if (this.source) {
        let { end: a, start: h } = this.rangeBy(d);
        return this.source.input.error(
          o,
          { column: h.column, line: h.line },
          { column: a.column, line: a.line },
          d
        );
      }
      return new r(o);
    }
    getProxyProcessor() {
      return {
        get(o, d) {
          return d === "proxyOf" ? o : d === "root" ? () => o.root().toProxy() : o[d];
        },
        set(o, d, a) {
          return o[d] === a || (o[d] = a, (d === "prop" || d === "value" || d === "name" || d === "params" || d === "important" || /* c8 ignore next */
          d === "text") && o.markDirty()), !0;
        }
      };
    }
    markDirty() {
      if (this[e]) {
        this[e] = !1;
        let o = this;
        for (; o = o.parent; )
          o[e] = !1;
      }
    }
    next() {
      if (!this.parent) return;
      let o = this.parent.index(this);
      return this.parent.nodes[o + 1];
    }
    positionBy(o, d) {
      let a = this.source.start;
      if (o.index)
        a = this.positionInside(o.index, d);
      else if (o.word) {
        d = this.toString();
        let h = d.indexOf(o.word);
        h !== -1 && (a = this.positionInside(h, d));
      }
      return a;
    }
    positionInside(o, d) {
      let a = d || this.toString(), h = this.source.start.column, u = this.source.start.line;
      for (let c = 0; c < o; c++)
        a[c] === `
` ? (h = 1, u += 1) : h += 1;
      return { column: h, line: u };
    }
    prev() {
      if (!this.parent) return;
      let o = this.parent.index(this);
      return this.parent.nodes[o - 1];
    }
    rangeBy(o) {
      let d = {
        column: this.source.start.column,
        line: this.source.start.line
      }, a = this.source.end ? {
        column: this.source.end.column + 1,
        line: this.source.end.line
      } : {
        column: d.column + 1,
        line: d.line
      };
      if (o.word) {
        let h = this.toString(), u = h.indexOf(o.word);
        u !== -1 && (d = this.positionInside(u, h), a = this.positionInside(u + o.word.length, h));
      } else
        o.start ? d = {
          column: o.start.column,
          line: o.start.line
        } : o.index && (d = this.positionInside(o.index)), o.end ? a = {
          column: o.end.column,
          line: o.end.line
        } : typeof o.endIndex == "number" ? a = this.positionInside(o.endIndex) : o.index && (a = this.positionInside(o.index + 1));
      return (a.line < d.line || a.line === d.line && a.column <= d.column) && (a = { column: d.column + 1, line: d.line }), { end: a, start: d };
    }
    raw(o, d) {
      return new i().raw(this, o, d);
    }
    remove() {
      return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
    }
    replaceWith(...o) {
      if (this.parent) {
        let d = this, a = !1;
        for (let h of o)
          h === this ? a = !0 : a ? (this.parent.insertAfter(d, h), d = h) : this.parent.insertBefore(d, h);
        a || this.remove();
      }
      return this;
    }
    root() {
      let o = this;
      for (; o.parent && o.parent.type !== "document"; )
        o = o.parent;
      return o;
    }
    toJSON(o, d) {
      let a = {}, h = d == null;
      d = d || /* @__PURE__ */ new Map();
      let u = 0;
      for (let c in this) {
        if (!Object.prototype.hasOwnProperty.call(this, c) || c === "parent" || c === "proxyCache") continue;
        let m = this[c];
        if (Array.isArray(m))
          a[c] = m.map((f) => typeof f == "object" && f.toJSON ? f.toJSON(null, d) : f);
        else if (typeof m == "object" && m.toJSON)
          a[c] = m.toJSON(null, d);
        else if (c === "source") {
          let f = d.get(m.input);
          f == null && (f = u, d.set(m.input, u), u++), a[c] = {
            end: m.end,
            inputId: f,
            start: m.start
          };
        } else
          a[c] = m;
      }
      return h && (a.inputs = [...d.keys()].map((c) => c.toJSON())), a;
    }
    toProxy() {
      return this.proxyCache || (this.proxyCache = new Proxy(this, this.getProxyProcessor())), this.proxyCache;
    }
    toString(o = n) {
      o.stringify && (o = o.stringify);
      let d = "";
      return o(this, (a) => {
        d += a;
      }), d;
    }
    warn(o, d, a) {
      let h = { node: this };
      for (let u in a) h[u] = a[u];
      return o.warn(d, h);
    }
    get proxyOf() {
      return this;
    }
  }
  return Dr = l, l.default = l, Dr;
}
var zr, Hi;
function yr() {
  if (Hi) return zr;
  Hi = 1;
  let e = gr();
  class t extends e {
    constructor(i) {
      i && typeof i.value < "u" && typeof i.value != "string" && (i = { ...i, value: String(i.value) }), super(i), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return zr = t, t.default = t, zr;
}
var Fr, Vi;
function wu() {
  if (Vi) return Fr;
  Vi = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return Fr = { nanoid: (i = 21) => {
    let n = "", s = i;
    for (; s--; )
      n += e[Math.random() * 64 | 0];
    return n;
  }, customAlphabet: (i, n = 21) => (s = n) => {
    let l = "", p = s;
    for (; p--; )
      l += i[Math.random() * i.length | 0];
    return l;
  } }, Fr;
}
var Ur, Gi;
function $o() {
  if (Gi) return Ur;
  Gi = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Fe, { existsSync: r, readFileSync: i } = Fe, { dirname: n, join: s } = Fe;
  function l(o) {
    return Buffer ? Buffer.from(o, "base64").toString() : window.atob(o);
  }
  class p {
    constructor(d, a) {
      if (a.map === !1) return;
      this.loadAnnotation(d), this.inline = this.startWith(this.annotation, "data:");
      let h = a.map ? a.map.prev : void 0, u = this.loadMap(a.from, h);
      !this.mapFile && a.from && (this.mapFile = a.from), this.mapFile && (this.root = n(this.mapFile)), u && (this.text = u);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(d) {
      let a = /^data:application\/json;charset=utf-?8;base64,/, h = /^data:application\/json;base64,/, u = /^data:application\/json;charset=utf-?8,/, c = /^data:application\/json,/;
      if (u.test(d) || c.test(d))
        return decodeURIComponent(d.substr(RegExp.lastMatch.length));
      if (a.test(d) || h.test(d))
        return l(d.substr(RegExp.lastMatch.length));
      let m = d.match(/data:application\/json;([^,]+),/)[1];
      throw new Error("Unsupported source map encoding " + m);
    }
    getAnnotationURL(d) {
      return d.replace(/^\/\*\s*# sourceMappingURL=/, "").trim();
    }
    isMap(d) {
      return typeof d != "object" ? !1 : typeof d.mappings == "string" || typeof d._mappings == "string" || Array.isArray(d.sections);
    }
    loadAnnotation(d) {
      let a = d.match(/\/\*\s*# sourceMappingURL=/gm);
      if (!a) return;
      let h = d.lastIndexOf(a.pop()), u = d.indexOf("*/", h);
      h > -1 && u > -1 && (this.annotation = this.getAnnotationURL(d.substring(h, u)));
    }
    loadFile(d) {
      if (this.root = n(d), r(d))
        return this.mapFile = d, i(d, "utf-8").toString().trim();
    }
    loadMap(d, a) {
      if (a === !1) return !1;
      if (a) {
        if (typeof a == "string")
          return a;
        if (typeof a == "function") {
          let h = a(d);
          if (h) {
            let u = this.loadFile(h);
            if (!u)
              throw new Error(
                "Unable to load previous source map: " + h.toString()
              );
            return u;
          }
        } else {
          if (a instanceof e)
            return t.fromSourceMap(a).toString();
          if (a instanceof t)
            return a.toString();
          if (this.isMap(a))
            return JSON.stringify(a);
          throw new Error(
            "Unsupported previous source map format: " + a.toString()
          );
        }
      } else {
        if (this.inline)
          return this.decodeInline(this.annotation);
        if (this.annotation) {
          let h = this.annotation;
          return d && (h = s(n(d), h)), this.loadFile(h);
        }
      }
    }
    startWith(d, a) {
      return d ? d.substr(0, a.length) === a : !1;
    }
    withContent() {
      return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
    }
  }
  return Ur = p, p.default = p, Ur;
}
var Br, Yi;
function br() {
  if (Yi) return Br;
  Yi = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Fe, { fileURLToPath: r, pathToFileURL: i } = Fe, { isAbsolute: n, resolve: s } = Fe, { nanoid: l } = /* @__PURE__ */ wu(), p = Fe, o = Qn(), d = $o(), a = Symbol("fromOffsetCache"), h = !!(e && t), u = !!(s && n);
  class c {
    constructor(f, g = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, g.from && (!u || /^\w+:\/\//.test(g.from) || n(g.from) ? this.file = g.from : this.file = s(g.from)), u && h) {
        let x = new d(this.css, g);
        if (x.text) {
          this.map = x;
          let y = x.consumer().file;
          !this.file && y && (this.file = this.mapResolve(y));
        }
      }
      this.file || (this.id = "<input css " + l(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, g, x, y = {}) {
      let v, S, w;
      if (g && typeof g == "object") {
        let k = g, E = x;
        if (typeof k.offset == "number") {
          let A = this.fromOffset(k.offset);
          g = A.line, x = A.col;
        } else
          g = k.line, x = k.column;
        if (typeof E.offset == "number") {
          let A = this.fromOffset(E.offset);
          S = A.line, w = A.col;
        } else
          S = E.line, w = E.column;
      } else if (!x) {
        let k = this.fromOffset(g);
        g = k.line, x = k.col;
      }
      let b = this.origin(g, x, S, w);
      return b ? v = new o(
        f,
        b.endLine === void 0 ? b.line : { column: b.column, line: b.line },
        b.endLine === void 0 ? b.column : { column: b.endColumn, line: b.endLine },
        b.source,
        b.file,
        y.plugin
      ) : v = new o(
        f,
        S === void 0 ? g : { column: x, line: g },
        S === void 0 ? x : { column: w, line: S },
        this.css,
        this.file,
        y.plugin
      ), v.input = { column: x, endColumn: w, endLine: S, line: g, source: this.css }, this.file && (i && (v.input.url = i(this.file).toString()), v.input.file = this.file), v;
    }
    fromOffset(f) {
      let g, x;
      if (this[a])
        x = this[a];
      else {
        let v = this.css.split(`
`);
        x = new Array(v.length);
        let S = 0;
        for (let w = 0, b = v.length; w < b; w++)
          x[w] = S, S += v[w].length + 1;
        this[a] = x;
      }
      g = x[x.length - 1];
      let y = 0;
      if (f >= g)
        y = x.length - 1;
      else {
        let v = x.length - 2, S;
        for (; y < v; )
          if (S = y + (v - y >> 1), f < x[S])
            v = S - 1;
          else if (f >= x[S + 1])
            y = S + 1;
          else {
            y = S;
            break;
          }
      }
      return {
        col: f - x[y] + 1,
        line: y + 1
      };
    }
    mapResolve(f) {
      return /^\w+:\/\//.test(f) ? f : s(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, g, x, y) {
      if (!this.map) return !1;
      let v = this.map.consumer(), S = v.originalPositionFor({ column: g, line: f });
      if (!S.source) return !1;
      let w;
      typeof x == "number" && (w = v.originalPositionFor({ column: y, line: x }));
      let b;
      n(S.source) ? b = i(S.source) : b = new URL(
        S.source,
        this.map.consumer().sourceRoot || i(this.map.mapFile)
      );
      let k = {
        column: S.column,
        endColumn: w && w.column,
        endLine: w && w.line,
        line: S.line,
        url: b.toString()
      };
      if (b.protocol === "file:")
        if (r)
          k.file = r(b);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let E = v.sourceContentFor(S.source);
      return E && (k.source = E), k;
    }
    toJSON() {
      let f = {};
      for (let g of ["hasBOM", "css", "file", "id"])
        this[g] != null && (f[g] = this[g]);
      return this.map && (f.map = { ...this.map }, f.map.consumerCache && (f.map.consumerCache = void 0)), f;
    }
    get from() {
      return this.file || this.id;
    }
  }
  return Br = c, c.default = c, p && p.registerInput && p.registerInput(c), Br;
}
var Wr, Xi;
function Do() {
  if (Xi) return Wr;
  Xi = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Fe, { dirname: r, relative: i, resolve: n, sep: s } = Fe, { pathToFileURL: l } = Fe, p = br(), o = !!(e && t), d = !!(r && n && i && s);
  class a {
    constructor(u, c, m, f) {
      this.stringify = u, this.mapOpts = m.map || {}, this.root = c, this.opts = m, this.css = f, this.originalCSS = f, this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute, this.memoizedFileURLs = /* @__PURE__ */ new Map(), this.memoizedPaths = /* @__PURE__ */ new Map(), this.memoizedURLs = /* @__PURE__ */ new Map();
    }
    addAnnotation() {
      let u;
      this.isInline() ? u = "data:application/json;base64," + this.toBase64(this.map.toString()) : typeof this.mapOpts.annotation == "string" ? u = this.mapOpts.annotation : typeof this.mapOpts.annotation == "function" ? u = this.mapOpts.annotation(this.opts.to, this.root) : u = this.outputFile() + ".map";
      let c = `
`;
      this.css.includes(`\r
`) && (c = `\r
`), this.css += c + "/*# sourceMappingURL=" + u + " */";
    }
    applyPrevMaps() {
      for (let u of this.previous()) {
        let c = this.toUrl(this.path(u.file)), m = u.root || r(u.file), f;
        this.mapOpts.sourcesContent === !1 ? (f = new e(u.text), f.sourcesContent && (f.sourcesContent = null)) : f = u.consumer(), this.map.applySourceMap(f, c, this.toUrl(this.path(m)));
      }
    }
    clearAnnotation() {
      if (this.mapOpts.annotation !== !1)
        if (this.root) {
          let u;
          for (let c = this.root.nodes.length - 1; c >= 0; c--)
            u = this.root.nodes[c], u.type === "comment" && u.text.indexOf("# sourceMappingURL=") === 0 && this.root.removeChild(c);
        } else this.css && (this.css = this.css.replace(/\n*?\/\*#[\S\s]*?\*\/$/gm, ""));
    }
    generate() {
      if (this.clearAnnotation(), d && o && this.isMap())
        return this.generateMap();
      {
        let u = "";
        return this.stringify(this.root, (c) => {
          u += c;
        }), [u];
      }
    }
    generateMap() {
      if (this.root)
        this.generateString();
      else if (this.previous().length === 1) {
        let u = this.previous()[0].consumer();
        u.file = this.outputFile(), this.map = t.fromSourceMap(u, {
          ignoreInvalidMapping: !0
        });
      } else
        this.map = new t({
          file: this.outputFile(),
          ignoreInvalidMapping: !0
        }), this.map.addMapping({
          generated: { column: 0, line: 1 },
          original: { column: 0, line: 1 },
          source: this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>"
        });
      return this.isSourcesContent() && this.setSourcesContent(), this.root && this.previous().length > 0 && this.applyPrevMaps(), this.isAnnotation() && this.addAnnotation(), this.isInline() ? [this.css] : [this.css, this.map];
    }
    generateString() {
      this.css = "", this.map = new t({
        file: this.outputFile(),
        ignoreInvalidMapping: !0
      });
      let u = 1, c = 1, m = "<no source>", f = {
        generated: { column: 0, line: 0 },
        original: { column: 0, line: 0 },
        source: ""
      }, g, x;
      this.stringify(this.root, (y, v, S) => {
        if (this.css += y, v && S !== "end" && (f.generated.line = u, f.generated.column = c - 1, v.source && v.source.start ? (f.source = this.sourcePath(v), f.original.line = v.source.start.line, f.original.column = v.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), g = y.match(/\n/g), g ? (u += g.length, x = y.lastIndexOf(`
`), c = y.length - x) : c += y.length, v && S !== "start") {
          let w = v.parent || { raws: {} };
          (!(v.type === "decl" || v.type === "atrule" && !v.nodes) || v !== w.last || w.raws.semicolon) && (v.source && v.source.end ? (f.source = this.sourcePath(v), f.original.line = v.source.end.line, f.original.column = v.source.end.column - 1, f.generated.line = u, f.generated.column = c - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = u, f.generated.column = c - 1, this.map.addMapping(f)));
        }
      });
    }
    isAnnotation() {
      return this.isInline() ? !0 : typeof this.mapOpts.annotation < "u" ? this.mapOpts.annotation : this.previous().length ? this.previous().some((u) => u.annotation) : !0;
    }
    isInline() {
      if (typeof this.mapOpts.inline < "u")
        return this.mapOpts.inline;
      let u = this.mapOpts.annotation;
      return typeof u < "u" && u !== !0 ? !1 : this.previous().length ? this.previous().some((c) => c.inline) : !0;
    }
    isMap() {
      return typeof this.opts.map < "u" ? !!this.opts.map : this.previous().length > 0;
    }
    isSourcesContent() {
      return typeof this.mapOpts.sourcesContent < "u" ? this.mapOpts.sourcesContent : this.previous().length ? this.previous().some((u) => u.withContent()) : !0;
    }
    outputFile() {
      return this.opts.to ? this.path(this.opts.to) : this.opts.from ? this.path(this.opts.from) : "to.css";
    }
    path(u) {
      if (this.mapOpts.absolute || u.charCodeAt(0) === 60 || /^\w+:\/\//.test(u)) return u;
      let c = this.memoizedPaths.get(u);
      if (c) return c;
      let m = this.opts.to ? r(this.opts.to) : ".";
      typeof this.mapOpts.annotation == "string" && (m = r(n(m, this.mapOpts.annotation)));
      let f = i(m, u);
      return this.memoizedPaths.set(u, f), f;
    }
    previous() {
      if (!this.previousMaps)
        if (this.previousMaps = [], this.root)
          this.root.walk((u) => {
            if (u.source && u.source.input.map) {
              let c = u.source.input.map;
              this.previousMaps.includes(c) || this.previousMaps.push(c);
            }
          });
        else {
          let u = new p(this.originalCSS, this.opts);
          u.map && this.previousMaps.push(u.map);
        }
      return this.previousMaps;
    }
    setSourcesContent() {
      let u = {};
      if (this.root)
        this.root.walk((c) => {
          if (c.source) {
            let m = c.source.input.from;
            if (m && !u[m]) {
              u[m] = !0;
              let f = this.usesFileUrls ? this.toFileUrl(m) : this.toUrl(this.path(m));
              this.map.setSourceContent(f, c.source.input.css);
            }
          }
        });
      else if (this.css) {
        let c = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
        this.map.setSourceContent(c, this.css);
      }
    }
    sourcePath(u) {
      return this.mapOpts.from ? this.toUrl(this.mapOpts.from) : this.usesFileUrls ? this.toFileUrl(u.source.input.from) : this.toUrl(this.path(u.source.input.from));
    }
    toBase64(u) {
      return Buffer ? Buffer.from(u).toString("base64") : window.btoa(unescape(encodeURIComponent(u)));
    }
    toFileUrl(u) {
      let c = this.memoizedFileURLs.get(u);
      if (c) return c;
      if (l) {
        let m = l(u).toString();
        return this.memoizedFileURLs.set(u, m), m;
      } else
        throw new Error(
          "`map.absolute` option is not available in this PostCSS build"
        );
    }
    toUrl(u) {
      let c = this.memoizedURLs.get(u);
      if (c) return c;
      s === "\\" && (u = u.replace(/\\/g, "/"));
      let m = encodeURI(u).replace(/[#?]/g, encodeURIComponent);
      return this.memoizedURLs.set(u, m), m;
    }
  }
  return Wr = a, Wr;
}
var jr, Ji;
function vr() {
  if (Ji) return jr;
  Ji = 1;
  let e = gr();
  class t extends e {
    constructor(i) {
      super(i), this.type = "comment";
    }
  }
  return jr = t, t.default = t, jr;
}
var qr, Ki;
function lt() {
  if (Ki) return qr;
  Ki = 1;
  let { isClean: e, my: t } = ei(), r = yr(), i = vr(), n = gr(), s, l, p, o;
  function d(u) {
    return u.map((c) => (c.nodes && (c.nodes = d(c.nodes)), delete c.source, c));
  }
  function a(u) {
    if (u[e] = !1, u.proxyOf.nodes)
      for (let c of u.proxyOf.nodes)
        a(c);
  }
  class h extends n {
    append(...c) {
      for (let m of c) {
        let f = this.normalize(m, this.last);
        for (let g of f) this.proxyOf.nodes.push(g);
      }
      return this.markDirty(), this;
    }
    cleanRaws(c) {
      if (super.cleanRaws(c), this.nodes)
        for (let m of this.nodes) m.cleanRaws(c);
    }
    each(c) {
      if (!this.proxyOf.nodes) return;
      let m = this.getIterator(), f, g;
      for (; this.indexes[m] < this.proxyOf.nodes.length && (f = this.indexes[m], g = c(this.proxyOf.nodes[f], f), g !== !1); )
        this.indexes[m] += 1;
      return delete this.indexes[m], g;
    }
    every(c) {
      return this.nodes.every(c);
    }
    getIterator() {
      this.lastEach || (this.lastEach = 0), this.indexes || (this.indexes = {}), this.lastEach += 1;
      let c = this.lastEach;
      return this.indexes[c] = 0, c;
    }
    getProxyProcessor() {
      return {
        get(c, m) {
          return m === "proxyOf" ? c : c[m] ? m === "each" || typeof m == "string" && m.startsWith("walk") ? (...f) => c[m](
            ...f.map((g) => typeof g == "function" ? (x, y) => g(x.toProxy(), y) : g)
          ) : m === "every" || m === "some" ? (f) => c[m](
            (g, ...x) => f(g.toProxy(), ...x)
          ) : m === "root" ? () => c.root().toProxy() : m === "nodes" ? c.nodes.map((f) => f.toProxy()) : m === "first" || m === "last" ? c[m].toProxy() : c[m] : c[m];
        },
        set(c, m, f) {
          return c[m] === f || (c[m] = f, (m === "name" || m === "params" || m === "selector") && c.markDirty()), !0;
        }
      };
    }
    index(c) {
      return typeof c == "number" ? c : (c.proxyOf && (c = c.proxyOf), this.proxyOf.nodes.indexOf(c));
    }
    insertAfter(c, m) {
      let f = this.index(c), g = this.normalize(m, this.proxyOf.nodes[f]).reverse();
      f = this.index(c);
      for (let y of g) this.proxyOf.nodes.splice(f + 1, 0, y);
      let x;
      for (let y in this.indexes)
        x = this.indexes[y], f < x && (this.indexes[y] = x + g.length);
      return this.markDirty(), this;
    }
    insertBefore(c, m) {
      let f = this.index(c), g = f === 0 ? "prepend" : !1, x = this.normalize(m, this.proxyOf.nodes[f], g).reverse();
      f = this.index(c);
      for (let v of x) this.proxyOf.nodes.splice(f, 0, v);
      let y;
      for (let v in this.indexes)
        y = this.indexes[v], f <= y && (this.indexes[v] = y + x.length);
      return this.markDirty(), this;
    }
    normalize(c, m) {
      if (typeof c == "string")
        c = d(s(c).nodes);
      else if (typeof c > "u")
        c = [];
      else if (Array.isArray(c)) {
        c = c.slice(0);
        for (let g of c)
          g.parent && g.parent.removeChild(g, "ignore");
      } else if (c.type === "root" && this.type !== "document") {
        c = c.nodes.slice(0);
        for (let g of c)
          g.parent && g.parent.removeChild(g, "ignore");
      } else if (c.type)
        c = [c];
      else if (c.prop) {
        if (typeof c.value > "u")
          throw new Error("Value field is missed in node creation");
        typeof c.value != "string" && (c.value = String(c.value)), c = [new r(c)];
      } else if (c.selector)
        c = [new l(c)];
      else if (c.name)
        c = [new p(c)];
      else if (c.text)
        c = [new i(c)];
      else
        throw new Error("Unknown node type in node creation");
      return c.map((g) => (g[t] || h.rebuild(g), g = g.proxyOf, g.parent && g.parent.removeChild(g), g[e] && a(g), typeof g.raws.before > "u" && m && typeof m.raws.before < "u" && (g.raws.before = m.raws.before.replace(/\S/g, "")), g.parent = this.proxyOf, g));
    }
    prepend(...c) {
      c = c.reverse();
      for (let m of c) {
        let f = this.normalize(m, this.first, "prepend").reverse();
        for (let g of f) this.proxyOf.nodes.unshift(g);
        for (let g in this.indexes)
          this.indexes[g] = this.indexes[g] + f.length;
      }
      return this.markDirty(), this;
    }
    push(c) {
      return c.parent = this, this.proxyOf.nodes.push(c), this;
    }
    removeAll() {
      for (let c of this.proxyOf.nodes) c.parent = void 0;
      return this.proxyOf.nodes = [], this.markDirty(), this;
    }
    removeChild(c) {
      c = this.index(c), this.proxyOf.nodes[c].parent = void 0, this.proxyOf.nodes.splice(c, 1);
      let m;
      for (let f in this.indexes)
        m = this.indexes[f], m >= c && (this.indexes[f] = m - 1);
      return this.markDirty(), this;
    }
    replaceValues(c, m, f) {
      return f || (f = m, m = {}), this.walkDecls((g) => {
        m.props && !m.props.includes(g.prop) || m.fast && !g.value.includes(m.fast) || (g.value = g.value.replace(c, f));
      }), this.markDirty(), this;
    }
    some(c) {
      return this.nodes.some(c);
    }
    walk(c) {
      return this.each((m, f) => {
        let g;
        try {
          g = c(m, f);
        } catch (x) {
          throw m.addToError(x);
        }
        return g !== !1 && m.walk && (g = m.walk(c)), g;
      });
    }
    walkAtRules(c, m) {
      return m ? c instanceof RegExp ? this.walk((f, g) => {
        if (f.type === "atrule" && c.test(f.name))
          return m(f, g);
      }) : this.walk((f, g) => {
        if (f.type === "atrule" && f.name === c)
          return m(f, g);
      }) : (m = c, this.walk((f, g) => {
        if (f.type === "atrule")
          return m(f, g);
      }));
    }
    walkComments(c) {
      return this.walk((m, f) => {
        if (m.type === "comment")
          return c(m, f);
      });
    }
    walkDecls(c, m) {
      return m ? c instanceof RegExp ? this.walk((f, g) => {
        if (f.type === "decl" && c.test(f.prop))
          return m(f, g);
      }) : this.walk((f, g) => {
        if (f.type === "decl" && f.prop === c)
          return m(f, g);
      }) : (m = c, this.walk((f, g) => {
        if (f.type === "decl")
          return m(f, g);
      }));
    }
    walkRules(c, m) {
      return m ? c instanceof RegExp ? this.walk((f, g) => {
        if (f.type === "rule" && c.test(f.selector))
          return m(f, g);
      }) : this.walk((f, g) => {
        if (f.type === "rule" && f.selector === c)
          return m(f, g);
      }) : (m = c, this.walk((f, g) => {
        if (f.type === "rule")
          return m(f, g);
      }));
    }
    get first() {
      if (this.proxyOf.nodes)
        return this.proxyOf.nodes[0];
    }
    get last() {
      if (this.proxyOf.nodes)
        return this.proxyOf.nodes[this.proxyOf.nodes.length - 1];
    }
  }
  return h.registerParse = (u) => {
    s = u;
  }, h.registerRule = (u) => {
    l = u;
  }, h.registerAtRule = (u) => {
    p = u;
  }, h.registerRoot = (u) => {
    o = u;
  }, qr = h, h.default = h, h.rebuild = (u) => {
    u.type === "atrule" ? Object.setPrototypeOf(u, p.prototype) : u.type === "rule" ? Object.setPrototypeOf(u, l.prototype) : u.type === "decl" ? Object.setPrototypeOf(u, r.prototype) : u.type === "comment" ? Object.setPrototypeOf(u, i.prototype) : u.type === "root" && Object.setPrototypeOf(u, o.prototype), u[t] = !0, u.nodes && u.nodes.forEach((c) => {
      h.rebuild(c);
    });
  }, qr;
}
var Hr, Zi;
function ti() {
  if (Zi) return Hr;
  Zi = 1;
  let e = lt(), t, r;
  class i extends e {
    constructor(s) {
      super({ type: "document", ...s }), this.nodes || (this.nodes = []);
    }
    toResult(s = {}) {
      return new t(new r(), this, s).stringify();
    }
  }
  return i.registerLazyResult = (n) => {
    t = n;
  }, i.registerProcessor = (n) => {
    r = n;
  }, Hr = i, i.default = i, Hr;
}
var Vr, Qi;
function zo() {
  if (Qi) return Vr;
  Qi = 1;
  let e = {};
  return Vr = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, Vr;
}
var Gr, es;
function Fo() {
  if (es) return Gr;
  es = 1;
  class e {
    constructor(r, i = {}) {
      if (this.type = "warning", this.text = r, i.node && i.node.source) {
        let n = i.node.rangeBy(i);
        this.line = n.start.line, this.column = n.start.column, this.endLine = n.end.line, this.endColumn = n.end.column;
      }
      for (let n in i) this[n] = i[n];
    }
    toString() {
      return this.node ? this.node.error(this.text, {
        index: this.index,
        plugin: this.plugin,
        word: this.word
      }).message : this.plugin ? this.plugin + ": " + this.text : this.text;
    }
  }
  return Gr = e, e.default = e, Gr;
}
var Yr, ts;
function ri() {
  if (ts) return Yr;
  ts = 1;
  let e = Fo();
  class t {
    constructor(i, n, s) {
      this.processor = i, this.messages = [], this.root = n, this.opts = s, this.css = void 0, this.map = void 0;
    }
    toString() {
      return this.css;
    }
    warn(i, n = {}) {
      n.plugin || this.lastPlugin && this.lastPlugin.postcssPlugin && (n.plugin = this.lastPlugin.postcssPlugin);
      let s = new e(i, n);
      return this.messages.push(s), s;
    }
    warnings() {
      return this.messages.filter((i) => i.type === "warning");
    }
    get content() {
      return this.css;
    }
  }
  return Yr = t, t.default = t, Yr;
}
var Xr, rs;
function xu() {
  if (rs) return Xr;
  rs = 1;
  const e = 39, t = 34, r = 92, i = 47, n = 10, s = 32, l = 12, p = 9, o = 13, d = 91, a = 93, h = 40, u = 41, c = 123, m = 125, f = 59, g = 42, x = 58, y = 64, v = /[\t\n\f\r "#'()/;[\\\]{}]/g, S = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, w = /.[\r\n"'(/\\]/, b = /[\da-f]/i;
  return Xr = function(E, A = {}) {
    let M = E.css.valueOf(), _ = A.ignoreErrors, P, C, we, he, j, B, K, ee, ie, q, Ie = M.length, O = 0, le = [], ce = [];
    function Ae() {
      return O;
    }
    function de($) {
      throw E.error("Unclosed " + $, O);
    }
    function xe() {
      return ce.length === 0 && O >= Ie;
    }
    function Le($) {
      if (ce.length) return ce.pop();
      if (O >= Ie) return;
      let se = $ ? $.ignoreUnclosed : !1;
      switch (P = M.charCodeAt(O), P) {
        case n:
        case s:
        case p:
        case o:
        case l: {
          C = O;
          do
            C += 1, P = M.charCodeAt(C);
          while (P === s || P === n || P === p || P === o || P === l);
          q = ["space", M.slice(O, C)], O = C - 1;
          break;
        }
        case d:
        case a:
        case c:
        case m:
        case x:
        case f:
        case u: {
          let R = String.fromCharCode(P);
          q = [R, R, O];
          break;
        }
        case h: {
          if (ee = le.length ? le.pop()[1] : "", ie = M.charCodeAt(O + 1), ee === "url" && ie !== e && ie !== t && ie !== s && ie !== n && ie !== p && ie !== l && ie !== o) {
            C = O;
            do {
              if (B = !1, C = M.indexOf(")", C + 1), C === -1)
                if (_ || se) {
                  C = O;
                  break;
                } else
                  de("bracket");
              for (K = C; M.charCodeAt(K - 1) === r; )
                K -= 1, B = !B;
            } while (B);
            q = ["brackets", M.slice(O, C + 1), O, C], O = C;
          } else
            C = M.indexOf(")", O + 1), he = M.slice(O, C + 1), C === -1 || w.test(he) ? q = ["(", "(", O] : (q = ["brackets", he, O, C], O = C);
          break;
        }
        case e:
        case t: {
          we = P === e ? "'" : '"', C = O;
          do {
            if (B = !1, C = M.indexOf(we, C + 1), C === -1)
              if (_ || se) {
                C = O + 1;
                break;
              } else
                de("string");
            for (K = C; M.charCodeAt(K - 1) === r; )
              K -= 1, B = !B;
          } while (B);
          q = ["string", M.slice(O, C + 1), O, C], O = C;
          break;
        }
        case y: {
          v.lastIndex = O + 1, v.test(M), v.lastIndex === 0 ? C = M.length - 1 : C = v.lastIndex - 2, q = ["at-word", M.slice(O, C + 1), O, C], O = C;
          break;
        }
        case r: {
          for (C = O, j = !0; M.charCodeAt(C + 1) === r; )
            C += 1, j = !j;
          if (P = M.charCodeAt(C + 1), j && P !== i && P !== s && P !== n && P !== p && P !== o && P !== l && (C += 1, b.test(M.charAt(C)))) {
            for (; b.test(M.charAt(C + 1)); )
              C += 1;
            M.charCodeAt(C + 1) === s && (C += 1);
          }
          q = ["word", M.slice(O, C + 1), O, C], O = C;
          break;
        }
        default: {
          P === i && M.charCodeAt(O + 1) === g ? (C = M.indexOf("*/", O + 2) + 1, C === 0 && (_ || se ? C = M.length : de("comment")), q = ["comment", M.slice(O, C + 1), O, C], O = C) : (S.lastIndex = O + 1, S.test(M), S.lastIndex === 0 ? C = M.length - 1 : C = S.lastIndex - 2, q = ["word", M.slice(O, C + 1), O, C], le.push(q), O = C);
          break;
        }
      }
      return O++, q;
    }
    function Te($) {
      ce.push($);
    }
    return {
      back: Te,
      endOfFile: xe,
      nextToken: Le,
      position: Ae
    };
  }, Xr;
}
var Jr, ns;
function ni() {
  if (ns) return Jr;
  ns = 1;
  let e = lt();
  class t extends e {
    constructor(i) {
      super(i), this.type = "atrule";
    }
    append(...i) {
      return this.proxyOf.nodes || (this.nodes = []), super.append(...i);
    }
    prepend(...i) {
      return this.proxyOf.nodes || (this.nodes = []), super.prepend(...i);
    }
  }
  return Jr = t, t.default = t, e.registerAtRule(t), Jr;
}
var Kr, is;
function $t() {
  if (is) return Kr;
  is = 1;
  let e = lt(), t, r;
  class i extends e {
    constructor(s) {
      super(s), this.type = "root", this.nodes || (this.nodes = []);
    }
    normalize(s, l, p) {
      let o = super.normalize(s);
      if (l) {
        if (p === "prepend")
          this.nodes.length > 1 ? l.raws.before = this.nodes[1].raws.before : delete l.raws.before;
        else if (this.first !== l)
          for (let d of o)
            d.raws.before = l.raws.before;
      }
      return o;
    }
    removeChild(s, l) {
      let p = this.index(s);
      return !l && p === 0 && this.nodes.length > 1 && (this.nodes[1].raws.before = this.nodes[p].raws.before), super.removeChild(s);
    }
    toResult(s = {}) {
      return new t(new r(), this, s).stringify();
    }
  }
  return i.registerLazyResult = (n) => {
    t = n;
  }, i.registerProcessor = (n) => {
    r = n;
  }, Kr = i, i.default = i, e.registerRoot(i), Kr;
}
var Zr, ss;
function Uo() {
  if (ss) return Zr;
  ss = 1;
  let e = {
    comma(t) {
      return e.split(t, [","], !0);
    },
    space(t) {
      let r = [" ", `
`, "	"];
      return e.split(t, r);
    },
    split(t, r, i) {
      let n = [], s = "", l = !1, p = 0, o = !1, d = "", a = !1;
      for (let h of t)
        a ? a = !1 : h === "\\" ? a = !0 : o ? h === d && (o = !1) : h === '"' || h === "'" ? (o = !0, d = h) : h === "(" ? p += 1 : h === ")" ? p > 0 && (p -= 1) : p === 0 && r.includes(h) && (l = !0), l ? (s !== "" && n.push(s.trim()), s = "", l = !1) : s += h;
      return (i || s !== "") && n.push(s.trim()), n;
    }
  };
  return Zr = e, e.default = e, Zr;
}
var Qr, os;
function ii() {
  if (os) return Qr;
  os = 1;
  let e = lt(), t = Uo();
  class r extends e {
    constructor(n) {
      super(n), this.type = "rule", this.nodes || (this.nodes = []);
    }
    get selectors() {
      return t.comma(this.selector);
    }
    set selectors(n) {
      let s = this.selector ? this.selector.match(/,\s*/) : null, l = s ? s[0] : "," + this.raw("between", "beforeOpen");
      this.selector = n.join(l);
    }
  }
  return Qr = r, r.default = r, e.registerRule(r), Qr;
}
var en, as;
function ku() {
  if (as) return en;
  as = 1;
  let e = yr(), t = xu(), r = vr(), i = ni(), n = $t(), s = ii();
  const l = {
    empty: !0,
    space: !0
  };
  function p(d) {
    for (let a = d.length - 1; a >= 0; a--) {
      let h = d[a], u = h[3] || h[2];
      if (u) return u;
    }
  }
  class o {
    constructor(a) {
      this.input = a, this.root = new n(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.createTokenizer(), this.root.source = { input: a, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(a) {
      let h = new i();
      h.name = a[1].slice(1), h.name === "" && this.unnamedAtrule(h, a), this.init(h, a[2]);
      let u, c, m, f = !1, g = !1, x = [], y = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (a = this.tokenizer.nextToken(), u = a[0], u === "(" || u === "[" ? y.push(u === "(" ? ")" : "]") : u === "{" && y.length > 0 ? y.push("}") : u === y[y.length - 1] && y.pop(), y.length === 0)
          if (u === ";") {
            h.source.end = this.getPosition(a[2]), h.source.end.offset++, this.semicolon = !0;
            break;
          } else if (u === "{") {
            g = !0;
            break;
          } else if (u === "}") {
            if (x.length > 0) {
              for (m = x.length - 1, c = x[m]; c && c[0] === "space"; )
                c = x[--m];
              c && (h.source.end = this.getPosition(c[3] || c[2]), h.source.end.offset++);
            }
            this.end(a);
            break;
          } else
            x.push(a);
        else
          x.push(a);
        if (this.tokenizer.endOfFile()) {
          f = !0;
          break;
        }
      }
      h.raws.between = this.spacesAndCommentsFromEnd(x), x.length ? (h.raws.afterName = this.spacesAndCommentsFromStart(x), this.raw(h, "params", x), f && (a = x[x.length - 1], h.source.end = this.getPosition(a[3] || a[2]), h.source.end.offset++, this.spaces = h.raws.between, h.raws.between = "")) : (h.raws.afterName = "", h.params = ""), g && (h.nodes = [], this.current = h);
    }
    checkMissedSemicolon(a) {
      let h = this.colon(a);
      if (h === !1) return;
      let u = 0, c;
      for (let m = h - 1; m >= 0 && (c = a[m], !(c[0] !== "space" && (u += 1, u === 2))); m--)
        ;
      throw this.input.error(
        "Missed semicolon",
        c[0] === "word" ? c[3] + 1 : c[2]
      );
    }
    colon(a) {
      let h = 0, u, c, m;
      for (let [f, g] of a.entries()) {
        if (u = g, c = u[0], c === "(" && (h += 1), c === ")" && (h -= 1), h === 0 && c === ":")
          if (!m)
            this.doubleColon(u);
          else {
            if (m[0] === "word" && m[1] === "progid")
              continue;
            return f;
          }
        m = u;
      }
      return !1;
    }
    comment(a) {
      let h = new r();
      this.init(h, a[2]), h.source.end = this.getPosition(a[3] || a[2]), h.source.end.offset++;
      let u = a[1].slice(2, -2);
      if (/^\s*$/.test(u))
        h.text = "", h.raws.left = u, h.raws.right = "";
      else {
        let c = u.match(/^(\s*)([^]*\S)(\s*)$/);
        h.text = c[2], h.raws.left = c[1], h.raws.right = c[3];
      }
    }
    createTokenizer() {
      this.tokenizer = t(this.input);
    }
    decl(a, h) {
      let u = new e();
      this.init(u, a[0][2]);
      let c = a[a.length - 1];
      for (c[0] === ";" && (this.semicolon = !0, a.pop()), u.source.end = this.getPosition(
        c[3] || c[2] || p(a)
      ), u.source.end.offset++; a[0][0] !== "word"; )
        a.length === 1 && this.unknownWord(a), u.raws.before += a.shift()[1];
      for (u.source.start = this.getPosition(a[0][2]), u.prop = ""; a.length; ) {
        let y = a[0][0];
        if (y === ":" || y === "space" || y === "comment")
          break;
        u.prop += a.shift()[1];
      }
      u.raws.between = "";
      let m;
      for (; a.length; )
        if (m = a.shift(), m[0] === ":") {
          u.raws.between += m[1];
          break;
        } else
          m[0] === "word" && /\w/.test(m[1]) && this.unknownWord([m]), u.raws.between += m[1];
      (u.prop[0] === "_" || u.prop[0] === "*") && (u.raws.before += u.prop[0], u.prop = u.prop.slice(1));
      let f = [], g;
      for (; a.length && (g = a[0][0], !(g !== "space" && g !== "comment")); )
        f.push(a.shift());
      this.precheckMissedSemicolon(a);
      for (let y = a.length - 1; y >= 0; y--) {
        if (m = a[y], m[1].toLowerCase() === "!important") {
          u.important = !0;
          let v = this.stringFrom(a, y);
          v = this.spacesFromEnd(a) + v, v !== " !important" && (u.raws.important = v);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let v = a.slice(0), S = "";
          for (let w = y; w > 0; w--) {
            let b = v[w][0];
            if (S.trim().indexOf("!") === 0 && b !== "space")
              break;
            S = v.pop()[1] + S;
          }
          S.trim().indexOf("!") === 0 && (u.important = !0, u.raws.important = S, a = v);
        }
        if (m[0] !== "space" && m[0] !== "comment")
          break;
      }
      a.some((y) => y[0] !== "space" && y[0] !== "comment") && (u.raws.between += f.map((y) => y[1]).join(""), f = []), this.raw(u, "value", f.concat(a), h), u.value.includes(":") && !h && this.checkMissedSemicolon(a);
    }
    doubleColon(a) {
      throw this.input.error(
        "Double colon",
        { offset: a[2] },
        { offset: a[2] + a[1].length }
      );
    }
    emptyRule(a) {
      let h = new s();
      this.init(h, a[2]), h.selector = "", h.raws.between = "", this.current = h;
    }
    end(a) {
      this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.semicolon = !1, this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.spaces = "", this.current.parent ? (this.current.source.end = this.getPosition(a[2]), this.current.source.end.offset++, this.current = this.current.parent) : this.unexpectedClose(a);
    }
    endFile() {
      this.current.parent && this.unclosedBlock(), this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.root.source.end = this.getPosition(this.tokenizer.position());
    }
    freeSemicolon(a) {
      if (this.spaces += a[1], this.current.nodes) {
        let h = this.current.nodes[this.current.nodes.length - 1];
        h && h.type === "rule" && !h.raws.ownSemicolon && (h.raws.ownSemicolon = this.spaces, this.spaces = "");
      }
    }
    // Helpers
    getPosition(a) {
      let h = this.input.fromOffset(a);
      return {
        column: h.col,
        line: h.line,
        offset: a
      };
    }
    init(a, h) {
      this.current.push(a), a.source = {
        input: this.input,
        start: this.getPosition(h)
      }, a.raws.before = this.spaces, this.spaces = "", a.type !== "comment" && (this.semicolon = !1);
    }
    other(a) {
      let h = !1, u = null, c = !1, m = null, f = [], g = a[1].startsWith("--"), x = [], y = a;
      for (; y; ) {
        if (u = y[0], x.push(y), u === "(" || u === "[")
          m || (m = y), f.push(u === "(" ? ")" : "]");
        else if (g && c && u === "{")
          m || (m = y), f.push("}");
        else if (f.length === 0)
          if (u === ";")
            if (c) {
              this.decl(x, g);
              return;
            } else
              break;
          else if (u === "{") {
            this.rule(x);
            return;
          } else if (u === "}") {
            this.tokenizer.back(x.pop()), h = !0;
            break;
          } else u === ":" && (c = !0);
        else u === f[f.length - 1] && (f.pop(), f.length === 0 && (m = null));
        y = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(m), h && c) {
        if (!g)
          for (; x.length && (y = x[x.length - 1][0], !(y !== "space" && y !== "comment")); )
            this.tokenizer.back(x.pop());
        this.decl(x, g);
      } else
        this.unknownWord(x);
    }
    parse() {
      let a;
      for (; !this.tokenizer.endOfFile(); )
        switch (a = this.tokenizer.nextToken(), a[0]) {
          case "space":
            this.spaces += a[1];
            break;
          case ";":
            this.freeSemicolon(a);
            break;
          case "}":
            this.end(a);
            break;
          case "comment":
            this.comment(a);
            break;
          case "at-word":
            this.atrule(a);
            break;
          case "{":
            this.emptyRule(a);
            break;
          default:
            this.other(a);
            break;
        }
      this.endFile();
    }
    precheckMissedSemicolon() {
    }
    raw(a, h, u, c) {
      let m, f, g = u.length, x = "", y = !0, v, S;
      for (let w = 0; w < g; w += 1)
        m = u[w], f = m[0], f === "space" && w === g - 1 && !c ? y = !1 : f === "comment" ? (S = u[w - 1] ? u[w - 1][0] : "empty", v = u[w + 1] ? u[w + 1][0] : "empty", !l[S] && !l[v] ? x.slice(-1) === "," ? y = !1 : x += m[1] : y = !1) : x += m[1];
      if (!y) {
        let w = u.reduce((b, k) => b + k[1], "");
        a.raws[h] = { raw: w, value: x };
      }
      a[h] = x;
    }
    rule(a) {
      a.pop();
      let h = new s();
      this.init(h, a[0][2]), h.raws.between = this.spacesAndCommentsFromEnd(a), this.raw(h, "selector", a), this.current = h;
    }
    spacesAndCommentsFromEnd(a) {
      let h, u = "";
      for (; a.length && (h = a[a.length - 1][0], !(h !== "space" && h !== "comment")); )
        u = a.pop()[1] + u;
      return u;
    }
    // Errors
    spacesAndCommentsFromStart(a) {
      let h, u = "";
      for (; a.length && (h = a[0][0], !(h !== "space" && h !== "comment")); )
        u += a.shift()[1];
      return u;
    }
    spacesFromEnd(a) {
      let h, u = "";
      for (; a.length && (h = a[a.length - 1][0], h === "space"); )
        u = a.pop()[1] + u;
      return u;
    }
    stringFrom(a, h) {
      let u = "";
      for (let c = h; c < a.length; c++)
        u += a[c][1];
      return a.splice(h, a.length - h), u;
    }
    unclosedBlock() {
      let a = this.current.source.start;
      throw this.input.error("Unclosed block", a.line, a.column);
    }
    unclosedBracket(a) {
      throw this.input.error(
        "Unclosed bracket",
        { offset: a[2] },
        { offset: a[2] + 1 }
      );
    }
    unexpectedClose(a) {
      throw this.input.error(
        "Unexpected }",
        { offset: a[2] },
        { offset: a[2] + 1 }
      );
    }
    unknownWord(a) {
      throw this.input.error(
        "Unknown word",
        { offset: a[0][2] },
        { offset: a[0][2] + a[0][1].length }
      );
    }
    unnamedAtrule(a, h) {
      throw this.input.error(
        "At-rule without name",
        { offset: h[2] },
        { offset: h[2] + h[1].length }
      );
    }
  }
  return en = o, en;
}
var tn, ls;
function si() {
  if (ls) return tn;
  ls = 1;
  let e = lt(), t = ku(), r = br();
  function i(n, s) {
    let l = new r(n, s), p = new t(l);
    try {
      p.parse();
    } catch (o) {
      throw process.env.NODE_ENV !== "production" && o.name === "CssSyntaxError" && s && s.from && (/\.scss$/i.test(s.from) ? o.message += `
You tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser` : /\.sass/i.test(s.from) ? o.message += `
You tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser` : /\.less$/i.test(s.from) && (o.message += `
You tried to parse Less with the standard CSS parser; try again with the postcss-less parser`)), o;
    }
    return p.root;
  }
  return tn = i, i.default = i, e.registerParse(i), tn;
}
var rn, cs;
function Bo() {
  if (cs) return rn;
  cs = 1;
  let { isClean: e, my: t } = ei(), r = Do(), i = mr(), n = lt(), s = ti(), l = zo(), p = ri(), o = si(), d = $t();
  const a = {
    atrule: "AtRule",
    comment: "Comment",
    decl: "Declaration",
    document: "Document",
    root: "Root",
    rule: "Rule"
  }, h = {
    AtRule: !0,
    AtRuleExit: !0,
    Comment: !0,
    CommentExit: !0,
    Declaration: !0,
    DeclarationExit: !0,
    Document: !0,
    DocumentExit: !0,
    Once: !0,
    OnceExit: !0,
    postcssPlugin: !0,
    prepare: !0,
    Root: !0,
    RootExit: !0,
    Rule: !0,
    RuleExit: !0
  }, u = {
    Once: !0,
    postcssPlugin: !0,
    prepare: !0
  }, c = 0;
  function m(S) {
    return typeof S == "object" && typeof S.then == "function";
  }
  function f(S) {
    let w = !1, b = a[S.type];
    return S.type === "decl" ? w = S.prop.toLowerCase() : S.type === "atrule" && (w = S.name.toLowerCase()), w && S.append ? [
      b,
      b + "-" + w,
      c,
      b + "Exit",
      b + "Exit-" + w
    ] : w ? [b, b + "-" + w, b + "Exit", b + "Exit-" + w] : S.append ? [b, c, b + "Exit"] : [b, b + "Exit"];
  }
  function g(S) {
    let w;
    return S.type === "document" ? w = ["Document", c, "DocumentExit"] : S.type === "root" ? w = ["Root", c, "RootExit"] : w = f(S), {
      eventIndex: 0,
      events: w,
      iterator: 0,
      node: S,
      visitorIndex: 0,
      visitors: []
    };
  }
  function x(S) {
    return S[e] = !1, S.nodes && S.nodes.forEach((w) => x(w)), S;
  }
  let y = {};
  class v {
    constructor(w, b, k) {
      this.stringified = !1, this.processed = !1;
      let E;
      if (typeof b == "object" && b !== null && (b.type === "root" || b.type === "document"))
        E = x(b);
      else if (b instanceof v || b instanceof p)
        E = x(b.root), b.map && (typeof k.map > "u" && (k.map = {}), k.map.inline || (k.map.inline = !1), k.map.prev = b.map);
      else {
        let A = o;
        k.syntax && (A = k.syntax.parse), k.parser && (A = k.parser), A.parse && (A = A.parse);
        try {
          E = A(b, k);
        } catch (M) {
          this.processed = !0, this.error = M;
        }
        E && !E[t] && n.rebuild(E);
      }
      this.result = new p(w, E, k), this.helpers = { ...y, postcss: y, result: this.result }, this.plugins = this.processor.plugins.map((A) => typeof A == "object" && A.prepare ? { ...A, ...A.prepare(this.result) } : A);
    }
    async() {
      return this.error ? Promise.reject(this.error) : this.processed ? Promise.resolve(this.result) : (this.processing || (this.processing = this.runAsync()), this.processing);
    }
    catch(w) {
      return this.async().catch(w);
    }
    finally(w) {
      return this.async().then(w, w);
    }
    getAsyncError() {
      throw new Error("Use process(css).then(cb) to work with async plugins");
    }
    handleError(w, b) {
      let k = this.result.lastPlugin;
      try {
        if (b && b.addToError(w), this.error = w, w.name === "CssSyntaxError" && !w.plugin)
          w.plugin = k.postcssPlugin, w.setMessage();
        else if (k.postcssVersion && process.env.NODE_ENV !== "production") {
          let E = k.postcssPlugin, A = k.postcssVersion, M = this.result.processor.version, _ = A.split("."), P = M.split(".");
          (_[0] !== P[0] || parseInt(_[1]) > parseInt(P[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + M + ", but " + E + " uses " + A + ". Perhaps this is the source of the error below."
          );
        }
      } catch (E) {
        console && console.error && console.error(E);
      }
      return w;
    }
    prepareVisitors() {
      this.listeners = {};
      let w = (b, k, E) => {
        this.listeners[k] || (this.listeners[k] = []), this.listeners[k].push([b, E]);
      };
      for (let b of this.plugins)
        if (typeof b == "object")
          for (let k in b) {
            if (!h[k] && /^[A-Z]/.test(k))
              throw new Error(
                `Unknown event ${k} in ${b.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!u[k])
              if (typeof b[k] == "object")
                for (let E in b[k])
                  E === "*" ? w(b, k, b[k][E]) : w(
                    b,
                    k + "-" + E.toLowerCase(),
                    b[k][E]
                  );
              else typeof b[k] == "function" && w(b, k, b[k]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let w = 0; w < this.plugins.length; w++) {
        let b = this.plugins[w], k = this.runOnRoot(b);
        if (m(k))
          try {
            await k;
          } catch (E) {
            throw this.handleError(E);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let w = this.result.root;
        for (; !w[e]; ) {
          w[e] = !0;
          let b = [g(w)];
          for (; b.length > 0; ) {
            let k = this.visitTick(b);
            if (m(k))
              try {
                await k;
              } catch (E) {
                let A = b[b.length - 1].node;
                throw this.handleError(E, A);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [b, k] of this.listeners.OnceExit) {
            this.result.lastPlugin = b;
            try {
              if (w.type === "document") {
                let E = w.nodes.map(
                  (A) => k(A, this.helpers)
                );
                await Promise.all(E);
              } else
                await k(w, this.helpers);
            } catch (E) {
              throw this.handleError(E);
            }
          }
      }
      return this.processed = !0, this.stringify();
    }
    runOnRoot(w) {
      this.result.lastPlugin = w;
      try {
        if (typeof w == "object" && w.Once) {
          if (this.result.root.type === "document") {
            let b = this.result.root.nodes.map(
              (k) => w.Once(k, this.helpers)
            );
            return m(b[0]) ? Promise.all(b) : b;
          }
          return w.Once(this.result.root, this.helpers);
        } else if (typeof w == "function")
          return w(this.result.root, this.result);
      } catch (b) {
        throw this.handleError(b);
      }
    }
    stringify() {
      if (this.error) throw this.error;
      if (this.stringified) return this.result;
      this.stringified = !0, this.sync();
      let w = this.result.opts, b = i;
      w.syntax && (b = w.syntax.stringify), w.stringifier && (b = w.stringifier), b.stringify && (b = b.stringify);
      let E = new r(b, this.result.root, this.result.opts).generate();
      return this.result.css = E[0], this.result.map = E[1], this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      if (this.processed = !0, this.processing)
        throw this.getAsyncError();
      for (let w of this.plugins) {
        let b = this.runOnRoot(w);
        if (m(b))
          throw this.getAsyncError();
      }
      if (this.prepareVisitors(), this.hasListener) {
        let w = this.result.root;
        for (; !w[e]; )
          w[e] = !0, this.walkSync(w);
        if (this.listeners.OnceExit)
          if (w.type === "document")
            for (let b of w.nodes)
              this.visitSync(this.listeners.OnceExit, b);
          else
            this.visitSync(this.listeners.OnceExit, w);
      }
      return this.result;
    }
    then(w, b) {
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || l(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(w, b);
    }
    toString() {
      return this.css;
    }
    visitSync(w, b) {
      for (let [k, E] of w) {
        this.result.lastPlugin = k;
        let A;
        try {
          A = E(b, this.helpers);
        } catch (M) {
          throw this.handleError(M, b.proxyOf);
        }
        if (b.type !== "root" && b.type !== "document" && !b.parent)
          return !0;
        if (m(A))
          throw this.getAsyncError();
      }
    }
    visitTick(w) {
      let b = w[w.length - 1], { node: k, visitors: E } = b;
      if (k.type !== "root" && k.type !== "document" && !k.parent) {
        w.pop();
        return;
      }
      if (E.length > 0 && b.visitorIndex < E.length) {
        let [M, _] = E[b.visitorIndex];
        b.visitorIndex += 1, b.visitorIndex === E.length && (b.visitors = [], b.visitorIndex = 0), this.result.lastPlugin = M;
        try {
          return _(k.toProxy(), this.helpers);
        } catch (P) {
          throw this.handleError(P, k);
        }
      }
      if (b.iterator !== 0) {
        let M = b.iterator, _;
        for (; _ = k.nodes[k.indexes[M]]; )
          if (k.indexes[M] += 1, !_[e]) {
            _[e] = !0, w.push(g(_));
            return;
          }
        b.iterator = 0, delete k.indexes[M];
      }
      let A = b.events;
      for (; b.eventIndex < A.length; ) {
        let M = A[b.eventIndex];
        if (b.eventIndex += 1, M === c) {
          k.nodes && k.nodes.length && (k[e] = !0, b.iterator = k.getIterator());
          return;
        } else if (this.listeners[M]) {
          b.visitors = this.listeners[M];
          return;
        }
      }
      w.pop();
    }
    walkSync(w) {
      w[e] = !0;
      let b = f(w);
      for (let k of b)
        if (k === c)
          w.nodes && w.each((E) => {
            E[e] || this.walkSync(E);
          });
        else {
          let E = this.listeners[k];
          if (E && this.visitSync(E, w.toProxy()))
            return;
        }
    }
    warnings() {
      return this.sync().warnings();
    }
    get content() {
      return this.stringify().content;
    }
    get css() {
      return this.stringify().css;
    }
    get map() {
      return this.stringify().map;
    }
    get messages() {
      return this.sync().messages;
    }
    get opts() {
      return this.result.opts;
    }
    get processor() {
      return this.result.processor;
    }
    get root() {
      return this.sync().root;
    }
    get [Symbol.toStringTag]() {
      return "LazyResult";
    }
  }
  return v.registerPostcss = (S) => {
    y = S;
  }, rn = v, v.default = v, d.registerLazyResult(v), s.registerLazyResult(v), rn;
}
var nn, us;
function Su() {
  if (us) return nn;
  us = 1;
  let e = Do(), t = mr(), r = zo(), i = si();
  const n = ri();
  class s {
    constructor(p, o, d) {
      o = o.toString(), this.stringified = !1, this._processor = p, this._css = o, this._opts = d, this._map = void 0;
      let a, h = t;
      this.result = new n(this._processor, a, this._opts), this.result.css = o;
      let u = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return u.root;
        }
      });
      let c = new e(h, a, this._opts, o);
      if (c.isMap()) {
        let [m, f] = c.generate();
        m && (this.result.css = m), f && (this.result.map = f);
      } else
        c.clearAnnotation(), this.result.css = c.css;
    }
    async() {
      return this.error ? Promise.reject(this.error) : Promise.resolve(this.result);
    }
    catch(p) {
      return this.async().catch(p);
    }
    finally(p) {
      return this.async().then(p, p);
    }
    sync() {
      if (this.error) throw this.error;
      return this.result;
    }
    then(p, o) {
      return process.env.NODE_ENV !== "production" && ("from" in this._opts || r(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(p, o);
    }
    toString() {
      return this._css;
    }
    warnings() {
      return [];
    }
    get content() {
      return this.result.css;
    }
    get css() {
      return this.result.css;
    }
    get map() {
      return this.result.map;
    }
    get messages() {
      return [];
    }
    get opts() {
      return this.result.opts;
    }
    get processor() {
      return this.result.processor;
    }
    get root() {
      if (this._root)
        return this._root;
      let p, o = i;
      try {
        p = o(this._css, this._opts);
      } catch (d) {
        this.error = d;
      }
      if (this.error)
        throw this.error;
      return this._root = p, p;
    }
    get [Symbol.toStringTag]() {
      return "NoWorkResult";
    }
  }
  return nn = s, s.default = s, nn;
}
var sn, ds;
function Cu() {
  if (ds) return sn;
  ds = 1;
  let e = Su(), t = Bo(), r = ti(), i = $t();
  class n {
    constructor(l = []) {
      this.version = "8.4.38", this.plugins = this.normalize(l);
    }
    normalize(l) {
      let p = [];
      for (let o of l)
        if (o.postcss === !0 ? o = o() : o.postcss && (o = o.postcss), typeof o == "object" && Array.isArray(o.plugins))
          p = p.concat(o.plugins);
        else if (typeof o == "object" && o.postcssPlugin)
          p.push(o);
        else if (typeof o == "function")
          p.push(o);
        else if (typeof o == "object" && (o.parse || o.stringify)) {
          if (process.env.NODE_ENV !== "production")
            throw new Error(
              "PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation."
            );
        } else
          throw new Error(o + " is not a PostCSS plugin");
      return p;
    }
    process(l, p = {}) {
      return !this.plugins.length && !p.parser && !p.stringifier && !p.syntax ? new e(this, l, p) : new t(this, l, p);
    }
    use(l) {
      return this.plugins = this.plugins.concat(this.normalize([l])), this;
    }
  }
  return sn = n, n.default = n, i.registerProcessor(n), r.registerProcessor(n), sn;
}
var on, hs;
function Eu() {
  if (hs) return on;
  hs = 1;
  let e = yr(), t = $o(), r = vr(), i = ni(), n = br(), s = $t(), l = ii();
  function p(o, d) {
    if (Array.isArray(o)) return o.map((u) => p(u));
    let { inputs: a, ...h } = o;
    if (a) {
      d = [];
      for (let u of a) {
        let c = { ...u, __proto__: n.prototype };
        c.map && (c.map = {
          ...c.map,
          __proto__: t.prototype
        }), d.push(c);
      }
    }
    if (h.nodes && (h.nodes = o.nodes.map((u) => p(u, d))), h.source) {
      let { inputId: u, ...c } = h.source;
      h.source = c, u != null && (h.source.input = d[u]);
    }
    if (h.type === "root")
      return new s(h);
    if (h.type === "decl")
      return new e(h);
    if (h.type === "rule")
      return new l(h);
    if (h.type === "comment")
      return new r(h);
    if (h.type === "atrule")
      return new i(h);
    throw new Error("Unknown node type: " + o.type);
  }
  return on = p, p.default = p, on;
}
var an, ps;
function Mu() {
  if (ps) return an;
  ps = 1;
  let e = Qn(), t = yr(), r = Bo(), i = lt(), n = Cu(), s = mr(), l = Eu(), p = ti(), o = Fo(), d = vr(), a = ni(), h = ri(), u = br(), c = si(), m = Uo(), f = ii(), g = $t(), x = gr();
  function y(...v) {
    return v.length === 1 && Array.isArray(v[0]) && (v = v[0]), new n(v);
  }
  return y.plugin = function(S, w) {
    let b = !1;
    function k(...A) {
      console && console.warn && !b && (b = !0, console.warn(
        S + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        S + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let M = w(...A);
      return M.postcssPlugin = S, M.postcssVersion = new n().version, M;
    }
    let E;
    return Object.defineProperty(k, "postcss", {
      get() {
        return E || (E = k()), E;
      }
    }), k.process = function(A, M, _) {
      return y([k(_)]).process(A, M);
    }, k;
  }, y.stringify = s, y.parse = c, y.fromJSON = l, y.list = m, y.comment = (v) => new d(v), y.atRule = (v) => new a(v), y.decl = (v) => new t(v), y.rule = (v) => new f(v), y.root = (v) => new g(v), y.document = (v) => new p(v), y.CssSyntaxError = e, y.Declaration = t, y.Container = i, y.Processor = n, y.Document = p, y.Comment = d, y.Warning = o, y.AtRule = a, y.Result = h, y.Input = u, y.Rule = f, y.Root = g, y.Node = x, r.registerPostcss(y), an = y, y.default = y, an;
}
var Ru = Mu();
const re = /* @__PURE__ */ mu(Ru);
re.stringify;
re.fromJSON;
re.plugin;
re.parse;
re.list;
re.document;
re.comment;
re.atRule;
re.rule;
re.decl;
re.root;
re.CssSyntaxError;
re.Declaration;
re.Container;
re.Processor;
re.Document;
re.Comment;
re.Warning;
re.AtRule;
re.Result;
re.Input;
re.Rule;
re.Root;
re.Node;
var Ou = Object.defineProperty, Iu = (e, t, r) => t in e ? Ou(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, Re = (e, t, r) => Iu(e, typeof t != "symbol" ? t + "" : t, r);
Date.now().toString();
function Au(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Lu(e) {
  if (e.__esModule) return e;
  var t = e.default;
  if (typeof t == "function") {
    var r = function i() {
      return this instanceof i ? Reflect.construct(t, arguments, this.constructor) : t.apply(this, arguments);
    };
    r.prototype = t.prototype;
  } else r = {};
  return Object.defineProperty(r, "__esModule", { value: !0 }), Object.keys(e).forEach(function(i) {
    var n = Object.getOwnPropertyDescriptor(e, i);
    Object.defineProperty(r, i, n.get ? n : {
      enumerable: !0,
      get: function() {
        return e[i];
      }
    });
  }), r;
}
var Yt = { exports: {} }, fs;
function Tu() {
  if (fs) return Yt.exports;
  fs = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return Yt.exports = t(), Yt.exports.createColors = t, Yt.exports;
}
const Pu = {}, Nu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Pu
}, Symbol.toStringTag, { value: "Module" })), Ue = /* @__PURE__ */ Lu(Nu);
var ln, ms;
function oi() {
  if (ms) return ln;
  ms = 1;
  let e = /* @__PURE__ */ Tu(), t = Ue;
  class r extends Error {
    constructor(n, s, l, p, o, d) {
      super(n), this.name = "CssSyntaxError", this.reason = n, o && (this.file = o), p && (this.source = p), d && (this.plugin = d), typeof s < "u" && typeof l < "u" && (typeof s == "number" ? (this.line = s, this.column = l) : (this.line = s.line, this.column = s.column, this.endLine = l.line, this.endColumn = l.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, r);
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
    }
    showSourceCode(n) {
      if (!this.source) return "";
      let s = this.source;
      n == null && (n = e.isColorSupported), t && n && (s = t(s));
      let l = s.split(/\r?\n/), p = Math.max(this.line - 3, 0), o = Math.min(this.line + 2, l.length), d = String(o).length, a, h;
      if (n) {
        let { bold: u, gray: c, red: m } = e.createColors(!0);
        a = (f) => u(m(f)), h = (f) => c(f);
      } else
        a = h = (u) => u;
      return l.slice(p, o).map((u, c) => {
        let m = p + 1 + c, f = " " + (" " + m).slice(-d) + " | ";
        if (m === this.line) {
          let g = h(f.replace(/\d/g, " ")) + u.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return a(">") + h(f) + u + `
 ` + g + a("^");
        }
        return " " + h(f) + u;
      }).join(`
`);
    }
    toString() {
      let n = this.showSourceCode();
      return n && (n = `

` + n + `
`), this.name + ": " + this.message + n;
    }
  }
  return ln = r, r.default = r, ln;
}
var Xt = {}, gs;
function ai() {
  return gs || (gs = 1, Xt.isClean = Symbol("isClean"), Xt.my = Symbol("my")), Xt;
}
var cn, ys;
function Wo() {
  if (ys) return cn;
  ys = 1;
  const e = {
    after: `
`,
    beforeClose: `
`,
    beforeComment: `
`,
    beforeDecl: `
`,
    beforeOpen: " ",
    beforeRule: `
`,
    colon: ": ",
    commentLeft: " ",
    commentRight: " ",
    emptyBody: "",
    indent: "    ",
    semicolon: !1
  };
  function t(i) {
    return i[0].toUpperCase() + i.slice(1);
  }
  class r {
    constructor(n) {
      this.builder = n;
    }
    atrule(n, s) {
      let l = "@" + n.name, p = n.params ? this.rawValue(n, "params") : "";
      if (typeof n.raws.afterName < "u" ? l += n.raws.afterName : p && (l += " "), n.nodes)
        this.block(n, l + p);
      else {
        let o = (n.raws.between || "") + (s ? ";" : "");
        this.builder(l + p + o, n);
      }
    }
    beforeAfter(n, s) {
      let l;
      n.type === "decl" ? l = this.raw(n, null, "beforeDecl") : n.type === "comment" ? l = this.raw(n, null, "beforeComment") : s === "before" ? l = this.raw(n, null, "beforeRule") : l = this.raw(n, null, "beforeClose");
      let p = n.parent, o = 0;
      for (; p && p.type !== "root"; )
        o += 1, p = p.parent;
      if (l.includes(`
`)) {
        let d = this.raw(n, null, "indent");
        if (d.length)
          for (let a = 0; a < o; a++) l += d;
      }
      return l;
    }
    block(n, s) {
      let l = this.raw(n, "between", "beforeOpen");
      this.builder(s + l + "{", n, "start");
      let p;
      n.nodes && n.nodes.length ? (this.body(n), p = this.raw(n, "after")) : p = this.raw(n, "after", "emptyBody"), p && this.builder(p), this.builder("}", n, "end");
    }
    body(n) {
      let s = n.nodes.length - 1;
      for (; s > 0 && n.nodes[s].type === "comment"; )
        s -= 1;
      let l = this.raw(n, "semicolon");
      for (let p = 0; p < n.nodes.length; p++) {
        let o = n.nodes[p], d = this.raw(o, "before");
        d && this.builder(d), this.stringify(o, s !== p || l);
      }
    }
    comment(n) {
      let s = this.raw(n, "left", "commentLeft"), l = this.raw(n, "right", "commentRight");
      this.builder("/*" + s + n.text + l + "*/", n);
    }
    decl(n, s) {
      let l = this.raw(n, "between", "colon"), p = n.prop + l + this.rawValue(n, "value");
      n.important && (p += n.raws.important || " !important"), s && (p += ";"), this.builder(p, n);
    }
    document(n) {
      this.body(n);
    }
    raw(n, s, l) {
      let p;
      if (l || (l = s), s && (p = n.raws[s], typeof p < "u"))
        return p;
      let o = n.parent;
      if (l === "before" && (!o || o.type === "root" && o.first === n || o && o.type === "document"))
        return "";
      if (!o) return e[l];
      let d = n.root();
      if (d.rawCache || (d.rawCache = {}), typeof d.rawCache[l] < "u")
        return d.rawCache[l];
      if (l === "before" || l === "after")
        return this.beforeAfter(n, l);
      {
        let a = "raw" + t(l);
        this[a] ? p = this[a](d, n) : d.walk((h) => {
          if (p = h.raws[s], typeof p < "u") return !1;
        });
      }
      return typeof p > "u" && (p = e[l]), d.rawCache[l] = p, p;
    }
    rawBeforeClose(n) {
      let s;
      return n.walk((l) => {
        if (l.nodes && l.nodes.length > 0 && typeof l.raws.after < "u")
          return s = l.raws.after, s.includes(`
`) && (s = s.replace(/[^\n]+$/, "")), !1;
      }), s && (s = s.replace(/\S/g, "")), s;
    }
    rawBeforeComment(n, s) {
      let l;
      return n.walkComments((p) => {
        if (typeof p.raws.before < "u")
          return l = p.raws.before, l.includes(`
`) && (l = l.replace(/[^\n]+$/, "")), !1;
      }), typeof l > "u" ? l = this.raw(s, null, "beforeDecl") : l && (l = l.replace(/\S/g, "")), l;
    }
    rawBeforeDecl(n, s) {
      let l;
      return n.walkDecls((p) => {
        if (typeof p.raws.before < "u")
          return l = p.raws.before, l.includes(`
`) && (l = l.replace(/[^\n]+$/, "")), !1;
      }), typeof l > "u" ? l = this.raw(s, null, "beforeRule") : l && (l = l.replace(/\S/g, "")), l;
    }
    rawBeforeOpen(n) {
      let s;
      return n.walk((l) => {
        if (l.type !== "decl" && (s = l.raws.between, typeof s < "u"))
          return !1;
      }), s;
    }
    rawBeforeRule(n) {
      let s;
      return n.walk((l) => {
        if (l.nodes && (l.parent !== n || n.first !== l) && typeof l.raws.before < "u")
          return s = l.raws.before, s.includes(`
`) && (s = s.replace(/[^\n]+$/, "")), !1;
      }), s && (s = s.replace(/\S/g, "")), s;
    }
    rawColon(n) {
      let s;
      return n.walkDecls((l) => {
        if (typeof l.raws.between < "u")
          return s = l.raws.between.replace(/[^\s:]/g, ""), !1;
      }), s;
    }
    rawEmptyBody(n) {
      let s;
      return n.walk((l) => {
        if (l.nodes && l.nodes.length === 0 && (s = l.raws.after, typeof s < "u"))
          return !1;
      }), s;
    }
    rawIndent(n) {
      if (n.raws.indent) return n.raws.indent;
      let s;
      return n.walk((l) => {
        let p = l.parent;
        if (p && p !== n && p.parent && p.parent === n && typeof l.raws.before < "u") {
          let o = l.raws.before.split(`
`);
          return s = o[o.length - 1], s = s.replace(/\S/g, ""), !1;
        }
      }), s;
    }
    rawSemicolon(n) {
      let s;
      return n.walk((l) => {
        if (l.nodes && l.nodes.length && l.last.type === "decl" && (s = l.raws.semicolon, typeof s < "u"))
          return !1;
      }), s;
    }
    rawValue(n, s) {
      let l = n[s], p = n.raws[s];
      return p && p.value === l ? p.raw : l;
    }
    root(n) {
      this.body(n), n.raws.after && this.builder(n.raws.after);
    }
    rule(n) {
      this.block(n, this.rawValue(n, "selector")), n.raws.ownSemicolon && this.builder(n.raws.ownSemicolon, n, "end");
    }
    stringify(n, s) {
      if (!this[n.type])
        throw new Error(
          "Unknown AST node type " + n.type + ". Maybe you need to change PostCSS stringifier."
        );
      this[n.type](n, s);
    }
  }
  return cn = r, r.default = r, cn;
}
var un, bs;
function wr() {
  if (bs) return un;
  bs = 1;
  let e = Wo();
  function t(r, i) {
    new e(i).stringify(r);
  }
  return un = t, t.default = t, un;
}
var dn, vs;
function xr() {
  if (vs) return dn;
  vs = 1;
  let { isClean: e, my: t } = ai(), r = oi(), i = Wo(), n = wr();
  function s(p, o) {
    let d = new p.constructor();
    for (let a in p) {
      if (!Object.prototype.hasOwnProperty.call(p, a) || a === "proxyCache") continue;
      let h = p[a], u = typeof h;
      a === "parent" && u === "object" ? o && (d[a] = o) : a === "source" ? d[a] = h : Array.isArray(h) ? d[a] = h.map((c) => s(c, d)) : (u === "object" && h !== null && (h = s(h)), d[a] = h);
    }
    return d;
  }
  class l {
    constructor(o = {}) {
      this.raws = {}, this[e] = !1, this[t] = !0;
      for (let d in o)
        if (d === "nodes") {
          this.nodes = [];
          for (let a of o[d])
            typeof a.clone == "function" ? this.append(a.clone()) : this.append(a);
        } else
          this[d] = o[d];
    }
    addToError(o) {
      if (o.postcssNode = this, o.stack && this.source && /\n\s{4}at /.test(o.stack)) {
        let d = this.source;
        o.stack = o.stack.replace(
          /\n\s{4}at /,
          `$&${d.input.from}:${d.start.line}:${d.start.column}$&`
        );
      }
      return o;
    }
    after(o) {
      return this.parent.insertAfter(this, o), this;
    }
    assign(o = {}) {
      for (let d in o)
        this[d] = o[d];
      return this;
    }
    before(o) {
      return this.parent.insertBefore(this, o), this;
    }
    cleanRaws(o) {
      delete this.raws.before, delete this.raws.after, o || delete this.raws.between;
    }
    clone(o = {}) {
      let d = s(this);
      for (let a in o)
        d[a] = o[a];
      return d;
    }
    cloneAfter(o = {}) {
      let d = this.clone(o);
      return this.parent.insertAfter(this, d), d;
    }
    cloneBefore(o = {}) {
      let d = this.clone(o);
      return this.parent.insertBefore(this, d), d;
    }
    error(o, d = {}) {
      if (this.source) {
        let { end: a, start: h } = this.rangeBy(d);
        return this.source.input.error(
          o,
          { column: h.column, line: h.line },
          { column: a.column, line: a.line },
          d
        );
      }
      return new r(o);
    }
    getProxyProcessor() {
      return {
        get(o, d) {
          return d === "proxyOf" ? o : d === "root" ? () => o.root().toProxy() : o[d];
        },
        set(o, d, a) {
          return o[d] === a || (o[d] = a, (d === "prop" || d === "value" || d === "name" || d === "params" || d === "important" || /* c8 ignore next */
          d === "text") && o.markDirty()), !0;
        }
      };
    }
    markDirty() {
      if (this[e]) {
        this[e] = !1;
        let o = this;
        for (; o = o.parent; )
          o[e] = !1;
      }
    }
    next() {
      if (!this.parent) return;
      let o = this.parent.index(this);
      return this.parent.nodes[o + 1];
    }
    positionBy(o, d) {
      let a = this.source.start;
      if (o.index)
        a = this.positionInside(o.index, d);
      else if (o.word) {
        d = this.toString();
        let h = d.indexOf(o.word);
        h !== -1 && (a = this.positionInside(h, d));
      }
      return a;
    }
    positionInside(o, d) {
      let a = d || this.toString(), h = this.source.start.column, u = this.source.start.line;
      for (let c = 0; c < o; c++)
        a[c] === `
` ? (h = 1, u += 1) : h += 1;
      return { column: h, line: u };
    }
    prev() {
      if (!this.parent) return;
      let o = this.parent.index(this);
      return this.parent.nodes[o - 1];
    }
    rangeBy(o) {
      let d = {
        column: this.source.start.column,
        line: this.source.start.line
      }, a = this.source.end ? {
        column: this.source.end.column + 1,
        line: this.source.end.line
      } : {
        column: d.column + 1,
        line: d.line
      };
      if (o.word) {
        let h = this.toString(), u = h.indexOf(o.word);
        u !== -1 && (d = this.positionInside(u, h), a = this.positionInside(u + o.word.length, h));
      } else
        o.start ? d = {
          column: o.start.column,
          line: o.start.line
        } : o.index && (d = this.positionInside(o.index)), o.end ? a = {
          column: o.end.column,
          line: o.end.line
        } : typeof o.endIndex == "number" ? a = this.positionInside(o.endIndex) : o.index && (a = this.positionInside(o.index + 1));
      return (a.line < d.line || a.line === d.line && a.column <= d.column) && (a = { column: d.column + 1, line: d.line }), { end: a, start: d };
    }
    raw(o, d) {
      return new i().raw(this, o, d);
    }
    remove() {
      return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
    }
    replaceWith(...o) {
      if (this.parent) {
        let d = this, a = !1;
        for (let h of o)
          h === this ? a = !0 : a ? (this.parent.insertAfter(d, h), d = h) : this.parent.insertBefore(d, h);
        a || this.remove();
      }
      return this;
    }
    root() {
      let o = this;
      for (; o.parent && o.parent.type !== "document"; )
        o = o.parent;
      return o;
    }
    toJSON(o, d) {
      let a = {}, h = d == null;
      d = d || /* @__PURE__ */ new Map();
      let u = 0;
      for (let c in this) {
        if (!Object.prototype.hasOwnProperty.call(this, c) || c === "parent" || c === "proxyCache") continue;
        let m = this[c];
        if (Array.isArray(m))
          a[c] = m.map((f) => typeof f == "object" && f.toJSON ? f.toJSON(null, d) : f);
        else if (typeof m == "object" && m.toJSON)
          a[c] = m.toJSON(null, d);
        else if (c === "source") {
          let f = d.get(m.input);
          f == null && (f = u, d.set(m.input, u), u++), a[c] = {
            end: m.end,
            inputId: f,
            start: m.start
          };
        } else
          a[c] = m;
      }
      return h && (a.inputs = [...d.keys()].map((c) => c.toJSON())), a;
    }
    toProxy() {
      return this.proxyCache || (this.proxyCache = new Proxy(this, this.getProxyProcessor())), this.proxyCache;
    }
    toString(o = n) {
      o.stringify && (o = o.stringify);
      let d = "";
      return o(this, (a) => {
        d += a;
      }), d;
    }
    warn(o, d, a) {
      let h = { node: this };
      for (let u in a) h[u] = a[u];
      return o.warn(d, h);
    }
    get proxyOf() {
      return this;
    }
  }
  return dn = l, l.default = l, dn;
}
var hn, ws;
function kr() {
  if (ws) return hn;
  ws = 1;
  let e = xr();
  class t extends e {
    constructor(i) {
      i && typeof i.value < "u" && typeof i.value != "string" && (i = { ...i, value: String(i.value) }), super(i), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return hn = t, t.default = t, hn;
}
var pn, xs;
function _u() {
  if (xs) return pn;
  xs = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return pn = { nanoid: (i = 21) => {
    let n = "", s = i;
    for (; s--; )
      n += e[Math.random() * 64 | 0];
    return n;
  }, customAlphabet: (i, n = 21) => (s = n) => {
    let l = "", p = s;
    for (; p--; )
      l += i[Math.random() * i.length | 0];
    return l;
  } }, pn;
}
var fn, ks;
function jo() {
  if (ks) return fn;
  ks = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Ue, { existsSync: r, readFileSync: i } = Ue, { dirname: n, join: s } = Ue;
  function l(o) {
    return Buffer ? Buffer.from(o, "base64").toString() : window.atob(o);
  }
  class p {
    constructor(d, a) {
      if (a.map === !1) return;
      this.loadAnnotation(d), this.inline = this.startWith(this.annotation, "data:");
      let h = a.map ? a.map.prev : void 0, u = this.loadMap(a.from, h);
      !this.mapFile && a.from && (this.mapFile = a.from), this.mapFile && (this.root = n(this.mapFile)), u && (this.text = u);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(d) {
      let a = /^data:application\/json;charset=utf-?8;base64,/, h = /^data:application\/json;base64,/, u = /^data:application\/json;charset=utf-?8,/, c = /^data:application\/json,/;
      if (u.test(d) || c.test(d))
        return decodeURIComponent(d.substr(RegExp.lastMatch.length));
      if (a.test(d) || h.test(d))
        return l(d.substr(RegExp.lastMatch.length));
      let m = d.match(/data:application\/json;([^,]+),/)[1];
      throw new Error("Unsupported source map encoding " + m);
    }
    getAnnotationURL(d) {
      return d.replace(/^\/\*\s*# sourceMappingURL=/, "").trim();
    }
    isMap(d) {
      return typeof d != "object" ? !1 : typeof d.mappings == "string" || typeof d._mappings == "string" || Array.isArray(d.sections);
    }
    loadAnnotation(d) {
      let a = d.match(/\/\*\s*# sourceMappingURL=/gm);
      if (!a) return;
      let h = d.lastIndexOf(a.pop()), u = d.indexOf("*/", h);
      h > -1 && u > -1 && (this.annotation = this.getAnnotationURL(d.substring(h, u)));
    }
    loadFile(d) {
      if (this.root = n(d), r(d))
        return this.mapFile = d, i(d, "utf-8").toString().trim();
    }
    loadMap(d, a) {
      if (a === !1) return !1;
      if (a) {
        if (typeof a == "string")
          return a;
        if (typeof a == "function") {
          let h = a(d);
          if (h) {
            let u = this.loadFile(h);
            if (!u)
              throw new Error(
                "Unable to load previous source map: " + h.toString()
              );
            return u;
          }
        } else {
          if (a instanceof e)
            return t.fromSourceMap(a).toString();
          if (a instanceof t)
            return a.toString();
          if (this.isMap(a))
            return JSON.stringify(a);
          throw new Error(
            "Unsupported previous source map format: " + a.toString()
          );
        }
      } else {
        if (this.inline)
          return this.decodeInline(this.annotation);
        if (this.annotation) {
          let h = this.annotation;
          return d && (h = s(n(d), h)), this.loadFile(h);
        }
      }
    }
    startWith(d, a) {
      return d ? d.substr(0, a.length) === a : !1;
    }
    withContent() {
      return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
    }
  }
  return fn = p, p.default = p, fn;
}
var mn, Ss;
function Sr() {
  if (Ss) return mn;
  Ss = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Ue, { fileURLToPath: r, pathToFileURL: i } = Ue, { isAbsolute: n, resolve: s } = Ue, { nanoid: l } = /* @__PURE__ */ _u(), p = Ue, o = oi(), d = jo(), a = Symbol("fromOffsetCache"), h = !!(e && t), u = !!(s && n);
  class c {
    constructor(f, g = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, g.from && (!u || /^\w+:\/\//.test(g.from) || n(g.from) ? this.file = g.from : this.file = s(g.from)), u && h) {
        let x = new d(this.css, g);
        if (x.text) {
          this.map = x;
          let y = x.consumer().file;
          !this.file && y && (this.file = this.mapResolve(y));
        }
      }
      this.file || (this.id = "<input css " + l(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, g, x, y = {}) {
      let v, S, w;
      if (g && typeof g == "object") {
        let k = g, E = x;
        if (typeof k.offset == "number") {
          let A = this.fromOffset(k.offset);
          g = A.line, x = A.col;
        } else
          g = k.line, x = k.column;
        if (typeof E.offset == "number") {
          let A = this.fromOffset(E.offset);
          S = A.line, w = A.col;
        } else
          S = E.line, w = E.column;
      } else if (!x) {
        let k = this.fromOffset(g);
        g = k.line, x = k.col;
      }
      let b = this.origin(g, x, S, w);
      return b ? v = new o(
        f,
        b.endLine === void 0 ? b.line : { column: b.column, line: b.line },
        b.endLine === void 0 ? b.column : { column: b.endColumn, line: b.endLine },
        b.source,
        b.file,
        y.plugin
      ) : v = new o(
        f,
        S === void 0 ? g : { column: x, line: g },
        S === void 0 ? x : { column: w, line: S },
        this.css,
        this.file,
        y.plugin
      ), v.input = { column: x, endColumn: w, endLine: S, line: g, source: this.css }, this.file && (i && (v.input.url = i(this.file).toString()), v.input.file = this.file), v;
    }
    fromOffset(f) {
      let g, x;
      if (this[a])
        x = this[a];
      else {
        let v = this.css.split(`
`);
        x = new Array(v.length);
        let S = 0;
        for (let w = 0, b = v.length; w < b; w++)
          x[w] = S, S += v[w].length + 1;
        this[a] = x;
      }
      g = x[x.length - 1];
      let y = 0;
      if (f >= g)
        y = x.length - 1;
      else {
        let v = x.length - 2, S;
        for (; y < v; )
          if (S = y + (v - y >> 1), f < x[S])
            v = S - 1;
          else if (f >= x[S + 1])
            y = S + 1;
          else {
            y = S;
            break;
          }
      }
      return {
        col: f - x[y] + 1,
        line: y + 1
      };
    }
    mapResolve(f) {
      return /^\w+:\/\//.test(f) ? f : s(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, g, x, y) {
      if (!this.map) return !1;
      let v = this.map.consumer(), S = v.originalPositionFor({ column: g, line: f });
      if (!S.source) return !1;
      let w;
      typeof x == "number" && (w = v.originalPositionFor({ column: y, line: x }));
      let b;
      n(S.source) ? b = i(S.source) : b = new URL(
        S.source,
        this.map.consumer().sourceRoot || i(this.map.mapFile)
      );
      let k = {
        column: S.column,
        endColumn: w && w.column,
        endLine: w && w.line,
        line: S.line,
        url: b.toString()
      };
      if (b.protocol === "file:")
        if (r)
          k.file = r(b);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let E = v.sourceContentFor(S.source);
      return E && (k.source = E), k;
    }
    toJSON() {
      let f = {};
      for (let g of ["hasBOM", "css", "file", "id"])
        this[g] != null && (f[g] = this[g]);
      return this.map && (f.map = { ...this.map }, f.map.consumerCache && (f.map.consumerCache = void 0)), f;
    }
    get from() {
      return this.file || this.id;
    }
  }
  return mn = c, c.default = c, p && p.registerInput && p.registerInput(c), mn;
}
var gn, Cs;
function qo() {
  if (Cs) return gn;
  Cs = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Ue, { dirname: r, relative: i, resolve: n, sep: s } = Ue, { pathToFileURL: l } = Ue, p = Sr(), o = !!(e && t), d = !!(r && n && i && s);
  class a {
    constructor(u, c, m, f) {
      this.stringify = u, this.mapOpts = m.map || {}, this.root = c, this.opts = m, this.css = f, this.originalCSS = f, this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute, this.memoizedFileURLs = /* @__PURE__ */ new Map(), this.memoizedPaths = /* @__PURE__ */ new Map(), this.memoizedURLs = /* @__PURE__ */ new Map();
    }
    addAnnotation() {
      let u;
      this.isInline() ? u = "data:application/json;base64," + this.toBase64(this.map.toString()) : typeof this.mapOpts.annotation == "string" ? u = this.mapOpts.annotation : typeof this.mapOpts.annotation == "function" ? u = this.mapOpts.annotation(this.opts.to, this.root) : u = this.outputFile() + ".map";
      let c = `
`;
      this.css.includes(`\r
`) && (c = `\r
`), this.css += c + "/*# sourceMappingURL=" + u + " */";
    }
    applyPrevMaps() {
      for (let u of this.previous()) {
        let c = this.toUrl(this.path(u.file)), m = u.root || r(u.file), f;
        this.mapOpts.sourcesContent === !1 ? (f = new e(u.text), f.sourcesContent && (f.sourcesContent = null)) : f = u.consumer(), this.map.applySourceMap(f, c, this.toUrl(this.path(m)));
      }
    }
    clearAnnotation() {
      if (this.mapOpts.annotation !== !1)
        if (this.root) {
          let u;
          for (let c = this.root.nodes.length - 1; c >= 0; c--)
            u = this.root.nodes[c], u.type === "comment" && u.text.indexOf("# sourceMappingURL=") === 0 && this.root.removeChild(c);
        } else this.css && (this.css = this.css.replace(/\n*?\/\*#[\S\s]*?\*\/$/gm, ""));
    }
    generate() {
      if (this.clearAnnotation(), d && o && this.isMap())
        return this.generateMap();
      {
        let u = "";
        return this.stringify(this.root, (c) => {
          u += c;
        }), [u];
      }
    }
    generateMap() {
      if (this.root)
        this.generateString();
      else if (this.previous().length === 1) {
        let u = this.previous()[0].consumer();
        u.file = this.outputFile(), this.map = t.fromSourceMap(u, {
          ignoreInvalidMapping: !0
        });
      } else
        this.map = new t({
          file: this.outputFile(),
          ignoreInvalidMapping: !0
        }), this.map.addMapping({
          generated: { column: 0, line: 1 },
          original: { column: 0, line: 1 },
          source: this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>"
        });
      return this.isSourcesContent() && this.setSourcesContent(), this.root && this.previous().length > 0 && this.applyPrevMaps(), this.isAnnotation() && this.addAnnotation(), this.isInline() ? [this.css] : [this.css, this.map];
    }
    generateString() {
      this.css = "", this.map = new t({
        file: this.outputFile(),
        ignoreInvalidMapping: !0
      });
      let u = 1, c = 1, m = "<no source>", f = {
        generated: { column: 0, line: 0 },
        original: { column: 0, line: 0 },
        source: ""
      }, g, x;
      this.stringify(this.root, (y, v, S) => {
        if (this.css += y, v && S !== "end" && (f.generated.line = u, f.generated.column = c - 1, v.source && v.source.start ? (f.source = this.sourcePath(v), f.original.line = v.source.start.line, f.original.column = v.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), g = y.match(/\n/g), g ? (u += g.length, x = y.lastIndexOf(`
`), c = y.length - x) : c += y.length, v && S !== "start") {
          let w = v.parent || { raws: {} };
          (!(v.type === "decl" || v.type === "atrule" && !v.nodes) || v !== w.last || w.raws.semicolon) && (v.source && v.source.end ? (f.source = this.sourcePath(v), f.original.line = v.source.end.line, f.original.column = v.source.end.column - 1, f.generated.line = u, f.generated.column = c - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = u, f.generated.column = c - 1, this.map.addMapping(f)));
        }
      });
    }
    isAnnotation() {
      return this.isInline() ? !0 : typeof this.mapOpts.annotation < "u" ? this.mapOpts.annotation : this.previous().length ? this.previous().some((u) => u.annotation) : !0;
    }
    isInline() {
      if (typeof this.mapOpts.inline < "u")
        return this.mapOpts.inline;
      let u = this.mapOpts.annotation;
      return typeof u < "u" && u !== !0 ? !1 : this.previous().length ? this.previous().some((c) => c.inline) : !0;
    }
    isMap() {
      return typeof this.opts.map < "u" ? !!this.opts.map : this.previous().length > 0;
    }
    isSourcesContent() {
      return typeof this.mapOpts.sourcesContent < "u" ? this.mapOpts.sourcesContent : this.previous().length ? this.previous().some((u) => u.withContent()) : !0;
    }
    outputFile() {
      return this.opts.to ? this.path(this.opts.to) : this.opts.from ? this.path(this.opts.from) : "to.css";
    }
    path(u) {
      if (this.mapOpts.absolute || u.charCodeAt(0) === 60 || /^\w+:\/\//.test(u)) return u;
      let c = this.memoizedPaths.get(u);
      if (c) return c;
      let m = this.opts.to ? r(this.opts.to) : ".";
      typeof this.mapOpts.annotation == "string" && (m = r(n(m, this.mapOpts.annotation)));
      let f = i(m, u);
      return this.memoizedPaths.set(u, f), f;
    }
    previous() {
      if (!this.previousMaps)
        if (this.previousMaps = [], this.root)
          this.root.walk((u) => {
            if (u.source && u.source.input.map) {
              let c = u.source.input.map;
              this.previousMaps.includes(c) || this.previousMaps.push(c);
            }
          });
        else {
          let u = new p(this.originalCSS, this.opts);
          u.map && this.previousMaps.push(u.map);
        }
      return this.previousMaps;
    }
    setSourcesContent() {
      let u = {};
      if (this.root)
        this.root.walk((c) => {
          if (c.source) {
            let m = c.source.input.from;
            if (m && !u[m]) {
              u[m] = !0;
              let f = this.usesFileUrls ? this.toFileUrl(m) : this.toUrl(this.path(m));
              this.map.setSourceContent(f, c.source.input.css);
            }
          }
        });
      else if (this.css) {
        let c = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
        this.map.setSourceContent(c, this.css);
      }
    }
    sourcePath(u) {
      return this.mapOpts.from ? this.toUrl(this.mapOpts.from) : this.usesFileUrls ? this.toFileUrl(u.source.input.from) : this.toUrl(this.path(u.source.input.from));
    }
    toBase64(u) {
      return Buffer ? Buffer.from(u).toString("base64") : window.btoa(unescape(encodeURIComponent(u)));
    }
    toFileUrl(u) {
      let c = this.memoizedFileURLs.get(u);
      if (c) return c;
      if (l) {
        let m = l(u).toString();
        return this.memoizedFileURLs.set(u, m), m;
      } else
        throw new Error(
          "`map.absolute` option is not available in this PostCSS build"
        );
    }
    toUrl(u) {
      let c = this.memoizedURLs.get(u);
      if (c) return c;
      s === "\\" && (u = u.replace(/\\/g, "/"));
      let m = encodeURI(u).replace(/[#?]/g, encodeURIComponent);
      return this.memoizedURLs.set(u, m), m;
    }
  }
  return gn = a, gn;
}
var yn, Es;
function Cr() {
  if (Es) return yn;
  Es = 1;
  let e = xr();
  class t extends e {
    constructor(i) {
      super(i), this.type = "comment";
    }
  }
  return yn = t, t.default = t, yn;
}
var bn, Ms;
function ct() {
  if (Ms) return bn;
  Ms = 1;
  let { isClean: e, my: t } = ai(), r = kr(), i = Cr(), n = xr(), s, l, p, o;
  function d(u) {
    return u.map((c) => (c.nodes && (c.nodes = d(c.nodes)), delete c.source, c));
  }
  function a(u) {
    if (u[e] = !1, u.proxyOf.nodes)
      for (let c of u.proxyOf.nodes)
        a(c);
  }
  class h extends n {
    append(...c) {
      for (let m of c) {
        let f = this.normalize(m, this.last);
        for (let g of f) this.proxyOf.nodes.push(g);
      }
      return this.markDirty(), this;
    }
    cleanRaws(c) {
      if (super.cleanRaws(c), this.nodes)
        for (let m of this.nodes) m.cleanRaws(c);
    }
    each(c) {
      if (!this.proxyOf.nodes) return;
      let m = this.getIterator(), f, g;
      for (; this.indexes[m] < this.proxyOf.nodes.length && (f = this.indexes[m], g = c(this.proxyOf.nodes[f], f), g !== !1); )
        this.indexes[m] += 1;
      return delete this.indexes[m], g;
    }
    every(c) {
      return this.nodes.every(c);
    }
    getIterator() {
      this.lastEach || (this.lastEach = 0), this.indexes || (this.indexes = {}), this.lastEach += 1;
      let c = this.lastEach;
      return this.indexes[c] = 0, c;
    }
    getProxyProcessor() {
      return {
        get(c, m) {
          return m === "proxyOf" ? c : c[m] ? m === "each" || typeof m == "string" && m.startsWith("walk") ? (...f) => c[m](
            ...f.map((g) => typeof g == "function" ? (x, y) => g(x.toProxy(), y) : g)
          ) : m === "every" || m === "some" ? (f) => c[m](
            (g, ...x) => f(g.toProxy(), ...x)
          ) : m === "root" ? () => c.root().toProxy() : m === "nodes" ? c.nodes.map((f) => f.toProxy()) : m === "first" || m === "last" ? c[m].toProxy() : c[m] : c[m];
        },
        set(c, m, f) {
          return c[m] === f || (c[m] = f, (m === "name" || m === "params" || m === "selector") && c.markDirty()), !0;
        }
      };
    }
    index(c) {
      return typeof c == "number" ? c : (c.proxyOf && (c = c.proxyOf), this.proxyOf.nodes.indexOf(c));
    }
    insertAfter(c, m) {
      let f = this.index(c), g = this.normalize(m, this.proxyOf.nodes[f]).reverse();
      f = this.index(c);
      for (let y of g) this.proxyOf.nodes.splice(f + 1, 0, y);
      let x;
      for (let y in this.indexes)
        x = this.indexes[y], f < x && (this.indexes[y] = x + g.length);
      return this.markDirty(), this;
    }
    insertBefore(c, m) {
      let f = this.index(c), g = f === 0 ? "prepend" : !1, x = this.normalize(m, this.proxyOf.nodes[f], g).reverse();
      f = this.index(c);
      for (let v of x) this.proxyOf.nodes.splice(f, 0, v);
      let y;
      for (let v in this.indexes)
        y = this.indexes[v], f <= y && (this.indexes[v] = y + x.length);
      return this.markDirty(), this;
    }
    normalize(c, m) {
      if (typeof c == "string")
        c = d(s(c).nodes);
      else if (typeof c > "u")
        c = [];
      else if (Array.isArray(c)) {
        c = c.slice(0);
        for (let g of c)
          g.parent && g.parent.removeChild(g, "ignore");
      } else if (c.type === "root" && this.type !== "document") {
        c = c.nodes.slice(0);
        for (let g of c)
          g.parent && g.parent.removeChild(g, "ignore");
      } else if (c.type)
        c = [c];
      else if (c.prop) {
        if (typeof c.value > "u")
          throw new Error("Value field is missed in node creation");
        typeof c.value != "string" && (c.value = String(c.value)), c = [new r(c)];
      } else if (c.selector)
        c = [new l(c)];
      else if (c.name)
        c = [new p(c)];
      else if (c.text)
        c = [new i(c)];
      else
        throw new Error("Unknown node type in node creation");
      return c.map((g) => (g[t] || h.rebuild(g), g = g.proxyOf, g.parent && g.parent.removeChild(g), g[e] && a(g), typeof g.raws.before > "u" && m && typeof m.raws.before < "u" && (g.raws.before = m.raws.before.replace(/\S/g, "")), g.parent = this.proxyOf, g));
    }
    prepend(...c) {
      c = c.reverse();
      for (let m of c) {
        let f = this.normalize(m, this.first, "prepend").reverse();
        for (let g of f) this.proxyOf.nodes.unshift(g);
        for (let g in this.indexes)
          this.indexes[g] = this.indexes[g] + f.length;
      }
      return this.markDirty(), this;
    }
    push(c) {
      return c.parent = this, this.proxyOf.nodes.push(c), this;
    }
    removeAll() {
      for (let c of this.proxyOf.nodes) c.parent = void 0;
      return this.proxyOf.nodes = [], this.markDirty(), this;
    }
    removeChild(c) {
      c = this.index(c), this.proxyOf.nodes[c].parent = void 0, this.proxyOf.nodes.splice(c, 1);
      let m;
      for (let f in this.indexes)
        m = this.indexes[f], m >= c && (this.indexes[f] = m - 1);
      return this.markDirty(), this;
    }
    replaceValues(c, m, f) {
      return f || (f = m, m = {}), this.walkDecls((g) => {
        m.props && !m.props.includes(g.prop) || m.fast && !g.value.includes(m.fast) || (g.value = g.value.replace(c, f));
      }), this.markDirty(), this;
    }
    some(c) {
      return this.nodes.some(c);
    }
    walk(c) {
      return this.each((m, f) => {
        let g;
        try {
          g = c(m, f);
        } catch (x) {
          throw m.addToError(x);
        }
        return g !== !1 && m.walk && (g = m.walk(c)), g;
      });
    }
    walkAtRules(c, m) {
      return m ? c instanceof RegExp ? this.walk((f, g) => {
        if (f.type === "atrule" && c.test(f.name))
          return m(f, g);
      }) : this.walk((f, g) => {
        if (f.type === "atrule" && f.name === c)
          return m(f, g);
      }) : (m = c, this.walk((f, g) => {
        if (f.type === "atrule")
          return m(f, g);
      }));
    }
    walkComments(c) {
      return this.walk((m, f) => {
        if (m.type === "comment")
          return c(m, f);
      });
    }
    walkDecls(c, m) {
      return m ? c instanceof RegExp ? this.walk((f, g) => {
        if (f.type === "decl" && c.test(f.prop))
          return m(f, g);
      }) : this.walk((f, g) => {
        if (f.type === "decl" && f.prop === c)
          return m(f, g);
      }) : (m = c, this.walk((f, g) => {
        if (f.type === "decl")
          return m(f, g);
      }));
    }
    walkRules(c, m) {
      return m ? c instanceof RegExp ? this.walk((f, g) => {
        if (f.type === "rule" && c.test(f.selector))
          return m(f, g);
      }) : this.walk((f, g) => {
        if (f.type === "rule" && f.selector === c)
          return m(f, g);
      }) : (m = c, this.walk((f, g) => {
        if (f.type === "rule")
          return m(f, g);
      }));
    }
    get first() {
      if (this.proxyOf.nodes)
        return this.proxyOf.nodes[0];
    }
    get last() {
      if (this.proxyOf.nodes)
        return this.proxyOf.nodes[this.proxyOf.nodes.length - 1];
    }
  }
  return h.registerParse = (u) => {
    s = u;
  }, h.registerRule = (u) => {
    l = u;
  }, h.registerAtRule = (u) => {
    p = u;
  }, h.registerRoot = (u) => {
    o = u;
  }, bn = h, h.default = h, h.rebuild = (u) => {
    u.type === "atrule" ? Object.setPrototypeOf(u, p.prototype) : u.type === "rule" ? Object.setPrototypeOf(u, l.prototype) : u.type === "decl" ? Object.setPrototypeOf(u, r.prototype) : u.type === "comment" ? Object.setPrototypeOf(u, i.prototype) : u.type === "root" && Object.setPrototypeOf(u, o.prototype), u[t] = !0, u.nodes && u.nodes.forEach((c) => {
      h.rebuild(c);
    });
  }, bn;
}
var vn, Rs;
function li() {
  if (Rs) return vn;
  Rs = 1;
  let e = ct(), t, r;
  class i extends e {
    constructor(s) {
      super({ type: "document", ...s }), this.nodes || (this.nodes = []);
    }
    toResult(s = {}) {
      return new t(new r(), this, s).stringify();
    }
  }
  return i.registerLazyResult = (n) => {
    t = n;
  }, i.registerProcessor = (n) => {
    r = n;
  }, vn = i, i.default = i, vn;
}
var wn, Os;
function Ho() {
  if (Os) return wn;
  Os = 1;
  let e = {};
  return wn = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, wn;
}
var xn, Is;
function Vo() {
  if (Is) return xn;
  Is = 1;
  class e {
    constructor(r, i = {}) {
      if (this.type = "warning", this.text = r, i.node && i.node.source) {
        let n = i.node.rangeBy(i);
        this.line = n.start.line, this.column = n.start.column, this.endLine = n.end.line, this.endColumn = n.end.column;
      }
      for (let n in i) this[n] = i[n];
    }
    toString() {
      return this.node ? this.node.error(this.text, {
        index: this.index,
        plugin: this.plugin,
        word: this.word
      }).message : this.plugin ? this.plugin + ": " + this.text : this.text;
    }
  }
  return xn = e, e.default = e, xn;
}
var kn, As;
function ci() {
  if (As) return kn;
  As = 1;
  let e = Vo();
  class t {
    constructor(i, n, s) {
      this.processor = i, this.messages = [], this.root = n, this.opts = s, this.css = void 0, this.map = void 0;
    }
    toString() {
      return this.css;
    }
    warn(i, n = {}) {
      n.plugin || this.lastPlugin && this.lastPlugin.postcssPlugin && (n.plugin = this.lastPlugin.postcssPlugin);
      let s = new e(i, n);
      return this.messages.push(s), s;
    }
    warnings() {
      return this.messages.filter((i) => i.type === "warning");
    }
    get content() {
      return this.css;
    }
  }
  return kn = t, t.default = t, kn;
}
var Sn, Ls;
function $u() {
  if (Ls) return Sn;
  Ls = 1;
  const e = 39, t = 34, r = 92, i = 47, n = 10, s = 32, l = 12, p = 9, o = 13, d = 91, a = 93, h = 40, u = 41, c = 123, m = 125, f = 59, g = 42, x = 58, y = 64, v = /[\t\n\f\r "#'()/;[\\\]{}]/g, S = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, w = /.[\r\n"'(/\\]/, b = /[\da-f]/i;
  return Sn = function(E, A = {}) {
    let M = E.css.valueOf(), _ = A.ignoreErrors, P, C, we, he, j, B, K, ee, ie, q, Ie = M.length, O = 0, le = [], ce = [];
    function Ae() {
      return O;
    }
    function de($) {
      throw E.error("Unclosed " + $, O);
    }
    function xe() {
      return ce.length === 0 && O >= Ie;
    }
    function Le($) {
      if (ce.length) return ce.pop();
      if (O >= Ie) return;
      let se = $ ? $.ignoreUnclosed : !1;
      switch (P = M.charCodeAt(O), P) {
        case n:
        case s:
        case p:
        case o:
        case l: {
          C = O;
          do
            C += 1, P = M.charCodeAt(C);
          while (P === s || P === n || P === p || P === o || P === l);
          q = ["space", M.slice(O, C)], O = C - 1;
          break;
        }
        case d:
        case a:
        case c:
        case m:
        case x:
        case f:
        case u: {
          let R = String.fromCharCode(P);
          q = [R, R, O];
          break;
        }
        case h: {
          if (ee = le.length ? le.pop()[1] : "", ie = M.charCodeAt(O + 1), ee === "url" && ie !== e && ie !== t && ie !== s && ie !== n && ie !== p && ie !== l && ie !== o) {
            C = O;
            do {
              if (B = !1, C = M.indexOf(")", C + 1), C === -1)
                if (_ || se) {
                  C = O;
                  break;
                } else
                  de("bracket");
              for (K = C; M.charCodeAt(K - 1) === r; )
                K -= 1, B = !B;
            } while (B);
            q = ["brackets", M.slice(O, C + 1), O, C], O = C;
          } else
            C = M.indexOf(")", O + 1), he = M.slice(O, C + 1), C === -1 || w.test(he) ? q = ["(", "(", O] : (q = ["brackets", he, O, C], O = C);
          break;
        }
        case e:
        case t: {
          we = P === e ? "'" : '"', C = O;
          do {
            if (B = !1, C = M.indexOf(we, C + 1), C === -1)
              if (_ || se) {
                C = O + 1;
                break;
              } else
                de("string");
            for (K = C; M.charCodeAt(K - 1) === r; )
              K -= 1, B = !B;
          } while (B);
          q = ["string", M.slice(O, C + 1), O, C], O = C;
          break;
        }
        case y: {
          v.lastIndex = O + 1, v.test(M), v.lastIndex === 0 ? C = M.length - 1 : C = v.lastIndex - 2, q = ["at-word", M.slice(O, C + 1), O, C], O = C;
          break;
        }
        case r: {
          for (C = O, j = !0; M.charCodeAt(C + 1) === r; )
            C += 1, j = !j;
          if (P = M.charCodeAt(C + 1), j && P !== i && P !== s && P !== n && P !== p && P !== o && P !== l && (C += 1, b.test(M.charAt(C)))) {
            for (; b.test(M.charAt(C + 1)); )
              C += 1;
            M.charCodeAt(C + 1) === s && (C += 1);
          }
          q = ["word", M.slice(O, C + 1), O, C], O = C;
          break;
        }
        default: {
          P === i && M.charCodeAt(O + 1) === g ? (C = M.indexOf("*/", O + 2) + 1, C === 0 && (_ || se ? C = M.length : de("comment")), q = ["comment", M.slice(O, C + 1), O, C], O = C) : (S.lastIndex = O + 1, S.test(M), S.lastIndex === 0 ? C = M.length - 1 : C = S.lastIndex - 2, q = ["word", M.slice(O, C + 1), O, C], le.push(q), O = C);
          break;
        }
      }
      return O++, q;
    }
    function Te($) {
      ce.push($);
    }
    return {
      back: Te,
      endOfFile: xe,
      nextToken: Le,
      position: Ae
    };
  }, Sn;
}
var Cn, Ts;
function ui() {
  if (Ts) return Cn;
  Ts = 1;
  let e = ct();
  class t extends e {
    constructor(i) {
      super(i), this.type = "atrule";
    }
    append(...i) {
      return this.proxyOf.nodes || (this.nodes = []), super.append(...i);
    }
    prepend(...i) {
      return this.proxyOf.nodes || (this.nodes = []), super.prepend(...i);
    }
  }
  return Cn = t, t.default = t, e.registerAtRule(t), Cn;
}
var En, Ps;
function Dt() {
  if (Ps) return En;
  Ps = 1;
  let e = ct(), t, r;
  class i extends e {
    constructor(s) {
      super(s), this.type = "root", this.nodes || (this.nodes = []);
    }
    normalize(s, l, p) {
      let o = super.normalize(s);
      if (l) {
        if (p === "prepend")
          this.nodes.length > 1 ? l.raws.before = this.nodes[1].raws.before : delete l.raws.before;
        else if (this.first !== l)
          for (let d of o)
            d.raws.before = l.raws.before;
      }
      return o;
    }
    removeChild(s, l) {
      let p = this.index(s);
      return !l && p === 0 && this.nodes.length > 1 && (this.nodes[1].raws.before = this.nodes[p].raws.before), super.removeChild(s);
    }
    toResult(s = {}) {
      return new t(new r(), this, s).stringify();
    }
  }
  return i.registerLazyResult = (n) => {
    t = n;
  }, i.registerProcessor = (n) => {
    r = n;
  }, En = i, i.default = i, e.registerRoot(i), En;
}
var Mn, Ns;
function Go() {
  if (Ns) return Mn;
  Ns = 1;
  let e = {
    comma(t) {
      return e.split(t, [","], !0);
    },
    space(t) {
      let r = [" ", `
`, "	"];
      return e.split(t, r);
    },
    split(t, r, i) {
      let n = [], s = "", l = !1, p = 0, o = !1, d = "", a = !1;
      for (let h of t)
        a ? a = !1 : h === "\\" ? a = !0 : o ? h === d && (o = !1) : h === '"' || h === "'" ? (o = !0, d = h) : h === "(" ? p += 1 : h === ")" ? p > 0 && (p -= 1) : p === 0 && r.includes(h) && (l = !0), l ? (s !== "" && n.push(s.trim()), s = "", l = !1) : s += h;
      return (i || s !== "") && n.push(s.trim()), n;
    }
  };
  return Mn = e, e.default = e, Mn;
}
var Rn, _s;
function di() {
  if (_s) return Rn;
  _s = 1;
  let e = ct(), t = Go();
  class r extends e {
    constructor(n) {
      super(n), this.type = "rule", this.nodes || (this.nodes = []);
    }
    get selectors() {
      return t.comma(this.selector);
    }
    set selectors(n) {
      let s = this.selector ? this.selector.match(/,\s*/) : null, l = s ? s[0] : "," + this.raw("between", "beforeOpen");
      this.selector = n.join(l);
    }
  }
  return Rn = r, r.default = r, e.registerRule(r), Rn;
}
var On, $s;
function Du() {
  if ($s) return On;
  $s = 1;
  let e = kr(), t = $u(), r = Cr(), i = ui(), n = Dt(), s = di();
  const l = {
    empty: !0,
    space: !0
  };
  function p(d) {
    for (let a = d.length - 1; a >= 0; a--) {
      let h = d[a], u = h[3] || h[2];
      if (u) return u;
    }
  }
  class o {
    constructor(a) {
      this.input = a, this.root = new n(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.createTokenizer(), this.root.source = { input: a, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(a) {
      let h = new i();
      h.name = a[1].slice(1), h.name === "" && this.unnamedAtrule(h, a), this.init(h, a[2]);
      let u, c, m, f = !1, g = !1, x = [], y = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (a = this.tokenizer.nextToken(), u = a[0], u === "(" || u === "[" ? y.push(u === "(" ? ")" : "]") : u === "{" && y.length > 0 ? y.push("}") : u === y[y.length - 1] && y.pop(), y.length === 0)
          if (u === ";") {
            h.source.end = this.getPosition(a[2]), h.source.end.offset++, this.semicolon = !0;
            break;
          } else if (u === "{") {
            g = !0;
            break;
          } else if (u === "}") {
            if (x.length > 0) {
              for (m = x.length - 1, c = x[m]; c && c[0] === "space"; )
                c = x[--m];
              c && (h.source.end = this.getPosition(c[3] || c[2]), h.source.end.offset++);
            }
            this.end(a);
            break;
          } else
            x.push(a);
        else
          x.push(a);
        if (this.tokenizer.endOfFile()) {
          f = !0;
          break;
        }
      }
      h.raws.between = this.spacesAndCommentsFromEnd(x), x.length ? (h.raws.afterName = this.spacesAndCommentsFromStart(x), this.raw(h, "params", x), f && (a = x[x.length - 1], h.source.end = this.getPosition(a[3] || a[2]), h.source.end.offset++, this.spaces = h.raws.between, h.raws.between = "")) : (h.raws.afterName = "", h.params = ""), g && (h.nodes = [], this.current = h);
    }
    checkMissedSemicolon(a) {
      let h = this.colon(a);
      if (h === !1) return;
      let u = 0, c;
      for (let m = h - 1; m >= 0 && (c = a[m], !(c[0] !== "space" && (u += 1, u === 2))); m--)
        ;
      throw this.input.error(
        "Missed semicolon",
        c[0] === "word" ? c[3] + 1 : c[2]
      );
    }
    colon(a) {
      let h = 0, u, c, m;
      for (let [f, g] of a.entries()) {
        if (u = g, c = u[0], c === "(" && (h += 1), c === ")" && (h -= 1), h === 0 && c === ":")
          if (!m)
            this.doubleColon(u);
          else {
            if (m[0] === "word" && m[1] === "progid")
              continue;
            return f;
          }
        m = u;
      }
      return !1;
    }
    comment(a) {
      let h = new r();
      this.init(h, a[2]), h.source.end = this.getPosition(a[3] || a[2]), h.source.end.offset++;
      let u = a[1].slice(2, -2);
      if (/^\s*$/.test(u))
        h.text = "", h.raws.left = u, h.raws.right = "";
      else {
        let c = u.match(/^(\s*)([^]*\S)(\s*)$/);
        h.text = c[2], h.raws.left = c[1], h.raws.right = c[3];
      }
    }
    createTokenizer() {
      this.tokenizer = t(this.input);
    }
    decl(a, h) {
      let u = new e();
      this.init(u, a[0][2]);
      let c = a[a.length - 1];
      for (c[0] === ";" && (this.semicolon = !0, a.pop()), u.source.end = this.getPosition(
        c[3] || c[2] || p(a)
      ), u.source.end.offset++; a[0][0] !== "word"; )
        a.length === 1 && this.unknownWord(a), u.raws.before += a.shift()[1];
      for (u.source.start = this.getPosition(a[0][2]), u.prop = ""; a.length; ) {
        let y = a[0][0];
        if (y === ":" || y === "space" || y === "comment")
          break;
        u.prop += a.shift()[1];
      }
      u.raws.between = "";
      let m;
      for (; a.length; )
        if (m = a.shift(), m[0] === ":") {
          u.raws.between += m[1];
          break;
        } else
          m[0] === "word" && /\w/.test(m[1]) && this.unknownWord([m]), u.raws.between += m[1];
      (u.prop[0] === "_" || u.prop[0] === "*") && (u.raws.before += u.prop[0], u.prop = u.prop.slice(1));
      let f = [], g;
      for (; a.length && (g = a[0][0], !(g !== "space" && g !== "comment")); )
        f.push(a.shift());
      this.precheckMissedSemicolon(a);
      for (let y = a.length - 1; y >= 0; y--) {
        if (m = a[y], m[1].toLowerCase() === "!important") {
          u.important = !0;
          let v = this.stringFrom(a, y);
          v = this.spacesFromEnd(a) + v, v !== " !important" && (u.raws.important = v);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let v = a.slice(0), S = "";
          for (let w = y; w > 0; w--) {
            let b = v[w][0];
            if (S.trim().indexOf("!") === 0 && b !== "space")
              break;
            S = v.pop()[1] + S;
          }
          S.trim().indexOf("!") === 0 && (u.important = !0, u.raws.important = S, a = v);
        }
        if (m[0] !== "space" && m[0] !== "comment")
          break;
      }
      a.some((y) => y[0] !== "space" && y[0] !== "comment") && (u.raws.between += f.map((y) => y[1]).join(""), f = []), this.raw(u, "value", f.concat(a), h), u.value.includes(":") && !h && this.checkMissedSemicolon(a);
    }
    doubleColon(a) {
      throw this.input.error(
        "Double colon",
        { offset: a[2] },
        { offset: a[2] + a[1].length }
      );
    }
    emptyRule(a) {
      let h = new s();
      this.init(h, a[2]), h.selector = "", h.raws.between = "", this.current = h;
    }
    end(a) {
      this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.semicolon = !1, this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.spaces = "", this.current.parent ? (this.current.source.end = this.getPosition(a[2]), this.current.source.end.offset++, this.current = this.current.parent) : this.unexpectedClose(a);
    }
    endFile() {
      this.current.parent && this.unclosedBlock(), this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.root.source.end = this.getPosition(this.tokenizer.position());
    }
    freeSemicolon(a) {
      if (this.spaces += a[1], this.current.nodes) {
        let h = this.current.nodes[this.current.nodes.length - 1];
        h && h.type === "rule" && !h.raws.ownSemicolon && (h.raws.ownSemicolon = this.spaces, this.spaces = "");
      }
    }
    // Helpers
    getPosition(a) {
      let h = this.input.fromOffset(a);
      return {
        column: h.col,
        line: h.line,
        offset: a
      };
    }
    init(a, h) {
      this.current.push(a), a.source = {
        input: this.input,
        start: this.getPosition(h)
      }, a.raws.before = this.spaces, this.spaces = "", a.type !== "comment" && (this.semicolon = !1);
    }
    other(a) {
      let h = !1, u = null, c = !1, m = null, f = [], g = a[1].startsWith("--"), x = [], y = a;
      for (; y; ) {
        if (u = y[0], x.push(y), u === "(" || u === "[")
          m || (m = y), f.push(u === "(" ? ")" : "]");
        else if (g && c && u === "{")
          m || (m = y), f.push("}");
        else if (f.length === 0)
          if (u === ";")
            if (c) {
              this.decl(x, g);
              return;
            } else
              break;
          else if (u === "{") {
            this.rule(x);
            return;
          } else if (u === "}") {
            this.tokenizer.back(x.pop()), h = !0;
            break;
          } else u === ":" && (c = !0);
        else u === f[f.length - 1] && (f.pop(), f.length === 0 && (m = null));
        y = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(m), h && c) {
        if (!g)
          for (; x.length && (y = x[x.length - 1][0], !(y !== "space" && y !== "comment")); )
            this.tokenizer.back(x.pop());
        this.decl(x, g);
      } else
        this.unknownWord(x);
    }
    parse() {
      let a;
      for (; !this.tokenizer.endOfFile(); )
        switch (a = this.tokenizer.nextToken(), a[0]) {
          case "space":
            this.spaces += a[1];
            break;
          case ";":
            this.freeSemicolon(a);
            break;
          case "}":
            this.end(a);
            break;
          case "comment":
            this.comment(a);
            break;
          case "at-word":
            this.atrule(a);
            break;
          case "{":
            this.emptyRule(a);
            break;
          default:
            this.other(a);
            break;
        }
      this.endFile();
    }
    precheckMissedSemicolon() {
    }
    raw(a, h, u, c) {
      let m, f, g = u.length, x = "", y = !0, v, S;
      for (let w = 0; w < g; w += 1)
        m = u[w], f = m[0], f === "space" && w === g - 1 && !c ? y = !1 : f === "comment" ? (S = u[w - 1] ? u[w - 1][0] : "empty", v = u[w + 1] ? u[w + 1][0] : "empty", !l[S] && !l[v] ? x.slice(-1) === "," ? y = !1 : x += m[1] : y = !1) : x += m[1];
      if (!y) {
        let w = u.reduce((b, k) => b + k[1], "");
        a.raws[h] = { raw: w, value: x };
      }
      a[h] = x;
    }
    rule(a) {
      a.pop();
      let h = new s();
      this.init(h, a[0][2]), h.raws.between = this.spacesAndCommentsFromEnd(a), this.raw(h, "selector", a), this.current = h;
    }
    spacesAndCommentsFromEnd(a) {
      let h, u = "";
      for (; a.length && (h = a[a.length - 1][0], !(h !== "space" && h !== "comment")); )
        u = a.pop()[1] + u;
      return u;
    }
    // Errors
    spacesAndCommentsFromStart(a) {
      let h, u = "";
      for (; a.length && (h = a[0][0], !(h !== "space" && h !== "comment")); )
        u += a.shift()[1];
      return u;
    }
    spacesFromEnd(a) {
      let h, u = "";
      for (; a.length && (h = a[a.length - 1][0], h === "space"); )
        u = a.pop()[1] + u;
      return u;
    }
    stringFrom(a, h) {
      let u = "";
      for (let c = h; c < a.length; c++)
        u += a[c][1];
      return a.splice(h, a.length - h), u;
    }
    unclosedBlock() {
      let a = this.current.source.start;
      throw this.input.error("Unclosed block", a.line, a.column);
    }
    unclosedBracket(a) {
      throw this.input.error(
        "Unclosed bracket",
        { offset: a[2] },
        { offset: a[2] + 1 }
      );
    }
    unexpectedClose(a) {
      throw this.input.error(
        "Unexpected }",
        { offset: a[2] },
        { offset: a[2] + 1 }
      );
    }
    unknownWord(a) {
      throw this.input.error(
        "Unknown word",
        { offset: a[0][2] },
        { offset: a[0][2] + a[0][1].length }
      );
    }
    unnamedAtrule(a, h) {
      throw this.input.error(
        "At-rule without name",
        { offset: h[2] },
        { offset: h[2] + h[1].length }
      );
    }
  }
  return On = o, On;
}
var In, Ds;
function hi() {
  if (Ds) return In;
  Ds = 1;
  let e = ct(), t = Du(), r = Sr();
  function i(n, s) {
    let l = new r(n, s), p = new t(l);
    try {
      p.parse();
    } catch (o) {
      throw process.env.NODE_ENV !== "production" && o.name === "CssSyntaxError" && s && s.from && (/\.scss$/i.test(s.from) ? o.message += `
You tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser` : /\.sass/i.test(s.from) ? o.message += `
You tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser` : /\.less$/i.test(s.from) && (o.message += `
You tried to parse Less with the standard CSS parser; try again with the postcss-less parser`)), o;
    }
    return p.root;
  }
  return In = i, i.default = i, e.registerParse(i), In;
}
var An, zs;
function Yo() {
  if (zs) return An;
  zs = 1;
  let { isClean: e, my: t } = ai(), r = qo(), i = wr(), n = ct(), s = li(), l = Ho(), p = ci(), o = hi(), d = Dt();
  const a = {
    atrule: "AtRule",
    comment: "Comment",
    decl: "Declaration",
    document: "Document",
    root: "Root",
    rule: "Rule"
  }, h = {
    AtRule: !0,
    AtRuleExit: !0,
    Comment: !0,
    CommentExit: !0,
    Declaration: !0,
    DeclarationExit: !0,
    Document: !0,
    DocumentExit: !0,
    Once: !0,
    OnceExit: !0,
    postcssPlugin: !0,
    prepare: !0,
    Root: !0,
    RootExit: !0,
    Rule: !0,
    RuleExit: !0
  }, u = {
    Once: !0,
    postcssPlugin: !0,
    prepare: !0
  }, c = 0;
  function m(S) {
    return typeof S == "object" && typeof S.then == "function";
  }
  function f(S) {
    let w = !1, b = a[S.type];
    return S.type === "decl" ? w = S.prop.toLowerCase() : S.type === "atrule" && (w = S.name.toLowerCase()), w && S.append ? [
      b,
      b + "-" + w,
      c,
      b + "Exit",
      b + "Exit-" + w
    ] : w ? [b, b + "-" + w, b + "Exit", b + "Exit-" + w] : S.append ? [b, c, b + "Exit"] : [b, b + "Exit"];
  }
  function g(S) {
    let w;
    return S.type === "document" ? w = ["Document", c, "DocumentExit"] : S.type === "root" ? w = ["Root", c, "RootExit"] : w = f(S), {
      eventIndex: 0,
      events: w,
      iterator: 0,
      node: S,
      visitorIndex: 0,
      visitors: []
    };
  }
  function x(S) {
    return S[e] = !1, S.nodes && S.nodes.forEach((w) => x(w)), S;
  }
  let y = {};
  class v {
    constructor(w, b, k) {
      this.stringified = !1, this.processed = !1;
      let E;
      if (typeof b == "object" && b !== null && (b.type === "root" || b.type === "document"))
        E = x(b);
      else if (b instanceof v || b instanceof p)
        E = x(b.root), b.map && (typeof k.map > "u" && (k.map = {}), k.map.inline || (k.map.inline = !1), k.map.prev = b.map);
      else {
        let A = o;
        k.syntax && (A = k.syntax.parse), k.parser && (A = k.parser), A.parse && (A = A.parse);
        try {
          E = A(b, k);
        } catch (M) {
          this.processed = !0, this.error = M;
        }
        E && !E[t] && n.rebuild(E);
      }
      this.result = new p(w, E, k), this.helpers = { ...y, postcss: y, result: this.result }, this.plugins = this.processor.plugins.map((A) => typeof A == "object" && A.prepare ? { ...A, ...A.prepare(this.result) } : A);
    }
    async() {
      return this.error ? Promise.reject(this.error) : this.processed ? Promise.resolve(this.result) : (this.processing || (this.processing = this.runAsync()), this.processing);
    }
    catch(w) {
      return this.async().catch(w);
    }
    finally(w) {
      return this.async().then(w, w);
    }
    getAsyncError() {
      throw new Error("Use process(css).then(cb) to work with async plugins");
    }
    handleError(w, b) {
      let k = this.result.lastPlugin;
      try {
        if (b && b.addToError(w), this.error = w, w.name === "CssSyntaxError" && !w.plugin)
          w.plugin = k.postcssPlugin, w.setMessage();
        else if (k.postcssVersion && process.env.NODE_ENV !== "production") {
          let E = k.postcssPlugin, A = k.postcssVersion, M = this.result.processor.version, _ = A.split("."), P = M.split(".");
          (_[0] !== P[0] || parseInt(_[1]) > parseInt(P[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + M + ", but " + E + " uses " + A + ". Perhaps this is the source of the error below."
          );
        }
      } catch (E) {
        console && console.error && console.error(E);
      }
      return w;
    }
    prepareVisitors() {
      this.listeners = {};
      let w = (b, k, E) => {
        this.listeners[k] || (this.listeners[k] = []), this.listeners[k].push([b, E]);
      };
      for (let b of this.plugins)
        if (typeof b == "object")
          for (let k in b) {
            if (!h[k] && /^[A-Z]/.test(k))
              throw new Error(
                `Unknown event ${k} in ${b.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!u[k])
              if (typeof b[k] == "object")
                for (let E in b[k])
                  E === "*" ? w(b, k, b[k][E]) : w(
                    b,
                    k + "-" + E.toLowerCase(),
                    b[k][E]
                  );
              else typeof b[k] == "function" && w(b, k, b[k]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let w = 0; w < this.plugins.length; w++) {
        let b = this.plugins[w], k = this.runOnRoot(b);
        if (m(k))
          try {
            await k;
          } catch (E) {
            throw this.handleError(E);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let w = this.result.root;
        for (; !w[e]; ) {
          w[e] = !0;
          let b = [g(w)];
          for (; b.length > 0; ) {
            let k = this.visitTick(b);
            if (m(k))
              try {
                await k;
              } catch (E) {
                let A = b[b.length - 1].node;
                throw this.handleError(E, A);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [b, k] of this.listeners.OnceExit) {
            this.result.lastPlugin = b;
            try {
              if (w.type === "document") {
                let E = w.nodes.map(
                  (A) => k(A, this.helpers)
                );
                await Promise.all(E);
              } else
                await k(w, this.helpers);
            } catch (E) {
              throw this.handleError(E);
            }
          }
      }
      return this.processed = !0, this.stringify();
    }
    runOnRoot(w) {
      this.result.lastPlugin = w;
      try {
        if (typeof w == "object" && w.Once) {
          if (this.result.root.type === "document") {
            let b = this.result.root.nodes.map(
              (k) => w.Once(k, this.helpers)
            );
            return m(b[0]) ? Promise.all(b) : b;
          }
          return w.Once(this.result.root, this.helpers);
        } else if (typeof w == "function")
          return w(this.result.root, this.result);
      } catch (b) {
        throw this.handleError(b);
      }
    }
    stringify() {
      if (this.error) throw this.error;
      if (this.stringified) return this.result;
      this.stringified = !0, this.sync();
      let w = this.result.opts, b = i;
      w.syntax && (b = w.syntax.stringify), w.stringifier && (b = w.stringifier), b.stringify && (b = b.stringify);
      let E = new r(b, this.result.root, this.result.opts).generate();
      return this.result.css = E[0], this.result.map = E[1], this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      if (this.processed = !0, this.processing)
        throw this.getAsyncError();
      for (let w of this.plugins) {
        let b = this.runOnRoot(w);
        if (m(b))
          throw this.getAsyncError();
      }
      if (this.prepareVisitors(), this.hasListener) {
        let w = this.result.root;
        for (; !w[e]; )
          w[e] = !0, this.walkSync(w);
        if (this.listeners.OnceExit)
          if (w.type === "document")
            for (let b of w.nodes)
              this.visitSync(this.listeners.OnceExit, b);
          else
            this.visitSync(this.listeners.OnceExit, w);
      }
      return this.result;
    }
    then(w, b) {
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || l(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(w, b);
    }
    toString() {
      return this.css;
    }
    visitSync(w, b) {
      for (let [k, E] of w) {
        this.result.lastPlugin = k;
        let A;
        try {
          A = E(b, this.helpers);
        } catch (M) {
          throw this.handleError(M, b.proxyOf);
        }
        if (b.type !== "root" && b.type !== "document" && !b.parent)
          return !0;
        if (m(A))
          throw this.getAsyncError();
      }
    }
    visitTick(w) {
      let b = w[w.length - 1], { node: k, visitors: E } = b;
      if (k.type !== "root" && k.type !== "document" && !k.parent) {
        w.pop();
        return;
      }
      if (E.length > 0 && b.visitorIndex < E.length) {
        let [M, _] = E[b.visitorIndex];
        b.visitorIndex += 1, b.visitorIndex === E.length && (b.visitors = [], b.visitorIndex = 0), this.result.lastPlugin = M;
        try {
          return _(k.toProxy(), this.helpers);
        } catch (P) {
          throw this.handleError(P, k);
        }
      }
      if (b.iterator !== 0) {
        let M = b.iterator, _;
        for (; _ = k.nodes[k.indexes[M]]; )
          if (k.indexes[M] += 1, !_[e]) {
            _[e] = !0, w.push(g(_));
            return;
          }
        b.iterator = 0, delete k.indexes[M];
      }
      let A = b.events;
      for (; b.eventIndex < A.length; ) {
        let M = A[b.eventIndex];
        if (b.eventIndex += 1, M === c) {
          k.nodes && k.nodes.length && (k[e] = !0, b.iterator = k.getIterator());
          return;
        } else if (this.listeners[M]) {
          b.visitors = this.listeners[M];
          return;
        }
      }
      w.pop();
    }
    walkSync(w) {
      w[e] = !0;
      let b = f(w);
      for (let k of b)
        if (k === c)
          w.nodes && w.each((E) => {
            E[e] || this.walkSync(E);
          });
        else {
          let E = this.listeners[k];
          if (E && this.visitSync(E, w.toProxy()))
            return;
        }
    }
    warnings() {
      return this.sync().warnings();
    }
    get content() {
      return this.stringify().content;
    }
    get css() {
      return this.stringify().css;
    }
    get map() {
      return this.stringify().map;
    }
    get messages() {
      return this.sync().messages;
    }
    get opts() {
      return this.result.opts;
    }
    get processor() {
      return this.result.processor;
    }
    get root() {
      return this.sync().root;
    }
    get [Symbol.toStringTag]() {
      return "LazyResult";
    }
  }
  return v.registerPostcss = (S) => {
    y = S;
  }, An = v, v.default = v, d.registerLazyResult(v), s.registerLazyResult(v), An;
}
var Ln, Fs;
function zu() {
  if (Fs) return Ln;
  Fs = 1;
  let e = qo(), t = wr(), r = Ho(), i = hi();
  const n = ci();
  class s {
    constructor(p, o, d) {
      o = o.toString(), this.stringified = !1, this._processor = p, this._css = o, this._opts = d, this._map = void 0;
      let a, h = t;
      this.result = new n(this._processor, a, this._opts), this.result.css = o;
      let u = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return u.root;
        }
      });
      let c = new e(h, a, this._opts, o);
      if (c.isMap()) {
        let [m, f] = c.generate();
        m && (this.result.css = m), f && (this.result.map = f);
      } else
        c.clearAnnotation(), this.result.css = c.css;
    }
    async() {
      return this.error ? Promise.reject(this.error) : Promise.resolve(this.result);
    }
    catch(p) {
      return this.async().catch(p);
    }
    finally(p) {
      return this.async().then(p, p);
    }
    sync() {
      if (this.error) throw this.error;
      return this.result;
    }
    then(p, o) {
      return process.env.NODE_ENV !== "production" && ("from" in this._opts || r(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(p, o);
    }
    toString() {
      return this._css;
    }
    warnings() {
      return [];
    }
    get content() {
      return this.result.css;
    }
    get css() {
      return this.result.css;
    }
    get map() {
      return this.result.map;
    }
    get messages() {
      return [];
    }
    get opts() {
      return this.result.opts;
    }
    get processor() {
      return this.result.processor;
    }
    get root() {
      if (this._root)
        return this._root;
      let p, o = i;
      try {
        p = o(this._css, this._opts);
      } catch (d) {
        this.error = d;
      }
      if (this.error)
        throw this.error;
      return this._root = p, p;
    }
    get [Symbol.toStringTag]() {
      return "NoWorkResult";
    }
  }
  return Ln = s, s.default = s, Ln;
}
var Tn, Us;
function Fu() {
  if (Us) return Tn;
  Us = 1;
  let e = zu(), t = Yo(), r = li(), i = Dt();
  class n {
    constructor(l = []) {
      this.version = "8.4.38", this.plugins = this.normalize(l);
    }
    normalize(l) {
      let p = [];
      for (let o of l)
        if (o.postcss === !0 ? o = o() : o.postcss && (o = o.postcss), typeof o == "object" && Array.isArray(o.plugins))
          p = p.concat(o.plugins);
        else if (typeof o == "object" && o.postcssPlugin)
          p.push(o);
        else if (typeof o == "function")
          p.push(o);
        else if (typeof o == "object" && (o.parse || o.stringify)) {
          if (process.env.NODE_ENV !== "production")
            throw new Error(
              "PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation."
            );
        } else
          throw new Error(o + " is not a PostCSS plugin");
      return p;
    }
    process(l, p = {}) {
      return !this.plugins.length && !p.parser && !p.stringifier && !p.syntax ? new e(this, l, p) : new t(this, l, p);
    }
    use(l) {
      return this.plugins = this.plugins.concat(this.normalize([l])), this;
    }
  }
  return Tn = n, n.default = n, i.registerProcessor(n), r.registerProcessor(n), Tn;
}
var Pn, Bs;
function Uu() {
  if (Bs) return Pn;
  Bs = 1;
  let e = kr(), t = jo(), r = Cr(), i = ui(), n = Sr(), s = Dt(), l = di();
  function p(o, d) {
    if (Array.isArray(o)) return o.map((u) => p(u));
    let { inputs: a, ...h } = o;
    if (a) {
      d = [];
      for (let u of a) {
        let c = { ...u, __proto__: n.prototype };
        c.map && (c.map = {
          ...c.map,
          __proto__: t.prototype
        }), d.push(c);
      }
    }
    if (h.nodes && (h.nodes = o.nodes.map((u) => p(u, d))), h.source) {
      let { inputId: u, ...c } = h.source;
      h.source = c, u != null && (h.source.input = d[u]);
    }
    if (h.type === "root")
      return new s(h);
    if (h.type === "decl")
      return new e(h);
    if (h.type === "rule")
      return new l(h);
    if (h.type === "comment")
      return new r(h);
    if (h.type === "atrule")
      return new i(h);
    throw new Error("Unknown node type: " + o.type);
  }
  return Pn = p, p.default = p, Pn;
}
var Nn, Ws;
function Bu() {
  if (Ws) return Nn;
  Ws = 1;
  let e = oi(), t = kr(), r = Yo(), i = ct(), n = Fu(), s = wr(), l = Uu(), p = li(), o = Vo(), d = Cr(), a = ui(), h = ci(), u = Sr(), c = hi(), m = Go(), f = di(), g = Dt(), x = xr();
  function y(...v) {
    return v.length === 1 && Array.isArray(v[0]) && (v = v[0]), new n(v);
  }
  return y.plugin = function(S, w) {
    let b = !1;
    function k(...A) {
      console && console.warn && !b && (b = !0, console.warn(
        S + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        S + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let M = w(...A);
      return M.postcssPlugin = S, M.postcssVersion = new n().version, M;
    }
    let E;
    return Object.defineProperty(k, "postcss", {
      get() {
        return E || (E = k()), E;
      }
    }), k.process = function(A, M, _) {
      return y([k(_)]).process(A, M);
    }, k;
  }, y.stringify = s, y.parse = c, y.fromJSON = l, y.list = m, y.comment = (v) => new d(v), y.atRule = (v) => new a(v), y.decl = (v) => new t(v), y.rule = (v) => new f(v), y.root = (v) => new g(v), y.document = (v) => new p(v), y.CssSyntaxError = e, y.Declaration = t, y.Container = i, y.Processor = n, y.Document = p, y.Comment = d, y.Warning = o, y.AtRule = a, y.Result = h, y.Input = u, y.Rule = f, y.Root = g, y.Node = x, r.registerPostcss(y), Nn = y, y.default = y, Nn;
}
var Wu = Bu();
const ne = /* @__PURE__ */ Au(Wu);
ne.stringify;
ne.fromJSON;
ne.plugin;
ne.parse;
ne.list;
ne.document;
ne.comment;
ne.atRule;
ne.rule;
ne.decl;
ne.root;
ne.CssSyntaxError;
ne.Declaration;
ne.Container;
ne.Processor;
ne.Document;
ne.Comment;
ne.Warning;
ne.AtRule;
ne.Result;
ne.Input;
ne.Rule;
ne.Root;
ne.Node;
class pi {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(...t) {
    Re(this, "parentElement", null), Re(this, "parentNode", null), Re(this, "ownerDocument"), Re(this, "firstChild", null), Re(this, "lastChild", null), Re(this, "previousSibling", null), Re(this, "nextSibling", null), Re(this, "ELEMENT_NODE", 1), Re(this, "TEXT_NODE", 3), Re(this, "nodeType"), Re(this, "nodeName"), Re(this, "RRNodeType");
  }
  get childNodes() {
    const t = [];
    let r = this.firstChild;
    for (; r; )
      t.push(r), r = r.nextSibling;
    return t;
  }
  contains(t) {
    if (t instanceof pi) {
      if (t.ownerDocument !== this.ownerDocument) return !1;
      if (t === this) return !0;
    } else return !1;
    for (; t.parentNode; ) {
      if (t.parentNode === this) return !0;
      t = t.parentNode;
    }
    return !1;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  appendChild(t) {
    throw new Error(
      "RRDomException: Failed to execute 'appendChild' on 'RRNode': This RRNode type does not support this method."
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  insertBefore(t, r) {
    throw new Error(
      "RRDomException: Failed to execute 'insertBefore' on 'RRNode': This RRNode type does not support this method."
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeChild(t) {
    throw new Error(
      "RRDomException: Failed to execute 'removeChild' on 'RRNode': This RRNode type does not support this method."
    );
  }
  toString() {
    return "RRNode";
  }
}
const js = {
  Node: [
    "childNodes",
    "parentNode",
    "parentElement",
    "textContent",
    "ownerDocument"
  ],
  ShadowRoot: ["host", "styleSheets"],
  Element: ["shadowRoot", "querySelector", "querySelectorAll"],
  MutationObserver: []
}, qs = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, Jt = {}, Xo = {}, ju = () => !!globalThis.Zone;
function fi(e) {
  if (Jt[e])
    return Jt[e];
  const t = globalThis[e], r = t.prototype, i = e in js ? js[e] : void 0, n = !!(i && // @ts-expect-error 2345
  i.every(
    (p) => {
      var o, d;
      return !!((d = (o = Object.getOwnPropertyDescriptor(r, p)) == null ? void 0 : o.get) != null && d.toString().includes("[native code]"));
    }
  )), s = e in qs ? qs[e] : void 0, l = !!(s && s.every(
    // @ts-expect-error 2345
    (p) => {
      var o;
      return typeof r[p] == "function" && ((o = r[p]) == null ? void 0 : o.toString().includes("[native code]"));
    }
  ));
  if (n && l && !ju())
    return Jt[e] = t.prototype, t.prototype;
  try {
    const p = document.createElement("iframe");
    p.style.display = "none", document.body.appendChild(p);
    const o = p.contentWindow;
    if (!o) return t.prototype;
    const d = o[e].prototype;
    if (!d)
      return p.remove(), r;
    const a = navigator.userAgent;
    return a.includes("Safari") && !a.includes("Chrome") ? (p.classList.add("rr-block"), p.setAttribute("__rrwebUntaintedMutationObserver", ""), Xo[e] = () => p.remove()) : p.remove(), Jt[e] = d;
  } catch {
    return r;
  }
}
const _n = {};
function He(e, t, r) {
  var i;
  const n = `${e}.${String(r)}`;
  if (_n[n])
    return _n[n].call(
      t
    );
  const s = fi(e), l = (i = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : i.get;
  return l ? (_n[n] = l, l.call(t)) : t[r];
}
const $n = {};
function Jo(e, t, r) {
  const i = `${e}.${String(r)}`;
  if ($n[i])
    return $n[i].bind(
      t
    );
  const s = fi(e)[r];
  return typeof s != "function" ? t[r] : ($n[i] = s, s.bind(t));
}
function qu(e) {
  return He("Node", e, "ownerDocument");
}
function Hu(e) {
  return He("Node", e, "childNodes");
}
function Vu(e) {
  return He("Node", e, "parentNode");
}
function Gu(e) {
  return He("Node", e, "parentElement");
}
function Yu(e) {
  return He("Node", e, "textContent");
}
function Xu(e, t) {
  return Jo("Node", e, "contains")(t);
}
function Ju(e) {
  return Jo("Node", e, "getRootNode")();
}
function Ku(e) {
  return !e || !("host" in e) ? null : He("ShadowRoot", e, "host");
}
function Zu(e) {
  return e.styleSheets;
}
function Qu(e) {
  return !e || !("shadowRoot" in e) ? null : He("Element", e, "shadowRoot");
}
function ed(e, t) {
  return He("Element", e, "querySelector")(t);
}
function td(e, t) {
  return He("Element", e, "querySelectorAll")(t);
}
function Ko() {
  return [
    fi("MutationObserver").constructor,
    Xo.MutationObserver ?? (() => {
    })
  ];
}
let Nt = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (Nt = () => (/* @__PURE__ */ new Date()).getTime());
function ut(e, t, r) {
  try {
    if (!(t in e))
      return () => {
      };
    const i = e[t], n = r(i);
    return typeof n == "function" && (n.prototype = n.prototype || {}, Object.defineProperties(n, {
      __rrweb_original__: {
        enumerable: !1,
        value: i
      }
    })), e[t] = n, () => {
      e[t] = i;
    };
  } catch {
    return () => {
    };
  }
}
const F = {
  ownerDocument: qu,
  childNodes: Hu,
  parentNode: Vu,
  parentElement: Gu,
  textContent: Yu,
  contains: Xu,
  getRootNode: Ju,
  host: Ku,
  styleSheets: Zu,
  shadowRoot: Qu,
  querySelector: ed,
  querySelectorAll: td,
  nowTimestamp: Nt,
  mutationObserverCtor: Ko,
  patch: ut
};
function be(e, t, r = document) {
  const i = { capture: !0, passive: !0 };
  return r.addEventListener(e, t, i), () => r.removeEventListener(e, t, i);
}
const mt = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`;
let Hs = {
  map: {},
  getId() {
    return console.error(mt), -1;
  },
  getNode() {
    return console.error(mt), null;
  },
  removeNodeFromMap() {
    console.error(mt);
  },
  has() {
    return console.error(mt), !1;
  },
  reset() {
    console.error(mt);
  }
};
typeof window < "u" && window.Proxy && window.Reflect && (Hs = new Proxy(Hs, {
  get(e, t, r) {
    return t === "map" && console.error(mt), Reflect.get(e, t, r);
  }
}));
function _t(e, t, r = {}) {
  let i = null, n = 0;
  return function(...s) {
    const l = Date.now();
    !n && r.leading === !1 && (n = l);
    const p = t - (l - n), o = this;
    p <= 0 || p > t ? (i && (clearTimeout(i), i = null), n = l, e.apply(o, s)) : !i && r.trailing !== !1 && (i = setTimeout(() => {
      n = r.leading === !1 ? 0 : Date.now(), i = null, e.apply(o, s);
    }, p));
  };
}
function Er(e, t, r, i, n = window) {
  const s = n.Object.getOwnPropertyDescriptor(e, t);
  return n.Object.defineProperty(
    e,
    t,
    i ? r : {
      set(l) {
        setTimeout(() => {
          r.set.call(this, l);
        }, 0), s && s.set && s.set.call(this, l);
      }
    }
  ), () => Er(e, t, s || {}, !0);
}
function Zo(e) {
  var t, r, i, n;
  const s = e.document;
  return {
    left: s.scrollingElement ? s.scrollingElement.scrollLeft : e.pageXOffset !== void 0 ? e.pageXOffset : s.documentElement.scrollLeft || (s == null ? void 0 : s.body) && ((t = F.parentElement(s.body)) == null ? void 0 : t.scrollLeft) || ((r = s == null ? void 0 : s.body) == null ? void 0 : r.scrollLeft) || 0,
    top: s.scrollingElement ? s.scrollingElement.scrollTop : e.pageYOffset !== void 0 ? e.pageYOffset : (s == null ? void 0 : s.documentElement.scrollTop) || (s == null ? void 0 : s.body) && ((i = F.parentElement(s.body)) == null ? void 0 : i.scrollTop) || ((n = s == null ? void 0 : s.body) == null ? void 0 : n.scrollTop) || 0
  };
}
function Qo() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function ea() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function ta(e) {
  return e ? e.nodeType === e.ELEMENT_NODE ? e : F.parentElement(e) : null;
}
function ve(e, t, r, i) {
  if (!e)
    return !1;
  const n = ta(e);
  if (!n)
    return !1;
  try {
    if (typeof t == "string") {
      if (n.classList.contains(t) || i && n.closest("." + t) !== null) return !0;
    } else if (lr(n, t, i)) return !0;
  } catch {
  }
  return !!(r && (n.matches(r) || i && n.closest(r) !== null));
}
function rd(e, t) {
  return t.getId(e) !== -1;
}
function Dn(e, t, r) {
  return e.tagName === "TITLE" && r.headTitleMutations ? !0 : t.getId(e) === Pt;
}
function ra(e, t) {
  if (At(e))
    return !1;
  const r = t.getId(e);
  if (!t.has(r))
    return !0;
  const i = F.parentNode(e);
  return i && i.nodeType === e.DOCUMENT_NODE ? !1 : i ? ra(i, t) : !0;
}
function Wn(e) {
  return !!e.changedTouches;
}
function nd(e = window) {
  "NodeList" in e && !e.NodeList.prototype.forEach && (e.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in e && !e.DOMTokenList.prototype.forEach && (e.DOMTokenList.prototype.forEach = Array.prototype.forEach);
}
function na(e, t) {
  return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function ia(e, t) {
  return !!(e.nodeName === "LINK" && e.nodeType === e.ELEMENT_NODE && e.getAttribute && e.getAttribute("rel") === "stylesheet" && t.getMeta(e));
}
function jn(e) {
  return e ? e instanceof pi && "shadowRoot" in e ? !!e.shadowRoot : !!F.shadowRoot(e) : !1;
}
class id {
  constructor() {
    L(this, "id", 1), L(this, "styleIDMap", /* @__PURE__ */ new WeakMap()), L(this, "idStyleMap", /* @__PURE__ */ new Map());
  }
  getId(t) {
    return this.styleIDMap.get(t) ?? -1;
  }
  has(t) {
    return this.styleIDMap.has(t);
  }
  /**
   * @returns If the stylesheet is in the mirror, returns the id of the stylesheet. If not, return the new assigned id.
   */
  add(t, r) {
    if (this.has(t)) return this.getId(t);
    let i;
    return r === void 0 ? i = this.id++ : i = r, this.styleIDMap.set(t, i), this.idStyleMap.set(i, t), i;
  }
  getStyle(t) {
    return this.idStyleMap.get(t) || null;
  }
  reset() {
    this.styleIDMap = /* @__PURE__ */ new WeakMap(), this.idStyleMap = /* @__PURE__ */ new Map(), this.id = 1;
  }
  generateId() {
    return this.id++;
  }
}
function sa(e) {
  var t;
  let r = null;
  return "getRootNode" in e && ((t = F.getRootNode(e)) == null ? void 0 : t.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && F.host(F.getRootNode(e)) && (r = F.host(F.getRootNode(e))), r;
}
function sd(e) {
  let t = e, r;
  for (; r = sa(t); )
    t = r;
  return t;
}
function od(e) {
  const t = F.ownerDocument(e);
  if (!t) return !1;
  const r = sd(e);
  return F.contains(t, r);
}
function oa(e) {
  const t = F.ownerDocument(e);
  return t ? F.contains(t, e) || od(e) : !1;
}
var V = /* @__PURE__ */ ((e) => (e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom", e[e.Plugin = 6] = "Plugin", e[e.Asset = 7] = "Asset", e))(V || {}), U = /* @__PURE__ */ ((e) => (e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove", e[e.MediaInteraction = 7] = "MediaInteraction", e[e.StyleSheetRule = 8] = "StyleSheetRule", e[e.CanvasMutation = 9] = "CanvasMutation", e[e.Font = 10] = "Font", e[e.Log = 11] = "Log", e[e.Drag = 12] = "Drag", e[e.StyleDeclaration = 13] = "StyleDeclaration", e[e.Selection = 14] = "Selection", e[e.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", e[e.CustomElement = 16] = "CustomElement", e))(U || {}), ke = /* @__PURE__ */ ((e) => (e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd", e[e.TouchCancel = 10] = "TouchCancel", e))(ke || {}), je = /* @__PURE__ */ ((e) => (e[e.Mouse = 0] = "Mouse", e[e.Pen = 1] = "Pen", e[e.Touch = 2] = "Touch", e))(je || {}), Et = /* @__PURE__ */ ((e) => (e[e["2D"] = 0] = "2D", e[e.WebGL = 1] = "WebGL", e[e.WebGL2 = 2] = "WebGL2", e))(Et || {}), gt = /* @__PURE__ */ ((e) => (e[e.Play = 0] = "Play", e[e.Pause = 1] = "Pause", e[e.Seeked = 2] = "Seeked", e[e.VolumeChange = 3] = "VolumeChange", e[e.RateChange = 4] = "RateChange", e))(gt || {}), aa = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(aa || {});
function Vs(e) {
  return "__ln" in e;
}
class ad {
  constructor() {
    L(this, "length", 0), L(this, "head", null), L(this, "tail", null);
  }
  get(t) {
    if (t >= this.length)
      throw new Error("Position outside of list range");
    let r = this.head;
    for (let i = 0; i < t; i++)
      r = (r == null ? void 0 : r.next) || null;
    return r;
  }
  addNode(t) {
    const r = {
      value: t,
      previous: null,
      next: null
    };
    if (t.__ln = r, t.previousSibling && Vs(t.previousSibling)) {
      const i = t.previousSibling.__ln.next;
      r.next = i, r.previous = t.previousSibling.__ln, t.previousSibling.__ln.next = r, i && (i.previous = r);
    } else if (t.nextSibling && Vs(t.nextSibling) && t.nextSibling.__ln.previous) {
      const i = t.nextSibling.__ln.previous;
      r.previous = i, r.next = t.nextSibling.__ln, t.nextSibling.__ln.previous = r, i && (i.next = r);
    } else
      this.head && (this.head.previous = r), r.next = this.head, this.head = r;
    r.next === null && (this.tail = r), this.length++;
  }
  removeNode(t) {
    const r = t.__ln;
    this.head && (r.previous ? (r.previous.next = r.next, r.next ? r.next.previous = r.previous : this.tail = r.previous) : (this.head = r.next, this.head ? this.head.previous = null : this.tail = null), t.__ln && delete t.__ln, this.length--);
  }
}
const Gs = (e, t) => `${e}@${t}`;
class ld {
  constructor() {
    L(this, "frozen", !1), L(this, "locked", !1), L(this, "texts", []), L(this, "attributes", []), L(this, "attributeMap", /* @__PURE__ */ new WeakMap()), L(this, "removes", []), L(this, "mapRemoves", []), L(this, "movedMap", {}), L(this, "addedSet", /* @__PURE__ */ new Set()), L(this, "movedSet", /* @__PURE__ */ new Set()), L(this, "droppedSet", /* @__PURE__ */ new Set()), L(this, "removesSubTreeCache", /* @__PURE__ */ new Set()), L(this, "mutationCb"), L(this, "blockClass"), L(this, "blockSelector"), L(this, "maskTextClass"), L(this, "maskTextSelector"), L(this, "inlineStylesheet"), L(this, "maskInputOptions"), L(this, "maskTextFn"), L(this, "maskInputFn"), L(this, "keepIframeSrcFn"), L(this, "recordCanvas"), L(this, "inlineImages"), L(this, "slimDOMOptions"), L(this, "dataURLOptions"), L(this, "doc"), L(this, "mirror"), L(this, "iframeManager"), L(this, "stylesheetManager"), L(this, "shadowDomManager"), L(this, "canvasManager"), L(this, "processedNodeManager"), L(this, "unattachedDoc"), L(this, "processMutations", (t) => {
      t.forEach(this.processMutation), this.emit();
    }), L(this, "emit", () => {
      if (this.frozen || this.locked)
        return;
      const t = [], r = /* @__PURE__ */ new Set(), i = new ad(), n = (o) => {
        let d = o, a = Pt;
        for (; a === Pt; )
          d = d && d.nextSibling, a = d && this.mirror.getId(d);
        return a;
      }, s = (o) => {
        const d = F.parentNode(o);
        if (!d || !oa(o))
          return;
        let a = !1;
        if (o.nodeType === Node.TEXT_NODE) {
          const m = d.tagName;
          if (m === "TEXTAREA")
            return;
          m === "STYLE" && this.addedSet.has(d) && (a = !0);
        }
        const h = At(d) ? this.mirror.getId(sa(o)) : this.mirror.getId(d), u = n(o);
        if (h === -1 || u === -1)
          return i.addNode(o);
        const c = bt(o, {
          doc: this.doc,
          mirror: this.mirror,
          blockClass: this.blockClass,
          blockSelector: this.blockSelector,
          maskTextClass: this.maskTextClass,
          maskTextSelector: this.maskTextSelector,
          skipChild: !0,
          newlyAddedElement: !0,
          inlineStylesheet: this.inlineStylesheet,
          maskInputOptions: this.maskInputOptions,
          maskTextFn: this.maskTextFn,
          maskInputFn: this.maskInputFn,
          slimDOMOptions: this.slimDOMOptions,
          dataURLOptions: this.dataURLOptions,
          recordCanvas: this.recordCanvas,
          inlineImages: this.inlineImages,
          onSerialize: (m) => {
            na(m, this.mirror) && this.iframeManager.addIframe(m), ia(m, this.mirror) && this.stylesheetManager.trackLinkElement(
              m
            ), jn(o) && this.shadowDomManager.addShadowRoot(F.shadowRoot(o), this.doc);
          },
          onIframeLoad: (m, f) => {
            this.iframeManager.attachIframe(m, f), this.shadowDomManager.observeAttachShadow(m);
          },
          onStylesheetLoad: (m, f) => {
            this.stylesheetManager.attachLinkElement(m, f);
          },
          cssCaptured: a
        });
        c && (t.push({
          parentId: h,
          nextId: u,
          node: c
        }), r.add(c.id));
      };
      for (; this.mapRemoves.length; )
        this.mirror.removeNodeFromMap(this.mapRemoves.shift());
      for (const o of this.movedSet)
        Ys(this.removesSubTreeCache, o, this.mirror) && !this.movedSet.has(F.parentNode(o)) || s(o);
      for (const o of this.addedSet)
        !Xs(this.droppedSet, o) && !Ys(this.removesSubTreeCache, o, this.mirror) || Xs(this.movedSet, o) ? s(o) : this.droppedSet.add(o);
      let l = null;
      for (; i.length; ) {
        let o = null;
        if (l) {
          const d = this.mirror.getId(F.parentNode(l.value)), a = n(l.value);
          d !== -1 && a !== -1 && (o = l);
        }
        if (!o) {
          let d = i.tail;
          for (; d; ) {
            const a = d;
            if (d = d.previous, a) {
              const h = this.mirror.getId(F.parentNode(a.value));
              if (n(a.value) === -1) continue;
              if (h !== -1) {
                o = a;
                break;
              } else {
                const c = a.value, m = F.parentNode(c);
                if (m && m.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                  const f = F.host(m);
                  if (this.mirror.getId(f) !== -1) {
                    o = a;
                    break;
                  }
                }
              }
            }
          }
        }
        if (!o) {
          for (; i.head; )
            i.removeNode(i.head.value);
          break;
        }
        l = o.previous, i.removeNode(o.value), s(o.value);
      }
      const p = {
        texts: this.texts.map((o) => {
          const d = o.node, a = F.parentNode(d);
          return a && a.tagName === "TEXTAREA" && this.genTextAreaValueMutation(a), {
            id: this.mirror.getId(d),
            value: o.value
          };
        }).filter((o) => !r.has(o.id)).filter((o) => this.mirror.has(o.id)),
        attributes: this.attributes.map((o) => {
          const { attributes: d } = o;
          if (typeof d.style == "string") {
            const a = JSON.stringify(o.styleDiff), h = JSON.stringify(o._unchangedStyles);
            a.length < d.style.length && (a + h).split("var(").length === d.style.split("var(").length && (d.style = o.styleDiff);
          }
          return {
            id: this.mirror.getId(o.node),
            attributes: d
          };
        }).filter((o) => !r.has(o.id)).filter((o) => this.mirror.has(o.id)),
        removes: this.removes,
        adds: t
      };
      !p.texts.length && !p.attributes.length && !p.removes.length && !p.adds.length || (this.texts = [], this.attributes = [], this.attributeMap = /* @__PURE__ */ new WeakMap(), this.removes = [], this.addedSet = /* @__PURE__ */ new Set(), this.movedSet = /* @__PURE__ */ new Set(), this.droppedSet = /* @__PURE__ */ new Set(), this.removesSubTreeCache = /* @__PURE__ */ new Set(), this.movedMap = {}, this.mutationCb(p));
    }), L(this, "genTextAreaValueMutation", (t) => {
      let r = this.attributeMap.get(t);
      r || (r = {
        node: t,
        attributes: {},
        styleDiff: {},
        _unchangedStyles: {}
      }, this.attributes.push(r), this.attributeMap.set(t, r));
      const i = Array.from(
        F.childNodes(t),
        (n) => F.textContent(n) || ""
      ).join("");
      r.attributes.value = sr({
        element: t,
        maskInputOptions: this.maskInputOptions,
        tagName: t.tagName,
        type: or(t),
        value: i,
        maskInputFn: this.maskInputFn
      });
    }), L(this, "processMutation", (t) => {
      if (!Dn(t.target, this.mirror, this.slimDOMOptions))
        switch (t.type) {
          case "characterData": {
            const r = F.textContent(t.target);
            !ve(t.target, this.blockClass, this.blockSelector, !1) && r !== t.oldValue && this.texts.push({
              value: Po(
                t.target,
                this.maskTextClass,
                this.maskTextSelector,
                !0
                // checkAncestors
              ) && r ? this.maskTextFn ? this.maskTextFn(r, ta(t.target)) : r.replace(/[\S]/g, "*") : r,
              node: t.target
            });
            break;
          }
          case "attributes": {
            const r = t.target;
            let i = t.attributeName, n = t.target.getAttribute(i);
            if (i === "value") {
              const l = or(r);
              n = sr({
                element: r,
                maskInputOptions: this.maskInputOptions,
                tagName: r.tagName,
                type: l,
                value: n,
                maskInputFn: this.maskInputFn
              });
            }
            if (ve(t.target, this.blockClass, this.blockSelector, !1) || n === t.oldValue)
              return;
            let s = this.attributeMap.get(t.target);
            if (r.tagName === "IFRAME" && i === "src" && !this.keepIframeSrcFn(n))
              if (!r.contentDocument)
                i = "rr_src";
              else
                return;
            if (s || (s = {
              node: t.target,
              attributes: {},
              styleDiff: {},
              _unchangedStyles: {}
            }, this.attributes.push(s), this.attributeMap.set(t.target, s)), i === "type" && r.tagName === "INPUT" && (t.oldValue || "").toLowerCase() === "password" && r.setAttribute("data-rr-is-password", "true"), !To(r.tagName, i))
              if (s.attributes[i] = Lo(
                this.doc,
                at(r.tagName),
                at(i),
                n
              ), i === "style") {
                if (!this.unattachedDoc)
                  try {
                    this.unattachedDoc = document.implementation.createHTMLDocument();
                  } catch {
                    this.unattachedDoc = this.doc;
                  }
                const l = this.unattachedDoc.createElement("span");
                t.oldValue && l.setAttribute("style", t.oldValue);
                for (const p of Array.from(r.style)) {
                  const o = r.style.getPropertyValue(p), d = r.style.getPropertyPriority(p);
                  o !== l.style.getPropertyValue(p) || d !== l.style.getPropertyPriority(p) ? d === "" ? s.styleDiff[p] = o : s.styleDiff[p] = [o, d] : s._unchangedStyles[p] = [o, d];
                }
                for (const p of Array.from(l.style))
                  r.style.getPropertyValue(p) === "" && (s.styleDiff[p] = !1);
              } else i === "open" && r.tagName === "DIALOG" && (r.matches("dialog:modal") ? s.attributes.rr_open_mode = "modal" : s.attributes.rr_open_mode = "non-modal");
            break;
          }
          case "childList": {
            if (ve(t.target, this.blockClass, this.blockSelector, !0))
              return;
            if (t.target.tagName === "TEXTAREA") {
              this.genTextAreaValueMutation(t.target);
              return;
            }
            t.addedNodes.forEach((r) => this.genAdds(r, t.target)), t.removedNodes.forEach((r) => {
              const i = this.mirror.getId(r), n = At(t.target) ? this.mirror.getId(F.host(t.target)) : this.mirror.getId(t.target);
              ve(t.target, this.blockClass, this.blockSelector, !1) || Dn(r, this.mirror, this.slimDOMOptions) || !rd(r, this.mirror) || (this.addedSet.has(r) ? (qn(this.addedSet, r), this.droppedSet.add(r)) : this.addedSet.has(t.target) && i === -1 || ra(t.target, this.mirror) || (this.movedSet.has(r) && this.movedMap[Gs(i, n)] ? qn(this.movedSet, r) : (this.removes.push({
                parentId: n,
                id: i,
                isShadow: At(t.target) && Lt(t.target) ? !0 : void 0
              }), cd(r, this.removesSubTreeCache))), this.mapRemoves.push(r));
            });
            break;
          }
        }
    }), L(this, "genAdds", (t, r) => {
      if (!this.processedNodeManager.inOtherBuffer(t, this) && !(this.addedSet.has(t) || this.movedSet.has(t))) {
        if (this.mirror.hasNode(t)) {
          if (Dn(t, this.mirror, this.slimDOMOptions))
            return;
          this.movedSet.add(t);
          let i = null;
          r && this.mirror.hasNode(r) && (i = this.mirror.getId(r)), i && i !== -1 && (this.movedMap[Gs(this.mirror.getId(t), i)] = !0);
        } else
          this.addedSet.add(t), this.droppedSet.delete(t);
        ve(t, this.blockClass, this.blockSelector, !1) || (F.childNodes(t).forEach((i) => this.genAdds(i)), jn(t) && F.childNodes(F.shadowRoot(t)).forEach((i) => {
          this.processedNodeManager.add(i, this), this.genAdds(i, t);
        }));
      }
    });
  }
  init(t) {
    [
      "mutationCb",
      "blockClass",
      "blockSelector",
      "maskTextClass",
      "maskTextSelector",
      "inlineStylesheet",
      "maskInputOptions",
      "maskTextFn",
      "maskInputFn",
      "keepIframeSrcFn",
      "recordCanvas",
      "inlineImages",
      "slimDOMOptions",
      "dataURLOptions",
      "doc",
      "mirror",
      "iframeManager",
      "stylesheetManager",
      "shadowDomManager",
      "canvasManager",
      "processedNodeManager"
    ].forEach((r) => {
      this[r] = t[r];
    });
  }
  freeze() {
    this.frozen = !0, this.canvasManager.freeze();
  }
  unfreeze() {
    this.frozen = !1, this.canvasManager.unfreeze(), this.emit();
  }
  isFrozen() {
    return this.frozen;
  }
  lock() {
    this.locked = !0, this.canvasManager.lock();
  }
  unlock() {
    this.locked = !1, this.canvasManager.unlock(), this.emit();
  }
  reset() {
    this.shadowDomManager.reset(), this.canvasManager.reset();
  }
}
function qn(e, t) {
  e.delete(t), F.childNodes(t).forEach((r) => qn(e, r));
}
function cd(e, t) {
  const r = [e];
  for (; r.length; ) {
    const i = r.pop();
    t.has(i) || (t.add(i), F.childNodes(i).forEach((n) => r.push(n)));
  }
}
function Ys(e, t, r) {
  return e.size === 0 ? !1 : ud(e, t);
}
function ud(e, t, r) {
  const i = F.parentNode(t);
  return i ? e.has(i) : !1;
}
function Xs(e, t) {
  return e.size === 0 ? !1 : la(e, t);
}
function la(e, t) {
  const r = F.parentNode(t);
  return r ? e.has(r) ? !0 : la(e, r) : !1;
}
let Tt;
function dd(e) {
  Tt = e;
}
function hd() {
  Tt = void 0;
}
const W = (e) => Tt ? (...r) => {
  try {
    return e(...r);
  } catch (i) {
    if (Tt && Tt(i) === !0)
      return;
    throw i;
  }
} : e, it = [];
function zt(e) {
  try {
    if ("composedPath" in e) {
      const t = e.composedPath();
      if (t.length)
        return t[0];
    } else if ("path" in e && e.path.length)
      return e.path[0];
  } catch {
  }
  return e && e.target;
}
function ca(e, t) {
  const r = new ld();
  it.push(r), r.init(e);
  const [i, n] = Ko(), s = new i(
    W(r.processMutations.bind(r))
  );
  return s.observe(t, {
    attributes: !0,
    attributeOldValue: !0,
    characterData: !0,
    characterDataOldValue: !0,
    childList: !0,
    subtree: !0
  }), [s, n];
}
function pd({
  mousemoveCb: e,
  sampling: t,
  doc: r,
  mirror: i
}) {
  if (t.mousemove === !1)
    return () => {
    };
  const n = typeof t.mousemove == "number" ? t.mousemove : 50, s = typeof t.mousemoveCallback == "number" ? t.mousemoveCallback : 500;
  let l = [], p;
  const o = _t(
    W(
      (h) => {
        const u = Date.now() - p;
        e(
          l.map((c) => (c.timeOffset -= u, c)),
          h
        ), l = [], p = null;
      }
    ),
    s
  ), d = W(
    _t(
      W((h) => {
        const u = zt(h), { clientX: c, clientY: m } = Wn(h) ? h.changedTouches[0] : h;
        p || (p = Nt()), l.push({
          x: c,
          y: m,
          id: i.getId(u),
          timeOffset: Nt() - p
        }), o(
          typeof DragEvent < "u" && h instanceof DragEvent ? U.Drag : h instanceof MouseEvent ? U.MouseMove : U.TouchMove
        );
      }),
      n,
      {
        trailing: !1
      }
    )
  ), a = [
    be("mousemove", d, r),
    be("touchmove", d, r),
    be("drag", d, r)
  ];
  return W(() => {
    a.forEach((h) => h());
  });
}
function fd({
  mouseInteractionCb: e,
  doc: t,
  mirror: r,
  blockClass: i,
  blockSelector: n,
  sampling: s
}) {
  if (s.mouseInteraction === !1)
    return () => {
    };
  const l = s.mouseInteraction === !0 || s.mouseInteraction === void 0 ? {} : s.mouseInteraction, p = [];
  let o = null;
  const d = (a) => (h) => {
    const u = zt(h);
    if (ve(u, i, n, !0))
      return;
    let c = null, m = a;
    if ("pointerType" in h) {
      switch (h.pointerType) {
        case "mouse":
          c = je.Mouse;
          break;
        case "touch":
          c = je.Touch;
          break;
        case "pen":
          c = je.Pen;
          break;
      }
      c === je.Touch ? ke[a] === ke.MouseDown ? m = "TouchStart" : ke[a] === ke.MouseUp && (m = "TouchEnd") : je.Pen;
    } else Wn(h) && (c = je.Touch);
    c !== null ? (o = c, (m.startsWith("Touch") && c === je.Touch || m.startsWith("Mouse") && c === je.Mouse) && (c = null)) : ke[a] === ke.Click && (c = o, o = null);
    const f = Wn(h) ? h.changedTouches[0] : h;
    if (!f)
      return;
    const g = r.getId(u), { clientX: x, clientY: y } = f;
    W(e)({
      type: ke[m],
      id: g,
      x,
      y,
      ...c !== null && { pointerType: c }
    });
  };
  return Object.keys(ke).filter(
    (a) => Number.isNaN(Number(a)) && !a.endsWith("_Departed") && l[a] !== !1
  ).forEach((a) => {
    let h = at(a);
    const u = d(a);
    if (window.PointerEvent)
      switch (ke[a]) {
        case ke.MouseDown:
        case ke.MouseUp:
          h = h.replace(
            "mouse",
            "pointer"
          );
          break;
        case ke.TouchStart:
        case ke.TouchEnd:
          return;
      }
    p.push(be(h, u, t));
  }), W(() => {
    p.forEach((a) => a());
  });
}
function ua({
  scrollCb: e,
  doc: t,
  mirror: r,
  blockClass: i,
  blockSelector: n,
  sampling: s
}) {
  const l = W(
    _t(
      W((p) => {
        const o = zt(p);
        if (!o || ve(o, i, n, !0))
          return;
        const d = r.getId(o);
        if (o === t && t.defaultView) {
          const a = Zo(t.defaultView);
          e({
            id: d,
            x: a.left,
            y: a.top
          });
        } else
          e({
            id: d,
            x: o.scrollLeft,
            y: o.scrollTop
          });
      }),
      s.scroll || 100
    )
  );
  return be("scroll", l, t);
}
function md({ viewportResizeCb: e }, { win: t }) {
  let r = -1, i = -1;
  const n = W(
    _t(
      W(() => {
        const s = Qo(), l = ea();
        (r !== s || i !== l) && (e({
          width: Number(l),
          height: Number(s)
        }), r = s, i = l);
      }),
      200
    )
  );
  return be("resize", n, t);
}
const gd = ["INPUT", "TEXTAREA", "SELECT"], Js = /* @__PURE__ */ new WeakMap();
function yd({
  inputCb: e,
  doc: t,
  mirror: r,
  blockClass: i,
  blockSelector: n,
  ignoreClass: s,
  ignoreSelector: l,
  maskInputOptions: p,
  maskInputFn: o,
  sampling: d,
  userTriggeredOnInput: a
}) {
  function h(y) {
    let v = zt(y);
    const S = y.isTrusted, w = v && v.tagName;
    if (v && w === "OPTION" && (v = F.parentElement(v)), !v || !w || gd.indexOf(w) < 0 || ve(v, i, n, !0) || v.classList.contains(s) || l && v.matches(l))
      return;
    let b = v.value, k = !1;
    const E = or(v) || "";
    E === "radio" || E === "checkbox" ? k = v.checked : (p[w.toLowerCase()] || p[E]) && (b = sr({
      element: v,
      maskInputOptions: p,
      tagName: w,
      type: E,
      value: b,
      maskInputFn: o
    })), u(
      v,
      a ? { text: b, isChecked: k, userTriggered: S } : { text: b, isChecked: k }
    );
    const A = v.name;
    E === "radio" && A && k && t.querySelectorAll(`input[type="radio"][name="${A}"]`).forEach((M) => {
      if (M !== v) {
        const _ = M.value;
        u(
          M,
          a ? { text: _, isChecked: !k, userTriggered: !1 } : { text: _, isChecked: !k }
        );
      }
    });
  }
  function u(y, v) {
    const S = Js.get(y);
    if (!S || S.text !== v.text || S.isChecked !== v.isChecked) {
      Js.set(y, v);
      const w = r.getId(y);
      W(e)({
        ...v,
        id: w
      });
    }
  }
  const m = (d.input === "last" ? ["change"] : ["input", "change"]).map(
    (y) => be(y, W(h), t)
  ), f = t.defaultView;
  if (!f)
    return () => {
      m.forEach((y) => y());
    };
  const g = f.Object.getOwnPropertyDescriptor(
    f.HTMLInputElement.prototype,
    "value"
  ), x = [
    [f.HTMLInputElement.prototype, "value"],
    [f.HTMLInputElement.prototype, "checked"],
    [f.HTMLSelectElement.prototype, "value"],
    [f.HTMLTextAreaElement.prototype, "value"],
    // Some UI library use selectedIndex to set select value
    [f.HTMLSelectElement.prototype, "selectedIndex"],
    [f.HTMLOptionElement.prototype, "selected"]
  ];
  return g && g.set && m.push(
    ...x.map(
      (y) => Er(
        y[0],
        y[1],
        {
          set() {
            W(h)({
              target: this,
              isTrusted: !1
              // userTriggered to false as this could well be programmatic
            });
          }
        },
        !1,
        f
      )
    )
  ), W(() => {
    m.forEach((y) => y());
  });
}
function cr(e) {
  const t = [];
  function r(i, n) {
    if (Kt("CSSGroupingRule") && i.parentRule instanceof CSSGroupingRule || Kt("CSSMediaRule") && i.parentRule instanceof CSSMediaRule || Kt("CSSSupportsRule") && i.parentRule instanceof CSSSupportsRule || Kt("CSSConditionRule") && i.parentRule instanceof CSSConditionRule) {
      const l = Array.from(
        i.parentRule.cssRules
      ).indexOf(i);
      return n.unshift(l), r(i.parentRule, n);
    } else if (i.parentStyleSheet) {
      const l = Array.from(i.parentStyleSheet.cssRules).indexOf(i);
      n.unshift(l);
    }
    return n;
  }
  return r(e, t);
}
function Ye(e, t, r) {
  let i, n;
  return e ? (e.ownerNode ? i = t.getId(e.ownerNode) : n = r.getId(e), {
    styleId: n,
    id: i
  }) : {};
}
function bd({ styleSheetRuleCb: e, mirror: t, stylesheetManager: r }, { win: i }) {
  if (!i.CSSStyleSheet || !i.CSSStyleSheet.prototype)
    return () => {
    };
  const n = i.CSSStyleSheet.prototype.insertRule;
  i.CSSStyleSheet.prototype.insertRule = new Proxy(n, {
    apply: W(
      (a, h, u) => {
        const [c, m] = u, { id: f, styleId: g } = Ye(
          h,
          t,
          r.styleMirror
        );
        return (f && f !== -1 || g && g !== -1) && e({
          id: f,
          styleId: g,
          adds: [{ rule: c, index: m }]
        }), a.apply(h, u);
      }
    )
  }), i.CSSStyleSheet.prototype.addRule = function(a, h, u = this.cssRules.length) {
    const c = `${a} { ${h} }`;
    return i.CSSStyleSheet.prototype.insertRule.apply(this, [c, u]);
  };
  const s = i.CSSStyleSheet.prototype.deleteRule;
  i.CSSStyleSheet.prototype.deleteRule = new Proxy(s, {
    apply: W(
      (a, h, u) => {
        const [c] = u, { id: m, styleId: f } = Ye(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          removes: [{ index: c }]
        }), a.apply(h, u);
      }
    )
  }), i.CSSStyleSheet.prototype.removeRule = function(a) {
    return i.CSSStyleSheet.prototype.deleteRule.apply(this, [a]);
  };
  let l;
  i.CSSStyleSheet.prototype.replace && (l = i.CSSStyleSheet.prototype.replace, i.CSSStyleSheet.prototype.replace = new Proxy(l, {
    apply: W(
      (a, h, u) => {
        const [c] = u, { id: m, styleId: f } = Ye(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          replace: c
        }), a.apply(h, u);
      }
    )
  }));
  let p;
  i.CSSStyleSheet.prototype.replaceSync && (p = i.CSSStyleSheet.prototype.replaceSync, i.CSSStyleSheet.prototype.replaceSync = new Proxy(p, {
    apply: W(
      (a, h, u) => {
        const [c] = u, { id: m, styleId: f } = Ye(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          replaceSync: c
        }), a.apply(h, u);
      }
    )
  }));
  const o = {};
  Zt("CSSGroupingRule") ? o.CSSGroupingRule = i.CSSGroupingRule : (Zt("CSSMediaRule") && (o.CSSMediaRule = i.CSSMediaRule), Zt("CSSConditionRule") && (o.CSSConditionRule = i.CSSConditionRule), Zt("CSSSupportsRule") && (o.CSSSupportsRule = i.CSSSupportsRule));
  const d = {};
  return Object.entries(o).forEach(([a, h]) => {
    d[a] = {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      insertRule: h.prototype.insertRule,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      deleteRule: h.prototype.deleteRule
    }, h.prototype.insertRule = new Proxy(
      d[a].insertRule,
      {
        apply: W(
          (u, c, m) => {
            const [f, g] = m, { id: x, styleId: y } = Ye(
              c.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (x && x !== -1 || y && y !== -1) && e({
              id: x,
              styleId: y,
              adds: [
                {
                  rule: f,
                  index: [
                    ...cr(c),
                    g || 0
                    // defaults to 0
                  ]
                }
              ]
            }), u.apply(c, m);
          }
        )
      }
    ), h.prototype.deleteRule = new Proxy(
      d[a].deleteRule,
      {
        apply: W(
          (u, c, m) => {
            const [f] = m, { id: g, styleId: x } = Ye(
              c.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (g && g !== -1 || x && x !== -1) && e({
              id: g,
              styleId: x,
              removes: [
                { index: [...cr(c), f] }
              ]
            }), u.apply(c, m);
          }
        )
      }
    );
  }), W(() => {
    i.CSSStyleSheet.prototype.insertRule = n, i.CSSStyleSheet.prototype.deleteRule = s, l && (i.CSSStyleSheet.prototype.replace = l), p && (i.CSSStyleSheet.prototype.replaceSync = p), Object.entries(o).forEach(([a, h]) => {
      h.prototype.insertRule = d[a].insertRule, h.prototype.deleteRule = d[a].deleteRule;
    });
  });
}
function da({
  mirror: e,
  stylesheetManager: t
}, r) {
  var i, n, s;
  let l = null;
  r.nodeName === "#document" ? l = e.getId(r) : l = e.getId(F.host(r));
  const p = r.nodeName === "#document" ? (i = r.defaultView) == null ? void 0 : i.Document : (s = (n = r.ownerDocument) == null ? void 0 : n.defaultView) == null ? void 0 : s.ShadowRoot, o = p != null && p.prototype ? Object.getOwnPropertyDescriptor(
    p == null ? void 0 : p.prototype,
    "adoptedStyleSheets"
  ) : void 0;
  return l === null || l === -1 || !p || !o ? () => {
  } : (Object.defineProperty(r, "adoptedStyleSheets", {
    configurable: o.configurable,
    enumerable: o.enumerable,
    get() {
      var d;
      return (d = o.get) == null ? void 0 : d.call(this);
    },
    set(d) {
      var a;
      const h = (a = o.set) == null ? void 0 : a.call(this, d);
      if (l !== null && l !== -1)
        try {
          t.adoptStyleSheets(d, l);
        } catch {
        }
      return h;
    }
  }), W(() => {
    Object.defineProperty(r, "adoptedStyleSheets", {
      configurable: o.configurable,
      enumerable: o.enumerable,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      get: o.get,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      set: o.set
    });
  }));
}
function vd({
  styleDeclarationCb: e,
  mirror: t,
  ignoreCSSAttributes: r,
  stylesheetManager: i
}, { win: n }) {
  const s = n.CSSStyleDeclaration.prototype.setProperty;
  n.CSSStyleDeclaration.prototype.setProperty = new Proxy(s, {
    apply: W(
      (p, o, d) => {
        var a;
        const [h, u, c] = d;
        if (r.has(h))
          return s.apply(o, [h, u, c]);
        const { id: m, styleId: f } = Ye(
          (a = o.parentRule) == null ? void 0 : a.parentStyleSheet,
          t,
          i.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          set: {
            property: h,
            value: u,
            priority: c
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          index: cr(o.parentRule)
        }), p.apply(o, d);
      }
    )
  });
  const l = n.CSSStyleDeclaration.prototype.removeProperty;
  return n.CSSStyleDeclaration.prototype.removeProperty = new Proxy(l, {
    apply: W(
      (p, o, d) => {
        var a;
        const [h] = d;
        if (r.has(h))
          return l.apply(o, [h]);
        const { id: u, styleId: c } = Ye(
          (a = o.parentRule) == null ? void 0 : a.parentStyleSheet,
          t,
          i.styleMirror
        );
        return (u && u !== -1 || c && c !== -1) && e({
          id: u,
          styleId: c,
          remove: {
            property: h
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          index: cr(o.parentRule)
        }), p.apply(o, d);
      }
    )
  }), W(() => {
    n.CSSStyleDeclaration.prototype.setProperty = s, n.CSSStyleDeclaration.prototype.removeProperty = l;
  });
}
function wd({
  mediaInteractionCb: e,
  blockClass: t,
  blockSelector: r,
  mirror: i,
  sampling: n,
  doc: s
}) {
  const l = W(
    (o) => _t(
      W((d) => {
        const a = zt(d);
        if (!a || ve(a, t, r, !0))
          return;
        const { currentTime: h, volume: u, muted: c, playbackRate: m, loop: f } = a;
        e({
          type: o,
          id: i.getId(a),
          currentTime: h,
          volume: u,
          muted: c,
          playbackRate: m,
          loop: f
        });
      }),
      n.media || 500
    )
  ), p = [
    be("play", l(gt.Play), s),
    be("pause", l(gt.Pause), s),
    be("seeked", l(gt.Seeked), s),
    be("volumechange", l(gt.VolumeChange), s),
    be("ratechange", l(gt.RateChange), s)
  ];
  return W(() => {
    p.forEach((o) => o());
  });
}
function xd({ fontCb: e, doc: t }) {
  const r = t.defaultView;
  if (!r)
    return () => {
    };
  const i = [], n = /* @__PURE__ */ new WeakMap(), s = r.FontFace;
  r.FontFace = function(o, d, a) {
    const h = new s(o, d, a);
    return n.set(h, {
      family: o,
      buffer: typeof d != "string",
      descriptors: a,
      fontSource: typeof d == "string" ? d : JSON.stringify(Array.from(new Uint8Array(d)))
    }), h;
  };
  const l = ut(
    t.fonts,
    "add",
    function(p) {
      return function(o) {
        return setTimeout(
          W(() => {
            const d = n.get(o);
            d && (e(d), n.delete(o));
          }),
          0
        ), p.apply(this, [o]);
      };
    }
  );
  return i.push(() => {
    r.FontFace = s;
  }), i.push(l), W(() => {
    i.forEach((p) => p());
  });
}
function kd(e) {
  const { doc: t, mirror: r, blockClass: i, blockSelector: n, selectionCb: s } = e;
  let l = !0;
  const p = W(() => {
    const o = t.getSelection();
    if (!o || l && (o != null && o.isCollapsed)) return;
    l = o.isCollapsed || !1;
    const d = [], a = o.rangeCount || 0;
    for (let h = 0; h < a; h++) {
      const u = o.getRangeAt(h), { startContainer: c, startOffset: m, endContainer: f, endOffset: g } = u;
      ve(c, i, n, !0) || ve(f, i, n, !0) || d.push({
        start: r.getId(c),
        startOffset: m,
        end: r.getId(f),
        endOffset: g
      });
    }
    s({ ranges: d });
  });
  return p(), be("selectionchange", p);
}
function Sd({
  doc: e,
  customElementCb: t
}) {
  const r = e.defaultView;
  return !r || !r.customElements ? () => {
  } : ut(
    r.customElements,
    "define",
    function(n) {
      return function(s, l, p) {
        try {
          t({
            define: {
              name: s
            }
          });
        } catch {
          console.warn(`Custom element callback failed for ${s}`);
        }
        return n.apply(this, [s, l, p]);
      };
    }
  );
}
function Cd(e, t) {
  const {
    mutationCb: r,
    mousemoveCb: i,
    mouseInteractionCb: n,
    scrollCb: s,
    viewportResizeCb: l,
    inputCb: p,
    mediaInteractionCb: o,
    styleSheetRuleCb: d,
    styleDeclarationCb: a,
    canvasMutationCb: h,
    fontCb: u,
    selectionCb: c,
    customElementCb: m
  } = e;
  e.mutationCb = (...f) => {
    t.mutation && t.mutation(...f), r(...f);
  }, e.mousemoveCb = (...f) => {
    t.mousemove && t.mousemove(...f), i(...f);
  }, e.mouseInteractionCb = (...f) => {
    t.mouseInteraction && t.mouseInteraction(...f), n(...f);
  }, e.scrollCb = (...f) => {
    t.scroll && t.scroll(...f), s(...f);
  }, e.viewportResizeCb = (...f) => {
    t.viewportResize && t.viewportResize(...f), l(...f);
  }, e.inputCb = (...f) => {
    t.input && t.input(...f), p(...f);
  }, e.mediaInteractionCb = (...f) => {
    t.mediaInteaction && t.mediaInteaction(...f), o(...f);
  }, e.styleSheetRuleCb = (...f) => {
    t.styleSheetRule && t.styleSheetRule(...f), d(...f);
  }, e.styleDeclarationCb = (...f) => {
    t.styleDeclaration && t.styleDeclaration(...f), a(...f);
  }, e.canvasMutationCb = (...f) => {
    t.canvasMutation && t.canvasMutation(...f), h(...f);
  }, e.fontCb = (...f) => {
    t.font && t.font(...f), u(...f);
  }, e.selectionCb = (...f) => {
    t.selection && t.selection(...f), c(...f);
  }, e.customElementCb = (...f) => {
    t.customElement && t.customElement(...f), m(...f);
  };
}
function Ed(e, t = {}) {
  const r = e.doc.defaultView;
  if (!r)
    return () => {
    };
  Cd(e, t);
  let i, n = () => {
  };
  e.recordDOM && ([i, n] = ca(e, e.doc));
  const s = pd(e), l = fd(e), p = ua(e), o = md(e, {
    win: r
  }), d = yd(e), a = wd(e);
  let h = () => {
  }, u = () => {
  }, c = () => {
  }, m = () => {
  };
  e.recordDOM && (h = bd(e, { win: r }), u = da(e, e.doc), c = vd(e, {
    win: r
  }), e.collectFonts && (m = xd(e)));
  const f = kd(e), g = Sd(e), x = [];
  for (const y of e.plugins)
    x.push(
      y.observer(y.callback, r, y.options)
    );
  return W(() => {
    it.forEach((y) => y.reset()), i == null || i.disconnect(), n(), s(), l(), p(), o(), d(), a(), h(), u(), c(), m(), f(), g(), x.forEach((y) => y());
  });
}
function Kt(e) {
  return typeof window[e] < "u";
}
function Zt(e) {
  return !!(typeof window[e] < "u" && // Note: Generally, this check _shouldn't_ be necessary
  // However, in some scenarios (e.g. jsdom) this can sometimes fail, so we check for it here
  window[e].prototype && "insertRule" in window[e].prototype && "deleteRule" in window[e].prototype);
}
class Ks {
  constructor(t) {
    L(this, "iframeIdToRemoteIdMap", /* @__PURE__ */ new WeakMap()), L(this, "iframeRemoteIdToIdMap", /* @__PURE__ */ new WeakMap()), this.generateIdFn = t;
  }
  getId(t, r, i, n) {
    const s = i || this.getIdToRemoteIdMap(t), l = n || this.getRemoteIdToIdMap(t);
    let p = s.get(r);
    return p || (p = this.generateIdFn(), s.set(r, p), l.set(p, r)), p;
  }
  getIds(t, r) {
    const i = this.getIdToRemoteIdMap(t), n = this.getRemoteIdToIdMap(t);
    return r.map(
      (s) => this.getId(t, s, i, n)
    );
  }
  getRemoteId(t, r, i) {
    const n = i || this.getRemoteIdToIdMap(t);
    if (typeof r != "number") return r;
    const s = n.get(r);
    return s || -1;
  }
  getRemoteIds(t, r) {
    const i = this.getRemoteIdToIdMap(t);
    return r.map((n) => this.getRemoteId(t, n, i));
  }
  reset(t) {
    if (!t) {
      this.iframeIdToRemoteIdMap = /* @__PURE__ */ new WeakMap(), this.iframeRemoteIdToIdMap = /* @__PURE__ */ new WeakMap();
      return;
    }
    this.iframeIdToRemoteIdMap.delete(t), this.iframeRemoteIdToIdMap.delete(t);
  }
  getIdToRemoteIdMap(t) {
    let r = this.iframeIdToRemoteIdMap.get(t);
    return r || (r = /* @__PURE__ */ new Map(), this.iframeIdToRemoteIdMap.set(t, r)), r;
  }
  getRemoteIdToIdMap(t) {
    let r = this.iframeRemoteIdToIdMap.get(t);
    return r || (r = /* @__PURE__ */ new Map(), this.iframeRemoteIdToIdMap.set(t, r)), r;
  }
}
class Md {
  constructor(t) {
    L(this, "iframes", /* @__PURE__ */ new WeakMap()), L(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap()), L(this, "crossOriginIframeMirror", new Ks(Ao)), L(this, "crossOriginIframeStyleMirror"), L(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap()), L(this, "mirror"), L(this, "mutationCb"), L(this, "wrappedEmit"), L(this, "loadListener"), L(this, "stylesheetManager"), L(this, "recordCrossOriginIframes"), this.mutationCb = t.mutationCb, this.wrappedEmit = t.wrappedEmit, this.stylesheetManager = t.stylesheetManager, this.recordCrossOriginIframes = t.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new Ks(
      this.stylesheetManager.styleMirror.generateId.bind(
        this.stylesheetManager.styleMirror
      )
    ), this.mirror = t.mirror, this.recordCrossOriginIframes && window.addEventListener("message", this.handleMessage.bind(this));
  }
  addIframe(t) {
    this.iframes.set(t, !0), t.contentWindow && this.crossOriginIframeMap.set(t.contentWindow, t);
  }
  addLoadListener(t) {
    this.loadListener = t;
  }
  attachIframe(t, r) {
    var i, n;
    this.mutationCb({
      adds: [
        {
          parentId: this.mirror.getId(t),
          nextId: null,
          node: r
        }
      ],
      removes: [],
      texts: [],
      attributes: [],
      isAttachIframe: !0
    }), this.recordCrossOriginIframes && ((i = t.contentWindow) == null || i.addEventListener(
      "message",
      this.handleMessage.bind(this)
    )), (n = this.loadListener) == null || n.call(this, t), t.contentDocument && t.contentDocument.adoptedStyleSheets && t.contentDocument.adoptedStyleSheets.length > 0 && this.stylesheetManager.adoptStyleSheets(
      t.contentDocument.adoptedStyleSheets,
      this.mirror.getId(t.contentDocument)
    );
  }
  handleMessage(t) {
    const r = t;
    if (r.data.type !== "rrweb" || // To filter out the rrweb messages which are forwarded by some sites.
    r.origin !== r.data.origin || !t.source) return;
    const n = this.crossOriginIframeMap.get(t.source);
    if (!n) return;
    const s = this.transformCrossOriginEvent(
      n,
      r.data.event
    );
    s && this.wrappedEmit(
      s,
      r.data.isCheckout
    );
  }
  transformCrossOriginEvent(t, r) {
    var i;
    switch (r.type) {
      case V.FullSnapshot: {
        this.crossOriginIframeMirror.reset(t), this.crossOriginIframeStyleMirror.reset(t), this.replaceIdOnNode(r.data.node, t);
        const n = r.data.node.id;
        return this.crossOriginIframeRootIdMap.set(t, n), this.patchRootIdOnNode(r.data.node, n), {
          timestamp: r.timestamp,
          type: V.IncrementalSnapshot,
          data: {
            source: U.Mutation,
            adds: [
              {
                parentId: this.mirror.getId(t),
                nextId: null,
                node: r.data.node
              }
            ],
            removes: [],
            texts: [],
            attributes: [],
            isAttachIframe: !0
          }
        };
      }
      case V.Meta:
      case V.Load:
      case V.DomContentLoaded:
        return !1;
      case V.Plugin:
        return r;
      case V.Custom:
        return this.replaceIds(
          r.data.payload,
          t,
          ["id", "parentId", "previousId", "nextId"]
        ), r;
      case V.IncrementalSnapshot:
        switch (r.data.source) {
          case U.Mutation:
            return r.data.adds.forEach((n) => {
              this.replaceIds(n, t, [
                "parentId",
                "nextId",
                "previousId"
              ]), this.replaceIdOnNode(n.node, t);
              const s = this.crossOriginIframeRootIdMap.get(t);
              s && this.patchRootIdOnNode(n.node, s);
            }), r.data.removes.forEach((n) => {
              this.replaceIds(n, t, ["parentId", "id"]);
            }), r.data.attributes.forEach((n) => {
              this.replaceIds(n, t, ["id"]);
            }), r.data.texts.forEach((n) => {
              this.replaceIds(n, t, ["id"]);
            }), r;
          case U.Drag:
          case U.TouchMove:
          case U.MouseMove:
            return r.data.positions.forEach((n) => {
              this.replaceIds(n, t, ["id"]);
            }), r;
          case U.ViewportResize:
            return !1;
          case U.MediaInteraction:
          case U.MouseInteraction:
          case U.Scroll:
          case U.CanvasMutation:
          case U.Input:
            return this.replaceIds(r.data, t, ["id"]), r;
          case U.StyleSheetRule:
          case U.StyleDeclaration:
            return this.replaceIds(r.data, t, ["id"]), this.replaceStyleIds(r.data, t, ["styleId"]), r;
          case U.Font:
            return r;
          case U.Selection:
            return r.data.ranges.forEach((n) => {
              this.replaceIds(n, t, ["start", "end"]);
            }), r;
          case U.AdoptedStyleSheet:
            return this.replaceIds(r.data, t, ["id"]), this.replaceStyleIds(r.data, t, ["styleIds"]), (i = r.data.styles) == null || i.forEach((n) => {
              this.replaceStyleIds(n, t, ["styleId"]);
            }), r;
        }
    }
    return !1;
  }
  replace(t, r, i, n) {
    for (const s of n)
      !Array.isArray(r[s]) && typeof r[s] != "number" || (Array.isArray(r[s]) ? r[s] = t.getIds(
        i,
        r[s]
      ) : r[s] = t.getId(i, r[s]));
    return r;
  }
  replaceIds(t, r, i) {
    return this.replace(this.crossOriginIframeMirror, t, r, i);
  }
  replaceStyleIds(t, r, i) {
    return this.replace(this.crossOriginIframeStyleMirror, t, r, i);
  }
  replaceIdOnNode(t, r) {
    this.replaceIds(t, r, ["id", "rootId"]), "childNodes" in t && t.childNodes.forEach((i) => {
      this.replaceIdOnNode(i, r);
    });
  }
  patchRootIdOnNode(t, r) {
    t.type !== aa.Document && !t.rootId && (t.rootId = r), "childNodes" in t && t.childNodes.forEach((i) => {
      this.patchRootIdOnNode(i, r);
    });
  }
}
class Rd {
  constructor(t) {
    L(this, "shadowDoms", /* @__PURE__ */ new WeakSet()), L(this, "mutationCb"), L(this, "scrollCb"), L(this, "bypassOptions"), L(this, "mirror"), L(this, "restoreHandlers", []), this.mutationCb = t.mutationCb, this.scrollCb = t.scrollCb, this.bypassOptions = t.bypassOptions, this.mirror = t.mirror, this.init();
  }
  init() {
    this.reset(), this.patchAttachShadow(Element, document);
  }
  addShadowRoot(t, r) {
    if (!Lt(t) || this.shadowDoms.has(t)) return;
    this.shadowDoms.add(t);
    const [i] = ca(
      {
        ...this.bypassOptions,
        doc: r,
        mutationCb: this.mutationCb,
        mirror: this.mirror,
        shadowDomManager: this
      },
      t
    );
    this.restoreHandlers.push(() => i.disconnect()), this.restoreHandlers.push(
      ua({
        ...this.bypassOptions,
        scrollCb: this.scrollCb,
        // https://gist.github.com/praveenpuglia/0832da687ed5a5d7a0907046c9ef1813
        // scroll is not allowed to pass the boundary, so we need to listen the shadow document
        doc: t,
        mirror: this.mirror
      })
    ), setTimeout(() => {
      t.adoptedStyleSheets && t.adoptedStyleSheets.length > 0 && this.bypassOptions.stylesheetManager.adoptStyleSheets(
        t.adoptedStyleSheets,
        this.mirror.getId(F.host(t))
      ), this.restoreHandlers.push(
        da(
          {
            mirror: this.mirror,
            stylesheetManager: this.bypassOptions.stylesheetManager
          },
          t
        )
      );
    }, 0);
  }
  /**
   * Monkey patch 'attachShadow' of an IFrameElement to observe newly added shadow doms.
   */
  observeAttachShadow(t) {
    !t.contentWindow || !t.contentDocument || this.patchAttachShadow(
      t.contentWindow.Element,
      t.contentDocument
    );
  }
  /**
   * Patch 'attachShadow' to observe newly added shadow doms.
   */
  patchAttachShadow(t, r) {
    const i = this;
    this.restoreHandlers.push(
      ut(
        t.prototype,
        "attachShadow",
        function(n) {
          return function(s) {
            const l = n.call(this, s), p = F.shadowRoot(this);
            return p && oa(this) && i.addShadowRoot(p, r), l;
          };
        }
      )
    );
  }
  reset() {
    this.restoreHandlers.forEach((t) => {
      try {
        t();
      } catch {
      }
    }), this.restoreHandlers = [], this.shadowDoms = /* @__PURE__ */ new WeakSet();
  }
}
var vt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Od = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var Qt = 0; Qt < vt.length; Qt++)
  Od[vt.charCodeAt(Qt)] = Qt;
var Id = function(e) {
  var t = new Uint8Array(e), r, i = t.length, n = "";
  for (r = 0; r < i; r += 3)
    n += vt[t[r] >> 2], n += vt[(t[r] & 3) << 4 | t[r + 1] >> 4], n += vt[(t[r + 1] & 15) << 2 | t[r + 2] >> 6], n += vt[t[r + 2] & 63];
  return i % 3 === 2 ? n = n.substring(0, n.length - 1) + "=" : i % 3 === 1 && (n = n.substring(0, n.length - 2) + "=="), n;
};
const Zs = /* @__PURE__ */ new Map();
function Ad(e, t) {
  let r = Zs.get(e);
  return r || (r = /* @__PURE__ */ new Map(), Zs.set(e, r)), r.has(t) || r.set(t, []), r.get(t);
}
const ha = (e, t, r) => {
  if (!e || !(fa(e, t) || typeof e == "object"))
    return;
  const i = e.constructor.name, n = Ad(r, i);
  let s = n.indexOf(e);
  return s === -1 && (s = n.length, n.push(e)), s;
};
function er(e, t, r) {
  if (e instanceof Array)
    return e.map((i) => er(i, t, r));
  if (e === null)
    return e;
  if (e instanceof Float32Array || e instanceof Float64Array || e instanceof Int32Array || e instanceof Uint32Array || e instanceof Uint8Array || e instanceof Uint16Array || e instanceof Int16Array || e instanceof Int8Array || e instanceof Uint8ClampedArray)
    return {
      rr_type: e.constructor.name,
      args: [Object.values(e)]
    };
  if (
    // SharedArrayBuffer disabled on most browsers due to spectre.
    // More info: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer/SharedArrayBuffer
    // value instanceof SharedArrayBuffer ||
    e instanceof ArrayBuffer
  ) {
    const i = e.constructor.name, n = Id(e);
    return {
      rr_type: i,
      base64: n
    };
  } else {
    if (e instanceof DataView)
      return {
        rr_type: e.constructor.name,
        args: [
          er(e.buffer, t, r),
          e.byteOffset,
          e.byteLength
        ]
      };
    if (e instanceof HTMLImageElement) {
      const i = e.constructor.name, { src: n } = e;
      return {
        rr_type: i,
        src: n
      };
    } else if (e instanceof HTMLCanvasElement) {
      const i = "HTMLImageElement", n = e.toDataURL();
      return {
        rr_type: i,
        src: n
      };
    } else {
      if (e instanceof ImageData)
        return {
          rr_type: e.constructor.name,
          args: [er(e.data, t, r), e.width, e.height]
        };
      if (fa(e, t) || typeof e == "object") {
        const i = e.constructor.name, n = ha(e, t, r);
        return {
          rr_type: i,
          index: n
        };
      }
    }
  }
  return e;
}
const pa = (e, t, r) => e.map((i) => er(i, t, r)), fa = (e, t) => !![
  "WebGLActiveInfo",
  "WebGLBuffer",
  "WebGLFramebuffer",
  "WebGLProgram",
  "WebGLRenderbuffer",
  "WebGLShader",
  "WebGLShaderPrecisionFormat",
  "WebGLTexture",
  "WebGLUniformLocation",
  "WebGLVertexArrayObject",
  // In old Chrome versions, value won't be an instanceof WebGLVertexArrayObject.
  "WebGLVertexArrayObjectOES"
].filter(
  (n) => typeof t[n] == "function"
).find(
  (n) => e instanceof t[n]
);
function Ld(e, t, r, i) {
  const n = [], s = Object.getOwnPropertyNames(
    t.CanvasRenderingContext2D.prototype
  );
  for (const l of s)
    try {
      if (typeof t.CanvasRenderingContext2D.prototype[l] != "function")
        continue;
      const p = ut(
        t.CanvasRenderingContext2D.prototype,
        l,
        function(o) {
          return function(...d) {
            return ve(this.canvas, r, i, !0) || setTimeout(() => {
              const a = pa(d, t, this);
              e(this.canvas, {
                type: Et["2D"],
                property: l,
                args: a
              });
            }, 0), o.apply(this, d);
          };
        }
      );
      n.push(p);
    } catch {
      const p = Er(
        t.CanvasRenderingContext2D.prototype,
        l,
        {
          set(o) {
            e(this.canvas, {
              type: Et["2D"],
              property: l,
              args: [o],
              setter: !0
            });
          }
        }
      );
      n.push(p);
    }
  return () => {
    n.forEach((l) => l());
  };
}
function Td(e) {
  return e === "experimental-webgl" ? "webgl" : e;
}
function Qs(e, t, r, i) {
  const n = [];
  try {
    const s = ut(
      e.HTMLCanvasElement.prototype,
      "getContext",
      function(l) {
        return function(p, ...o) {
          if (!ve(this, t, r, !0)) {
            const d = Td(p);
            if ("__context" in this || (this.__context = d), i && ["webgl", "webgl2"].includes(d))
              if (o[0] && typeof o[0] == "object") {
                const a = o[0];
                a.preserveDrawingBuffer || (a.preserveDrawingBuffer = !0);
              } else
                o.splice(0, 1, {
                  preserveDrawingBuffer: !0
                });
          }
          return l.apply(this, [p, ...o]);
        };
      }
    );
    n.push(s);
  } catch {
    console.error("failed to patch HTMLCanvasElement.prototype.getContext");
  }
  return () => {
    n.forEach((s) => s());
  };
}
function eo(e, t, r, i, n, s) {
  const l = [], p = Object.getOwnPropertyNames(e);
  for (const o of p)
    if (
      //prop.startsWith('get') ||  // e.g. getProgramParameter, but too risky
      ![
        "isContextLost",
        "canvas",
        "drawingBufferWidth",
        "drawingBufferHeight"
      ].includes(o)
    )
      try {
        if (typeof e[o] != "function")
          continue;
        const d = ut(
          e,
          o,
          function(a) {
            return function(...h) {
              const u = a.apply(this, h);
              if (ha(u, s, this), "tagName" in this.canvas && !ve(this.canvas, i, n, !0)) {
                const c = pa(h, s, this), m = {
                  type: t,
                  property: o,
                  args: c
                };
                r(this.canvas, m);
              }
              return u;
            };
          }
        );
        l.push(d);
      } catch {
        const d = Er(e, o, {
          set(a) {
            r(this.canvas, {
              type: t,
              property: o,
              args: [a],
              setter: !0
            });
          }
        });
        l.push(d);
      }
  return l;
}
function Pd(e, t, r, i) {
  const n = [];
  return typeof t.WebGLRenderingContext < "u" && n.push(
    ...eo(
      t.WebGLRenderingContext.prototype,
      Et.WebGL,
      e,
      r,
      i,
      t
    )
  ), typeof t.WebGL2RenderingContext < "u" && n.push(
    ...eo(
      t.WebGL2RenderingContext.prototype,
      Et.WebGL2,
      e,
      r,
      i,
      t
    )
  ), () => {
    n.forEach((s) => s());
  };
}
const ma = `(function() {
  "use strict";
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
  for (var i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }
  var encode = function(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer), i2, len = bytes.length, base64 = "";
    for (i2 = 0; i2 < len; i2 += 3) {
      base64 += chars[bytes[i2] >> 2];
      base64 += chars[(bytes[i2] & 3) << 4 | bytes[i2 + 1] >> 4];
      base64 += chars[(bytes[i2 + 1] & 15) << 2 | bytes[i2 + 2] >> 6];
      base64 += chars[bytes[i2 + 2] & 63];
    }
    if (len % 3 === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }
    return base64;
  };
  const lastBlobMap = /* @__PURE__ */ new Map();
  const transparentBlobMap = /* @__PURE__ */ new Map();
  async function getTransparentBlobFor(width, height, dataURLOptions) {
    const id = \`\${width}-\${height}\`;
    if ("OffscreenCanvas" in globalThis) {
      if (transparentBlobMap.has(id)) return transparentBlobMap.get(id);
      const offscreen = new OffscreenCanvas(width, height);
      offscreen.getContext("2d");
      const blob = await offscreen.convertToBlob(dataURLOptions);
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = encode(arrayBuffer);
      transparentBlobMap.set(id, base64);
      return base64;
    } else {
      return "";
    }
  }
  const worker = self;
  worker.onmessage = async function(e) {
    if ("OffscreenCanvas" in globalThis) {
      const { id, bitmap, width, height, dataURLOptions } = e.data;
      const transparentBase64 = getTransparentBlobFor(
        width,
        height,
        dataURLOptions
      );
      const offscreen = new OffscreenCanvas(width, height);
      const ctx = offscreen.getContext("2d");
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      const blob = await offscreen.convertToBlob(dataURLOptions);
      const type = blob.type;
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = encode(arrayBuffer);
      if (!lastBlobMap.has(id) && await transparentBase64 === base64) {
        lastBlobMap.set(id, base64);
        return worker.postMessage({ id });
      }
      if (lastBlobMap.get(id) === base64) return worker.postMessage({ id });
      worker.postMessage({
        id,
        type,
        base64,
        width,
        height
      });
      lastBlobMap.set(id, base64);
    } else {
      return worker.postMessage({ id: e.data.id });
    }
  };
})();
//# sourceMappingURL=image-bitmap-data-url-worker-IJpC7g_b.js.map
`, to = typeof self < "u" && self.Blob && new Blob([ma], { type: "text/javascript;charset=utf-8" });
function Nd(e) {
  let t;
  try {
    if (t = to && (self.URL || self.webkitURL).createObjectURL(to), !t) throw "";
    const r = new Worker(t, {
      name: e == null ? void 0 : e.name
    });
    return r.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), r;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(ma),
      {
        name: e == null ? void 0 : e.name
      }
    );
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
class _d {
  constructor(t) {
    L(this, "pendingCanvasMutations", /* @__PURE__ */ new Map()), L(this, "rafStamps", { latestId: 0, invokeId: null }), L(this, "mirror"), L(this, "mutationCb"), L(this, "resetObservers"), L(this, "frozen", !1), L(this, "locked", !1), L(this, "processMutation", (o, d) => {
      (this.rafStamps.invokeId && this.rafStamps.latestId !== this.rafStamps.invokeId || !this.rafStamps.invokeId) && (this.rafStamps.invokeId = this.rafStamps.latestId), this.pendingCanvasMutations.has(o) || this.pendingCanvasMutations.set(o, []), this.pendingCanvasMutations.get(o).push(d);
    });
    const {
      sampling: r = "all",
      win: i,
      blockClass: n,
      blockSelector: s,
      recordCanvas: l,
      dataURLOptions: p
    } = t;
    this.mutationCb = t.mutationCb, this.mirror = t.mirror, l && r === "all" && this.initCanvasMutationObserver(i, n, s), l && typeof r == "number" && this.initCanvasFPSObserver(r, i, n, s, {
      dataURLOptions: p
    });
  }
  reset() {
    this.pendingCanvasMutations.clear(), this.resetObservers && this.resetObservers();
  }
  freeze() {
    this.frozen = !0;
  }
  unfreeze() {
    this.frozen = !1;
  }
  lock() {
    this.locked = !0;
  }
  unlock() {
    this.locked = !1;
  }
  initCanvasFPSObserver(t, r, i, n, s) {
    const l = Qs(
      r,
      i,
      n,
      !0
    ), p = /* @__PURE__ */ new Map(), o = new Nd();
    o.onmessage = (m) => {
      const { id: f } = m.data;
      if (p.set(f, !1), !("base64" in m.data)) return;
      const { base64: g, type: x, width: y, height: v } = m.data;
      this.mutationCb({
        id: f,
        type: Et["2D"],
        commands: [
          {
            property: "clearRect",
            // wipe canvas
            args: [0, 0, y, v]
          },
          {
            property: "drawImage",
            // draws (semi-transparent) image
            args: [
              {
                rr_type: "ImageBitmap",
                args: [
                  {
                    rr_type: "Blob",
                    data: [{ rr_type: "ArrayBuffer", base64: g }],
                    type: x
                  }
                ]
              },
              0,
              0
            ]
          }
        ]
      });
    };
    const d = 1e3 / t;
    let a = 0, h;
    const u = () => {
      const m = [];
      return r.document.querySelectorAll("canvas").forEach((f) => {
        ve(f, i, n, !0) || m.push(f);
      }), m;
    }, c = (m) => {
      if (a && m - a < d) {
        h = requestAnimationFrame(c);
        return;
      }
      a = m, u().forEach(async (f) => {
        var g;
        const x = this.mirror.getId(f);
        if (p.get(x) || f.width === 0 || f.height === 0) return;
        if (p.set(x, !0), ["webgl", "webgl2"].includes(f.__context)) {
          const v = f.getContext(f.__context);
          ((g = v == null ? void 0 : v.getContextAttributes()) == null ? void 0 : g.preserveDrawingBuffer) === !1 && v.clear(v.COLOR_BUFFER_BIT);
        }
        const y = await createImageBitmap(f);
        o.postMessage(
          {
            id: x,
            bitmap: y,
            width: f.width,
            height: f.height,
            dataURLOptions: s.dataURLOptions
          },
          [y]
        );
      }), h = requestAnimationFrame(c);
    };
    h = requestAnimationFrame(c), this.resetObservers = () => {
      l(), cancelAnimationFrame(h);
    };
  }
  initCanvasMutationObserver(t, r, i) {
    this.startRAFTimestamping(), this.startPendingCanvasMutationFlusher();
    const n = Qs(
      t,
      r,
      i,
      !1
    ), s = Ld(
      this.processMutation.bind(this),
      t,
      r,
      i
    ), l = Pd(
      this.processMutation.bind(this),
      t,
      r,
      i
    );
    this.resetObservers = () => {
      n(), s(), l();
    };
  }
  startPendingCanvasMutationFlusher() {
    requestAnimationFrame(() => this.flushPendingCanvasMutations());
  }
  startRAFTimestamping() {
    const t = (r) => {
      this.rafStamps.latestId = r, requestAnimationFrame(t);
    };
    requestAnimationFrame(t);
  }
  flushPendingCanvasMutations() {
    this.pendingCanvasMutations.forEach(
      (t, r) => {
        const i = this.mirror.getId(r);
        this.flushPendingCanvasMutationFor(r, i);
      }
    ), requestAnimationFrame(() => this.flushPendingCanvasMutations());
  }
  flushPendingCanvasMutationFor(t, r) {
    if (this.frozen || this.locked)
      return;
    const i = this.pendingCanvasMutations.get(t);
    if (!i || r === -1) return;
    const n = i.map((l) => {
      const { type: p, ...o } = l;
      return o;
    }), { type: s } = i[0];
    this.mutationCb({ id: r, type: s, commands: n }), this.pendingCanvasMutations.delete(t);
  }
}
class $d {
  constructor(t) {
    L(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet()), L(this, "mutationCb"), L(this, "adoptedStyleSheetCb"), L(this, "styleMirror", new id()), this.mutationCb = t.mutationCb, this.adoptedStyleSheetCb = t.adoptedStyleSheetCb;
  }
  attachLinkElement(t, r) {
    "_cssText" in r.attributes && this.mutationCb({
      adds: [],
      removes: [],
      texts: [],
      attributes: [
        {
          id: r.id,
          attributes: r.attributes
        }
      ]
    }), this.trackLinkElement(t);
  }
  trackLinkElement(t) {
    this.trackedLinkElements.has(t) || (this.trackedLinkElements.add(t), this.trackStylesheetInLinkElement(t));
  }
  adoptStyleSheets(t, r) {
    if (t.length === 0) return;
    const i = {
      id: r,
      styleIds: []
    }, n = [];
    for (const s of t) {
      let l;
      this.styleMirror.has(s) ? l = this.styleMirror.getId(s) : (l = this.styleMirror.add(s), n.push({
        styleId: l,
        rules: Array.from(s.rules || CSSRule, (p, o) => ({
          rule: Ro(p, s.href),
          index: o
        }))
      })), i.styleIds.push(l);
    }
    n.length > 0 && (i.styles = n), this.adoptedStyleSheetCb(i);
  }
  reset() {
    this.styleMirror.reset(), this.trackedLinkElements = /* @__PURE__ */ new WeakSet();
  }
  // TODO: take snapshot on stylesheet reload by applying event listener
  trackStylesheetInLinkElement(t) {
  }
}
class Dd {
  constructor() {
    L(this, "nodeMap", /* @__PURE__ */ new WeakMap()), L(this, "active", !1);
  }
  inOtherBuffer(t, r) {
    const i = this.nodeMap.get(t);
    return i && Array.from(i).some((n) => n !== r);
  }
  add(t, r) {
    this.active || (this.active = !0, requestAnimationFrame(() => {
      this.nodeMap = /* @__PURE__ */ new WeakMap(), this.active = !1;
    })), this.nodeMap.set(t, (this.nodeMap.get(t) || /* @__PURE__ */ new Set()).add(r));
  }
  destroy() {
  }
}
let oe, tr, zn, ur = !1;
try {
  if (Array.from([1], (e) => e * 2)[0] !== 2) {
    const e = document.createElement("iframe");
    document.body.appendChild(e), Array.from = ((Ti = e.contentWindow) == null ? void 0 : Ti.Array.from) || Array.from, document.body.removeChild(e);
  }
} catch (e) {
  console.debug("Unable to override Array.from", e);
}
const _e = qc();
function Ze(e = {}) {
  const {
    emit: t,
    checkoutEveryNms: r,
    checkoutEveryNth: i,
    blockClass: n = "rr-block",
    blockSelector: s = null,
    ignoreClass: l = "rr-ignore",
    ignoreSelector: p = null,
    maskTextClass: o = "rr-mask",
    maskTextSelector: d = null,
    inlineStylesheet: a = !0,
    maskAllInputs: h,
    maskInputOptions: u,
    slimDOMOptions: c,
    maskInputFn: m,
    maskTextFn: f,
    hooks: g,
    packFn: x,
    sampling: y = {},
    dataURLOptions: v = {},
    mousemoveWait: S,
    recordDOM: w = !0,
    recordCanvas: b = !1,
    recordCrossOriginIframes: k = !1,
    recordAfter: E = e.recordAfter === "DOMContentLoaded" ? e.recordAfter : "load",
    userTriggeredOnInput: A = !1,
    collectFonts: M = !1,
    inlineImages: _ = !1,
    plugins: P,
    keepIframeSrcFn: C = () => !1,
    ignoreCSSAttributes: we = /* @__PURE__ */ new Set([]),
    errorHandler: he
  } = e;
  dd(he);
  const j = k ? window.parent === window : !0;
  let B = !1;
  if (!j)
    try {
      window.parent.document && (B = !1);
    } catch {
      B = !0;
    }
  if (j && !t)
    throw new Error("emit function is required");
  if (!j && !B)
    return () => {
    };
  S !== void 0 && y.mousemove === void 0 && (y.mousemove = S), _e.reset();
  const K = h === !0 ? {
    color: !0,
    date: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0,
    textarea: !0,
    select: !0,
    password: !0
  } : u !== void 0 ? u : { password: !0 }, ee = No(c);
  nd();
  let ie, q = 0;
  const Ie = ($) => {
    for (const se of P || [])
      se.eventProcessor && ($ = se.eventProcessor($));
    return x && // Disable packing events which will be emitted to parent frames.
    !B && ($ = x($)), $;
  };
  oe = ($, se) => {
    var R;
    const T = $;
    if (T.timestamp = Nt(), (R = it[0]) != null && R.isFrozen() && T.type !== V.FullSnapshot && !(T.type === V.IncrementalSnapshot && T.data.source === U.Mutation) && it.forEach((N) => N.unfreeze()), j)
      t == null || t(Ie(T), se);
    else if (B) {
      const N = {
        type: "rrweb",
        event: Ie(T),
        origin: window.location.origin,
        isCheckout: se
      };
      window.parent.postMessage(N, "*");
    }
    if (T.type === V.FullSnapshot)
      ie = T, q = 0;
    else if (T.type === V.IncrementalSnapshot) {
      if (T.data.source === U.Mutation && T.data.isAttachIframe)
        return;
      q++;
      const N = i && q >= i, I = r && T.timestamp - ie.timestamp > r;
      (N || I) && tr(!0);
    }
  };
  const O = ($) => {
    oe({
      type: V.IncrementalSnapshot,
      data: {
        source: U.Mutation,
        ...$
      }
    });
  }, le = ($) => oe({
    type: V.IncrementalSnapshot,
    data: {
      source: U.Scroll,
      ...$
    }
  }), ce = ($) => oe({
    type: V.IncrementalSnapshot,
    data: {
      source: U.CanvasMutation,
      ...$
    }
  }), Ae = ($) => oe({
    type: V.IncrementalSnapshot,
    data: {
      source: U.AdoptedStyleSheet,
      ...$
    }
  }), de = new $d({
    mutationCb: O,
    adoptedStyleSheetCb: Ae
  }), xe = new Md({
    mirror: _e,
    mutationCb: O,
    stylesheetManager: de,
    recordCrossOriginIframes: k,
    wrappedEmit: oe
  });
  for (const $ of P || [])
    $.getMirror && $.getMirror({
      nodeMirror: _e,
      crossOriginIframeMirror: xe.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: xe.crossOriginIframeStyleMirror
    });
  const Le = new Dd();
  zn = new _d({
    recordCanvas: b,
    mutationCb: ce,
    win: window,
    blockClass: n,
    blockSelector: s,
    mirror: _e,
    sampling: y.canvas,
    dataURLOptions: v
  });
  const Te = new Rd({
    mutationCb: O,
    scrollCb: le,
    bypassOptions: {
      blockClass: n,
      blockSelector: s,
      maskTextClass: o,
      maskTextSelector: d,
      inlineStylesheet: a,
      maskInputOptions: K,
      dataURLOptions: v,
      maskTextFn: f,
      maskInputFn: m,
      recordCanvas: b,
      inlineImages: _,
      sampling: y,
      slimDOMOptions: ee,
      iframeManager: xe,
      stylesheetManager: de,
      canvasManager: zn,
      keepIframeSrcFn: C,
      processedNodeManager: Le
    },
    mirror: _e
  });
  tr = ($ = !1) => {
    if (!w)
      return;
    oe(
      {
        type: V.Meta,
        data: {
          href: window.location.href,
          width: ea(),
          height: Qo()
        }
      },
      $
    ), de.reset(), Te.init(), it.forEach((R) => R.lock());
    const se = fu(document, {
      mirror: _e,
      blockClass: n,
      blockSelector: s,
      maskTextClass: o,
      maskTextSelector: d,
      inlineStylesheet: a,
      maskAllInputs: K,
      maskTextFn: f,
      maskInputFn: m,
      slimDOM: ee,
      dataURLOptions: v,
      recordCanvas: b,
      inlineImages: _,
      onSerialize: (R) => {
        na(R, _e) && xe.addIframe(R), ia(R, _e) && de.trackLinkElement(R), jn(R) && Te.addShadowRoot(F.shadowRoot(R), document);
      },
      onIframeLoad: (R, T) => {
        xe.attachIframe(R, T), Te.observeAttachShadow(R);
      },
      onStylesheetLoad: (R, T) => {
        de.attachLinkElement(R, T);
      },
      keepIframeSrcFn: C
    });
    if (!se)
      return console.warn("Failed to snapshot the document");
    oe(
      {
        type: V.FullSnapshot,
        data: {
          node: se,
          initialOffset: Zo(window)
        }
      },
      $
    ), it.forEach((R) => R.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && de.adoptStyleSheets(
      document.adoptedStyleSheets,
      _e.getId(document)
    );
  };
  try {
    const $ = [], se = (T) => {
      var N;
      return W(Ed)(
        {
          mutationCb: O,
          mousemoveCb: (I, H) => oe({
            type: V.IncrementalSnapshot,
            data: {
              source: H,
              positions: I
            }
          }),
          mouseInteractionCb: (I) => oe({
            type: V.IncrementalSnapshot,
            data: {
              source: U.MouseInteraction,
              ...I
            }
          }),
          scrollCb: le,
          viewportResizeCb: (I) => oe({
            type: V.IncrementalSnapshot,
            data: {
              source: U.ViewportResize,
              ...I
            }
          }),
          inputCb: (I) => oe({
            type: V.IncrementalSnapshot,
            data: {
              source: U.Input,
              ...I
            }
          }),
          mediaInteractionCb: (I) => oe({
            type: V.IncrementalSnapshot,
            data: {
              source: U.MediaInteraction,
              ...I
            }
          }),
          styleSheetRuleCb: (I) => oe({
            type: V.IncrementalSnapshot,
            data: {
              source: U.StyleSheetRule,
              ...I
            }
          }),
          styleDeclarationCb: (I) => oe({
            type: V.IncrementalSnapshot,
            data: {
              source: U.StyleDeclaration,
              ...I
            }
          }),
          canvasMutationCb: ce,
          fontCb: (I) => oe({
            type: V.IncrementalSnapshot,
            data: {
              source: U.Font,
              ...I
            }
          }),
          selectionCb: (I) => {
            oe({
              type: V.IncrementalSnapshot,
              data: {
                source: U.Selection,
                ...I
              }
            });
          },
          customElementCb: (I) => {
            oe({
              type: V.IncrementalSnapshot,
              data: {
                source: U.CustomElement,
                ...I
              }
            });
          },
          blockClass: n,
          ignoreClass: l,
          ignoreSelector: p,
          maskTextClass: o,
          maskTextSelector: d,
          maskInputOptions: K,
          inlineStylesheet: a,
          sampling: y,
          recordDOM: w,
          recordCanvas: b,
          inlineImages: _,
          userTriggeredOnInput: A,
          collectFonts: M,
          doc: T,
          maskInputFn: m,
          maskTextFn: f,
          keepIframeSrcFn: C,
          blockSelector: s,
          slimDOMOptions: ee,
          dataURLOptions: v,
          mirror: _e,
          iframeManager: xe,
          stylesheetManager: de,
          shadowDomManager: Te,
          processedNodeManager: Le,
          canvasManager: zn,
          ignoreCSSAttributes: we,
          plugins: ((N = P == null ? void 0 : P.filter((I) => I.observer)) == null ? void 0 : N.map((I) => ({
            observer: I.observer,
            options: I.options,
            callback: (H) => oe({
              type: V.Plugin,
              data: {
                plugin: I.name,
                payload: H
              }
            })
          }))) || []
        },
        g
      );
    };
    xe.addLoadListener((T) => {
      try {
        $.push(se(T.contentDocument));
      } catch (N) {
        console.warn(N);
      }
    });
    const R = () => {
      tr(), $.push(se(document)), ur = !0;
    };
    return ["interactive", "complete"].includes(document.readyState) ? R() : ($.push(
      be("DOMContentLoaded", () => {
        oe({
          type: V.DomContentLoaded,
          data: {}
        }), E === "DOMContentLoaded" && R();
      })
    ), $.push(
      be(
        "load",
        () => {
          oe({
            type: V.Load,
            data: {}
          }), E === "load" && R();
        },
        window
      )
    )), () => {
      $.forEach((T) => {
        try {
          T();
        } catch (N) {
          String(N).toLowerCase().includes("cross-origin") || console.warn(N);
        }
      }), Le.destroy(), ur = !1, hd();
    };
  } catch ($) {
    console.warn($);
  }
}
Ze.addCustomEvent = (e, t) => {
  if (!ur)
    throw new Error("please add custom event after start recording");
  oe({
    type: V.Custom,
    data: {
      tag: e,
      payload: t
    }
  });
};
Ze.freezePage = () => {
  it.forEach((e) => e.freeze());
};
Ze.takeFullSnapshot = (e) => {
  if (!ur)
    throw new Error("please take full snapshot after start recording");
  tr(e);
};
Ze.mirror = _e;
var ro;
(function(e) {
  e[e.NotStarted = 0] = "NotStarted", e[e.Running = 1] = "Running", e[e.Stopped = 2] = "Stopped";
})(ro || (ro = {}));
const { addCustomEvent: Mh } = Ze, { freezePage: Rh } = Ze, { takeFullSnapshot: Oh } = Ze, Fn = 2, zd = 4;
class Fd {
  constructor(t) {
    Bt(this, "events", []);
    Bt(this, "lastMeta", null);
    Bt(this, "lastFull", null);
    this.opts = t;
  }
  push(t) {
    t.type === zd && (this.lastMeta = t), t.type === Fn && (this.lastFull = t, this.events = []), this.events.push(t), this.prune();
  }
  prune() {
    if (!this.events.length) return;
    const r = this.events[this.events.length - 1].timestamp - this.opts.windowMs;
    let i = 0;
    for (; i < this.events.length && this.events[i].timestamp < r; ) i++;
    i > 0 && (this.events = this.events.slice(i)), this.events.length > this.opts.maxEvents && (this.events = this.events.slice(this.events.length - this.opts.maxEvents));
  }
  /** A playable, head-anchored copy: [meta?, fullSnapshot, ...trailing incrementals]. */
  snapshot() {
    const t = [];
    return !this.events.some((i) => i.type === Fn) && this.lastFull && (this.lastMeta && t.push(this.lastMeta), t.push(this.lastFull)), [...t, ...this.events];
  }
  /** True when the buffer can produce a scrubbable replay (a full snapshot + at least one more event). */
  isPlayable() {
    const t = this.snapshot();
    return t.some((i) => i.type === Fn) && t.length >= 2;
  }
  clear() {
    this.events = [], this.lastMeta = null, this.lastFull = null;
  }
}
function Ud(e, t = {}) {
  const r = new Fd({
    windowMs: t.windowMs ?? 45e3,
    maxEvents: t.maxEvents ?? 2e3
  }), i = t.maskAllInputs !== !1, n = t.maskText !== !1;
  let s;
  try {
    s = e({
      emit(l) {
        try {
          r.push(l);
        } catch {
        }
      },
      maskAllInputs: i,
      // Mask every text node by default. rrweb calls maskTextFn(text) per node; '*' keeps layout.
      maskTextFn: n ? (l) => "*".repeat(l.length) : void 0,
      // Don't record <script>/<noscript> contents and obvious secrets.
      blockClass: "klavity-no-record",
      ignoreClass: "klavity-no-record",
      recordCanvas: !1,
      collectFonts: !1
    });
  } catch {
  }
  return {
    getEvents: () => r.isPlayable() ? r.snapshot() : [],
    hasRecording: () => r.isPlayable(),
    stop: () => {
      try {
        s == null || s();
      } catch {
      }
      r.clear();
    }
  };
}
const ga = "klav-sims-live", ya = "klav-sims-overlay", no = "klav-sims-ext-css";
let Me = null, nt = null, Se = null, wt = null;
const dr = /* @__PURE__ */ new Map(), Oe = /* @__PURE__ */ new Map();
let ba = 0, We = !1, st = null, kt = null, Ft = !1, ye = null, It = null, Xe = null, Je = null, De = null, ot = null, $e = null, Be = null, ze = null, xt = null;
const hr = /* @__PURE__ */ new Set();
function Bd(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function va(e, t) {
  return `${e}::${Bd(t.text)}`;
}
function wa(e) {
  try {
    document.dispatchEvent(new CustomEvent("klavity:sims-live", { detail: { active: e } }));
  } catch {
  }
}
const Wd = `
  :host { all: initial; font-family: system-ui, -apple-system, sans-serif; }

  .ksl-sr {
    position: absolute; width: 1px; height: 1px;
    overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; pointer-events: none;
  }

  /* ── design tokens (mirror packages/core/demo/sims-feedback-panel.html) ── */
  .ksl-root {
    --surface:   #16110c;
    --surface-2: #1c1610;
    --surface-3: #221b13;
    --line:      #3a332b;
    --line-soft: #2a231b;
    --fg:   #f5f3ee;
    --fg-2: #cec6bd;
    --fg-3: #8a8276;
    --fg-4: #5e5852;
    --accent:   #8b5cf6;
    --accent-2: #a78bfa;
    --accent-3: #c4b5fd;
    --accent-glow: rgba(139,92,246,.28);
    --sev-h-bg: rgba(233,79,55,.22);  --sev-h-fg:#e8849a;
    --sev-m-bg: rgba(244,169,60,.20); --sev-m-fg:#e8a24a;
    --sev-l-bg: rgba(127,209,196,.15);--sev-l-fg:#7fd1c4;
    --mono: ui-monospace,'JetBrains Mono',monospace;
    --ease: cubic-bezier(.34,1.36,.64,1);
    pointer-events: none;   /* only interactive children capture events */
  }
  .ksl-root button { font-family: inherit; }

  /* ═══════════════ launcher pill ═══════════════ */
  .ksl-launcher {
    position: fixed; right: 20px; bottom: 20px;
    display: inline-flex; align-items: center; gap: 0;
    border: 0; cursor: pointer; background: transparent; padding: 0;
    pointer-events: auto;
  }
  .ksl-launcher[hidden] { display: none; }
  .ksl-pill {
    display: flex; align-items: center; gap: 10px;
    background: linear-gradient(168deg, var(--surface-2), var(--surface));
    border: 1px solid var(--accent-glow); border-radius: 999px;
    padding: 8px 16px 8px 10px;
    box-shadow: 0 18px 46px -14px rgba(0,0,0,.7), 0 0 0 4px rgba(139,92,246,.1);
    transition: transform .15s var(--ease), border-color .15s;
  }
  .ksl-launcher:hover .ksl-pill { transform: translateY(-2px); border-color: var(--accent-2); }
  .ksl-launcher:active .ksl-pill { transform: scale(.97); }
  .ksl-launcher:focus-visible { outline: none; }
  .ksl-launcher:focus-visible .ksl-pill { border-color: var(--accent-2); box-shadow: 0 18px 46px -14px rgba(0,0,0,.7), 0 0 0 3px var(--accent-2); }
  .ksl-pill-txt { font-size: 13px; font-weight: 600; color: var(--fg); white-space: nowrap; }
  .ksl-pill-txt b { color: var(--accent-3); }
  .ksl-pill-avatars { display: flex; }
  .ksl-pill-avatars .ksim { margin-left: -10px; }
  .ksl-pill-avatars .ksim:first-child { margin-left: 0; }
  .ksl-pill-badge {
    position: absolute; top: -4px; right: -4px;
    background: var(--sev-h-fg); color: #2a0e12;
    font: 700 10px/1 var(--mono); border-radius: 20px; padding: 3px 6px;
    box-shadow: 0 4px 10px rgba(0,0,0,.5);
  }
  .ksl-pill-badge[hidden] { display: none; }

  /* reviewing shimmer inside the launcher */
  .ksl-launcher.is-reviewing .ksl-pill { border-color: var(--accent-2); }
  .ksl-launcher.is-reviewing .ksl-pill-txt::after {
    content: ''; display: inline-block; width: 7px; height: 7px; margin-left: 7px;
    border-radius: 50%; background: var(--accent-2); vertical-align: middle;
    box-shadow: 0 0 0 0 rgba(167,139,250,.55);
    animation: ksl-pulse 1.4s ease-out infinite;
  }
  @keyframes ksl-pulse {
    0%   { box-shadow: 0 0 0 0 rgba(167,139,250,.55); opacity: 1; }
    70%  { box-shadow: 0 0 0 7px rgba(167,139,250,0); opacity: .85; }
    100% { box-shadow: 0 0 0 0 rgba(167,139,250,0); opacity: 1; }
  }

  /* ═══════════════ floating chat panel ═══════════════ */
  .ksl-panel {
    position: fixed; right: 20px; bottom: 20px; z-index: 1;
    width: 378px; max-width: calc(100vw - 32px);
    height: min(620px, calc(100vh - 96px));
    display: none; flex-direction: column; overflow: hidden;
    background: linear-gradient(168deg, var(--surface-2), var(--surface));
    border: 1px solid var(--line); border-radius: 18px;
    box-shadow: 0 30px 70px -20px rgba(0,0,0,.8), 0 0 0 4px rgba(139,92,246,.08);
    transform-origin: bottom right;
    color: var(--fg); pointer-events: auto;
  }
  .ksl-panel.is-open { display: flex; animation: ksl-panel-in .34s var(--ease) both; }
  @keyframes ksl-panel-in { 0% { transform: translateY(24px) scale(.9); opacity: 0; } 100% { transform: none; opacity: 1; } }

  .ksl-head { padding: 16px 16px 12px; border-bottom: 1px solid var(--line-soft); flex-shrink: 0; }
  .ksl-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 3px; }
  .ksl-title { font-size: 14.5px; font-weight: 700; }
  .ksl-count { font-size: 12.5px; color: var(--fg-3); }
  .ksl-count b { color: var(--accent-3); }
  .ksl-count .ksl-hi { color: var(--sev-h-fg); }
  .ksl-icon-btn {
    margin-left: auto; width: 30px; height: 30px; border-radius: 8px;
    border: 1px solid var(--line); background: transparent; color: var(--fg-3);
    cursor: pointer; display: grid; place-items: center;
    transition: transform .15s var(--ease), background .15s, color .15s;
  }
  .ksl-icon-btn:hover { transform: translateY(-1px); background: rgba(255,255,255,.06); color: var(--fg); }
  .ksl-icon-btn:active { transform: scale(.94); }
  .ksl-icon-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .ksl-icon-btn svg { width: 15px; height: 15px; }

  .ksl-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 11px; }
  .ksl-chips[hidden] { display: none; }
  .ksl-chip {
    font: 600 11px/1 system-ui,sans-serif; border-radius: 20px; padding: 6px 10px; cursor: pointer;
    border: 1px solid var(--line); background: var(--surface-2); color: var(--fg-3);
    display: inline-flex; align-items: center; gap: 5px;
    transition: transform .15s var(--ease), background .15s, border-color .15s, color .15s;
  }
  .ksl-chip:hover { transform: translateY(-1px); color: var(--fg); }
  .ksl-chip:active { transform: scale(.96); }
  .ksl-chip:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .ksl-chip .ksl-dot { width: 8px; height: 8px; border-radius: 50%; }
  .ksl-chip.is-on { background: rgba(139,92,246,.16); border-color: rgba(139,92,246,.5); color: var(--accent-3); }
  .ksl-chip.sev-on-h { background: var(--sev-h-bg); border-color: var(--sev-h-fg); color: var(--sev-h-fg); }
  .ksl-chip.sev-on-m { background: var(--sev-m-bg); border-color: var(--sev-m-fg); color: var(--sev-m-fg); }
  .ksl-chip.sev-on-l { background: var(--sev-l-bg); border-color: var(--sev-l-fg); color: var(--sev-l-fg); }
  .ksl-chips-label {
    font: 700 9.5px/1 var(--mono); letter-spacing: .08em; text-transform: uppercase;
    color: var(--fg-4); align-self: center; margin-right: 2px;
  }

  .ksl-list { flex: 1; overflow-y: auto; padding: 12px 14px 22px; display: flex; flex-direction: column; gap: 10px; }
  .ksl-list::-webkit-scrollbar { width: 9px; }
  .ksl-list::-webkit-scrollbar-thumb { background: var(--line); border-radius: 6px; border: 2px solid var(--surface); }

  /* ── empty / reviewing state ── */
  .ksl-empty { color: var(--fg-4); font-size: 13px; text-align: center; padding: 40px 18px; line-height: 1.5; }
  .ksl-empty .ksl-empty-title { color: var(--fg-2); font-size: 14px; font-weight: 600; margin-bottom: 6px; }
  .ksl-shimmer {
    display: inline-block; margin-top: 12px; height: 8px; width: 70%; border-radius: 6px;
    background: linear-gradient(90deg, var(--surface-2) 0%, var(--surface-3) 40%, var(--accent-glow) 50%, var(--surface-3) 60%, var(--surface-2) 100%);
    background-size: 200% 100%; animation: ksl-shimmer 1.4s linear infinite;
  }
  @keyframes ksl-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* ── severity pill ── */
  .ksl-sev {
    display: inline-block; font: 700 9px/1 var(--mono); letter-spacing: .05em; text-transform: uppercase;
    padding: 3px 6px; border-radius: 5px; flex-shrink: 0;
  }
  .ksl-sev.h { background: var(--sev-h-bg); color: var(--sev-h-fg); }
  .ksl-sev.m { background: var(--sev-m-bg); color: var(--sev-m-fg); }
  .ksl-sev.l { background: var(--sev-l-bg); color: var(--sev-l-fg); }

  /* ── finding row ── */
  .ksl-row {
    position: relative; border: 1px solid var(--line-soft); border-left-width: 3px;
    border-radius: 12px; background: var(--surface-2); padding: 12px 13px 11px;
    text-align: left; width: 100%; display: block;
    transition: transform .15s var(--ease), background .15s, box-shadow .15s;
  }
  .ksl-row:hover { transform: translateY(-2px) scale(1.012); background: var(--surface-3); box-shadow: 0 12px 30px -12px rgba(0,0,0,.7); }
  .ksl-row .ksl-r-head { display: flex; align-items: center; gap: 9px; margin-bottom: 8px; }
  .ksl-r-name { font: 700 9.5px/1 var(--mono); letter-spacing: .09em; text-transform: uppercase;
    color: var(--fg-2); flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  .ksl-r-sent { font: 600 10px/1 system-ui,sans-serif; color: var(--fg-4); text-transform: capitalize; white-space: nowrap; }
  .ksl-r-obs { font-size: 13px; line-height: 1.5; color: var(--fg-2);
    display: -webkit-box; -webkit-line-clamp: 4; line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
  .ksl-row.is-expanded .ksl-r-obs { -webkit-line-clamp: unset; line-clamp: unset; overflow: visible; }
  .ksl-r-expand { font: 600 11px/1 system-ui,sans-serif; color: var(--accent-3); margin-top: 6px;
    background: none; border: 0; padding: 2px 0; cursor: pointer; display: none; }
  .ksl-row.is-clamped .ksl-r-expand { display: inline-block; }
  .ksl-r-expand:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .ksl-r-actions { display: flex; gap: 7px; margin-top: 11px; flex-wrap: wrap; }
  .ksl-r-act {
    font: 600 11px/1 system-ui,sans-serif; border-radius: 7px; padding: 6px 9px; cursor: pointer;
    display: inline-flex; align-items: center; gap: 5px;
    transition: transform .15s var(--ease), background .15s, border-color .15s, color .15s;
  }
  .ksl-r-act:hover { transform: translateY(-1px); }
  .ksl-r-act:active { transform: scale(.96); }
  .ksl-r-act:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .ksl-r-act svg { width: 12px; height: 12px; }
  .ksl-r-act.track { background: rgba(139,92,246,.18); border: 1px solid rgba(139,92,246,.38); color: var(--accent-3); }
  .ksl-r-act.track:hover { background: rgba(139,92,246,.32); border-color: rgba(139,92,246,.6); }
  .ksl-r-act.jump { background: transparent; border: 1px solid var(--line); color: var(--fg-2); }
  .ksl-r-act.jump:hover { background: rgba(255,255,255,.06); border-color: #5a5248; color: var(--fg); }
  .ksl-r-act.dismiss { background: transparent; border: 1px solid var(--line); color: var(--fg-4); margin-left: auto; }
  .ksl-r-act.dismiss:hover { background: rgba(255,255,255,.06); color: var(--fg-2); }
  .ksl-row.is-removing { opacity: 0; transform: translateX(18px) scale(.96); pointer-events: none;
    transition: opacity .28s ease, transform .28s var(--ease); }

  @media (max-width:480px) {
    .ksl-panel { right: 12px; bottom: 12px; width: calc(100vw - 24px); }
    .ksl-launcher { right: 12px; bottom: 12px; }
  }
  @media (prefers-reduced-motion:reduce) {
    .ksl-panel.is-open,.ksl-row,.ksl-shimmer,.ksl-launcher.is-reviewing .ksl-pill-txt::after { animation: none !important; }
    .ksl-panel, .ksl-row, .ksl-pill, .ksl-chip, .ksl-r-act, .ksl-icon-btn { transition: none !important; }
  }
`, jd = `
  /* ── Halo box — TRANSIENT highlight drawn around a flagged element on "Jump to" ── */
  .klav-halo {
    position: fixed;
    pointer-events: none;
    border-radius: 8px;
    z-index: 2147483640;
    border-width: 2px;
    border-style: solid;
    animation: klav-halo-in .38s cubic-bezier(.34,1.36,.64,1) both,
               klav-halo-pulse 2.4s ease-in-out .4s infinite;
    transition: opacity .18s ease, transform .18s ease;
  }
  @keyframes klav-halo-in {
    from { transform: scale(.84); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
  @keyframes klav-halo-pulse {
    0%,100% { opacity: .75; }
    50%     { opacity: 1; }
  }
  @media (prefers-reduced-motion:reduce) {
    .klav-halo { animation: none !important; opacity: 1; transform: none; }
  }
`;
function io(e, t) {
  const r = e.replace("#", ""), i = (p) => parseInt(p, 16), [n, s, l] = r.length === 3 ? [i(r[0] + r[0]), i(r[1] + r[1]), i(r[2] + r[2])] : [i(r.slice(0, 2)), i(r.slice(2, 4)), i(r.slice(4, 6))];
  return `rgba(${n},${s},${l},${t})`;
}
function qd(e) {
  if (e.suggestedBug) return !0;
  const t = String(e.priority ?? "").trim().toLowerCase();
  if (t && t !== "none") return !0;
  const r = String(e.sentiment ?? "").trim().toLowerCase();
  return r ? !(/* @__PURE__ */ new Set(["positive", "satisfied", "delighted", "neutral", "none"])).has(r) : !1;
}
function Hn() {
  var e, t;
  try {
    return ((t = (e = window.matchMedia) == null ? void 0 : e.call(window, "(prefers-reduced-motion: reduce)")) == null ? void 0 : t.matches) ?? !1;
  } catch {
    return !1;
  }
}
function Hd(e) {
  return new Promise((t) => setTimeout(t, e));
}
function St(e) {
  const t = String(e.priority ?? "").trim().toLowerCase();
  return t === "high" || t === "critical" || t === "urgent" ? "HIGH" : t === "medium" || t === "med" ? "MED" : t === "low" ? "LOW" : e.suggestedBug ? "HIGH" : null;
}
const xa = { HIGH: "h", MED: "m", LOW: "l" }, so = { HIGH: 0, MED: 1, LOW: 2 };
function Vd(e) {
  if (!e) return !1;
  if (e === Se || e === Me || e.id === ya || e.id === ga || e.id === "klavity-widget-host") return !0;
  const t = e.classList;
  return !!t && t.contains("klav-halo");
}
function Gd(e) {
  const t = [];
  for (const r of [Se, Me])
    r && (t.push({ el: r, vis: r.style.visibility }), r.style.visibility = "hidden");
  try {
    return e();
  } finally {
    for (const { el: r, vis: i } of t) r.style.visibility = i;
  }
}
function ka(e) {
  const t = e.targetViewport;
  return {
    scrollX: Number.isFinite(t == null ? void 0 : t.scrollX) ? Number(t.scrollX) : window.scrollX,
    scrollY: Number.isFinite(t == null ? void 0 : t.scrollY) ? Number(t.scrollY) : window.scrollY,
    width: Math.max(1, Number.isFinite(t == null ? void 0 : t.width) ? Number(t.width) : window.innerWidth),
    height: Math.max(1, Number.isFinite(t == null ? void 0 : t.height) ? Number(t.height) : window.innerHeight)
  };
}
function Sa(e, t) {
  return new DOMRect(
    t.scrollX + e.x * t.width,
    t.scrollY + e.y * t.height,
    Math.max(1, e.w * t.width),
    Math.max(1, e.h * t.height)
  );
}
function oo(e) {
  return Math.max(0, e.width) * Math.max(0, e.height);
}
function Yd(e, t) {
  const r = Math.max(e.left, t.left), i = Math.min(e.right, t.right), n = Math.max(e.top, t.top), s = Math.min(e.bottom, t.bottom);
  return Math.max(0, i - r) * Math.max(0, s - n);
}
function Xd(e) {
  return new DOMRect(e.left + window.scrollX, e.top + window.scrollY, e.width, e.height);
}
function Ca(e) {
  if (!e || !(e instanceof HTMLElement) || e === document.body || e === document.documentElement || Vd(e)) return !1;
  const t = e.getBoundingClientRect();
  if (t.width < 8 || t.height < 8) return !1;
  try {
    const r = getComputedStyle(e);
    if (r.display === "none" || r.visibility === "hidden" || Number(r.opacity) === 0) return !1;
  } catch {
  }
  return !0;
}
function Jd(e, t) {
  return Gd(() => {
    const r = /* @__PURE__ */ new Set(), i = [], n = (l) => {
      let p = l;
      for (; p && p !== document.body && p !== document.documentElement; )
        !r.has(p) && Ca(p) && (r.add(p), i.push(p)), p = p.parentElement;
    }, s = typeof document.elementsFromPoint == "function" ? document.elementsFromPoint(e, t) : [document.elementFromPoint(e, t)].filter(Boolean);
    for (const l of s) n(l);
    return i;
  });
}
function Kd(e, t) {
  const r = ka(t), i = Sa(e, r), n = Math.max(2, Math.min(window.innerWidth - 2, i.left + i.width / 2 - window.scrollX)), s = Math.max(2, Math.min(window.innerHeight - 2, i.top + i.height / 2 - window.scrollY)), l = Jd(n, s);
  if (!l.length) return null;
  const p = Math.max(1, oo(i));
  let o = null, d = -1 / 0;
  for (const a of l) {
    const h = Xd(a.getBoundingClientRect()), u = Yd(h, i);
    if (u <= 0) continue;
    const c = Math.max(1, oo(h)), m = u / p, f = Math.max(0, (c - u) / c), g = a.tagName.toLowerCase(), x = /^(button|a|input|textarea|select|label|section|article|nav|header|footer|main|form)$/.test(g) ? 0.18 : 0, y = c > window.innerWidth * window.innerHeight * 0.92 ? 0.8 : 0, v = m - f * 0.35 + x - y;
    v > d && (o = a, d = v);
  }
  return o ?? l[0] ?? null;
}
async function Zd(e, t) {
  if (e >= window.scrollX + 80 && e <= window.scrollX + window.innerWidth - 80 && t >= window.scrollY + 80 && t <= window.scrollY + window.innerHeight - 80) return;
  const n = Math.max(0, document.documentElement.scrollHeight - window.innerHeight), s = Math.max(0, document.documentElement.scrollWidth - window.innerWidth), l = Math.max(0, Math.min(n, t - window.innerHeight * 0.38)), p = Math.max(0, Math.min(s, e - window.innerWidth * 0.45));
  try {
    window.scrollTo({ top: l, left: p, behavior: Hn() ? "auto" : "smooth" });
  } catch {
    window.scrollTo(p, l);
  }
  await Hd(Hn() ? 80 : 520);
}
const Qd = /* @__PURE__ */ new Set([
  "about",
  "after",
  "again",
  "also",
  "because",
  "being",
  "button",
  "clear",
  "could",
  "easy",
  "element",
  "feels",
  "from",
  "have",
  "into",
  "just",
  "like",
  "more",
  "page",
  "section",
  "that",
  "the",
  "their",
  "there",
  "this",
  "with",
  "would",
  "where",
  "while",
  "your"
]);
function eh(e) {
  const t = /* @__PURE__ */ new Set();
  return String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((r) => r.length < 4 || Qd.has(r) || t.has(r) ? !1 : (t.add(r), !0));
}
function th(e) {
  const t = eh(e.text);
  if (!t.length) return null;
  const r = [
    "button",
    "a",
    "input",
    "textarea",
    "select",
    "label",
    "h1",
    "h2",
    "h3",
    "h4",
    "p",
    "li",
    "nav",
    "header",
    "footer",
    "main",
    "section",
    "article",
    "form",
    "[role]",
    "[aria-label]",
    "[data-testid]",
    "div"
  ].join(",");
  let i = null, n = 0;
  const s = Array.from(document.querySelectorAll(r)).slice(0, 700);
  for (const l of s) {
    if (!Ca(l)) continue;
    const p = l.getBoundingClientRect(), o = [
      l.textContent || "",
      l.getAttribute("aria-label") || "",
      l.getAttribute("title") || "",
      l.getAttribute("placeholder") || "",
      l.getAttribute("data-testid") || "",
      l.id || "",
      typeof l.className == "string" ? l.className : ""
    ].join(" ").toLowerCase();
    if (!o.trim()) continue;
    const d = t.reduce((f, g) => f + (o.includes(g) ? 1 : 0), 0);
    if (!d) continue;
    const a = l.tagName.toLowerCase(), h = /^(button|a|input|textarea|select|label|h1|h2|h3|section|article|nav|header|footer|main|form)$/.test(a) ? 0.6 : 0, c = Math.max(1, p.width * p.height) > window.innerWidth * window.innerHeight * 0.85 ? 1.1 : 0, m = d / t.length + h - c;
    m > n && (i = l, n = m);
  }
  return i;
}
async function rh(e, t = {}) {
  if (e.region) {
    const r = ka(e), i = Sa(e.region, r);
    t.scroll !== !1 && await Zd(i.left + i.width / 2, i.top + i.height / 2);
    const n = Kd(e.region, e);
    if (n) return n;
  }
  return th(e);
}
function nh() {
  if (Me && nt) return nt;
  Me = document.createElement("div"), Me.id = ga, Me.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;", nt = Me.attachShadow({ mode: "open" }), hc(nt);
  const e = document.createElement("style");
  return e.textContent = Wd, nt.appendChild(e), document.body.appendChild(Me), nt;
}
function Ea() {
  if (Se) return Se;
  if (!document.getElementById(no)) {
    const e = document.createElement("style");
    e.id = no, e.textContent = jd, document.head.appendChild(e);
  }
  return Se = document.createElement("div"), Se.id = ya, Se.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483640;pointer-events:none;overflow:visible;", document.body.appendChild(Se), Se;
}
function Ma(e, t) {
  return uc({
    name: e.name,
    initials: e.initials,
    photoUrl: e.photoUrl,
    color: e.accent,
    animate: !1,
    legs: !0,
    size: t
  });
}
function ih(e, t = [], r = {}) {
  if (typeof document > "u") return;
  Gn();
  const i = nh();
  Ea(), wt = new AbortController();
  const n = e === "all" ? t : t.filter((h) => e.includes(h.id));
  if (!n.length) {
    console.warn("[KlavitySims] deploy(): no matching Sims — panel not mounted."), Gn();
    return;
  }
  n.slice(0, 8).forEach((h) => {
    const u = h.accent || "#6366f1", c = h.initials || h.name.slice(0, 2).toUpperCase();
    dr.set(h.id, { simId: h.id, accent: u, initials: c, name: h.name, photoUrl: h.photoUrl });
  });
  const s = document.createElement("div");
  s.className = "ksl-root", i.appendChild(s), ze = document.createElement("div"), ze.className = "ksl-sr", ze.id = "ksl-announcer", ze.setAttribute("aria-live", "polite"), ze.setAttribute("aria-atomic", "true"), s.appendChild(ze), ye = document.createElement("button"), ye.type = "button", ye.className = "ksl-launcher", ye.setAttribute("aria-label", "Open Sims feedback panel"), ye.addEventListener("click", () => sh());
  const l = document.createElement("span");
  l.className = "ksl-pill", It = document.createElement("span"), It.className = "ksl-pill-avatars", Xe = document.createElement("span"), Xe.className = "ksl-pill-txt", l.append(It, Xe), Je = document.createElement("span"), Je.className = "ksl-pill-badge", Je.hidden = !0, ye.append(l, Je), s.appendChild(ye), n.slice(0, 3).forEach((h) => {
    const u = dr.get(h.id);
    u && It.appendChild(Ma(u, 26));
  }), De = document.createElement("section"), De.className = "ksl-panel", De.setAttribute("aria-label", "Sims feedback"), De.setAttribute("role", "dialog");
  const p = document.createElement("div");
  p.className = "ksl-head";
  const o = document.createElement("div");
  o.className = "ksl-title-row";
  const d = document.createElement("div");
  d.className = "ksl-title", d.textContent = "Sims feedback";
  const a = document.createElement("button");
  a.type = "button", a.className = "ksl-icon-btn", a.title = "Minimize", a.setAttribute("aria-label", "Minimize Sims feedback panel"), a.innerHTML = ae("x", { size: 15 }), a.addEventListener("click", () => ao()), o.append(d, a), ot = document.createElement("div"), ot.className = "ksl-count", $e = document.createElement("div"), $e.className = "ksl-chips", p.append(o, ot, $e), Be = document.createElement("div"), Be.className = "ksl-list", Be.setAttribute("role", "list"), De.append(p, Be), s.appendChild(De), document.addEventListener("keydown", (h) => {
    h.key === "Escape" && We && ao();
  }, { signal: wt.signal }), wa(!0), Rt();
}
function Ra(e) {
  Ft = e, ye == null || ye.classList.toggle("is-reviewing", e), Rt(), We && Mt();
}
function sh() {
  !De || !ye || (We = !0, De.classList.add("is-open"), ye.hidden = !0, Mt());
}
function ao() {
  !De || !ye || (We = !1, De.classList.remove("is-open"), ye.hidden = !1, Rt());
}
function Oa() {
  const e = Array.from(Oe.values()), t = new Set(e.map((i) => i.entry.simId)), r = e.filter((i) => St(i.obs) === "HIGH").length;
  return { total: e.length, sims: t.size, high: r };
}
function Rt() {
  const e = Oa();
  Xe && (Ft && e.total === 0 ? Xe.innerHTML = "Your Sims are reviewing…" : e.total === 0 ? Xe.innerHTML = "Sims are watching this page" : Xe.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from your Sims`), Je && (Je.hidden = e.high === 0, Je.textContent = `${e.high} high`), We && Ia(e);
}
function Ia(e) {
  ot && (e.total === 0 ? ot.innerHTML = Ft ? "Your Sims are reviewing this page…" : "No findings yet — your Sims are watching." : ot.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from <b>${e.sims}</b> Sim${e.sims === 1 ? "" : "s"}` + (e.high > 0 ? ` · <span class="ksl-hi">${e.high} high</span>` : "")), oh();
}
function oh() {
  if (!$e) return;
  const e = Array.from(Oe.values());
  if ($e.hidden = e.length === 0, $e.textContent = "", !e.length) return;
  const t = document.createElement("span");
  t.className = "ksl-chips-label", t.textContent = "Sim", $e.appendChild(t);
  const r = /* @__PURE__ */ new Map();
  e.forEach((n) => {
    const s = r.get(n.entry.simId) ?? { entry: n.entry, n: 0 };
    s.n += 1, r.set(n.entry.simId, s);
  }), r.forEach(({ entry: n, n: s }) => {
    const l = document.createElement("button");
    l.type = "button", l.className = "ksl-chip" + (st === n.simId ? " is-on" : ""), l.setAttribute("aria-pressed", String(st === n.simId));
    const p = document.createElement("span");
    p.className = "ksl-dot", p.style.background = n.accent, l.append(p, document.createTextNode(`${n.initials} · ${s}`)), l.addEventListener("click", () => {
      st = st === n.simId ? null : n.simId, Mt();
    }), $e.appendChild(l);
  });
  const i = document.createElement("span");
  i.className = "ksl-chips-label", i.style.marginLeft = "6px", i.textContent = "Priority", $e.appendChild(i), ["HIGH", "MED", "LOW"].forEach((n) => {
    const s = e.filter((o) => St(o.obs) === n).length;
    if (!s) return;
    const l = document.createElement("button");
    l.type = "button";
    const p = kt === n;
    l.className = "ksl-chip" + (p ? ` sev-on-${xa[n]}` : ""), l.setAttribute("aria-pressed", String(p)), l.textContent = `${n} · ${s}`, l.addEventListener("click", () => {
      kt = kt === n ? null : n, Mt();
    }), $e.appendChild(l);
  });
}
function ah() {
  return Array.from(Oe.values()).filter((e) => !st || e.entry.simId === st).filter((e) => !kt || St(e.obs) === kt).sort((e, t) => {
    const r = St(e.obs), i = St(t.obs), n = r ? so[r] : 3, s = i ? so[i] : 3;
    return n - s;
  });
}
function lh(e) {
  const { entry: t, obs: r } = e, i = St(r), n = document.createElement("div");
  n.className = "ksl-row", n.setAttribute("role", "listitem"), n.dataset.id = e.id, n.style.borderLeftColor = t.accent;
  const s = document.createElement("div");
  s.className = "ksl-r-head", s.appendChild(Ma(t, 26));
  const l = document.createElement("span");
  l.className = "ksl-r-name", l.style.color = t.accent, l.textContent = t.name, s.appendChild(l);
  const p = String(r.sentiment ?? "").trim();
  if (p) {
    const m = document.createElement("span");
    m.className = "ksl-r-sent", m.textContent = p, s.appendChild(m);
  }
  if (i) {
    const m = document.createElement("span");
    m.className = `ksl-sev ${xa[i]}`, m.setAttribute("aria-label", `Priority: ${i}`), m.textContent = i, s.appendChild(m);
  }
  n.appendChild(s);
  const o = document.createElement("div");
  o.className = "ksl-r-obs", o.textContent = r.text || "", n.appendChild(o);
  const d = document.createElement("button");
  d.type = "button", d.className = "ksl-r-expand", d.textContent = "Show more", d.addEventListener("click", () => {
    const m = n.classList.toggle("is-expanded");
    d.textContent = m ? "Show less" : "Show more";
  }), n.appendChild(d);
  const a = document.createElement("div");
  a.className = "ksl-r-actions";
  const h = document.createElement("button");
  h.type = "button", h.className = "ksl-r-act track", h.innerHTML = ae("bug", { size: 12 }) + " Track as Bug", h.setAttribute("aria-label", `Track feedback from ${t.name} as a bug`), h.addEventListener("click", () => {
    var m;
    (m = rr.onTriage) == null || m.call(rr, r, t.name), lo(e.id);
  });
  const u = document.createElement("button");
  u.type = "button", u.className = "ksl-r-act jump", u.innerHTML = ae("map-pin", { size: 12 }) + " Jump to on page", u.setAttribute("aria-label", `Jump to where ${t.name} flagged this`), u.addEventListener("click", () => {
    uh(e.id);
  });
  const c = document.createElement("button");
  return c.type = "button", c.className = "ksl-r-act dismiss", c.textContent = "Dismiss", c.setAttribute("aria-label", `Dismiss feedback from ${t.name}`), c.addEventListener("click", () => {
    lo(e.id);
  }), a.append(h, u, c), n.appendChild(a), n;
}
function ch(e) {
  e.querySelectorAll(".ksl-row").forEach((t) => {
    const r = t.querySelector(".ksl-r-obs");
    r && r.scrollHeight - r.clientHeight > 4 && t.classList.add("is-clamped");
  });
}
function Mt() {
  if (!Be || !We) {
    Rt();
    return;
  }
  const e = Oa();
  Ia(e);
  const t = ah();
  if (Be.textContent = "", !t.length) {
    const i = document.createElement("div");
    i.className = "ksl-empty";
    const n = Oe.size > 0;
    if (Ft && !n) {
      const s = document.createElement("div");
      s.className = "ksl-empty-title", s.textContent = "Your Sims are reviewing this page…";
      const l = document.createElement("div");
      l.textContent = "Findings will appear here as they spot things.";
      const p = document.createElement("div");
      p.className = "ksl-shimmer", i.append(s, l, p);
    } else if (n)
      i.textContent = "No findings match these filters.";
    else {
      const s = document.createElement("div");
      s.className = "ksl-empty-title", s.textContent = "No findings yet";
      const l = document.createElement("div");
      l.textContent = "Your Sims are watching this page as a first-time customer would.", i.append(s, l);
    }
    Be.appendChild(i), Oe.forEach((s) => {
      s.rowEl = null;
    });
    return;
  }
  t.forEach((i) => {
    const n = lh(i);
    i.rowEl = n, Be.appendChild(n);
  });
  const r = new Set(t.map((i) => i.id));
  Oe.forEach((i) => {
    r.has(i.id) || (i.rowEl = null);
  }), ch(Be);
}
function Vn() {
  xt == null || xt(), xt = null;
}
async function uh(e) {
  const t = Oe.get(e);
  if (!t) return;
  const r = await rh(t.obs, { scroll: !0 });
  !r || !Se || dh(r, t.entry.accent);
}
function dh(e, t) {
  Vn();
  const r = Ea(), i = document.createElement("div");
  i.className = "klav-halo", i.style.borderColor = t, i.style.boxShadow = `0 0 0 4px ${io(t, 0.16)},0 0 24px ${io(t, 0.2)}`, r.appendChild(i);
  const n = new AbortController(), s = () => {
    const d = e.getBoundingClientRect(), a = d.width > 0 && d.height > 0 && d.bottom > 0 && d.right > 0 && d.top < window.innerHeight && d.left < window.innerWidth;
    i.style.display = a ? "" : "none", a && (i.style.left = `${d.left - 5}px`, i.style.top = `${d.top - 5}px`, i.style.width = `${d.width + 10}px`, i.style.height = `${d.height + 10}px`);
  }, l = () => requestAnimationFrame(s);
  s(), window.addEventListener("scroll", l, { passive: !0, signal: n.signal }), window.addEventListener("resize", l, { signal: n.signal });
  const p = setTimeout(() => {
    i.style.opacity = "0", i.style.transition = "opacity .3s ease", setTimeout(() => {
      xt === o && Vn();
    }, 320);
  }, 3200), o = () => {
    clearTimeout(p), n.abort(), i.remove();
  };
  xt = o;
}
function hh(e, t) {
  const r = `f_${e.simId}_${++ba}`;
  Oe.set(r, { id: r, entry: e, obs: t, rowEl: null }), We ? Mt() : Rt(), ze && (ze.textContent = "", requestAnimationFrame(() => {
    ze && (ze.textContent = `${e.name}: ${t.text || ""}`);
  }));
}
function ph(e) {
  const t = Oe.get(e);
  if (!t) return;
  const r = () => {
    Oe.delete(e), We ? Mt() : Rt();
  };
  t.rowEl && We ? (t.rowEl.classList.add("is-removing"), setTimeout(r, Hn() ? 0 : 300)) : r();
}
function lo(e) {
  const t = Oe.get(e);
  t && (hr.add(va(t.entry.simId, t.obs)), ph(e));
}
function fh(e, t, r) {
  if (!Me) return;
  const i = dr.get(e);
  if (!i) {
    console.warn(`[KlavitySims] renderFeedback: simId "${e}" not registered`);
    return;
  }
  if (r.length) {
    Ra(!1);
    for (const n of r) {
      if (!qd(n)) continue;
      const s = va(e, n);
      hr.has(s) || (hr.add(s), hh(i, n));
    }
  }
}
function Gn() {
  Vn(), Oe.clear(), ba = 0, dr.clear(), hr.clear(), We = !1, st = null, kt = null, Ft = !1, wt == null || wt.abort(), wt = null, ye = null, It = null, Xe = null, Je = null, De = null, ot = null, $e = null, Be = null, ze = null, Se == null || Se.remove(), Se = null, Me == null || Me.remove(), Me = null, nt = null, wa(!1);
}
const rr = {
  deploy: ih,
  setReviewing: Ra,
  renderFeedback: fh,
  undeploy: Gn,
  onTriage: null
};
function mh() {
  typeof window > "u" || window.KlavitySims || (window.KlavitySims = rr);
}
typeof window < "u" && mh();
const co = "klav-ao-css", gh = "klav-ao-overlay";
function yh(e, t, r, i, n, s = 10) {
  const o = !(e.y - r - 14 >= s), d = o ? e.y + e.h + 14 : e.y - r - 14, a = Math.max(s, Math.min(d, n - r - s));
  return { left: Math.max(s, Math.min(e.x, i - t - s)), top: a, below: o };
}
const bh = `
  .klav-ao-halo {
    position: fixed;
    border-radius: 8px;
    border-width: 2px;
    border-style: solid;
    pointer-events: none;
    z-index: 2147483640;
    animation: klav-ao-in .38s cubic-bezier(.34,1.36,.64,1) both,
               klav-ao-pulse 2.4s ease-in-out .4s infinite;
  }
  @keyframes klav-ao-in {
    from { transform: scale(.84); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
  @keyframes klav-ao-pulse {
    0%,100% { opacity: .75; }
    50%     { opacity: 1; }
  }

  .klav-ao-pin {
    position: fixed;
    z-index: 2147483642;
    width: 224px;
    background: linear-gradient(168deg, rgba(22,17,12,.98), rgba(14,11,8,.99));
    border: 1px solid #3a332b;
    border-left-width: 3px;
    border-radius: 13px;
    padding: 11px 11px 10px 12px;
    font-family: system-ui, -apple-system, sans-serif;
    box-shadow: 0 20px 52px rgba(0,0,0,.68), 0 6px 18px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.07);
    -webkit-backdrop-filter: blur(12px) saturate(140%);
    backdrop-filter: blur(12px) saturate(140%);
    pointer-events: auto;
    animation: klav-ao-pin-in .36s cubic-bezier(.34,1.36,.64,1) both;
  }
  @keyframes klav-ao-pin-in {
    from { transform: scale(.86) translateY(10px); opacity: 0; }
    60%  { transform: scale(1.02) translateY(-2px); opacity: 1; }
    to   { transform: scale(1)   translateY(0);    opacity: 1; }
  }
  .klav-ao-pin.is-out {
    animation: klav-ao-pin-out .22s ease-in forwards;
    pointer-events: none;
  }
  @keyframes klav-ao-pin-out {
    to { transform: scale(.88) translateY(-8px); opacity: 0; }
  }
  /* Tail pointing down toward the halo (default: pin is above the halo) */
  .klav-ao-pin::after  { content:''; position:absolute; bottom:-8px; left:18px; border:7px solid transparent; border-top-color:#3a332b; border-bottom:none; pointer-events:none; }
  .klav-ao-pin::before { content:''; position:absolute; bottom:-6px; left:19px; border:6px solid transparent; border-top-color:#16110c;  border-bottom:none; z-index:1; pointer-events:none; }
  /* Tail flipped to top when the pin is placed below the halo */
  .klav-ao-pin.tail-top::after  { bottom:auto; top:-8px; border-top:none; border-bottom:7px solid #3a332b; }
  .klav-ao-pin.tail-top::before { bottom:auto; top:-6px; border-top:none; border-bottom:6px solid #16110c; z-index:1; }

  .klav-ao-hd   { display:flex; align-items:center; gap:6px; margin-bottom:7px; }
  .klav-ao-lbl  { font-family:ui-monospace,'JetBrains Mono',monospace; font-size:10px; letter-spacing:.08em; text-transform:uppercase; font-weight:700; flex:1; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
  .klav-ao-sev  { font-family:ui-monospace,monospace; font-size:9px; letter-spacing:.05em; text-transform:uppercase; padding:1px 5px; border-radius:4px; background:rgba(233,79,55,.22); color:#e8849a; flex-shrink:0; }
  .klav-ao-sev.sev-m { background:rgba(244,169,60,.2);   color:#e8a24a; }
  .klav-ao-sev.sev-l { background:rgba(127,209,196,.15); color:#7fd1c4; }

  .klav-ao-dismiss {
    background:none; border:1px solid #3a332b; color:#6e6560; font-size:11.5px;
    border-radius:7px; padding:5px 8px; cursor:pointer; font-family:system-ui,sans-serif;
    transition:background .15s,color .15s,border-color .15s; width:100%; margin-top:8px;
  }
  .klav-ao-dismiss:hover { background:rgba(255,255,255,.08); color:#f5f3ee; border-color:#5a5248; }
  .klav-ao-dismiss:focus-visible { outline:2px solid #8b5cf6; outline-offset:2px; }

  @media (prefers-reduced-motion:reduce) {
    .klav-ao-halo { animation:none !important; opacity:1; transform:none; }
    .klav-ao-pin,.klav-ao-pin.is-out { animation:none !important; opacity:1; transform:none; }
  }
`;
let rt = null, vh = 1;
const pr = /* @__PURE__ */ new Map();
function uo(e, t) {
  const r = e.replace("#", ""), i = (p) => parseInt(p, 16), [n, s, l] = r.length === 3 ? [i(r[0] + r[0]), i(r[1] + r[1]), i(r[2] + r[2])] : [i(r.slice(0, 2)), i(r.slice(2, 4)), i(r.slice(4, 6))];
  return `rgba(${n},${s},${l},${t})`;
}
function wh() {
  if (rt) return rt;
  if (!document.getElementById(co)) {
    const e = document.createElement("style");
    e.id = co, e.textContent = bh, document.head.appendChild(e);
  }
  return rt = document.createElement("div"), rt.id = gh, rt.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;overflow:visible;z-index:2147483640;", document.body.appendChild(rt), rt;
}
function Ih(e, t, r = {}) {
  const i = wh(), n = r.color ?? "#6366f1", s = `klav-ao-${vh++}`, l = 5, p = document.createElement("div");
  p.className = "klav-ao-halo", p.dataset.aoId = s, p.style.left = e.x - l + "px", p.style.top = e.y - l + "px", p.style.width = e.w + l * 2 + "px", p.style.height = e.h + l * 2 + "px", p.style.borderColor = n, p.style.boxShadow = `0 0 0 4px ${uo(n, 0.14)},0 0 24px ${uo(n, 0.18)}`, i.appendChild(p);
  let o = null;
  if (t) {
    const h = { x: e.x - l, y: e.y - l, w: e.w + l * 2, h: e.h + l * 2 }, { left: u, top: c, below: m } = yh(
      h,
      224,
      96,
      window.innerWidth,
      window.innerHeight
    );
    o = document.createElement("div"), o.className = "klav-ao-pin" + (m ? " tail-top" : ""), o.dataset.aoId = s, o.style.borderLeftColor = n, o.style.left = u + "px", o.style.top = c + "px", o.setAttribute("role", "status"), o.setAttribute("aria-label", `Annotation: ${t}`);
    const f = document.createElement("div");
    f.className = "klav-ao-hd";
    const g = document.createElement("span");
    g.className = "klav-ao-lbl", g.style.color = n, g.textContent = t, f.appendChild(g);
    const x = r.priority ?? r.severity;
    if (x) {
      const v = x === "medium" ? " sev-m" : x === "low" ? " sev-l" : "", S = document.createElement("span");
      S.className = `klav-ao-sev${v}`, S.textContent = x, f.appendChild(S);
    }
    const y = document.createElement("button");
    y.className = "klav-ao-dismiss", y.textContent = "Dismiss", y.addEventListener("click", () => Aa(s)), o.appendChild(f), o.appendChild(y), i.appendChild(o);
  }
  return pr.set(s, { halo: p, pin: o }), s;
}
function Aa(e) {
  const t = pr.get(e);
  if (!t) return;
  pr.delete(e);
  const { halo: r, pin: i } = t;
  i ? (i.classList.add("is-out"), r.style.animation = "klav-ao-pin-out .22s ease-in forwards", setTimeout(() => {
    i.remove(), r.remove();
  }, 240)) : r.remove();
}
function Ah() {
  for (const e of [...pr.keys()]) Aa(e);
}
let La = ft;
const Ta = { consoleErrors: [], networkFailures: [] };
let Pa, Na, Ct = null;
function _a(e) {
  const t = {};
  for (const [r, i] of Object.entries(e))
    i != null && (t[String(r).slice(0, 64)] = String(i).slice(0, 1e3));
  return t;
}
async function ho() {
  return Nl(document.body, {
    cacheBust: !0,
    pixelRatio: 1,
    skipFonts: !0,
    filter: (e) => {
      if (e.id === "klavity-sdk-host") return !1;
      if (e.nodeName === "IMG") {
        const t = e.src ?? "";
        if (t && !t.startsWith(window.location.origin) && !t.startsWith("data:")) return !1;
      }
      return !0;
    }
  });
}
function xh() {
  return ql(Ta, { identity: Pa, metadata: Na });
}
async function kh(e) {
  return zl(
    { type: e.type, description: e.description, context: e.context, screenshots: e.screenshots, replayEvents: e.replayEvents },
    La,
    { jira: fc, linear: mc, github: gc, plane: yc, backend: vc }
  );
}
function mi(e = "bug") {
  const t = rc(e, {
    onCaptureFull: ho,
    onSubmit: async (r) => kh({
      type: r.type,
      description: r.description,
      context: xh(),
      screenshots: r.screenshots,
      replayEvents: (Ct == null ? void 0 : Ct.getEvents()) ?? []
    })
  });
  setTimeout(async () => {
    try {
      const r = await ho();
      t.addScreenshot(r);
    } catch {
    }
  }, 200);
}
function Sh() {
  Hl(Ta, { consoleLevels: !0 });
}
function $a(e) {
  Pa = e ? _a(e) : void 0;
}
function Da(e) {
  Na = e ? _a(e) : void 0;
}
function Ch() {
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const t = document.createElement("div");
    t.style.cssText = `position:fixed;left:${Math.min(e.clientX, window.innerWidth - 200)}px;top:${Math.min(e.clientY, window.innerHeight - 80)}px;background:#1e1e2e;border:1px solid #45475a;border-radius:8px;padding:4px;z-index:2147483647;box-shadow:0 8px 24px rgba(0,0,0,.4);font-family:system-ui;`, t.innerHTML = `
      <div data-action="bug" style="padding:8px 16px;cursor:pointer;color:#cdd6f4;font-size:13px;border-radius:4px;">${ae("bug")} Report a Bug</div>
      <div data-action="feature" style="padding:8px 16px;cursor:pointer;color:#cdd6f4;font-size:13px;border-radius:4px;">${ae("lightbulb")} Request a Feature</div>
    `, document.body.appendChild(t);
    const r = (i) => {
      (!i || !t.contains(i.target)) && (t.remove(), document.removeEventListener("click", r));
    };
    t.addEventListener("click", (i) => {
      var s;
      const n = (s = i.target.closest("[data-action]")) == null ? void 0 : s.getAttribute("data-action");
      t.remove(), document.removeEventListener("click", r), n && mi(n);
    }), setTimeout(() => document.addEventListener("click", r), 0);
  });
}
function za(e = {}) {
  if (La = {
    ...ft,
    ...e,
    jira: { ...ft.jira, ...e.jira },
    linear: { ...ft.linear, ...e.linear },
    github: { ...ft.github, ...e.github },
    plane: { ...ft.plane, ...e.plane }
  }, Sh(), Ch(), !Ct)
    try {
      Ct = Ud(Ze);
    } catch {
      Ct = null;
    }
}
typeof window < "u" && (window.KlavitySnap = { init: za, openModal: mi, identify: $a, setMetadata: Da });
const Lh = { init: za, openModal: mi, identify: $a, setMetadata: Da };
export {
  rr as KlavitySims,
  rr as SimsLive,
  Aa as clearAnnotation,
  Ah as clearAnnotations,
  Lh as default,
  $a as identify,
  za as init,
  mh as installKlavitySims,
  mi as openModal,
  Da as setMetadata,
  Ih as showAnnotation
};
