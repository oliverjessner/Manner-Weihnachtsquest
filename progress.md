Original prompt: Baue „Manner Weihnachtsquest“, ein vollständig spielbares lokales 9:16-Pixel-Adventure als privaten Manner Kampagnenprototyp und TikTok-Aufnahme. Zwei exakt referenzierte Packungsfronten (8er Weihnachtsfest, 18er Frohe Weihnachten), Haustürübergabe mit gehaltenem Aufnahmebild, Adventkaffee mit gesperrtem Spieler-2-Beitritt bis Spieler 1 E drückt, Ende/Neustart, WASD/Pfeile/E und Touch, capture=1, stumme optionale Retro-Sounds. Vollständiger Browserdurchlauf, Touch, Capture, Packungen und früher Enter müssen geprüft werden. Kurze README mit Start, Steuerung und Quellen.

- Repository war leer, main ohne Commits. Keine bestehenden Dateien überschrieben; keine Commits angefordert.
- Expliziter Auftrag für Implementation und Browserprüfung autorisiert lokalen Server und Tests.
- Beide Original-Produktseiten erreichbar; Packshots eindeutig verifiziert, Assets werden lokal erstellt.
- Aufteilung: Produktreferenzen/Pixel-Sprites, Canvas-Weltgrafik, QA-Skript parallel; Root implementiert UI und Zustandslogik.

- Fertig: responsive 9:16-Spielansicht, lokale Pixelify-Schrift, eigene Canvaswelt, beide verifizierten Pixel-Sprites und Original-Packshots, vollständige Zustandsmaschine, Touch, Capture und optionales WebAudio.
- Zustandsholds: gift bis frischer Tastendruck/Weiter-Button; waiting bis frisches Enter/Mitspielen. Spieler-2-Beitritt vor Tischaktion ist gesperrt. Reset vollständig.
- Lokaler Server läuft auf Port 4186, da 4173 bereits für andere lokale Apps verwendet wird. Keine fremden Prozesse verändert.
- Browser-QA: Desktop, echtes CDP-Touch 390×844 inklusive touchCancel, Capture komplett bis Ende/Neustart, Reduced Motion; Sound umgeschaltet. Alle Szenarien bestanden, keine Konsolenfehler oder externen Requests. Screenshots visuell geöffnet.
- Nach visueller Prüfung Aufnahmeheld tiefer gesetzt, damit Kopf und frontal gehaltener 8er-Sprite vollständig unter der großen Produktkarte sichtbar sind. Sprite-Proportionen erhalten. Öffnungsanimation mit langsamem Deckelheben und anschließendem Zugreifen ergänzt; vollständige QA erneut bestanden.
- Skill-Playwright-Client ausgeführt: dessen Browser-Version fehlt im Standardcache; vorhandene Chromium-Installation nur unter ignoriertem output/browser-cache verlinkt. QA verwendet vorhandenes Google Chrome (QA_BROWSER_CHANNEL=chrome). Keine globalen Browserdateien verändert.
- Zusätzlich vollständiger Durchlauf ohne advanceTime in Echtzeit im Capture-Modus: 27,8 Sekunden bis Schlussbild einschließlich ruhiger Produkt-Haltebilder; Video unter output/manner-weihnachtsquest-9x16.webm und MP4-Export 1080×1920. Keine Page-Fehler. Schlussbild geöffnet und geprüft.
- Capture-Schalter mit URL/Reload und per Enter aktivierter Neustart zusätzlich geprüft. Fullscreen-Anforderung ist implementiert, Headless Chrome aktiviert nativen Vollbildmodus nicht; echter nativer Vollbildwechsel wurde daher nicht bestätigt.
- Keine offenen Implementationsaufgaben; physische Handyhardware wurde nicht verwendet. Alle Dateien bleiben uncommitted.

## Neuer Auftrag: Manner rettet Weihnachten

