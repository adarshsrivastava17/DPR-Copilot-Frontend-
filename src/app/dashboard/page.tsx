"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderKanban, FileText, BarChart3, Clock, Plus,
  ArrowRight, TrendingUp, Sparkles
} from "lucide-react";
import { projectsAPI } from "@/lib/api";

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("dpr_user");
    if (stored) setUser(JSON.parse(stored));

    projectsAPI.list().then(({ data }) => {
      setProjects(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: "Total Projects",
      value: projects.length,
      icon: FolderKanban,
      color: "from-navy-500 to-navy-600",
    },
    {
      label: "Reports Generated",
      value: projects.filter((p: any) => p.status === "completed").length,
      icon: FileText,
      color: "from-teal-500 to-teal-600",
    },
    {
      label: "In Progress",
      value: projects.filter((p: any) => p.status === "processing").length,
      icon: Clock,
      color: "from-gold-500 to-gold-600",
    },
    {
      label: "Avg. Time",
      value: "~4 min",
      icon: TrendingUp,
      color: "from-emerald-500 to-emerald-600",
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.full_name?.split(" ")[0] || "User"} 👋
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s an overview of your DPR projects</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="btn-primary inline-flex items-center gap-2 shadow-lg shadow-navy-500/20"
        >
          <Plus className="w-4 h-4" /> New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link href="/dashboard/projects/new" className="glass-card rounded-2xl p-6 border-l-4 border-l-navy-500 hover:shadow-lg transition-all cursor-pointer block">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-navy-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Generate a New DPR</h3>
              <p className="text-sm text-gray-500 mb-3">Create a professional Detailed Project Report in under 5 minutes using AI.</p>
              <span className="text-navy-500 text-sm font-medium inline-flex items-center gap-1">
                Start Now <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/references" className="glass-card rounded-2xl p-6 border-l-4 border-l-gold-500 hover:shadow-lg transition-all cursor-pointer block">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gold-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-6 h-6 text-gold-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Upload Reference DPRs</h3>
              <p className="text-sm text-gray-500 mb-3">Train the AI with your DPR style by uploading reference documents.</p>
              <span className="text-gold-600 text-sm font-medium inline-flex items-center gap-1">
                Upload DPRs <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Projects */}
      <div className="glass-card rounded-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Projects</h2>
          <Link href="/dashboard/projects" className="text-sm text-navy-500 hover:underline">View all</Link>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-navy-500/20 border-t-navy-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center">
            <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No projects yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first project to generate a DPR</p>
            <Link href="/dashboard/projects/new" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm">
              <Plus className="w-4 h-4" /> Create Project
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {projects.slice(0, 5).map((project: any) => (
              <div
                key={project.id}
                onClick={() => { window.location.href = `/dashboard/projects/${project.id}`; }}
                className="flex items-center justify-between p-4 px-6 hover:bg-gray-50/80 transition group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    project.status === "completed" ? "bg-emerald-100 text-emerald-600" :
                    project.status === "processing" ? "bg-gold-100 text-gold-600" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{project.name}</p>
                    <p className="text-sm text-gray-400">{project.business_type || "General"} • {new Date(project.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                    project.status === "processing" ? "bg-gold-100 text-gold-700" :
                    project.status === "failed" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {project.status}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-navy-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
