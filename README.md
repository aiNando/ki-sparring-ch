# ki-sparring.ch — Nando Tschäppät Personal Brand Website v3

> Premium Personal Brand & Conversion-Website für Nando Tschäppät (ki-sparring.ch)
> Ziel: Anfragen für KI-Potenzialanalysen generieren

## Positionierung
**«KI wird erst wertvoll, wenn Menschen wissen, was sie damit anfangen sollen.»**
**«Der Mensch vor der Technologie.»**

---

## ✅ Implementierte Sektionen

| # | Sektion | Zweck |
|---|---|---|
| 1 | **Hero** | Hauptbotschaft, KPIs (90 Min / 5–10 Cases / CHF 690), dualer CTA |
| 1b | **Logo-Belt** | Durchlaufende Logozeile — Berufliche Stationen (Apple, Swisscom, METANET, WISS, IBAW, Klubschule, aiaibot) |
| 2 | **Positionierung** | Über Nando mit echtem Portrait, Credentials, Werte |
| 3 | **KI-Potenzialanalyse** | Kernangebot mit Feature-Liste + Preiskarte |
| 4 | **Ablauf in 4 Schritten** | Von Anfrage bis Bericht |
| 5 | **Was Sie nach 90 Min. wissen** | 6 konkrete Nutzen-Punkte für KMU |
| 6 | **Warum Nando?** | Vertrauensaufbau via Berufsstationen & Haltung |
| 7 | **Testimonials** | 9 echte Kundenstimmen mit Avataren (Carousel) |
| 8 | **Workshops & Sparring** | Sekundärangebote (4 Formate) |
| 9 | **Beobachtungen** | Content-Sektion + Newsletter |
| 10 | **Kontakt** | Vollständiges Formular + Info-Panel mit Portrait |

---

## 🖼️ Bilder

### Nando-Portraits
- `images/nando-portrait-outdoor.jpg` — Hero-Bild (230KB)
- `images/nando-portrait.jpg` — Kontakt-Sidebar Business-Portrait (8KB)
- `images/nando-beratung.jpg`, `nando-desk.jpg`, `nando-workshop.jpg` — Content-Bilder

### Testimonial-Avatare (alle v2, eager loading, Cache-Busted)
| Datei | Grösse |
|---|---|
| `testimonial-armin-erni-v2.jpg` | 17KB |
| `testimonial-patrick-heiz-v2.jpg` | 713KB |
| `testimonial-ebru-sengoez-v2.jpg` | 60KB |
| `testimonial-marco-hiestand-v2.jpg` | 288KB |
| `testimonial-mascha-gottwalles-v2.jpg` | 65KB |
| `testimonial-patrick-hummel-v2.jpg` | 69KB |
| `testimonial-corina-beller-v2.webp` | 13KB |
| `testimonial-julia-wuelser-v2.jpg` | 28KB |
| `testimonial-fabio-frustaci-v2.jpg` | 12KB |

### Logos
| Datei | Status |
|---|---|
| `images/logos/logo-apple.png` | ✅ Echtes Apple-Logo (10KB) |
| Swisscom, METANET, WISS, IBAW, Klubschule, aiaibot | ✅ Als SVG-Wordmarks direkt im HTML |

---

## 🎨 Design

- **Farben:** Cream `#F7F5F0` · Ink `#111111` · Blue `#2563EB` · Gold `#B08D57`
- **Fonts:** Playfair Display (Headlines) · Inter (Body)
- **Niveau:** Apple · Anthropic · Linear · Swiss Editorial
- **CSS Custom Properties:** `--cream`, `--ink`, `--blue`, `--gold`, `--ink-08`, `--ink-15`, `--ink-60`

---

## 🎞️ Animationen & Interaktion

- Canvas Partikel-Netzwerk im Hero
- Scroll-Reveal (IntersectionObserver)
- Parallax Hero
- Station-List Stagger
- **Logo-Belt Marquee** (`lb-scroll` Keyframe, 28s Desktop / 22s Mobile, `prefers-reduced-motion` respektiert)
- Progress-Bar oben
- Cursor-Glow (Desktop)
- Sticky Nav mit Glasmorphismus
- Testimonials: Touch/Drag Swipe (50px Threshold), Auto-Play 5s, Keyboard-Nav