- Der User ersetzt das Top-down-Konzept durch ein zusammenhängendes horizontales Jump-’n’-Run: 8er und 18er sammeln, Socken überspringen, angekündigte Unterhosenbögen, Treffer-Rückstoß/Schutz, Checkpoint nach Abschnitt 1, Finale nur mit beiden Produkten, zwei gehaltene Frontansichten und Neustart.
- Zusätzliche mobile-first-Abnahme: zuerst echter gleichzeitiger Lauf-/Sprungtouch, Touchcancel/Blur zurücksetzen, dynamisch sichtbarer Browserbereich/Safe Areas, 9:16 ohne Scrollen; Capture-Touchtasten bleiben im Spiel sichtbar und werden bei Produkt-Holds durch Weiter ersetzt. iOS Safari/Android Chrome soweit verfügbar; Hardware/Emulation unterscheiden.
- Vorversion der fünf umgebauten Hauptdateien liegt zur Sicherung unter ignoriertem output/previous-adventure/. Produktassets und Quellen bleiben unverändert.
- Implementiert: Leveldefinition (2520px), feste 120Hz-Physik mit Coyote Time/Jump Buffering, zwei unabhängige Touch-Finger, Gegner/Graben/Checkpoint/Inventar, mobile 9:16-Oberfläche mit visualViewport und Safe Areas. Weltgrafik unabhängig parallel erneuert.
- Erstes Browser-Szenario: echte CDP-Multitouchpunkte (Rechts halten, zweiter Daumen Sprung, nach Landung weiter). Touchcancel/Blur setzen Input zurück. Proportionale 9:16-Ansicht und erreichbare 53–56px hohe Touchtasten bei390×844 und390×650 bestätigt.
- Fünf abschließende QA-Szenarien bestanden: Tastatur/Android-Chrome-Touch/WebKit-iPhone-Emulation, Sockentreffer+Schutz, isolierter Unterhosentreffer nach Vorwarnung, Checkpointsturz mit8er-Erhalt, Coyote Time/Jump Buffer, legal übersprungene8er und Finale mit nur18er gesperrt, beide Produkte→Finale→Neustart. Beide Fronten inklusive tatsächlich sichtbarer Bildgrenzen bei650/844 überprüft. Keine Browserfehler/externen Requests. report: output/platform-qa/report.json.
- Renderer visuell geprüft: Start,8er-Podest,Warnphase,Unterhosenbogen,beideFinalefronten,Ende. Checkpointflag auf checkpoint.active korrigiert; abflugbereites Unterhosenpaar hat denselben Leinenanker wie der Flugkörper.
- Zusätzlicher vollständiger Echtzeit-Browserdurchlauf ohne advanceTime: Adventhaus nach30,72s, beide Produkte gesammelt,3Treffer ohne Produktverlust,0Stürze,keinePageerrors. Nach bestätigten Frontansichten bis Endbild gespielt. Ausgabe output/manner-rettet-weihnachten-9x16.webm und1080×1920-MP4.
- WebKit27.2 über lokal vorhandenes playwright-core1.65.1 aus /Users/oli/github/oj/pitchary/node_modules/playwright-core/index.mjs verwendet. QA-Kommando: QA_BROWSER_CHANNEL=chrome QA_WEBKIT_MODULE=/Users/oli/github/oj/pitchary/node_modules/playwright-core/index.mjs node scripts/qa.mjs. Keine Abhängigkeiten installiert und keine fremden Prozesse geändert.
- Keine physischen iOS-/Android-Geräte verfügbar. Echte mobile Browserleisten/Hardware-Safe-Areas sind daher nicht als hardwaregeprüft bestätigt; Browserhöhenänderung und beide Engines wurden emuliert geprüft. Keine offenen Implementationsaufgaben; keine Commits.

## Revision: Herzen, Fenster und langweilige Geschenke

