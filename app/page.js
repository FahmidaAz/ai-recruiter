'use client'; // This tells Next.js that this component should only run on the client-side

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function HomePage() {
  const { user, isSignedIn } = useUser();

  return (
    <div>
      {/* Navbar */}
      <header className="navbar">
      <h3 className="logo">JobGenie</h3>
  <nav>
    <Link href="/">Home</Link>
    {isSignedIn ? (
      <>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/chatbot">AI Chatbot</Link> {/* Add this link */}
      </>
    ) : (
      <>
        <Link href="/sign-in">Sign In</Link>
        <Link href="/sign-up">Sign Up</Link>
      </>
    )}
  </nav>
      </header>

      <main>
        <div className="container">
          <h1>Welcome to JobGenie</h1>
          <br></br>
          <p>Find the perfect job with AI assistance.</p>
          <p>Your AI Job Recruiter</p>
          <br></br>
          {isSignedIn ? (
            <div>
              <h2>Welcome back, {user.firstName}!</h2>
              <Link href="/dashboard">
                <button className="btn-primary">Go to Dashboard</button>
              </Link>
            </div>
          ) : (
            <div>
              <h2>Sign in to get started</h2>
              <p>Create an account or sign in to use our AI-powered job application system.</p>
              <br></br>
              <Link href="/sign-in">
                <button className="btn-secondary" style={{ marginRight: '10px' }}>
                  Sign In
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="btn-primary">Sign Up</button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <footer>
        <p>Powered by OpenAI, Pinecone, Clerk, and Stripe.</p>
      </footer>
    </div>
  );
}
