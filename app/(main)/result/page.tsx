import { getLatestPersona } from '@/lib/actions/challenge';
import { redirect } from 'next/navigation';

export default async function ResultPage() {
  const persona = await getLatestPersona();

  // If no persona, redirect to dashboard
  if (!persona) {
    redirect('/dashboard');
  }

  // Redirect to badge detail page with completed flag
  redirect(`/badge/${persona.id}?completed=true`);
}

