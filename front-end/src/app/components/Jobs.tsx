import React from 'react';
import JobCard from './JobCard';
import { JobListing } from '../types/job';

export default function Jobs({ jobs }: { jobs: JobListing[] }) {
    return (
        <div className="min-h-screen bg-slate-50 p-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      );
}