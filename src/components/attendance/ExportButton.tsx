import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import { toast } from '@/lib/toast-api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ExportButtonProps {
  data: any[];
  filename: string;
  type: 'daily' | 'monthly';
}

export const ExportButton = ({ data, filename, type }: ExportButtonProps) => {
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(18);
      doc.text('ERP One - Attendance Report', 14, 20);
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
      
      // Prepare table data based on type
      let headers: string[] = [];
      let rows: any[][] = [];

      if (type === 'daily') {
        headers = ['Name', 'IC Number', 'Phone', 'Status', 'Check In', 'Check Out', 'Hours'];
        rows = data.map(record => [
          record.employees?.full_name || 'N/A',
          record.employees?.ic_number || 'N/A',
          record.employees?.phone || 'N/A',
          record.status || 'N/A',
          record.clock_in_time ? new Date(record.clock_in_time).toLocaleTimeString() : '-',
          record.clock_out_time ? new Date(record.clock_out_time).toLocaleTimeString() : '-',
          record.hours_worked || '0',
        ]);
      } else {
        headers = ['Name', 'IC Number', 'Present', 'Absent', 'Late', 'Rate (%)', 'Total Hours'];
        rows = data.map(record => [
          record.employee_name,
          record.ic_number,
          record.present_days.toString(),
          record.absent_days.toString(),
          record.late_count.toString(),
          record.attendance_rate.toFixed(1) + '%',
          record.total_hours.toFixed(2),
        ]);
      }

      // Add table
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 35,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [95, 38, 180] },
      });

      doc.save(`${filename}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    }
  };

  const exportToExcel = () => {
    try {
      let worksheetData: any[] = [];

      if (type === 'daily') {
        worksheetData = data.map(record => ({
          Name: record.employees?.full_name || 'N/A',
          'IC Number': record.employees?.ic_number || 'N/A',
          Phone: record.employees?.phone || 'N/A',
          Status: record.status || 'N/A',
          'Check In': record.clock_in_time ? new Date(record.clock_in_time).toLocaleString() : '-',
          'Check Out': record.clock_out_time ? new Date(record.clock_out_time).toLocaleString() : '-',
          'Hours Worked': record.hours_worked || '0',
        }));
      } else {
        worksheetData = data.map(record => ({
          Name: record.employee_name,
          'IC Number': record.ic_number,
          Phone: record.phone,
          Site: record.site_name,
          'Present Days': record.present_days,
          'Absent Days': record.absent_days,
          'Late Count': record.late_count,
          'Attendance Rate (%)': record.attendance_rate.toFixed(1),
          'Total Hours': record.total_hours.toFixed(2),
        }));
      }

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');

      XLSX.writeFile(workbook, `${filename}.xlsx`);
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('Failed to export Excel file');
    }
  };

  const exportToCSV = () => {
    try {
      let csvContent = '';

      if (type === 'daily') {
        csvContent = 'Name,IC Number,Phone,Status,Check In,Check Out,Hours Worked\n';
        csvContent += data
          .map(record =>
            [
              record.employees?.full_name || 'N/A',
              record.employees?.ic_number || 'N/A',
              record.employees?.phone || 'N/A',
              record.status || 'N/A',
              record.clock_in_time ? new Date(record.clock_in_time).toLocaleString() : '-',
              record.clock_out_time ? new Date(record.clock_out_time).toLocaleString() : '-',
              record.hours_worked || '0',
            ]
              .map(field => `"${field}"`)
              .join(',')
          )
          .join('\n');
      } else {
        csvContent = 'Name,IC Number,Phone,Site,Present Days,Absent Days,Late Count,Attendance Rate (%),Total Hours\n';
        csvContent += data
          .map(record =>
            [
              record.employee_name,
              record.ic_number,
              record.phone,
              record.site_name,
              record.present_days,
              record.absent_days,
              record.late_count,
              record.attendance_rate.toFixed(1),
              record.total_hours.toFixed(2),
            ]
              .map(field => `"${field}"`)
              .join(',')
          )
          .join('\n');
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      link.click();

      toast.success('CSV file downloaded successfully');
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export CSV file');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>
          <File className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
