import React, { useState } from 'react';
import { Icons } from '../components/ui/Icons';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Part, PartCategory } from '../types';

const Inventory = () => {
  const { parts, setParts, addStock } = useData();
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newPart, setNewPart] = useState<Partial<Part>>({ category: PartCategory.MECHANICAL, quantity: 0, minLevel: 0, price: 0 });

  const canManageInventory = hasPermission('MANAGE_INVENTORY');
  const canEditPrices = hasPermission('EDIT_PRICES');

  const filteredParts = parts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePart = () => {
    if(!newPart.name || !newPart.sku) return;
    const p: Part = {
      id: `p${Date.now()}`,
      name: newPart.name,
      sku: newPart.sku,
      category: newPart.category as PartCategory,
      quantity: Number(newPart.quantity),
      minLevel: Number(newPart.minLevel),
      price: Number(newPart.price),
      location: newPart.location || 'Magazyn'
    };
    setParts([...parts, p]);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Magazyn Części</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Szukaj po nazwie lub SKU..." 
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {canManageInventory && (
            <button 
              onClick={() => setShowAddForm(true)}
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
        <div className="bg-slate-50 p-4 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-4">
           <h3 className="font-semibold mb-3 text-slate-700">Dodawanie nowej części</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <input placeholder="Nazwa" className="p-2 border rounded" value={newPart.name || ''} onChange={e => setNewPart({...newPart, name: e.target.value})} />
              <input placeholder="SKU" className="p-2 border rounded" value={newPart.sku || ''} onChange={e => setNewPart({...newPart, sku: e.target.value})} />
              <select className="p-2 border rounded" value={newPart.category} onChange={e => setNewPart({...newPart, category: e.target.value as PartCategory})}>
                {Object.values(PartCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input placeholder="Lokalizacja (np. A-01)" className="p-2 border rounded" value={newPart.location || ''} onChange={e => setNewPart({...newPart, location: e.target.value})} />
              <input type="number" placeholder="Ilość" className="p-2 border rounded" value={newPart.quantity} onChange={e => setNewPart({...newPart, quantity: Number(e.target.value)})} />
              <input type="number" placeholder="Min. stan" className="p-2 border rounded" value={newPart.minLevel} onChange={e => setNewPart({...newPart, minLevel: Number(e.target.value)})} />
              <input 
                type="number" 
                placeholder="Cena PLN" 
                className={`p-2 border rounded ${!canEditPrices ? 'bg-slate-100 text-slate-400' : ''}`}
                value={newPart.price} 
                onChange={e => setNewPart({...newPart, price: Number(e.target.value)})} 
                disabled={!canEditPrices}
              />
              <div className="flex gap-2 col-span-2 md:col-span-1">
                <button onClick={handleCreatePart} className="flex-1 bg-green-600 text-white rounded hover:bg-green-700">Zapisz</button>
                <button onClick={() => setShowAddForm(false)} className="px-3 bg-slate-200 rounded hover:bg-slate-300">Anuluj</button>
              </div>
           </div>
           {!canEditPrices && <p className="text-xs text-orange-600 mt-2">Brak uprawnień do edycji cen (użyta zostanie cena 0.00 PLN)</p>}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-4 py-3 min-w-[200px]">Nazwa</th>
                <th className="px-4 py-3 hidden md:table-cell">Kategoria</th>
                <th className="px-4 py-3 text-center">Dostępne</th>
                <th className="px-4 py-3 text-center">Lokalizacja</th>
                <th className="px-4 py-3 text-right">Cena</th>
                {canManageInventory && <th className="px-4 py-3 text-center">Przyjęcie</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParts.map(part => (
                <tr key={part.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{part.name}</div>
                    <div className="text-xs text-slate-400">{part.sku}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs">
                      {part.category}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-center font-bold ${part.quantity <= part.minLevel ? 'text-red-600' : 'text-slate-700'}`}>
                    {part.quantity}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-500 whitespace-nowrap">{part.location}</td>
                  <td className="px-4 py-3 text-right text-slate-600 whitespace-nowrap">{part.price.toFixed(2)} zł</td>
                  {canManageInventory && (
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => addStock(part.id, 1)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Icons.Plus className="w-5 h-5" />
                      </button>
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