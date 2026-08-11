import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportCatToPdf(cat, element) {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
  });

  const img = canvas.toDataURL('image/jpeg', 0.95);

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();   // 210
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297

  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  if (imgHeight <= pageHeight) {
    pdf.addImage(img, 'JPEG', 0, 0, pageWidth, imgHeight);
  } else {
    // если паспорт выше страницы — вписываем по высоте и центрируем
    const fittedWidth = (canvas.width * pageHeight) / canvas.height;
    pdf.addImage(
      img,
      'JPEG',
      (pageWidth - fittedWidth) / 2,
      0,
      fittedWidth,
      pageHeight
    );
  }

  const safeName = (cat.name || 'cat').replace(/[\\/:*?"<>|]/g, '_');
  pdf.save(`${safeName}.pdf`);
}