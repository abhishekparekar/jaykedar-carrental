import { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToTenantSettings, updateTenantSettings, ensureTenantInitialData, DEFAULT_TENANT_SETTINGS } from '../firebase/firestore';

const DEFAULT_TENANT_ID = 'jaykedar-carrental';

function deriveTenantId() {
  if (typeof window === 'undefined') return DEFAULT_TENANT_ID;

  // 1. Explicit query parameter (?tenant=jaykedar-carrental)
  try {
    const params = new URLSearchParams(window.location.search);
    const queryTenant = params.get('tenant');
    if (queryTenant) {
      localStorage.setItem('tenantId', queryTenant);
      return queryTenant;
    }
  } catch (e) {
    // ignore
  }

  // 2. Local storage override (cleanup legacy value if present)
  try {
    const saved = localStorage.getItem('tenantId');
    if (saved && saved !== 'tenants-car-website-crm') {
      return saved;
    } else if (saved === 'tenants-car-website-crm') {
      localStorage.setItem('tenantId', DEFAULT_TENANT_ID);
    }
  } catch (e) {
    // ignore
  }

  // 3. Domain/Subdomain matching
  const hostname = window.location.hostname;
  if (
    !hostname ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.includes('vercel.app') ||
    hostname.includes('netlify.app') ||
    hostname.includes('github.io') ||
    hostname.includes('onrender.com') ||
    hostname.split('.').length <= 2
  ) {
    return DEFAULT_TENANT_ID;
  }
  const subdomain = hostname.split('.')[0];
  if (['www', 'app', 'admin', 'carrental-pune', 'nextrent', 'vk-carrentalpune', 'tenants-car-website-crm', 'jaykedar-carrental'].includes(subdomain.toLowerCase())) {
    return DEFAULT_TENANT_ID;
  }
  return subdomain;
}

const TenantContext = createContext({
  tenantId: DEFAULT_TENANT_ID,
  settings: DEFAULT_TENANT_SETTINGS,
  updateSettings: async () => {},
});

export function TenantProvider({ children, tenantId }) {
  const resolvedId = tenantId || deriveTenantId();
  const [settings, setSettings] = useState(DEFAULT_TENANT_SETTINGS);

  useEffect(() => {
    // Check and seed initial data if tenant's Firestore is fresh/empty
    ensureTenantInitialData(resolvedId);

    const unsub = subscribeToTenantSettings(resolvedId, (data) => {
      setSettings(data);
    });
    return () => unsub();
  }, [resolvedId]);

  const handleUpdateSettings = async (newSettings, adminUid) => {
    await updateTenantSettings(resolvedId, newSettings, adminUid);
  };

  return (
    <TenantContext.Provider value={{
      tenantId: resolvedId,
      settings,
      updateSettings: handleUpdateSettings,
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
