export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) return "";
          const stringValue = String(value);
          if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export function exportToExcel(data: Record<string, any>[], filename: string) {
  const headers = Object.keys(data[0]);
  let xml = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
  xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">';
  xml += "<Worksheet ss:Name=\"Sheet1\"><Table>";

  xml += "<Row>";
  headers.forEach((header) => {
    xml += `<Cell><Data ss:Type="String">${escapeXml(header)}</Data></Cell>`;
  });
  xml += "</Row>";

  data.forEach((row) => {
    xml += "<Row>";
    headers.forEach((header) => {
      const value = row[header];
      const type = typeof value === "number" ? "Number" : "String";
      xml += `<Cell><Data ss:Type="${type}">${escapeXml(String(value ?? ""))}</Data></Cell>`;
    });
    xml += "</Row>";
  });

  xml += "</Table></Worksheet></Workbook>";

  const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function exportToPDF(
  element: HTMLElement,
  filename: string,
  options?: {
    title?: string;
    orientation?: "portrait" | "landscape";
  }
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const { title = filename, orientation = "portrait" } = options || {};

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        @page { size: A4 ${orientation}; margin: 20mm; }
        body { font-family: system-ui, -apple-system, sans-serif; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${element.innerHTML}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            window.close();
          }, 500);
        };
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();
}

export function exportChartToPNG(
  svgElement: SVGElement,
  filename: string,
  options?: {
    width?: number;
    height?: number;
    backgroundColor?: string;
  }
) {
  const { width = 800, height = 400, backgroundColor = "#111111" } = options || {};

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = width;
  canvas.height = height;

  const img = new Image();
  img.onload = () => {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
}

export function useExport() {
  return {
    exportToCSV,
    exportToExcel,
    exportToPDF,
    exportChartToPNG,
  };
}

export function getExportFileName(prefix: string, type: string): string {
  const date = new Date();
  const dateStr = date.toISOString().split("T")[0];
  return `${prefix}-${type}-${dateStr}`;
}
