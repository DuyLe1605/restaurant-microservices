export function LoadingSpinner({ text = 'Đang tải dữ liệu...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full p-8">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">{text}</p>
    </div>
  );
}
