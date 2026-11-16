# Manner rettet Weihnachten

Privater Kampagnenprototyp: ein zusammenhängendes 16-Bit-Jump-’n’-Run im **9:16-Hochformat**. Sammle beide Geschenkpackungen und rette Weihnachten vor langweiligen Geschenken. Socken, Unterhosen und Krawatten stehen dir im Weg. Kein offizielles Manner-Spiel.

## Start

Node.js ab Version 18, keine Installation für das Spiel erforderlich:

```sh
npm start
```

**http://127.0.0.1:4186/** öffnet den Startbildschirm: „Rette Weihnachten vor langweiligen Geschenken. Mit Manner.“ Er füllt die gesamte **9:16-Spielfläche**. Starte mit **Los geht’s**, **Enter** oder **Leertaste**. Am Handy im selben WLAN: `http://<IP-des-Computers>:4186/`. Anderer Port: `PORT=4187 npm start`. Bilder, Schrift und Sounds benötigen keine externen Laufzeitdienste.

## Steuerung und Ablauf

- **← / → oder A / D:** laufen. **Leertaste:** springen. Coyote Time und Jump Buffering verzeihen knapp verspätete bzw. vorgezogene Sprünge.
- **Touch:** Links/Rechts halten; mit einem zweiten Finger Springen antippen. Laufen bleibt nach dem Sprung aktiv. Touch-Abbruch, Fokusverlust und ausgeblendeter Tab lösen gehaltene Eingaben.
- **Drei Herzen:** Jeder Treffer durch Socken, Unterhosen, Krawatten oder lose Monatsblätter kostet ein HP, mit Rückstoß und 1,45 Sekunden Schutz. Ein Sturz kostet ebenfalls ein HP. Eingesammelte Produkte bleiben erhalten.
- Bei **0 HP** stoppt das Spiel. **Noch ein Versuch** bzw. **Am Checkpoint weiter** gibt drei neue Herzen und behält das Inventar. **Nochmal spielen** setzt alles zurück zum Startbildschirm.
- Fensterbänke sind bespringbare Plattformen: von unten durchspringen und von oben darauf landen. Die höhere Route hilft beim Ausweichen.
- Eine wackelnde Wäscheleine mit Warnstern kündigt den nächsten sichtbaren Unterhosenbogen an. Warte auf eine Lücke oder laufe rechtzeitig darunter durch.
- Krawatten patrouillieren und hüpfen. Das reglose **Sparbuch** auf einem Podest ist dagegen harmlos: Einsammeln zeigt **„+0,01 € Zinsen“** und kostet keine HP.
- Der **Wandkalender vom Versicherungsbüro** wackelt zur Vorwarnung, klappt auf und wirft drei lose Monatsblätter. Sie kosten bei Berührung ein Herz; die kurze Schutzzeit verhindert mehrere sofortige Treffer. Nach jeder Salve bleibt eine Angriffslücke. Der Kalender trägt keine echte Versicherungsmarke.
- Das Ende des Hinterhofs zählt **erst mit beiden Packungen** als Sieg. Der ruhige Win-Screen zeigt beide Original-Packshots samt Größen und Links zu den offiziellen Produktseiten. Es gibt keinen zusätzlichen Weihnachts­haus-Abschnitt.
- Ton ist standardmäßig an und startet beim Klick auf **Los geht’s** bzw. mit **Enter/Leertaste**. Das Lautsprechersymbol schaltet die selbst erzeugten Retro-Sounds stumm. **F:** Vollbild, **Esc:** verlassen.

## Handy und Aufnahme

**http://127.0.0.1:4186/?capture=1** blendet Steuerhinweise aus. Quest, Herzen, Inventar, Packungsnamen und Größen bleiben erhalten. Auf Handys bleiben die Touch-Tasten beim Spielen verfügbar. Der Win-Screen mit beiden Frontansichten bleibt ohne Zeitlimit sichtbar, bis du neu startest.

Die 9:16-Fläche passt sich proportional an `visualViewport`, Browserhöhenänderungen und Safe Areas an, ohne Seitenscrollen. Die Spielfigur läuft links der Bildmitte mit Vorlauf nach rechts.

Im laufenden Spiel entfällt die zusätzliche Titelzeile „rettet Weihnachten“. Quest, Inventar und Herzen bleiben im kompakten HUD sichtbar; die freie Höhe zeigt mehr von der Spielwelt. Der Browser-Vollbildmodus ist zusätzlich per **F** verfügbar.

