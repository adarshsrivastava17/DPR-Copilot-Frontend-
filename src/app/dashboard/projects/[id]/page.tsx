"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft, Upload, FileText, Sparkles, Download, RefreshCw,
  Trash2, ChevronDown, ChevronRight, Edit3, Check, X, Loader2,
  FileDown, Eye, List, BookOpen, FileSpreadsheet
} from "lucide-react";
import { projectsAPI, documentsAPI, reportsAPI, exportAPI, ingestionAPI } from "@/lib/api";
import toast from "react-hot-toast";

// Canonical section order — this controls display order everywhere
const SECTION_ORDER = [
  "executive_summary",
  "promoter_profile",
  "industry_overview",
  "product_details",
  "technical_details",
  "project_cost",
  "profitability",
  "swot_analysis",
  "risk_assessment",
  "contact_details",
  "conclusion",
];

const SECTION_NAMES: Record<string, string> = {
  executive_summary: "Executive Summary",
  promoter_profile: "Promoter & Company Profile",
  industry_overview: "Industry & Market Analysis",
  product_details: "Product / Service Details",
  technical_details: "Technical Feasibility & Production",
  project_cost: "Project Cost & Means of Finance",
  profitability: "Profitability & Financial Projections",
  swot_analysis: "SWOT Analysis",
  risk_assessment: "Risk Assessment & Mitigation",
  contact_details: "Contact Details",
  conclusion: "Conclusion & Recommendations",
};

const SECTION_COLORS: Record<string, { bg: string; border: string; icon: string; gradient: string }> = {
  executive_summary:  { bg: "bg-blue-50",    border: "border-blue-200",    icon: "📋", gradient: "from-blue-500 to-blue-700" },
  promoter_profile:   { bg: "bg-indigo-50",  border: "border-indigo-200",  icon: "👤", gradient: "from-indigo-500 to-indigo-700" },
  industry_overview:  { bg: "bg-purple-50",  border: "border-purple-200",  icon: "🏭", gradient: "from-purple-500 to-purple-700" },
  product_details:    { bg: "bg-cyan-50",    border: "border-cyan-200",    icon: "📦", gradient: "from-cyan-500 to-cyan-700" },
  technical_details:  { bg: "bg-teal-50",    border: "border-teal-200",    icon: "⚙️", gradient: "from-teal-500 to-teal-700" },
  project_cost:       { bg: "bg-amber-50",   border: "border-amber-200",   icon: "💰", gradient: "from-amber-500 to-amber-700" },
  profitability:      { bg: "bg-emerald-50", border: "border-emerald-200", icon: "📈", gradient: "from-emerald-500 to-emerald-700" },
  swot_analysis:      { bg: "bg-orange-50",  border: "border-orange-200",  icon: "🎯", gradient: "from-orange-500 to-orange-700" },
  risk_assessment:    { bg: "bg-red-50",     border: "border-red-200",     icon: "🛡️", gradient: "from-red-500 to-red-700" },
  contact_details:    { bg: "bg-violet-50",  border: "border-violet-200",  icon: "📞", gradient: "from-violet-500 to-violet-700" },
  conclusion:         { bg: "bg-green-50",   border: "border-green-200",   icon: "✅", gradient: "from-green-500 to-green-700" },
};

const ALL_SECTIONS = [
  { key: "executive_summary", label: "Executive Summary", icon: "📋" },
  { key: "promoter_profile", label: "Promoter & Company Profile", icon: "👤" },
  { key: "industry_overview", label: "Industry & Market Analysis", icon: "🏭" },
  { key: "product_details", label: "Product / Service Details", icon: "📦" },
  { key: "technical_details", label: "Technical Feasibility", icon: "⚙️" },
  { key: "project_cost", label: "Project Cost & Finance", icon: "💰" },
  { key: "profitability", label: "Profitability & Projections", icon: "📈" },
  { key: "swot_analysis", label: "SWOT Analysis", icon: "🎯" },
  { key: "risk_assessment", label: "Risk Assessment", icon: "🛡️" },
  { key: "contact_details", label: "Contact Details", icon: "📞" },
  { key: "conclusion", label: "Conclusion", icon: "✅" },
];