- User entfernt das Weihnachts-/Adventhauslevel. Direkter Sieg nach Gasse/Hof, beide Produkte weiterhin nötig. Neuer Startscreen mit Rettungsclaim,3HP/Gameover, Krawatte als Gegner, bespringbareFenstersimse, HP-neutrales Sparbuch mit '+0,01 € Zinsen', Links zu8er/18er aufWinscreen.
- Hauptdateien vorUmbaulokalgesichert unteroutput/previous-house-version/. RootbautLogik+UI,RendererundQAparallel. House-/Übergabefinaleentfernt, WinzeigtbeideFrontenundProduktlinksruhigstehend.
- Implementiert: Startscreen mitRettungsclaim+Losgehts,3HP-HUD,jederGegnertreffer1HP/1.45sSchutz,0HPfriertGameOverein,manuellerCheckpoint-Neuversuchfüllt3HPundbehältInventar.Sturz1HP.KomplettneustartgehtzumStartscreen.
- AlleHauptfensterwerdenausrealenOneWay-Sillplattformengezeichnet,nurFern-ParallaxfensterbleibenDekoration.BeideFensterhöhen321/278nachweislichmitnormalenSprunginputsbesprungen.HüpfendeKrawattenalszusätzlicheSchadensgegnerundreglosesSparbuchaufPodestimplementiert.ExakterZinstext'+0,01 € Zinsen',HPbleibtbeimBuchsammelngleich.
- SiebenRevisions-QA-Szenarienbestanden(ChromeAndroidechteCDP-Toucheingaben/WebKitiPhone-Tastaturemulation),keineBrowserfehler/externenLaufzeitaufrufe.Siegmitnur18ergeprüftgesperrt,HP3→0/Schutz/Retry,Checkpointinventar,Krawattenisoliert,Sparbuchneutral,Winlinks/Packshotgrenzen/Neustart.Ergebnisoutput/revision-qa/report.json.PhysischeHandysnichtverfügbar.
- EigenerzusätzlicherEchtzeitdurchlauf:44.02sSpielzeitbisWin,2manuelleRetries,HP2amSieg,beideProdukteundSparbuch,keinePageerrors.Videooutput/manner-rettet-weihnachten-v2.webmund1080×1920-MP4.Win-Frontendvisuellgeprüft.
- KeyboardhandlerlässtfokussierteProduktanchorsnativarbeiten;EnterblockadenaufProduktlinksbehoben.OriginallinksbleibenzudenexaktenManner-Referenzseiten.
- AbschließenderVollrun16.11.2026 10:34:14–10:34:42UTC:alle7aktuellenSzenarienpassed,errors[],externalRequests[].NativeProduktlinkaktivierungFokus+EnterinChrome/WebKitviaone-shotClick-Beobachtergeprüft(externeNavigationnurimTestverhindert).SeparaterLinknachweisoutput/revision-qa/link-keyboard.jsonpassed.BildgrenzenbeiderPackshotsvollständiggeprüft.FinalerSkillclienterneutausgeführtundScreenshotgeöffnet.KeineoffenenImplementationsaufgaben;keineCommits.

## Revision: Hintergrundwerbung und volle Spielhöhe

- User stellt vier Screenshots als Hintergrundwerbung bereit: FairtradeKakao,hauseigeneRöstungWien,ohnegehärteteFette,ohnekünstlicheZusatzstoffe. Originaldateien unverändert lokal nachassets/ads/kopiert;QuelleundMaßeinsources.jsonfestgehalten. DrittesOriginalisttatsächlich772×414px.
- Vier frontale Werbetafeln mit feinem Pixelrahmen und Schnee als Teil der Welt;vorFenstern/Plattformen/Gegnern und hinterSpielfigur.DynamischeLade-/Bildmetadateninrender_game_to_text.adsfürQA.
- ZusätzlicheHUDTitelzeileentfernt;HerzeninBrandzeileintegriert,Quest/Inventarkompakter.HUDendetjetztbei105.1Canvaspixeln(390×650). Startscreeninset0fülltkomplette9:16Fläche,verdecktHUD,z30,mitgroßemStartclaimundLosgehtsauchimkurzenViewporterreichbar.
- Hofum180Pixelverlängert:width2520,finish2440,zusätzlicherbespringbarerSims2340/321. AllebestehendenHP-/Inventar-/Checkpoint-/Gegnermechanikenbeibehalten.
- ErstevolleLayout-QA7Szenarienpassed,keinBrowsererror/externerruntimecall;vierTafelnvianormalenTouchinputserreichtundScreenshotsgeöffnet. DabeiToastüberdeckungvonMotiv2/4erkannt:FeedbackinsuntereStraßenband(bottom24cqw)verschoben,StatuszeilewährendToastausgeblendet. GezielteNachprüfungläuft.
- AbschließendevolleLayout-QAmitToastfix10:44:52–10:45:19UTC:alle7Szenarienpassed,errors[],externalRequests[].AktiveToastsunterallenWerbungenund~19CSSpxvorTouchbuttons.VierOriginaltafeln,Start650/844/Desktop/Capture,Hud105px,TouchvollbisNeustart,HP/Checkpoint/Fenster/Winlinks/WebKitnachgewiesen.Screenshotsallegeöffnet.RootfärbtStart-LetterboxingpassendrosaohneRahmen;gezielterFullscreen-Rechteckcheckgame==startnachÄnderungpassed.
- Header-VignetteschattierungendetimSpieljetztbei21%oberhalbderWerbetafeln,damitdieOriginalkampagnenfarbenfreisichtbarsind.GezielterBildcheck+Skillclientabschließendausgeführt.KeineoffenenImplementationsaufgaben;keineCommits.

