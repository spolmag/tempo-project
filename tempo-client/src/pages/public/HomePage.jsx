import { Link } from "react-router-dom";

export default function HomePage({ lang = "th" }) {
  const t = {
    th: {
      heroSub: "TEMPO CONSERVATORY & INSTRUMENTS",
      heroTitle: "สุนทรียภาพแห่งดนตรี",
      btnCourses: "หลักสูตรของเรา",
      btnProducts: "เลือกชมสินค้า",
      feat1Title: "ครูผู้สอน",
      feat1Desc: "เรียนกับครูผู้สอนมากประสบการณ์",
      feat2Title: "เครื่องดนตรี",
      feat2Desc: "เครื่องดนตรีและอุปกรณ์คุณภาพสูง",
      feat3Title: "ระบบจัดการส่วนตัว",
      feat3Desc: "เช็ค-บริหารตารางการเรียน",
    },
    en: {
      heroSub: "TEMPO CONSERVATORY & INSTRUMENTS",
      heroTitle: "The Art of Music Excellence",
      btnCourses: "Explore Courses",
      btnProducts: "Browse Products",
      feat1Title: "Expert Faculty",
      feat1Desc: "Learn from highly experienced instructors",
      feat2Title: "Fine Instruments",
      feat2Desc: "High-quality instruments & gear",
      feat3Title: "Personal Dashboard",
      feat3Desc: "Manage and track your schedule",
    },
  }[lang] || {
    heroSub: "TEMPO CONSERVATORY & INSTRUMENTS",
    heroTitle: "สุนทรียภาพแห่งดนตรี",
    btnCourses: "หลักสูตรของเรา",
    btnProducts: "เลือกชมสินค้า",
    feat1Title: "ครูผู้สอน",
    feat1Desc: "เรียนกับครูผู้สอนมากประสบการณ์",
    feat2Title: "เครื่องดนตรี",
    feat2Desc: "เครื่องดนตรีและอุปกรณ์คุณภาพสูง",
    feat3Title: "ระบบจัดการส่วนตัว",
    feat3Desc: "เช็ค-บริหารตารางการเรียน",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <div className="relative pt-24 pb-16 px-4 text-center max-w-3xl mx-auto z-10">
        <span className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-4 block">
          {t.heroSub}
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-8">
          {t.heroTitle}
        </h1>
        <div className="flex justify-center gap-4">
          <Link
            to="/courses"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-full transition"
          >
            {t.btnCourses}
          </Link>
          <Link
            to="/products"
            className="border border-slate-700 hover:border-amber-500 px-6 py-3 rounded-full transition"
          >
            {t.btnProducts}
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
          <span className="text-amber-500 font-mono font-bold text-lg">01</span>
          <h3 className="text-xl font-semibold mt-4 mb-2">{t.feat1Title}</h3>
          <p className="text-slate-400 text-sm">{t.feat1Desc}</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
          <span className="text-amber-500 font-mono font-bold text-lg">02</span>
          <h3 className="text-xl font-semibold mt-4 mb-2">{t.feat2Title}</h3>
          <p className="text-slate-400 text-sm">{t.feat2Desc}</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
          <span className="text-amber-500 font-mono font-bold text-lg">03</span>
          <h3 className="text-xl font-semibold mt-4 mb-2">{t.feat3Title}</h3>
          <p className="text-slate-400 text-sm">{t.feat3Desc}</p>
        </div>
      </div>
    </div>
  );
}
