import React from 'react';
import { Calendar, Trash2, Edit3, ArrowRight } from 'lucide-react';

function PeriodList({ periods, selectPeriod, deletePeriod, updatePeriod }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">Mis Presupuestos</h2>
        <span className="text-sm text-gray-400">{periods.length} activos</span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {periods.map((period) => {
          // Calculamos porcentaje gastado
          const percent = period.budget > 0 ? Math.min((period.spent / period.budget) * 100, 100) : 0;
          
          return (
            <div 
              key={period.id} 
              onClick={() => selectPeriod(period.id)}
              className="group bg-white dark:bg-[#1e293b] p-6 rounded-[1.5rem] shadow-lg border border-gray-100 dark:border-white/5 cursor-pointer hover:border-emerald-500/50 transition-all relative overflow-hidden"
            >
              {/* Barra lateral con COLOR DINÁMICO */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-2"
                style={{ backgroundColor: period.color || '#10B981' }} // Usa el color elegido o verde por defecto
              ></div>

              <div className="flex justify-between items-start pl-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white uppercase tracking-wide flex items-center gap-2">
                    <Calendar size={20} style={{ color: period.color || '#10B981' }}/>
                    {period.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">Presupuesto asignado</p>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); deletePeriod(period.id); }} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-500">
                        <Trash2 size={18}/>
                    </button>
                </div>
              </div>

              {/* Sección de Dinero */}
              <div className="mt-6 pl-4 grid grid-cols-2 gap-4">
                <div>
                    <span className="block text-xs text-gray-400 uppercase font-bold">Total Presupuesto</span>
                    <span className="text-2xl font-black dark:text-white">${period.budget}</span>
                </div>
                <div className="text-right">
                    <span className="block text-xs text-gray-400 uppercase font-bold">Gastado Real</span>
                    <span className={`text-2xl font-black ${period.spent > period.budget ? 'text-red-500' : 'text-emerald-400'}`}>
                        ${period.spent}
                    </span>
                </div>
              </div>

              {/* Barra de Progreso */}
              <div className="mt-4 pl-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progreso</span>
                    <span>{percent.toFixed(0)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-black/30 rounded-full overflow-hidden">
                    <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${percent}%`,
                          backgroundColor: period.spent > period.budget ? '#EF4444' : (period.color || '#10B981')
                        }}
                    ></div>
                </div>
              </div>

              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" style={{ color: period.color || '#10B981' }}>
                <ArrowRight size={24} />
              </div>

            </div>
          );
        })}

        {periods.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-3xl border-2 border-dashed border-gray-700">
                <p className="text-gray-500">No hay periodos creados.</p>
                <p className="text-sm text-gray-600">Usa el botón + azul para crear tu primera quincena.</p>
            </div>
        )}
      </div>
    </div>
  );
}

export default PeriodList;