const SECTION_PRESETS: Record<string, string[]> = {
  all: ALL_SECTIONS.map(s => s.key),
  essential: ["executive_summary", "promoter_profile", "product_details", "project_cost", "profitability", "contact_details", "conclusion"],
  financial: ["executive_summary", "project_cost", "profitability", "swot_analysis", "risk_assessment", "conclusion"],
};

const PAGE_OPTIONS = [
  { value: 15, label: "15 pages", desc: "Brief Report" },
  { value: 25, label: "25 pages", desc: "Standard Report" },
  { value: 30, label: "30 pages", desc: "Detailed Report" },
  { value: 50, label: "50 pages", desc: "Comprehensive" },
  { value: 75, label: "75 pages", desc: "Full Professional" },
  { value: 100, label: "100 pages", desc: "Bank Submission" },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [activeReport, setActiveReport] = useState<any>(null);
  const [tab, setTab] = useState<"overview" | "documents" | "report">("overview");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [targetPages, setTargetPages] = useState(30);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>(ALL_SECTIONS.map(s => s.key));
  const [customSectionsText, setCustomSectionsText] = useState("");

  const toggleSectionPick = (key: string) => {
    setSelectedSections(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const fetchData = useCallback(async () => {
    try {
      const [projRes, docsRes, repsRes] = await Promise.all([
        projectsAPI.get(projectId),
        documentsAPI.listByProject(projectId),
        reportsAPI.listByProject(projectId),
      ]);
      setProject(projRes.data);
      setDocuments(docsRes.data);
      setReports(repsRes.data);

      if (repsRes.data.length > 0) {
        const latestReport = repsRes.data[0];
        const reportDetail = await reportsAPI.get(latestReport.id);
        setActiveReport(reportDetail.data);

        if (reportDetail.data.status === "completed" && reportDetail.data.sections) {
          setTab("report");
          setExpandedSections(new Set([Object.keys(reportDetail.data.sections)[0]]));
          setGenerating(false);
        } else if (reportDetail.data.status === "generating") {
          setGenerating(true);
          setTab("report");
        }
      }
    } catch {
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Poll for report status
  useEffect(() => {
    if (generating && activeReport?.id) {
      const interval = setInterval(async () => {
        try {
          const res = await reportsAPI.get(activeReport.id);
          if (res.data.status === "completed") {
            setActiveReport(res.data);
            setGenerating(false);
            toast.success("🎉 DPR generated successfully!");
            if (res.data.sections) {
              setExpandedSections(new Set([Object.keys(res.data.sections)[0]]));
            }
            fetchData();
          } else if (res.data.status === "failed") {
            setGenerating(false);
            toast.error("Generation failed. Please try again.");
          }
        } catch { /* keep polling */ }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [generating, activeReport?.id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    let successCount = 0;
    let failCount = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const { data } = await documentsAPI.upload(projectId, file);
          successCount++;
          try { await ingestionAPI.parseDocument(data.id); } catch {}
        } catch (err: any) {
          failCount++;
          toast.error(`Failed: ${file.name} — ${err.response?.data?.detail || "Upload error"}`);
        }
      }
      if (successCount > 0) {
        toast.success(`Uploaded ${successCount} file${successCount > 1 ? "s" : ""} successfully`);
        fetchData();
      }
    } finally { setUploading(false); e.target.value = ""; }
  };

  const handleGenerate = async () => {
    // If user typed custom sections, parse them; otherwise use checkbox selection
    let sectionsToUse = selectedSections;
    if (customSectionsText.trim()) {
      const typed = customSectionsText.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
      const matched: string[] = [];
      for (const t of typed) {
        // Match by key name or by display name
        const byKey = SECTION_ORDER.find(k => k === t.replace(/\s+/g, "_"));
        if (byKey) { matched.push(byKey); continue; }
        const byName = Object.entries(SECTION_NAMES).find(([, name]) => name.toLowerCase().includes(t));
        if (byName) { matched.push(byName[0]); continue; }
        // Partial match
        const partial = SECTION_ORDER.find(k => k.includes(t.replace(/\s+/g, "_")) || SECTION_NAMES[k]?.toLowerCase().includes(t));
        if (partial) matched.push(partial);
      }
      if (matched.length > 0) {
        // Deduplicate and sort by canonical order
        sectionsToUse = Array.from(new Set(matched)).sort((a, b) => SECTION_ORDER.indexOf(a) - SECTION_ORDER.indexOf(b));
      } else {
        toast.error("Could not match any typed sections. Please use proper section names.");
        return;
      }
    }
    if (sectionsToUse.length === 0) {
      toast.error("Please select at least one section");
      return;
    }
    setShowGenerateModal(false);
    setGenerating(true);
    setTab("report");
    try {
      const { data } = await reportsAPI.generate(projectId, undefined, targetPages, sectionsToUse);
      toast.success(`DPR generation started (${targetPages} pages, ${sectionsToUse.length} sections)...`);
      setActiveReport({ id: data.report_id, status: "generating", sections: null });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Generation failed");
      setGenerating(false);
    }
  };

  const handleExport = async (type: "pdf" | "pptx") => {
    if (!activeReport) return;
    setExporting(type);
    try {
      const res = type === "pdf" ? await exportAPI.pdf(activeReport.id) : await exportAPI.pptx(activeReport.id);
      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name}_DPR.${type}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`${type.toUpperCase()} downloaded!`);
    } catch (err: any) {
      toast.error(`Export failed: ${err.response?.data?.detail || err.message}`);
    } finally { setExporting(null); }
  };

  const handleSaveSection = async (sectionKey: string) => {
    if (!activeReport) return;
    try {
      await reportsAPI.updateSection(activeReport.id, sectionKey, editContent);
      setActiveReport((prev: any) => ({
        ...prev, sections: { ...prev.sections, [sectionKey]: editContent },
      }));
      setEditingSection(null);
      toast.success("Section updated");
    } catch { toast.error("Failed to save"); }
  };

  const handleRegenerateSection = async (sectionKey: string) => {
    if (!activeReport) return;
    toast.loading("Regenerating...", { id: "regen" });
    try {
      const { data } = await reportsAPI.regenerateSection(activeReport.id, sectionKey);
      setActiveReport((prev: any) => ({
        ...prev, sections: { ...prev.sections, [sectionKey]: data.content },
      }));
      toast.success("Section regenerated!", { id: "regen" });
    } catch { toast.error("Failed", { id: "regen" }); }
  };

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const expandAll = () => {
    if (activeReport?.sections) setExpandedSections(new Set(Object.keys(activeReport.sections)));
  };
  const collapseAll = () => setExpandedSections(new Set());

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy-500/20 border-t-navy-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4 font-medium">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) return <div className="text-center p-20 text-gray-500">Project not found</div>;
  // Sort sections by canonical SECTION_ORDER so they always display in the correct sequence
  const reportSections = activeReport?.sections
    ? Object.entries(activeReport.sections).sort(([a], [b]) => {
        const ia = SECTION_ORDER.indexOf(a);
        const ib = SECTION_ORDER.indexOf(b);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      })
    : [];

  return (
    <div className="animate-fade-in">
      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowGenerateModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-navy-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-navy-500/20">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Generate DPR</h2>
              <p className="text-gray-500 mt-1">Choose how detailed you want your report</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Report Length</label>
              <div className="grid grid-cols-3 gap-3">
                {PAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTargetPages(opt.value)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      targetPages === opt.value
                        ? "border-navy-500 bg-navy-50 shadow-md shadow-navy-500/10"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <p className={`text-lg font-bold ${targetPages === opt.value ? "text-navy-600" : "text-gray-700"}`}>
                      {opt.value}
                    </p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700">Sections to Include</label>
                <div className="flex gap-1">
                  <button onClick={() => setSelectedSections(SECTION_PRESETS.all)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${selectedSections.length === ALL_SECTIONS.length ? 'bg-navy-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
                  <button onClick={() => setSelectedSections(SECTION_PRESETS.essential)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${JSON.stringify(selectedSections.sort()) === JSON.stringify([...SECTION_PRESETS.essential].sort()) ? 'bg-navy-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Essential</button>
                  <button onClick={() => setSelectedSections(SECTION_PRESETS.financial)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${JSON.stringify(selectedSections.sort()) === JSON.stringify([...SECTION_PRESETS.financial].sort()) ? 'bg-navy-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Financial</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                {ALL_SECTIONS.map((sec) => (
                  <button
                    key={sec.key}
                    onClick={() => toggleSectionPick(sec.key)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-sm transition-all ${
                      selectedSections.includes(sec.key)
                        ? 'border-navy-400 bg-navy-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 opacity-60'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded flex items-center justify-center text-xs border ${
                      selectedSections.includes(sec.key)
                        ? 'bg-navy-500 border-navy-500 text-white' : 'border-gray-300'
                    }`}>
                      {selectedSections.includes(sec.key) && '✓'}
                    </span>
                    <span className="text-sm">{sec.icon}</span>
                    <span className={`text-xs font-medium ${selectedSections.includes(sec.key) ? 'text-navy-700' : 'text-gray-500'}`}>{sec.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Or type your own sections (comma-separated)</label>
                <input
                  type="text"
                  value={customSectionsText}
                  onChange={(e) => setCustomSectionsText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none text-sm"
                  placeholder="e.g., Executive Summary, Project Cost, Conclusion"
                />
                <p className="text-xs text-gray-400 mt-1">Leave empty to use checkbox selection above</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-navy-50 to-teal-50 rounded-xl p-4 mb-6 border border-navy-100">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-navy-500" />
                <div>
                  <p className="text-sm font-semibold text-navy-700">
                    {targetPages} pages • {selectedSections.length} sections • {Math.ceil(targetPages * 300)} words
                  </p>
                  <p className="text-xs text-gray-500">
                    10 professional sections with tables, charts & analysis
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                className="flex-1 bg-gradient-to-r from-navy-500 to-teal-500 text-white py-3 px-6 rounded-xl font-semibold inline-flex items-center justify-center gap-2 shadow-lg shadow-navy-500/20 hover:shadow-xl transition-all"
              >
                <Sparkles className="w-5 h-5" /> Generate Now
              </button>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <Link href="/dashboard/projects" className="inline-flex items-center gap-2 text-gray-500 hover:text-navy-500 text-sm mb-4 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-navy-500 via-navy-600 to-teal-600 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-white/70 mt-1 text-sm">
              {project.business_type || "General"} • Created {new Date(project.created_at).toLocaleDateString()}
              {activeReport?.status === "completed" && ` • ${reportSections.length} sections generated`}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {activeReport?.status === "completed" && activeReport?.sections && (
              <>
                <button onClick={() => handleExport("pdf")} disabled={exporting === "pdf"}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium inline-flex items-center gap-2 text-sm transition shadow-lg disabled:opacity-50">
                  {exporting === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />} Download PDF
                </button>
                <button onClick={() => handleExport("pptx")} disabled={exporting === "pptx"}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium inline-flex items-center gap-2 text-sm transition shadow-lg disabled:opacity-50">
                  {exporting === "pptx" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download PPTX
                </button>
              </>
            )}
            <button onClick={() => generating ? null : setShowGenerateModal(true)} disabled={generating}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-medium inline-flex items-center gap-2 text-sm transition border border-white/20 disabled:opacity-60">
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> {activeReport?.sections ? "Regenerate DPR" : "Generate DPR"}</>}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 max-w-md">
        {(["overview", "documents", "report"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition ${tab === t ? "bg-white text-navy-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t === "report" && generating && <Loader2 className="w-3 h-3 animate-spin inline mr-1" />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === "report" && reportSections.length > 0 && (
              <span className="ml-1 text-xs bg-gradient-to-r from-navy-500 to-teal-500 text-white px-2 py-0.5 rounded-full">{reportSections.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Overview Tab ───────────────────── */}
      {tab === "overview" && (
        <div className="grid md:grid-cols-2 gap-6 stagger-children">
          <div className="glass-card rounded-2xl p-6 border-t-4 border-t-navy-500">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-navy-100 rounded-lg flex items-center justify-center text-sm">📋</span>
              Project Details
            </h3>
            <div className="space-y-2 text-sm">
              {Object.entries(project.inputs || {}).map(([key, val]) =>
                val ? (
                  <div key={key} className="flex justify-between py-2.5 border-b border-gray-50 hover:bg-gray-50/50 px-2 rounded transition">
                    <span className="text-gray-500">{key.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}</span>
                    <span className="text-gray-900 font-medium text-right ml-4 max-w-[60%]">{val as string}</span>
                  </div>
                ) : null
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card rounded-xl p-4 text-center border-t-4 border-t-emerald-500">
                <p className="text-2xl font-bold text-emerald-600">{documents.length}</p>
                <p className="text-xs text-gray-500 mt-1">Documents</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center border-t-4 border-t-blue-500">
                <p className="text-2xl font-bold text-blue-600">{reports.length}</p>
                <p className="text-xs text-gray-500 mt-1">Reports</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center border-t-4 border-t-purple-500">
                <p className={`text-sm font-bold px-2 py-1 rounded-full ${
                  project.status === "completed" ? "bg-emerald-100 text-emerald-700"
                  : project.status === "processing" ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-600"
                }`}>{project.status}</p>
                <p className="text-xs text-gray-500 mt-1">Status</p>
              </div>
            </div>

            {/* Generate CTA */}
            <div className={`rounded-2xl p-6 border-2 relative overflow-hidden ${
              activeReport?.status === "completed"
                ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50"
                : "border-dashed border-navy-200 bg-gradient-to-br from-navy-50 to-teal-50"
            }`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
              <h3 className="font-semibold text-gray-900 mb-2 relative z-10">
                {activeReport?.status === "completed" ? "📄 Report Ready!" : "🚀 Generate Your DPR"}
              </h3>
              <p className="text-sm text-gray-600 mb-4 relative z-10">
                {activeReport?.status === "completed"
                  ? `Your ${reportSections.length}-section DPR is ready. View or download it.`
                  : "Create a professional DPR with customizable page count."
                }
              </p>
              {activeReport?.status === "completed" ? (
                <div className="flex gap-2 relative z-10">
                  <button onClick={() => setTab("report")} className="bg-gradient-to-r from-navy-500 to-teal-500 text-white px-4 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-1 shadow-md hover:shadow-lg transition"><Eye className="w-4 h-4" /> View Report</button>
                  <button onClick={() => handleExport("pdf")} className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-1 hover:bg-red-600 transition"><FileDown className="w-4 h-4" /> PDF</button>
                </div>
              ) : (
                <button onClick={() => setShowGenerateModal(true)} disabled={generating} className="bg-gradient-to-r from-navy-500 to-teal-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition relative z-10">
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {generating ? "Generating..." : "Generate DPR"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Documents Tab ──────────────────── */}
      {tab === "documents" && (
        <div>
          <div className="glass-card rounded-2xl p-6 mb-6 border-t-4 border-t-teal-500">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Upload className="w-5 h-5 text-teal-500" /> Upload Documents
            </h3>
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-teal-400 hover:bg-teal-50/30 transition-all">
                {uploading ? <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto" /> : (
                  <>
                    <Upload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Click to upload documents (select multiple files)</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOCX, or XLSX — select one or more files at once</p>
                  </>
                )}
              </div>
              <input type="file" className="hidden" accept=".pdf,.docx,.xlsx" multiple onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
          {documents.length > 0 && (
            <div className="glass-card rounded-2xl divide-y divide-gray-50">
              {documents.map((doc: any, idx: number) => (
                <div key={doc.id} className="flex items-center justify-between p-4 px-6 hover:bg-gray-50/50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-bold">
                      {(doc.file_type || "?").toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{doc.filename}</p>
                      <p className="text-xs text-gray-400">Document #{idx + 1}</p>
                    </div>
                  </div>
                  <button onClick={async () => { await documentsAPI.delete(doc.id); fetchData(); toast.success("Deleted"); }} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Report Tab ─────────────────────── */}
      {tab === "report" && (
        <div>
          {generating && (
            <div className="glass-card rounded-2xl p-12 text-center border border-navy-100">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="w-20 h-20 border-4 border-navy-100 rounded-full" />
                <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-navy-500 rounded-full animate-spin" />
                <Sparkles className="w-8 h-8 text-navy-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Generating Your DPR...</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-4">
                Creating a <strong>{targetPages}-page</strong> professional report with 10 sections
              </p>
              <div className="w-full max-w-xs mx-auto bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-navy-500 via-teal-500 to-navy-500 rounded-full animate-pulse" style={{ width: "65%", backgroundSize: "200% 100%", animation: "shimmer 2s linear infinite" }} />
              </div>
              <p className="text-xs text-gray-400 mt-3">Usually completes in 5-10 seconds</p>
            </div>
          )}

          {!generating && !activeReport?.sections && (
            <div className="glass-card rounded-2xl p-12 text-center border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Report Generated Yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">Click below to generate a professional DPR with customizable page count.</p>
              <button onClick={() => setShowGenerateModal(true)}
                className="bg-gradient-to-r from-navy-500 to-teal-500 text-white px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2 shadow-lg shadow-navy-500/20 hover:shadow-xl transition">
                <Sparkles className="w-5 h-5" /> Generate DPR Now
              </button>
            </div>
          )}

          {!generating && activeReport?.sections && reportSections.length > 0 && (
            <div>
              {/* Controls bar */}
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-4 mb-5 flex flex-wrap items-center justify-between gap-3 text-white shadow-lg shadow-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">DPR Ready — {reportSections.length} sections</p>
                    <p className="text-xs text-white/70">Click any section to expand • Edit or regenerate</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={expandAll} className="text-xs bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1 backdrop-blur-sm">
                    <List className="w-3 h-3" /> Expand All
                  </button>
                  <button onClick={collapseAll} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition backdrop-blur-sm">Collapse</button>
                  <div className="w-px h-6 bg-white/20 mx-1" />
                  <button onClick={() => handleExport("pdf")} disabled={exporting === "pdf"}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium inline-flex items-center gap-2 text-sm transition shadow-md disabled:opacity-50">
                    {exporting === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />} PDF
                  </button>
                  <button onClick={() => handleExport("pptx")} disabled={exporting === "pptx"}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-medium inline-flex items-center gap-2 text-sm transition shadow-md disabled:opacity-50">
                    {exporting === "pptx" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} PPTX
                  </button>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-3">
                {reportSections.map(([key, content], index) => {
                  const colors = SECTION_COLORS[key] || { bg: "bg-gray-50", border: "border-gray-200", icon: "📄", gradient: "from-gray-500 to-gray-700" };
                  return (
                    <div key={key} className={`glass-card rounded-2xl overflow-hidden border ${colors.border} hover:shadow-md transition-all`}>
                      {/* Section header */}
                      <button
                        onClick={() => toggleSection(key)}
                        className={`w-full flex items-center justify-between p-5 transition ${expandedSections.has(key) ? colors.bg : "hover:bg-gray-50/80"}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${colors.gradient} rounded-xl flex items-center justify-center text-white text-xl shadow-sm`}>
                            {colors.icon}
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-gray-400 font-mono">Section {String(index + 1).padStart(2, "0")}</p>
                            <h3 className="font-semibold text-gray-900">
                              {SECTION_NAMES[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={(e) => { e.stopPropagation(); handleRegenerateSection(key); }}
                            className="text-gray-400 hover:text-teal-500 p-2 rounded-lg hover:bg-teal-50 transition" title="Regenerate">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setEditingSection(key); setEditContent(content as string); setExpandedSections((p) => new Set(p).add(key)); }}
                            className="text-gray-400 hover:text-navy-500 p-2 rounded-lg hover:bg-navy-50 transition" title="Edit">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {expandedSections.has(key) ? <ChevronDown className="w-5 h-5 text-navy-500 ml-1" /> : <ChevronRight className="w-5 h-5 text-gray-400 ml-1" />}
                        </div>
                      </button>

                      {/* Section content */}
                      {expandedSections.has(key) && (
                        <div className={`border-t ${colors.border}`}>
                          {editingSection === key ? (
                            <div className="p-5">
                              <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)}
                                className="w-full h-72 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none text-sm font-mono resize-y" />
                              <div className="flex gap-2 mt-3">
                                <button onClick={() => handleSaveSection(key)} className="bg-gradient-to-r from-navy-500 to-teal-500 text-white px-4 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-1"><Check className="w-4 h-4" /> Save</button>
                                <button onClick={() => setEditingSection(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 inline-flex items-center gap-1"><X className="w-4 h-4" /> Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-6 dpr-content">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  h2: ({ children }) => <h2 className="text-xl font-bold text-navy-700 mb-4 pb-2 border-b-2 border-navy-100">{children}</h2>,
                                  h3: ({ children }) => <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">{children}</h3>,
                                  h4: ({ children }) => <h4 className="text-base font-semibold text-gray-700 mt-4 mb-2">{children}</h4>,
                                  p: ({ children }) => <p className="text-gray-600 leading-relaxed mb-4 text-[15px]">{children}</p>,
                                  strong: ({ children }) => <strong className="text-gray-900 font-semibold">{children}</strong>,
                                  ul: ({ children }) => <ul className="flex flex-col space-y-2 mb-4 ml-4 list-none">{children}</ul>,
                                  ol: ({ children }) => <ol className="flex flex-col space-y-2 mb-4 ml-4 list-decimal list-inside">{children}</ol>,
                                  li: ({ children }) => (
                                    <li className="block text-gray-600 text-[15px] pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-navy-400 before:font-bold">
                                      {children}
                                    </li>
                                  ),
                                  table: ({ children }) => (
                                    <div className="my-4 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                      <table className="w-full text-sm">{children}</table>
                                    </div>
                                  ),
                                  thead: ({ children }) => <thead className="bg-gradient-to-r from-navy-500 to-navy-600 text-white">{children}</thead>,
                                  th: ({ children }) => <th className="px-4 py-3 text-left font-semibold text-sm whitespace-nowrap">{children}</th>,
                                  tbody: ({ children }) => <tbody className="divide-y divide-gray-100">{children}</tbody>,
                                  tr: ({ children }) => <tr className="hover:bg-navy-50/30 transition-colors">{children}</tr>,
                                  td: ({ children }) => <td className="px-4 py-3 text-gray-700">{children}</td>,
                                  hr: () => <hr className="my-6 border-gray-200" />,
                                  em: ({ children }) => <em className="text-gray-500 italic">{children}</em>,
                                  blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-navy-200 bg-navy-50/30 rounded-r-lg p-4 my-4 text-gray-700 italic">{children}</blockquote>
                                  ),
                                }}
                              >
                                {content as string}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!generating && activeReport?.status === "failed" && (
            <div className="glass-card rounded-2xl p-8 text-center border border-red-200 bg-red-50/30">
              <X className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Generation Failed</h3>
              <p className="text-sm text-gray-500 mb-3">Something went wrong. Please try again.</p>
              <button onClick={() => setShowGenerateModal(true)} className="bg-gradient-to-r from-navy-500 to-teal-500 text-white px-5 py-2.5 rounded-xl font-medium inline-flex items-center gap-2 shadow-md">
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
