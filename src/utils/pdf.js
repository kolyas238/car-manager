import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportVehicleToPdf(vehicle, node) {
  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: '#ffffff',
  });

  const img = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(img, 'PNG', 0, position, pageWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(img, 'PNG', 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`${vehicle.make}_${vehicle.model}_досье.pdf`);
}