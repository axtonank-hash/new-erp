/**
 * Export Utilities - Convert data to CSV and PDF formats
 */

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Data to export
 * @param {Array} columns - Column names to include
 * @returns {string} CSV formatted string
 */
export const exportToCSV = (data, columns = null) => {
  if (!data || data.length === 0) {
    return '';
  }

  // Get columns from first object if not provided
  const csvColumns = columns || Object.keys(data[0]);

  // Create header
  const header = csvColumns.map(col => `"${col}"`).join(',');

  // Create rows
  const rows = data.map(item =>
    csvColumns
      .map(col => {
        let value = item[col] || '';
        // Escape quotes and wrap in quotes
        value = String(value).replace(/"/g, '""');
        return `"${value}"`;
      })
      .join(',')
  );

  return [header, ...rows].join('\n');
};

/**
 * Download CSV file
 * @param {string} csvContent - CSV content string
 * @param {string} filename - Name of file to download
 */
export const downloadCSV = (csvContent, filename = 'export.csv') => {
  const link = document.createElement('a');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

/**
 * Convert data to JSON and download
 * @param {Array} data - Data to export
 * @param {string} filename - Name of file to download
 */
export const downloadJSON = (data, filename = 'export.json') => {
  const link = document.createElement('a');
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

/**
 * Generate simple HTML table for PDF export
 * @param {Array} data - Data to export
 * @param {string} title - Title for the document
 * @param {Array} columns - Columns to include
 * @returns {string} HTML string
 */
export const generateHTMLTable = (data, title = 'Report', columns = null) => {
  if (!data || data.length === 0) {
    return '<p>No data to export</p>';
  }

  const csvColumns = columns || Object.keys(data[0]);
  const date = new Date().toLocaleDateString();

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .date { color: #666; font-size: 12px; }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 20px;
        }
        th { 
          background-color: #4CAF50; 
          color: white; 
          padding: 12px; 
          text-align: left;
          border: 1px solid #ddd;
        }
        td { 
          padding: 10px; 
          border: 1px solid #ddd;
        }
        tr:nth-child(even) { 
          background-color: #f2f2f2; 
        }
        tr:hover { 
          background-color: #e0e0e0; 
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p class="date">Generated on: ${date}</p>
      <table>
        <thead>
          <tr>
            ${csvColumns.map(col => `<th>${col}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              item => `
            <tr>
              ${csvColumns
                .map(col => `<td>${item[col] || '-'}</td>`)
                .join('')}
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  return html;
};

/**
 * Print HTML content (for PDF via browser print)
 * @param {string} htmlContent - HTML to print
 * @param {string} title - Document title
 */
export const printHTML = (htmlContent, title = 'Document') => {
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write(htmlContent);
  printWindow.document.title = title;
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
  }, 250);
};

/**
 * Export to PDF using print dialog
 * @param {Array} data - Data to export
 * @param {string} filename - Name for the file
 * @param {string} title - Title for the document
 */
export const exportToPDF = (data, filename = 'export', title = 'Report') => {
  const htmlContent = generateHTMLTable(data, title);
  printHTML(htmlContent, filename);
};

/**
 * Get formatted filename with timestamp
 * @param {string} basename - Base name for file
 * @param {string} extension - File extension
 * @returns {string} Formatted filename
 */
export const getTimestampedFilename = (basename, extension = 'csv') => {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${basename}_${timestamp}.${extension}`;
};
