# Product Manager Development Log - Job Finder AI

## Overcoming Architectural Bottlenecks & Iterative Product Refinements

**1. The "Base64 Stream Drop" Bug (Architecture V4)**
- **Issue:** Using `multipart/form-data` to transmit heavy PDF files caused silent backend Node.js streaming crashes (`Multipart.emit`) natively on specific Windows environments.
- **Product Implication:** Users were losing their files silently into the void during the connection handshake without any visual warning text.
- **Resolution:** As a PM, I directed a pivot to **Base64 JSON Transport**. By instantly encoding the PDF into a pure text array right in the Next.js layout, the backend no longer needed `multer` stream buffers. It extracted payload packages predictably with no packet loss.

**2. The Transition to AI Semantic Logic (V5 Integration)**
- **Issue:** The hardcoded keyword counting algorithm was returning overly harsh "Red" match ratings precisely because simple acronyms (PM vs Product Manager) fell outside the script bounds. It lacked human nuance.
- **Product Implication:** It unfairly dropped user morale by miscategorizing their relevance.
- **Resolution:** I drove the integration of the **Google Gemini SDK (`gemini-2.5-flash`)**. We now securely beam the precise PDF text alongside the generated mock jobs directly into Google's LLM engine. It was explicitly prompt-engineered to emulate an expert recruiter grading semantic alignment, not just identical word strings. Resulting grading patterns are staggeringly robust and accurate.

**3. The "Zero-Transfer Security Model" (V6 Migration)**
- **Issue:** Uploading PDFs—even as Base64 strings—meant the user's private resume technically transited through an external tracking backend API, which could be an enterprise data privacy risk.
- **Product Implication:** Modern users demand absolute security over their PII (Personally Identifiable Information) natively on AI apps.
- **Resolution:** I authorized the integration of `pdfjs-dist` directly into the Next.js client component logic. We successfully built a "Zero-Transfer Architecture": The browser natively decompiles the PDF within its own secure memory sandbox locally without ever physically sending the actual file object. We only retrieve the exact flat standard UTF-8 text string and seamlessly proxy that to Gemini securely in the background!

**4. The Mixed-Content CDN Crisis (V6.1 Hotfix)**
- **Issue:** `pdfjs-dist` v5.x defaults to pulling its internal Web Workers from `cdnjs`. On `localhost:3000`, the ES Module (`.mjs`) dynamically tripped the browser’s strict Mixed-Content internal redirect CORS policy, failing the worker setup blindly with a 404 block alert.
- **Product Implication:** Client-side parsing was randomly failing exclusively for developers testing across strict Node validation constraints.
- **Resolution:** I ordered the direct migration of the actual `pdf.worker.min.mjs` core dependency straight out of the `node_modules` package architecture off-internet and placed it securely inside the local `public` routing folder. By binding the web worker natively to the root internal Next.js build (`/pdf.worker.min.mjs`), we systematically bypassed all CDN tracking and CORS block violations permanently.
