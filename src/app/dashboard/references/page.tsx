"use client";

import { useState } from "react";
import { Upload, FileText, Loader2, CheckCircle, Database } from "lucide-react";
import { documentsAPI, ingestionAPI } from "@/lib/api";
import toast from "react-hot-toast";

export default function ReferenceDPRsPage() {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [ingesting, setIngesting] = useState(false);
  const [ingestionResult, setIngestionResult] = useState<any>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      try {
        await documentsAPI.uploadReference(file);
        setUploaded((prev) => [...prev, file.name]);
        toast.success(`Uploaded: ${file.name}`);
      } catch (err: any) {
        toast.error(`Failed: ${file.name}`);
      }
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleIngest = async () => {
    setIngesting(true);
    try {
      const { data } = await ingestionAPI.ingestReferences();
      setIngestionResult(data);
      toast.success(`Ingested ${data.results?.length || 0} reference DPRs`);
    } catch (err: any) {
      toast.error("Ingestion failed");
    } finally {
      setIngesting(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reference DPRs</h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload your existing DPRs to train the AI. The system learns your style, formatting, and structure.
        </p>
      </div>

      {/* Upload Section */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">Upload Reference Documents</h3>
        <p className="text-sm text-gray-500 mb-4">
          Upload PDF or DOCX files of your existing DPRs. The AI will analyze them to learn your reporting style.
          You can upload up to 200+ documents.
        </p>
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-navy-400 hover:bg-navy-50/50 transition">
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-10 h-10 text-navy-500 animate-spin" />
                <p className="text-gray-500">Uploading...</p>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Click to upload reference DPRs</p>
                <p className="text-xs text-gray-400 mt-1">PDF or DOCX • Multiple files supported</p>
              </>
            )}
          </div>
          <input type="file" className="hidden" accept=".pdf,.docx" multiple onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {/* Uploaded Files */}
      {uploaded.length > 0 && (
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Uploaded ({uploaded.length})</h3>
          <div className="space-y-2">
            {uploaded.map((name, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-emerald-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-gray-700">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ingest Section */}
      <div className="glass-card rounded-2xl p-6 border-l-4 border-l-teal-500">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Database className="w-6 h-6 text-teal-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Ingest Reference DPRs</h3>
            <p className="text-sm text-gray-500 mb-4">
              Process your sample DPR files and build the AI knowledge base. This parses documents,
              extracts sections, generates embeddings, and stores them in the vector database.
            </p>
            <button
              onClick={handleIngest}
              disabled={ingesting}
              className="bg-teal-500 text-white px-5 py-2.5 rounded-lg font-medium inline-flex items-center gap-2 text-sm hover:bg-teal-600 transition disabled:opacity-50"
            >
              {ingesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  Ingest Sample DPRs
                </>
              )}
            </button>

            {ingestionResult && (
              <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-sm font-medium text-emerald-800 mb-2">
                  ✅ {ingestionResult.message}
                </p>
                {ingestionResult.results?.map((r: any, i: number) => (
                  <p key={i} className="text-xs text-emerald-600">
                    {r.filename}: {r.total_chunks} chunks from {r.sections_found?.length || 0} sections
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
