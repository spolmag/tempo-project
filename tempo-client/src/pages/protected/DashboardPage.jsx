import { Link } from "react-router-dom";

// Each card: who can see it and where it goes.
// ready: false shows "Comimg soon" instead of a link.
const CARDS = [
  {
    key: "staff",
    icon: "👥",
    to: "/admin/users",
    roles: ["ADMIN"],
    ready: true,
  },
  {
    key: "students",
    icon: "🎓",
    to: "/students",
    roles: ["ADMIN", "MANAGER", "STAFF"],
    ready: false,
  },
  {
    key: "branches",
    icon: "🏫",
    to: "/admin/branches",
    roles: ["ADMIN"],
    ready: false,
  },
  {
    key: "classes",
    icon: "🎹",
    to: "/teacher/classes",
    roles: ["TEACHER"],
    ready: false,
  },
];

const TEXT = {
  th: {
    title: "จัดการงานสาขา",
    subTitle: "ยินดีต้อนรับสู่หน้าจัดการงานสาขา",
    open: "จัดการ",
    soon: "เร็วๆนี้",
    empty: "ท่านไม่มีสิทธิ์เข้าถึงส่วนนี้",
    cards: {
      staff: {
        title: "พนักงาน",
        desc: "เพิ่ม, แก้ไข, กำหนดสิทธิ์ เปลี่ยนแปลงรายละเอียดพนักงาน",
      },
      students: {
        title: "นักเรียน-ผู้ปกครอง",
        desc: "ลงทะเบียนนักเรียนใหม่ จัดการข้อมูลนักเรียน-ผู้ปกครอง",
      },
      branches: {
        title: "สาขา",
        desc: "เพิ่ม, แก้ไขข้อมูลสาขา",
      },
      classes: {
        title: "คลาสเรียน",
        desc: "ตารางคลาส-รายชื่อนักเรียน",
      },
    },
  },
  en: {
    title: "Main dashboard",
    subTitle: "Welcome to the management portal",
    open: "Open",
    soon: "Coming soon",
    empty: "No tools are available for your role yet.",
    cards: {
      staff: {
        title: "Staff accounts",
        desc: "Add, edit and deactivate staff, teacher and manager accounts. Set roles and branches.",
      },
      students: {
        title: "Students & parents",
        desc: "Register new students and manage student and parent details for your branch.",
      },
      branches: {
        title: "Branches",
        desc: "Add and edit branches, and turn branches on or off.",
      },
      classes: {
        title: "My class",
        desc: "See your teaching schedule and the students in your classes.",
      },
    },
  },
};

export default function DashboardPage({ lang, user }) {
  const t = TEXT[lang];
  const cards = CARDS.filter((c) => c.roles.includes(user?.role));

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

        {cards.length === 0 ? (
          <p className="text-sm text-slate-400">{t.empty}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => {
              const text = t.cards[card.key];
              return (
                <div
                  key={card.key}
                  className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl group transition ${
                    card.ready ? "hover:border-amber-500/50" : "opacity-70"
                  }`}
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition">
                      {card.icon}
                    </div>
                    <h2 className="text-lg font-semibold text-slate-100">
                      {text.title}
                    </h2>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                      {text.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80">
                    {card.ready ? (
                      <Link
                        to={card.to}
                        className="inline-flex items-center justify-center w-full bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase shadow-md hover:from-amber-400 hover:to-amber-500 transition"
                      >
                        {t.open} ➡️
                      </Link>
                    ) : (
                      <span className="block w-full text-center py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase text-slate-500 border border-slate-800">
                        {t.soon}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
