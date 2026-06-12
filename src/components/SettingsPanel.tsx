import { useState } from 'react';
import { Bell, CircleDollarSign, Database, LayoutGrid, Palette, ShieldCheck } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { $settings, type AppSettings, updateSettings } from '../stores/settingsStore';

export default function SettingsPanel() {
  const settings = useStore($settings);
  const [saved, setSaved] = useState(false);

  function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    updateSettings({ [key]: value } as Partial<AppSettings>);
    setSaved(true);
    window.clearTimeout((window as Window & { __settingsToast?: number }).__settingsToast);
    (window as Window & { __settingsToast?: number }).__settingsToast = window.setTimeout(() => {
      setSaved(false);
    }, 1800);
  }

  const sections = [
    {
      title: 'Preferencias generales',
      description: 'Ajustes básicos para la apariencia y el comportamiento del sistema.',
      icon: LayoutGrid,
    },
    {
      title: 'Moneda y reportes',
      description: 'Define moneda y el formato por defecto al exportar informes.',
      icon: CircleDollarSign,
    },
    {
      title: 'Inventario',
      description: 'Controla el umbral de stock bajo y la experiencia de trabajo.',
      icon: Database,
    },
    {
      title: 'Privacidad y avisos',
      description: 'Configura notificaciones y guardado automático.',
      icon: Bell,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
              <Palette className="h-3.5 w-3.5" />
              Configuración clásica
            </div>
            <h2 className="text-3xl font-serif italic text-slate-900">Panel de ajustes</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Aquí puedes definir las opciones tradicionales del sistema para que este módulo quede completo y útil.
            </p>
          </div>

          <div className={`rounded-2xl border px-4 py-3 text-sm ${saved ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600'}`}>
            {saved ? 'Configuración guardada' : 'Los cambios se guardan automáticamente'}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <h3 className="text-xl font-semibold text-slate-900">Información de la empresa</h3>
          <p className="mt-1 text-sm text-slate-500">Datos que pueden usarse como referencia en reportes y encabezados.</p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Nombre comercial</span>
              <input
                value={settings.companyName}
                onChange={e => updateSetting('companyName', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Idioma</span>
              <select
                value={settings.language}
                onChange={e => updateSetting('language', e.target.value as 'es' | 'en')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              >
                <option value="es">Español</option>
                <option value="en">Inglés</option>
              </select>
            </label>
          </div>
        </div>

        {sections.map(section => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{section.description}</p>
                </div>
              </div>

              {section.title === 'Moneda y reportes' && (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Moneda</span>
                    <select
                      value={settings.currency}
                      onChange={e => updateSetting('currency', e.target.value as AppSettings['currency'])}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                    >
                      <option value="PEN">Soles (PEN)</option>
                      <option value="USD">Dólares (USD)</option>
                      <option value="EUR">Euros (EUR)</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Formato por defecto</span>
                    <select
                      value={settings.defaultReportFormat}
                      onChange={e => updateSetting('defaultReportFormat', e.target.value as 'pdf' | 'excel')}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                    </select>
                  </label>
                </div>
              )}

              {section.title === 'Inventario' && (
                <div className="mt-5 space-y-4">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Umbral de stock bajo</span>
                    <input
                      type="number"
                      min={0}
                      value={settings.lowStockThreshold}
                      onChange={e => updateSetting('lowStockThreshold', Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                    />
                  </label>
                  <p className="text-xs text-slate-500">
                    Se considera stock crítico cuando el valor queda por debajo de este número.
                  </p>
                </div>
              )}

              {section.title === 'Privacidad y avisos' && (
                <div className="mt-5 space-y-3">
                  <ToggleRow
                    label="Notificaciones activas"
                    description="Muestra avisos cuando se importan o exportan datos."
                    checked={settings.notifications}
                    onChange={value => updateSetting('notifications', value)}
                  />
                  <ToggleRow
                    label="Guardado automático"
                    description="Guarda los cambios de configuración sin intervención manual."
                    checked={settings.autoSave}
                    onChange={value => updateSetting('autoSave', value)}
                  />
                  <ToggleRow
                    label="Tablas compactas"
                    description="Reduce el espaciado para ver más información en pantalla."
                    checked={settings.compactTables}
                    onChange={value => updateSetting('compactTables', value)}
                  />
                </div>
              )}
            </div>
          );
        })}

        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 xl:col-span-2">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Notas rápidas</h3>
              <p className="mt-1 text-sm text-slate-600">
                Estas opciones están pensadas para completar el módulo de configuración con ajustes tradicionales
                y dejarlo listo para futuras integraciones como encabezados personalizados, moneda en reportes y
                alertas de stock.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-white px-3 py-1 shadow-sm">Encabezado de reportes</span>
            <span className="rounded-full bg-white px-3 py-1 shadow-sm">Moneda</span>
            <span className="rounded-full bg-white px-3 py-1 shadow-sm">Stock mínimo</span>
            <span className="rounded-full bg-white px-3 py-1 shadow-sm">Notificaciones</span>
            <span className="rounded-full bg-white px-3 py-1 shadow-sm">Auto guardado</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-slate-100">
      <div>
        <div className="text-sm font-medium text-slate-900">{label}</div>
        <div className="text-xs text-slate-500">{description}</div>
      </div>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="h-4 w-4 accent-slate-950" />
    </label>
  );
}
