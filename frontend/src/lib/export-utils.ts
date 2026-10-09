/**
 * Utility functions for exporting professional reports
 * - CSV/Excel export with UTF-8 BOM support for Vietnamese characters
 * - Professional Printable / PDF Report View
 */

import { formatVND } from './format-currency';
import { formatDateTime, formatDate } from './format-date';

export interface ExportColumn {
  header: string;
  key: string;
  formatter?: (val: any, row?: any) => string;
}

export interface SummaryRow {
  label: string;
  value: string;
}

export interface PrintReportConfig {
  title: string;
  subtitle?: string;
  reportPeriod?: string;
  preparedBy?: string;
  branchName?: string;
  kpis?: { label: string; value: string; color?: string }[];
  columns: { header: string; key: string; align?: 'left' | 'center' | 'right'; formatter?: (val: any, row?: any) => string }[];
  data: any[];
  summary?: { label: string; value: string }[];
  notes?: string[];
  signatures?: string[];
}

/**
 * Xuất dữ liệu sang file CSV tương thích Excel (Có UTF-8 BOM để hiển thị tiếng Việt chuẩn 100%)
 */
export function exportToExcel(
  filename: string,
  title: string,
  columns: ExportColumn[],
  data: any[],
  summaryRows?: SummaryRow[],
  metadata?: Record<string, string>
) {
  const lines: string[] = [];

  // UTF-8 BOM
  lines.push('\uFEFF');

  // Restaurant Header
  lines.push(`HỆ THỐNG QUẢN LÝ NHÀ HÀNG - SOA RESTAURANT MICROSERVICES`);
  lines.push(`TIÊU ĐỀ: ${title.toUpperCase()}`);
  lines.push(`Thời gian xuất: ${formatDateTime(new Date().toISOString())}`);
  
  if (metadata) {
    Object.entries(metadata).forEach(([k, v]) => {
      lines.push(`${k}: ${v}`);
    });
  }
  lines.push(''); // Empty line separator

  // Table Headers
  const headers = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`);
  lines.push(headers.join(','));

  // Data Rows
  data.forEach((row, index) => {
    const rowValues = columns.map((col) => {
      if (col.key === '__index') {
        return `"${index + 1}"`;
      }
      let val = row[col.key];
      if (col.formatter) {
        val = col.formatter(val, row);
      } else if (val === null || val === undefined) {
        val = '';
      }
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    lines.push(rowValues.join(','));
  });

  // Summary Rows
  if (summaryRows && summaryRows.length > 0) {
    lines.push('');
    summaryRows.forEach((s) => {
      lines.push(`"${s.label.replace(/"/g, '""')}","${s.value.replace(/"/g, '""')}"`);
    });
  }

  // Footer / Signatures
  lines.push('');
  lines.push('"NGƯỜI LẬP BIỂU","THỦ KHO / KẾ TOÁN","GIÁM ĐỐC / QUẢN LÝ"');
  lines.push('"(Ký và ghi rõ họ tên)","(Ký và ghi rõ họ tên)","(Ký và ghi rõ họ tên)"');

  const csvContent = lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Mở cửa sổ in ấn báo cáo chuẩn A4 chuyên nghiệp (Hỗ trợ In trực tiếp hoặc Lưu PDF đẹp mắt)
 */
export function printProfessionalReport(config: PrintReportConfig) {
  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  if (!printWindow) {
    alert('Vui lòng cho phép trình duyệt mở popup để in hoặc xuất PDF báo cáo.');
    return;
  }

  const kpisHtml = config.kpis && config.kpis.length > 0 ? `
    <div class="kpi-grid">
      ${config.kpis.map((kpi) => `
        <div class="kpi-card" style="border-top-color: ${kpi.color || '#3b82f6'};">
          <div class="kpi-label">${kpi.label}</div>
          <div class="kpi-value" style="color: ${kpi.color || '#1e293b'};">${kpi.value}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const tableHeadersHtml = config.columns.map((col) => `
    <th class="align-${col.align || 'left'}">${col.header}</th>
  `).join('');

  const tableRowsHtml = config.data.length === 0 ? `
    <tr><td colspan="${config.columns.length}" style="text-align:center; padding: 20px; color:#64748b;">Không có dữ liệu báo cáo</td></tr>
  ` : config.data.map((row, idx) => `
    <tr>
      ${config.columns.map((col) => {
        let val = col.key === '__index' ? idx + 1 : row[col.key];
        if (col.formatter) {
          val = col.formatter(val, row);
        } else if (val === null || val === undefined) {
          val = '-';
        }
        return `<td class="align-${col.align || 'left'}">${val}</td>`;
      }).join('')}
    </tr>
  `).join('');

  const summaryHtml = config.summary && config.summary.length > 0 ? `
    <div class="summary-section">
      <table class="summary-table">
        ${config.summary.map((s) => `
          <tr>
            <td class="sum-label">${s.label}:</td>
            <td class="sum-value">${s.value}</td>
          </tr>
        `).join('')}
      </table>
    </div>
  ` : '';

  const signatures = config.signatures || ['Người Lập Biểu', 'Kế Toán / Thủ Kho', 'Ban Giám Đốc'];
  const signaturesHtml = `
    <div class="signatures-grid">
      ${signatures.map((sig) => `
        <div class="signature-box">
          <div class="sig-title">${sig.toUpperCase()}</div>
          <div class="sig-subtitle">(Ký, họ tên và đóng dấu)</div>
          <div class="sig-space"></div>
        </div>
      `).join('')}
    </div>
  `;

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="utf-8" />
      <title>${config.title}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 15mm 15mm 15mm 15mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        body {
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 24px;
          background: #fff;
          font-size: 13px;
          line-height: 1.5;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0284c7;
          padding-bottom: 12px;
          margin-bottom: 20px;
        }
        .brand-name {
          font-size: 18px;
          font-weight: 800;
          color: #0284c7;
          text-transform: uppercase;
          letter-spacing: -0.5px;
        }
        .brand-info {
          font-size: 11px;
          color: #64748b;
          margin-top: 3px;
        }
        .report-meta {
          text-align: right;
          font-size: 11px;
          color: #475569;
        }
        .report-title {
          text-align: center;
          margin: 15px 0 5px 0;
        }
        .report-title h1 {
          font-size: 22px;
          font-weight: 800;
          margin: 0;
          color: #0f172a;
          letter-spacing: -0.5px;
          text-transform: uppercase;
        }
        .report-title p {
          font-size: 12px;
          color: #64748b;
          margin: 4px 0 0 0;
          font-style: italic;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin: 18px 0;
        }
        .kpi-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-top: 3px solid #0284c7;
          border-radius: 8px;
          padding: 10px 14px;
        }
        .kpi-label {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
        }
        .kpi-value {
          font-size: 18px;
          font-weight: 800;
          margin-top: 4px;
        }
        table.data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          font-size: 12px;
        }
        table.data-table th {
          background: #f1f5f9;
          color: #1e293b;
          font-weight: 700;
          padding: 8px 10px;
          border: 1px solid #cbd5e1;
          text-transform: uppercase;
          font-size: 11px;
        }
        table.data-table td {
          padding: 8px 10px;
          border: 1px solid #e2e8f0;
        }
        table.data-table tbody tr:nth-child(even) {
          background: #f8fafc;
        }
        .align-left { text-align: left; }
        .align-center { text-align: center; }
        .align-right { text-align: right; }
        .summary-section {
          margin-top: 15px;
          display: flex;
          justify-content: flex-end;
        }
        .summary-table {
          border-collapse: collapse;
          font-size: 13px;
        }
        .summary-table td {
          padding: 4px 12px;
        }
        .sum-label {
          font-weight: 600;
          color: #475569;
          text-align: right;
        }
        .sum-value {
          font-weight: 800;
          color: #0f172a;
          text-align: right;
        }
        .signatures-grid {
          margin-top: 40px;
          display: flex;
          justify-content: space-around;
          page-break-inside: avoid;
        }
        .signature-box {
          text-align: center;
          width: 200px;
        }
        .sig-title {
          font-size: 12px;
          font-weight: 700;
          color: #1e293b;
        }
        .sig-subtitle {
          font-size: 11px;
          color: #64748b;
          font-style: italic;
          margin-top: 2px;
        }
        .sig-space {
          height: 65px;
        }
        .footer-note {
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px dashed #cbd5e1;
          font-size: 10px;
          color: #94a3b8;
          display: flex;
          justify-content: space-between;
        }
        .no-print-bar {
          background: #0f172a;
          color: white;
          padding: 10px 16px;
          margin: -24px -24px 24px -24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .print-btn {
          background: #0284c7;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 700;
          cursor: pointer;
        }
        .print-btn:hover { background: #0369a1; }
        @media print {
          .no-print-bar { display: none !important; }
          body { padding: 0 !important; }
        }
      </style>
    </head>
    <body>
      <div class="no-print-bar">
        <span>Bản xem trước báo cáo in & xuất PDF</span>
        <button class="print-btn" onclick="window.print()">🖨️ In Báo Cáo / Lưu PDF</button>
      </div>

      <div class="header">
        <div>
          <div class="brand-name">HỆ THỐNG NHÀ HÀNG CAO CẤP RESTAURANT PRO</div>
          <div class="brand-info">Địa chỉ: 123 Đường Ẩm Thực, Quận 1, TP. Hồ Chí Minh</div>
          <div class="brand-info">Hotline: 1900 6868 | Email: contact@restaurantpro.vn</div>
        </div>
        <div class="report-meta">
          <div><strong>Mã báo cáo:</strong> RP-${new Date().getTime().toString().slice(-6)}</div>
          <div><strong>Ngày in:</strong> ${formatDateTime(new Date().toISOString())}</div>
          <div><strong>Người in:</strong> ${config.preparedBy || 'Quản lý hệ thống'}</div>
        </div>
      </div>

      <div class="report-title">
        <h1>${config.title}</h1>
        ${config.subtitle ? `<p>${config.subtitle}</p>` : ''}
        ${config.reportPeriod ? `<p>Kỳ báo cáo: <strong>${config.reportPeriod}</strong></p>` : ''}
      </div>

      ${kpisHtml}

      <table class="data-table">
        <thead>
          <tr>${tableHeadersHtml}</tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>

      ${summaryHtml}

      ${signaturesHtml}

      <div class="footer-note">
        <span>Báo cáo được khởi tạo tự động từ hệ thống Restaurant Microservices</span>
        <span>Trang 1/1</span>
      </div>

      <script>
        // Tự động mở hộp thoại in sau khi tải trang
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
