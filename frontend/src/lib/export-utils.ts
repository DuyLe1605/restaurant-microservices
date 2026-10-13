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

import * as XLSX from 'xlsx';

/**
 * Xuất dữ liệu sang file bảng tính Excel chuẩn (.xlsx)
 * Đảm bảo 100% dữ liệu phân tách đúng từng cột A, B, C..., có tiêu đề sáp nhập (merge),
 * tự động căn chỉnh độ rộng cột và mở mượt mà trên mọi phiên bản Microsoft Excel.
 */
export function exportToExcel(
  filename: string,
  title: string,
  columns: ExportColumn[],
  data: any[],
  summaryRows?: SummaryRow[],
  metadata?: Record<string, string>
) {
  const colCount = Math.max(columns.length, 4);
  const aoa: any[][] = [];

  // 1. Tiêu đề hệ thống và Báo cáo
  aoa.push(['HỆ THỐNG QUẢN LÝ NHÀ HÀNG - RESTAURANT MICROSERVICES']);
  aoa.push([title.toUpperCase()]);
  aoa.push([`Thời gian trích xuất: ${formatDateTime(new Date().toISOString())}`]);
  aoa.push([]); // Dòng trống

  // 2. Thông tin bổ sung (Metadata)
  if (metadata) {
    Object.entries(metadata).forEach(([k, v]) => {
      aoa.push([`${k}:`, v]);
    });
    aoa.push([]); // Dòng trống
  }

  // 3. Tiêu đề cột dữ liệu
  const headerRow = columns.map((c) => c.header);
  aoa.push(headerRow);

  // 4. Các dòng dữ liệu
  data.forEach((row, index) => {
    const rowValues = columns.map((col) => {
      let val = col.key === '__index' ? index + 1 : row[col.key];
      if (col.formatter) {
        val = col.formatter(val, row);
      } else if (val === null || val === undefined) {
        val = '';
      }
      return val;
    });
    aoa.push(rowValues);
  });

  // 5. Các dòng tổng hợp (Summary)
  if (summaryRows && summaryRows.length > 0) {
    aoa.push([]); // Dòng trống
    summaryRows.forEach((s) => {
      const summaryLine = new Array(colCount).fill('');
      summaryLine[0] = s.label.toUpperCase();
      summaryLine[colCount - 1] = s.value;
      aoa.push(summaryLine);
    });
  }

  // 6. Khu vực ký xác nhận (3 bên)
  aoa.push([]); // Dòng trống
  aoa.push([]);
  const sigRow1 = new Array(colCount).fill('');
  const sigRow2 = new Array(colCount).fill('');
  const colThird = Math.max(1, Math.floor(colCount / 3));

  sigRow1[0] = 'NGƯỜI LẬP BIỂU';
  sigRow1[colThird] = 'THỦ KHO / KẾ TOÁN';
  sigRow1[colCount - 1] = 'GIÁM ĐỐC / QUẢN LÝ';

  sigRow2[0] = '(Ký và ghi rõ họ tên)';
  sigRow2[colThird] = '(Ký và ghi rõ họ tên)';
  sigRow2[colCount - 1] = '(Ký và ghi rõ họ tên)';

  aoa.push(sigRow1);
  aoa.push(sigRow2);

  // Khởi tạo Worksheet
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Tự động tính toán độ rộng cột (Column Widths) để chữ không bị cụt
  const colWidths: { wch: number }[] = [];
  for (let c = 0; c < colCount; c++) {
    let maxLen = 12;
    if (columns[c]?.header) {
      maxLen = Math.max(maxLen, columns[c].header.length + 4);
    }
    data.forEach((row, idx) => {
      const col = columns[c];
      if (col) {
        let val = col.key === '__index' ? idx + 1 : row[col.key];
        if (col.formatter) val = col.formatter(val, row);
        if (val) maxLen = Math.max(maxLen, String(val).length + 4);
      }
    });
    colWidths.push({ wch: Math.min(Math.max(maxLen, 14), 45) });
  }
  ws['!cols'] = colWidths;

  // Hợp nhất ô cho tiêu đề đầu trang
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: colCount - 1 } },
  ];

  // Khởi tạo Workbook và ghi ra file .xlsx
  const wb = XLSX.utils.book_new();
  const safeSheetName = filename.slice(0, 25).replace(/[\\/?*[\]]/g, '_');
  XLSX.utils.book_append_sheet(wb, ws, safeSheetName || 'Bao_cao');

  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Mở cửa sổ in ấn báo cáo chuẩn A4 chuyên nghiệp (Hỗ trợ In trực tiếp hoặc Lưu PDF đẹp mắt)
 */
