import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Printer,
  Calendar,
  Users,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  Download,
  Copy,
  Check,
  Heart,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Reservation } from '../../types';
import { useApp } from '../../context/AppContext';

interface ReservationReceiptModalProps {
  reservation: Reservation;
  onClose: () => void;
}

export const ReservationReceiptModal: React.FC<ReservationReceiptModalProps> = ({
  reservation,
  onClose,
}) => {
  const { brandingConfig, showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  const localName = brandingConfig?.companyName || 'PLEGMA GASTRONOMÍA';
  const localAddress = brandingConfig?.address || 'Av. Principal 1234, Centro';
  const localPhone = brandingConfig?.phone || '+54 9 11 4455-6677';

  const handlePrint = () => {
    window.print();
  };

  // WhatsApp plain text format
  const whatsappMessage = `📅 *CONFIRMACIÓN DE RESERVA* 📅
🏢 *${localName}*
📍 ${localAddress}
📞 Tel: ${localPhone}

👤 *Cliente:* ${reservation.clientName}
🆔 *Reserva N°:* #${reservation.id.slice(-6).toUpperCase()}
📆 *Fecha y Hora:* ${reservation.dateTime}
👥 *Comensales:* ${reservation.guestsCount} personas
🪑 *Mesa Asignada:* ${reservation.tableName}
${reservation.notes ? `📝 *Observaciones:* ${reservation.notes}\n` : ''}
💡 *Consejos para su visita:*
• Les solicitamos llegar a tiempo (tolerancia de 15 minutos).
• En caso de modificación en la cantidad de comensales o cancelación, por favor avisarnos con anticipación.

❤️ *¡Gracias por elegirnos, los esperamos!*`;

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    showToast('Mensaje formateado para WhatsApp copiado al portapapeles.', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const rawPhone = reservation.clientPhone ? reservation.clientPhone.replace(/\D/g, '') : '';
    const encodedText = encodeURIComponent(whatsappMessage);
    const url = rawPhone
      ? `https://wa.me/${rawPhone}?text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(url, '_blank');
  };

  // Render visual card to HTML5 Canvas and download PNG
  const handleDownloadImage = () => {
    try {
      setGeneratingImage(true);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 800;
      canvas.height = 980;

      // 1. Background
      ctx.fillStyle = '#0f172a'; // slate-900
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Card Container
      const pad = 30;
      const cardW = canvas.width - pad * 2;
      const cardH = canvas.height - pad * 2;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(pad, pad, cardW, cardH, 24);
      ctx.fill();

      // 2. Header banner (Dark gradient)
      const grad = ctx.createLinearGradient(pad, pad, pad + cardW, pad + 140);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(pad, pad, cardW, 140, [24, 24, 0, 0]);
      ctx.fill();

      // Local Logo Circle
      ctx.fillStyle = '#f59e0b'; // amber-500
      ctx.beginPath();
      ctx.arc(pad + 60, pad + 70, 36, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(localName.charAt(0).toUpperCase(), pad + 60, pad + 70);

      // Local Title
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(localName.toUpperCase(), pad + 115, pad + 45);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.fillText(`${localAddress} | Tel: ${localPhone}`, pad + 115, pad + 80);

      // Status Badge
      ctx.fillStyle = '#dcfce7'; // emerald-100
      ctx.beginPath();
      ctx.roundRect(pad + cardW - 200, pad + 45, 170, 36, 18);
      ctx.fill();

      ctx.fillStyle = '#166534'; // emerald-800
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✔ RESERVA CONFIRMADA', pad + cardW - 115, pad + 56);

      // 3. Client Box
      let y = pad + 170;
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(pad + 30, y, cardW - 60, 100, 16);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('TITULAR DE LA RESERVA', pad + 50, y + 20);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(reservation.clientName, pad + 50, y + 42);

      if (reservation.clientPhone) {
        ctx.fillStyle = '#475569';
        ctx.font = '14px sans-serif';
        ctx.fillText(`Teléfono: ${reservation.clientPhone}`, pad + 50, y + 72);
      }

      ctx.textAlign = 'right';
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`ID: #${reservation.id.slice(-6).toUpperCase()}`, pad + cardW - 50, y + 20);

      // 4. Details Grid (Fecha, Pax, Mesa)
      y += 120;
      const boxW = (cardW - 60 - 20) / 3;

      // Box 1: Fecha y Hora
      ctx.fillStyle = '#eef2ff';
      ctx.strokeStyle = '#c7d2fe';
      ctx.beginPath();
      ctx.roundRect(pad + 30, y, boxW, 110, 16);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#4338ca';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('FECHA Y HORA', pad + 30 + boxW / 2, y + 22);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(reservation.dateTime, pad + 30 + boxW / 2, y + 58);

      // Box 2: Pax
      ctx.fillStyle = '#ecfdf5';
      ctx.strokeStyle = '#a7f3d0';
      ctx.beginPath();
      ctx.roundRect(pad + 30 + boxW + 10, y, boxW, 110, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#047857';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('COMENSALES', pad + 30 + boxW + 10 + boxW / 2, y + 22);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`${reservation.guestsCount} personas`, pad + 30 + boxW + 10 + boxW / 2, y + 58);

      // Box 3: Mesa
      ctx.fillStyle = '#fffbeb';
      ctx.strokeStyle = '#fde68a';
      ctx.beginPath();
      ctx.roundRect(pad + 30 + (boxW + 10) * 2, y, boxW, 110, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('MESA ASIGNADA', pad + 30 + (boxW + 10) * 2 + boxW / 2, y + 22);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(reservation.tableName, pad + 30 + (boxW + 10) * 2 + boxW / 2, y + 58);

      // 5. Notes (if present)
      y += 130;
      if (reservation.notes) {
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.roundRect(pad + 30, y, cardW - 60, 60, 12);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#4338ca';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('OBSERVACIONES:', pad + 45, y + 16);

        ctx.fillStyle = '#334155';
        ctx.font = 'italic 13px sans-serif';
        ctx.fillText(reservation.notes, pad + 45, y + 36);

        y += 75;
      }

      // 6. Consejos Section (REQUERIDO)
      ctx.fillStyle = '#fff7ed'; // orange-50
      ctx.strokeStyle = '#ffedd5'; // orange-100
      ctx.beginPath();
      ctx.roundRect(pad + 30, y, cardW - 60, 140, 18);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#c2410c'; // orange-700
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('💡 CONSEJOS IMPORTANTES PARA SU VISITA', pad + 50, y + 24);

      ctx.fillStyle = '#475569';
      ctx.font = '13px sans-serif';
      ctx.fillText('• Llegar a tiempo: Contamos con una tolerancia máxima de 15 minutos.', pad + 50, y + 58);
      ctx.fillText('• Avisar en caso de modificación de comensales o necesidad de cancelación.', pad + 50, y + 90);

      // 7. Agradecimiento Banner (REQUERIDO)
      y += 160;
      const thankGrad = ctx.createLinearGradient(pad + 30, y, pad + cardW - 30, y + 80);
      thankGrad.addColorStop(0, '#4f46e5');
      thankGrad.addColorStop(1, '#4338ca');
      ctx.fillStyle = thankGrad;
      ctx.beginPath();
      ctx.roundRect(pad + 30, y, cardW - 60, 80, 20);
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('❤️ ¡Gracias por elegirnos, los esperamos!', pad + cardW / 2, y + 32);

      ctx.fillStyle = '#c7d2fe';
      ctx.font = '12px sans-serif';
      ctx.fillText(`Comprobante Oficial | ${localName}`, pad + cardW / 2, y + 56);

      // Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Reserva_${reservation.clientName.replace(/\s+/g, '_')}_${reservation.id.slice(-6)}.png`;
      link.href = dataUrl;
      link.click();

      showToast('Imagen PNG de reserva generada y descargada exitosamente.', 'success');
    } catch (e) {
      showToast('Error al generar la imagen.', 'error');
    } finally {
      setGeneratingImage(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:static print:bg-transparent print:p-0 print:block">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden border border-slate-200 print:shadow-none print:border-none print:max-h-none print:max-w-none print:w-full print:block print:rounded-none">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Comprobante / WhatsApp de Reserva</h3>
              <p className="text-xs text-slate-400">Emisión de datos, tarjeta de imagen y membrete oficial</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Area */}
        <div className="p-6 sm:p-8 space-y-5 text-slate-800 font-sans text-xs bg-white print:p-4">
          {/* Header Branding (Membrete del Local) */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                {localName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="font-black text-base tracking-tight text-slate-900 uppercase">
                  {localName}
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">{localAddress}</p>
                <p className="text-[10px] text-slate-400 font-mono">Tel: {localPhone}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> RESERVA CONFIRMADA
              </span>
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                ID: #{reservation.id.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Client Main Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Titular de la Reserva
              </span>
              <span className="font-mono text-[10px] text-slate-500">Emitido: {reservation.createdAt}</span>
            </div>
            <div>
              <p className="text-base font-black text-slate-900">{reservation.clientName}</p>
              {reservation.clientPhone && (
                <p className="text-xs text-slate-600 font-semibold mt-0.5">Teléfono: {reservation.clientPhone}</p>
              )}
            </div>
          </div>

          {/* Reservation Core Specs Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-center space-y-1">
              <Clock className="w-5 h-5 text-indigo-600 mx-auto" />
              <span className="text-[10px] text-indigo-900 font-bold uppercase block">Fecha y Hora</span>
              <span className="font-black text-slate-900 text-xs block font-mono">{reservation.dateTime}</span>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-center space-y-1">
              <Users className="w-5 h-5 text-emerald-600 mx-auto" />
              <span className="text-[10px] text-emerald-900 font-bold uppercase block">Comensales</span>
              <span className="font-black text-slate-900 text-xs block">{reservation.guestsCount} personas</span>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-2xl text-center space-y-1">
              <MapPin className="w-5 h-5 text-amber-600 mx-auto" />
              <span className="text-[10px] text-amber-900 font-bold uppercase block">Mesa Asignada</span>
              <span className="font-black text-slate-900 text-xs block">{reservation.tableName}</span>
            </div>
          </div>

          {/* Special Notes if present */}
          {reservation.notes && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase block">
                Observaciones & Requerimientos Especiales:
              </span>
              <p className="text-xs text-slate-700 italic">{reservation.notes}</p>
            </div>
          )}

          {/* Observación 2: Sección Consejos */}
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2 text-amber-950">
            <h4 className="font-extrabold text-xs text-amber-900 flex items-center gap-1.5 uppercase">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Consejos para su visita:
            </h4>
            <ul className="text-[11px] space-y-1 list-disc list-inside text-amber-900 font-medium">
              <li>
                <span className="font-bold">Llegar a tiempo:</span> Contamos con una tolerancia máxima de 15 minutos.
              </li>
              <li>
                <span className="font-bold">Avisar modificaciones:</span> Informar con anticipación en caso de cambio de comensales o cancelación.
              </li>
            </ul>
          </div>

          {/* Observación 2: Sección Agradecimiento */}
          <div className="p-3.5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl text-center shadow-sm space-y-0.5">
            <p className="font-black text-sm flex items-center justify-center gap-1.5 text-amber-400">
              <Heart className="w-4 h-4 fill-amber-400 text-amber-400" />
              Gracias por elegirnos, los esperamos
            </p>
            <p className="text-[10px] text-indigo-200 font-medium">
              Presentar este comprobante o su nombre completo al ingresar al local.
            </p>
          </div>

          {/* Footer Validation Notice */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Comprobante Oficial PLEGMA Gastronomía
            </span>
            <span>Registrado por: {reservation.createdByUserName}</span>
          </div>
        </div>

        {/* Observación 2: Actions Bar for WhatsApp & Image Sharing */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              onClick={handleCopyWhatsApp}
              className="flex-1 sm:flex-none border-slate-700 text-slate-200 hover:bg-slate-800 text-xs"
            >
              {copied ? '¡Texto Copiado!' : 'Copiar Texto WA'}
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              leftIcon={<MessageSquare className="w-4 h-4 text-emerald-400" />}
              onClick={handleOpenWhatsApp}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
            >
              Abrir WhatsApp
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={generatingImage}
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleDownloadImage}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold w-full sm:w-auto"
            >
              {generatingImage ? 'Generando PNG...' : 'Descargar Imagen PNG'}
            </Button>

            <Button type="button" variant="secondary" size="sm" onClick={onClose} className="text-xs">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
