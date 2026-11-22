import React from "react";
import { fmtDate, fmtTime, shortId } from "../utils";
import {
  Search,
  X,
  Plus,
  Printer,
  Download,
  Sparkles,
  ArrowRight,
  Users as UsersIcon,
  Clock3,
  Check,
  CheckCircle2,
  AlertTriangle,
  CalendarDays,
  FileText,
  Heart,
  Activity,
  HelpCircle,
  Leaf,
  Bell
} from "lucide-react";

export { Progress } from "./pages/Progress";

export function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex items-center justify-between gap-[18px] mb-[24px] max-[600px]:items-start max-[600px]:flex-col max-[600px]:mb-[18px]">
      <div>
        <div className="text-[10px] font-extrabold tracking-[0.15em] text-[#77917f] mb-[8px]">
          {eyebrow}
        </div>
        <h1 className="font-['Manrope',sans-serif] tracking-[-0.035em] text-[clamp(25px,2vw,32px)] max-[600px]:text-[24px] m-0 mb-[8px] font-bold">
          {title}
        </h1>
        <p className="text-[#77847c] text-[13px] m-0">
          {description}
        </p>
      </div>
      {action ? (
        <div className="max-[600px]:self-stretch [&>button]:max-[600px]:w-full">
          {action}
        </div>
      ) : null}
    </div>
  );
}

// Shared patient-page visual language: botanical hero + pastel summary cards.
export function PatientPageHero({ eyebrow, title, description, action }) {
  return (
    <section className="relative flex items-center justify-between gap-[22px] min-h-[184px] max-[1100px]:min-h-[165px] max-[620px]:min-h-[155px] p-[28px_42px] max-[1100px]:p-[23px_22px] max-[620px]:p-[18px] overflow-hidden isolate rounded-[18px] bg-[#075238] bg-[linear-gradient(90deg,rgba(2,65,43,.98)_0%,rgba(2,76,49,.91)_40%,rgba(2,76,49,.26)_72%,rgba(2,76,49,.08)_100%),url('/ayurdhara-panchakarma-hero.png')] bg-cover bg-[center_56%] max-[1100px]:bg-[64%_center] shadow-[0_7px_20px_rgba(18,64,42,.08)]">
      <div className="relative z-[1] max-w-[72%] max-[1100px]:max-w-full">
        <span className="block mb-[13px] text-[#dce9bb] text-[10px] max-[620px]:text-[8px] font-extrabold tracking-[0.2em] uppercase">
          {eyebrow}
        </span>
        <h1 className="m-[0_0_8px] text-white font-['Playfair_Display',Georgia,serif] text-[clamp(29px,2.5vw,40px)] max-[1100px]:text-[29px] max-[620px]:text-[25px] font-bold leading-[1.12] tracking-[-0.025em] max-[1100px]:max-w-[75%] max-[620px]:max-w-[85%]">
          {title}
        </h1>
        <p className="m-0 text-[#f0f6ed] text-[14px] max-[1100px]:text-[12px] max-[620px]:text-[10px] leading-[1.55] max-[1100px]:max-w-[78%] max-[620px]:max-w-[90%]">
          {description}
        </p>
      </div>
      {action ? (
        <div className="relative z-[2] shrink-0 self-end max-[1100px]:absolute max-[1100px]:right-[15px] max-[1100px]:bottom-[13px]">
          {action}
        </div>
      ) : null}
    </section>
  );
}

export function PatientPageStats({ items = [] }) {
  const statTones = {
    blue: {
      bg: "bg-[linear-gradient(115deg,#fff_0%,#edf4ff_100%)]",
      icon: "bg-[#e1ebff] text-[#2367d4]",
    },
    gold: {
      bg: "bg-[linear-gradient(115deg,#fff_0%,#fff6e7_100%)]",
      icon: "bg-[#fff0d3] text-[#bd7b10]",
    },
    purple: {
      bg: "bg-[linear-gradient(115deg,#fff_0%,#f4edff_100%)]",
      icon: "bg-[#eee2ff] text-[#6e28d9]",
    },
    sky: {
      bg: "bg-[linear-gradient(115deg,#fff_0%,#eaf3ff_100%)]",
      icon: "bg-[#deebff] text-[#1763a8]",
    },
    green: {
      bg: "bg-[linear-gradient(115deg,#fff_0%,#edf6e8_100%)]",
      icon: "bg-[#e3f1dc] text-[#17633e]",
    },
  };

  return (
    <section className="grid grid-cols-5 max-[1100px]:grid-cols-3 max-[768px]:grid-cols-2 max-[420px]:grid-cols-1 gap-[13px] max-[1100px]:gap-[10px] mb-[2px]">
      {items.map((item, index) => {
        const toneKey = item.tone || ["green", "blue", "gold", "purple", "sky"][index % 5];
        const toneStyle = statTones[toneKey] || statTones.green;
        return (
          <article
            className={`flex items-center gap-[14px] max-[1100px]:gap-[10px] max-[620px]:gap-[8px] min-w-0 min-h-[91px] max-[1100px]:min-h-[84px] max-[768px]:min-h-[78px] p-[14px_16px] max-[1100px]:p-[12px] max-[768px]:p-[10px] border border-[#e7ece4] rounded-[16px] shadow-[0_4px_15px_rgba(30,66,43,.055)] ${toneStyle.bg}`}
            key={item.label}
          >
            <span
              className={`grid place-items-center shrink-0 w-[58px] h-[58px] max-[620px]:w-[42px] max-[620px]:h-[42px] rounded-[17px] max-[620px]:rounded-[12px] text-[26px] max-[620px]:text-[20px] font-bold ${toneStyle.icon}`}
              aria-hidden="true"
            >
              {item.icon || <Sparkles size={24} />}
            </span>
            <span className="flex flex-col min-w-0">
              <b className="text-[#103c2c] font-['Playfair_Display',Georgia,serif] text-[31px] max-[620px]:text-[24px] leading-[1.02] font-bold">
                {item.value}
              </b>
              <strong className="mt-[3px] text-[#17372b] text-[12px] max-[620px]:text-[11px] font-bold">
                {item.label}
              </strong>
              {item.detail ? (
                <small className="mt-[3px] text-[#7d8c81] text-[10px] max-[620px]:text-[9px] leading-[1.35] whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.detail}
                </small>
              ) : null}
            </span>
          </article>
        );
      })}
    </section>
  );
}

