# MirraFit (PWA)

Web-App-Version der Android-App – gleiche Funktionen, gleiches Backup-Format.

## Starten / Veröffentlichen
Die App braucht **HTTPS** (außer `localhost`), sonst gibt es keinen Service Worker und keine Installation.
- Zum Testen: `python3 -m http.server 8080` in diesem Ordner, dann `http://localhost:8080`.
- Zum echten Nutzen: Ordner auf einen HTTPS-Webspace legen (z. B. GitHub Pages, Netlify, Cloudflare Pages oder dein Heimserver mit Zertifikat).
- Auf dem Handy öffnen → Browser-Menü → „App installieren“ (iPhone: Teilen → „Zum Home-Bildschirm“).

## Enthalten
Training mit Sätzen, Vorher-Werten, Auto-Ausfüllen, Bestwert-Erkennung, Pausen-Timer (Ton, Vibration, Countdown),
Plan bearbeiten und per Ziehen sortieren, Verlauf mit Rückgängig, Auswertung (Wochen, Konstanz, Muskelgruppen, Übungsdetail mit Diagramm),
Backup sichern/laden (kompatibel mit der Android-App), alles offline.

## Neu gegenüber der Android-App
Bildschirm bleibt im Training an, Benachrichtigung am Pausenende (best effort), Backup teilen (z. B. Drive), Backup-Erinnerung,
Installations-Button, Home-Bildschirm-Shortcut „Training starten“, Sheets per Wischen schließen, Zurück-Taste schließt Dialoge.

## Neu in Version 3.2 (Beta-Wunschliste)
- **Eigene Pläne mit Namen** (z. B. Push / Pull / Beine): vor dem Training per Chip auswählbar, danach rückt automatisch der nächste Plan nach. Im Verlauf und in der Auswertung nach Plan filterbar – auch rückwirkend.
- **Körperdaten**: Größe, Gewicht, KFA (selbst eintragen oder aus Bauch-/Hals-/Hüftumfang nach US-Navy-Methode berechnen), BMI, fettfreie Masse, Verlaufskurve.
- **Satzpause frei einstellbar**: Standard-Pause in 15-s-Schritten (0:15–15:00), eigene Pause je Übung, Schnellwahl passt sich der Übung an, großer Timer mit −30/−15/+15/+30/+1:00.
- **Startseite anpassen**: Bereiche (Nächstes Training, Woche, Körperdaten, Wochenbilanz, Plan, Verlauf) per Schalter ein/aus und sortierbar.
- **Trainingstage & Erinnerung (in der App)**: Tage + Uhrzeit wählen; beim Öffnen kommt „Heute ist Trainingstag“, geplante Tage sind in der Woche gestrichelt markiert.
- **Übungsvorlagen mit Eigengewicht**: z. B. Liegestütze (64 %), Knie-Liegestütze (49 %), Klimmzüge (100 %), Dips (95 %). Mit eingetragenem Körpergewicht rechnet die App die bewegten kg ins Volumen; das kg-Feld ist dann Zusatzgewicht.
- **Dropsätze**: Satznummer antippen → „Dropsatz anhängen“ (bis zu 4 Drops, Vorschlag ~20 % leichter). Drops zählen ins Volumen und lassen sich nachträglich bearbeiten.

## Version 3.1
- Komplettes Design im Stil des Logos (Neon-Verlauf Cyan → Violett → Magenta → Orange), App-Icon = Logo
- Eigene Pausenzeit und Notiz je Übung (z. B. Klimmzüge 2:30, „Bank auf 30°“)
- Großer Pausen-Timer mit Ring: auf die Zeit in der Pausenleiste tippen
- Gespeicherte Einheiten bearbeiten (Tippfehler korrigieren, Sätze/Übungen entfernen), Bestwerte werden neu berechnet
- „Zuletzt trainiert vor X Tagen“ auf dem Start
- Rückgängig auch nach Backup-Import und „Alle Daten löschen“
- Hinweis mit „Neu laden“, wenn eine neue Version bereitsteht
- Flüssigeres Rendering: Häkchen, Balken und Fortschritt animieren, Tastatur und Fokus bleiben stabil
- Hinweise erscheinen unten statt über der Uhr; Körpergewicht-Einheiten zeigen Wiederholungen statt „0 kg“

## Grenzen
- Ist der Bildschirm aus oder die App im Hintergrund, kann ein Browser keinen exakten Alarm garantieren (die Android-App kann das). Darum bleibt der Bildschirm im Training an.
- iPhone: keine Vibration (Apple erlaubt das im Web nicht), Ton funktioniert.
- Daten liegen im Browser-Speicher dieses Geräts. Regelmäßig ein Backup sichern.

- Die Android-App kennt die neuen Felder nicht (mehrere Pläne, Körperdaten, Eigengewicht, Dropsätze, Pause/Notiz je Übung). Sie liest solche Backups trotzdem: Sie bekommt den gerade gewählten Plan und den Verlauf, die Zusatzinfos speichert sie nicht mit.
- Ein Backup aus der Android-App lässt vorhandene Körperdaten in der Web-App unangetastet.

## Nach Änderungen
In `sw.js` die `VERSION` erhöhen, damit Geräte die neuen Dateien holen.
