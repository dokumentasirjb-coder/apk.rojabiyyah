import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

/**
 * Generate Excel buffer from columns and rows
 */
export const generateExcel = async ({ title, sheetName = 'Sheet1', columns, rows }) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Administrasi Rojabiyyaah';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName);

  // Title Row
  worksheet.mergeCells('A1', `${String.fromCharCode(64 + columns.length)}1`);
  const titleCell = worksheet.getCell('A1');
  titleCell.value = title.toUpperCase();
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4338CA' }, // Indigo-700
  };
  worksheet.getRow(1).height = 35;

  // Subtitle / Date Row
  worksheet.mergeCells('A2', `${String.fromCharCode(64 + columns.length)}2`);
  const dateCell = worksheet.getCell('A2');
  dateCell.value = `Dicetak pada: ${new Date().toLocaleString('id-ID')}`;
  dateCell.font = { name: 'Arial', size: 10, italic: true };
  dateCell.alignment = { horizontal: 'center' };
  worksheet.getRow(2).height = 20;

  // Header Row
  const headerRow = worksheet.getRow(4);
  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }, // Slate-800
    };
    worksheet.getColumn(idx + 1).width = col.width || 20;
  });
  headerRow.height = 25;

  // Data Rows
  rows.forEach((row, rowIndex) => {
    const currentRow = worksheet.getRow(5 + rowIndex);
    columns.forEach((col, colIndex) => {
      const cell = currentRow.getCell(colIndex + 1);
      cell.value = row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : '-';
      cell.alignment = { vertical: 'middle', horizontal: col.align || 'left' };
      // Zebra striping
      if (rowIndex % 2 === 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' },
        };
      }
    });
    currentRow.height = 22;
  });

  return await workbook.xlsx.writeBuffer();
};

/**
 * Generate PDF buffer for reports
 */
export const generatePDF = ({ title, subtitle, columns, rows }) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.rect(40, 40, doc.page.width - 80, 50).fill('#4338CA');
      doc.fillColor('#FFFFFF')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(title.toUpperCase(), 40, 50, { align: 'center' });
      
      doc.fontSize(10)
        .font('Helvetica')
        .text(subtitle || `Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 40, 70, { align: 'center' });

      doc.moveDown(3);

      // Simple Table layout
      let startY = 110;
      const colWidth = (doc.page.width - 80) / columns.length;

      // Table Header
      doc.rect(40, startY, doc.page.width - 80, 25).fill('#1E293B');
      doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold');
      columns.forEach((col, i) => {
        doc.text(col.header, 45 + (i * colWidth), startY + 7, { width: colWidth - 10, align: col.align || 'left' });
      });

      startY += 25;
      doc.font('Helvetica').fontSize(9);

      rows.forEach((row, rowIndex) => {
        if (startY > doc.page.height - 60) {
          doc.addPage();
          startY = 40;
        }

        const isEven = rowIndex % 2 === 0;
        if (!isEven) {
          doc.rect(40, startY, doc.page.width - 80, 20).fill('#F8FAFC');
        }

        doc.fillColor('#0F172A');
        columns.forEach((col, i) => {
          const val = String(row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : '-');
          doc.text(val, 45 + (i * colWidth), startY + 5, { width: colWidth - 10, align: col.align || 'left', lineBreak: false });
        });

        startY += 20;
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

