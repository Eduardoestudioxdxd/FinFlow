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
import Auth from './assets/components/Auth.jsx'; 

// CONEXIÓN AL BACKEND
import * as api from './api.js';

function App() {
  const [user, setUser] = useState(() => {
      const savedUser = localStorage.getItem('mywallet_user');
      return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuView, setMenuView] = useState('main'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('budget');
  const [editingData, setEditingData] = useState(null); 
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); 
  const [isSidebarVisible, setIsSidebarVisible] = useState(true); 

  const [tarjetas, setTarjetas] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [dashboardWidgets, setDashboardWidgets] = useState([]);
  
  const [selectedPeriodId, setSelectedPeriodId] = useState(null); 
  const [dashboardPeriodId, setDashboardPeriodId] = useState(null);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
      setIsLoading(true);
      try {
          const [cardsData, periodsData, widgetsData] = await Promise.all([
              api.getCards(), api.getPeriods(), api.getWidgets()
          ]);

          setTarjetas(cardsData);
          
          const defaultWidgets = [
              { id: Date.now() + 1, type: 'chart', title: 'Análisis' },
              { id: Date.now() + 2, type: 'recent', title: 'Movimientos' }
          ];

          const periodsFixed = await Promise.all(periodsData.map(async (p) => {
              if (!p._id) return null;

              let needsUpdate = false;
              let updatedWidgets = p.widgets;
              let updatedMovements = p.movements;

              if (!p.widgets || p.widgets.length === 0) {
                  updatedWidgets = defaultWidgets.map(w => ({ ...w, id: Date.now() + Math.random() }));
                  needsUpdate = true;
              }

              if (p.movements && p.movements.length > 0) {
                  const seenIds = new Set();
                  updatedMovements = p.movements.map((m, index) => {
                      if (!m.id || seenIds.has(m.id)) {
                          needsUpdate = true;
                          const newId = Date.now() + index + Math.floor(Math.random() * 1000000);
                          seenIds.add(newId);
                          return { ...m, id: newId };
                      }
                      seenIds.add(m.id);
                      return m;
                  });
              }

              if (needsUpdate) {
                  const res = await api.updatePeriod(p._id, { widgets: updatedWidgets, movements: updatedMovements });
                  return res;
              }
              return p;
          }));
          
          const validPeriods = periodsFixed.filter(p => p !== null);
          setPeriods(validPeriods);
          
          if (widgetsData.length > 0) setDashboardWidgets(widgetsData);
          else {
              const defaults = [{ type: 'balance', title: 'Saldo Total', isFixed: true, order: 0 }, { type: 'chart', title: 'Estructura', isFixed: false, order: 1 }];
              setDashboardWidgets(defaults); api.saveWidgets(defaults); 
          }

          if (validPeriods.length > 0 && !dashboardPeriodId) { 
              setDashboardPeriodId(validPeriods[validPeriods.length - 1]._id); 
          }
      } catch (error) { 
          console.error("Error cargando datos:", error); 
      } finally { 
          setIsLoading(false); 
      }
  };

  const totalTarjetaGastado = tarjetas.reduce((acc, curr) => acc + curr.gasto, 0);
  const currentDashboardPeriod = periods.find(p => p._id === dashboardPeriodId) || (periods.length > 0 ? periods[0] : null);
  const dashboardBudget = currentDashboardPeriod ? currentDashboardPeriod.budget : 0;
  const dashboardSpent = currentDashboardPeriod ? currentDashboardPeriod.spent : 0;
  const dashboardBalance = dashboardBudget - dashboardSpent;
  const dashboardMovements = currentDashboardPeriod ? [...currentDashboardPeriod.movements].reverse().slice(0, 3) : [];

  const activePeriodForModal = (activeTab === 'quincenas' && selectedPeriodId) ? selectedPeriodId : dashboardPeriodId;

  useEffect(() => {
      if (user) localStorage.setItem('mywallet_user', JSON.stringify(user));
      else localStorage.removeItem('mywallet_user');
  }, [user]);

  const handleLogin = (userData) => { setUser(userData); };
  const handleLogout = () => { if(confirm("¿Cerrar sesión?")) { setUser(null); setIsUserMenuOpen(false); } };
  const handleSidebarClick = () => { setIsSidebarVisible(prev => !prev); }

  const handleSaveData = async (data) => {
    setIsLoading(true);
    try {
        let success = false;

        if (data.type === 'card') { 
            const newCard = { nombre: data.name, digitos: data.digitos, tipo: data.tipo, gasto: data.amount, limit: data.limit, color: data.color }; 
            const savedCard = await api.createCard(newCard); 
            setTarjetas([...tarjetas, savedCard]); 
            success = true;
        }
        else if (data.type === 'edit-card') { 
            const updatedCard = { nombre: data.name, digitos: data.digitos, tipo: data.tipo, gasto: data.amount, limit: data.limit, color: data.color }; 
            const res = await api.updateCard(data.id, updatedCard); 
            setTarjetas(tarjetas.map(t => t._id === data.id ? res : t)); 
            success = true;
        }
        else if (data.type === 'budget') { 
            const defaultWidgets = [{ id: Date.now() + 1, type: 'chart', title: 'Análisis' }, { id: Date.now() + 2, type: 'recent', title: 'Movimientos' }];
            const newPeriod = { name: data.name, budget: Number(data.amount), spent: 0, color: data.color, movements: [], widgets: defaultWidgets }; 
            const savedPeriod = await api.createPeriod(newPeriod); 
            setPeriods([...periods, savedPeriod]); 
            setDashboardPeriodId(savedPeriod._id); 
            setActiveTab('quincenas'); 
            success = true;
        }
        else if (data.type === 'edit-budget') { 
            const original = periods.find(p => p._id === data.id); 
            const updatedData = { ...original, name: data.name, budget: Number(data.amount), color: data.color }; 
            const res = await api.updatePeriod(data.id, updatedData); 
            setPeriods(periods.map(p => p._id === data.id ? res : p)); 
            success = true;
        } 
        else if (data.type === 'edit-movement') {
            const period = periods.find(p => p._id === data.periodId); 
            if (period) {
                const movIndex = period.movements.findIndex(m => m.id === data.id);
                if (movIndex > -1) {
                    const oldMov = period.movements[movIndex];
                    
                    const updatedMovement = { 
                        ...period.movements[movIndex], 
                        name: data.name, 
                        amount: Number(data.amount), 
                        iconKey: data.iconKey 
                    };
                    
                    const newMovements = [...period.movements];
                    newMovements[movIndex] = updatedMovement;

                    const recalculatedSpent = newMovements
                        .filter(m => m.type === 'expense' || m.type === 'card-expense')
                        .reduce((acc, m) => acc + Number(m.amount), 0);

                    let newBudget = period.budget;
                    if (updatedMovement.type === 'income') {
                         const diff = Number(data.amount) - Number(oldMov.amount);
                         newBudget += diff;
                    }

                    const updatedPeriodData = { 
                        ...period, 
                        budget: newBudget, 
                        spent: recalculatedSpent, 
                        movements: newMovements 
                    };
                    const res = await api.updatePeriod(period._id, updatedPeriodData);
                    setPeriods(periods.map(p => p._id === period._id ? res : p));
                    success = true;
                }
            }
        }
        else {
            if (data.type === 'card-payment' || data.type === 'card-expense' || (data.type === 'expense' && data.cardId)) {
                const cardIdToUpdate = data.cardId || editingData?._id;
                const currentCard = tarjetas.find(t => t._id === cardIdToUpdate);
                if (currentCard) { 
                    let newGasto = currentCard.gasto; 
                    if (data.type === 'card-payment') newGasto -= data.amount; 
                    else newGasto += data.amount;
                    const updatedCard = await api.updateCard(cardIdToUpdate, { gasto: newGasto }); 
                    setTarjetas(tarjetas.map(t => t._id === cardIdToUpdate ? updatedCard : t));
                }
            }
            
            if (data.type !== 'card-payment' && data.periodId) {
                const period = periods.find(p => p._id === data.periodId);
                if (period) {
                    let newSpent = period.spent; 
                    let newBudget = period.budget;
                    if (data.type === 'expense' || data.type === 'card-expense') newSpent += Number(data.amount); 
                    else if (data.type === 'income') newBudget += Number(data.amount);
                    
                    let finalName = data.name; 
                    const cardIdUsed = data.cardId || (data.type === 'card-expense' ? editingData?._id : null);
                    if (cardIdUsed) { 
                        const c = tarjetas.find(t => t._id === cardIdUsed); 
                        if (c) finalName = `${data.name} (${c.nombre})`; 
                    }
                    
                    const newMovement = { 
                        id: Date.now() + Math.floor(Math.random() * 1000000), 
                        name: finalName, 
                        amount: Number(data.amount), 
                        type: data.type === 'card-expense' ? 'expense' : data.type, 
                        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), 
                        iconKey: data.iconKey, 
                        cardId: cardIdUsed || '' 
                    }; 
                    const updatedPeriodData = { ...period, budget: newBudget, spent: newSpent, movements: [...period.movements, newMovement] };
                    const res = await api.updatePeriod(data.periodId, updatedPeriodData); 
                    setPeriods(periods.map(p => p._id === data.periodId ? res : p));
                    success = true;
                }
            }
        }
        
        if (success) {
            await fetchData(); 
            setTimeout(() => {
                setMenuAbierto(false); 
                setMenuView('main'); 
                setEditingData(null); 
                setIsModalOpen(false);
            }, 50);
        }

    } catch (error) { 
        console.error("Error guardando:", error); 
        alert("Hubo un error al guardar los datos."); 
        setIsLoading(false); 
        setIsModalOpen(false);
    } 
  };

  const handleAddCard = () => openModal('card');
  const handleEditCard = (card) => { setEditingData(card); setModalType('edit-card'); setIsModalOpen(true); };
  const handleDeleteCard = async (id) => { if(!confirm("¿Eliminar tarjeta?")) return; setIsLoading(true); try { await api.deleteCard(id); setTarjetas(tarjetas.filter(t => t._id !== id)); } catch (e) { console.error(e); } setIsLoading(false); };
  const handleCardExpense = (card) => { setEditingData(card); setModalType('card-expense'); setIsModalOpen(true); };
  const handleCardPayment = (card) => { setEditingData(card); setModalType('card-payment'); setIsModalOpen(true); };
  const openModal = (type) => { setModalType(type); setEditingData(null); setIsModalOpen(true); setMenuAbierto(false); };
  const openEditModal = (periodToEdit) => { setModalType('edit-budget'); setEditingData(periodToEdit); setIsModalOpen(true); };
  
  const handleEditMovement = (periodId, movement) => {
      setEditingData({ ...movement, periodId: periodId });
      setModalType('edit-movement');
      setIsModalOpen(true);
  };

  const deleteMovement = async (periodId, movementId, movementIndex) => { 
        if (!confirm("¿Borrar movimiento? Se reintegrará el valor.")) return; 
        setIsLoading(true); 
        try { 
            const period = periods.find(p => p._id === periodId); 
            if (period) { 
                const newMovements = [...period.movements];
                
                if (movementIndex >= 0 && movementIndex < newMovements.length) {
                    const deletedMov = newMovements[movementIndex];

                    // --- LÓGICA DE REEMBOLSO A TARJETA ---
                    if (deletedMov.cardId) {
                        const relatedCard = tarjetas.find(t => t._id === deletedMov.cardId);
                        if (relatedCard) {
                            const newDebt = Math.max(0, relatedCard.gasto - Number(deletedMov.amount));
                            await api.updateCard(relatedCard._id, { gasto: newDebt });
                            setTarjetas(prev => prev.map(t => 
                                t._id === relatedCard._id ? { ...t, gasto: newDebt } : t
                            ));
                        }
                    }
                    // -------------------------------------

                    newMovements.splice(movementIndex, 1);

                    const recalculatedSpent = newMovements
                        .filter(m => m.type === 'expense' || m.type === 'card-expense')
                        .reduce((acc, m) => acc + Number(m.amount), 0);

                    let newBudget = period.budget;
                    if (deletedMov.type === 'income') {
                        newBudget -= Number(deletedMov.amount);
                    }

                    const updatedPeriodData = { 
                        ...period, 
                        spent: recalculatedSpent, 
                        budget: newBudget, 
                        movements: newMovements 
                    }; 

                    const res = await api.updatePeriod(periodId, updatedPeriodData); 
                    setPeriods(periods.map(p => p._id === periodId ? res : p)); 
                    fetchData(); 
                } else {
                    console.error("Índice de movimiento inválido:", movementIndex);
                }
            } 
        } catch(e) { console.error(e); } finally { setIsLoading(false); } 
    };
  
  const handleAddDashboardWidget = async (type, title) => { const newWidget = { type, title, isFixed: false, order: dashboardWidgets.length }; const updatedList = [...dashboardWidgets, newWidget]; setDashboardWidgets(updatedList); await api.saveWidgets(updatedList); setMenuAbierto(false); setMenuView('main'); };

  const handleAddPeriodWidget = async (type, title) => {
    if (!selectedPeriodId) return;
    setIsLoading(true);
    try {
        const currentPeriod = periods.find(p => p._id === selectedPeriodId);
        if (currentPeriod) {
            const newWidget = { id: Date.now(), type, title };
            const newWidgetsList = [...(currentPeriod.widgets || []), newWidget];
            const res = await api.updatePeriod(selectedPeriodId, { widgets: newWidgetsList }); 
            setPeriods(periods.map(p => p._id === selectedPeriodId ? res : p));
            setMenuAbierto(false); setMenuView('main'); fetchData(); 
        }
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };
  
  const removeDashboardWidget = async (id) => { const newList = dashboardWidgets.filter(w => w._id !== id && w.id !== id); setDashboardWidgets(newList); await api.saveWidgets(newList); };
  
  const moveWidgetGeneric = async (list, setList, idx, dir) => { 
    const nl = [...list]; 
    const target = dir === 'up' ? idx - 1 : idx + 1; 
    if (target >= 0 && target < nl.length && !nl[target].isFixed) { 
      [nl[idx], nl[target]] = [nl[target], nl[idx]]; 
      setList(nl); await api.saveWidgets(nl); 
    } 
  };
  
  const movePeriodWidget = async (pId, idx, dir) => { 
    const pIdx = periods.findIndex(p => p._id === pId); 
    const newP = [...periods]; 
    if (newP[pIdx] && newP[pIdx].widgets) {
        const w = [...newP[pIdx].widgets]; 
        const target = dir === 'up' ? idx - 1 : idx + 1; 
        if (target >= 0 && target < w.length) { 
            [w[idx], w[target]] = [w[target], w[idx]]; 
            newP[pIdx].widgets = w; 
            await api.updatePeriod(pId, { widgets: w }); fetchData(); 
        } 
    }
  };

  const removePeriodWidget = async (pId, wId) => { 
    setIsLoading(true);
    try {
        const pIdx = periods.findIndex(p => p._id === pId); 
        const newP = [...periods]; 
        const newWidgets = (newP[pIdx].widgets || []).filter(w => w.id !== wId); 
        newP[pIdx].widgets = newWidgets; 
        setPeriods(newP); 
        await api.updatePeriod(pId, { widgets: newWidgets });
        fetchData(); 
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };
  const deletePeriod = async (id) => { if(confirm("¿Eliminar periodo?")) { setIsLoading(true); await api.deletePeriod(id); setPeriods(periods.filter(p => p._id !== id)); if(selectedPeriodId === id) setSelectedPeriodId(null); setIsLoading(false); } };

  const currentAddWidgetHandler = selectedPeriodId ? handleAddPeriodWidget : handleAddDashboardWidget;
  
  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-gray-50 dark:bg-[#0f172a] transition-colors duration-500 font-sans overflow-hidden">
        
        <aside className={`flex-col justify-between z-40 bg-white dark:bg-[#1e293b] border-r border-gray-200 dark:border-white/5 transition-all duration-300 ${isSidebarVisible ? 'w-20 lg:w-64' : 'w-0 overflow-hidden'}`}>
           <div className="flex flex-col h-full">
            <div onClick={handleSidebarClick} className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-100 dark:border-white/5 cursor-pointer">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg"><WalletIcon size={24} /></div>
              <span className="hidden lg:block ml-3 font-bold text-xl dark:text-white">Mi Wallet</span>
            </div>
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
          {isLoading && <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 z-50"><div className="h-full bg-emerald-500 animate-pulse w-1/3 mx-auto"></div></div>}

          <header className="h-20 flex items-center justify-between px-8 bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center gap-4">
                {!isSidebarVisible && <button onClick={handleSidebarClick} className="p-2 rounded-lg text-gray-400 hover:text-emerald-500 transition-colors"><WalletIcon size={24} /></button>}
                <h2 className="text-2xl font-bold dark:text-white">{activeTab === 'quincenas' && selectedPeriodId ? 'Detalle de Periodo' : activeTab === 'wallet' ? 'Mis Tarjetas' : 'Resumen Financiero'}</h2>
            </div>
            <div className="relative flex items-center gap-3">
                <span className="hidden md:block text-sm font-bold dark:text-white text-right">Hola, {user.name}</span>
                <button onClick={() => setIsUserMenuOpen(prev => !prev)} className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg text-lg ring-2 ring-transparent hover:ring-emerald-400 transition-shadow">{user.name.charAt(0).toUpperCase()}</button>
                {isUserMenuOpen && (
                    <div className="absolute top-12 right-0 w-48 bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl p-2 border border-gray-200 dark:border-slate-700 animate-fade-in-up origin-top-right z-50">
                        <button onClick={handleLogout} className="w-full flex items-center p-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><LogOut size={20} className="mr-3" /><span className="font-bold">Cerrar Sesión</span></button>
                    </div>
                )}
            </div>
          </header>

          <div className="p-8 max-w-7xl mx-auto pb-24">
            {activeTab === 'dashboard' && (
                <Dashboard 
                    widgets={dashboardWidgets} totalGastado={totalTarjetaGastado} periods={periods} selectedPeriodId={dashboardPeriodId} onSelectPeriod={setDashboardPeriodId}
                    globalBalance={dashboardBalance} globalIncome={dashboardBudget} globalExpense={dashboardSpent} recentTransactions={dashboardMovements}  
                    onNewExpense={() => openModal('expense')} onNewIncome={() => openModal('income')} onViewCards={() => setActiveTab('wallet')} onViewReport={() => setActiveTab('quincenas')}
                    moveWidget={(idx, dir) => moveWidgetGeneric(dashboardWidgets, setDashboardWidgets, idx, dir)} removeWidget={removeDashboardWidget} updateWidgetTitle={() => {}} 
                />
            )}
            
            {activeTab === 'quincenas' && (
                <>
                    {!selectedPeriodId && <PeriodList periods={periods} selectPeriod={setSelectedPeriodId} deletePeriod={deletePeriod} updatePeriod={() => {}} />}
                    {selectedPeriodId && periods.find(p => p._id === selectedPeriodId) && <PeriodDetail 
                        period={periods.find(p => p._id === selectedPeriodId)} 
                        onBack={() => setSelectedPeriodId(null)} 
                        onEdit={() => openEditModal(periods.find(p => p._id === selectedPeriodId))} 
                        onDeleteMovement={(movId, index) => deleteMovement(selectedPeriodId, movId, index)}
                        onEditMovement={(mov) => handleEditMovement(selectedPeriodId, mov)}
                        widgets={periods.find(p => p._id === selectedPeriodId).widgets || []} 
                        moveWidget={(idx, dir) => movePeriodWidget(selectedPeriodId, idx, dir)} 
                        removeWidget={(wId) => removePeriodWidget(selectedPeriodId, wId)} 
                        updateWidgetTitle={() => {}} 
                    />}
                </>
            )}
            
            {activeTab === 'wallet' && (
                <Wallet tarjetas={tarjetas} totalGastado={totalTarjetaGastado} onAddCard={handleAddCard} onEditCard={handleEditCard} onDeleteCard={handleDeleteCard} onCardExpense={handleCardExpense} onCardPayment={handleCardPayment} eliminarTarjeta={()=>{}} modifyingTarjeta={()=>{}} />
            )}
          </div>
        </main>

        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
             {menuAbierto && (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl p-2 mb-2 border border-gray-200 dark:border-slate-700 animate-fade-in-up origin-bottom-right w-64 overflow-hidden">
                    {menuView === 'main' && (
                        <>
                            {(activeTab === 'quincenas' || activeTab === 'dashboard') && (
                              <div onClick={() => openModal('budget')} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer flex items-center gap-3"><div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><CalendarRange size={18}/></div><p className="text-sm font-bold dark:text-white">Nuevo Presupuesto</p></div>
                            )}
                            <div className="h-px bg-gray-100 dark:bg-slate-700 my-2"></div>
                            <div onClick={() => openModal('expense')} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer flex items-center gap-3"><div className="bg-red-100 text-red-600 p-2 rounded-lg"><TrendingDown size={18}/></div><p className="text-sm font-bold dark:text-white">Gasto Rápido</p></div>
                            <div onClick={() => openModal('income')} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer flex items-center gap-3"><div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><TrendingUp size={18}/></div><p className="text-sm font-bold dark:text-white">Ingreso Rápido</p></div>
                            <div className="h-px bg-gray-100 dark:bg-slate-700 my-2"></div>
                            {(activeTab === 'dashboard' || (activeTab === 'quincenas' && selectedPeriodId)) && (
                              <div onClick={() => setMenuView('widgets')} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer flex items-center justify-between group"><div className="flex items-center gap-3"><div className="bg-purple-100 text-purple-600 p-2 rounded-lg"><LayoutTemplate size={18}/></div><p className="text-sm font-bold dark:text-white">Agregar Widget</p></div><ChevronLeft size={16} className="text-gray-400 rotate-180 group-hover:text-purple-500 transition-colors"/></div>
                            )}
                        </>
                    )}
                    {menuView === 'widgets' && (
                        <div className="animate-fade-in-right">
                            <div onClick={() => setMenuView('main')} className="flex items-center gap-2 mb-2 p-2 pb-0"><button onClick={() => setMenuView('main')} className="hover:bg-gray-100 dark:hover:bg-slate-700 p-1 rounded-lg"><ChevronLeft size={20} className="text-gray-500"/></button><span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Selecciona Tipo</span></div>
                            <div onClick={() => currentAddWidgetHandler('recent', 'Últimos Registros')} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer flex items-center gap-3"><div className="bg-orange-100 text-orange-600 p-2 rounded-lg"><List size={18}/></div><div><p className="text-sm font-bold dark:text-white">Resumen</p><p className="text-[10px] text-gray-400">Lista de movimientos</p></div></div>
                            <div onClick={() => currentAddWidgetHandler('chart', 'Estructura Gastos')} className="p-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer flex items-center gap-3"><div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg"><PieChart size={18}/></div><div><p className="text-sm font-bold dark:text-white">Estructura</p><p className="text-[10px] text-gray-400">Gráfico de pastel</p></div></div>
                        </div>
                    )}
                </div>
             )}
            <button onClick={() => { setMenuAbierto(!menuAbierto); setMenuView('main'); }} className={`w-16 h-16 rounded-2xl text-white shadow-2xl flex items-center justify-center transition-all duration-300 ${menuAbierto ? 'bg-slate-600 rotate-45' : 'bg-[#007aff] hover:scale-110'}`}>
                {menuAbierto ? <X size={32} /> : <Plus size={32} />}
            </button>
        </div>
        <ActionModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            type={modalType} 
            onSave={handleSaveData} 
            periods={periods} 
            initialData={editingData} 
            cardList={tarjetas} 
            defaultPeriodId={activePeriodForModal} 
        />
    </div>
  </div>
  );
}
export default App;