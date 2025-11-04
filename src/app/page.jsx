import { redirect } from 'next/navigation';

/**
 * Root page - redirects to timeline
 */
export default function Home() {
  redirect('/timeline');
}
