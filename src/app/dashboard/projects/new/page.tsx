"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { projectsAPI } from "@/lib/api";
import toast from "react-hot-toast";

const BUSINESS_TYPES = [
  "Manufacturing", "Food Processing", "Textile", "Chemical",
  "Pharmaceutical", "Agriculture", "Automobile", "Construction",
  "IT / Software", "Healthcare", "Education", "Retail",
  "Logistics", "Renewable Energy", "Tourism / Hospitality", "Other"
];

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    business_type: "",
    description: "",
    inputs: {
      business_name: "",
      promoter_name: "",
      promoter_qualification: "",
      promoter_experience: "",
      location: "",
      state: "",
      district: "",
      products: "",
      total_project_cost: "",
      term_loan: "",
      promoter_contribution: "",
      land_area: "",
      building_area: "",
      annual_revenue: "",
      num_employees: "",
      raw_materials: "",
      target_market: "",
      capacity: "",
      machinery_cost: "",
      working_capital: "",
    },
  });

  const updateInput = (key: string, value: string) => {
    setForm((p) => ({ ...p, inputs: { ...p.inputs, [key]: value } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Project name is required");
      return;
    }
    setLoading(true);
    try {
      const { data } = await projectsAPI.create({
        name: form.name,
        business_type: form.business_type,
        description: form.description,
        inputs: form.inputs,
      });
      toast.success("Project created!");
      router.push(`/dashboard/projects/${data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const inputField = (label: string, key: string, placeholder: string, type = "text") => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={(form.inputs as any)[key] || ""}
        onChange={(e) => updateInput(key, e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none transition bg-white text-sm"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="animate-fade-in max-w-4xl">
      <Link href="/dashboard/projects" className="inline-flex items-center gap-2 text-gray-500 hover:text-navy-500 text-sm mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 bg-gradient-to-br from-navy-500 to-teal-500 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
          <p className="text-sm text-gray-500">Enter your project details to generate a DPR</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ─── Basic Info ─────────────────────────────── */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Project / Business Name *</label>
              <input
                type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none transition bg-white text-sm"
                placeholder="e.g., Sunrise Agro Industries" required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Type</label>
              <select
                value={form.business_type}
                onChange={(e) => setForm((p) => ({ ...p, business_type: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none transition bg-white text-sm"
              >
                <option value="">Select type...</option>
                {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <input
                type="text" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 outline-none transition bg-white text-sm"
                placeholder="Brief description of the project"
              />
            </div>
          </div>
        </div>

        {/* ─── Promoter Details ───────────────────────── */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Promoter Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {inputField("Promoter Name", "promoter_name", "Full name of the promoter")}
            {inputField("Qualification", "promoter_qualification", "e.g., MBA, B.Tech")}
            {inputField("Experience", "promoter_experience", "e.g., 10 years in manufacturing")}
            {inputField("Business Name", "business_name", "Registered business name")}
          </div>
        </div>

        {/* ─── Location ───────────────────────────────── */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Location Details</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {inputField("Location / Address", "location", "Factory/unit address")}
            {inputField("State", "state", "e.g., Maharashtra")}
            {inputField("District", "district", "e.g., Pune")}
          </div>
        </div>

        {/* ─── Product / Technical ────────────────────── */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Product & Technical Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {inputField("Products / Services", "products", "List of products or services")}
            {inputField("Production Capacity", "capacity", "e.g., 500 units/month")}
            {inputField("Key Raw Materials", "raw_materials", "e.g., Steel, Plastic")}
            {inputField("Target Market", "target_market", "e.g., B2B, Pan India")}
            {inputField("Number of Employees", "num_employees", "e.g., 25", "number")}
          </div>
        </div>

        {/* ─── Financial Details ──────────────────────── */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Financial Details</h2>
          <p className="text-sm text-gray-500 mb-4">Enter amounts in ₹. You can use formats like &quot;50 lakhs&quot; or &quot;2 crores&quot;.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {inputField("Total Project Cost", "total_project_cost", "e.g., 50 lakhs")}
            {inputField("Term Loan Required", "term_loan", "e.g., 35 lakhs")}
            {inputField("Promoter's Contribution", "promoter_contribution", "e.g., 15 lakhs")}
            {inputField("Machinery Cost", "machinery_cost", "e.g., 20 lakhs")}
            {inputField("Working Capital", "working_capital", "e.g., 5 lakhs")}
            {inputField("Expected Annual Revenue", "annual_revenue", "e.g., 1 crore")}
            {inputField("Land Area", "land_area", "e.g., 5000 sq. ft.")}
            {inputField("Building Area", "building_area", "e.g., 3000 sq. ft.")}
          </div>
        </div>

        {/* ─── Submit ─────────────────────────────────── */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3 px-8 rounded-xl text-base disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </span>
            ) : "Create Project"}
          </button>
          <Link href="/dashboard/projects" className="px-8 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-base font-medium">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