export function Dashboard({ user, patients, treatments, scheduled, completed, alerts, onNavigate }) {
  const pending = treatments.filter(t => !["Completed", "Missed"].includes(t.session_status || "Scheduled"));
  const metrics = [
    { label: "Total patients", value: patients.length, detail: "Registered in the system", icon: <UsersIcon size={18} strokeWidth={2} />, tone: "bg-[#e3f1e5] text-[#2f7c4a]" },
    { label: "Scheduled sessions", value: scheduled.length, detail: "Appointments with a time", icon: <Clock3 size={18} strokeWidth={2} />, tone: "bg-[#e6edf9] text-[#587ab6]" },
    { label: "Completed sessions", value: completed.length, detail: "Recorded as complete", icon: <CheckCircle2 size={18} strokeWidth={2} />, tone: "bg-[#fbf0dc] text-[#b88931]" },
    { label: "Open alerts", value: alerts.length, detail: "Require team review", icon: <AlertTriangle size={18} strokeWidth={2} />, tone: "bg-[#fae8e5] text-[#bd5a50]" }
  ];

  return (
    <>
      <div className="bg-[linear-gradient(105deg,#194f39,#246a4c)] text-white rounded-[16px] p-[28px_30px] flex items-center justify-between relative overflow-hidden mb-[21px] min-h-[154px] max-[600px]:p-[21px_18px] max-[600px]:min-h-[140px] max-[600px]:gap-[10px] after:content-[''] after:absolute after:w-[250px] after:h-[250px] after:border after:border-white/10 after:rounded-full after:right-[20px] after:-top-[115px] after:shadow-[0_0_0_35px_rgba(255,255,255,0.03),0_0_0_70px_rgba(255,255,255,0.02)]">
        <div>
          <span className="text-[9px] tracking-[0.17em] text-[#b4d5b8] font-extrabold block">
            YOUR CARE WORKSPACE
          </span>
          <h1 className="font-['Manrope',sans-serif] tracking-[-0.035em] text-[27px] mt-[12px] mb-[7px] text-white max-[600px]:text-[22px] max-[600px]:max-w-[260px] font-bold flex items-center flex-wrap gap-2">
            <span>Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {user.name?.split(" ")[0] || "there"}</span>
            <Sparkles size={20} className="text-[#d4e4b2] shrink-0" />
          </h1>
          <p className="text-[12px] text-[#d2e4d5] m-0 max-[600px]:max-w-[250px] max-[600px]:text-[10px]">
            Here’s an overview of your Panchakarma care activities.
          </p>
        </div>
        <div className="absolute right-[40px] max-[900px]:right-[15px] max-[600px]:right-[5px] text-[#d5e6c3] opacity-35 pointer-events-none select-none">
          <Leaf size={105} strokeWidth={1.3} className="rotate-12" />
        </div>
      </div>

      <div className="grid grid-cols-4 max-[1200px]:gap-[10px] max-[900px]:grid-cols-2 gap-[15px] mb-[21px] max-[600px]:gap-[8px]">
        {metrics.map((m) => (
          <div
            className="bg-white border border-[#e8ede6] rounded-[13px] p-[18px_18px_16px] relative min-w-0 shadow-[0_3px_12px_#284c3010] max-[1200px]:p-[15px] max-[600px]:p-[12px]"
            key={m.label}
          >
            <div className={`w-[35px] h-[35px] rounded-[10px] grid place-items-center text-[17px] mb-[14px] max-[600px]:w-[30px] max-[600px]:h-[30px] max-[600px]:mb-[9px] ${m.tone}`}>
              {m.icon}
            </div>
            <div className="text-[11px] text-[#758379] font-semibold max-[600px]:text-[10px]">
              {m.label}
            </div>
            <div className="font-['Manrope',sans-serif] font-extrabold text-[28px] tracking-[-0.04em] my-[5px_4px] max-[1200px]:text-[25px] max-[600px]:text-[23px] max-[380px]:text-[20px]">
              {m.value}
            </div>
            <div className="text-[10px] text-[#9aa59c] max-[600px]:text-[9px]">
              {m.detail}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)] max-[1200px]:grid-cols-1 gap-[18px] mb-[21px]">
        <section className="bg-white border border-[#e7ece5] rounded-[13px] shadow-[0_3px_12px_#284c3008] min-w-0 p-[21px] max-[600px]:p-[14px]">
          <div className="flex items-center justify-between gap-[15px] pb-[17px] max-[600px]:items-start">
            <div>
              <h2 className="font-['Manrope',sans-serif] tracking-[-0.035em] text-[17px] mt-0 mb-[5px] font-bold">
                Upcoming care schedule
              </h2>
              <p className="text-[#77847c] text-[10px] m-0">
                Appointments from your treatment records
              </p>
            </div>
            <button
              className="border-0 bg-transparent text-[#276a50] text-[12px] font-bold p-[4px] cursor-pointer hover:underline max-[600px]:text-[10px] inline-flex items-center gap-1"
              onClick={() => onNavigate("schedule")}
            >
              Manage schedule <ArrowRight size={13} strokeWidth={2.2} />
            </button>
          </div>

          {scheduled.length === 0 ? (
            <Empty
              icon={<Clock3 size={28} className="text-[#83a386]" strokeWidth={1.8} />}
              title="No scheduled treatments yet"
              text="When treatments have appointment times, they will appear here."
            />
          ) : (
            <div className="flex flex-col">
              {scheduled.slice(0, 6).map((t) => (
                <div
                  className="flex items-center gap-[12px] py-[13px] border-t border-[#f0f2ee] min-w-0 max-[600px]:gap-[7px] max-[380px]:flex-wrap"
                  key={t.uuid}
                >
                  <div className="w-[67px] shrink-0 flex flex-col gap-[4px] max-[600px]:w-[55px]">
                    <b className="text-[11px] max-[600px]:text-[10px] font-bold">
                      {fmtTime(t.appointment_start)}
                    </b>
                    <span className="text-[9px] text-[#89958b]">
                      {fmtDate(t.appointment_start)}
                    </span>
                  </div>
                  <div className="w-[31px] h-[31px] rounded-full grid place-items-center text-[12px] font-extrabold shrink-0 max-[600px]:w-[26px] max-[600px]:h-[26px] bg-[#e7efe5] text-[#497554]">
                    {(t.patient_name || "P").slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
                    <b className="text-[11px] whitespace-nowrap overflow-hidden text-ellipsis max-[600px]:text-[10px] font-bold">
                      {t.p1 || "Panchakarma session"}
                    </b>
                    <span className="text-[9px] text-[#8b968d] whitespace-nowrap overflow-hidden text-ellipsis max-[600px]:text-[8px]">
                      {t.patient_name || "Patient"} ·{" "}
                      {t.therapist_name || "Therapist not assigned"}
                    </span>
                  </div>
                  <Status value={t.session_status || "Scheduled"} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white border border-[#e7ece5] rounded-[13px] shadow-[0_3px_12px_#284c3008] min-w-0 p-[21px] max-[600px]:p-[14px]">
          <div className="flex items-center justify-between gap-[15px] pb-[17px] max-[600px]:items-start">
            <div>
              <h2 className="font-['Manrope',sans-serif] tracking-[-0.035em] text-[17px] mt-0 mb-[5px] font-bold">
                Care progress
              </h2>
              <p className="text-[#77847c] text-[10px] m-0">
                Recorded session outcomes
              </p>
            </div>
            <button
              className="border-0 bg-transparent text-[#276a50] text-[12px] font-bold p-[4px] cursor-pointer hover:underline max-[600px]:text-[10px] inline-flex items-center gap-1"
              onClick={() => onNavigate("progress")}
            >
              View progress <ArrowRight size={13} strokeWidth={2.2} />
            </button>
          </div>

          <div className="flex items-center justify-center gap-[22px] p-[18px_5px_21px] max-[1200px]:justify-start max-[600px]:gap-[13px] max-[600px]:flex-wrap">
            <div
              className="w-[130px] h-[130px] rounded-full grid place-items-center relative shrink-0 max-[600px]:w-[105px] max-[600px]:h-[105px] before:content-[''] before:absolute before:inset-[10px] before:bg-white before:rounded-full"
              style={{
                background: `conic-gradient(#32875b ${treatments.length ? Math.round((completed.length / treatments.length) * 100) : 0}%, #e8efe8 0)`
              }}
            >
              <div className="relative flex flex-col items-center gap-[3px]">
                <strong className="font-['Manrope',sans-serif] text-[27px] max-[600px]:text-[22px] font-extrabold">
                  {treatments.length ? Math.round((completed.length / treatments.length) * 100) : 0}%
                </strong>
                <span className="text-[9px] text-[#849086]">Completed</span>
              </div>
            </div>

            <div className="flex flex-col gap-[12px] min-w-0">
              <span className="grid grid-cols-[9px_auto_20px] items-center gap-[7px] text-[10px] text-[#758379] whitespace-nowrap max-[600px]:text-[9px] max-[600px]:grid-cols-[8px_auto_15px]">
                <i className="w-[7px] h-[7px] rounded-full bg-[#32875b] inline-block not-italic" />{" "}
                Completed <b className="text-[#33463a] text-right font-bold">{completed.length}</b>
              </span>
              <span className="grid grid-cols-[9px_auto_20px] items-center gap-[7px] text-[10px] text-[#758379] whitespace-nowrap max-[600px]:text-[9px] max-[600px]:grid-cols-[8px_auto_15px]">
                <i className="w-[7px] h-[7px] rounded-full bg-[#6388c1] inline-block not-italic" />{" "}
                Scheduled / ongoing{" "}
                <b className="text-[#33463a] text-right font-bold">{pending.length}</b>
              </span>
              <span className="grid grid-cols-[9px_auto_20px] items-center gap-[7px] text-[10px] text-[#758379] whitespace-nowrap max-[600px]:text-[9px] max-[600px]:grid-cols-[8px_auto_15px]">
                <i className="w-[7px] h-[7px] rounded-full bg-[#d36b61] inline-block not-italic" />{" "}
                Alerts <b className="text-[#33463a] text-right font-bold">{alerts.length}</b>
              </span>
            </div>
          </div>

          <div className="border-t border-[#edf0eb] pt-[13px] flex items-start gap-[9px]">
            <Sparkles size={14} className="text-[#67926d] shrink-0 mt-0.5" strokeWidth={1.8} />
            <p className="text-[10px] leading-[1.5] text-[#849087] m-0">
              Progress reflects the session status recorded by your care team.
            </p>
          </div>
        </section>
      </div>

      <div className="flex items-center justify-between gap-[20px] bg-[#eef4eb] border border-[#e4ece1] rounded-[14px] p-[20px_22px] max-[1200px]:items-start max-[1200px]:flex-col max-[600px]:p-[15px]">
        <div>
          <div className="text-[10px] font-extrabold tracking-[0.15em] text-[#77917f] mb-[8px]">
            QUICK ACTIONS
          </div>
          <h2 className="font-['Manrope',sans-serif] tracking-[-0.035em] text-[17px] m-0 font-bold">
            What would you like to do?
          </h2>
        </div>
        <div className="flex gap-[10px] max-[900px]:flex-wrap max-[600px]:w-full max-[600px]:grid max-[600px]:grid-cols-1">
          <button
            className="bg-white border border-[#e4ebe1] rounded-[10px] p-[11px_14px] grid grid-cols-[25px_auto] grid-rows-[auto_auto] items-center text-left min-w-[135px] cursor-pointer hover:border-[#a8c7aa] hover:-translate-y-px transition-[border-color,transform] duration-150 max-[600px]:w-full"
            onClick={() => onNavigate("patients")}
          >
            <span className="row-span-2 text-[#528160]"><UsersIcon size={20} strokeWidth={1.9} /></span>
            <b className="text-[10px] font-bold">View patients</b>
            <small className="text-[9px] text-[#8b968c] mt-[3px]">
              Patient records
            </small>
          </button>
          <button
            className="bg-white border border-[#e4ebe1] rounded-[10px] p-[11px_14px] grid grid-cols-[25px_auto] grid-rows-[auto_auto] items-center text-left min-w-[135px] cursor-pointer hover:border-[#a8c7aa] hover:-translate-y-px transition-[border-color,transform] duration-150 max-[600px]:w-full"
            onClick={() => onNavigate("schedule")}
          >
            <span className="row-span-2 text-[#528160]"><CalendarDays size={20} strokeWidth={1.9} /></span>
            <b className="text-[10px] font-bold">Schedule care</b>
            <small className="text-[9px] text-[#8b968c] mt-[3px]">
              Resolve time conflicts
            </small>
          </button>
          <button
            className="bg-white border border-[#e4ebe1] rounded-[10px] p-[11px_14px] grid grid-cols-[25px_auto] grid-rows-[auto_auto] items-center text-left min-w-[135px] cursor-pointer hover:border-[#a8c7aa] hover:-translate-y-px transition-[border-color,transform] duration-150 max-[600px]:w-full"
            onClick={() => onNavigate("alerts")}
          >
            <span className="row-span-2 text-[#528160]"><AlertTriangle size={20} strokeWidth={1.9} /></span>
            <b className="text-[10px] font-bold">Emergency alerts</b>
            <small className="text-[9px] text-[#8b968c] mt-[3px]">
              Review incidents
            </small>
          </button>
        </div>
      </div>
    </>
  );
}

export function Status({ value }) {
  const status = (value || "Scheduled").toLowerCase();
  const cls =
    status === "completed"
      ? "bg-[#e4f3e7] text-[#2b7b46]"
      : status === "ongoing"
      ? "bg-[#e8effb] text-[#5279b5]"
      : status === "missed" || status === "interrupted"
      ? "bg-[#fbe8e5] text-[#b64d46]"
      : status === "open" || status === "critical"
      ? "bg-[#fbe8e5] text-[#b64d46]"
      : "bg-[#f5efdf] text-[#a67d2d]";

  return (
    <span
      className={`text-[9px] leading-none inline-flex items-center whitespace-nowrap rounded-[20px] p-[6px_8px] font-bold max-[380px]:whitespace-normal ${cls}`}
    >
      {value || "Scheduled"}
    </span>
  );
}

export function Empty({ icon, title, text }) {
  return (
    <div className="p-[42px_18px] text-center">
      <div className="mb-[10px] grid place-items-center">{icon || <Sparkles size={28} className="text-[#83a386]" strokeWidth={1.8} />}</div>
      <b className="text-[13px] block font-bold">{title}</b>
      <p className="text-[11px] text-[#8a958b] mt-[7px] mb-0">{text}</p>
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder = "Search records…" }) {
  return (
    <div className="flex items-center gap-[8px] bg-white border border-[#e3e9e1] rounded-[9px] px-[11px] w-[min(410px,100%)] h-[39px] max-[600px]:w-full max-[600px]:min-w-0">
      <Search size={16} className="text-[#7f9282] shrink-0" strokeWidth={2} />
      <input
        className="border-0 outline-none bg-transparent min-w-0 flex-1 text-[11px] text-[#20372f]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          className="border-0 bg-transparent text-[#869287] hover:text-[#334639] cursor-pointer grid place-items-center"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X size={15} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

export function Patients({ patients, search, setSearch, onAdd }) {
  return (
    <>
      <PageHeading
        eyebrow="CARE DIRECTORY"
        title="Patients"
        description="View and manage registered patient accounts."
        action={
          <button
            className="border border-transparent rounded-[9px] p-[10px_14px] text-[12px] font-bold inline-flex items-center justify-center gap-[7px] transition-[transform,background] duration-150 bg-[#19563f] text-white shadow-[0_4px_10px_#19563f16] hover:bg-[#124630] hover:-translate-y-px cursor-pointer"
            onClick={onAdd}
          >
            <Plus size={14} strokeWidth={2.5} /> Add patient
          </button>
        }
      />
      <div className="flex items-center gap-[14px] mb-[16px] max-[600px]:items-start max-[600px]:flex-col max-[600px]:w-full">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search by patient name, email or ID…"
        />
        <span className="text-[10px] text-[#89958b] font-semibold">
          {patients.length} patient{patients.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="bg-white border border-[#e7ece5] rounded-[13px] shadow-[0_3px_12px_#284c3008] min-w-0 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="border-collapse w-full min-w-[700px] text-left">
            <thead>
              <tr>
                <th className="bg-[#f8faf7] text-[9px] uppercase tracking-[0.07em] text-[#879389] font-extrabold p-[13px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                  Patient
                </th>
                <th className="bg-[#f8faf7] text-[9px] uppercase tracking-[0.07em] text-[#879389] font-extrabold p-[13px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                  Patient ID
                </th>
                <th className="bg-[#f8faf7] text-[9px] uppercase tracking-[0.07em] text-[#879389] font-extrabold p-[13px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                  Email
                </th>
                <th className="bg-[#f8faf7] text-[9px] uppercase tracking-[0.07em] text-[#879389] font-extrabold p-[13px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                  Record status
                </th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.patient_id} className="hover:bg-[#fbfcfa]">
                  <td className="text-[11px] text-[#536157] p-[13px_17px] border-b border-[#eef1ed] align-middle">
                    <div className="flex items-center gap-[10px] whitespace-nowrap">
                      <div className="w-[31px] h-[31px] rounded-full grid place-items-center bg-[#e7efe5] text-[#497554] text-[12px] font-extrabold shrink-0">
                        {(p.name || "P").slice(0, 1)}
                      </div>
                      <b className="font-bold">{p.name}</b>
                    </div>
                  </td>
                  <td className="text-[11px] text-[#536157] p-[13px_17px] border-b border-[#eef1ed] align-middle">
                    <span className="font-mono text-[10px] text-[#849087]">
                      {shortId(p.patient_id)}
                    </span>
                  </td>
                  <td className="text-[11px] text-[#536157] p-[13px_17px] border-b border-[#eef1ed] align-middle">
                    {p.email || "—"}
                  </td>
                  <td className="text-[11px] text-[#536157] p-[13px_17px] border-b border-[#eef1ed] align-middle">
                    <Status value="Active" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {patients.length === 0 && (
          <Empty
            icon={<UsersIcon size={28} className="text-[#83a386]" strokeWidth={1.8} />}
            title="No patients found"
            text="Try a different search or add a patient account."
          />
        )}
      </div>
    </>
  );
}

export function Treatments({ treatments, search, setSearch, onSchedule, readOnly = false }) {
  return (
    <div className="flex flex-col gap-[16px] w-full">
      <PatientPageHero
        eyebrow="CARE PLANNING"
        title="Treatment Plans"
        description="Review treatment records and schedule or reschedule your sessions."
        action={
          <button
            className="min-h-[42px] px-[17px] border border-white/55 rounded-full bg-white/[0.94] text-[#075238] font-bold shadow-[0_4px_14px_rgba(0,0,0,.08)] cursor-pointer max-[620px]:w-full inline-flex items-center justify-center gap-1.5"
            onClick={() => window.print()}
          >
            <Printer size={15} strokeWidth={2} /> Print list
          </button>
        }
      />
      <PatientPageStats
        items={[
          { label: "Total Plans", value: treatments.length, detail: "Prescribed care plans", icon: <FileText size={22} strokeWidth={1.8} />, tone: "green" },
          { label: "In Progress", value: treatments.filter(t => (t.session_status || "Scheduled").toLowerCase() === "ongoing").length, detail: "Currently underway", icon: <Clock3 size={22} strokeWidth={1.8} />, tone: "blue" },
          { label: "Scheduled", value: treatments.filter(t => (t.session_status || "Scheduled").toLowerCase() === "scheduled").length, detail: "Appointments arranged", icon: <CalendarDays size={22} strokeWidth={1.8} />, tone: "gold" },
          { label: "Upcoming", value: treatments.filter(t => t.appointment_start && new Date(t.appointment_start) > new Date()).length, detail: "Future appointments", icon: <Activity size={22} strokeWidth={1.8} />, tone: "purple" },
          { label: "Completed", value: treatments.filter(t => (t.session_status || "").toLowerCase() === "completed").length, detail: "Recorded as complete", icon: <CheckCircle2 size={22} strokeWidth={1.8} />, tone: "sky" }
        ]}
      />
      <div className="flex items-center justify-between gap-[14px] my-[14px] max-[620px]:flex-col max-[620px]:items-stretch">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search treatment or therapist…"
        />
        <span className="text-[10px] text-[#89958b] font-semibold">
          {treatments.length} {treatments.length === 1 ? "treatment record" : "treatment records"}
        </span>
      </div>

      {treatments.length ? (
        <div className="grid grid-cols-2 max-[900px]:grid-cols-1 gap-[15px]">
          {treatments.map((t) => {
            const procedures = [t.p1, t.p2, t.p3, t.p4, t.p5].filter(Boolean);
            return (
              <article
                className="relative overflow-hidden bg-white border border-[#e6ece3] rounded-[17px] p-[19px_22px] max-[620px]:p-[16px] shadow-[0_5px_17px_rgba(27,68,43,.055)] min-w-0 flex flex-col after:content-[''] after:absolute after:-right-[15px] after:-bottom-[56px] after:w-[42%] after:h-[95px] after:rounded-full after:bg-[linear-gradient(90deg,rgba(224,241,218,0),rgba(224,241,218,.65))] after:pointer-events-none"
                key={t.uuid}
              >
                <div className="flex items-center justify-between mb-[12px]">
                  <div className="w-[39px] h-[39px] rounded-[12px] bg-[#edf5e9] text-[#4d7f5c] grid place-items-center text-[19px] shrink-0">
                    <FileText size={18} strokeWidth={1.8} />
                  </div>
                  <Status value={t.session_status || "Scheduled"} />
                </div>
                <div className="mb-[14px]">
                  <h2 className="font-['Playfair_Display',Georgia,serif] text-[18px] max-[1200px]:text-[16px] font-bold text-[#1c3829] m-[0_0_3px]">
                    {t.p1 || "Panchakarma treatment"}
                  </h2>
                  <p className="text-[10px] max-[1200px]:text-[9px] text-[#869289] m-0">
                    {t.patient_name || "Your treatment plan"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-[10px] p-[12px] bg-[#f8faf6] rounded-[10px] mb-[12px]">
                  <div>
                    <small className="text-[9px] tracking-[0.08em] uppercase text-[#87958a] font-bold block mb-[2px]">
                      Duration
                    </small>
                    <b className="text-[11px] text-[#315442] block whitespace-nowrap overflow-hidden text-ellipsis font-bold">
                      {t.duration_minutes
                        ? `${t.duration_minutes} minutes`
                        : "Not specified"}
                    </b>
                  </div>
                  <div>
                    <small className="text-[9px] tracking-[0.08em] uppercase text-[#87958a] font-bold block mb-[2px]">
                      Appointment
                    </small>
                    <b className="text-[11px] text-[#315442] block whitespace-nowrap overflow-hidden text-ellipsis font-bold">
                      {fmtDate(t.appointment_start)}
                    </b>
                  </div>
                  <div>
                    <small className="text-[9px] tracking-[0.08em] uppercase text-[#87958a] font-bold block mb-[2px]">
                      Therapist
                    </small>
                    <b className="text-[11px] text-[#315442] block whitespace-nowrap overflow-hidden text-ellipsis font-bold">
                      {t.therapist_name || "To be assigned"}
                    </b>
                  </div>
                  <div>
                    <small className="text-[9px] tracking-[0.08em] uppercase text-[#87958a] font-bold block mb-[2px]">
                      Priority
                    </small>
                    <b className="text-[11px] text-[#315442] block whitespace-nowrap overflow-hidden text-ellipsis font-bold">
                      {t.priority ? `${t.priority} / 5` : "Not specified"}
                    </b>
                  </div>
                </div>
                {procedures.length > 1 && (
                  <div className="flex flex-col gap-[9px] mb-[14px]">
                    <small className="text-[9px] tracking-[0.08em] uppercase text-[#87958a] font-bold block">
                      Prescribed procedures
                    </small>
                    <div className="flex flex-wrap gap-[7px]">
                      {procedures.map((procedure, i) => (
                        <span
                          key={`${t.uuid}-${i}`}
                          className="bg-[#edf5e9] text-[#477653] rounded-[20px] p-[6px_10px] text-[10px] font-semibold"
                        >
                          {procedure}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {!readOnly && (
                  <button
                    className="w-full mt-auto flex justify-center items-center gap-[8px] border border-[#dce5dc] bg-white text-[#345b46] hover:bg-[#f3f8f3] rounded-[9px] p-[9px_12px] text-[11px] font-bold cursor-pointer transition-colors duration-150"
                    onClick={() => onSchedule?.(t)}
                  >
                    <span>Schedule / reschedule</span> <ArrowRight size={14} strokeWidth={2} />
                  </button>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <section className="bg-white border border-[#e6ece3] rounded-[17px] min-h-[290px] p-[38px_22px] flex flex-col items-center justify-center text-center shadow-[0_5px_17px_rgba(27,68,43,.055)] min-w-0">
          <div className="w-[68px] h-[68px] rounded-[22px] bg-[#edf5e9] text-[#528967] grid place-items-center mb-[18px]">
            <FileText size={30} strokeWidth={1.8} />
          </div>
          <h2 className="font-['Playfair_Display',serif] text-[20px] text-[#173f2f] m-[0_0_8px] font-bold">
            {search ? "No matching treatment plans" : "No treatment records yet"}
          </h2>
          <p className="text-[12px] text-[#839087] max-w-[470px] leading-[1.6] m-0">
            {search
              ? "Try a different treatment or therapist keyword."
              : "Your practitioner-prescribed treatment records will appear here when they are available."}
          </p>
        </section>
      )}
    </div>
  );
}

export function Sessions({ treatments, notes = {}, setNotes, onUpdate, readOnly = false }) {
  const [draftStatuses, setDraftStatuses] = React.useState({});
  const rows = treatments || [];
  return (
    <div className="flex flex-col gap-[16px] w-full">
      <PatientPageHero
        eyebrow="SESSION DELIVERY"
        title="Sessions"
        description="Review your scheduled Panchakarma therapies, appointment details and recorded outcomes."
        action={
          <button
            className="min-h-[42px] px-[17px] border border-white/55 rounded-full bg-white/[0.94] text-[#075238] font-bold shadow-[0_4px_14px_rgba(0,0,0,.08)] cursor-pointer max-[620px]:w-full inline-flex items-center justify-center gap-1.5"
            onClick={() => window.print()}
          >
            <Printer size={15} strokeWidth={2} /> Print sessions
          </button>
        }
      />
      <PatientPageStats
        items={[
          { label: "Total Sessions", value: rows.length, detail: "Sessions in your record", icon: <FileText size={22} strokeWidth={1.8} />, tone: "green" },
          { label: "Scheduled", value: rows.filter(t => (t.session_status || "Scheduled").toLowerCase() === "scheduled").length, detail: "Awaiting appointment", icon: <CalendarDays size={22} strokeWidth={1.8} />, tone: "blue" },
          { label: "Ongoing", value: rows.filter(t => (t.session_status || "").toLowerCase() === "ongoing").length, detail: "Currently underway", icon: <Clock3 size={22} strokeWidth={1.8} />, tone: "gold" },
          { label: "Completed", value: rows.filter(t => (t.session_status || "").toLowerCase() === "completed").length, detail: "Recorded as complete", icon: <CheckCircle2 size={22} strokeWidth={1.8} />, tone: "purple" },
          { label: "Other Status", value: rows.filter(t => ["missed", "interrupted"].includes((t.session_status || "").toLowerCase())).length, detail: "Missed or interrupted", icon: <AlertTriangle size={22} strokeWidth={1.8} />, tone: "sky" }
        ]}
      />
      {rows.length ? (
        <div className="bg-white border border-[#e6ece3] rounded-[17px] p-0 overflow-hidden shadow-[0_5px_17px_rgba(27,68,43,.055)] min-w-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse min-w-[760px] text-left">
              <thead className="bg-[#f4f8f1]">
                <tr>
                  <th className="text-[10px] tracking-[0.09em] uppercase text-[#617769] font-extrabold p-[16px_17px] border-b border-[#e9eee7] whitespace-nowrap">Session / procedure</th>
                  <th className="text-[10px] tracking-[0.09em] uppercase text-[#617769] font-extrabold p-[16px_17px] border-b border-[#e9eee7] whitespace-nowrap">When</th>
                  <th className="text-[10px] tracking-[0.09em] uppercase text-[#617769] font-extrabold p-[16px_17px] border-b border-[#e9eee7] whitespace-nowrap">Therapist</th>
                  <th className="text-[10px] tracking-[0.09em] uppercase text-[#617769] font-extrabold p-[16px_17px] border-b border-[#e9eee7] whitespace-nowrap">Status</th>
                  <th className="text-[10px] tracking-[0.09em] uppercase text-[#617769] font-extrabold p-[16px_17px] border-b border-[#e9eee7] whitespace-nowrap">Observation notes</th>
                  {!readOnly && (
                    <th className="text-[10px] tracking-[0.09em] uppercase text-[#617769] font-extrabold p-[16px_17px] border-b border-[#e9eee7] whitespace-nowrap">Update</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.uuid} className="hover:bg-[#f8fbf6]">
                    <td className="p-[16px_17px] border-b border-[#edf1eb] text-[11px] text-[#536b5c] align-middle">
                      <div className="font-bold text-[#244b37] text-[12px]">
                        {t.p1 || "Panchakarma session"}
                      </div>
                      <small className="block text-[#91a096] text-[9px] mt-[5px]">
                        {shortId(t.uuid)}
                      </small>
                    </td>
                    <td className="p-[16px_17px] border-b border-[#edf1eb] text-[11px] text-[#536b5c] align-middle">
                      <div className="font-bold text-[#244b37] text-[12px]">
                        {fmtDate(t.appointment_start)}
                      </div>
                      <small className="block text-[#91a096] text-[9px] mt-[5px]">
                        {fmtTime(t.appointment_start)}
                      </small>
                    </td>
                    <td className="p-[16px_17px] border-b border-[#edf1eb] text-[11px] text-[#536b5c] align-middle">
                      {t.therapist_name || "Not assigned"}
                    </td>
                    <td className="p-[16px_17px] border-b border-[#edf1eb] text-[11px] text-[#536b5c] align-middle">
                      {readOnly ? (
                        <Status value={t.session_status || "Scheduled"} />
                      ) : (
                        <select
                          className="border border-[#dfe8de] rounded-[8px] bg-white p-[9px_10px] text-[#345744] text-[11px] max-w-[180px] outline-none"
                          value={
                            draftStatuses[t.uuid] ??
                            t.session_status ??
                            "Scheduled"
                          }
                          onChange={(e) =>
                            setDraftStatuses((v) => ({
                              ...v,
                              [t.uuid]: e.target.value,
                            }))
                          }
                        >
                          <option>Scheduled</option>
                          <option>Ongoing</option>
                          <option>Completed</option>
                          <option>Missed</option>
                          <option>Interrupted</option>
                        </select>
                      )}
                    </td>
                    <td className="p-[16px_17px] border-b border-[#edf1eb] text-[11px] text-[#536b5c] align-middle">
                      {readOnly ? (
                        t.session_notes || "No observations recorded"
                      ) : (
                        <input
                          className="border border-[#dfe8de] rounded-[8px] bg-white p-[9px_10px] text-[#345744] text-[11px] min-w-[160px] max-w-[180px] outline-none"
                          value={notes[t.uuid] ?? t.session_notes ?? ""}
                          onChange={(e) =>
                            setNotes?.({
                              ...notes,
                              [t.uuid]: e.target.value,
                            })
                          }
                          placeholder="Add observation…"
                        />
                      )}
                    </td>
                    {!readOnly && (
                      <td className="p-[16px_17px] border-b border-[#edf1eb] text-[11px] text-[#536b5c] align-middle">
                        <button
                          className="border border-transparent rounded-[9px] p-[8px_12px] text-[10px] font-bold inline-flex items-center justify-center gap-[6px] bg-[#19563f] text-white hover:bg-[#124630] cursor-pointer"
                          onClick={() =>
                            onUpdate?.(
                              t,
                              draftStatuses[t.uuid] ??
                                t.session_status ??
                                "Scheduled"
                            )
                          }
                        >
                          Save
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <section className="bg-white border border-[#e6ece3] rounded-[17px] min-h-[290px] p-[38px_22px] flex flex-col items-center justify-center text-center shadow-[0_5px_17px_rgba(27,68,43,.055)] min-w-0">
          <div className="w-[68px] h-[68px] rounded-[22px] bg-[#edf5e9] text-[#528967] grid place-items-center mb-[18px]">
            <Clock3 size={30} strokeWidth={1.8} />
          </div>
          <h2 className="font-['Playfair_Display',serif] text-[20px] text-[#173f2f] m-[0_0_8px] font-bold">
            No sessions scheduled
          </h2>
          <p className="text-[12px] text-[#839087] max-w-[470px] leading-[1.6] m-0">
            Your approved therapy appointments and session updates will appear
            here.
          </p>
        </section>
      )}
    </div>
  );
}

export function Alerts({ alerts, patients, treatments, onCreate, onUpdate }) {
  return (
    <>
      <PageHeading
        eyebrow="PATIENT SAFETY"
        title="Emergency alerts"
        description="Record incidents and follow their status through resolution."
        action={
          <button
            className="border border-transparent rounded-[9px] p-[10px_14px] text-[12px] font-bold inline-flex items-center justify-center gap-[7px] transition-[transform,background] duration-150 bg-[#a63e39] text-white hover:bg-[#8f302c] cursor-pointer"
            onClick={onCreate}
          >
            <Plus size={14} strokeWidth={2.5} /> Record alert
          </button>
        }
      />
      <div className="grid grid-cols-3 max-[600px]:grid-cols-1 gap-[14px] mb-[18px]">
        <div className="bg-white border border-[#e7ece5] rounded-[13px] shadow-[0_3px_12px_#284c3008] p-[16px] flex items-center gap-[13px]">
          <span className="w-[38px] h-[38px] rounded-[11px] bg-[#fbeae7] text-[#b74a44] grid place-items-center shrink-0">
            <AlertTriangle size={18} strokeWidth={2} />
          </span>
          <div>
            <small className="text-[10px] text-[#879389] block">
              Open / acknowledged
            </small>
            <b className="text-[20px] font-['Manrope',sans-serif] font-bold">
              {alerts.filter((a) => a.status !== "Resolved").length}
            </b>
          </div>
        </div>
        <div className="bg-white border border-[#e7ece5] rounded-[13px] shadow-[0_3px_12px_#284c3008] p-[16px] flex items-center gap-[13px]">
          <span className="w-[38px] h-[38px] rounded-[11px] bg-[#fdf2df] text-[#b18536] grid place-items-center shrink-0">
            <Clock3 size={18} strokeWidth={2} />
          </span>
          <div>
            <small className="text-[10px] text-[#879389] block">
              Critical / high severity
            </small>
            <b className="text-[20px] font-['Manrope',sans-serif] font-bold">
              {
                alerts.filter(
                  (a) =>
                    ["High", "Critical"].includes(a.severity) &&
                    a.status !== "Resolved"
                ).length
              }
            </b>
          </div>
        </div>
        <div className="bg-white border border-[#e7ece5] rounded-[13px] shadow-[0_3px_12px_#284c3008] p-[16px] flex items-center gap-[13px]">
          <span className="w-[38px] h-[38px] rounded-[11px] bg-[#e6f3e7] text-[#2e7a48] grid place-items-center shrink-0">
            <Check size={18} strokeWidth={2.5} />
          </span>
          <div>
            <small className="text-[10px] text-[#879389] block">
              Resolved incidents
            </small>
            <b className="text-[20px] font-['Manrope',sans-serif] font-bold">
              {alerts.filter((a) => a.status === "Resolved").length}
            </b>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[14px]">
        {alerts.map((a) => (
          <div
            className="bg-white border border-[#e7ece5] rounded-[13px] shadow-[0_3px_12px_#284c3008] p-[18px] max-[600px]:p-[13px] flex items-start gap-[15px] max-[600px]:gap-[9px] max-[900px]:flex-wrap"
            key={a.id}
          >
            <div className="w-[34px] h-[34px] rounded-[10px] bg-[#fbeae7] text-[#b74a44] grid place-items-center shrink-0">
              <AlertTriangle size={16} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0 max-[600px]:w-[calc(100%-50px)]">
              <div className="flex items-center max-[600px]:items-start justify-between gap-[10px] mb-[7px]">
                <div>
                  <span
                    className={`text-[8px] font-extrabold uppercase tracking-[0.1em] p-[4px_7px] rounded-[20px] inline-block ${
                      ["high", "critical"].includes(String(a.severity).toLowerCase())
                        ? "bg-[#fbeae7] text-[#b74a44]"
                        : "bg-[#fbf1de] text-[#a97e2f]"
                    }`}
                  >
                    {a.severity} priority
                  </span>
                  <h3 className="text-[15px] max-[600px]:text-[14px] mt-[4px] mb-0 font-['Manrope',sans-serif] font-bold">
                    {a.patient_name || "Unlinked patient alert"}
                  </h3>
                </div>
                <Status value={a.status} />
              </div>
              <p className="text-[11px] text-[#556658] leading-[1.5] m-[0_0_10px]">
                {a.symptoms}
              </p>
              <div className="flex gap-[14px] text-[9px] text-[#8c988e]">
                <span>
                  Reported {fmtDate(a.created_at)} · {fmtTime(a.created_at)}
                </span>
                <span>By {a.reporter_name || "Care team"}</span>
              </div>
            </div>
            <div className="flex gap-[8px] shrink-0 max-[600px]:ml-[43px]">
              {a.status === "Open" && (
                <button
                  className="border border-[#dce5dc] bg-white text-[#345b46] hover:bg-[#f3f8f3] rounded-[9px] p-[10px_14px] text-[12px] font-bold cursor-pointer"
                  onClick={() => onUpdate(a, "Acknowledged")}
                >
                  Acknowledge
                </button>
              )}
              {a.status !== "Resolved" && (
                <button
                  className="border border-transparent rounded-[9px] p-[10px_14px] text-[12px] font-bold inline-flex items-center justify-center gap-[9px] transition-[transform,background] duration-150 bg-[#19563f] text-white shadow-[0_4px_10px_#19563f16] hover:bg-[#124630] hover:-translate-y-px cursor-pointer"
                  onClick={() => onUpdate(a, "Resolved")}
                >
                  Resolve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="bg-white border border-[#e7ece5] rounded-[13px] shadow-[0_3px_12px_#284c3008] p-[21px]">
          <Empty
            icon={<CheckCircle2 size={28} className="text-[#83a386]" strokeWidth={1.8} />}
            title="No emergency alerts"
            text="New incidents recorded by the care team will appear here."
          />
        </div>
      )}
    </>
  );
}

export function Reports({ patients, treatments, alerts }) {
  const exportCsv = () => {
    const rows = [
      ["Patient", "Treatment", "Therapist", "Appointment", "Duration minutes", "Priority", "Status"],
      ...treatments.map((t) => [
        t.patient_name || "",
        t.p1 || "",
        t.therapist_name || "",
        t.appointment_start || "",
        t.duration_minutes || "",
        t.priority || "",
        t.session_status || "Scheduled",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
      .join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    a.download = "ayurdhara-treatment-report.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <PageHeading
        eyebrow="CARE INSIGHTS"
        title="Reports"
        description="Export the current treatment schedule and review summary indicators."
        action={
          <button
            className="border border-transparent rounded-[9px] p-[10px_14px] text-[12px] font-bold inline-flex items-center justify-center gap-[7px] transition-[transform,background] duration-150 bg-[#19563f] text-white shadow-[0_4px_10px_#19563f16] hover:bg-[#124630] hover:-translate-y-px cursor-pointer"
            onClick={exportCsv}
          >
            <Download size={14} strokeWidth={2} /> Export CSV
          </button>
        }
      />
      <div className="grid grid-cols-4 max-[900px]:grid-cols-2 gap-[15px] mb-[21px] max-[600px]:gap-[8px]">
        <div className="bg-white border border-[#e8ede6] rounded-[13px] p-[18px_18px_16px] relative min-w-0 shadow-[0_3px_12px_#284c3010] max-[1200px]:p-[15px] max-[600px]:p-[12px]">
          <div className="w-[35px] h-[35px] rounded-[10px] grid place-items-center mb-[14px] max-[600px]:w-[30px] max-[600px]:h-[30px] max-[600px]:mb-[9px] bg-[#e3f1e5] text-[#2f7c4a]">
            <UsersIcon size={18} strokeWidth={2} />
          </div>
          <div className="text-[11px] text-[#758379] font-semibold max-[600px]:text-[10px]">
            Patients
          </div>
          <div className="font-['Manrope',sans-serif] font-extrabold text-[28px] tracking-[-0.04em] my-[5px_4px] max-[1200px]:text-[25px] max-[600px]:text-[23px] max-[380px]:text-[20px]">
            {patients.length}
          </div>
        </div>
        <div className="bg-white border border-[#e8ede6] rounded-[13px] p-[18px_18px_16px] relative min-w-0 shadow-[0_3px_12px_#284c3010] max-[1200px]:p-[15px] max-[600px]:p-[12px]">
          <div className="w-[35px] h-[35px] rounded-[10px] grid place-items-center mb-[14px] max-[600px]:w-[30px] max-[600px]:h-[30px] max-[600px]:mb-[9px] bg-[#e6edf9] text-[#587ab6]">
            <FileText size={18} strokeWidth={2} />
          </div>
          <div className="text-[11px] text-[#758379] font-semibold max-[600px]:text-[10px]">
            Treatment records
          </div>
          <div className="font-['Manrope',sans-serif] font-extrabold text-[28px] tracking-[-0.04em] my-[5px_4px] max-[1200px]:text-[25px] max-[600px]:text-[23px] max-[380px]:text-[20px]">
            {treatments.length}
          </div>
        </div>
        <div className="bg-white border border-[#e8ede6] rounded-[13px] p-[18px_18px_16px] relative min-w-0 shadow-[0_3px_12px_#284c3010] max-[1200px]:p-[15px] max-[600px]:p-[12px]">
          <div className="w-[35px] h-[35px] rounded-[10px] grid place-items-center mb-[14px] max-[600px]:w-[30px] max-[600px]:h-[30px] max-[600px]:mb-[9px] bg-[#fbf0dc] text-[#b88931]">
            <CheckCircle2 size={18} strokeWidth={2} />
          </div>
          <div className="text-[11px] text-[#758379] font-semibold max-[600px]:text-[10px]">
            Completed sessions
          </div>
          <div className="font-['Manrope',sans-serif] font-extrabold text-[28px] tracking-[-0.04em] my-[5px_4px] max-[1200px]:text-[25px] max-[600px]:text-[23px] max-[380px]:text-[20px]">
            {treatments.filter((t) => t.session_status === "Completed").length}
          </div>
        </div>
        <div className="bg-white border border-[#e8ede6] rounded-[13px] p-[18px_18px_16px] relative min-w-0 shadow-[0_3px_12px_#284c3010] max-[1200px]:p-[15px] max-[600px]:p-[12px]">
          <div className="w-[35px] h-[35px] rounded-[10px] grid place-items-center mb-[14px] max-[600px]:w-[30px] max-[600px]:h-[30px] max-[600px]:mb-[9px] bg-[#fae8e5] text-[#bd5a50]">
            <AlertTriangle size={18} strokeWidth={2} />
          </div>
          <div className="text-[11px] text-[#758379] font-semibold max-[600px]:text-[10px]">
            Emergency alerts
          </div>
          <div className="font-['Manrope',sans-serif] font-extrabold text-[28px] tracking-[-0.04em] my-[5px_4px] max-[1200px]:text-[25px] max-[600px]:text-[23px] max-[380px]:text-[20px]">
            {alerts.length}
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#e7ece5] rounded-[13px] shadow-[0_3px_12px_#284c3008] min-w-0 overflow-hidden">
        <div className="p-[21px] max-[600px]:p-[14px] border-b border-[#e9eee7] flex items-center justify-between gap-[15px] max-[600px]:items-start">
          <div>
            <h2 className="font-['Manrope',sans-serif] tracking-[-0.035em] text-[17px] mt-0 mb-[5px] font-bold">
              Treatment report preview
            </h2>
            <p className="text-[#77847c] text-[10px] m-0">
              Export includes only records currently returned by the backend.
            </p>
          </div>
          <button
            className="border-0 bg-transparent text-[#276a50] text-[12px] font-bold p-[4px] cursor-pointer hover:underline max-[600px]:text-[10px] inline-flex items-center gap-1"
            onClick={exportCsv}
          >
            Download CSV <ArrowRight size={13} strokeWidth={2} />
          </button>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="border-collapse w-full min-w-[700px] text-left">
            <thead>
              <tr>
                <th className="bg-[#f8faf7] text-[9px] uppercase tracking-[0.07em] text-[#879389] font-extrabold p-[13px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                  Patient
                </th>
                <th className="bg-[#f8faf7] text-[9px] uppercase tracking-[0.07em] text-[#879389] font-extrabold p-[13px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                  Treatment
                </th>
                <th className="bg-[#f8faf7] text-[9px] uppercase tracking-[0.07em] text-[#879389] font-extrabold p-[13px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                  Therapist
                </th>
                <th className="bg-[#f8faf7] text-[9px] uppercase tracking-[0.07em] text-[#879389] font-extrabold p-[13px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                  Appointment
                </th>
                <th className="bg-[#f8faf7] text-[9px] uppercase tracking-[0.07em] text-[#879389] font-extrabold p-[13px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {treatments.map((t) => (
                <tr key={t.uuid} className="hover:bg-[#fbfcfa]">
                  <td className="text-[11px] text-[#536157] p-[13px_17px] border-b border-[#eef1ed] align-middle">
                    {t.patient_name || "—"}
                  </td>
                  <td className="text-[11px] text-[#536157] p-[13px_17px] border-b border-[#eef1ed] align-middle">
                    {t.p1 || "Treatment"}
                  </td>
                  <td className="text-[11px] text-[#536157] p-[13px_17px] border-b border-[#eef1ed] align-middle">
                    {t.therapist_name || "—"}
                  </td>
                  <td className="text-[11px] text-[#536157] p-[13px_17px] border-b border-[#eef1ed] align-middle">
                    {fmtDate(t.appointment_start)} {fmtTime(t.appointment_start)}
                  </td>
                  <td className="text-[11px] text-[#536157] p-[13px_17px] border-b border-[#eef1ed] align-middle">
                    <Status value={t.session_status || "Scheduled"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function Notifications({ treatments, alerts, onNavigate }) {
  const alertItems = alerts.map((a) => ({
    id: `a${a.id}`,
    kind: "Emergency alert",
    title: `${a.severity || "Priority"} alert`,
    detail: a.symptoms || "An emergency alert was recorded for your care record.",
    date: a.created_at,
    action: "notifications",
  }));
  const treatmentItems = treatments
    .filter((t) => t.appointment_start)
    .map((t) => ({
      id: `t${t.uuid}`,
      kind: "Scheduled session",
      title: t.p1 || "Panchakarma session",
      detail: `${fmtDate(t.appointment_start)} at ${fmtTime(t.appointment_start)} · ${t.therapist_name || "Therapist not assigned"}`,
      date: t.appointment_start,
      action: "sessions",
    }));
  const items = [...alertItems, ...treatmentItems].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="flex flex-col gap-[16px] w-full">
      <PatientPageHero
        eyebrow="CARE TEAM UPDATES"
        title="Notifications"
        description="Stay updated with appointment reminders and care-team notifications related to your records."
      />
      <PatientPageStats
        items={[
          { label: "Total Updates", value: items.length, detail: "Available notifications", icon: <Bell size={22} strokeWidth={1.8} />, tone: "green" },
          { label: "Appointments", value: treatmentItems.length, detail: "Scheduled care updates", icon: <CalendarDays size={22} strokeWidth={1.8} />, tone: "blue" },
          { label: "Care Alerts", value: alertItems.length, detail: "Alerts in your record", icon: <AlertTriangle size={22} strokeWidth={1.8} />, tone: "gold" },
          { label: "Latest Update", value: items.length ? fmtDate(items[0].date) : "—", detail: "Most recent activity", icon: <Clock3 size={22} strokeWidth={1.8} />, tone: "purple" }
        ]}
      />
      <section className="bg-white border border-[#e6ece3] rounded-[17px] p-0 overflow-hidden shadow-[0_5px_17px_rgba(27,68,43,.055)] min-w-0">
        {items.length ? (
          items.map((item) => (
            <button
              className="w-full flex items-center gap-[15px] text-left p-[19px_22px] max-[620px]:p-[14px] bg-white border-0 border-b border-[#edf1eb] cursor-pointer hover:bg-[#fbfdfa] transition-colors"
              key={item.id}
              onClick={() => onNavigate(item.action)}
            >
              <span
                className={`w-[42px] h-[42px] rounded-[13px] grid place-items-center text-[18px] shrink-0 font-bold ${
                  item.kind === "Emergency alert"
                    ? "bg-[#fbeae7] text-[#be4d45]"
                    : "bg-[#eaf1fb] text-[#3d72b8]"
                }`}
              >
                {item.kind === "Emergency alert" ? <AlertTriangle size={18} strokeWidth={2} /> : <Clock3 size={18} strokeWidth={2} />}
              </span>
              <span className="flex-1 min-w-0 flex flex-col gap-[3px]">
                <b className="text-[12px] text-[#1c3829] font-bold">{item.title}</b>
                <span className="text-[11px] text-[#6b7b70]">{item.detail}</span>
                <small className="text-[9px] text-[#9aa69d]">
                  {fmtDate(item.date)} · {fmtTime(item.date)}
                </small>
              </span>
              <span className="text-[9px] font-bold text-[#7e8f83] bg-[#f3f6f1] p-[7px_9px] rounded-[20px] whitespace-nowrap max-[600px]:hidden">
                {item.kind}
              </span>
              <ArrowRight size={16} className="text-[#4b805d] shrink-0" strokeWidth={2} />
            </button>
          ))
        ) : (
          <div className="min-h-[290px] p-[38px_22px] flex flex-col items-center justify-center text-center">
            <div className="w-[68px] h-[68px] rounded-[22px] bg-[#edf5e9] text-[#528967] grid place-items-center mb-[18px]">
              <Bell size={30} strokeWidth={1.8} />
            </div>
            <h2 className="font-['Playfair_Display',serif] text-[20px] text-[#173f2f] m-[0_0_8px] font-bold">
              You're all caught up
            </h2>
            <p className="text-[12px] text-[#839087] max-w-[470px] leading-[1.6] m-0">
              Appointment and care updates will appear here when available.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export function VitalsSymptoms({ vitals = [], symptoms = [] }) {
  const hasRecords = (vitals?.length || 0) > 0 || (symptoms?.length || 0) > 0;

  return (
    <div className="flex flex-col gap-[16px] w-full">
      <PatientPageHero
        eyebrow="WELLNESS MONITORING"
        title="Vitals & Symptoms"
        description="Review health observations and wellness measurements recorded by your Ayurvedic care team."
      />
      <PatientPageStats
        items={[
          { label: "Vital Records", value: vitals.length, detail: "Measurements recorded", icon: <Heart size={22} strokeWidth={1.8} />, tone: "green" },
          { label: "Symptom Entries", value: symptoms.length, detail: "Observations recorded", icon: <Activity size={22} strokeWidth={1.8} />, tone: "blue" },
          { label: "Total Observations", value: vitals.length + symptoms.length, detail: "Available in your record", icon: <FileText size={22} strokeWidth={1.8} />, tone: "gold" },
          { label: "Record Status", value: hasRecords ? "Available" : "No records", detail: "Based on linked entries", icon: <CheckCircle2 size={22} strokeWidth={1.8} />, tone: "purple" }
        ]}
      />

      <div className="grid grid-cols-2 max-[900px]:grid-cols-1 gap-[16px] my-[16px]">
        <article className="bg-white border border-[#e6ece3] rounded-[17px] p-[22px] max-[620px]:p-[17px] shadow-[0_5px_17px_rgba(27,68,43,.055)]">
          <div className="w-[42px] h-[42px] rounded-[13px] bg-[#fbeae7] text-[#bd5148] grid place-items-center mb-[14px]">
            <Heart size={20} strokeWidth={2} />
          </div>
          <div>
            <span className="text-[10px] tracking-[0.15em] font-extrabold text-[#78917e] block mb-[6px]">
              YOUR WELLNESS RECORD
            </span>
            <h2 className="font-['Playfair_Display',Georgia,serif] text-[20px] text-[#103c2c] m-[0_0_8px] font-bold">
              Vitals and symptoms
            </h2>
            <p className="text-[12px] text-[#839087] leading-[1.6] m-0">
              Measurements and observations recorded during your Panchakarma care can be reviewed here.
            </p>
          </div>
        </article>
        <article className="bg-white border border-[#e6ece3] rounded-[17px] p-[22px] max-[620px]:p-[17px] shadow-[0_5px_17px_rgba(27,68,43,.055)]">
          <span className="text-[10px] tracking-[0.15em] font-extrabold text-[#78917e] block mb-[6px]">
            CARE REMINDER
          </span>
          <h2 className="font-['Playfair_Display',Georgia,serif] text-[20px] text-[#103c2c] m-[0_0_8px] font-bold">
            Keep your care team informed
          </h2>
          <p className="text-[12px] text-[#839087] leading-[1.6] m-0">
            Share any new or worsening symptoms directly with your practitioner. This page displays recorded observations; it does not provide a diagnosis.
          </p>
        </article>
      </div>

      {hasRecords ? (
        <div className="bg-white border border-[#e6ece3] rounded-[17px] shadow-[0_5px_17px_rgba(27,68,43,.055)] overflow-hidden">
          <div className="p-[20px_22px] border-b border-[#edf1eb]">
            <div className="flex items-center gap-[11px]">
              <div className="w-[39px] h-[39px] rounded-[12px] bg-[#fbeae7] text-[#bd5148] grid place-items-center shrink-0">
                <Heart size={19} strokeWidth={2} />
              </div>
              <div>
                <h2 className="font-['Playfair_Display',Georgia,serif] text-[20px] text-[#103c2c] m-[0_0_5px] font-bold">
                  Recorded observations
                </h2>
                <p className="text-[11px] text-[#869289] m-0">
                  Entries available in your care record.
                </p>
              </div>
            </div>
          </div>
          <div className="p-[30px] text-center text-[#87948a] text-[12px]">
            Vitals and symptom records are available, but the current application does not yet provide a display format for these entries.
          </div>
        </div>
      ) : (
        <section className="bg-white border border-[#e6ece3] rounded-[17px] min-h-[290px] p-[38px_22px] flex flex-col items-center justify-center text-center shadow-[0_5px_17px_rgba(27,68,43,.055)]">
          <div className="w-[68px] h-[68px] rounded-[22px] bg-[#edf5e9] text-[#528967] grid place-items-center mb-[18px]">
            <Heart size={30} strokeWidth={1.8} />
          </div>
          <h2 className="font-['Playfair_Display',serif] text-[20px] text-[#173f2f] m-[0_0_8px] font-bold">
            No vitals or symptoms recorded yet
          </h2>
          <p className="text-[12px] text-[#839087] max-w-[470px] leading-[1.6] m-0">
            When your practitioner or therapist records observations, they will appear here. No health measurements are currently available in your account.
          </p>
        </section>
      )}
    </div>
  );
}

export function HelpFAQs() {
  const faqs = [
    { q: "Where can I view my prescribed treatment plan?", a: "Open Treatment Plans from the My Care section. Your prescribed procedures, appointment details, duration and assigned therapist appear when those records are available." },
    { q: "Where can I check my upcoming therapy sessions?", a: "Open Sessions to review scheduled appointments, their timing, therapist details and any observations recorded by the care team." },
    { q: "How is my treatment progress calculated?", a: "Progress is calculated from treatment and session status records available in your account. It reflects the records entered by your care team." },
    { q: "Where can I see my vitals and symptoms?", a: "Open Vitals & Symptoms. This page will show observations when they have been recorded and made available in your patient record." },
    { q: "What should I do if I experience a concerning reaction?", a: "Contact your practitioner or the clinic staff immediately. Do not rely on this portal for emergency assistance." },
    { q: "Why is my page showing no records?", a: "Some sections remain empty until the clinic records and links the relevant treatment, appointment or observation details to your patient account. Contact your care team if you think information is missing." }
  ];

  return (
    <div className="flex flex-col gap-[16px] w-full">
      <PatientPageHero
        eyebrow="PATIENT SUPPORT"
        title="Help & FAQs"
        description="Find answers and helpful guidance for using your AyurDhara patient workspace."
      />
      <PatientPageStats
        items={[
          { label: "Common Questions", value: faqs.length, detail: "Answers in this section", icon: <HelpCircle size={22} strokeWidth={1.8} />, tone: "green" },
          { label: "Treatment Plans", value: "Guide", detail: "Understand prescribed care", icon: <FileText size={22} strokeWidth={1.8} />, tone: "blue" },
          { label: "Sessions", value: "Guide", detail: "Appointments and updates", icon: <CalendarDays size={22} strokeWidth={1.8} />, tone: "gold" },
          { label: "Patient Support", value: "Care team", detail: "Clinic assistance", icon: <Heart size={22} strokeWidth={1.8} />, tone: "purple" }
        ]}
      />
      <section className="bg-white border border-[#e6ece3] rounded-[17px] p-[24px] max-[620px]:p-[18px] shadow-[0_5px_17px_rgba(27,68,43,.055)] flex items-center gap-[18px] max-[620px]:items-start my-[16px]">
        <div className="w-[48px] h-[48px] rounded-[14px] bg-[#edf4e8] text-[#2c7447] grid place-items-center shrink-0">
          <HelpCircle size={24} strokeWidth={2} />
        </div>
        <div>
          <span className="text-[10px] tracking-[0.15em] font-extrabold text-[#78917e] block mb-[4px]">
            HERE TO HELP
          </span>
          <h2 className="font-['Playfair_Display',Georgia,serif] text-[20px] text-[#103c2c] m-[0_0_5px] font-bold">
            How can we help you?
          </h2>
          <p className="text-[12px] text-[#839087] m-0">
            Browse answers to common questions about your treatment plans, sessions and care records.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-[14px] my-[16px]">
        <div>
          <span className="text-[10px] tracking-[0.15em] font-extrabold text-[#78917e] block mb-[4px]">
            COMMON QUESTIONS
          </span>
          <h2 className="font-['Playfair_Display',Georgia,serif] text-[20px] text-[#103c2c] m-0 font-bold">
            Frequently asked questions
          </h2>
        </div>
        <div className="flex flex-col gap-[10px]">
          {faqs.map((item, index) => (
            <details
              className="group bg-white border border-[#e6ece3] open:border-[#cbdcc9] rounded-[14px] overflow-hidden shadow-[0_3px_10px_rgba(27,68,43,.04)]"
              key={item.q}
              open={index === 0}
            >
              <summary className="p-[18px_20px] max-[620px]:p-[15px] text-[13px] max-[620px]:text-[11px] font-bold text-[#173d2c] flex items-center justify-between cursor-pointer list-none select-none">
                <span>{item.q}</span>
                <span className="text-[#487a55] flex items-center transition-transform duration-150 group-open:rotate-45" aria-hidden="true">
                  <Plus size={16} strokeWidth={2.5} />
                </span>
              </summary>
              <p className="p-[0_20px_20px] max-[620px]:p-[0_15px_16px] m-0 text-[12px] text-[#637267] leading-[1.6]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-white border border-[#e6ece3] border-l-[4px] border-l-[#79a66e] rounded-[17px] p-[21px_23px] max-[620px]:p-[17px] shadow-[0_5px_17px_rgba(27,68,43,.055)] my-[16px]">
        <div>
          <span className="text-[10px] tracking-[0.15em] font-extrabold text-[#78917e] block mb-[4px]">
            NEED MORE HELP?
          </span>
          <h2 className="font-['Playfair_Display',Georgia,serif] text-[19px] text-[#103c2c] m-[0_0_5px] font-bold">
            Contact your care team
          </h2>
          <p className="text-[12px] text-[#839087] m-0">
            For appointment changes, missing records or questions about your treatment, please contact your Ayurvedic practitioner or clinic staff.
          </p>
        </div>
      </section>
    </div>
  );
}

export function Users({ users, onAdd, onDelete }) {
  return (
    <>
      <PageHeading
        eyebrow="ADMINISTRATION"
        title="User management"
        description="View user accounts and manage access to the care workspace."
        action={
          <button
            className="border border-transparent rounded-[9px] p-[10px_14px] text-[12px] font-bold inline-flex items-center justify-center gap-[7px] transition-[transform,background] duration-150 bg-[#19563f] text-white shadow-[0_4px_10px_#19563f16] hover:bg-[#124630] hover:-translate-y-px cursor-pointer"
            onClick={onAdd}
          >
            <Plus size={14} strokeWidth={2.5} /> Add user
          </button>
        }
      />
      <div className="flex items-center gap-[14px] mb-[16px] max-[600px]:items-start max-[600px]:flex-col max-[600px]:w-full">
        <span className="text-[10px] text-[#89958b] font-semibold">
          {users.length} user accounts
        </span>
        <span className="text-[13px] text-[#77847c]">
          Account deletion may be blocked by linked clinical records.
        </span>
      </div>
      <div className="bg-white border border-[#e7ece5] rounded-[13px] shadow-[0_3px_12px_#284c3008] min-w-0 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="border-collapse w-full min-w-[700px] text-left">
            <thead>
              <tr>
                <th className="bg-[#f8faf7] text-[9px] uppercase tracking-[0.07em] text-[#879389] font-extrabold p-[13px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                  Name
                </th>
                <th className="bg-[#f8faf7] text-[9px] uppercase tracking-[0.07em] text-[#879389] font-extrabold p-[13px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                  Role
                </th>
                <th className="bg-[#f8faf7] text-[9px] uppercase tracking-[0.07em] text-[#879389] font-extrabold p-[13px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                  Email
                </th>
                <th className="bg-[#f8faf7] text-[9px] uppercase tracking-[0.07em] text-[#879389] font-extrabold p-[13px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                  Phone
                </th>
                <th className="bg-[#f8faf7] text-[9px] uppercase tracking-[0.07em] text-[#879389] font-extrabold p-[13px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                  Created
                </th>
                <th className="bg-[#f8faf7] text-[9px] uppercase tracking-[0.07em] text-[#879389] font-extrabold p-[13px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id} className="hover:bg-[#fbfcfa]">
                  <td className="text-[11px] text-[#536157] p-[13px_17px] border-b border-[#eef1ed] align-middle">
                    <div className="flex items-center gap-[10px] whitespace-nowrap">
                      <div className="w-[31px] h-[31px] rounded-full grid place-items-center bg-[#e7efe5] text-[#497554] text-[12px] font-extrabold shrink-0">
                        {(u.name || "U").slice(0, 1)}
                      </div>
                      <b className="font-bold">{u.name}</b>
                    </div>
                  </td>
                  <td className="text-[11px] text-[#536157] p-[13px_17px] border-b border-[#eef1ed] align-middle">
                    <span className="text-[9px] uppercase font-extrabold tracking-[0.08em] p-[5px_8px] bg-[#eef4ec] rounded-[6px] text-[#436d4f]">
                      {u.role}
                    </span>
                  </td>
                  <td className="text-[11px] text-[#536157] p-[13px_17px] border-b border-[#eef1ed] align-middle">
                    {u.email}
                  </td>
                  <td className="text-[11px] text-[#536157] p-[13px_17px] border-b border-[#eef1ed] align-middle">
                    {u.phone_number || "—"}
                  </td>
                  <td className="text-[11px] text-[#536157] p-[13px_17px] border-b border-[#eef1ed] align-middle">
                    {fmtDate(u.created_at)}
                  </td>
                  <td className="text-[11px] text-[#536157] p-[13px_17px] border-b border-[#eef1ed] align-middle">
                    <button
                      className="border-0 bg-transparent text-[#ab443e] text-[10px] font-bold p-0 cursor-pointer hover:underline"
                      onClick={() => onDelete(u.user_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
