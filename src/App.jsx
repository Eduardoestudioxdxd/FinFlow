import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Wallet as WalletIcon, Moon, Sun, Plus, CreditCard, 
  CalendarRange, TrendingUp, TrendingDown, X, 
  LayoutTemplate, PieChart, List, ChevronLeft, LogOut
} from 'lucide-react';

// COMPONENTES
import Dashboard from './assets/components/Dashboard.jsx';
import Wallet from './assets/components/Wallet.jsx';
import PeriodList from './assets/components/PeriodList.jsx'; 
import PeriodDetail from './assets/components/PeriodDetail.jsx';
import ActionModal from './assets/components/ActionModal.jsx';
import Auth from './assets/components/Auth.jsx'; // LOGIN

// CONEXIÓN AL BACKEND
import * as api from './api.js';

function App() {
  // --- 1. GESTIÓN DE USUARIO (AUTH) ---
  const [user, setUser] = useState(() => {
      const savedUser = localStorage.getItem('mywallet_user');
      return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false); // Estado de carga
  
  // UI States
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuView, setMenuView] = useState('main'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('budget');
  const [editingData, setEditingData] = useState(null); 

  // --- NUEVO ESTADO PARA VISIBILIDAD DEL SIDEBAR (Mobile/Desktop) ---
  const [isSidebarVisible, setIsSidebarVisible] = useState(true); 

  // --- 2. ESTADOS DE DATOS (Inician vacíos, se llenan desde MongoDB) ---
  const [tarjetas, setTarjetas] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [dashboardWidgets, setDashboardWidgets] = useState([]);
  
  const [selectedPeriodId, setSelectedPeriodId] = useState(null); 
  const [dashboardPeriodId, setDashboardPeriodId] = useState(null);

  // --- 3. EFECTO: CARGAR DATOS AL ENTRAR ---
  useEffect(() => {
    if (user) {
        fetchData();
    }
  }, [user]);

  const fetchData = async () => {
      setIsLoading(true);
      try {
          // Peticiones al Backend
          const [cardsData, periodsData, widgetsData] = await Promise.all([
              api.getCards(),
              api.getPeriods(),
              api.getWidgets()
          ]);

          setTarjetas(cardsData);
          setPeriods(periodsData);
          
          if (widgetsData.length > 0) {
              setDashboardWidgets(widgetsData);
          } else {
              // Widgets por defecto la primera vez
              const defaults = [{ type: 'balance', title: 'Saldo Total', isFixed: true, order: 0 }, { type: 'chart', title: 'Estructura', isFixed: false, order: 1 }];
              setDashboardWidgets(defaults);
              api.saveWidgets(defaults); 
          }

          // Seleccionar el último periodo creado por defecto para el dashboard
          if (periodsData.length > 0 && !dashboardPeriodId) {
              // Usamos el _id de MongoDB
              setDashboardPeriodId(periodsData[periodsData.length - 1]._id);
          }
      } catch (error) {
          console.error("Error cargando datos:", error);
      } finally {
          setIsLoading(false);
      }
  };

  // --- 4. CÁLCULOS GLOBALES ---
  const totalTarjetaGastado = tarjetas.reduce((acc, curr) => acc + curr.gasto, 0);
  
  // Filtrar datos para el Dashboard según el mes seleccionado
  const currentDashboardPeriod = periods.find(p => p._id === dashboardPeriodId) || (periods.length > 0 ? periods[0] : null);
  const dashboardBudget = currentDashboardPeriod ? currentDashboardPeriod.budget : 0;
  const dashboardSpent = currentDashboardPeriod ? currentDashboardPeriod.spent : 0;
  const dashboardBalance = dashboardBudget - dashboardSpent;
  const dashboardMovements = currentDashboardPeriod ? [...currentDashboardPeriod.movements].reverse().slice(0, 3) : [];

  // --- 5. LOGOUT Y SIDEBAR TOGGLE ---
  useEffect(() => {
      if (user) localStorage.setItem('mywallet_user', JSON.stringify(user));
      else localStorage.removeItem('mywallet_user');
  }, [user]);

  const handleLogin = (userData) => { setUser(userData); };
  const handleLogout = () => { if(confirm("¿Cerrar sesión?")) setUser(null); };

  const handleSidebarClick = () => {
      // 1. Navegar a Inicio (Dashboard)
      setActiveTab('dashboard'); 
      setSelectedPeriodId(null);
      // 2. Ocultar/Mostrar el sidebar (UX móvil)
      setIsSidebarVisible(prev => !prev);
  }

  // --- 6. LÓGICA DE GUARDADO (CONECTADA AL BACKEND) ---
  const handleSaveData = async (data) => {
    setIsLoading(true);
    try {
        // A. CREAR TARJETA
        if (data.type === 'card') {
            const newCard = { nombre: data.name, digitos: data.digitos, tipo: data.tipo, gasto: data.amount, limit: data.limit, color: data.color };
            const savedCard = await api.createCard(newCard);
            setTarjetas([...tarjetas, savedCard]);
        }
        // B. EDITAR TARJETA
        else if (data.type === 'edit-card') {
            const updatedCard = { nombre: data.name, digitos: data.digitos, tipo: data.tipo, gasto: data.amount, limit: data.limit, color: data.color };
            const res = await api.updateCard(data.id, updatedCard);
            setTarjetas(tarjetas.map(t => t._id === data.id ? res : t));
        }
        // C. CREAR PRESUPUESTO
        else if (data.type === 'budget') {
            const newPeriod = { name: data.name, budget: data.amount, spent: 0, color: data.color, movements: [] };
            const savedPeriod = await api.createPeriod(newPeriod);
            setPeriods([...periods, savedPeriod]);
            setDashboardPeriodId(savedPeriod._id);
            setActiveTab('quincenas');
        }
        // D. EDITAR PRESUPUESTO
        else if (data.type === 'edit-budget') {
            const original = periods.find(p => p._id === data.id);
            const updatedData = { ...original, name: data.name, budget: data.amount, color: data.color };
            const res = await api.updatePeriod(data.id, updatedData);
            setPeriods(periods.map(p => p._id === data.id ? res : p));
        }
        // E. MOVIMIENTOS (GASTOS, INGRESOS, PAGOS)
        else {
            // 1. Actualizar Tarjeta (si aplica)
            if (data.type === 'card-payment' || data.type === 'card-expense' || (data.type === 'expense' && data.cardId)) {
                const cardIdToUpdate = data.cardId || editingData?._id;
                const currentCard = tarjetas.find(t => t._id === cardIdToUpdate);
                
                if (currentCard) {
                    let newGasto = currentCard.gasto;
                    if (data.type === 'card-payment') newGasto -= data.amount;
                    else newGasto += data.amount; // Aumentar deuda

                    const updatedCard = await api.updateCard(cardIdToUpdate, { gasto: newGasto });
                    setTarjetas(tarjetas.map(t => t._id === cardIdToUpdate ? updatedCard : t));
                }
            }

            // 2. Actualizar Presupuesto (si no es solo un abono directo a tarjeta)
            if (data.type !== 'card-payment' && data.periodId) {
                const period = periods.find(p => p._id === data.periodId);
                if (period) {
                    let newSpent = period.spent;
                    let newBudget = period.budget;

                    if (data.type === 'expense' || data.type === 'card-expense') newSpent += data.amount;
                    else if (data.type === 'income') newBudget += data.amount;

                    // Nombre del movimiento
                    let finalName = data.name;
                    const cardIdUsed = data.cardId || (data.type === 'card-expense' ? editingData?._id : null);
                    if (cardIdUsed) {
                        const c = tarjetas.find(t => t._id === cardIdUsed);
                        if (c) finalName = `${data.name} (${c.nombre})`;
                    }

                    const newMovement = {
                        name: finalName,
                        amount: data.amount,
                        type: data.type === 'card-expense' ? 'expense' : data.type,
                        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
                        iconKey: data.iconKey,
                        cardId: cardIdUsed || ''
                    };

                    const updatedPeriodData = {
                        ...period,
                        budget: newBudget,
                        spent: newSpent,
                        movements: [...period.movements, newMovement]
                    };

                    const res = await api.updatePeriod(data.periodId, updatedPeriodData);
                    setPeriods(periods.map(p => p._id === data.periodId ? res : p));
                }
            }
        }

    } catch (error) {
        console.error("Error guardando:", error);
        alert("Hubo un error al guardar los datos en la nube.");
    } finally {
        setIsLoading(false);
        setMenuAbierto(false); 
        setMenuView('main'); 
        setEditingData(null);
    }
  };

  // --- HANDLERS (CRUD) ---
  const handleAddCard = () => openModal('card');
  const handleEditCard = (card) => { setEditingData(card); setModalType('edit-card'); setIsModalOpen(true); };
  
  const handleDeleteCard = async (id) => { 
      if(!confirm("¿Eliminar esta tarjeta?")) return;
      setIsLoading(true);
      try {
        await api.deleteCard(id);
        setTarjetas(tarjetas.filter(t => t._id !== id));
      } catch (e) { console.error(e); }
      setIsLoading(false);
  };
  
  const handleCardExpense = (card) => { setEditingData(card); setModalType('card-expense'); setIsModalOpen(true); };
  const handleCardPayment = (card) => { setEditingData(card); setModalType('card-payment'); setIsModalOpen(true); };
  
  const openModal = (type) => { setModalType(type); setEditingData(null); setIsModalOpen(true); setMenuAbierto(false); };
  const openEditModal = (periodToEdit) => { setModalType('edit-budget'); setEditingData(periodToEdit); setIsModalOpen(true); };
  
  const deleteMovement = async (periodId, movementId) => { 
      if (!confirm("¿Borrar movimiento?")) return; 
      setIsLoading(true); 
      try { 
          const period = periods.find(p => p._id === periodId); 
          if (period) { 
              const movement = period.movements.find(m => m._id === movementId); 
              if (movement) { 
                  let newSpent = period.spent; let newBudget = period.budget; 
                  if (movement.type === 'expense') newSpent -= movement.amount; else if (movement.type === 'income') newBudget -= movement.amount; 
                  const updatedPeriodData = { ...period, spent: Math.max(0, newSpent), budget: newBudget, movements: period.movements.filter(m => m._id !== movementId) }; 
                  const res = await api.updatePeriod(periodId, updatedPeriodData); 
                  setPeriods(periods.map(p => p._id === periodId ? res : p)); 
              } 
          } 
      } catch(e) { console.error(e); } finally { setIsLoading(false); } 
  };

  const handleAddWidget = async (type, title) => { const newWidget = { type, title, isFixed: false, order: dashboardWidgets.length }; const updatedList = [...dashboardWidgets, newWidget]; setDashboardWidgets(updatedList); await api.saveWidgets(updatedList); setMenuAbierto(false); setMenuView('main'); };
  const removeDashboardWidget = async (id) => { const newList = dashboardWidgets.filter(w => w._id !== id && w.id !== id); setDashboardWidgets(newList); await api.saveWidgets(newList); };
  const moveWidgetGeneric = async (list, setList, idx, dir) => { const newList = [...list]; const target = dir === 'up' ? idx - 1 : idx + 1; if (target >= 0 && target < newList.length && !newList[target].isFixed) { [newList[idx], newList[target]] = [newList[target], newList[idx]]; setList(newList); await api.saveWidgets(newList); } };
  const movePeriodWidget = async (pId, idx, dir) => { const pIdx = periods.findIndex(p => p._id === pId); const newP = [...periods]; const w = [...newP[pIdx].widgets]; const t = dir === 'up' ? idx - 1 : idx + 1; if (t >= 0 && t < w.length) { [w[idx], w[t]] = [w[t], w[i]]; newP[pIdx].widgets = w; setPeriods(newP); await api.updatePeriod(pId, { widgets: w }); } };
  const removePeriodWidget = async (pId, wId) => { const pIdx = periods.findIndex(p => p._id === pId); const newP = [...periods]; const newWidgets = newP[pIdx].widgets.filter(w => w.id !== wId); newP[pIdx].widgets = newWidgets; setPeriods(newP); await api.updatePeriod(pId, { widgets: newWidgets }); };
  const deletePeriod = async (id) => { if(confirm("¿Eliminar periodo?")) { setIsLoading(true); await api.deletePeriod(id); setPeriods(periods.filter(p => p._id !== id)); if(selectedPeriodId === id) setSelectedPeriodId(null); setIsLoading(false); } };

  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-gray-50 dark:bg-[#0f172a] transition-colors duration-500 font-sans overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className={`flex-col justify-between z-40 bg-white dark:bg-[#1e293b] border-r border-gray-200 dark:border-white/5 transition-all duration-300 ${isSidebarVisible ? 'w-20 lg:w-64' : 'w-0'}`}
        >
           <div>
            {/* LOGO DE WALLET CLICABLE */}
            <div 
                onClick={handleLogoClick}
                className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-100 dark:border-white/5 cursor-pointer"
            >
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <WalletIcon size={24} />
              </div>
              <span className="hidden lg:block ml-3 font-bold text-xl dark:text-white">Mi Wallet</span>
            </div>
            {/* MENÚ DE NAVEGACIÓN (Botones Ínicio/Presupuestos/Tarjetas) */}
            <nav className="p-4 space-y-2">
              <button onClick={() => { setActiveTab('dashboard'); setSelectedPeriodId(null); }} className={`w-full flex items-center p-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}><LayoutDashboard size={22} /> <span className="hidden lg:block ml-3">Inicio</span></button>
              <button onClick={() => { setActiveTab('quincenas'); setSelectedPeriodId(null); }} className={`w-full flex items-center p-3 rounded-xl transition-all ${activeTab === 'quincenas' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}><CalendarRange size={22} /> <span className="hidden lg:block ml-3">Presupuestos</span></button>
              <button onClick={() => { setActiveTab('wallet'); setSelectedPeriodId(null); }} className={`w-full flex items-center p-3 rounded-xl transition-all ${activeTab === 'wallet' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}><CreditCard size={22} /> <span className="hidden lg:block ml-3">Tarjetas</span></button>
            </nav>
          </div>
          <div className="p-4 space-y-2">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center justify-center lg:justify-start p-3 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5">{isDarkMode ? <Sun size={22} /> : <Moon size={22} />}</button>
            <button onClick={handleLogout} className="w-full flex items-center justify-center lg:justify-start p-3 rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Cerrar Sesión"><LogOut size={22} /> <span className="hidden lg:block ml-3 font-bold">Salir</span></button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto relative">
          
          {/* BARRA DE CARGA */}
          {isLoading && <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 z-50"><div className="h-full bg-emerald-500 animate-pulse w-1/3 mx-auto"></div></div>}

          {/* HEADER */}
          <header className="h-20 flex items-center justify-between px-8 bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold dark:text-white">{activeTab === 'quincenas' && selectedPeriodId ? 'Detalle de Periodo' : activeTab === 'wallet' ? 'Mis Tarjetas' : 'Resumen Financiero'}</h2>
            </div>
            <div className="flex items-center gap-3">
                <span className="hidden md:block text-sm font-bold dark:text-white text-right">Hola, {user.name}</span>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg text-lg">{user.name.charAt(0).toUpperCase()}</div>
            </div>
          </header>

          <div className="p-8 max-w-7xl mx-auto pb-24">
            
            {/* SECCIÓN 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
                <Dashboard 
                    widgets={dashboardWidgets} totalGastado={totalTarjetaGastado} periods={periods} selectedPeriodId={dashboardPeriodId} onSelectPeriod={setDashboardPeriodId}
                    globalBalance={dashboardBalance} globalIncome={dashboardBudget} globalExpense={dashboardSpent} recentTransactions={dashboardMovements}  
                    onNewExpense={() => openModal('expense')} onNewIncome={() => openModal('income')} onViewCards={() => setActiveTab('wallet')} onViewReport={() => setActiveTab('quincenas')}
                    moveWidget={(idx, dir) => moveWidgetGeneric(dashboardWidgets, setDashboardWidgets, idx, dir)} removeWidget={removeDashboardWidget} updateWidgetTitle={() => {}} 
                />
            )}
            
            {/* SECCIÓN 2: PRESUPUESTOS */}
            {activeTab === 'quincenas' && (
                <>
                    {!selectedPeriodId && <PeriodList periods={periods} selectPeriod={setSelectedPeriodId} deletePeriod={deletePeriod} updatePeriod={() => {}} />}
                    {selectedPeriodId && <PeriodDetail 
                        period={periods.find(p => p._id === selectedPeriodId)} 
                        onBack={() => setSelectedPeriodId(null)} 
                        onEdit={() => openEditModal(periods.find(p => p._id === selectedPeriodId))} 
                        onDeleteMovement={(movId) => deleteMovement(selectedPeriodId, movId)} 
                        widgets={periods.find(p => p._id === selectedPeriodId).widgets || []} 
                        moveWidget={(idx, dir) => movePeriodWidget(selectedPeriodId, idx, dir)} 
                        removeWidget={(wId) => removePeriodWidget(selectedPeriodId, wId)} 
                        updateWidgetTitle={() => {}} 
                    />}
                </>
            )}
            
            {/* SECCIÓN 3: TARJETAS */}
            {activeTab === 'wallet' && (
                <Wallet tarjetas={tarjetas} totalGastado={totalTarjetaGastado} onAddCard={handleAddCard} onEditCard={handleEditCard} onDeleteCard={handleDeleteCard} onCardExpense={handleCardExpense} onCardPayment={handleCardPayment} eliminarTarjeta={()=>{}} modifyingTarjeta={()=>{}} />
            )}
          </div>
        </main>

        {/* BOTÓN FLOTANTE */}
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
             {menuAbierto && (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl p-2 mb-2 border border-gray-200 dark:border-slate-700 animate-fade-in-up origin-bottom-right w-64 overflow-hidden">
                    {menuView === 'main' && (
                        <>
                            <div onClick={() => openModal('budget')} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer flex items-center gap-3"><div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><CalendarRange size={18}/></div><p className="text-sm font-bold dark:text-white">Nuevo Presupuesto</p></div>
                            <div className="h-px bg-gray-100 dark:bg-slate-700 my-2"></div>
                            <div onClick={() => openModal('expense')} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer flex items-center gap-3"><div className="bg-red-100 text-red-600 p-2 rounded-lg"><TrendingDown size={18}/></div><p className="text-sm font-bold dark:text-white">Gasto Rápido</p></div>
                            <div onClick={() => openModal('income')} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer flex items-center gap-3"><div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><TrendingUp size={18}/></div><p className="text-sm font-bold dark:text-white">Ingreso Rápido</p></div>
                            <div className="h-px bg-gray-100 dark:bg-slate-700 my-2"></div>
                            <div onClick={() => setMenuView('widgets')} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer flex items-center justify-between group"><div className="flex items-center gap-3"><div className="bg-purple-100 text-purple-600 p-2 rounded-lg"><LayoutTemplate size={18}/></div><p className="text-sm font-bold dark:text-white">Agregar Widget</p></div><ChevronLeft size={16} className="text-gray-400 rotate-180 group-hover:text-purple-500 transition-colors"/></div>
                        </>
                    )}
                    {menuView === 'widgets' && (
                        <div className="animate-fade-in-right">
                            <div onClick={() => setMenuView('main')} className="flex items-center gap-2 mb-2 p-2 pb-0"><button onClick={() => setMenuView('main')} className="hover:bg-gray-100 dark:hover:bg-slate-700 p-1 rounded-lg"><ChevronLeft size={20} className="text-gray-500"/></button><span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Selecciona Tipo</span></div>
                            <div onClick={() => handleAddWidget('recent', 'Últimos Registros')} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer flex items-center gap-3"><div className="bg-orange-100 text-orange-600 p-2 rounded-lg"><List size={18}/></div><div><p className="text-sm font-bold dark:text-white">Resumen</p><p className="text-[10px] text-gray-400">Lista de movimientos</p></div></div>
                            <div onClick={() => handleAddWidget('chart', 'Estructura Gastos')} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer flex items-center gap-3"><div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg"><PieChart size={18}/></div><div><p className="text-sm font-bold dark:text-white">Estructura</p><p className="text-[10px] text-gray-400">Gráfico de pastel</p></div></div>
                        </div>
                    )}
                </div>
             )}
            <button onClick={() => { setMenuAbierto(!menuAbierto); setMenuView('main'); }} className={`w-16 h-16 rounded-2xl text-white shadow-2xl flex items-center justify-center transition-all duration-300 ${menuAbierto ? 'bg-slate-600 rotate-45' : 'bg-[#007aff] hover:scale-110'}`}>
                {menuAbierto ? <X size={32} /> : <Plus size={32} />}
            </button>
        </div>
      </div>

      <ActionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} type={modalType} onSave={handleSaveData} periods={periods} initialData={editingData} cardList={tarjetas} />
    </div>
  );
}

export default App;