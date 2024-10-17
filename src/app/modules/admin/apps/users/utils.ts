import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export class ExcelExportService {
    public static exportToExcel(
        filename: string,
        data: any[],
        sheetName: string = 'Sheet1'
    ) {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        const excelBuffer: any = XLSX.write(wb, {
            bookType: 'xlsx',
            type: 'array',
        });

        const blob: Blob = new Blob([excelBuffer], {
            type: 'application/octet-stream',
        });

        saveAs(blob, filename);
    }
}

export function isNotImage(url: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const extension = url.split('?')[0].split('.').pop()?.toLowerCase();

    if (extension) {
        return !imageExtensions.includes(extension);
    }
    return true; // Assume it's not an image if no extension is found
}
