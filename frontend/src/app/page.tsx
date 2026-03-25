"use client";
import { useState } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import JobCard from '@/components/JobCard';
import { Search, Loader2, UploadCloud, FileText } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  // Completely bypass ALL external CDNs and CORS policies by serving the identical worker natively from the Next.js /public directory!
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export default function Home() {
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [apifyKey, setApifyKey] = useState('');
  const [yoe, setYoe] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !location || !apifyKey) return alert('Please fill in all search fields.');
    if (!resume) return alert('Please upload a PDF Resume before searching so we can analyze your fit!');
    
    setLoading(true);
    try {
      let extractedResumeText = "";
      if (resume) {
        try {
          const arrayBuffer = await resume.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              const strings = content.items.map((item: any) => item.str);
              extractedResumeText += strings.join(" ") + " ";
          }
        } catch(pdfErr: any) {
            console.error("Local PDF Parsing Error:", pdfErr);
            setLoading(false);
            return alert(`PDF Parser Engine Error: ${pdfErr?.message || 'Worker conflict. Check Browser Console.'}`);
        }
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/jobs/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobTitle, 
          location, 
          apifyKey, 
          yoe,
          resumeText: extractedResumeText
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs);
      } else {
        alert(data.error || 'Failed to scrape jobs');
      }
    } catch (err) {
      console.error(err);
      alert('Error scraping jobs. Check backend connection.');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            Akash's Job Search
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Find the latest jobs and automatically analyze your resume against the core requirements using intelligent semantic search.
          </p>
        </div>

        <form onSubmit={handleSearch} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Job Title</label>
              <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Software Engineer" className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Location</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Remote, New York" className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Total Years of Experience</label>
              <input type="number" min="0" value={yoe} onChange={e => setYoe(e.target.value)} placeholder="e.g. 5" className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Apify API Key</label>
              <input type="password" value={apifyKey} onChange={e => setApifyKey(e.target.value)} placeholder="apify_api_..." className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-gray-800">
            <label className="text-sm font-medium text-gray-300">Upload Resume (PDF)</label>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="resume-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-800 border-dashed rounded-xl cursor-pointer bg-gray-950 hover:bg-gray-900 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {resume ? (
                    <>
                      <FileText className="w-8 h-8 text-blue-500 mb-2" />
                      <p className="text-sm text-gray-300 font-medium">{resume.name}</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-gray-500 mb-2" />
                      <p className="text-sm text-gray-400"><span className="font-semibold text-blue-500">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-1">PDF format only</p>
                    </>
                  )}
                </div>
                <input 
                  id="resume-upload" 
                  type="file" 
                  accept="application/pdf" 
                  className="hidden" 
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setResume(file);
                  }} 
                />
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? <Loader2 className="animate-spin w-5 h-5"/> : <Search className="w-5 h-5"/>}
            {loading ? 'Loading...' : 'Find Jobs'}
          </button>
        </form>

        {jobs.length > 0 && (
          <div className="mt-16 space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Found {jobs.length} Recent Jobs
            </h2>
            <div className="space-y-4">
              {jobs.map(job => (
                <JobCard key={job.id} job={job} resumeFile={resume} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
