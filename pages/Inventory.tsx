
import React, { useState } from 'react';
import { Icons } from '../components/ui/Icons';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Part, PartCategory, PartType, BOMItem } from '../types';
import BarcodeScanner from '../components/BarcodeScanner';

const Inventory = () => {
  const { parts, setParts, addStock, updatePart, assemblePart, disassemblePart } = useData();
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  // State for Create/Edit Part
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPart, setNewPart] = useState<Partial<Part>>({ 
    category: PartCategory.MECHANICAL, 
    type: PartType.SINGLE,
    quantity: 0, 
    minLevel: 0, 
    price: 0,
    bom: []
  });

  // State for Assembly Actions (Build/Dismantle Modal)
  const [actionModal, setActionModal] = useState<{ type: 'BUILD' | 'DISMANTLE', part: Part } | null>(null);
  const [actionQuantity, setActionQuantity] = useState(1);

  const canManageInventory = hasPermission('MANAGE_INVENTORY');
  const canEditPrices = hasPermission('EDIT_PRICES');

  const filteredParts = parts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateForm = () => {
    setEditingId(null);
    setNewPart({ 
      category: PartCategory.MECHANICAL, 
      type: PartType.SINGLE, 
      quantity: 0, 
      minLevel: 0, 
      price: 0, 
      bom: [] 
    });
    setShowAddForm(true);
  };

  const openEditForm = (part: Part) => {
    setEditingId(part.id);
    setNewPart({ ...part, bom: part.bom || [] });
    setShowAddForm(true);
  };

  const handleSavePart = () => {
    if(!newPart.name || !newPart.sku) return;

    const commonData = {
      name: newPart.name,
      sku: newPart.sku,
      category: newPart.category as PartCategory,
      type: newPart.type as PartType,
      quantity: Number(newPart.quantity),
      minLevel: Number(newPart.minLevel),
      price: Number(newPart.price),
      location: newPart.location || 'Magazyn',
      bom: newPart.type === PartType.ASSEMBLY ? newPart.bom : undefined
    };

    if (editingId) {
      updatePart(editingId, commonData);
    } else {
      const p: Part = {
        id: `p${Date.now()}`,
        ...commonData
      };
      setParts([...parts, p]);
    }
    
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleScan = (code: string) => {
    setSearchTerm(code);
    setShowScanner(false);
  };

  const handleAddBOMItem = (partId: string) => {
    if (!newPart.bom) return;
    const existing = newPart.bom.find(b => b.partId === partId);
    if (existing) {
       // Already in BOM
    } else {
      setNewPart({
        ...newPart,
        bom: [...newPart.bom, { partId, quantity: 1 }]
      });
    }
  };

  const updateBOMQuantity = (partId: string, qty: number) => {
    if (!newPart.bom) return;
    setNewPart({
      ...newPart,
      bom: newPart.bom.map(b => b.partId === partId ? { ...b, quantity: qty } : b)
    });
  };

  const removeBOMItem = (partId: string) => {
    if (!newPart.bom) return;
    setNewPart({
      ...newPart,
      bom: newPart.bom.filter(b => b.partId !== partId)
    });
  };

  const executeAssemblyAction = () => {
    if (!actionModal) return;
    if (actionModal.type === 'BUILD') {
      assemblePart(actionModal.part.id, actionQuantity);
    } else {
      disassemblePart(actionModal.part.id, actionQuantity);
    }
    setActionModal(null);
    setActionQuantity(1);
  };

  return (
    <div className="space-y-6">
      {showScanner && (
        <BarcodeScanner 
          onScan={handleScan} 
          onClose={() => setShowScanner(false)} 
        />
      )}

      {/* ASSEMBLY ACTION MODAL */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 border dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              {actionModal.type === 'BUILD' ? 'Montaż (Złóż)' : 'Demontaż (Rozbierz)'}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">{actionModal.part.name}</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ilość operacji</label>
              <div className="flex items-center gap-3">
                 <button onClick={() => setActionQuantity(Math.max(1, actionQuantity - 1))} className="p-2 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200"><Icons.Minus className="w-4 h-4" /></button>
                 <span className="text-xl font-bold w-12 text-center dark:text-white">{actionQuantity}</span>
                 <button onClick={() => setActionQuantity(actionQuantity + 1)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200"><Icons.Plus className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setActionModal(null)} className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white rounded hover:bg-slate-300">Anuluj</button>
              <button onClick={executeAssemblyAction} className={`flex-1 py-2 text-white rounded shadow-sm ${actionModal.type === 'BUILD' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'}`}>
                Wykonaj
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Magazyn Części</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial flex gap-2">
            <div className="relative flex-1">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Szukaj po nazwie lub SKU..." 
                className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:bg-slate-800 dark:text-white"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowScanner(true)}
              className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              title="Skanuj kod kreskowy"
            >
              <Icons.Scan className="w-5 h-5" />
            </button>
          </div>
          {canManageInventory && (
            <button 
              onClick={openCreateForm}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Icons.Plus className="w-4 h-4" />
              <span className="hidden md:inline">Dodaj Nową</span>
              <span className="md:hidden">Dodaj</span>
            </button>
          )}
        </div>
      </div>

      {showAddForm && canManageInventory && (
        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-blue-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-4 shadow-lg">
           <h3 className="font-semibold mb-4 text-slate-700 dark:text-slate-200 text-lg">
             {editingId ? 'Edycja części / produktu' : 'Dodawanie nowej części'}
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nazwa</label>
                <input className="w-full p-2 border dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white" value={newPart.name || ''} onChange={e => setNewPart({...newPart, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">SKU</label>
                <input className="w-full p-2 border dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white" value={newPart.sku || ''} onChange={e => setNewPart({...newPart, sku: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Kategoria</label>
                <select className="w-full p-2 border dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white" value={newPart.category} onChange={e => setNewPart({...newPart, category: e.target.value as PartCategory})}>
                  {Object.values(PartCategory).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Typ Elementu</label>
                <select className="w-full p-2 border dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white" value={newPart.type} onChange={e => setNewPart({...newPart, type: e.target.value as PartType})}>
                   <option value={PartType.SINGLE}>Pojedyncza Część</option>
                   <option value={PartType.ASSEMBLY}>Produkt Złożony (BOM)</option>
                </select>
              </div>
              <div>
                 <label className="block text-xs font-medium text-slate-500 mb-1">Lokalizacja</label>
                 <input className="w-full p-2 border dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white" value={newPart.location || ''} onChange={e => setNewPart({...newPart, location: e.target.value})} />
              </div>
              <div>
                 <label className="block text-xs font-medium text-slate-500 mb-1">Ilość aktualna</label>
                 <input type="number" className="w-full p-2 border dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white" value={newPart.quantity} onChange={e => setNewPart({...newPart, quantity: Number(e.target.value)})} />
              </div>
              <div>
                 <label className="block text-xs font-medium text-slate-500 mb-1">Min. stan</label>
                 <input type="number" className="w-full p-2 border dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white" value={newPart.minLevel} onChange={e => setNewPart({...newPart, minLevel: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Cena PLN</label>
                <input 
                  type="number" 
                  className={`w-full p-2 border dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white ${!canEditPrices ? 'bg-slate-100 dark:bg-slate-900 text-slate-400' : ''}`}
                  value={newPart.price} 
                  onChange={e => setNewPart({...newPart, price: Number(e.target.value)})} 
                  disabled={!canEditPrices}
                />
              </div>
           </div>

           {/* BOM EDITOR */}
           {newPart.type === PartType.ASSEMBLY && (
             <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
               <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                 <Icons.Layers className="w-4 h-4" /> Edycja Składników Zestawu (BOM)
               </h4>
               
               <div className="flex gap-2 mb-3">
                 <select 
                   className="flex-1 p-2 border rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white text-sm"
                   onChange={(e) => {
                     if(e.target.value) {
                       handleAddBOMItem(e.target.value);
                       e.target.value = "";
                     }
                   }}
                 >
                   <option value="">+ Dodaj składnik z listy</option>
                   {parts.filter(p => p.type === PartType.SINGLE).map(p => (
                     <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                   ))}
                 </select>
               </div>

               <div className="space-y-2">
                 {newPart.bom?.map((item) => {
                   const partDetails = parts.find(p => p.id === item.partId);
                   return (
                     <div key={item.partId} className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                        <span className="text-sm dark:text-slate-200">{partDetails?.name}</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            min="1" 
                            className="w-16 p-1 border rounded text-center dark:bg-slate-700 dark:text-white dark:border-slate-600" 
                            value={item.quantity} 
                            onChange={(e) => updateBOMQuantity(item.partId, Number(e.target.value))}
                          />
                          <button onClick={() => removeBOMItem(item.partId)} className="text-red-500 hover:text-red-700"><Icons.Trash className="w-4 h-4" /></button>
                        </div>
                     </div>
                   );
                 })}
                 {(!newPart.bom || newPart.bom.length === 0) && (
                   <p className="text-xs text-slate-500 italic text-center">Dodaj części składowe, aby utworzyć zestaw.</p>
                 )}
               </div>
             </div>
           )}

           <div className="flex gap-2 mt-6">
             <button onClick={handleSavePart} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow-sm font-medium">
                {editingId ? 'Zapisz Zmiany' : 'Utwórz Produkt'}
             </button>
             <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 dark:text-white rounded hover:bg-slate-300 dark:hover:bg-slate-500">Anuluj</button>
           </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-3 min-w-[200px]">Nazwa</th>
                <th className="px-4 py-3 hidden md:table-cell">Kategoria</th>
                <th className="px-4 py-3 text-center">Dostępne</th>
                <th className="px-4 py-3 text-center">Lokalizacja</th>
                <th className="px-4 py-3 text-right">Cena</th>
                {canManageInventory && <th className="px-4 py-3 text-center">Akcje</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredParts.map(part => (
                <tr key={part.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                       {part.type === PartType.ASSEMBLY && (
                         <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded text-purple-600 dark:text-purple-400" title="Produkt Złożony">
                           <Icons.Layers className="w-4 h-4" />
                         </div>
                       )}
                       <div>
                         <div className="font-medium text-slate-800 dark:text-white">{part.name}</div>
                         <div className="text-xs text-slate-400">{part.sku}</div>
                       </div>
                    </div>
                    {part.type === PartType.ASSEMBLY && part.bom && (
                      <div className="mt-1 text-xs text-slate-500 hidden group-hover:block transition-all">
                        Skład: {part.bom.length} komponentów
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs">
                      {part.category}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-center font-bold ${part.quantity <= part.minLevel ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {part.quantity}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400 whitespace-nowrap">{part.location}</td>
                  <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300 whitespace-nowrap">{part.price.toFixed(2)} zł</td>
                  {canManageInventory && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEditForm(part)} className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded" title="Edytuj (BOM/Dane)">
                          <Icons.Edit className="w-4 h-4" />
                        </button>
                        
                        <button onClick={() => addStock(part.id, 1)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded" title="Szybkie dodanie (1 szt)">
                          <Icons.Plus className="w-5 h-5" />
                        </button>
                        
                        {part.type === PartType.ASSEMBLY && (
                          <>
                            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                            <button onClick={() => setActionModal({ type: 'BUILD', part })} className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded" title="Zmontuj zestaw">
                              <Icons.Build className="w-4 h-4" />
                            </button>
                            <button onClick={() => setActionModal({ type: 'DISMANTLE', part })} className="p-1.5 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded" title="Rozbierz zestaw">
                              <Icons.Dismantle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
