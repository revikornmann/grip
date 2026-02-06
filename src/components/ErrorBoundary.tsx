"use client";

import React from "react";
import { Card, Button, Alert } from "muka-ui";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  critical?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("[ErrorBoundary]", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isCritical = this.props.critical;
      return (
        <Card padding="lg">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-4)",
            }}
          >
            <Alert
              variant="error"
              title={isCritical ? "Kritieke fout" : "Er ging iets mis"}
            >
              {isCritical
                ? "Een belangrijk onderdeel kon niet worden geladen. Herlaad de pagina."
                : "Dit onderdeel kon niet worden geladen. Probeer het opnieuw."}
            </Alert>
            <div>
              <Button variant="primary" onClick={this.handleReset}>
                Probeer opnieuw
              </Button>
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
