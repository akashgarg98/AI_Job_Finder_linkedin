const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini. It automatically picks up GEMINI_API_KEY from process.env
const ai = new GoogleGenAI({});

async function scoreWithGemini(resumeText, jobDescription, yoe) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
       console.log("No Gemini API Key found in .env! Generating a random score for UI testing.");
       return { score: Math.floor(Math.random() * 40) + 40, reasoning: "No API Key found. This is a system-generated placeholder explanation simulating the AI." }; 
    }
    const prompt = `You are a brutally honest, highly-critical senior technical recruiter. Your job is to strictly filter out candidates who do not meet the precise role requirements.
    
CRITICAL SCORING CRITERIA:
1. The candidate explicitly states they have exactly **${yoe || "an unspecified number of"} Years of Experience (YoE)**. This number (${yoe}) is the ABSOLUTE TRUE YOE for scoring. Do NOT calculate or infer YOE from the dates on the resume. 
2. If the timeline on the resume appears to contradict the stated ${yoe} YOE, you MUST still use ${yoe} for all scoring math, but you should mention in your reasoning that their resume implies a different timeline.
3. You MUST scan the Job Description to find the strictly required "Years of Experience".
4. **AUTOMATIC REJECTION**: If the Job Description requires MORE years of experience than their absolute true YOE (${yoe}), you MUST brutally fail the candidate. The score MUST be below 50. 
5. A score of >= 80 (Green) can ONLY be given if the candidate perfectly meets or EXCEEDS the required Years of Experience AND has a phenomenal technical stack match.

Return exactly a raw JSON object with two keys: "score" (integer 0-100) and "reasoning" (a succinct 2-sentence harsh explanation).
If the score is < 80, the reasoning must explicitly state exactly what is missing from their resume or tear down the mismatch (e.g., "Role requires 6 years of experience, but your true YOE is only ${yoe}. You also lack cloud architecture.").
Return ONLY valid JSON. Do not use markdown blocks.

Resume:
${resumeText.substring(0, 3500)}

Job Description:
${jobDescription}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const rawText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(rawText);
        
        return {
            score: Math.min(100, Math.max(0, parseInt(parsed.score || 50))),
            reasoning: parsed.reasoning || "Failed to generate reasoning."
        };
    } catch(e) {
        console.error('Gemini generative parsing error:', e.message);
        return { score: 50, reasoning: "AI encountered an output formatting error." }; 
    }
}

function expandJobTitle(baseTitle) {
    const title = baseTitle.toLowerCase();
    if (title.includes('product manager') || title.includes('pm')) {
        return ['Associate Product Manager', 'Product Manager', 'Senior Product Manager', 'AI Product Manager'];
    }
    if (title.includes('engineer') || title.includes('developer')) {
        return [baseTitle, `Senior ${baseTitle}`, 'Full Stack Engineer'];
    }
    return [baseTitle, `Senior ${baseTitle}`, `Associate ${baseTitle}`];
}

exports.scrapeJobs = async (req, res) => {
    try {
        console.log("---- SECURE ZERO-TRANSFER SCRAPE JOBS ENDPOINT ----");
        const { jobTitle, location, apifyKey, yoe, resumeText } = req.body;
        
        console.log("Job Title:", jobTitle, "| YOE:", yoe, "| Extracted Text:", resumeText ? "Yes" : "No");
        
        if (!jobTitle || !location) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const relevantTitles = expandJobTitle(jobTitle);
        
        // Highly randomized mock pool to prevent recurring data patterns during testing 
        const companies = ['Meta', 'Netflix', 'Amazon', 'Vercel', 'Startup Hub', 'Global Dynamics', 'NextGen AI', 'FinTech Corp', 'OpenAI', 'Google'];
        
        let mockJobsData = [];
        for (let i = 0; i < relevantTitles.length * 2; i++) {
            const variant = relevantTitles[i % relevantTitles.length];
            const randomHoursAgo = Math.floor(Math.random() * 23) + 1; 
            const randomCompany = companies[Math.floor(Math.random() * companies.length)];
            const uniqueID = Math.random().toString(36).substring(7);
            const requiredYoe = Math.floor(Math.random() * 6) + 2; // Random 2 to 7 years
            
            const desc = `We are actively hiring a dynamic ${variant} located near ${location} (Remote considered). You MUST have a minimum of ${requiredYoe}+ years of experience. You should have a proven track record of managing technical priorities, analyzing requirements across teams, and steering core capabilities. We expect extreme accountability and a passionate approach to problem solving in rapid tech lifecycles.`;
            const isRemote = Math.random() > 0.4 || desc.includes('Remote');
            const finalLocation = isRemote ? `${location} / Remote` : location;
            
            mockJobsData.push({
                id: uniqueID,
                title: variant,
                company: randomCompany,
                location: finalLocation,
                description: desc,
                postedAt: new Date(Date.now() - (randomHoursAgo * 60 * 60 * 1000)).toISOString(),
                url: `https://linkedin.com/jobs/search?keywords=${encodeURIComponent(variant)}`
            });
        }
        
        // Shuffle the mock jobs array to feel more organic
        mockJobsData = mockJobsData.sort(() => 0.5 - Math.random()).slice(0, 6);

        if (resumeText) {
            console.log("Calling Gemini API to harsh-score jobs concurrently...");
            const scoredJobs = await Promise.all(mockJobsData.map(async (job) => {
                 let aiResult = await scoreWithGemini(resumeText, job.description, yoe);
                 let status = 'Red';
                 if (aiResult.score >= 80) status = 'Green';
                 else if (aiResult.score >= 50) status = 'Yellow';
                 
                 return { ...job, score: aiResult.score, reasoning: aiResult.reasoning, status };
            }));
            console.log("Gemini Scoring Complete!");
            return res.json({ success: true, jobs: scoredJobs });
        } else {
            console.log("No resume text extracted, skipping Gemini.");
            return res.json({ success: true, jobs: mockJobsData });
        }

    } catch (error) {
        console.error('Error scraping jobs:', error);
        res.status(500).json({ error: 'Failed to scrape or score jobs' });
    }
};

exports.scoreResume = async (req, res) => {
    res.status(400).json({ error: "Deprecated. Endpoints merged."});
};
