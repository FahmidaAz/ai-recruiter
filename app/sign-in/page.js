'use client'; // Ensure it's a client component

import { SignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export default function SignInPage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  const style = {
    display: "flex",
    alignItems: "center",  // Corrected alignItems spelling
    justifyContent: "center",  // Horizontally center the content
    height: "100vh",  // Make the container take the full height of the viewport
  };

  useEffect(() => {
    // If the user is signed in, redirect them to the dashboard
    if (isSignedIn) {
      router.push('/dashboard');
    }
  }, [isSignedIn, router]);

  return (
    <div style={style}>
      <SignIn />
    </div>
  );
}
