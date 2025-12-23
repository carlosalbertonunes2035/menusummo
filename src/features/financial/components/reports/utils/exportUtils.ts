// --- Helper: Date Formatting ---
export const formatDateForInput = (date: Date): string => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// --- Helper: CSV Generation ---
export const generateCSV = (data: any[], headers: Record<string, string>): string => {
    const headerRow = Object.values(headers).join(',') + '\n';
    const bodyRows = data.map(row => {
        return Object.keys(headers).map(key => {
            const value = row[key];
            if (typeof value === 'string') {
                return `"${value.replace(/"/g, '""')}"`;
            }
            if (typeof value === 'number') {
                return value.toFixed(2);
            }
            return value;
        }).join(',');
    }).join('\n');
    return headerRow + bodyRows;
};

export const downloadCSV = (csvString: string, filename: string) => {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
