import React, { useState } from 'react';
import { Icons } from '../components/ui/Icons';
import { useData, ROLE_DEFAULT_PERMISSIONS } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { User, UserRole, Permission } from '../types';

const PERMISSION_LABELS: Record<Permission, string> = {
  MANAGE_USERS: 'Zarządzanie Użytkownikami',
  VIEW_INVENTORY: 'Podgląd Magazynu',
  MANAGE_INVENTORY: 'Edycja Magazynu (Dodawanie/Stany)',
  EDIT_PRICES: 'Edycja Cen',
  VIEW_JOBS: 'Podgląd Zleceń',
  MANAGE_JOBS: 'Obsługa Zleceń (Serwis)',
  VIEW_CLIENTS: 'Podgląd Klientów',
  MANAGE_CLIENTS: 'Edycja Klientów'
};

const Users = () => {
  const { users, setUsers } = useData();
  const { currentUser } = useAuth();
  
  const [newUser, setNewUser] = useState<Partial<User>>({ 
    role: UserRole.TECHNICIAN,
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.TECHNICIAN] 
  });
  const [showAddUser, setShowAddUser] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setNewUser({
      ...newUser,
      role,
      permissions: ROLE_DEFAULT_PERMISSIONS[role]
    });
  };

  const togglePermission = (perm: Permission) => {
    if (!newUser.permissions) return;
    const has = newUser.permissions.includes(perm);
    if (has) {
      setNewUser({ ...newUser, permissions: newUser.permissions.filter(p => p !== perm) });
    } else {
      setNewUser({ ...newUser, permissions: [...newUser.permissions, perm] });
    }
  };

  const handleCreateUser = () => {
    if (newUser.name && newUser.email && newUser.password && newUser.permissions) {
      const u: User = {
        id: `u${Date.now()}`,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role!,
        permissions: newUser.permissions,
        password: newUser.password
      };
      setUsers([...users, u]);
      setShowAddUser(false);
      setNewUser({ role: UserRole.TECHNICIAN, permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.TECHNICIAN] });
    }
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Zarządzanie Użytkownikami</h2>
        <button 
          onClick={() => setShowAddUser(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Icons.Plus className="w-4 h-4" />
          <span className="hidden md:inline">Dodaj Użytkownika</span>
          <span className="md:hidden">Dodaj</span>
        </button>
      </div>

      {showAddUser && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 mb-6">
          <h3 className="font-semibold text-lg mb-4">Nowy Pracownik</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Imię i Nazwisko" className="p-2 border rounded" value={newUser.name || ''} onChange={e => setNewUser({...newUser, name: e.target.value})} />
            <input placeholder="Email" className="p-2 border rounded" value={newUser.email || ''} onChange={e => setNewUser({...newUser, email: e.target.value})} />
            <input type="password" placeholder="Hasło" className="p-2 border rounded" value={newUser.password || ''} onChange={e => setNewUser({...newUser, password: e.target.value})} />
            <select className="p-2 border rounded" value={newUser.role} onChange={e => handleRoleChange(e.target.value as UserRole)}>
              {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium text-slate-700 mb-2">Uprawnienia szczegółowe:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
              {(Object.keys(PERMISSION_LABELS) as Permission[]).map(perm => (
                <label key={perm} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-100 p-1 rounded">
                  <input 
                    type="checkbox" 
                    checked={newUser.permissions?.includes(perm) || false} 
                    onChange={() => togglePermission(perm)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  {PERMISSION_LABELS[perm]}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowAddUser(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Anuluj</button>
            <button onClick={handleCreateUser} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Utwórz Konto</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 min-w-[150px]">Pracownik</th>
                <th className="px-6 py-3 min-w-[120px]">Rola</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3 hidden md:table-cell">Uprawnienia</th>
                <th className="px-6 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap
                      ${u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : ''}
                      ${u.role === UserRole.WAREHOUSE ? 'bg-orange-100 text-orange-700' : ''}
                      ${u.role === UserRole.TECHNICIAN ? 'bg-blue-100 text-blue-700' : ''}
                    `}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{u.email}</td>
                  <td className="px-6 py-4 text-xs text-slate-400 hidden md:table-cell">
                    <span title={u.permissions.join(', ')}>
                      {u.permissions.length} aktywnych
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.id !== currentUser?.id && (
                      <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                        <Icons.Trash className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;