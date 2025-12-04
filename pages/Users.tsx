
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
  const { users, setUsers, updateUser } = useData();
  const { currentUser, hasPermission } = useAuth();
  
  // State for the user form (used for both Add and Edit)
  const [formData, setFormData] = useState<Partial<User>>({ 
    role: UserRole.TECHNICIAN,
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.TECHNICIAN] 
  });
  
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const canManageUsers = hasPermission('MANAGE_USERS');

  // Open modal for Creating a new user
  const handleOpenCreate = () => {
    setFormData({
      role: UserRole.TECHNICIAN,
      permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.TECHNICIAN],
      name: '', email: '', phone: '', position: '', password: ''
    });
    setEditingUserId(null);
    setShowModal(true);
  };

  // Open modal for Editing an existing user
  const handleOpenEdit = (user: User) => {
    setFormData({ ...user });
    setEditingUserId(user.id);
    setShowModal(true);
  };

  const handleRoleChange = (role: UserRole) => {
    // When changing role, should we reset permissions to default?
    // Usually yes, to provide a clean slate, but allow subsequent overrides.
    setFormData({
      ...formData,
      role,
      permissions: ROLE_DEFAULT_PERMISSIONS[role]
    });
  };

  const togglePermission = (perm: Permission) => {
    if (!formData.permissions) return;
    const has = formData.permissions.includes(perm);
    if (has) {
      setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== perm) });
    } else {
      setFormData({ ...formData, permissions: [...formData.permissions, perm] });
    }
  };

  const handleSaveUser = () => {
    if (editingUserId) {
      // Update existing
      if (formData.name && formData.email) {
        updateUser(editingUserId, formData);
        setShowModal(false);
      }
    } else {
      // Create new
      if (formData.name && formData.email && formData.password && formData.permissions) {
        const u: User = {
          id: `u${Date.now()}`,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          position: formData.position,
          role: formData.role!,
          permissions: formData.permissions,
          password: formData.password
        };
        setUsers([...users, u]);
        setShowModal(false);
      }
    }
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Zespół i Kontakty</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
             <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
             <input 
               type="text" 
               placeholder="Szukaj pracownika..." 
               className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:bg-slate-800 dark:text-white"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
          {canManageUsers && (
            <button 
              onClick={handleOpenCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Icons.Plus className="w-4 h-4" />
              <span className="hidden md:inline">Dodaj Użytkownika</span>
              <span className="md:hidden">Dodaj</span>
            </button>
          )}
        </div>
      </div>

      {showModal && canManageUsers && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 w-full max-w-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-lg mb-4 text-slate-800 dark:text-white">
              {editingUserId ? 'Edycja Pracownika' : 'Nowy Pracownik'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Imię i Nazwisko</label>
                <input className="w-full p-2 border dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Stanowisko</label>
                <input className="w-full p-2 border dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white" value={formData.position || ''} onChange={e => setFormData({...formData, position: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Email</label>
                <input className="w-full p-2 border dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Telefon</label>
                <input className="w-full p-2 border dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Rola Systemowa</label>
                <select className="w-full p-2 border dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white" value={formData.role} onChange={e => handleRoleChange(e.target.value as UserRole)}>
                  {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Hasło</label>
                <input type="password" placeholder={editingUserId ? "Pozostaw puste aby nie zmieniać" : ""} className="w-full p-2 border dark:border-slate-600 rounded dark:bg-slate-700 dark:text-white" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2 border-b dark:border-slate-700 pb-1">Uprawnienia szczegółowe:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 max-h-48 overflow-y-auto">
                {(Object.keys(PERMISSION_LABELS) as Permission[]).map(perm => (
                  <label key={perm} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 p-2 rounded transition-colors">
                    <input 
                      type="checkbox" 
                      checked={formData.permissions?.includes(perm) || false} 
                      onChange={() => togglePermission(perm)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    {PERMISSION_LABELS[perm]}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">Anuluj</button>
              <button onClick={handleSaveUser} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow-md transition-colors font-medium">
                {editingUserId ? 'Zapisz Zmiany' : 'Utwórz Konto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Directory Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(u => (
          <div key={u.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col gap-4 relative group hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg font-bold text-slate-600 dark:text-slate-300">
                  {u.name.substring(0,2)}
                </div>
                <div>
                   <h3 className="font-bold text-slate-800 dark:text-white text-lg">{u.name}</h3>
                   <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{u.position || u.role}</p>
                </div>
              </div>
              {canManageUsers && (
                 <div className="flex gap-1">
                   <button onClick={() => handleOpenEdit(u)} className="text-slate-300 hover:text-blue-500 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors" title="Edytuj">
                      <Icons.Edit className="w-4 h-4" />
                   </button>
                   {u.id !== currentUser?.id && (
                     <button onClick={() => handleDeleteUser(u.id)} className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors" title="Usuń">
                        <Icons.Trash className="w-4 h-4" />
                     </button>
                   )}
                 </div>
              )}
            </div>

            <div className="space-y-2 mt-2">
               <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                 <Icons.Users className="w-4 h-4 text-slate-400" />
                 <span>{u.email}</span>
               </div>
               <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                 <div className="w-4 flex justify-center"><span className="text-xs font-bold">T</span></div>
                 <span>{u.phone || 'Brak numeru'}</span>
               </div>
            </div>

            {canManageUsers && (
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs text-slate-400">
                 <span>Rola: {u.role}</span>
                 <span>Uprawnień: {u.permissions.length}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;
