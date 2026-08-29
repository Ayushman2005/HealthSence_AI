import React from "react";
import {
  Info,
  User,
  CheckCircle,
  AlertCircle,
  Lock,
  AlertTriangle,
} from "lucide-react";

export default function Account({
  userProfile,
  handleLogout,
  profileName,
  setProfileName,
  profileMessage,
  profileError,
  profileLoading,
  handleUpdateProfileName,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  passwordMessage,
  passwordError,
  handleUpdatePassword,
  handleDeleteAccount,
  renderProtectedTab,
}) {
  return renderProtectedTab(
    <div className="space-y-8 animate-fade-in no-print text-slate-100">
      {/* Upper Profile Overview Info Card */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-amber-500/20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20">
            {userProfile?.name
              ? userProfile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2)
              : "A"}
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-white tracking-tight">
              {userProfile?.name || "Anonymous User"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider bg-slate-850 bg-slate-900/80 px-2.5 py-0.5 rounded-full text-[10px] text-amber-400 border border-amber-500/30">
                @{userProfile?.username || "user"}
              </span>
              {userProfile?.created_at &&
              userProfile.created_at !== "System Default" ? (
                <span className="text-slate-400">
                  • Joined{" "}
                  {new Date(userProfile.created_at).toLocaleDateString(
                    undefined,
                    { year: "numeric", month: "long", day: "numeric" },
                  )}
                </span>
              ) : (
                <span className="text-slate-400">• System Account</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500 hover:text-white text-rose-400 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 active:scale-[0.98] transition-all shadow-xs"
          >
            <Info className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Split forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form: Update Profile Name */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col justify-between border border-amber-500/20 shadow-xl">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <User className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-lg text-white">
                Update Profile Information
              </h3>
            </div>

            <form onSubmit={handleUpdateProfileName} className="space-y-5">
              {profileMessage && (
                <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl p-3 text-xs font-semibold flex items-center gap-2 shadow-xs">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{profileMessage}</span>
                </div>
              )}
              {profileError && (
                <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl p-3 text-xs font-semibold flex items-center gap-2 shadow-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-white placeholder:text-slate-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="btn-magnetic py-2.5 px-5 bg-linear-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {profileLoading ? "Saving..." : "Save Profile Details"}
              </button>
            </form>
          </div>
        </div>

        {/* Form: Change Password */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-amber-500/20 shadow-xl">
          <div className="flex items-center gap-2.5 mb-6">
            <Lock className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-lg text-white">
              Change Password
            </h3>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-5">
            {passwordMessage && (
              <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl p-3 text-xs font-semibold flex items-center gap-2 shadow-xs">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{passwordMessage}</span>
              </div>
            )}
            {passwordError && (
              <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl p-3 text-xs font-semibold flex items-center gap-2 shadow-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-white placeholder:text-slate-500 transition"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-white placeholder:text-slate-500 transition"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 glass-input rounded-xl text-sm font-semibold text-white placeholder:text-slate-500 transition"
              />
            </div>

            <button
              type="submit"
              className="btn-magnetic py-2.5 px-5 bg-linear-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-rose-500/30 shadow-xl">
        <div className="flex items-center gap-2.5 mb-4 text-rose-400">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-extrabold text-lg text-rose-400">Danger Zone</h3>
        </div>
        <p className="text-xs text-slate-300 max-w-xl mb-6 font-medium leading-relaxed">
          Deleting your account is permanent. This will remove your account
          profile from the database and you will be immediately signed out. You
          will not be able to recover this account later.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs cursor-pointer shadow-lg shadow-rose-600/20 active:scale-[0.98] transition-all"
        >
          Permanently Delete Account
        </button>
      </div>
    </div>,
  );
}
