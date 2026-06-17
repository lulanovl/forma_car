import { useState, useEffect } from 'react';
import { getToken, isAuthenticated, getRole, clearToken } from './utils/auth.js';
import { getCarwashConfig } from './api/index.js';
import { applyTheme } from './utils/theme.js';
import { toastInfo, toastError } from './components/toast.js';
import SitePage from './pages/site/SitePage.jsx';
import CrmPage from './pages/crm/CrmPage.jsx';
import ChecklistView from './pages/crm/ChecklistView.jsx';
import PlatformPage from './pages/platform/PlatformPage.jsx';
import LoginModal from './components/LoginModal.jsx';
import NewOrderModal from './components/NewOrderModal.jsx';

// Where an authenticated user lands: platform owners get the super-admin, others the CRM.
function homeViewForRole() {
  return getRole() === 'platform_owner' ? 'platform' : 'crm';
}

export default function App() {
  const [view, setView] = useState(() => {
    const saved = sessionStorage.getItem('fc_view');
    if ((saved === 'crm' || saved === 'platform') && isAuthenticated()) return homeViewForRole();
    return 'site';
  });
  const [crmPanel, setCrmPanel] = useState(() => sessionStorage.getItem('fc_panel') || 'dash');
  const [loginOpen, setLoginOpen] = useState(false);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [checklistOrderId, setChecklistOrderId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [siteConfig, setSiteConfig] = useState(null);

  // Load this carwash's public config (branding/contacts) once on mount
  useEffect(() => {
    getCarwashConfig()
      .then((cfg) => {
        setSiteConfig(cfg);
        applyTheme(cfg);
        if (cfg?.name) document.title = cfg.name;
      })
      .catch(() => { /* fall back to built-in defaults in SitePage */ });
  }, []);

  // Persist navigation state across reloads
  useEffect(() => { sessionStorage.setItem('fc_view', view); }, [view]);
  useEffect(() => { sessionStorage.setItem('fc_panel', crmPanel); }, [crmPanel]);

  // SSE connection — active only while in CRM view
  useEffect(() => {
    if (view !== 'crm') return;
    const token = getToken();
    if (!token) return;

    const source = new EventSource(`/api/events?token=${encodeURIComponent(token)}`);

    source.addEventListener('new_order', (e) => {
      const data = JSON.parse(e.data);
      toastInfo(`Новая заявка ${data.order_number} — ${data.client_name}`);
      setRefreshKey(k => k + 1);
    });

    source.addEventListener('order_updated', () => {
      setRefreshKey(k => k + 1);
    });

    source.onerror = () => source.close();

    return () => source.close();
  }, [view]);

  // Open CRM when navigated to /#crm
  useEffect(() => {
    if (window.location.hash === '#crm') {
      window.location.hash = '';
      handleCrmClick();
    }
  }, []);

  // Listen for auth expiry from API client
  useEffect(() => {
    const handler = () => {
      sessionStorage.removeItem('fc_view');
      setView('site');
      toastError('Сессия истекла, войдите снова');
    };
    window.addEventListener('auth:expired', handler);
    return () => window.removeEventListener('auth:expired', handler);
  }, []);

  function handleCrmClick() {
    if (isAuthenticated()) {
      setView(homeViewForRole());
    } else {
      setLoginOpen(true);
    }
  }

  function handleLogout() {
    clearToken();
    sessionStorage.removeItem('fc_view');
    setView('site');
  }

  function handleOpenChecklist(orderId) {
    setChecklistOrderId(orderId);
    setView('checklist');
  }

  function handleChecklistBack() {
    setView('crm');
    setRefreshKey(k => k + 1);
  }

  return (
    <>
      {view === 'site' && (
        <SitePage config={siteConfig} />
      )}
      {view === 'crm' && (
        <CrmPage
          panel={crmPanel}
          onPanelChange={setCrmPanel}
          refreshKey={refreshKey}
          onRefresh={() => setRefreshKey(k => k + 1)}
          onNewOrder={() => setNewOrderOpen(true)}
          onOpenChecklist={handleOpenChecklist}
          onBackSite={() => setView('site')}
        />
      )}
      {view === 'checklist' && (
        <ChecklistView
          orderId={checklistOrderId}
          onBack={handleChecklistBack}
        />
      )}
      {view === 'platform' && (
        <PlatformPage
          onBackSite={() => setView('site')}
          onLogout={handleLogout}
        />
      )}
      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSuccess={() => { setLoginOpen(false); setView(homeViewForRole()); }}
        />
      )}
      {newOrderOpen && (
        <NewOrderModal
          onClose={() => setNewOrderOpen(false)}
          onSuccess={() => { setNewOrderOpen(false); setRefreshKey(k => k + 1); }}
        />
      )}
    </>
  );
}
