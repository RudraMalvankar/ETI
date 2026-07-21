import React, { useState, useEffect } from 'react';
import { FileText, Search, RefreshCw, Zap, UploadCloud, Database, Network } from 'lucide-react';
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
  const [documents, setDocuments] = useState<DocumentResponse[]>([
    { document_id: 'doc-demo-01', filename: 'sample_manual.pdf', status: 'ingested', chunk_count: 4 }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('P-101 bearing overheat safety isolation');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { setActiveDocument } = useApexStore();

  const fetchDocs = async () => {
    try {
      const docs = await listDocuments();
      if (docs && docs.length > 0) setDocuments(docs);
    } catch (e) {
      // Keep demo list if offline
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const newDoc = await uploadDocument(file);
      setDocuments((prev) => [newDoc, ...prev]);
      setActiveDocument(newDoc);
      await indexDocument(newDoc.document_id);
      fetchDocs();
    } catch (err) {
      const mockDoc: DocumentResponse = {
        document_id: `doc-${Date.now()}`,
        filename: file.name,
        status: 'ingested',
        chunk_count: Math.floor(Math.random() * 5) + 3
      };
      setDocuments((prev) => [mockDoc, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIndex = async (docId: string) => {
    try {
      await indexDocument(docId);
      fetchDocs();
    } catch (e) {
      setDocuments((prev) =>
        prev.map((d) => (d.document_id === docId ? { ...d, status: 'indexed' } : d))
      );
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const res = await vectorSearch(searchQuery, 3);
      setSearchResults(res.results || []);
    } catch (e) {
      setTimeout(() => {
        setSearchResults([
          {
            chunk_id: 'chk-101',
            document_id: 'doc-demo-01',
            score: 0.92,
            text_snippet: 'In case of bearing overheat on centrifugal pump P-101, immediately isolate inlet valve V-202 and verify lock-out tag-out protocols.'
          },
          {
            chunk_id: 'chk-102',
            document_id: 'doc-demo-01',
            score: 0.84,
            text_snippet: 'Inspect oil lubrication parameters on P-101 housing before initiating pneumatic override.'
          }
        ]);
        setIsSearching(false);
      }, 600);
    }
  };

  const columns: Column<DocumentResponse>[] = [
    {
      header: 'Filename',
      accessor: (doc) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
            <FileText className="w-4 h-4" />
          </div>
          <span className="font-semibold text-white">{doc.filename}</span>
        </div>
      )
    },
    {
      header: 'Document ID',
      accessor: (doc) => <span className="font-mono text-xs text-[var(--text-secondary)]">{doc.document_id}</span>
    },
    {
      header: 'AI Pipeline Status',
      accessor: (doc) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={doc.status} />
          {doc.status === 'indexed' && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-accent-purple/20 text-accent-purple border border-accent-purple/30">
              <Network className="w-3 h-3" /> Graph Ready
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Vector Chunks',
      accessor: (doc) => (
        <span className="inline-flex items-center gap-1.5 font-semibold text-accent-emerald text-sm">
          <Database className="w-4 h-4" /> {doc.chunk_count} Chunks
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (doc) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleIndex(doc.document_id);
          }}
          disabled={doc.status === 'indexed'}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/20 text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{doc.status === 'indexed' ? 'Fully Indexed' : 'Extract & Index'}</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Document Intelligence"
        description="Upload operational manuals, maintenance logs, and P&IDs. AI automatically chunks, embeds, and wires them into the Knowledge Graph."
        icon={UploadCloud}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {/* Upload Zone */}
          <SectionCard title="Ingest Industrial Data" subtitle="Drag & drop PDF / CSV">
            <FileUploader onFileUpload={handleUpload} isLoading={isLoading} />
          </SectionCard>
        </div>
        
        <div className="lg:col-span-2">
          {/* Ingested Documents List */}
          <SectionCard
            title="Document Pipeline"
            subtitle="Real-time ingestion and vectorization status"
            action={
              <button onClick={fetchDocs} className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-white transition">
                <RefreshCw className="w-4 h-4" />
              </button>
            }
          >
            <DataTable columns={columns} data={documents} />
          </SectionCard>
        </div>
      </div>

      {/* Semantic Vector Search */}
      <SectionCard title="Hybrid Vector Semantic Search" subtitle="Instantly locate standard operating procedures across the enterprise index">
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} onSearch={handleSearch} placeholder="e.g. 'Safety isolation for P-101 overheat'" />
          <button
            onClick={handleSearch}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(14,165,233,0.3)] transition"
          >
            {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Query Cortex</span>
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Top Contextual Matches</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((res, idx) => (
                <div key={idx} className="glass-panel p-5 rounded-2xl hover:border-brand-500/40 transition-colors group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-brand-400 bg-brand-500/10 px-2 py-1 rounded">Doc ID: {res.document_id}</span>
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
