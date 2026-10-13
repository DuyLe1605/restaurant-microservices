import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, Printer, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ExportDropdownProps {
  onExportExcel?: () => void;
  onPrintReport?: () => void;
  excelLabel?: string;
  printLabel?: string;
  disabled?: boolean;
  className?: string;
  buttonText?: string;
}

export function ExportDropdown({
  onExportExcel,
  onPrintReport,
  excelLabel = 'Xuất bảng tính Excel (.xlsx)',
  printLabel = 'In báo cáo chuẩn (A4 / PDF)',
  disabled = false,
  className,
  buttonText = 'Xuất dữ liệu & Báo cáo',
}: ExportDropdownProps) {
  return (
    <DropdownMenu
      align="end"
      className="w-56"
      trigger={
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(
            'h-9 px-3.5 gap-2 border-border/80 bg-background/80 hover:bg-muted/80 font-semibold shadow-xs transition-all hover:border-primary/40',
            className
          )}
        >
          <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs">{buttonText}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground ml-0.5" />
        </Button>
      }
    >
      <DropdownMenuLabel>Tùy chọn xuất & in ấn</DropdownMenuLabel>
      <DropdownMenuSeparator />

      {onExportExcel && (
        <DropdownMenuItem
          icon={<FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
          onClick={onExportExcel}
        >
          <span>{excelLabel}</span>
        </DropdownMenuItem>
      )}

      {onPrintReport && (
        <DropdownMenuItem
          icon={<Printer className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          onClick={onPrintReport}
        >
          <span>{printLabel}</span>
        </DropdownMenuItem>
      )}
    </DropdownMenu>
  );
}
