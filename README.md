# Travel Together App ✈️

A collaborative travel planning application with AI assistance and Camunda-driven discovery.

## Prerequisites
- **Node.js** (v18+)
- **Docker Desktop** (for Camunda)
- **Supabase Account** (for Backend/Auth)

## Setup & Running

### 1. Camunda Server
The app uses Camunda 7 for dynamic "vibe" suggestions.
```bash
cd camunda
docker-compose up -d
```
*The BPMN process is automatically deployed via the included scripts or can be manually uploaded from `./camunda/vibes_suggestion.bpmn`.*

### 2. Frontend (Expo)
```bash
cd app
npm install --legacy-peer-deps
npx expo start
```
*Press `w` to open in web or scan the QR code for iOS/Android.*

### 3. Environment Variables
Ensure your `app/.env` file contains:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

## Key Features
- **Dynamic Vibe Discovery**: Powered by Camunda 7 BPMN.
- **AI Assistant**: Context-aware travel planning using Google Gemini.
- **Real-time Collaboration**: Powered by Supabase.
- **Interactive Phases**: From discovery to itinerary voting and scheduling.