---

## 📁 Dateistruktur

```
index.html                    → Alle Sektionen (~1050 Zeilen)
css/style.css                 → Premium-CSS (~590 Zeilen)
js/main.js                    → Interaktionen & Formulare (342 Zeilen, reviewed)
images/
  nando-portrait.jpg          → Kontakt-Sidebar Portrait
  nando-portrait-outdoor.jpg  → Hero
  nando-beratung.jpg          → Content
  nando-desk.jpg              → Content
  nando-workshop.jpg          → Content
  testimonial-*-v2.*          → 9 Testimonial-Avatare (eager loading)
  logos/
    logo-apple.png            → Apple Logo PNG
impressum/index.html          → Schweizer Impressum
datenschutz/index.html        → Swiss DSG Datenschutz
README.md
```

---

## 🔗 Form Handling

| Bereich | Verhalten | Beschreibung |
|---|---|---|
| Kontaktformular | `mailto:`-Versand | Öffnet das Mailprogramm mit vorausgefüllter Anfrage an `iN@ndo.ch` |
| Newsletter | `mailto:`-Versand | Öffnet das Mailprogramm mit der Newsletter-Anmeldung an `iN@ndo.ch` |

Die PHP-Dateien liegen weiterhin im Projekt als Fallback, werden auf diesem Hosting aber nicht ausgeführt.

---

## 🔧 Technische Details

### Logo-Belt CSS-Klassen
| Klasse | Beschreibung |
|---|---|
| `.logo-belt` | Container mit Overflow-Hidden + Edge-Fade-Gradients |
| `.logo-belt-track` | Flex-Reihe, `animation: lb-scroll 28s linear infinite` |
| `.logo-belt-item` | Einzelnes Logo-Item, padding 0 32px |
| `.logo-belt-sep` | 1px Trennlinie zwischen Items |
| `.lb-wordmark` | SVG-Wordmark (height: 22px, opacity: .45) |
| `.lb-wordmark-sm` | Kleinere Variante (height: 18px) für WISS/IBAW |
| `.lb-img` | PNG/JPG Logo (height: 22px, grayscale filter) |
| `.lb-img-apple` | Apple-spezifisch (height: 26px) |
| `.lb-img-swisscom` | Mix-blend-mode: multiply (für künftiges Swisscom PNG) |

### Bekannte Fixes
- `loading="eager"` auf allen 9 Testimonial-Avataren (Carousel-Transform verhindert Viewport-Erkennung)
- `onerror="var p=this.parentElement; this.remove(); p.style..."` — sichere Reihenfolge
- Cache-Busting via Dateiumbenennung (`-v2` Suffix), kein Query-Parameter (→ HTTP 400)
- Font Awesome 6.4 Free: nur `fa-solid` verwendet (alle `fa-regular` Pro-Icons ersetzt)

---

## 📊 Sprache (Schweizer Standard)

- Kein ß → ss
- KI-Potenzialanalyse (korrekte Schreibweise)
- Keine Buzzwords: revolutionär, disruptiv, transformieren, AI-powered
- E-Mail: **iN@ndo.ch**

---

## 🔜 Nächste Schritte

1. **Logo-Uploads** — METANET, WISS, IBAW, Klubschule, aiaibot als echte PNG/SVG-Logos
2. **Swisscom Logo** — bessere Version hochladen (`.lb-img-swisscom` mit `mix-blend-mode: multiply` ist vorbereitet)
3. **Calendly/Cal.com** — direkte Terminbuchung im CTA
4. **Blog-Seiten** für Beobachtungen-Artikel
5. **Analytics** — Plausible oder Matomo

---

## 🚀 Deployment

→ **Publish Tab** in Genspark verwenden.

---

*© 2026 Nando Tschäppät · ki-sparring.ch · iN@ndo.ch*
