'use client'; // Ensure this component runs on the client-side

import { SignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export default function SignUpPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  // Flexbox style for centering the sign-up container
  const style = {
    display: "flex",
    alignItems: "center",  // Corrected spelling
    justifyContent: "center",
    height: "100vh",  // Full height of the viewport
  };

  useEffect(() => {
    // If the user is signed in, redirect them to the dashboard
    if (isSignedIn) {
      router.push('/dashboard');
    }
  }, [isSignedIn, router]);

  return (
    <div style={style}>
      <SignUp />
    </div>
  );
}