- Startscreen auf ausdrücklichen Wunsch gekürzt: „Die Bescherung braucht dich“, „3 Herzen · 2 Packungen · 1 Mission“ und die beiden Steuerhinweiszeilen entfernt. Verbliebene Abstände angepasst.

## Neuer Gegner: Wandkalender vom Versicherungsbüro

- Userwunsch: Kalender klappt auf und wirft lose Monatsblätter. Canvas-Pixelkalender mit neutraler Versicherungsbüro-Plakette, Warnstern, Deckelanimation und separaten Monatsblättern ergänzt; keine echten Fremdmarken.
- Ein Kalender bei770/286. Angriff startet erst bei Spielernähe und sichtbarem Kalender;0.8sVorwarnung,3BlätterimAbstand0.22s,danachAngriffslücke.Zielrichtung/-höhewerdeninderWarnphasefestgelegt,keineVerfolgung.ProjektilgravitationundFall-/Zeitbereinigung.
- JedesBlattkann1HPkosten,gemeinsame1.45sSchutzzeit,Inventarerhalten.BerührteBlätterverschwinden.GameOverfriertAngriffe;Retry/SturzbereinigenBlätterundstartenAufwärmpause.VollerNeustartsetztKalenderundSchusszählerzurück.
- RendererundLogikSyntaxgeprüft;gezielteintegrierteKalender-QAundvollständigeRegressionlaufen.
- Abgeschlossen:alle8aktuellenBrowser-Szenarienpassed,errors[],externalRequests[],Berichtoutput/calendar-qa/report.json(11:11:20–11:11:53UTC).NachweisgleicherSalveüberownerId+cycle+warningStartedAt:Vorwarnung→3gestaffelteBlättermitBewegung→1HP/Schutz/8er-Erhalt,GameOverfreeze,Retry-/Neustartbereinigung.TouchCapturebisWin/NeustartundWebKitweiterpassed.
- Integriertegeschlossene/Warn-/SalvenscreenshotsvomnormalenDurchlaufgeöffnet(output/calendar-art-review/integrated/).EigenerAgentbisKalenderohneRetry/Stateoverride;alle3Blätterklarerkennbar,keineHUD-/Werbeüberdeckung,keinePageerrors.SkillclientausgeführtundScreenshotgeöffnet.KeineoffenenImplementationsaufgaben;keineCommits.

- Auf Wunsch das dauerhafte untere Statuspanel vollständig aus HTML, Zustandsanzeige und CSS entfernt. Rückmeldungen im Spiel erfolgen weiterhin über die bestehenden Pop-ups. Den bisherigen Schlussspruch direkt in den Win-Screen verschoben.

- Ton auf ausdrücklichen Wunsch standardmäßig eingeschaltet. Der Startbutton bzw. Enter/Leertaste aktiviert WebAudio mit einem kurzen Startton innerhalb der Nutzerinteraktion. Lautsprechersymbol, Beschriftung, Seitenhinweis, README und bestehende QA-Startannahme angepasst; Stummschaltung bleibt verfügbar.
