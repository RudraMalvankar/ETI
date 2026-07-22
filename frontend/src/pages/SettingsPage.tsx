import React, { useEffect, useState } from 'react';
import {
  Settings,
  Save,
  RefreshCw,
  Moon,
  Sun,
  ShieldCheck,
  Database,
  Cpu,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { useApexStore } from '../store/useApexStore';
import {
  getPlatformSettings,
  updatePlatformSettings,
} from '../services/apexServices';
import { PlatformSettings, PlatformSettingsEnvelope } from '../types/apex';

type SettingsDraft = Omit<PlatformSettings, 'provider_status' | 'updated_by' | 'updated_at'>;

function toDraft(settings: PlatformSettings): SettingsDraft {
  return {
    ai_provider: settings.ai_provider,
    embedding_provider: settings.embedding_provider,
    ocr_provider: settings.ocr_provider,
    confidence_threshold: settings.confidence_threshold,
    top_k: settings.top_k,
    rerank_top_k: settings.rerank_top_k,
    enable_reranking: settings.enable_reranking,
    theme: settings.theme,
    notifications_enabled: settings.notifications_enabled,
    api_base_url: settings.api_base_url,
    environment_status: settings.environment_status,
    notification_channels: settings.notification_channels,
  };
}

export const SettingsPage: React.FC = () => {
  const {
    connectionState,
    isDarkMode,
    setDarkMode,
    setConfidenceThreshold,
    currentUser,
  } = useApexStore();

  const [settingsEnvelope, setSettingsEnvelope] = useState<PlatformSettingsEnvelope | null>(null);
  const [draft, setDraft] = useState<SettingsDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = currentUser?.role === 'Admin';

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const envelope = await getPlatformSettings();
      setSettingsEnvelope(envelope);
      setDraft(toDraft(envelope.settings));
      setConfidenceThreshold(envelope.settings.confidence_threshold);
      setDarkMode(envelope.settings.theme === 'dark');
    } catch (error: any) {
      const message =
        error?.response?.data?.detail || error?.message || 'Failed to load platform settings.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const updateDraft = <K extends keyof SettingsDraft>(key: K, value: SettingsDraft[K]) => {
    setDraft(current => (current ? { ...current, [key]: value } : current));
  };

  const handleThemeToggle = () => {
    if (!draft) {
      return;
    }
    const nextTheme = draft.theme === 'dark' ? 'light' : 'dark';
    updateDraft('theme', nextTheme);
    setDarkMode(nextTheme === 'dark');
  };

  const handleSave = async () => {
    if (!draft || !isAdmin) {
      return;
    }

    try {
      setIsSaving(true);
      const envelope = await updatePlatformSettings(draft);
      setSettingsEnvelope(envelope);
      setDraft(toDraft(envelope.settings));
      setConfidenceThreshold(envelope.settings.confidence_threshold);
      setDarkMode(envelope.settings.theme === 'dark');
      toast.success('Platform settings saved to the backend.');
    } catch (error: any) {
      const message =
        error?.response?.data?.detail || error?.message || 'Failed to save settings.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const runtime = settingsEnvelope?.effective_runtime;
  const providerStatus = settingsEnvelope?.settings.provider_status;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Configuration"
        description="Live enterprise settings backed by the APEX backend with runtime provider visibility."
        icon={Settings}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard title="Runtime Status" subtitle="Active backend environment and provider health">
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-300 font-medium">Connection State</span>
              <span
                className={`font-bold capitalize ${
                  connectionState === 'connected' ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {connectionState}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-300 font-medium">Signed-In Role</span>
              <span className="font-bold text-blue-400">{currentUser?.role || 'Unknown'}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="block text-[11px] text-slate-500 mb-1">AI Runtime</span>
                <span className="text-white font-semibold">
                  {providerStatus?.ai_provider || 'Unavailable'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="block text-[11px] text-slate-500 mb-1">Qdrant Mode</span>
                <span className="text-white font-semibold">
                  {providerStatus?.qdrant_mode || 'Unavailable'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="block text-[11px] text-slate-500 mb-1">OCR Runtime</span>
                <span className="text-white font-semibold">
                  {providerStatus?.ocr_provider || 'Unavailable'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="block text-[11px] text-slate-500 mb-1">Environment</span>
                <span className="text-white font-semibold">
                  {providerStatus?.environment || 'Unavailable'}
                </span>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Provider Controls" subtitle="Persisted operational defaults for the platform">
          {draft ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-slate-400 font-semibold">AI Provider</span>
                  <select
                    value={draft.ai_provider}
                    onChange={e => updateDraft('ai_provider', e.target.value)}
                    disabled={!isAdmin}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white disabled:opacity-60"
                  >
                    {settingsEnvelope?.available_ai_providers.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-slate-400 font-semibold">Embedding Provider</span>
                  <select
                    value={draft.embedding_provider}
                    onChange={e => updateDraft('embedding_provider', e.target.value)}
                    disabled={!isAdmin}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white disabled:opacity-60"
                  >
                    {settingsEnvelope?.available_embedding_providers.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-slate-400 font-semibold">OCR Provider</span>
                  <select
                    value={draft.ocr_provider}
                    onChange={e => updateDraft('ocr_provider', e.target.value)}
                    disabled={!isAdmin}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white disabled:opacity-60"
                  >
                    {settingsEnvelope?.available_ocr_providers.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-slate-400 font-semibold">Environment Label</span>
                  <input
                    value={draft.environment_status}
                    onChange={e => updateDraft('environment_status', e.target.value)}
                    disabled={!isAdmin}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white disabled:opacity-60"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="space-y-1">
                  <span className="text-slate-400 font-semibold">Top K</span>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={draft.top_k}
                    onChange={e => updateDraft('top_k', Number(e.target.value))}
                    disabled={!isAdmin}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white disabled:opacity-60"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-slate-400 font-semibold">Rerank Top K</span>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={draft.rerank_top_k}
                    onChange={e => updateDraft('rerank_top_k', Number(e.target.value))}
                    disabled={!isAdmin}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white disabled:opacity-60"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-slate-400 font-semibold">
                    Confidence Threshold ({draft.confidence_threshold}%)
                  </span>
                  <input
                    type="range"
                    min={50}
                    max={99}
                    value={draft.confidence_threshold}
                    onChange={e => {
                      const next = Number(e.target.value);
                      updateDraft('confidence_threshold', next);
                      setConfidenceThreshold(next);
                    }}
                    disabled={!isAdmin}
                    className="w-full accent-blue-500 disabled:opacity-60"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-400">Loading platform settings...</div>
          )}
        </SectionCard>

        <SectionCard title="Experience Controls" subtitle="Operator-facing defaults applied immediately in the UI">
          {draft ? (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="text-white font-bold block mb-0.5">Theme Mode</span>
                  <span className="text-slate-400 text-[11px]">
                    {isDarkMode ? 'Enterprise Dark' : 'Operational Light'}
                  </span>
                </div>
                <button
                  onClick={handleThemeToggle}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                >
                  {draft.theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-400" />
                  )}
                  <span>{draft.theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-300 font-medium">Enable Reranking</span>
                  <input
                    type="checkbox"
                    checked={draft.enable_reranking}
                    onChange={e => updateDraft('enable_reranking', e.target.checked)}
                    disabled={!isAdmin}
                    className="h-4 w-4 accent-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-300 font-medium">Notifications Enabled</span>
                  <input
                    type="checkbox"
                    checked={draft.notifications_enabled}
                    onChange={e => updateDraft('notifications_enabled', e.target.checked)}
                    disabled={!isAdmin}
                    className="h-4 w-4 accent-blue-500"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-slate-400 font-semibold">Notification Channels</span>
                  <input
                    value={draft.notification_channels.join(', ')}
                    onChange={e =>
                      updateDraft(
                        'notification_channels',
                        e.target.value
                          .split(',')
                          .map(channel => channel.trim())
                          .filter(Boolean)
                      )
                    }
                    disabled={!isAdmin}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white disabled:opacity-60"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-slate-400 font-semibold">API Endpoint Label</span>
                  <input
                    value={draft.api_base_url}
                    onChange={e => updateDraft('api_base_url', e.target.value)}
                    disabled={!isAdmin}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white disabled:opacity-60"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-400">Loading operator controls...</div>
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Operational Notes" subtitle="Current system posture">
          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>
                Platform settings are now persisted through the backend and visible across sessions instead of living only in the browser.
              </span>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <Database className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <span>
                Runtime telemetry shows the effective backend provider state, which may differ from saved preferences until environment variables are changed and the backend restarts.
              </span>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <Cpu className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <span>
                The remaining ingestion hardening gap is real OCR execution for scanned PDFs when the selected OCR provider is set to `nim`.
              </span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Actions" subtitle="Enterprise-safe settings workflow">
          <div className="space-y-3 text-xs">
            <button
              onClick={() => void loadSettings()}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-white font-semibold transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isLoading ? 'Refreshing...' : 'Reload From Backend'}</span>
            </button>
            <button
              onClick={() => void handleSave()}
              disabled={!isAdmin || !draft || isSaving}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold transition"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSaving ? 'Saving...' : isAdmin ? 'Save Platform Settings' : 'Admin Required'}
              </span>
            </button>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-white">Last Saved Context</span>
              </div>
              <span className="text-[11px]">
                {settingsEnvelope?.settings.updated_at
                  ? `Updated by ${settingsEnvelope.settings.updated_by || 'system'} on ${new Date(settingsEnvelope.settings.updated_at).toLocaleString()}`
                  : 'This environment is using the default settings bootstrap record.'}
              </span>
            </div>
            {runtime ? (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 font-mono whitespace-pre-wrap">
                {JSON.stringify(runtime, null, 2)}
              </div>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
