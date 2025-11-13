'use client';

import React, { ReactNode, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

// Error boundary class
class ErrorBoundaryClass extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    reset = () => {
        console.log('🟢 Resetting error boundary state');
        this.setState({ hasError: false, error: null });
    };

    static getDerivedStateFromError(error: Error): State {
        console.log('🔴 Error caught by boundary:', error);
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="app-bg min-h-screen flex items-center justify-center p-4">
                    <div className="card rounded-lg p-8 max-w-md text-center">
                        <h1 className="text-2xl font-bold mb-4">⚠️ Something Went Wrong</h1>
                        <p className="muted mb-6">
                            An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
                        </p>
                        {this.state.error && (
                            <details className="text-left bg-gray-50 dark:bg-slate-900 p-3 rounded text-sm mb-4">
                                <summary className="cursor-pointer font-mono text-xs muted">Error details</summary>
                                <pre className="mt-2 overflow-auto text-xs whitespace-pre-wrap wrap-break-word">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={() => globalThis.location.reload()}
                                className="btn px-6 py-2 rounded hover:opacity-80 transition flex-1"
                            >
                                Refresh Page
                            </button>
                            <Link
                                href="/"
                                className="btn px-6 py-2 rounded hover:opacity-80 transition flex-1 inline-flex items-center justify-center"
                            >
                                Go Home
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Wrapper component that listens for route changes and resets error state
function ErrorBoundaryWrapper({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const errorBoundaryRef = useRef<ErrorBoundaryClass>(null);

    useEffect(() => {
        console.log('🔵 Pathname changed to:', pathname, 'Resetting error boundary');
        if (errorBoundaryRef.current) {
            errorBoundaryRef.current.reset();
        }
    }, [pathname]);

    return (
        <ErrorBoundaryClass ref={errorBoundaryRef}>
            {children}
        </ErrorBoundaryClass>
    );
}

export default function ErrorBoundary({ children }: { children: ReactNode }) {
    return <ErrorBoundaryWrapper>{children}</ErrorBoundaryWrapper>;
}
