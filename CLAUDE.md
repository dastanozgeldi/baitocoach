# Baito Call Coach - Project Specification

## Project Overview
A web application that helps international students in Japan navigate part-time job (arubaito/baito) phone calls in real-time by providing live transcription, translation, and suggested responses.

## The Problem
International students in Japan often need to call businesses to inquire about part-time work. Many jobs (konbini, dishwashing, warehouse work) don't require Japanese fluency for the actual work, but the initial phone screening is conducted in Japanese. Students can memorize one opening phrase ("アルバイトはありますか？") but struggle when the business owner responds, leading to awkward "wakarenai" (I don't understand) moments and failed applications.

## The Solution
A real-time call assistant that:
1. Listens to the business owner speaking Japanese (via speakerphone)
2. Transcribes and translates what they said to English
3. Suggests contextually appropriate Japanese responses based on the user's profile
4. Displays responses with romaji pronunciation guides

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + Shadcn UI
- **Speech Recognition**: LiveKit (Deepgram under the hood) refer to this guide: https://docs.livekit.io/home/quickstarts/nextjs/
- **AI**: OpenAI API (GPT-4)

## User Flow

### 1. Landing Page
- Brief explanation of the tool
- **Ethical disclaimer**: "This tool helps international students communicate during job inquiry calls for positions where Japanese isn't required for the actual work. Many entry-level jobs (konbini, kitchen, warehouse) don't need Japanese fluency, but the hiring call does. This bridges that communication gap."
- CTA: "Start Preparing Your Call"

### 2. Onboarding Form (English)
Collect user context to personalize responses:
- Name (romaji)
- Nationality
- Student status (university/language school/etc.)
- Job type interested in (dropdown: Konbini, Restaurant, Warehouse, Delivery, Cleaning, Other)
- Availability:
  - Days available (checkboxes: Mon-Sun)
  - Hours per week
  - Time preference (morning/afternoon/evening/late night)
- Experience in this job type? (Yes/No, brief description)
- Japanese level (Beginner/N5/N4/N3)
- Any dietary restrictions or physical limitations? (for restaurant/physical jobs)
- Preferred contact method (phone/email) and details

### 3. Call Assistant Screen

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  🎤 Status: LISTENING / READY                   │
│  [START LISTENING] [PAUSE] [END CALL]           │
├─────────────────────────────────────────────────┤
│  CONVERSATION HISTORY                           │
│  ┌─────────────────────────────────────────┐   │
│  │ 👤 Business Owner:                      │   │
│  │ "何曜日に働けますか？"                   │   │
│  │ → When can you work?                    │   │
│  │                                         │   │
│  │ 🗣️ You said:                            │   │
│  │ "月曜日と水曜日に働けます"               │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
├─────────────────────────────────────────────────┤
│  💬 SUGGESTED RESPONSE                          │
│  ┌─────────────────────────────────────────┐   │
│  │                                         │   │
│  │  "月曜日と水曜日の午後に                 │   │
│  │   働けます"                              │   │
│  │                                         │   │
│  │  Getsuyoubi to suiyoubi no gogo ni      │   │
│  │  hatarakemasu                           │   │
│  │                                         │   │
│  │  "I can work Monday and Wednesday       │   │
│  │   afternoons"                           │   │
│  │                                         │   │
│  │  🔊 [PLAY PRONUNCIATION]                │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Features:**
- Real-time Japanese speech recognition
- Automatic translation to English
- Context-aware response generation (based on onboarding)
- Romaji pronunciation guide
- Text-to-speech for practicing pronunciation
- Conversation history log
- Pause/resume listening
- Copy response to clipboard button

## Core Functionality

### Speech Recognition
- Use LiveKit SDK
- Continuous listening mode
- Display interim results (real-time transcription)
- Final results trigger AI response generation

