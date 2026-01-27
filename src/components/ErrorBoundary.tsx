import React from 'react';

interface State {
  hasError: boolean;
  error?: Error | null;
}

export class ErrorBoundary extends React.Component<{}, State> {
  public props: any;
  public state: State;
  constructor(props: {}) {
    super(props as any);
    this.props = props;
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // log to console for now
    console.error('Unhandled error in component tree', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
            <ErrorState 
                type="error"
                message={this.state.error?.message}
            />
        </div>
      );
    }

    return this.props.children;
  }
}

import { ErrorState } from './ui/ErrorState';
