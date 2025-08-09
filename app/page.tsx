import dynamic from 'next/dynamic';

// Import the client component with no SSR to avoid hydration issues
const LoginWrapper = dynamic(() => import('../components/LoginWrapper'), { ssr: false });

export default function Home() {
  return (
    <div>
      <LoginWrapper />
    </div>
  );
}
