import * as React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full p-6 rounded-2xl border bg-card text-card-foreground shadow-lg text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold">Đã xảy ra sự cố hiển thị</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hệ thống gặp lỗi bất ngờ trong quá trình xử lý dữ liệu giao diện. Bạn có thể tải lại hoặc quay về trang chủ.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-muted/50 rounded-xl text-left font-mono text-[11px] text-destructive overflow-x-auto max-h-32 border">
                {this.state.error.message}
              </div>
            )}

            <div className="flex gap-2 justify-center pt-2">
              <Button onClick={this.handleReset} className="gap-2 text-xs font-bold">
                <RefreshCw className="h-3.5 w-3.5" />
                Tải lại trang
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/dashboard')}
                className="gap-2 text-xs font-bold"
              >
                <Home className="h-3.5 w-3.5" />
                Trang chủ
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
