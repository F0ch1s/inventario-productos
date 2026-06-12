import { atom } from 'nanostores';

export type AppSettings = {
  companyName: string;
  currency: 'PEN' | 'USD' | 'EUR';
  defaultReportFormat: 'pdf' | 'excel';
  lowStockThreshold: number;
  compactTables: boolean;
  notifications: boolean;
  autoSave: boolean;
  language: 'es' | 'en';
};

export const defaultSettings: AppSettings = {
  companyName: 'Mi Empresa',
  currency: 'PEN',
  defaultReportFormat: 'pdf',
  lowStockThreshold: 70,
  compactTables: false,
  notifications: true,
  autoSave: true,
  language: 'es',
};

const STORAGE_KEY = 'kardexpro.settings';

function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return defaultSettings;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export const $settings = atom<AppSettings>(loadSettings());

export function updateSettings(patch: Partial<AppSettings>) {
  const nextSettings = { ...$settings.get(), ...patch };
  $settings.set(nextSettings);

  if (
    typeof window !== 'undefined' &&
    (nextSettings.autoSave || Object.prototype.hasOwnProperty.call(patch, 'autoSave'))
  ) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings));
  }
}

export function formatMoney(value: number, currency?: AppSettings['currency']) {
  const resolvedCurrency = currency ?? $settings.get().currency;
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: resolvedCurrency,
    maximumFractionDigits: 2,
  }).format(value);
}
