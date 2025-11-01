import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Back to Home */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-block text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent hover:scale-105 transition-transform"
          >
            Eat-dentity
          </Link>
        </div>

        {/* Clerk Sign Up Component */}
        <div className="flex justify-center">
          <SignUp 
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            afterSignUpUrl="/dashboard"
            afterSignInUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}

