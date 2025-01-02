'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

export default function Home() {
  return (
    <Authenticator loginMechanisms={['email']}>
      {({ signOut }) => (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
          <h1 className="text-4xl font-bold mb-4">Hello Amplify</h1>
          <button
            onClick={signOut}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign Out
          </button>
        </main>
      )}
    </Authenticator>
  );
}
