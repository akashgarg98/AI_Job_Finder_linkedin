import { useState } from 'react';
import axios from 'axios';
import { MapPin, Building, Calendar, CheckCircle, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';

export default function JobCard({ job, resumeFile }: { job: any, resumeFile: File | null }) {
  const getStatusColor = (status: string) => {
    if (status === 'Green') return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (status === 'Yellow') return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Green') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === 'Yellow') return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="border border-gray-800 bg-gray-900 rounded-xl p-6 hover:border-gray-700 transition-all flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-3">
        <h3 className="text-xl font-bold font-sans tracking-tight mb-2 text-white hover:text-blue-400 transition-colors">
          <a href={job.url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
            {job.title} 
            <ExternalLink className="w-4 h-4 opacity-70" />
          </a>
        </h3>
        <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-gray-400 text-sm">
          <span className="flex items-center gap-1"><Building className="w-4 h-4"/> {job.company}</span>
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {job.location}</span>
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> Recent</span>
        </div>
        <p className="text-gray-500 text-sm line-clamp-2">{job.description}</p>
        <a href={job.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400 text-sm font-medium">View on LinkedIn &rarr;</a>
      </div>

      <div className="flex flex-col items-end justify-center min-w-[150px] border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-6">
        {job.score !== undefined ? (
          <div className="flex flex-col items-center gap-2">
             <div className="flex items-center gap-2">
                {getStatusIcon(job.status)}
                <span className="text-gray-300 font-medium tracking-wide text-xs">MATCH SCORE</span>
             </div>
             <div className={`text-4xl font-bold px-4 py-2 rounded-lg border flex items-center justify-center ${getStatusColor(job.status)}`}>
               {job.score}%
             </div>
          </div>
        ) : (
          <div className="text-gray-500 text-sm italic">Upload Resume for Match</div>
        )}
      </div>
      </div>

      {job.reasoning && (
         <div className={`mt-2 p-5 rounded-xl text-sm border-l-4 shadow-xl bg-black/40 relative overflow-hidden
           ${job.status === 'Green' ? 'border-green-500/80 text-green-50' : 
             job.status === 'Yellow' ? 'border-yellow-400/80 text-yellow-50' : 
             'border-red-500/80 text-red-50'}`}>
           <div className="relative z-10">
             <span className="font-bold tracking-widest uppercase text-[10px] mb-2 block opacity-60">AI Recruiter Feedback Matrix</span>
             <p className="leading-relaxed opacity-90 text-sm">{job.reasoning}</p>
           </div>
         </div>
      )}
    </div>
  );
}
