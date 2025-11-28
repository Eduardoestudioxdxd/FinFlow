import React, { useState, useEffect } from 'react';
import { 
  X, Save, ShoppingCart, Zap, Cigarette, Cat, CreditCard, Tv, Heart, Bike, Pill, Home, Dumbbell, Languages, AlertCircle 
} from 'lucide-react';

// AHORA RECIBIMOS "cardList" TAMBIÉN
const ActionModal = ({ isOpen, onClose, type, onSave, periods, initialData, cardList }) => {
  if (!isOpen) return null;

  const AVAILABLE_ICONS = [
    { key: 'super', Component: ShoppingCart, label: 'Super' },
    { key: 'services', Component: Zap, label: 'Servicios' },
    { key: 'tobacco', Component: Cigarette, label: 'Tabaco' },
    { key: 'cats', Component: Cat, label: 'Gatos' },
    { key: 'debts', Component: CreditCard, label: 'Deudas' },
    { key: 'streaming', Component: Tv, label: 'Stream' },
    { key: 'couple', Component: Heart, label: 'Nosotros' },
    { key: 'delivery', Component: Bike, label: 'Delivery' },
    { key: 'health', Component: Pill, label: 'Medicina' },
    { key: 'rent', Component: Home, label: 'Alquiler' },
    { key: 'gym', Component: Dumbbell, label: 'GYM' },
    { key: 'english', Component: Languages, label: 'Inglés' },
    { key: 'other', Component: AlertCircle, label: 'Otro' },
  ];

  const colors = ['#334155', '#2563eb', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

  const [formData, setFormData] = useState({
    name: '',
    amount: '', 
    limit: '', 
    color: '#334155', 
    periodId: '',
    cardId: '', // NUEVO: ID de la tarjeta seleccionada
    iconKey: 'super',
    digitos: '',
    tipo: 'Crédito'
  });

  useEffect(() => {
    // A) MODO EDICIÓN TARJETA
    if (type === 'edit-card' && initialData) {
        setFormData({
            name: initialData.nombre, 
            digitos: initialData.digitos,
            tipo: initialData.tipo,
            color: initialData.color,
            amount: initialData.gasto, 
            limit: initialData.limit || '', 
        });
    } 
    // B) MODO GASTO/PAGO TARJETA DIRECTO
    else if ((type === 'card-expense' || type === 'card-payment') && initialData) {
        setFormData(prev => ({
            ...prev, name: '', amount: '', limit: '', periodId: periods.length > 0 ? periods[0].id : '', iconKey: 'super'
        }));
    }
    // C) MODO CREAR TARJETA
    else if (type === 'card') {
        setFormData({ name: '', digitos: '', tipo: 'Crédito', amount: '', limit: '', color: '#334155' });
    }
    // D) EDITAR PRESUPUESTO
    else if (initialData && type === 'edit-budget') {
       setFormData({ name: initialData.name, amount: initialData.budget, color: initialData.color || '#3B82F6', periodId: '', iconKey: '' });
    } 
    // E) DEFAULT (Nuevo Gasto, Ingreso, etc)
    else {
       setFormData({ 
           name: '', amount: '', limit: '', color: '#10B981', 
           periodId: periods && periods.length > 0 ? periods[0].id : '', 
           cardId: '', // Por defecto vacío (Efectivo)
           iconKey: 'super', digitos: '', tipo: 'Crédito' 
        });
    }
  }, [isOpen, type, periods, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      ...formData, 
      id: initialData ? initialData.id : null,
      amount: parseFloat(formData.amount) || 0,
      limit: parseFloat(formData.limit) || 0, 
      type 
    });
    onClose();
  };

  const getTitle = () => {
    if (type === 'card') return 'Nueva Tarjeta';
    if (type === 'edit-card') return 'Editar Tarjeta';
    if (type === 'card-expense') return `Gasto con ${initialData?.nombre}`;
    if (type === 'card-payment') return `Abonar a ${initialData?.nombre}`;
    if (type === 'edit-budget') return 'Editar Presupuesto';
    if (type === 'budget') return 'Nuevo Presupuesto';
    if (type === 'income') return 'Registrar Ingreso';
    return 'Registrar Gasto'; // Gasto General
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">{getTitle()}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><X size={20} className="text-slate-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          
          {/* CAMPOS TARJETA (Solo crear/editar tarjeta) */}
          {(type === 'card' || type === 'edit-card') && (
             <>
                <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Nombre del Banco/Tarjeta</label>
                    <input type="text" required autoFocus placeholder="Ej. Davivienda Oro" className="w-full p-3 rounded-xl border bg-transparent dark:text-white dark:border-slate-600" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Últimos 4 dígitos</label>
                        <input type="text" maxLength="4" placeholder="1234" className="w-full p-3 rounded-xl border bg-transparent dark:text-white dark:border-slate-600" value={formData.digitos} onChange={(e) => setFormData({...formData, digitos: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Tipo</label>
                        <select className="w-full p-3 rounded-xl border bg-white dark:bg-slate-700 dark:text-white dark:border-slate-600" value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})}>
                            <option value="Crédito">Crédito</option>
                            <option value="Débito">Débito</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{formData.tipo === 'Crédito' ? 'Deuda Actual ($)' : 'Saldo Usado ($)'}</label>
                        <input type="number" step="0.01" className="w-full p-3 rounded-xl border bg-transparent dark:text-white dark:border-slate-600 font-mono" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Cupo / Límite ($)</label>
                        <input type="number" step="0.01" placeholder="900.00" className="w-full p-3 rounded-xl border bg-transparent dark:text-white dark:border-slate-600 font-mono" value={formData.limit} onChange={(e) => setFormData({...formData, limit: e.target.value})} />
                    </div>
                </div>
             </>
          )}

          {/* CAMPOS GENERALES (Presupuesto, Gastos, Ingresos) */}
          {!['card', 'edit-card', 'card-payment'].includes(type) && (
             <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    {['budget', 'edit-budget'].includes(type) ? 'Nombre del Periodo' : 'Concepto'}
                </label>
                <input type="text" required placeholder={['budget', 'edit-budget'].includes(type) ? "Ej. Diciembre" : "Ej. Restaurante..."} className="w-full p-3 rounded-xl border bg-transparent dark:text-white dark:border-slate-600" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
             </div>
          )}

          {!['card', 'edit-card'].includes(type) && (
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    {['budget', 'edit-budget'].includes(type) ? 'Presupuesto Total ($)' : 'Monto ($)'}
                </label>
                <input type="number" required min="0" step="0.01" className="w-full p-3 rounded-xl border bg-transparent dark:text-white dark:border-slate-600 font-mono text-lg" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
              </div>
          )}
          
          {/* SELECTOR DE PRESUPUESTO (Para asignar el gasto a un mes) */}
          {['card-expense', 'expense', 'income'].includes(type) && (
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Asignar al Presupuesto de:</label>
              {periods.length > 0 ? (
                <select className="w-full p-3 rounded-xl border bg-white dark:bg-slate-700 dark:text-white dark:border-slate-600" value={formData.periodId} onChange={(e) => setFormData({...formData, periodId: e.target.value})}>
                  {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              ) : <p className="text-red-500 text-sm">No hay presupuestos disponibles.</p>}
            </div>
          )}

          {/* --- NUEVO: SELECTOR DE TARJETA (MÉTODO DE PAGO) --- */}
          {/* Solo se muestra en GASTOS (expense) generales, no en ingresos ni en gastos directos de tarjeta */}
          {type === 'expense' && (
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Método de Pago:</label>
              <select 
                className="w-full p-3 rounded-xl border bg-white dark:bg-slate-700 dark:text-white dark:border-slate-600" 
                value={formData.cardId} 
                onChange={(e) => setFormData({...formData, cardId: e.target.value})}
              >
                  <option value="">Efectivo / Otro</option>
                  {cardList && cardList.map(card => (
                      <option key={card.id} value={card.id}>{card.nombre} (..{card.digitos})</option>
                  ))}
              </select>
            </div>
          )}

          {['expense', 'income', 'card-expense'].includes(type) && (
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Categoría:</label>
              <div className="grid grid-cols-5 gap-2">
                {AVAILABLE_ICONS.map(({ key, Component, label }) => (
                  <button key={key} type="button" onClick={() => setFormData({...formData, iconKey: key})} className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all gap-1 h-16 ${formData.iconKey === key ? 'bg-emerald-500 text-white shadow-lg scale-105' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                    <Component size={20} />
                    <span className="text-[9px] font-bold truncate w-full text-center leading-none">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {['budget', 'edit-budget', 'card', 'edit-card'].includes(type) && (
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Color:</label>
              <div className="flex flex-wrap gap-3">
                {colors.map((c) => (
                  <button key={c} type="button" onClick={() => setFormData({...formData, color: c})} className={`w-8 h-8 rounded-full ${formData.color === c ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-800' : ''}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all mt-4">
            <Save size={20} /> Guardar
          </button>

        </form>
      </div>
    </div>
  );
};

export default ActionModal;