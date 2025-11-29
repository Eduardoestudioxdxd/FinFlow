import React, { useState } from 'react';
import { Search, Filter, Plus, CreditCard, Edit3, Trash2, Receipt, ArrowDownCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function Wallet({ tarjetas, totalGastado, onAddCard, onEditCard, onDeleteCard, onCardExpense, onCardPayment }) {
  const [filtro, setFiltro] = useState('');

  const tarjetasFiltradas = tarjetas.filter(t => 
    t.nombre.toLowerCase().includes(filtro.toLowerCase()) || 
    t.digitos.includes(filtro)
  );

  const dataPorTarjeta = tarjetas.map(t => ({ name: t.nombre, value: t.gasto, color: t.color }));

  return (
    <div className="animate-fade-in space-y-6">
        
        {/* BARRA DE HERRAMIENTAS */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-[#1e293b] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input type="text" placeholder="Buscar tarjeta..." className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#0f172a] rounded-xl border-none outline-none dark:text-white focus:ring-2 focus:ring-emerald-500" value={filtro} onChange={(e) => setFiltro(e.target.value)}/>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"><Filter size={18} /> <span className="text-sm">Filtros</span></button>
                <button onClick={onAddCard} className="flex-1 md:flex-none flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-colors"><Plus size={18} /> Nueva</button>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* GRÁFICO DEUDA TOTAL */}
            <div className="lg:w-1/3 bg-white dark:bg-[#1e293b] rounded-[2rem] p-8 shadow-xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center relative min-h-[400px]">
                <h3 className="absolute top-8 left-8 font-bold text-xl dark:text-white">Deuda Total</h3>
                <div className="w-64 h-64 relative">
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span className="text-gray-400 text-xs font-bold uppercase">Consolidado</span><span className="text-3xl font-black dark:text-white">${totalGastado.toFixed(2)}</span></div>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={dataPorTarjeta} innerRadius={80} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none" cornerRadius={5}>{dataPorTarjeta.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie>
                            <Tooltip formatter={(value) => `$${value}`} contentStyle={{borderRadius: '12px', border:'none', backgroundColor: '#333', color:'#fff'}}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* LISTA DE TARJETAS */}
            <div className="lg:w-2/3 space-y-4">
                {tarjetasFiltradas.length === 0 ? <div className="text-center p-10 text-gray-400">No se encontraron tarjetas.</div> : (
                    tarjetasFiltradas.map((tarjeta) => {
                        const hasLimit = tarjeta.limit > 0;
                        const disponible = hasLimit ? tarjeta.limit - tarjeta.gasto : 0;
                        
                        // FIX: Math.max(0, ...) asegura que si el gasto es negativo (saldo a favor), la barra muestre 0% y no se rompa
                        const porcentajeUso = hasLimit ? Math.max(0, Math.min((tarjeta.gasto / tarjeta.limit) * 100, 100)) : 0;
                        const esCritico = porcentajeUso > 90;

                        return (
                            // CORRECCIÓN: Usar _id
                            <div key={tarjeta._id} className={`group bg-white dark:bg-[#1e293b] p-5 rounded-2xl shadow-sm border ${esCritico ? 'border-red-500/50 dark:border-red-500/30' : 'border-gray-100 dark:border-white/5'} flex flex-col gap-4 hover:border-emerald-500/50 transition-all`}>
                                
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md relative" style={{ background: tarjeta.color }}>
                                            <CreditCard size={20} />
                                            {esCritico && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-[#1e293b]"></div>}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg dark:text-white">{tarjeta.nombre}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400">{tarjeta.tipo}</span>
                                                <span className="text-xs text-gray-400">•••• {tarjeta.digitos}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 w-full sm:px-4">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-500 dark:text-gray-400">Deuda: <strong>${tarjeta.gasto.toFixed(2)}</strong></span>
                                            {hasLimit && <span className="text-gray-500 dark:text-gray-400">Disp: <strong>${disponible.toFixed(2)}</strong></span>}
                                        </div>
                                        
                                        {/* BARRA VISUAL MEJORADA */}
                                        <div className="w-full h-3 bg-gray-100 dark:bg-black/20 rounded-full overflow-hidden relative">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-700 ${esCritico ? 'bg-red-500' : ''}`}
                                                style={{ 
                                                    width: hasLimit ? `${porcentajeUso}%` : '0%',
                                                    backgroundColor: !esCritico ? tarjeta.color : undefined 
                                                }}
                                            ></div>
                                        </div>
                                        
                                        <div className="flex justify-end mt-1">
                                            <span className={`text-[10px] ${esCritico ? 'font-bold text-red-500' : 'text-gray-400 italic'}`}>
                                                {hasLimit ? `${porcentajeUso.toFixed(0)}% ocupado` : 'Sin límite definido'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 w-full sm:w-auto justify-end opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onEditCard(tarjeta)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"><Edit3 size={18} /></button>
                                        {/* CORRECCIÓN: Usar _id */}
                                        <button onClick={() => onDeleteCard(tarjeta._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-100 dark:bg-white/5"></div>

                                <div className="flex gap-3 justify-end">
                                    <button onClick={() => onCardPayment(tarjeta)} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"><ArrowDownCircle size={14}/> Abonar</button>
                                    <button onClick={() => onCardExpense(tarjeta)} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"><Receipt size={14}/> Registrar Gasto</button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    </div>
  );
}

export default Wallet;