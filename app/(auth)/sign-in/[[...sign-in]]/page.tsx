import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const params = await searchParams;
  const redirectUrl = params.redirect_url || "/dashboard";

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

        {/* Clerk Sign In Component */}
        <div className="flex justify-center">
          <SignIn 
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl={redirectUrl}
            afterSignUpUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}

