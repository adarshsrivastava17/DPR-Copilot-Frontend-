"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Search, ArrowRight } from "lucide-react";
import { projectsAPI } from "@/lib/api";

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    projectsAPI.list().then(({ data }) => {
      setProjects(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.business_type || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your DPR projects</p>
        </div>
        <Link href="/dashboard/projects/new" className="btn-primary inline-flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Project
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none transition bg-white"
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-navy-500/20 border-t-navy-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{search ? "No matching projects" : "No projects yet"}</p>
          <Link href="/dashboard/projects/new" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm">
            <Plus className="w-4 h-4" /> Create First Project
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filtered.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  project.status === "completed" ? "bg-emerald-100 text-emerald-600" :
                  project.status === "processing" ? "bg-gold-100 text-gold-600" :
                  "bg-navy-50 text-navy-500"
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  project.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                  project.status === "processing" ? "bg-gold-100 text-gold-700" :
                  project.status === "failed" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {project.status}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-navy-500 transition">{project.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{project.business_type || "General Project"}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{new Date(project.created_at).toLocaleDateString()}</span>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-navy-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
