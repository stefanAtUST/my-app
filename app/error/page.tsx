'use client';

export default function ErrorPage() {
  // Throw an error to be caught by the ErrorBoundary
  throw new Error('This is a test error page to demonstrate the ErrorBoundary component.');
}

