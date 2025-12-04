import React, { useState } from 'react';
import { Icons } from '../components/ui/Icons';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useNavigation } from '../contexts/NavigationContext';

const Login = () => {
  const { users } = useData();
  const { login } = useAuth();
  const { navigate } = useNavigation();

  const [email, setEmail] = useState('admin@gymfix.pl');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      login(user);
      setError('');
      navigate('DASHBOARD');
    } else {
      setError('Nieprawidłowy email lub hasło');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-black p-4 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
      
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700 z-10">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
            <Icons.Wrench className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-2">GymFix WMS</h2>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Zaloguj się do systemu serwisowego</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all dark:bg-slate-700 dark:text-white"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hasło</label>
            <input 
              type="password" 
              required
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all dark:bg-slate-700 dark:text-white"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
              <Icons.Alert className="w-4 h-4" />
              {error}
            </div>
          )}

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md shadow-blue-200 dark:shadow-none">
            Zaloguj się
          </button>
        </form>

        <div className="mt-6 flex justify-center items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 py-2 rounded-lg">
          <Icons.Lock className="w-3 h-3" />
          Połączenie szyfrowane (SSL 256-bit)
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs text-center text-slate-400 dark:text-slate-500">Dostępne konta demo:</p>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            <button onClick={() => {setEmail('admin@gymfix.pl'); setPassword('password')}} className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600">Admin</button>
            <button onClick={() => {setEmail('magazyn@gymfix.pl'); setPassword('password')}} className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600">Magazyn</button>
            <button onClick={() => {setEmail('serwis@gymfix.pl'); setPassword('password')}} className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600">Serwis</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;