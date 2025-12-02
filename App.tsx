import React, { useEffect } from 'react';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Inventory from './pages/Inventory';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Users from './pages/Users';
import Settings from './pages/Settings';

const MainController = () => {
  const { currentUser } = useAuth();
  const { currentView, navigate } = useNavigation();

  // Redirect logic
  useEffect(() => {
    if (!currentUser && currentView !== 'LOGIN') {
      navigate('LOGIN');
    } else if (currentUser && currentView === 'LOGIN') {
      navigate('DASHBOARD');
    }
  }, [currentUser, currentView, navigate]);

  if (currentView === 'LOGIN') {
    return <Login />;
  }

  // Helper to ensure we don't render layout if not logged in (flashing fix)
  if (!currentUser) return null;

  return (
    <Layout>
      {currentView === 'DASHBOARD' && <Dashboard />}
      {currentView === 'JOBS' && <Jobs />}
      {currentView === 'JOB_DETAIL' && <JobDetail />}
      {currentView === 'INVENTORY' && <Inventory />}
      {currentView === 'CLIENTS' && <Clients />}
      {currentView === 'CLIENT_DETAIL' && <ClientDetail />}
      {currentView === 'USERS' && <Users />}
      {currentView === 'SETTINGS' && <Settings />}
    </Layout>
  );
};

const App = () => {
  return (
    <DataProvider>
      <NavigationProvider>
        <AuthProvider>
          <MainController />
        </AuthProvider>
      </NavigationProvider>
    </DataProvider>
  );
};

export default App;