import { useState } from 'react';
import { FileDown, FileJson, FileText } from 'lucide-react';
import { exportToCSV, downloadCSV, downloadJSON, exportToPDF, getTimestampedFilename } from '@/lib/exportUtils';

export default function ExportButton({ data, filename = 'export', columns = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const csv = exportToCSV(data, columns);
      const filenameWithDate = getTimestampedFilename(filename, 'csv');
      downloadCSV(csv, filenameWithDate);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV');
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      setIsExporting(true);
      const filenameWithDate = getTimestampedFilename(filename, 'json');
      downloadJSON(data, filenameWithDate);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Failed to export JSON');
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      exportToPDF(data, filename, filename.charAt(0).toUpperCase() + filename.slice(1));
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF');
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting || !data || data.length === 0}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        <FileDown size={20} />
        Export
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b disabled:opacity-50"
          >
            <FileText size={18} className="text-blue-600" />
            <div>
              <div className="font-semibold">Export CSV</div>
              <div className="text-xs text-gray-500">Excel, Sheets compatible</div>
            </div>
          </button>

          <button
            onClick={handleExportJSON}
            disabled={isExporting}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b disabled:opacity-50"
          >
            <FileJson size={18} className="text-green-600" />
            <div>
              <div className="font-semibold">Export JSON</div>
              <div className="text-xs text-gray-500">Raw data format</div>
            </div>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 disabled:opacity-50"
          >
            <FileDown size={18} className="text-red-600" />
            <div>
              <div className="font-semibold">Export PDF</div>
              <div className="text-xs text-gray-500">Print or save as PDF</div>
            </div>
          </button>

          {isExporting && (
            <div className="px-4 py-3 text-center text-sm text-gray-600 bg-gray-50 rounded-b-lg">
              Exporting...
            </div>
          )}
        </div>
      )}

      {/* Close on outside click */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Data info */}
      {data && data.length > 0 && (
        <div className="text-xs text-gray-500 mt-1">
          {data.length} record{data.length !== 1 ? 's' : ''} ready to export
        </div>
      )}
    </div>
  );
}
