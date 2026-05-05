<div style="text-align: center; margin-top: 50px; margin-bottom: 50px;">
  <h1>Travel Together App</h1>
  <h2>Ausführliche Projektdokumentation</h2>
  <p>Systemarchitektur, App-Entwicklung & Event-gesteuerte Camunda BPMN Integration</p>
</div>

<div style="page-break-after: always;"></div>

## Inhaltsverzeichnis
1. [Einleitung und Zielsetzung](#1-einleitung-und-zielsetzung)
2. [Teil 1: Die Travel Together App](#teil-1-die-travel-together-app)
   - [2.1 Konzept und Vision](#21-konzept-und-vision)
   - [2.2 Frontend-Architektur & Tech-Stack](#22-frontend-architektur--tech-stack)
   - [2.3 Backend, State Management & Drittanbieter-APIs](#23-backend-state-management--drittanbieter-apis)
   - [2.4 Detaillierter Funktionsumfang und UI/UX](#24-detaillierter-funktionsumfang-und-uiux)
3. [Teil 2: Camunda BPMN Integration](#teil-2-camunda-bpmn-integration)
   - [3.1 Motivation: Prozess-Engine vs. klassisches CRUD](#31-motivation-prozess-engine-vs-klassisches-crud)
   - [3.2 Lokale Infrastruktur & Deployment](#32-lokale-infrastruktur--deployment)
   - [3.3 Workflow 1: Vibes Suggestion (Kategorien-Mapping)](#33-workflow-1-vibes-suggestion-kategorien-mapping)
   - [3.4 Workflow 2: Phase 1 Voting (Live-Abstimmung)](#34-workflow-2-phase-1-voting-live-abstimmung)
   - [3.5 Frontend-Camunda-Kommunikation (Push & Polling)](#35-frontend-camunda-kommunikation-push--polling)
4. [Herausforderungen, Lösungsansätze und Fazit](#4-herausforderungen-lösungsansätze-und-fazit)

<div style="page-break-after: always;"></div>

---

## 1. Einleitung und Zielsetzung

Die Planung von Gruppenreisen scheitert oft an unübersichtlichen Chat-Verläufen, endlosen Diskussionen und statischen Dokumenten. Die **"Travel Together App"** wurde entwickelt, um dieses Problem zu lösen. Sie bietet einen strukturierten, kollaborativen und spielerischen Ansatz zur Reiseplanung. 

Das Projekt verbindet moderne mobile App-Entwicklung mit komplexer Backend-Orchestrierung. Anstatt alle Logik im App-Frontend oder einer einfachen Datenbank zu belassen, nutzt das Projekt die **Camunda 7 Process Engine**, um Abstimmungen als langlebige (event-driven) Workflows abzubilden. Das vorliegende Dokument bietet einen tiefgreifenden technischen Einblick in beide Bereiche: Die mobile App-Entwicklung und die BPMN-gestützte Backend-Architektur.

---

## Teil 1: Die Travel Together App

### 2.1 Konzept und Vision
Das Kerndesign der App orientiert sich an bekannten Interaktionsmustern erfolgreicher Consumer-Apps, um die Einstiegshürde zu minimieren:
- **Pinterest-Style Discovery:** Für die Auswahl der Reisestile ("Vibes") wurde ein visuelles, kachelbasiertes Tagging-System implementiert.
- **Tinder-Style Voting:** Reisedestinationen werden als interaktive Karten präsentiert, die durch Wischen (Swipe Right für "Gefällt mir", Swipe Left für "Ablehnen") bewertet werden.
- **Smart Assistant:** Ein integrierter KI-Chatbot berät die Gruppe kontextbezogen basierend auf den Zwischenergebnissen der Abstimmung.

### 2.2 Frontend-Architektur & Tech-Stack
Die mobile Anwendung wurde plattformübergreifend konzipiert.
- **React Native & Expo:** Die Basis bildet React Native, orchestriert durch das Expo-Framework. **Expo Router** übernimmt das dateibasierte, tiefe Routing (Deep Linking fähig), welches moderne Navigationsstrukturen (Tabs, Modals) stark vereinfacht.
- **Styling (NativeWind):** Für ein konsistentes und extrem schnelles Styling wurde NativeWind (TailwindCSS für React Native) integriert. Während der Entwicklung traten Babel-Konflikte mit automatischen Styling-Transformationen auf, weshalb auf eine robuste HOC-basierte (Higher-Order Component) Styling-Methode umgestellt wurde, um schwarze Bildschirme und Render-Fehler zu vermeiden.
- **Gesten & Animationen (Reanimated):** Für das reibungslose Erlebnis der Swipe-Karten (`SwipeCard.tsx`) ist eine Framerate von 60fps essenziell. Hierfür kommt **React Native Reanimated** in Kombination mit **Gesture Handler** zum Einsatz. Komplexe Animationslogik wird über *Shared Values* direkt auf dem UI-Thread ausgeführt. Callbacks an die JavaScript-Logik (z.B. für das Speichern eines Votes) werden sauber über `runOnJS` zurück an den JS-Thread delegiert, um Syntax-Fehler und Performance-Einbrüche zu verhindern.

### 2.3 Backend, State Management & Drittanbieter-APIs
- **Supabase (BaaS):** Dient als primäres CRUD-Backend für relationale Daten. Es übernimmt die sichere Nutzerauthentifizierung, das Session-Management und speichert die Kernentitäten (User, Trips, Group Members) in einer PostgreSQL-Datenbank.
- **State Management:** Um Boilerplate-Code zu reduzieren, wird **Zustand** für den globalen App-Zustand (z.B. aktuell aktiver Trip) genutzt. Für API-Aufrufe, Caching, Retries und Background-Updates kommt **TanStack React Query** zum Einsatz.
- **Yelp Fusion API (Destination Discovery):** Ursprünglich wurde mit Foursquare und OpenTripMap experimentiert. Aufgrund von inkonsistenten Datenstrukturen und "400 Bad Request" Fehlern wurde das System vollständig auf die robustere **Yelp Fusion API** migriert. Die "Vibes" der Nutzer werden dabei auf spezifische Yelp-Kategorie-Aliase (z.B. `active`, `arts`, `restaurants`) gemappt, um hochrelevante Location-Daten inklusive Bilder und Ratings abzurufen.
- **Google Gemini 2.5 Flash-Lite (AI Assistant):** Die App verfügt über einen intelligenten Reiseassistenten (`AIChatAssistant`). Der Clou hierbei: Der Chatbot erhält über einen dynamischen *System-Prompt* stets den aktuellen Kontext (Reiseziel, gewählte Vibes, aktuell führende Destinationen aus dem Camunda-Voting). Dadurch sind die Antworten der KI extrem präzise und personalisiert auf den jeweiligen Trip zugeschnitten.

### 2.4 Detaillierter Funktionsumfang und UI/UX
1. **Trip Initialisierung:** Nutzer erstellen einen Trip, laden Freunde via Deep-Link oder in-App Suche ein.
2. **Phase 1 (Discovery & Vibes):** Dynamische Auswahl von Reise-Interessen. Die UI gruppiert verwandte Tags kontextuell.
3. **Voting Dashboard (Itinerary Home):** Eine Dashboard-Ansicht mit Bottom-Navigation. Anstatt statischer Listen nutzt die App einen modernen Progress-Bar-Ansatz, um den Planungsfortschritt zu visualisieren.
4. **Live-Auswertung:** Alle Swipe-Ergebnisse der Teilnehmer fließen zusammen und generieren eine dynamische Rangliste der beliebtesten Orte, orchestriert durch Camunda.

---

<div style="page-break-after: always;"></div>

## Teil 2: Camunda BPMN Integration

### 3.1 Motivation: Prozess-Engine vs. klassisches CRUD
Warum wurde für das Voting nicht einfach eine Supabase-Tabelle `votes` mit einem `COUNT()` Query genutzt?
Bei einem kollaborativen Voting, bei dem mehrere Nutzer gleichzeitig (in Echtzeit) sehr schnell hintereinander Aktionen ausführen (Swipes), entstehen bei direkten Datenbank-Updates schnell **Race Conditions** (zwei Nutzer liken denselben Ort in der gleichen Millisekunde, ein Like geht beim Überschreiben verloren). 
Camunda 7 wurde integriert, um als ereignisgesteuerte (Event-driven) *State Machine* zu fungieren. Jeder Vote wird als asynchrone Message (Ereignis) an die Engine gesendet. Die Engine reiht diese Ereignisse ein, verarbeitet sie nacheinander und aktualisiert den Zustand im Prozessspeicher. Dies garantiert Datenkonsistenz, entlastet die primäre Datenbank von tausenden kleinen Schreibzugriffen und macht den Ablauf visuell modellier- und überwachbar.

### 3.2 Lokale Infrastruktur & Deployment
Das Camunda-Backend wird als Microservice-Architektur betrieben. Über eine `docker-compose.yml` im Verzeichnis `camunda/` wird die Camunda 7 Engine gestartet. Sie exponiert ihre REST-API auf Port `8080`. Die Expo-App im Simulator (oder auf dem physischen Gerät im gleichen Netzwerk) kommuniziert direkt über HTTP mit dieser API.

### 3.3 Workflow 1: Vibes Suggestion (Kategorien-Mapping)
Der Prozess `vibes_suggestion.bpmn` ist zuständig für die intelligente Vorauswahl von Entdeckungskategorien.
- **Aufruf:** Das Frontend startet eine Prozessinstanz über den REST-Endpunkt `/process-definition/key/vibes-suggestion/start`. Es ist essenziell, dass der "Process Definition Key" in der BPMN-Datei exakt mit dem Aufruf übereinstimmt.
- **Ablauf:** Der Prozess nimmt Basisparameter des Trips entgegen. Über Geschäftsregeln (modelliert als Script Tasks) wird evaluiert, welche Yelp-Kategorien am besten zum Profil der Gruppe passen. Die App liest anschließend die Variablen der abgeschlossenen Instanz aus.

### 3.4 Workflow 2: Phase 1 Voting (Live-Abstimmung / `phase1_voting.bpmn`)
Dieser Prozess ist das technische Kernstück der App-Synchronisation. Die BPMN-Modellierung bildet eine Endlosschleife ab, die Votings aggregiert.
1. **Initialisierung (`Activity_Init`):** Wenn ein neuer Trip startet, startet auch eine Instanz dieses Prozesses (`StartEvent_Voting`). Ein Script Task initialisiert Prozessvariablen: ein Array für rohe `votesJson` und ein Array `votingResults` für die aufsummierte Rangliste.
2. **Das Warte-Ereignis (`Event_Catch_Vote`):** Der Prozess läuft auf ein *Intermediate Message Catch Event* und stoppt. Er lauscht nun auf eingehende Nachrichten mit dem Namen `VoteReceived`. Die Trip-ID dient als "Correlation Key", damit die Engine weiß, zu welchem Trip die Stimme gehört.
3. **Verarbeitung (`Activity_AddVote`):** Trifft eine Nachricht ein, wandert der Token weiter zum Script Task. Dieses Script:
   - Parst die bestehende `votingResults` JSON-Struktur.
   - Nimmt das Payload der Nachricht (z.B. `{"destinationId": "123", "vote": "like"}`).
   - Inkrementiert den Zähler für die entsprechende Destination.
   - Serialisiert das JSON und überschreibt die Prozessvariable.
4. **Loop-Back:** Der Token wird über einen Sequence Flow zurück zum `Event_Catch_Vote` geleitet. Der Prozess ist sofort wieder bereit für den nächsten Vote.

### 3.5 Frontend-Camunda-Kommunikation (Push & Polling)
Die asynchrone Echtzeit-Darstellung in React Native wird durch eine Kombination aus Push und Polling realisiert:
- **Push (Fire & Forget):** Löst der `GestureHandler` in `SwipeCard.tsx` einen rechten Swipe aus, macht `axios` einen asynchronen POST-Request an den `/message` Endpunkt von Camunda. Dies blockiert das UI nicht, die nächste Karte kann sofort gewischt werden.
- **Polling (Reaktive UI):** Um die Top-Liste im Itinerary-Dashboard darzustellen, implementiert die App ein Intervall-Polling (via React Query). Sie fragt periodisch den Endpunkt `/process-instance/{id}/variables` ab. Dadurch aktualisiert sich das Leaderboard auf dem Bildschirm der Nutzer flüssig und in Echtzeit, während alle Teilnehmer der Gruppe abstimmen.

---

## 4. Herausforderungen, Lösungsansätze und Fazit

Während der Entwicklung mussten mehrere komplexe technische Hürden genommen werden, die das finale Architektur-Design nachhaltig geprägt haben:

- **API Stabilität:** Der anfängliche Fokus auf Foursquare führte zu häufigen "400 Bad Request"-Fehlern und mangelhaften Daten bei spezifischen Vibe-Suchen. Der Wechsel zur Yelp Fusion API inklusive eines sauberen Parameter-Sanitizings stabilisierte die Destination-Discovery (`Phase1View`) massiv.
- **Reanimated Syntax Errors:** Die Trennung von UI-Thread und JS-Thread in React Native erforderte tiefe Anpassungen. Abstürze beim Swipen wurden durch die strikte und korrekte Anwendung von `runOnJS` Callbacks innerhalb der Worklets gelöst.
- **Camunda Deployment-Fehler:** "No matching process definition" Fehler beim Aufruf der REST-API zeigten, wie wichtig die saubere Abstimmung von Process Keys und Deployment-Tenant-IDs zwischen der XML-Definition im Modeler und dem React Native HTTP-Client ist. Durch Angleichung der IDs konnte die Engine fehlerfrei angesprochen werden.

**Gesamtfazit:**
Die "Travel Together App" beweist erfolgreich, wie sich eine leichtgewichtige, hochperformante Mobile-UI (React Native, Reanimated) mit einer mächtigen Business-Process-Engine (Camunda 7) koppeln lässt. Die Auslagerung der kollaborativen Voting-Aggregations-Logik als Event-Schleife in Camunda löste Probleme wie Race Conditions elegant und machte den Systemstatus transparent und monitorbar. In Kombination mit Supabase als Basis-Backend und der Google Gemini KI als dynamischem Assistenten ist eine hochmoderne, skalierbare und vor allem Nutzerzentrierte Plattform entstanden.

---
*Footer: Travel Together App - Stand: Mai 2026*
