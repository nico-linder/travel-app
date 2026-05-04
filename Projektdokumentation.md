<div style="text-align: center; margin-top: 50px; margin-bottom: 50px;">
  <h1>Travel Together App</h1>
  <h2>Projektdokumentation</h2>
  <p>Fokus: Camunda BPMN Integration</p>
</div>

<div style="page-break-after: always;"></div>

## Inhaltsverzeichnis
1. [Beschreibung des Auftrags](#1-beschreibung-des-auftrags)
2. [Beschreibung des Vorgehens und der Umsetzung](#2-beschreibung-des-vorgehens-und-der-umsetzung)
   - [2.1 Architektur & Setup](#21-architektur--setup)
   - [2.2 Prozess: Vibes Suggestion](#22-prozess-vibes-suggestion)
   - [2.3 Prozess: Phase 1 Voting](#23-prozess-phase-1-voting)
   - [2.4 Frontend Integration (Expo/React Native)](#24-frontend-integration-exporeact-native)
3. [Beschreibung der gewonnenen Erkenntnisse / Fazit](#3-beschreibung-der-gewonnenen-erkenntnisse--fazit)

<div style="page-break-after: always;"></div>

---
*Header: Travel Together App - Projektdokumentation*
---

## 1. Beschreibung des Auftrags

Das Hauptziel dieses Projekts war die Entwicklung einer kollaborativen Reiseplanungs-App ("Travel Together App"), bei der mehrere Nutzer gemeinsam Reiseziele entdecken und abstimmen können. Ein zentraler und spezifischer Bestandteil des Auftrags war die Integration der **Camunda 7 Process Engine** zur Orchestrierung von spezifischen Workflows und zur dynamischen Verarbeitung von App-Ereignissen.

Dabei sollten zwei wesentliche Prozesse modelliert und technisch in die Applikation eingebunden werden:
1. **Dynamische Vibe-Vorschläge (Vibes Suggestion):** Ein Prozess, der basierend auf Parametern passende Reise-Vibes (Tags/Kategorien) für die Entdeckungsphase vorschlägt.
2. **Echtzeit-Abstimmung (Phase 1 Voting Analysis):** Ein langlebiger (Event-driven) BPMN-Prozess, der kontinuierlich Voting-Ereignisse der Nutzer (z.B. Swipes auf Reisezielen) entgegennimmt, speichert und in Echtzeit aggregiert, um ein Live-Ranking der präferierten Destinationen zu erstellen.

---

## 2. Beschreibung des Vorgehens und der Umsetzung

### 2.1 Architektur & Setup
Um die Camunda Engine bereitzustellen, wurde eine Docker-basierte Architektur gewählt. Über eine `docker-compose.yml` Datei im `camunda/` Verzeichnis wird ein lokaler Camunda 7 Server hochgefahren. 
Die Frontend-Applikation wurde mit **React Native (Expo)** realisiert und kommuniziert über die REST-API der Camunda Engine (standardmäßig unter `http://localhost:8080/engine-rest`).

### 2.2 Prozess: Vibes Suggestion (`vibes_suggestion.bpmn`)
Für das Onboarding und die Entdeckungsphase wurde ein Prozess modelliert, der intelligente Vorschläge für Reisestile (Vibes) liefert.
- **Vorgehen:** Die BPMN-Datei wurde im Camunda Modeler erstellt und definiert einen strukturierten Ablauf, in dem Geschäftsregeln (z.B. mittels DMN oder Script Tasks) angewandt werden können, um die passenden Kategorien für die Yelp API zu ermitteln.
- **Umsetzung:** Die App startet eine Prozessinstanz über den Endpunkt `/process-definition/key/vibes-suggestion/start`. Die Engine verarbeitet die Anfrage und das Frontend fragt im Anschluss die Ergebnisse (Prozessvariablen) ab.

### 2.3 Prozess: Phase 1 Voting (`phase1_voting.bpmn`)
Der komplexeste Teil der Integration war die asynchrone, ereignisgesteuerte Abstimmung.
- **Vorgehen:** Es wurde ein BPMN-Prozess entworfen, der nach seiner Initiierung (`StartEvent_Voting`) in eine Endlosschleife übergeht. 
- **Umsetzung:** 
  1. Im Initialisierungsschritt (`Activity_Init`) werden leere Arrays für `votesJson` und `votingResults` als Prozessvariablen angelegt.
  2. Der Prozess wartet an einem Intermediate Catch Event (`Event_Catch_Vote`) auf eingehende Nachrichten ("VoteReceived").
  3. Sobald ein Nutzer in der App eine Destination bewertet, sendet das Frontend eine Nachricht an die Camunda REST API (Endpoint `/message`). Das Payload (`singleVoteJson`) enthält die Voting-Daten.
  4. Ein Script Task (`Activity_AddVote`) parst die bestehenden Votes, fügt den neuen Vote hinzu, aggregiert die Likes pro Destination und aktualisiert die Rangliste (`votingResults`).
  5. Der Token wandert über einen Loop-Back-Flow zurück zum Message Catch Event und wartet auf den nächsten Vote.

### 2.4 Frontend Integration (Expo/React Native)
Im Frontend wurde ein Event-Polling Mechanismus umgesetzt:
- Bewertungen pushen sofort ein Event an Camunda.
- Die UI pollt periodisch (oder nach spezifischen Aktionen) die aktuelle Prozessvariable `votingResults` über die Camunda REST API, um den Teilnehmern das aggregierte Live-Ranking darzustellen, ohne dass die Prozessinstanz beendet sein muss.

---

## 3. Beschreibung der gewonnenen Erkenntnisse / Fazit

**Gewonnene Erkenntnisse:**
1. **Zustandsverwaltung in BPMN:** Die Nutzung einer Prozessinstanz als "State Machine" für Live-Voting (mittels Endlosschleife und Message Events) ist ein unkonventioneller, aber sehr mächtiger Ansatz. Es zeigte sich, dass Camunda nicht nur für lineare Freigabeprozesse, sondern auch für Event-Streaming-ähnliche Aggregationen genutzt werden kann, solange die Transaktionsgrenzen und Variablenaktualisierungen (via JSON) sauber im Script Task definiert sind.
2. **REST API Performance:** Die Kommunikation zwischen der mobilen Expo-App und der Camunda REST-API funktionierte reibungslos. Es wurde erkannt, dass bei asynchronen, mehrbenutzerfähigen Events das Design über eingehende Messages (`/message`) robuster ist, als Prozessvariablen direkt zu überschreiben, um Race-Conditions zu vermeiden.
3. **Persistenz & Monitoring:** Ein großer Vorteil dieses Vorgehens ist, dass jeder einzelne Vote im Camunda Cockpit nachvollziehbar ist. Der Prozess-Status und die aggregierten Arrays können zur Laufzeit im Cockpit überwacht und bei Bedarf debuggt werden.

**Fazit:**
Die Integration von Camunda in die "Travel Together App" war ein voller Erfolg. Sie ermöglichte es, komplexe Geschäftslogik (wie dynamisches Vibe-Mapping und kollaborative Live-Abstimmungen) aus dem Frontend und einer konventionellen Datenbank auszulagern. Die visuelle Modellierung durch BPMN verbesserte das Verständnis des Voting-Ablaufs massiv. Das Projekt demonstriert eindrucksvoll, dass Process Engines auch im Kontext moderner, kollaborativer Apps zur Zustandsspeicherung und Event-Orchestrierung wertvolle Dienste leisten können.

---
*Footer: Travel Together App - Stand: Mai 2026*
