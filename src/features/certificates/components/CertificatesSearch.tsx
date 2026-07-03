import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileDown, Award, CheckCircle, ShieldAlert, AlertCircle, Loader2, FileImage } from 'lucide-react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { fetchCertificatesByDocNumber, incrementCertificateDownloads } from '../../../lib/supabase';

// Helper to wrap text inside canvas
function drawTextWithWrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  const lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  const totalHeight = (lines.length - 1) * lineHeight;
  let currentY = y - totalHeight / 2;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, currentY);
    currentY += lineHeight;
  }
}

// Helper to draw a clean, professional QR code onto the canvas
function drawProfessionalQR(
  ctx: CanvasRenderingContext2D,
  xPx: number,
  yPx: number,
  qrSize: number,
  color: string,
  qrValue: string,
  label: string
) {
  try {
    const qr = QRCode.create(qrValue, { errorCorrectionLevel: "M" });
    const gridCount = qr.modules.size;
    const qrData = qr.modules.data;
    const moduleSize = qrSize / gridCount;

    const qrX = xPx - qrSize / 2;
    const qrY = yPx - qrSize / 2;

    // Draw background white box
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(qrX, qrY, qrSize, qrSize);

    // Draw dark modules
    ctx.fillStyle = color;
    for (let r = 0; r < gridCount; r++) {
      for (let c = 0; c < gridCount; c++) {
        const isDark = qrData[r * gridCount + c] === 1;
        if (isDark) {
          ctx.fillRect(
            Math.round(qrX + c * moduleSize),
            Math.round(qrY + r * moduleSize),
            Math.ceil(moduleSize),
            Math.ceil(moduleSize)
          );
        }
      }
    }

    // Draw validation code underneath the QR code
    ctx.font = `12px monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(label, xPx, qrY + qrSize + 18);
  } catch (err) {
    console.error("Error generating QR code on canvas:", err);
  }
}

export const CertificatesSearch: React.FC = () => {
  const [docType, setDocType] = useState<'DNI' | 'PASAPORTE' | 'CARNET_EXTRANJERIA'>('DNI');
  const [docNumber, setDocNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'png' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber.trim()) return;

    setLoading(true);
    setSearched(true);
    setErrorMsg(null);
    try {
      const results = await fetchCertificatesByDocNumber(docNumber.trim());
      setCertificates(results);
    } catch (err) {
      console.error(err);
      setErrorMsg("Ocurrió un error al buscar los certificados. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (result: any, format: 'pdf' | 'png') => {
    const cert = result.certificate;
    const template = result.template;
    const participantName = result.participantName;

    if (!template || !template.background_image_url) {
      alert("La plantilla del certificado no tiene una imagen de fondo válida.");
      return;
    }

    setDownloadingId(cert.id);
    setDownloadFormat(format);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = template.background_image_url;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Error al cargar la imagen de fondo del certificado."));
      });

      const canvas = document.createElement("canvas");
      const schema = template.design_schema || {};
      const width = schema.width || 1414;
      const height = schema.height || 1000;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No se pudo obtener el contexto 2D del canvas.");

      ctx.drawImage(img, 0, 0, width, height);

      // Draw design elements
      const elements = schema.elements || [];
      elements.forEach((el: any) => {
        if (el.id === "qr" && !el.showQr) return;

        const xPx = (el.x / 100) * width;
        const yPx = (el.y / 100) * height;

        if (el.id === "qr" && el.showQr) {
          const qrSize = el.qrSize || 120;
          const validationCode = cert.validation_code;
          // QR points to the public portal's validation page
          const validationUrl = `${window.location.origin}/validar/${validationCode}`;
          drawProfessionalQR(ctx, xPx, yPx, qrSize, el.color || "#000000", validationUrl, validationCode);
          return;
        }

        const weight = el.fontWeight === "bold" ? "bold" : "normal";
        ctx.font = `${weight} ${el.fontSize}px "${el.fontFamily || "sans-serif"}"`;
        ctx.fillStyle = el.color || "#000000";
        ctx.textAlign = el.align || "center";

        let text = el.text || "";
        if (text.includes("{{name}}")) {
          text = text.replace("{{name}}", participantName.toUpperCase());
        }
        if (text.includes("{{date}}")) {
          const issuedDate = cert.issued_at ? new Date(cert.issued_at) : new Date();
          text = text.replace("{{date}}", issuedDate.toLocaleDateString("es-ES", {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }));
        }

        const isAuto = el.autoWidth ?? true;
        if (isAuto) {
          ctx.fillText(text, xPx, yPx);
        } else {
          const elMaxWidth = ((el.maxWidth || 80) / 100) * width;
          const lineHeight = el.fontSize * 1.25;
          drawTextWithWrap(ctx, text, xPx, yPx, elMaxWidth, lineHeight);
        }
      });

      if (format === 'png') {
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `CERTIFICADO-${cert.validation_code}.png`;
        link.href = dataUrl;
        link.click();
      } else {
        const pageSize = schema.pageSize || "a4";
        const doc = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: pageSize
        });
        const imgData = canvas.toDataURL("image/png");
        const pdfWidth = pageSize === "a5" ? 210 : 297;
        const pdfHeight = pageSize === "a5" ? 148.5 : 210;
        doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        doc.save(`CERTIFICADO-${cert.validation_code}.pdf`);
      }

      // Record download audit logs
      await incrementCertificateDownloads(cert.id, cert.downloads_count || 0, {
        ipAddress: "127.0.0.1",
        userAgent: navigator.userAgent
      });

      // Update count locally
      setCertificates(prev => prev.map(item => {
        if (item.certificate.id === cert.id) {
          return {
            ...item,
            certificate: {
              ...item.certificate,
              downloads_count: (item.certificate.downloads_count || 0) + 1
            }
          };
        }
        return item;
      }));

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error al descargar el certificado.");
    } finally {
      setDownloadingId(null);
      setDownloadFormat(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12">
      {/* Header Info */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-secondary uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-full">
          Consulta Digital de Diplomas
        </span>
        <h1 className="font-display text-4xl sm:text-5xl text-white font-extrabold tracking-tight">
          Descarga de Certificados
        </h1>
        <p className="text-sm sm:text-base text-light/75 leading-relaxed">
          Ingrese su número de documento de identidad para buscar, verificar y descargar sus certificados oficiales firmados digitalmente por la EPG UNAP.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-[#0c1f17]/55 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow decorative */}
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="docType" className="text-xs font-bold text-light/50 uppercase tracking-wider block">
                Tipo de Documento
              </label>
              <select
                id="docType"
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm font-medium text-light focus:outline-none focus:border-secondary transition-all cursor-pointer"
              >
                <option value="DNI" className="bg-[#07140f] text-light">DNI (Perú)</option>
                <option value="PASAPORTE" className="bg-[#07140f] text-light">Pasaporte</option>
                <option value="CARNET_EXTRANJERIA" className="bg-[#07140f] text-light">Carnet de Extranjería</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label htmlFor="docNumber" className="text-xs font-bold text-light/50 uppercase tracking-wider block">
                Número de Documento
              </label>
              <div className="relative">
                <input
                  id="docNumber"
                  type="text"
                  placeholder="Ingrese el número de su documento"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full h-12 bg-black/40 border border-white/10 rounded-xl pl-4 pr-12 text-sm font-semibold text-light focus:outline-none focus:border-secondary transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !docNumber.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 size-8 bg-primary hover:bg-secondary disabled:bg-white/10 disabled:text-white/30 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Buscar certificados"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 space-y-4"
            >
              <Loader2 className="size-10 text-secondary animate-spin mx-auto" />
              <p className="text-sm font-medium text-light/60">Buscando certificados emitidos...</p>
            </motion.div>
          ) : errorMsg ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-center text-destructive flex flex-col items-center gap-3"
            >
              <ShieldAlert className="size-8" />
              <p className="text-sm font-bold">{errorMsg}</p>
            </motion.div>
          ) : searched && certificates.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white/5 border border-white/5 rounded-3xl p-12 text-center space-y-4 flex flex-col items-center"
            >
              <div className="size-16 bg-white/5 rounded-2xl flex items-center justify-center text-light/40">
                <AlertCircle className="size-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-lg text-white">No se encontraron certificados</h3>
                <p className="text-sm text-light/60 max-w-md mx-auto leading-relaxed">
                  No hemos encontrado certificados emitidos y activos asociados al número de documento <span className="font-mono font-bold text-white">{docNumber}</span>.
                </p>
              </div>
              <p className="text-xs text-light/40 leading-normal max-w-sm">
                Recuerde que los certificados se habilitan gradualmente tras validar el pago de la certificación y el 80% de asistencia.
              </p>
            </motion.div>
          ) : searched && certificates.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {certificates.map((res, index) => {
                const isDownloading = downloadingId === res.certificate.id;
                return (
                  <motion.div
                    key={res.certificate.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-[#0b1b14]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Glowing effect inside card */}
                    <div className="absolute -bottom-10 -right-10 w-[150px] h-[150px] bg-secondary/5 rounded-full blur-[60px] pointer-events-none" />

                    <div className="space-y-4">
                      {/* Top Row: Event name & badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">
                            {res.editionName} - {res.year}
                          </span>
                          <h3 className="font-display font-black text-white text-base leading-snug mt-1">
                            {res.eventName}
                          </h3>
                        </div>
                        <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-secondary shrink-0">
                          <Award className="size-5" />
                        </div>
                      </div>

                      {/* Validation text requested by user */}
                      <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-emerald-450 font-bold">
                          <CheckCircle className="size-3.5" />
                          <span>Certificación Validada y Oficial</span>
                        </div>
                        <p className="text-light/75 leading-relaxed">
                          La Escuela de Postgrado de la UNAP acredita formalmente que <span className="font-bold text-white">{res.participantName}</span> cumplió con todos los requisitos académicos y de asistencia vigentes para el otorgamiento del diploma de <span className="font-semibold text-secondary lowercase">{res.template.name}</span>.
                        </p>
                        <div className="flex justify-between items-center text-[10px] text-light/45 pt-1 border-t border-white/5">
                          <span>Código: <strong className="font-mono text-white/70">{res.certificate.validation_code}</strong></span>
                          <span>Descargas: {res.certificate.downloads_count || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-6">
                      <button
                        onClick={() => handleDownload(res, 'pdf')}
                        disabled={isDownloading}
                        className="flex-1 h-10 bg-primary hover:bg-secondary disabled:bg-white/10 disabled:text-white/40 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer shadow-md shadow-primary/10 animate-hover"
                      >
                        {isDownloading && downloadFormat === 'pdf' ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            Generando PDF...
                          </>
                        ) : (
                          <>
                            <FileDown className="size-3.5" />
                            Descargar PDF
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDownload(res, 'png')}
                        disabled={isDownloading}
                        className="h-10 px-4 bg-white/5 hover:bg-white/10 disabled:bg-white/5 disabled:text-white/30 border border-white/10 hover:border-white/20 text-light rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer"
                      >
                        {isDownloading && downloadFormat === 'png' ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <>
                            <FileImage className="size-3.5" />
                            PNG
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};
