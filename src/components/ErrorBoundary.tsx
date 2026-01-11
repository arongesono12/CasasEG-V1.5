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
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-lg text-center">
            <h2 className="text-2xl font-bold mb-2">Ha ocurrido un error</h2>
            <p className="text-gray-600 mb-4">The application encountered a problem and cannot continue. Please check the console for details.</p>
            <pre className="text-xs text-left bg-gray-100 p-3 rounded overflow-auto">{this.state.error?.message}</pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
