import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/routes";
import { ToastProvider } from "@/app/layouts/ToastProvider";
import "./index.css";
import "./shared/styles/submenu-table.css";

class ErrorBoundary extends React.Component<{children: any}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      // 🔒 SECURITY: Don't expose error stack traces in production
      const isDev = import.meta.env.DEV;
      
      return (
        <div style={{ padding: 20, color: 'red', fontFamily: 'monospace' }}>
          <h2>⚠️ Something went wrong</h2>
          <p>An unexpected error occurred. Please refresh the page and try again.</p>
          {isDev && (
            <>
              <hr />
              <details style={{ marginTop: 20, cursor: 'pointer' }}>
                <summary>Error Details (Development Only)</summary>
                <pre style={{ whiteSpace: 'pre-wrap', marginTop: 10 }}>{this.state.error?.toString()}</pre>
                <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.stack}</pre>
              </details>
            </>
          )}
          <button 
            onClick={() => window.location.href = '/'}
            style={{ marginTop: 20, padding: '8px 16px', cursor: 'pointer' }}
          >
            Go Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
