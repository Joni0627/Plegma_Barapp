import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Clock, User, FileText } from 'lucide-react';

export const AuditLogModal: React.FC = () => {
  const { auditLogs } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-orange-500" />
          <span>Registro de Auditoría y Trazabilidad Operativa</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Historial inmutable de conteos, cambios de precios, emisiones de pedido y pagos registrados.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <th className="p-3">Fecha / Hora</th>
                <th className="p-3">Usuario</th>
                <th className="p-3">Acción Registrada</th>
                <th className="p-3">Entidad</th>
                <th className="p-3">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No existen registros de auditoría aún.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 font-mono">
                    <td className="p-3 text-slate-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleString('es-AR')}
                    </td>
                    <td className="p-3 font-bold text-slate-800">{log.userName}</td>
                    <td className="p-3 font-extrabold text-orange-600">{log.action}</td>
                    <td className="p-3 text-slate-600 uppercase font-semibold text-[10px]">
                      {log.entityType}
                    </td>
                    <td className="p-3 text-slate-700 font-sans">{log.details || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
