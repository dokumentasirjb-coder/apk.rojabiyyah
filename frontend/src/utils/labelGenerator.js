import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

/**
 * Generate a QR Code Data URL (PNG/Base64)
 * @param {string} text - text to encode
 * @param {number} size - width/height in px
 * @returns {Promise<string>} data URL
 */
export async function generateQrDataUrl(text, size = 160) {
  try {
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    return '';
  }
}

/**
 * Generate a Barcode SVG string
 * @param {string} text - text to encode in barcode (Code128)
 * @param {object} options
 * @returns {string} SVG data URL
 */
export function generateBarcodeDataUrl(text, options = {}) {
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, text, {
      format: 'CODE128',
      width: options.width || 1.8,
      height: options.height || 40,
      displayValue: options.displayValue !== undefined ? options.displayValue : true,
      fontSize: options.fontSize || 10,
      margin: options.margin || 2,
      background: '#ffffff',
      lineColor: '#000000',
    });
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Failed to generate Barcode:', err);
    return '';
  }
}

