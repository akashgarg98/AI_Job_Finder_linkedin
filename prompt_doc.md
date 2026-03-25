# Product Requirement Document (PRD) & AI Build Prompt
**Product:** Job Finder AI Tracker
*Instructions: Copy and paste this exact PRD into your AI coding assistant. It contains everything required to build the full application framework.*

***

## 1. Product Overview
We are building a Next.js + Express.js job search platform. The core value proposition is allowing users to search for jobs and instantly receive a brutally honest, AI-generated match score evaluating their resume against strict job requirements (like Years of Experience).

## 2. Core User Flow & UI Requirements
**Frontend Stack:** Next.js, Tailwind CSS (Dark Mode Design).
- **The Search Interface:** Build a 4-input form collecting: *Job Title, Location, Total YOE (Years of Experience), and an API Key*. Below this, implement a file dropzone to upload a PDF Resume.
- **The Output View:** Render the returned jobs as sleek visual cards. Each card must display the Job Title (as a clickable link), Company, Location, Description, and an overall AI Match Score (0 to 100%).
- **Visual Feedback:** Color-code the Match Score badges: Green (80+), Yellow (50-79), Red (<50). Below the job description, render a colored feedback box displaying the AI's strict reasoning.

## 3. Backend Architecture
**Backend Stack:** Express.js (Node.js). Expand JSON limits to 25mb.
- **The API Route:** Build a simple `POST /api/jobs/scrape` endpoint to accept the JSON payload (Job Title, Location, YOE, API Key, and the raw Resume Text string).
- **Data Simulation:** Generate 6 randomized mock jobs based on the user's Location and Job Title. Critically, explicitly demand a random "Required Years of Experience" inside each mock job description.

## 4. The AI Scoring Pipeline
Integrate the `@google/genai` SDK (`gemini-2.5-flash`). The AI must act as a strict Technical Recruiter:
- **Strict YOE Constraint:** Pass the user's `YOE` input to Gemini. Instruct the AI that this input is the absolute truth. Do not let it guess their experience by reading the resume dates.
- **The Rejection Rule:** If the job requires more YOE than the user actually inputted, Gemini MUST automatically fail them (Score below 50 / Red). High scores (80+) are exclusively reserved for perfect skill alignments that also meet the YOE floor.
- **JSON Output:** Gemini must reply strictly in JSON: `{ "score": 85, "reasoning": "A 2-sentence explanation of why they matched or failed." }`.

---

## 🚫 Out of Scope / Guardrails (CRITICAL)
*Engineers/AI must strictly adhere to these constraints to prevent system crashes:*
1. **Zero-Transfer PDF Processing:** Do NOT send the physical PDF file to the Node.js backend. The server will crash. You must extract the text locally inside the Next.js browser using `pdfjs-dist` and ONLY transmit the raw text string to the backend.
2. **Localize Web Workers:** Do NOT attempt to load the `pdfjs` Web Worker script via external internet links. The browser's internet security policies will immediately block it. You must physically place the worker file directly into the Next.js `public` directory and load it locally.

---

## 🧪 Acceptance Criteria (Evals)
Developers must ensure these tests pass before deployment:
- **AC1 (Privacy Check):** When inspecting the Network tab upon form submit, the physical PDF file must not be uploaded—only the extracted text string.
- **AC2 (Algorithmic Honesty):** If a user types "2" for their YOE, and a generated job card requires "5+", the UI must gracefully enforce a Red score (<50) and output a dynamic explanation citing the lack of experience.
- **AC3 (Graceful Degradation):** If the AI module hallucinates or returns improperly formatted text, the server must not crash. It should catch the error and display a default score of `50` with an "AI Formatting Error" warning in the box.