### AI Response Generation
Use OpenAI/Claude with system prompt:
```
You are assisting an international student in Japan who is on a phone call 
inquiring about part-time work. The student has limited Japanese ability.

Student Profile:
- Name: {name}
- Job type: {jobType}
- Available: {availability}
- Experience: {experience}
- Japanese level: {japaneseLevel}

The business owner just said: "{transcription}"

Generate a natural, polite Japanese response that:
1. Answers their question truthfully based on the student's profile
2. Is appropriate for a beginner Japanese speaker (simple grammar)
3. Is culturally appropriate for a job inquiry call
4. Keeps the conversation moving toward scheduling an interview

Return JSON:
{
  "japanese": "response in Japanese",
  "romaji": "response in romaji",
  "english": "English translation"
}
```

### Common Call Scenarios to Handle
1. Opening: "アルバイトはありますか？" (Do you have part-time work?)
2. Availability: "何曜日に働けますか？" (What days can you work?)
3. Hours: "週に何時間働けますか？" (How many hours per week?)
4. Experience: "経験はありますか？" (Do you have experience?)
5. Start date: "いつから始められますか？" (When can you start?)
6. Student status: "学生ですか？" (Are you a student?)
7. Visa status: "ビザは持っていますか？" (Do you have a visa?)
8. Japanese level: "日本語は話せますか？" (Can you speak Japanese?)
9. Interview: "面接に来てください" (Please come for an interview)
10. Contact: "電話番号を教えてください" (Please give me your phone number)

## Technical Implementation Notes

### API Routes Needed
- `POST /api/transcribe` - Handle speech-to-text
- `POST /api/generate-response` - Generate contextual Japanese response
- `POST /api/synthesize` - Text-to-speech for pronunciation

### State Management
- User profile (from onboarding)
- Conversation history array
- Current listening status
- Current suggested response

### LocalStorage
- Save user profile for return visits
- Save recent conversations for reference

## MVP Features (5-hour scope)
1. ✅ Landing page with disclaimer
2. ✅ Onboarding form (simple version)
3. ✅ Real-time Japanese speech recognition
4. ✅ English translation display
5. ✅ AI-generated response suggestions with romaji
6. ✅ Text-to-speech pronunciation
7. ✅ Conversation history
8. ✅ Basic styling with Tailwind

## Nice-to-Haves (Post-MVP)
- [ ] Pre-call practice mode with AI role-playing as business owner
- [ ] Common phrases reference sheet
- [ ] Save/export conversation transcripts
- [ ] Multiple language support (not just English)
- [ ] Mobile app version
- [ ] Integration with job listing sites
- [ ] Post-call summary and follow-up suggestions

## Demo Strategy
1. Show landing page + disclaimer
2. Walk through onboarding flow
3. Have someone call and speak Japanese
4. Show real-time transcription → translation → suggested response
5. Demonstrate pronunciation playback
6. Highlight how it helps complete a successful call

## Environment Variables Needed (already set in .env)
```
OPENAI_API_KEY=your_key_here
LIVEKIT_API_KEY=<your_api_key>
LIVEKIT_API_SECRET=<your_api_secret>
LIVEKIT_URL=wss://<project-subdomain>.livekit.cloud
```

## File Structure
```
/app
  /page.tsx (landing)
  /onboarding/page.tsx
  /call/page.tsx (main assistant interface)
  /api
    /generate-response/route.ts
    /synthesize/route.ts
/components
  /CallAssistant.tsx
  /ConversationHistory.tsx
  /ResponseSuggestion.tsx
  /OnboardingForm.tsx
/lib
  /speechRecognition.ts
  /types.ts
/public
```

## Key Design Considerations
- **Large, readable text** - user will be glancing while on phone call
- **Clear visual hierarchy** - business owner speech vs suggested response
- **Minimal UI** - no distractions during live call
- **Mobile responsive** - might use phone browser with speakerphone
- **Fast response time** - can't make business owner wait
- **Error handling** - what if recognition fails or AI is slow?

## Success Metrics
- Can complete a full mock call successfully
- Judges understand the problem immediately
- Demo feels magical (real-time translation + suggestions)
- Clear social impact story
- Technically impressive but not overengineered

---

## Getting Started

1. Build onboarding flow first
2. Implement speech recognition
3. Add AI response generation
4. Polish UI
5. Test with mock calls
