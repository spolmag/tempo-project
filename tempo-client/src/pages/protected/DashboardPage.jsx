import { Link } from "react-router-dom";

export default function DashboardPage({ lang, user }) {
  const t = {
    th: {
      title: "จัดการงานสาขา",
      subTitle: "ยินดีต้อนรับสู่หน้าจัดการงานสาขา",
      usersCardTitle: "ผู้ใช้งาน",
      usersCardDesc: "เพิ่ม ลบ แก้ไขข้อมูลผู้ใช้งาน กำหนดสิทธิ์การใช้งานระบบ",
      accessButton: "จัดการ",
      restricted: "ท่านไม่มีสิทธิ์เข้าถึงส่วนนี้",
    },
    en: {
      title: "Main dashboard",
      subTitle: "Welcome to management portal",
      usersCardTitle: "User management",
      usersCardDesc: "Add, edit, remove users and manage system permissions.",
      accessButton: "Open management",
      restricted: "ํYou don't have permission to access this section",
    },
  }[lang];

  const isAdmin =
    user?.role === "ADMIN" ||
    user?.Role === "ADMIN" ||
    user?.role === "MANAGER" ||
    user?.role === "STAFF";

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="mt-2 text-sm text-slate-400">{t.subTitle}</p>
        </div>

        {/* Dashboard Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User management card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-amber-500/50 transition">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xl mb-4 group-hover:scale-110 transition">
                👥
              </div>
              <h2 className="text-lg font-semibold text-slate-100">
                {t.usersCardTitle}
              </h2>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                {t.usersCardDesc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              {isAdmin ? (
                <Link
                  to="/admin/users"
                  className="inline-flex items-center justify-center w-full bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase shadow-md hover:from-amber-400 hover:to-amber-500 transition"
                >
                  {t.accessButton} →
                </Link>
              ) : (
                <span className="text-[11px] text-amber-400/80 italic">
                  {t.restricted}
                </span>
              )}
            </div>
          </div>

          {/* Wait for future module */}
        </div>
      </div>
    </div>
  );
}
