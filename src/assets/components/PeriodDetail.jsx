import React from 'react';
import { 
  ArrowLeft, ArrowUp, ArrowDown, Edit3, Trash2, Wallet, TrendingUp, AlertTriangle,
  ShoppingCart, Zap, Cigarette, Cat, CreditCard, Tv, Heart, Bike, Pill, Home, Dumbbell, Languages, AlertCircle 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ICON_MAP = {
  super: ShoppingCart, services: Zap, tobacco: Cigarette, cats: Cat, debts: CreditCard,
  streaming: Tv, couple: Heart, delivery: Bike, health: Pill, rent: Home, gym: Dumbbell,
  english: Languages, other: AlertCircle
};

// PROPS: Añadimos onEditMovement
function PeriodDetail({ period, onBack, widgets, moveWidget, removeWidget, updateWidgetTitle, onEdit, onDeleteMovement, onEditMovement }) {
  
  const remaining = period.budget - period.spent;
  const percentageSpent = period.budget > 0 ? ((period.spent / period.budget) * 100).toFixed(0) : 0;
  const colorSpent = '#EF4444'; 
  const colorRemaining = '#10B981'; 

  const dataCategorias = [
    { name: 'Gastado', value: period.spent, color: colorSpent }, 
    { name: 'Disponible', value: Math.max(0, remaining), color: colorRemaining }, 
  ];

  const chartData = dataCategorias.filter(d => d.value > 0);
  const hasData = chartData.length > 0;

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
        <ArrowLeft size={20} /> Volver a Presupuestos
      </button>

      {/* TARJETA DE RESUMEN */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <p className="opacity-80 font-medium tracking-widest uppercase text-sm">{period.name}</p>
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: period.color }}></div>
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black tracking-tighter mb-2">${remaining.toFixed(2)}</h1>
                    <span className="text-sm text-blue-200">Restante del presupuesto</span>
                </div>
                <button 
                    onClick={onEdit}
                    className="p-3 bg-white/10 rounded-xl backdrop-blur-md hover:bg-white/20 hover:scale-105 transition-all cursor-pointer border border-white/5 shadow-lg active:scale-95"
                    title="Editar Presupuesto"
                >
                    <Edit3 size={32} className="text-blue-300"/>
                </button>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/5">
                    <span className="block text-xs text-blue-200 mb-1 tracking-wider">PRESUPUESTO</span>
                    <span className="text-xl font-bold tracking-tight">${period.budget.toFixed(2)}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/5">
                    <span className="block text-xs text-red-200 mb-1 tracking-wider">GASTADO</span>
                    <span className="text-xl font-bold text-red-300 tracking-tight">-${period.spent.toFixed(2)}</span>
                </div>
            </div>
      </div>

      {/* WIDGETS */}
      {widgets.map((widget, index) => (
          <div key={widget.id} className="bg-white dark:bg-[#1e293b] rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-white/5 relative group transition-all hover:border-blue-500/20">
            
             <div className="flex justify-between items-start mb-6">
                <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">{widget.title}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                    <button onClick={() => moveWidget(index, 'up')} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md text-gray-400 hover:text-blue-500"><ArrowUp size={16}/></button>
                    <button onClick={() => moveWidget(index, 'down')} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md text-gray-400 hover:text-blue-500"><ArrowDown size={16}/></button>
                    <button onClick={() => updateWidgetTitle(widget.id)} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md text-gray-400 hover:text-orange-500"><Edit3 size={16}/></button>
                    <button onClick={() => removeWidget(widget.id)} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
            </div>

            {widget.type === 'chart' && (
               <div className="flex flex-col md:flex-row gap-8 items-center h-auto md:h-64">
                  <div className="w-full md:w-1/2 h-56 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie 
                                data={hasData ? chartData : [{ name: 'Sin Datos', value: 1, color: '#475569' }]} 
                                innerRadius={65} 
                                outerRadius={80} 
                                paddingAngle={5} 
                                dataKey="value" 
                                stroke="none"
                            >
                              {
                                hasData ? 
                                    chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />) 
                                    : <Cell key={`cell-no-data`} fill={'#475569'} />
                                }
                            </Pie>
                            <Tooltip 
                                formatter={(value) => `$${value}`} 
                                contentStyle={{backgroundColor: '#1e293b', border:'none', borderRadius:'12px', color:'#fff'}} 
                                itemStyle={{color: '#fff'}}
                            />
                          </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-3xl font-black dark:text-white">{percentageSpent}%</span>
                         <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Consumido</span>
                      </div>
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col justify-center gap-4">
                     <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Gastado</span>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white">${period.spent.toFixed(2)}</span>
                     </div>
                     <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Disponible</span>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white">${Math.max(0, remaining).toFixed(2)}</span>
                     </div>
                     <div className={`mt-2 text-xs flex items-center gap-2 px-3 py-2 rounded-lg ${percentageSpent > 90 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {percentageSpent > 90 ? <AlertTriangle size={14}/> : <TrendingUp size={14}/>}
                        <span>{percentageSpent > 100 ? "Has excedido tu presupuesto." : percentageSpent > 80 ? "Estás cerca del límite." : "¡Vas muy bien!"}</span>
                     </div>
                  </div>
               </div>
            )}
            
            {widget.type === 'recent' && (
                <div className="space-y-3 mt-2">
                    {period.movements && period.movements.length > 0 ? (
                        // Usamos map con index para tener un identificador seguro
                        period.movements.map((mov, i) => {
                            const IconComponent = ICON_MAP[mov.iconKey] || AlertCircle;
                            const isIncome = mov.type === 'income';
                            // Usamos un key combinado para React
                            const uniqueKey = mov.id || `idx-${i}`;

                            return (
                                <div key={uniqueKey} className="relative flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-emerald-500/20 group/item">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm transition-transform group-hover/item:scale-110 ${isIncome ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'}`}>
                                            <IconComponent size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-white text-sm">{mov.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{mov.date}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold text-sm mr-2 ${isIncome ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {isIncome ? '+' : '-'}${mov.amount.toFixed(2)}
                                        </span>
                                        <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => onEditMovement(mov, i)} 
                                                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                                                title="Editar movimiento"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button 
                                                // CORRECCIÓN: Enviamos el ÍNDICE (i) como segundo argumento
                                                onClick={() => onDeleteMovement(mov.id, i)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Borrar movimiento"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
                            <Wallet size={32} className="mb-2 opacity-50"/>
                            <p className="text-sm">Sin movimientos aún.</p>
                        </div>
                    )}
                </div>
            )}
          </div>
      ))}
    </div>
  );
}

export default PeriodDetail;