## Verpackungsreferenzen

Beide Frontmotive wurden am 16.11.2026 anhand der exakt verlinkten Produktseiten verifiziert:

| Variante | Motiv / Quelle | Austauschbare lokale Dateien |
| --- | --- | --- |
| **8er · Weihnachtsfest** | [Manner Produktseite](https://www.manner.com/de-at/sortiment/winter-weihnachten/manner-original-neapolitaner-8er-geschenkpackung-weihnachtsfest/) – rot-grüne Streifen, rote Schleife, Tannenzweig und Zapfen | `assets/products/eight-sprite.png`, `eight-packshot.png` |
| **18er · Frohe Weihnachten** | [Manner Produktseite](https://www.manner.com/de-at/sortiment/winter-weihnachten/manner-original-neapolitaner-18er-geschenkpackung-frohe-weihnachten/) – petrolblau, Christbaumkugeln, goldene Zweige/Schleife | `assets/products/eighteen-sprite.png`, `eighteen-packshot.png` |

**Keine Platzhalter oder fehlenden Fotos.** Separate selbst gezeichnete 64×64-Pixel-Sprites; Original-Packshots © Josef Manner & Comp AG, für diesen privaten Prototyp. Direkte Bildquellen: `assets/products/sources.json`. Welt und Figuren sind eigene Canvasgrafik. Lokale Schrift: [Pixelify Sans](https://github.com/google/fonts/tree/main/ofl/pixelifysans), OFL-Lizenz in `assets/fonts/OFL.txt`.

## Hintergrundwerbung

Vier vom User bereitgestellte Screenshotmotive erscheinen als Werbetafeln im Level. Die Originalmotive sind lokal gespeichert und werden ohne Netzwerkabruf geladen:

| Motiv | Lokale Datei | Bereitgestellter Screenshot |
| --- | --- | --- |
| Mit Fairtrade Kakao | `assets/ads/fairtrade-kakao.png` | `Screenshot 2026-11-16 at 11.22.15.png` |
| Hauseigene Röstung in Wien | `assets/ads/roestung-wien.png` | `Screenshot 2026-11-16 at 11.22.18.png` |
| Ohne gehärtete Fette | `assets/ads/ohne-gehaertete-fette.png` | `Screenshot 2026-11-16 at 11.22.21.png` |
| Ohne künstliche Zusatzstoffe | `assets/ads/ohne-zusatzstoffe.png` | `Screenshot 2026-11-16 at 11.22.24.png` |

Für die Motive wurde der Hof um ein kurzes Stück verlängert. Pickup- und Treffermeldungen stehen im unteren Straßenband und halten Werbung sowie Touch-Tasten frei. Dateiquellen und Originalmaße: `assets/ads/sources.json`.

## Prüfung

**Alle acht Browser-Szenarien bestanden**, keine Browserfehler oder externen Laufzeitaufrufe. Geprüft: flächendeckender Start, kompaktes HUD, alle vier lokalen Motive während normaler Bewegung, freie Werbetexte bei aktiven Meldungen, Mehrfingereingaben, drei HP/Schutzzeit/Game Over, Checkpoint, Fensterbänke, Krawatten, Sparbuch ohne HP-Verlust, beide Produktlinks, Sieg und Neustart. Zusätzlich: Kalender-Vorwarnung, drei bewegte Monatsblätter derselben Salve, ein HP Schaden mit Schutzzeit und Inventarerhalt sowie Bereinigung der Blätter beim Neustart. Bericht und visuell geprüfte Screenshots: `output/calendar-qa/`. Chrome mit Android-Profil prüft Touch; WebKit mit iPhone-Profil den Ablauf mit Tastatur. **Keine physischen iOS-/Android-Geräte getestet.** Höhenwechsel 390×844 ↔ 390×650 simulieren den verfügbaren Platz bei ein-/ausgeblendeten Browserleisten.

Zum Wiederholen bei laufendem Server:

```sh
npm install
npx playwright install chromium
npm test
```

Vorhandenes Chrome alternativ: `QA_BROWSER_CHANNEL=chrome npm test`. Optional installiertes WebKit: `QA_WEBKIT_MODULE=/absoluter/pfad/playwright-core/index.mjs`. `render_game_to_text()` und `advanceTime(ms)` ermöglichen nachvollziehbare QA; die Tests steuern das Spiel ausschließlich über normale Eingaben.
