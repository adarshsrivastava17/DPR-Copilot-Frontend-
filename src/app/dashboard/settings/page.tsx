"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Building } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("dpr_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("dpr_token");
    localStorage.removeItem("dpr_user");
    router.push("/login");
    toast.success("Signed out");
  };

  return (
    <div className="animate-fade-in max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Profile */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-navy-500 to-teal-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
            {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user?.full_name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <User className="w-5 h-5 text-navy-500" />
            <div>
              <p className="text-xs text-gray-500">Role</p>
              <p className="text-sm font-medium text-gray-900 capitalize">{user?.role || "Member"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <Building className="w-5 h-5 text-navy-500" />
            <div>
              <p className="text-xs text-gray-500">Organization</p>
              <p className="text-sm font-medium text-gray-900">{user?.org_name || "Personal"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Subscription</h3>
        <div className="flex items-center justify-between p-4 bg-navy-50 rounded-xl">
          <div>
            <p className="font-medium text-navy-700">Free Plan</p>
            <p className="text-sm text-navy-500">5 reports per month</p>
          </div>
          <button className="btn-primary text-sm">Upgrade</button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card rounded-2xl p-6 border border-red-100">
        <h3 className="font-semibold text-gray-900 mb-4">Account</h3>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium text-sm transition"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
