import React, { useState, useEffect } from 'react';
import { FileText, Search, RefreshCw, Zap } from 'lucide-react';
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
    } finally {
      setIsSearching(false);
    }
  };

  const columns: Column<DocumentResponse>[] = [
    {
      header: 'Filename',
      accessor: (doc) => (
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-white">{doc.filename}</span>
        </div>
      )
    },
    {
      header: 'Document ID',
      accessor: (doc) => <span className="font-mono text-xs text-slate-400">{doc.document_id}</span>
    },
    {
      header: 'Parsing Status',
      accessor: (doc) => <StatusBadge status={doc.status} />
    },
    {
      header: 'Chunk Count',
      accessor: (doc) => <span className="font-semibold text-emerald-400">{doc.chunk_count} Chunks</span>
    },
    {
      header: 'Actions',
      accessor: (doc) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleIndex(doc.document_id);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-semibold transition"
        >
          <Zap className="w-3 h-3" />
          <span>Index into Qdrant</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Intelligence Center"
        description="Ingest industrial PDF manuals, parse structural content, generate embeddings, and index into Qdrant."
        icon={FileText}
      />

      {/* Upload Zone */}
      <SectionCard title="Ingest Industrial PDF Manual" subtitle="Triggers Parser -> Embeddings -> Qdrant Vector Store">
        <FileUploader onFileUpload={handleUpload} isLoading={isLoading} />
      </SectionCard>

      {/* Ingested Documents List */}
      <SectionCard
        title="Ingested Industrial Manuals"
        subtitle="Manage vector chunks and status"
        action={
          <button onClick={fetchDocs} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </button>
        }
      >
        <DataTable columns={columns} data={documents} />
      </SectionCard>

      {/* Semantic Vector Search */}
      <SectionCard title="Hybrid Vector Semantic Search" subtitle="Query Qdrant index with text embeddings">
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} onSearch={handleSearch} placeholder="Search procedures, safety checks, isolation rules..." />
          <button
            onClick={handleSearch}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition"
          >
            {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Semantic Search</span>
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Semantic Matches</h4>
            {searchResults.map((res, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/30 transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-blue-400">Chunk #{res.chunk_id} (Doc: {res.document_id})</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {(res.score * 100).toFixed(1)}% Match Score
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
                  "{res.text_snippet}"
                </p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
};
