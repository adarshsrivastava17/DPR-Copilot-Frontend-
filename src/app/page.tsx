"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FileText, Zap, Shield, BarChart3, Clock, Globe,
  ArrowRight, CheckCircle, Sparkles, ChevronRight
} from "lucide-react";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => setIsVisible(true), []);

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navbar ─────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-navy-500 to-teal-500 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">DPR Copilot</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-navy-500 transition">Features</a>
            <a href="#how-it-works" className="hover:text-navy-500 transition">How It Works</a>
            <a href="#pricing" className="hover:text-navy-500 transition">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-navy-500 hover:text-navy-600 px-4 py-2 transition">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Get Started <ArrowRight className="inline w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-50/50 via-white to-teal-50/30" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-gold-200/20 rounded-full blur-3xl" />

        <div className={`max-w-5xl mx-auto text-center relative transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="inline-flex items-center gap-2 bg-navy-50 text-navy-600 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Report Generation
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            <span className="gradient-text">Generate DPRs</span>
            <br />
            <span className="text-gray-900">in Under 5 Minutes</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Transform your consultancy workflow with AI. Upload your project details and get a
            publication-ready Detailed Project Report — matching your exact format and style.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/register" className="btn-primary text-base px-8 py-3.5 rounded-xl shadow-xl shadow-navy-500/20 inline-flex items-center gap-2">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#how-it-works" className="bg-white text-navy-500 border-2 border-navy-200 px-8 py-3.5 rounded-xl font-medium hover:border-navy-400 transition inline-flex items-center gap-2">
              See How It Works <ChevronRight className="w-5 h-5" />
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { val: "5 min", label: "Generation Time" },
              { val: "200+", label: "DPR Templates" },
              { val: "99%", label: "Format Accuracy" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold gradient-text">{s.val}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────── */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need for DPR Generation</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Powered by advanced AI that learns from your reference documents to match your exact consultancy style.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {[
              { icon: <Zap className="w-6 h-6" />, title: "AI DPR Generator", desc: "Upload project details, get a complete DPR with all sections — executive summary to financial projections." },
              { icon: <FileText className="w-6 h-6" />, title: "Smart Document Parser", desc: "Extracts business details, financials, and market data from uploaded PDFs, DOCX, and Excel files." },
              { icon: <BarChart3 className="w-6 h-6" />, title: "Financial Model Engine", desc: "Auto-generates project cost tables, P&L projections, break-even analysis, cash flow, and ratio analysis." },
              { icon: <Shield className="w-6 h-6" />, title: "RAG-Powered Style Matching", desc: "Trains on your reference DPRs to replicate your firm's exact writing style, formatting, and structure." },
              { icon: <Clock className="w-6 h-6" />, title: "Section Editor", desc: "Edit any section, adjust financial data, or regenerate individual sections with custom instructions." },
              { icon: <Globe className="w-6 h-6" />, title: "PDF & PPTX Export", desc: "Download as a professional consultancy-grade PDF report or a pitch deck PowerPoint presentation." },
            ].map((f, i) => (
              <div key={i} className="glass-card rounded-2xl p-8 hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-navy-500 to-teal-500 rounded-xl flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-br from-navy-50/50 to-teal-50/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600">Four simple steps to your professional DPR</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Create Project", desc: "Enter your business name, type, and basic project details" },
              { step: "02", title: "Upload Documents", desc: "Upload financial data, project documents, or reference DPRs" },
              { step: "03", title: "AI Generates DPR", desc: "Our AI creates a complete DPR matching your style in minutes" },
              { step: "04", title: "Export & Download", desc: "Edit sections if needed, then download as PDF or PowerPoint" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-navy-500 to-teal-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-navy-500/20">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-600">Start free. Scale as you grow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { name: "Free", price: "₹0", period: "/month", reports: "5 reports/month", features: ["Basic DPR generation", "PDF export", "Email support"] },
              { name: "Professional", price: "₹4,999", period: "/month", reports: "50 reports/month", features: ["RAG-powered generation", "PDF + PPTX export", "Financial models", "Section editor", "Priority support"], popular: true },
              { name: "Enterprise", price: "Custom", period: "", reports: "Unlimited reports", features: ["Custom DPR training", "API access", "Team management", "White-label option", "Dedicated support"] },
            ].map((p, i) => (
              <div key={i} className={`rounded-2xl p-8 ${p.popular ? "bg-gradient-to-br from-navy-500 to-teal-600 text-white ring-4 ring-gold-400/50 scale-105 shadow-2xl" : "glass-card"}`}>
                {p.popular && <div className="text-gold-400 text-xs font-bold uppercase tracking-wider mb-2">Most Popular</div>}
                <h3 className={`text-xl font-bold mb-1 ${p.popular ? "text-white" : "text-gray-900"}`}>{p.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-extrabold">{p.price}</span>
                  <span className={`text-sm ${p.popular ? "text-white/70" : "text-gray-500"}`}>{p.period}</span>
                </div>
                <p className={`text-sm mb-6 ${p.popular ? "text-white/80" : "text-gray-500"}`}>{p.reports}</p>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 ${p.popular ? "text-gold-400" : "text-teal-500"}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`block text-center py-2.5 rounded-lg font-medium transition ${p.popular ? "bg-gold-500 text-white hover:bg-gold-600" : "bg-navy-500 text-white hover:bg-navy-600"}`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────── */}
      <footer className="bg-navy-500 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">DPR Copilot</span>
          </div>
          <p className="text-white/60 text-sm">© {new Date().getFullYear()} DPR Copilot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
