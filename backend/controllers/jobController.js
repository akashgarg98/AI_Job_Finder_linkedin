const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini using the correct SDK pattern for @google/genai
const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY,
    apiVersion: 'v1beta' 
});

async function scoreWithGemini(resumeText, jobDescription, yoe) {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here' || process.env.GEMINI_API_KEY.includes('your_api')) {
           return { score: 0, reasoning: "Missing API Key. Please add your GEMINI_API_KEY to the backend/.env file." }; 
        }

        const prompt = `You are a technical recruiter. Score this resume against the job description.
        
CRITICAL: Candidate has ${yoe || "0"} years of experience. If the job requires more, score must be below 50.

Return ONLY a JSON object: {"score": number, "reasoning": "string"}

Resume: ${resumeText.substring(0, 3000)}
Job: ${jobDescription}`;

        const result = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: prompt
        });

        const rawText = result.text ? result.text.trim() : "";
        if (!rawText) {
            return { score: 50, reasoning: "AI returned an empty response." };
        }
        
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        let parsed;
        try {
            parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
        } catch (err) {
            console.error("JSON Parse Error:", err, "Raw Text:", rawText);
            return { score: 50, reasoning: "AI response was not in valid JSON format." };
        }
        
        return {
            score: Math.min(100, Math.max(0, parseInt(parsed.score || 50))),
            reasoning: parsed.reasoning || "AI analyzed your fit."
        };
    } catch(e) {
        console.error('--- GEMINI ERROR ---');
        console.error(e);
        return { score: 50, reasoning: "AI scoring paused. Check terminal for error logs." }; 
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
