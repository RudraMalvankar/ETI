import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Search, RefreshCw, UploadCloud, Database, Network } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { FileUploader } from '../components/common/FileUploader';
import { SearchBar } from '../components/common/SearchBar';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataTable, Column } from '../components/common/DataTable';
import { uploadDocument, indexDocument, listDocuments, vectorSearch } from '../services/apexServices';
import { DocumentResponse, SearchResult } from '../types/apex';
import { useApexStore } from '../store/useApexStore';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [searchQuery, setSearchQuery] = useState('P-101 bearing overheat safety isolation');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchTimeMs, setSearchTimeMs] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { setActiveDocument, currentUser } = useApexStore();

  const canUpload = useMemo(
    () => ['Engineer', 'Admin'].includes(currentUser?.role || ''),
    [currentUser?.role]
  );

  const fetchDocs = async () => {
    setIsRefreshing(true);
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (error: any) {
      const message =
        error?.response?.data?.detail || error?.message || 'Failed to load documents.';
      toast.error(message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (file: File) => {
    if (!canUpload) {
      toast.error('Document ingestion requires an Engineer or Admin role.');
      return;
    }

    setIsLoading(true);
    try {
      const newDoc = await uploadDocument(file);
      setActiveDocument(newDoc);
      toast.success(`Uploaded ${newDoc.filename}`);

      const indexResult = await indexDocument(newDoc.document_id);
      toast.success(`Indexed ${indexResult.chunk_count} chunks into the enterprise search layer.`);
      await fetchDocs();
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.message || 'Upload failed.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIndex = async (docId: string) => {
    if (!canUpload) {
      toast.error('Document indexing requires an Engineer or Admin role.');
      return;
    }

    try {
      const result = await indexDocument(docId);
      toast.success(`Indexed ${result.chunk_count} chunks.`);
      await fetchDocs();
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.message || 'Indexing failed.';
      toast.error(message);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setIsSearching(true);
    try {
      const res = await vectorSearch(searchQuery, 3);
      setSearchResults(res.results || []);
      setSearchTimeMs(res.query_time_ms);
      if (!res.results?.length) {
        toast.message('No vector matches found for that query.');
      }
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.message || 'Search failed.';
      toast.error(message);
    } finally {
      setIsSearching(false);
    }
  };

  const columns: Column<DocumentResponse>[] = [
    {
      header: 'Filename',
      accessor: doc => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
            <FileText className="w-4 h-4" />
          </div>
          <span className="font-semibold text-white">{doc.filename}</span>
        </div>
      ),
    },
    {
      header: 'Document ID',
      accessor: doc => (
        <span className="font-mono text-xs text-[var(--text-secondary)]">{doc.document_id}</span>
      ),
    },
    {
      header: 'AI Pipeline Status',
      accessor: doc => (
        <div className="flex items-center gap-2">
          <StatusBadge status={doc.status} />
          {doc.chunk_count > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-accent-purple/20 text-accent-purple border border-accent-purple/30">
              <Network className="w-3 h-3" /> {doc.chunk_count} Linked Chunks
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Vector Chunks',
      accessor: doc => (
        <span className="inline-flex items-center gap-1.5 font-semibold text-accent-emerald text-sm">
          <Database className="w-4 h-4" /> {doc.chunk_count} Chunks
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: doc => (
        <button
          onClick={e => {
            e.stopPropagation();
            handleIndex(doc.document_id);
          }}
          disabled={!canUpload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/20 text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Re-index</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Document Intelligence"
        description="Upload industrial manuals, maintenance logs, and P&IDs. The backend extracts, chunks, and indexes them into the operational knowledge layer."
        icon={UploadCloud}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SectionCard
            title="Ingest Industrial Data"
            subtitle={
              canUpload
                ? 'PDF and CSV ingestion through the live backend pipeline'
                : 'Upload is restricted to Engineer and Admin roles'
            }
          >
            <FileUploader onFileUpload={handleUpload} isLoading={isLoading} />
          </SectionCard>
        </div>

        <div className="lg:col-span-2">
          <SectionCard
            title="Document Pipeline"
            subtitle="Live ingestion records from PostgreSQL and the vector indexing workflow"
            action={
              <button
                onClick={fetchDocs}
                className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-white transition"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            }
          >
            {documents.length > 0 ? (
              <DataTable columns={columns} data={documents} />
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-[var(--border-strong)] text-sm text-[var(--text-secondary)]">
                No documents have been ingested yet.
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title="Hybrid Vector Semantic Search"
        subtitle="Search the indexed corpus and inspect grounded evidence returned by the backend"
      >
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder="e.g. 'Safety isolation for P-101 overheat'"
          />
          <button
            onClick={handleSearch}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(14,165,233,0.3)] transition"
          >
            {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Query Cortex</span>
          </button>
        </div>

        {searchTimeMs !== null && (
          <p className="mb-4 text-xs text-[var(--text-secondary)] font-mono">
            Backend query latency: {searchTimeMs} ms
          </p>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Top Contextual Matches
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map(res => (
                <div
                  key={res.chunk_id}
                  className="bg-[var(--bg-elevated)] border border-[var(--border-strong)] p-4 rounded-md hover:border-primary-500/40 transition-colors group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-brand-400 bg-brand-500/10 px-2 py-1 rounded">
                      Doc ID: {res.document_id}
                    </span>
                    <span className="text-xs font-extrabold px-2 py-1 rounded bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                      {(res.score * 100).toFixed(1)}% Match
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed italic border-l-2 border-brand-500/50 pl-3 group-hover:border-brand-400 transition-colors">
                    "{res.text_snippet}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
};