export function printProfessionalReport(config: PrintReportConfig) {
  const printWindow = window.open('', '_blank', 'width=1100,height=900');
  if (!printWindow) {
    alert('Vui lòng cho phép trình duyệt mở popup để in hoặc xuất PDF báo cáo.');
    return;
  }

  const kpis = config.kpis || [];
  const kpisHtml = kpis.length > 0 ? `
    <div class="kpi-grid" style="grid-template-columns: repeat(${kpis.length}, 1fr);">
      ${kpis.map((kpi) => `
        <div class="kpi-card" style="border-top-color: ${kpi.color || '#0284c7'};">
          <div class="kpi-label">${kpi.label}</div>
          <div class="kpi-value" style="color: ${kpi.color || '#0f172a'};">${kpi.value}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const tableHeadersHtml = config.columns.map((col) => `
    <th class="align-${col.align || 'left'}">${col.header}</th>
  `).join('');

  const tableRowsHtml = config.data.length === 0 ? `
    <tr><td colspan="${config.columns.length}" style="text-align:center; padding: 18px; color:#64748b;">Không có dữ liệu báo cáo</td></tr>
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
    <div class="summary-wrapper">
      <div class="summary-card">
        ${config.summary.map((s) => `
          <div class="summary-item">
            <span class="sum-label">${s.label}:</span>
            <span class="sum-value">${s.value}</span>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const signatures = config.signatures || ['Người Lập Biểu', 'Kế Toán / Thủ Kho', 'Giám Đốc / Quản Lý'];
  const sigColWidth = `${Math.floor(100 / signatures.length)}%`;
  const signaturesHtml = `
    <div class="signatures-grid">
      ${signatures.map((sig) => `
        <div class="signature-box" style="width: ${sigColWidth};">
          <div class="sig-title">${sig.toUpperCase()}</div>
          <div class="sig-subtitle">(Ký, họ tên và đóng dấu)</div>
          <div class="sig-space"></div>
        </div>
      `).join('')}
    </div>
  `;

  // Merge subtitle & report period cleanly to avoid duplicates
  let subHeaderHtml = '';
  if (config.subtitle && config.reportPeriod) {
    if (config.subtitle.toLowerCase().includes(config.reportPeriod.toLowerCase())) {
      subHeaderHtml = `<p class="report-subtitle">${config.subtitle}</p>`;
    } else {
      subHeaderHtml = `<p class="report-subtitle">${config.subtitle} • Kỳ báo cáo: <strong>${config.reportPeriod}</strong></p>`;
    }
  } else if (config.subtitle) {
    subHeaderHtml = `<p class="report-subtitle">${config.subtitle}</p>`;
  } else if (config.reportPeriod) {
    subHeaderHtml = `<p class="report-subtitle">Kỳ báo cáo: <strong>${config.reportPeriod}</strong></p>`;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="utf-8" />
      <title>${config.title} - In Báo Cáo</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm 12mm 10mm 12mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        html, body {
          margin: 0;
          padding: 0;
          background: #334155;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          font-size: 12px;
          line-height: 1.4;
        }
        .screen-toolbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #0f172a;
          color: #f8fafc;
          padding: 10px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .screen-toolbar .title {
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .screen-toolbar .actions {
          display: flex;
          gap: 10px;
        }
        .btn-print {
          background: #0284c7;
          color: white;
          border: none;
          padding: 7px 16px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-print:hover { background: #0369a1; }
        .btn-close {
          background: #475569;
          color: white;
          border: none;
          padding: 7px 14px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
        }
        .btn-close:hover { background: #64748b; }

        /* A4 Page Container on Screen */
        .a4-page-container {
          padding: 20px 0 40px 0;
          display: flex;
          justify-content: center;
        }
        .a4-sheet {
          width: 210mm;
          min-height: 297mm;
          background: #ffffff;
          padding: 12mm 15mm;
          box-shadow: 0 8px 30px rgba(0,0,0,0.35);
          border-radius: 2px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0284c7;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        .brand-name {
          font-size: 15px;
          font-weight: 800;
          color: #0284c7;
          text-transform: uppercase;
          letter-spacing: -0.3px;
        }
        .brand-info {
          font-size: 10px;
          color: #64748b;
          margin-top: 2px;
          line-height: 1.35;
        }
        .report-meta {
          text-align: right;
          font-size: 10px;
          color: #475569;
          line-height: 1.35;
        }
        .report-title {
          text-align: center;
          margin: 10px 0 6px 0;
        }
        .report-title h1 {
          font-size: 18px;
          font-weight: 800;
          margin: 0;
          color: #0f172a;
          letter-spacing: -0.3px;
          text-transform: uppercase;
        }
        .report-subtitle {
          font-size: 11px;
          color: #64748b;
          margin: 3px 0 0 0;
          font-style: italic;
        }
        .kpi-grid {
          display: grid;
          gap: 10px;
          margin: 12px 0 10px 0;
        }
        .kpi-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-top: 3px solid #0284c7;
          border-radius: 6px;
          padding: 6px 10px;
        }
        .kpi-label {
          font-size: 9.5px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .kpi-value {
          font-size: 15px;
          font-weight: 800;
          margin-top: 2px;
          white-space: nowrap;
        }
        table.data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 10.5px;
        }
        table.data-table th {
          background: #f1f5f9;
          color: #0f172a;
          font-weight: 700;
          padding: 6px 7px;
          border: 1px solid #cbd5e1;
          text-transform: uppercase;
          font-size: 10px;
        }
        table.data-table td {
          padding: 5.5px 7px;
          border: 1px solid #e2e8f0;
          color: #1e293b;
        }
        table.data-table tbody tr:nth-child(even) {
          background: #f8fafc;
        }
        .align-left { text-align: left; }
        .align-center { text-align: center; }
        .align-right { text-align: right; }

        .summary-wrapper {
          display: flex;
          justify-content: flex-end;
          margin-top: 8px;
        }
        .summary-card {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-top: 2px solid #0284c7;
          border-radius: 4px;
          padding: 6px 12px;
          display: inline-flex;
          flex-direction: column;
          gap: 4px;
          min-width: 240px;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .sum-label {
          font-size: 10.5px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
        }
        .sum-value {
          font-size: 12px;
          font-weight: 800;
          color: #0284c7;
        }

        .signatures-grid {
          margin-top: 22px;
          display: flex;
          justify-content: space-between;
          page-break-inside: avoid;
        }
        .signature-box {
          text-align: center;
          padding: 0 4px;
        }
        .sig-title {
          font-size: 11px;
          font-weight: 700;
          color: #0f172a;
          text-transform: uppercase;
        }
        .sig-subtitle {
          font-size: 9.5px;
          color: #64748b;
          font-style: italic;
          margin-top: 1px;
        }
        .sig-space {
          height: 48px;
        }

        .footer-note {
          margin-top: 15px;
          padding-top: 6px;
          border-top: 1px dashed #cbd5e1;
          font-size: 9px;
          color: #94a3b8;
          display: flex;
          justify-content: space-between;
        }

        @media print {
          .screen-toolbar { display: none !important; }
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .a4-page-container {
            padding: 0 !important;
            margin: 0 !important;
          }
          .a4-sheet {
            width: 100% !important;
            min-height: auto !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="screen-toolbar">
        <div class="title">
          <span>📄</span>
          <span>Bản xem trước A4: <strong>${config.title}</strong></span>
        </div>
        <div class="actions">
          <button class="btn-close" onclick="window.close()">Đóng</button>
          <button class="btn-print" onclick="window.print()">🖨️ In Báo Cáo / Lưu PDF</button>
        </div>
      </div>

      <div class="a4-page-container">
        <div class="a4-sheet">
          <div class="sheet-content">
            <div class="header">
              <div>
                <div class="brand-name">HỆ THỐNG NHÀ HÀNG CAO CẤP RESTAURANT PRO</div>
                <div class="brand-info">Địa chỉ: 123 Đường Ẩm Thực, Quận 1, TP. Hồ Chí Minh</div>
                <div class="brand-info">Hotline: 1900 6868 | Email: contact@restaurantpro.vn</div>
              </div>
              <div class="report-meta">
                <div><strong>Mã biên bản:</strong> RP-${new Date().getTime().toString().slice(-6)}</div>
                <div><strong>Ngày lập:</strong> ${formatDateTime(new Date().toISOString())}</div>
                <div><strong>Người lập:</strong> ${config.preparedBy || 'Quản lý hệ thống'}</div>
              </div>
            </div>

            <div class="report-title">
              <h1>${config.title}</h1>
              ${subHeaderHtml}
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
          </div>

          <div class="footer-note">
            <span>Báo cáo được khởi tạo tự động từ hệ thống Quản lý Nhà hàng SOA Restaurant Microservices</span>
            <span>Trang 1/1</span>
          </div>
        </div>
      </div>

      <script>
        // Tự động mở hộp thoại in sau khi trang load
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 350);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
