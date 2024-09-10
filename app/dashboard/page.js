'use client';

import { useState } from 'react';

export default function Dashboard() {
  const [preferences, setPreferences] = useState({
    jobTitle: '',
    location: '',
    salary: '',
  });
  const [resumeText, setResumeText] = useState(''); // To store the extracted resume text
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState(''); // Handle file upload errors
  const [applyMessage, setApplyMessage] = useState(''); // To show success or error message after applying

  // Handle file upload and send to API
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      setFileError('Please select a file');
      return;
    }

    setFileError(''); // Clear any previous error messages

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);

      // Send the file to the server-side API
      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setResumeText(data.resumeText);
      } else {
        setFileError(data.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setFileError('An error occurred during file upload');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPreferences({
      ...preferences,
      [name]: value,
    });
  };

  // Handle form submission to find jobs
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!resumeText) {
      setFileError('Please upload your resume');
      setLoading(false);
      return;
    }

    const payload = {
      resumeText, // Include the extracted resume text from the uploaded file
      jobTitle: preferences.jobTitle,
      location: preferences.location,
      salary: preferences.salary,
    };

    try {
      const response = await fetch('/api/match-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch matched jobs');
      }

      const data = await response.json();
      setMatchedJobs(data.matchedJobs);
    } catch (error) {
      console.error('Error fetching matched jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle applying to a job
  const handleApply = async (job) => {
    setLoading(true);
    setApplyMessage(''); // Clear previous messages

    const payload = {
      jobTitle: job['Job Position'],
      company: job.Company,
      location: job.Location,
      salary: job.Salary,
      resumeText, // Attach the uploaded resume text
    };

    try {
      const response = await fetch('/api/apply-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to apply for the job');
      }

      const data = await response.json();
      setApplyMessage(data.message || 'Successfully applied for the job!');
    } catch (error) {
      console.error('Error applying for job:', error);
      setApplyMessage('An error occurred while applying for the job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Job Matching Dashboard</h1>

      <form onSubmit={handleSubmit}>
        <label>Job Title</label>
        <input 
          type="text" 
          name="jobTitle" 
          value={preferences.jobTitle} 
          onChange={handleInputChange} 
          required 
        />

        <label>Location</label>
        <input 
          type="text" 
          name="location" 
          value={preferences.location} 
          onChange={handleInputChange} 
          required 
        />

        <label>Salary</label>
        <input 
          type="text" 
          name="salary" 
          value={preferences.salary} 
          onChange={handleInputChange} 
          required 
        />

        <label>Upload Resume</label>
        <input 
          type="file" 
          onChange={handleFileChange} 
          accept=".pdf,.docx" 
          required 
        />

        {/* Display file upload errors */}
        {fileError && <p style={{ color: 'red' }}>{fileError}</p>}

        <button type="submit" disabled={loading}>Find Jobs</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h2>Matched Jobs</h2>
          {matchedJobs.length > 0 ? (
            matchedJobs.map((job, index) => (
              <div key={index}>
                <h3>{job['Job Position']} at {job.Company}</h3>
                <p>Location: {job.Location}</p>
                <p>Salary: ${job.Salary}</p>
                <button onClick={() => handleApply(job)} disabled={loading}>Apply</button>
              </div>
            ))
          ) : (
            <p>No matched jobs found.</p>
          )}
        </div>
      )}

      {/* Show message after applying for a job */}
      {applyMessage && <p style={{ color: 'green' }}>{applyMessage}</p>}
    </div>
  );
}
