import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary] Error caught in ${this.props.moduleName || 'Module'}:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="p-6 m-4 bg-rose-950/20 border-rose-800/40 text-rose-200 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-900/40 rounded-lg shrink-0">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="font-heading text-lg font-bold text-slate-100">
                {this.props.moduleName ? `${this.props.moduleName} Error` : 'Something went wrong'}
              </h3>
              <p className="text-xs text-slate-300">
                An unexpected error occurred while rendering this section.
              </p>
              {this.state.error && (
                <pre className="text-2xs font-mono bg-dark-bg/80 p-3 rounded-lg border border-rose-900/30 overflow-x-auto text-rose-300">
                  {this.state.error.message}
                </pre>
              )}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  onClick={this.handleReset}
                  className="border-rose-700/50 text-rose-200 hover:bg-rose-900/40"
                >
                  Try Reloading Section
                </Button>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
