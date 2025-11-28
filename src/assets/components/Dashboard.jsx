import React from 'react';
import { 
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, 
  MoreHorizontal, CreditCard, Activity, DollarSign, 
  ShoppingCart, Zap, Cigarette, Cat, Tv, Heart, Bike, Pill, Home, Dumbbell, Languages, AlertCircle 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ICON_MAP = {
  super: ShoppingCart, services: Zap, tobacco: Cigarette, cats: Cat, debts: CreditCard,
  streaming: Tv, couple: Heart, delivery: Bike, health: Pill, rent: Home, gym: Dumbbell,
  english: Languages, other: AlertCircle
};

function Dashboard({ 
    widgets, totalGastado, 
    // NUEVAS PROPS PARA EL SELECTOR
    periods, selectedPeriodId, onSelectPeriod,
    // DATOS FILTRADOS
    globalBalance, globalIncome, globalExpense, recentTransactions,
    onNewExpense, onNewIncome, onViewCards, onViewReport,
    removeWidget, updateWidgetTitle, moveWidget 
}) {

  const dataCategorias = [
    { name: 'Gastado', value: globalExpense, color: '#EF4444' },    
    { name: 'Restante', value: Math.max(0, globalBalance), color: '#10B981' }, 
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* --- HEADER DASHBOARD (SELECTOR DE MES) --- */}
      <div className="flex justify-between items-center mb-2">
          <div>
              <h2 className="text-xl font-bold dark:text-white">Resumen</h2>
              <p className="text-sm text-gray-400">Tu estado financiero mensual</p>
          </div>
          
          {/* SELECTOR DE PERIODO */}
          {periods.length > 0 && (
              <div className="relative">
                  <select 
                    value={selectedPeriodId || ''} 
                    onChange={(e) => onSelectPeriod(Number(e.target.value))}
                    className="appearance-none bg-white dark:bg-[#1e293b] text-gray-800 dark:text-white py-2 pl-4 pr-10 rounded-xl shadow-sm border border-gray-200 dark:border-white/10 font-bold focus:outline-none cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                      {periods.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"/></svg>
                  </div>
              </div>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* COLUMNA IZQUIERDA */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* TARJETA SALDO */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-8 shadow-2xl">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-emerald-100 font-medium text-sm tracking-widest uppercase mb-1">Saldo Disponible</p>
                            <h1 className="text-5xl font-black tracking-tighter">${globalBalance.toFixed(2)}</h1>
                        </div>
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                            <Activity className="text-emerald-200" size={24} />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 bg-black/20 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3 border border-white/5">
                            <div className="bg-emerald-400/20 p-2 rounded-lg text-emerald-300"><ArrowUpRight size={20}/></div>
                            <div>
                                <p className="text-xs text-emerald-200">Presupuesto</p>
                                <p className="font-bold text-lg">${globalIncome.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex-1 bg-black/20 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3 border border-white/5">
                            <div className="bg-red-400/20 p-2 rounded-lg text-red-300"><ArrowDownRight size={20}/></div>
                            <div>
                                <p className="text-xs text-red-200">Gastado</p>
                                <p className="font-bold text-lg">-${globalExpense.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACCESOS RÁPIDOS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button onClick={onNewExpense} className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex flex-col items-center gap-2 group">
                    <div className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 p-3 rounded-full group-hover:scale-110 transition-transform"><DollarSign size={20} /></div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Nuevo Gasto</span>
                </button>
                <button onClick={onNewIncome} className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex flex-col items-center gap-2 group">
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3 rounded-full group-hover:scale-110 transition-transform"><TrendingUp size={20} /></div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Ingreso / Transf.</span>
                </button>
                <button onClick={onViewCards} className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex flex-col items-center gap-2 group">
                    <div className="bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 p-3 rounded-full group-hover:scale-110 transition-transform"><CreditCard size={20} /></div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Ver Tarjetas</span>
                </button>
                <button onClick={onViewReport} className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex flex-col items-center gap-2 group">
                    <div className="bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 p-3 rounded-full group-hover:scale-110 transition-transform"><Activity size={20} /></div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Reporte</span>
                </button>
            </div>

            {/* GRÁFICO ESTRUCTURA */}
            <div className="bg-white dark:bg-[#1e293b] rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-white/5">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg dark:text-white">Resumen Global</h3>
                    <button className="text-gray-400 hover:text-white"><MoreHorizontal size={20}/></button>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="h-48 w-48 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={dataCategorias} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                    {dataCategorias.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xs text-gray-400 uppercase font-bold">Total Gastado</span>
                            <span className="text-xl font-black dark:text-white">${globalExpense.toFixed(0)}</span>
                        </div>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                        {dataCategorias.map((cat) => (
                            <div key={cat.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                <div>
                                    <p className="text-xs text-gray-400">{cat.name}</p>
                                    <p className="font-bold dark:text-white">${cat.value.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-6">
            
            {/* RESUMEN COMPACTO */}
            <div className="bg-white dark:bg-[#1e293b] rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg dark:text-white">Estado del Mes</h3>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-bold">Activo</span>
                </div>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Progreso</span>
                            <span className="text-gray-800 dark:text-white font-bold">{globalIncome > 0 ? ((globalExpense/globalIncome)*100).toFixed(0) : 0}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full rounded-full transition-all" 
                                style={{ width: `${Math.min((globalExpense/(globalIncome || 1))*100, 100)}%`, backgroundColor: globalExpense > globalIncome ? '#EF4444' : '#3B82F6' }}
                            ></div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400">Mantén tus gastos bajo control.</p>
                </div>
            </div>

            {/* ACTIVIDAD RECIENTE */}
            <div className="bg-white dark:bg-[#1e293b] rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-white/5 h-fit">
                <h3 className="font-bold text-lg dark:text-white mb-4">Actividad Reciente</h3>
                <div className="space-y-4">
                    {recentTransactions.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No hay movimientos en este periodo.</p>
                    ) : (
                        recentTransactions.map((tx) => {
                            const IconComponent = ICON_MAP[tx.iconKey] || AlertCircle;
                            const isIncome = tx.type === 'income';
                            return (
                                <div key={tx.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isIncome ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                            <IconComponent size={18}/>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm dark:text-white line-clamp-1">{tx.name}</p>
                                            <p className="text-xs text-gray-400">{tx.date}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold text-sm ${isIncome ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-200'}`}>
                                        {isIncome ? '+' : ''}{tx.amount}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
                <button onClick={onViewReport} className="w-full mt-6 py-3 text-sm font-bold text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                    Ver todo el historial
                </button>
            </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;