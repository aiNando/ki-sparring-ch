# ki-sparring.ch – Live-Abgleich und Deployment

Stand: 25.11.2026 · Aufgabe FührungsCockpit #21 · Bezug: Issue #1

> **Entscheid Nando (25.11.2026):** Veröffentlicht wird manuell per **Infomaniak WebFTP durch Grok** (Muster C).
> GitHub `main` bleibt die Quelle der Wahrheit: Änderungen kommen per PR, nach dem Merge wird Grok informiert und lädt hoch.
> Anleitung: [Abschnitt 5](#5-upload-per-webftp-durch-grok).

Legende: **bestätigt** = live oder im Code nachgewiesen · **vermutet** = Indiz, nicht bewiesen · **nicht getestet**

## 1. Live-Stand vs. Repository

Basis: Download aller verlinkten Dateien von https://ki-sparring.ch/ (HTTPS) und Vergleich mit `main` (`c22787b`, 29.06.2026).

| Befund | Status |
|---|---|
| Live ist **neuer** als `main`. Alle Live-Dateien tragen `Last-Modified: 02.07.2026`, also 3 Tage nach dem letzten Commit. Seither ist nichts mehr hochgeladen worden. | bestätigt |
| Geändert: `index.html`, `css/style.css`, `js/main.js`, `impressum/index.html`, `datenschutz/index.html` | bestätigt |
| Nur live vorhanden: `blog/` (Übersicht und 6 Artikel), `ueber-nando/`, `images/kmu-step-1…6.jpg`, `sitemap.xml`, `robots.txt`, `ndo.html` | bestätigt |
| Identisch: alle Portraits, Testimonial-Bilder, Logos, `.tables/schema.json` | bestätigt |
| Formular-Endpunkt: Repo `https://deria.ch/api/brevo/forms`, live `https://api.cleverassistant.ch/api/brevo/forms` | bestätigt |
| Live neu: Du/Sie-Dialog, Rückrufnummer und Kontaktmethode im Formular, Blog-Links, Impressum mit Adresse Wollerau | bestätigt |
| `README.md` beschreibt `mailto:`-Formulare und Veröffentlichung über Genspark. Beides stimmt nicht mehr. | bestätigt |
| `ndo.html` liegt auf demselben Webspace. `js/main.js` leitet `ndo.ch/` dorthin um, ndo.ch zeigt also wohl auf denselben Webspace. Ein Deploy darf diese Datei nicht löschen. | vermutet |
| `.tables/schema.json` (Genspark-Überbleibsel, nur Schema, keine Daten) ist öffentlich abrufbar | bestätigt |
| Live-`.htaccess` ist nicht lesbar (403). `https://www.ki-sparring.ch/` liefert **200 statt 301**, die www-Regel aus dem Repo greift live also nicht. | bestätigt |
| HTTP → HTTPS (Port 80) | nicht getestet (aus der Sandbox nicht erreichbar) |
| Formular-Endpunkt `api.cleverassistant.ch` (#30015, HTTP 502) | nicht getestet (Prüfung in der Sandbox blockiert) |
| `deria.ch` (alter Endpunkt) ist von hier nicht erreichbar (Gateway 502) | vermutet: tot |
| Dateien, die live liegen, aber nirgends verlinkt sind | nicht prüfbar ohne SFTP |

Mit dem ersten Commit dieses PRs ist der Live-Stand 1:1 im Repo. Erst danach sind Änderungen über GitHub überhaupt sicher, sonst würde jeder Deploy aus `main` Blog und Du/Sie-Funktion wieder löschen.

## 2. Deployment-Muster

| | A: Infomaniak-Git | B: Upgrade + SFTP-GitHub-Action | C: manuell |
|---|---|---|---|
| Quelle der Wahrheit | GitHub | GitHub | der Webspace (Repo veraltet) |
| Auslöser | Pull auf dem Server (Manager oder SSH) | Merge in `main` plus manuelle Freigabe in GitHub | Nando lädt per FTP/Manager hoch |
| Was landet auf dem Webspace | ganzes Repo, oft inkl. `.git`, README, `docs/` | nur Website-Dateien (Ausschlussliste) | was hochgeladen wird |
| Rollback | `git checkout` auf dem Server | Revert-PR, dann erneuter Deploy | alte Dateien suchen |
| Zugangsdaten | Git-Zugang auf dem Server | SFTP-Passwort/Key als GitHub-Secret | nur bei Nando |
| Agenten (Claude/Manus) | PR möglich, Deploy braucht Server | PR, Deploy erst nach Nandos Freigabe | kein sauberer Weg |
| Kosten | im heutigen Paket? (prüfen) | Upgrade auf Paket mit SFTP/SSH | 0 |
| Risiko | `ndo.html` oder fremde Dateien je nach Setup überschrieben oder sichtbar | gering, wenn ohne `--delete` | Drift wie jetzt (5 Monate) |

**Ursprüngliche Empfehlung: B.** Entschieden wurde C mit Grok (siehe oben). Die Begründung bleibt als Referenz stehen, falls später automatisiert werden soll:

1. **Der heutige Fehler ist Drift.** Live und Repo sind seit Juli auseinander, weil manuell (C) veröffentlicht wurde. Nur A und B machen GitHub zur Quelle der Wahrheit.
2. **Freigabe bleibt bei Nando.** Agenten liefern nur PRs. Der Deploy läuft über eine GitHub-Environment `production` mit Pflicht-Freigabe. Kein Agent braucht Hosting-Zugangsdaten.
3. **Kontrolle, was öffentlich wird.** Die Action lädt nur die Website-Dateien hoch: `docs/`, `README.md`, `.tables/` und `.github/` bleiben draussen. `ndo.html` und unbekannte Dateien werden nicht gelöscht (kein `--delete` im ersten Schritt).
4. **Nachvollziehbar.** Jeder Deploy ist einem Commit zugeordnet, Rollback = Revert.

A ist die Alternative, falls das Upgrade zu teuer ist und Infomaniak-Git im aktuellen Paket verfügbar ist. Dann muss der Webroot so gelegt werden, dass `.git` und `docs/` nicht ausgeliefert werden. C nur noch als Notfallweg, und danach den Stand sofort zurück ins Repo holen.

### Skizze für B (noch nicht aktiv, erst nach Freigabe)

```yaml
# .github/workflows/deploy.yml
name: Deploy ki-sparring.ch
on: workflow_dispatch          # nur manuell
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production    # Pflicht-Freigabe durch Nando
    steps:
      - uses: actions/checkout@v4
      - name: Upload via SFTP (ohne Löschen)
        env:
          SFTP_HOST: ${{ secrets.SFTP_HOST }}
          SFTP_USER: ${{ secrets.SFTP_USER }}
          SFTP_PASS: ${{ secrets.SFTP_PASS }}
          SFTP_PATH: ${{ secrets.SFTP_PATH }}
        run: |
          sudo apt-get install -y lftp
          lftp -u "$SFTP_USER","$SFTP_PASS" "sftp://$SFTP_HOST" -e "
            mirror -R --only-newer --verbose \
              -x '^\.git/' -x '^\.github/' -x '^\.tables/' -x '^docs/' -x '^README\.md$' \
              ./ $SFTP_PATH; quit"
```

### Reihenfolge bis zum ersten Deploy

1. Nando prüft und merged diesen PR. Danach entspricht `main` dem Live-Stand plus den Vorschlägen.
2. Nando sichert den Webspace einmal komplett, inkl. der heutigen `.htaccess`, und gleicht diese mit `.htaccess` im Repo ab. Infomaniak-eigene Regeln bleiben erhalten.
3. Paket und Kosten für SFTP bei Infomaniak klären, dann entscheiden: B oder A.
4. Secrets und Environment `production` anlegen, Workflow aktivieren, ersten Deploy gemeinsam begleiten.
5. Danach prüfen: `http://`, `www.` → 301 auf `https://ki-sparring.ch/`, Formular sendet, `ndo.ch` funktioniert noch.

## 3. Issue #1

Issue #1 war das Onboarding für Manus mit Audit-Bericht. Die Audit-Teile (Schritte 3–6: Live-Abgleich, Deployment-Methode, Formulare, Rechtsseiten, Risiken, nächste Schritte) sind mit diesem Dokument erledigt. Der Manus-Zugriff (Schritte 1–2) ist nicht geprüft und für die Website-Arbeit nicht mehr nötig.

**Vorschlag:** Den PR mit „Refs #1“ verknüpfen. Nach Nandos Entscheid zum Deployment-Muster #1 als erledigt schliessen, mit Verweis auf dieses Dokument. Falls Manus weiterhin gewünscht ist: dafür ein neues, kleines Issue anlegen.

## 4. Offene Punkte aus dem FührungsCockpit

| Nr. | Thema | In diesem PR | Entscheid nötig von Nando |
|---|---|---|---|
| #30015 | Formular HTTP 502 | Formular verliert keine Anfrage mehr: Bei Fehler oder Timeout erscheint eine vorausgefüllte E-Mail an iN@ndo.ch. | Ursache liegt im Backend `api.cleverassistant.ch` (nicht in diesem Repo): Server/Logs prüfen. |
| #30016 | Datenschutz Platzhalter | Entwurf auf Basis der tatsächlich genutzten Dienste, Platzhalter-Hinweis entfernt | Inhalt prüfen (bei Bedarf rechtlich). Bestätigen, dass `api.cleverassistant.ch` von Nando betrieben wird. Optional: Google Fonts selbst hosten. |
| #30017 | HTTPS/www | `.htaccess`: www → ohne www, HTTP → HTTPS, nur für ki-sparring.ch-Hosts. Lokal mit Apache getestet. | Alternativ „HTTPS erzwingen“ im Infomaniak Manager (Hosting-Änderung, nur mit Freigabe). |
| #30018 | Du/Sie | Du-Umstellung beschädigte Blogartikel („Skepsis … du ist oft …“). Jetzt nur noch auf der Startseite, Grammatik korrigiert, „Termin wählst du“ auch im Sie-Modus behoben. | – |
| #30018 | Ort | Separater Commit: „Zürich“ → „Wollerau, Raum Zürich“ (passend zum Impressum) | Behalten oder Commit verwerfen? |
| #30018 | MWST | **nicht geändert.** „ab CHF 690“ steht ohne MWST-Hinweis. | Ist Nando MWST-pflichtig? Ja: „CHF 690 zzgl. 8,1 % MWST“ (oder inkl.) plus UID/MWST-Nr. im Impressum. Nein: „CHF 690 (kein MWST-Zuschlag)“ oder ohne Zusatz lassen. |

## 5. Upload per WebFTP durch Grok

Regel: **Was auf dem Server liegt, muss vorher in `main` sein.** Nie direkt auf dem Server ändern, sonst laufen Live-Seite und Repo wieder auseinander.

### Ablauf bei jedem Upload

1. **Sichern:** Im WebFTP die Dateien herunterladen, die gleich überschrieben werden. Beim ersten Upload: den ganzen Webspace sichern.
2. **Hochladen:** nur die Dateien aus `main`, die sich seit dem letzten Upload geändert haben, jeweils mit gleichem Pfad.
   - **Nie hochladen:** `docs/`, `README.md`, `.tables/`, `.git/`, `.github/`
   - **Nie löschen:** `ndo.html` (gehört zu ndo.ch) und Dateien, die nicht im Repo sind.
   - **Reihenfolge:** zuerst Bilder, dann `css/` und `js/`, zuletzt die HTML-Dateien. So verweist keine Seite auf ein noch fehlendes Bild.
3. **Prüfen** (Browser, privates Fenster):
   - Seite lädt, Bilder sichtbar, KI-Boost-Abschnitt da
   - Kontaktformular sendet (Testanfrage mit eigener Adresse)
   - `http://ki-sparring.ch` und `https://www.ki-sparring.ch` landen auf `https://ki-sparring.ch/`
   - `https://ndo.ch` funktioniert weiterhin
4. **Melden:** Datum und hochgeladenen Commit (Hash von `main`) an Nando bzw. ins FührungsCockpit.
5. **Rückgängig:** bei Problemen die gesicherten Dateien aus Schritt 1 wieder hochladen.

### Erster Upload nach PR #2 und PR #3

Stand Server: 02.07.2026. Folgende Dateien hochladen bzw. ersetzen:

| Datei | Was |
|---|---|
| `images/nando-beratung-v2.jpg`, `images/nando-desk-v2.jpg`, `images/nando-workshop-v2.jpg`, `images/nando-portrait-outdoor-v2.jpg` | neue Fotos |
| `css/style.css`, `js/main.js` | KI-Boost, Formular-Fallback, Du/Sie-Korrektur, Menü |
| `index.html` | Startseite inkl. KI-Boost |
| `datenschutz/index.html` | neue Datenschutzerklärung |
| `ueber-nando/index.html`, `blog/index.html` | Ort, Foto-Verweise |
| `blog/*/index.html` (alle 6 Artikel) | Foto-Verweise |
| `.htaccess` | HTTPS- und www-Weiterleitung, siehe Achtung |

**Achtung `.htaccess`:** Die bestehende Live-Datei zuerst herunterladen und mit der Version im Repo vergleichen. Enthält die Live-Datei Regeln, die im Repo fehlen, diese übernehmen und den Unterschied melden. Nach dem Upload sofort Schritt 3 prüfen. Bei einer Weiterleitungsschleife oder einem Fehler 500 die gesicherte Datei zurückspielen.

Die alten Fotos (`nando-beratung.jpg` usw.) können auf dem Server bleiben. Sie werden nicht mehr verlinkt.
