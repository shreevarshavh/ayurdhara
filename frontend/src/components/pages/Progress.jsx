
import React from "react";

export function Progress({ patients = [], treatments = [], completed }) {
  const rows = treatments || [];

  // Calculate completed records directly from treatment statuses.
  const completedRows = rows.filter(
    (t) => (t.session_status || "Scheduled").toLowerCase() === "completed"
  );

  const completedCount = completedRows.length;
  const pct = rows.length
    ? Math.round((completedCount / rows.length) * 100)
    : 0;

  const statusNames = [
    "Scheduled",
    "Ongoing",
    "Completed",
    "Missed",
    "Interrupted",
  ];

  const statusCounts = statusNames.map((status) => ({
    status,
    count: rows.filter(
      (t) =>
        (t.session_status || "Scheduled").toLowerCase() ===
        status.toLowerCase()
    ).length,
  }));

  const patientRows = patients || [];

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
    <div className="flex flex-col gap-[16px] w-full">
      {/* Page heading */}
      <section className="relative flex items-center justify-between gap-[22px] min-h-[184px] max-[1100px]:min-h-[165px] max-[620px]:min-h-[155px] p-[28px_42px] max-[1100px]:p-[23px_22px] max-[620px]:p-[18px] overflow-hidden isolate rounded-[18px] bg-[#075238] bg-[linear-gradient(90deg,rgba(2,65,43,.98)_0%,rgba(2,76,49,.91)_40%,rgba(2,76,49,.26)_72%,rgba(2,76,49,.08)_100%),url('/ayurdhara-panchakarma-hero.png')] bg-cover bg-[center_56%] max-[1100px]:bg-[64%_center] shadow-[0_7px_20px_rgba(18,64,42,.08)]">
        <div className="relative z-[1] max-w-[72%] max-[1100px]:max-w-full">
          <span className="block mb-[13px] text-[#dce9bb] text-[10px] max-[620px]:text-[8px] font-extrabold tracking-[0.2em] uppercase">
            OUTCOME MONITORING
          </span>
          <h1 className="m-[0_0_8px] text-white font-['Playfair_Display',Georgia,serif] text-[clamp(29px,2.5vw,40px)] max-[1100px]:text-[29px] max-[620px]:text-[25px] font-bold leading-[1.12] tracking-[-0.025em] max-[1100px]:max-w-[75%] max-[620px]:max-w-[85%]">
            Progress Tracking
          </h1>
          <p className="m-0 text-[#f0f6ed] text-[14px] max-[1100px]:text-[12px] max-[620px]:text-[10px] leading-[1.55] max-[1100px]:max-w-[78%] max-[620px]:max-w-[90%]">
            Follow your Panchakarma treatment progress and review completed
            care activities.
          </p>
        </div>

        <div className="relative z-[2] shrink-0 self-end max-[1100px]:absolute max-[1100px]:right-[15px] max-[1100px]:bottom-[13px]">
          <button
            className="min-h-[42px] px-[17px] border border-white/55 rounded-full bg-white/[0.94] text-[#075238] font-bold shadow-[0_4px_14px_rgba(0,0,0,.08)] cursor-pointer max-[620px]:w-full"
            onClick={() => window.print()}
          >
            ↓ Print summary
          </button>
        </div>
      </section>

      {/* Summary cards */}
      <section className="grid grid-cols-5 max-[1100px]:grid-cols-3 max-[768px]:grid-cols-2 max-[420px]:grid-cols-1 gap-[13px] max-[1100px]:gap-[10px] mb-[2px]">
        {[
          {
            label: "Treatment Records",
            value: rows.length,
            detail: "Plans in your care record",
            icon: "▤",
            tone: "green",
          },
          {
            label: "Completed",
            value: completedCount,
            detail: "Recorded as complete",
            icon: "✓",
            tone: "blue",
          },
          {
            label: "In Progress",
            value: statusCounts.find((x) => x.status === "Ongoing")?.count || 0,
            detail: "Currently underway",
            icon: "◷",
            tone: "gold",
          },
          {
            label: "Scheduled",
            value:
              statusCounts.find((x) => x.status === "Scheduled")?.count || 0,
            detail: "Awaiting session",
            icon: "▦",
            tone: "purple",
          },
          {
            label: "Overall Progress",
            value: `${pct}%`,
            detail: "Based on available records",
            icon: "↗",
            tone: "sky",
          },
        ].map((item) => {
          const toneStyle = statTones[item.tone] || statTones.green;
          return (
            <article
              className={`flex items-center gap-[14px] max-[1100px]:gap-[10px] max-[620px]:gap-[8px] min-w-0 min-h-[91px] max-[1100px]:min-h-[84px] max-[768px]:min-h-[78px] p-[14px_16px] max-[1100px]:p-[12px] max-[768px]:p-[10px] border border-[#e7ece4] rounded-[16px] shadow-[0_4px_15px_rgba(30,66,43,.055)] ${toneStyle.bg}`}
              key={item.label}
            >
              <span
                className={`grid place-items-center shrink-0 w-[58px] h-[58px] max-[620px]:w-[42px] max-[620px]:h-[42px] rounded-[17px] max-[620px]:rounded-[12px] text-[26px] max-[620px]:text-[20px] font-bold ${toneStyle.icon}`}
              >
                {item.icon}
              </span>

              <span className="flex flex-col min-w-0">
                <b className="text-[#103c2c] font-['Playfair_Display',Georgia,serif] text-[31px] max-[620px]:text-[24px] leading-[1.02] font-bold">
                  {item.value}
                </b>
                <strong className="mt-[3px] text-[#17372b] text-[12px] max-[620px]:text-[11px] font-bold">
                  {item.label}
                </strong>
                <small className="mt-[3px] text-[#7d8c81] text-[10px] max-[620px]:text-[9px] leading-[1.35] whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.detail}
                </small>
              </span>
            </article>
          );
        })}
      </section>

      {/* Progress overview and status breakdown */}
      <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(300px,0.95fr)] max-[900px]:grid-cols-1 gap-[18px] mb-[18px]">
        <section className="bg-white border border-[#e6ece3] rounded-[17px] shadow-[0_5px_17px_rgba(27,68,43,.055)] p-[22px] max-[620px]:p-[16px]">
          <div className="text-[10px] tracking-[0.15em] font-extrabold text-[#78917e]">
            SESSION COMPLETION
          </div>

          <div className="flex items-center max-[900px]:justify-start gap-[30px] max-[620px]:gap-[16px] max-[620px]:flex-wrap mt-[18px]">
            <div
              className="w-[164px] h-[164px] max-[620px]:w-[135px] max-[620px]:h-[135px] rounded-full grid place-items-center shrink-0"
              style={{
                background: `conic-gradient(#21804b ${pct}%, #e9eee7 0)`,
              }}
            >
              <div className="w-[132px] h-[132px] max-[620px]:w-[108px] max-[620px]:h-[108px] rounded-full bg-white flex flex-col items-center justify-center">
                <b className="font-['Playfair_Display',serif] text-[34px] max-[620px]:text-[26px] text-[#144832] font-extrabold leading-none">
                  {pct}%
                </b>
                <span className="text-[10px] text-[#839087] mt-[2px]">
                  Completed
                </span>
              </div>
            </div>

            <div className="grid gap-[18px] max-[620px]:gap-[12px] max-[620px]:grid-cols-2 max-[620px]:flex-1">
              <div className="grid gap-[4px]">
                <span className="text-[11px] text-[#849187]">
                  Treatment records
                </span>
                <b className="text-[22px] text-[#174a34] font-['Playfair_Display',serif] font-bold">
                  {rows.length}
                </b>
              </div>

              <div className="grid gap-[4px]">
                <span className="text-[11px] text-[#849187]">
                  Completed sessions
                </span>
                <b className="text-[22px] text-[#174a34] font-['Playfair_Display',serif] font-bold">
                  {completedCount}
                </b>
              </div>

              <div className="grid gap-[4px]">
                <span className="text-[11px] text-[#849187]">
                  Remaining records
                </span>
                <b className="text-[22px] text-[#174a34] font-['Playfair_Display',serif] font-bold">
                  {Math.max(0, rows.length - completedCount)}
                </b>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border border-[#e6ece3] rounded-[17px] shadow-[0_5px_17px_rgba(27,68,43,.055)] p-[22px] max-[620px]:p-[16px]">
          <h2 className="font-['Playfair_Display',serif] text-[20px] text-[#173f2f] m-[0_0_5px] font-bold">
            Session status
          </h2>
          <p className="text-[11px] text-[#89968d] m-[0_0_18px]">
            Current status of your treatment records
          </p>

          {statusCounts.map((item) => (
            <div className="my-[13px]" key={item.status}>
              <div className="flex justify-between text-[10px] text-[#718176] mb-[7px]">
                <span>{item.status}</span>
                <b className="text-[#345542]">{item.count}</b>
              </div>

              <div className="h-[7px] bg-[#edf1eb] rounded-[20px] overflow-hidden">
                <i
                  className="block h-full bg-[linear-gradient(90deg,#3e8b5c,#9dc58a)] rounded-[20px] not-italic"
                  style={{
                    width: `${
                      rows.length ? (item.count / rows.length) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* Patient-wise progress */}
      <section className="bg-white border border-[#e6ece3] rounded-[17px] shadow-[0_5px_17px_rgba(27,68,43,.055)] p-0 overflow-hidden">
        <div className="p-[20px_22px] border-b border-[#edf1eb]">
          <div className="flex items-center gap-[11px] min-w-0">
            <div className="w-[39px] h-[39px] rounded-[12px] bg-[#edf5e9] text-[#4d7f5c] grid place-items-center text-[19px] shrink-0">
              <span>↗</span>
            </div>

            <div>
              <h2 className="font-['Playfair_Display',Georgia,serif] text-[20px] text-[#103c2c] m-[0_0_5px] font-bold">
                Patient treatment progress
              </h2>
              <p className="m-0 text-[11px] text-[#869289]">
                Summary calculated from session statuses recorded by your care
                team.
              </p>
            </div>
          </div>
        </div>

        {patientRows.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse min-w-[760px] text-left">
              <thead className="bg-[#f4f8f1]">
                <tr>
                  <th className="text-[10px] tracking-[0.09em] uppercase text-[#617769] font-extrabold p-[16px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                    Patient
                  </th>
                  <th className="text-[10px] tracking-[0.09em] uppercase text-[#617769] font-extrabold p-[16px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                    Treatment records
                  </th>
                  <th className="text-[10px] tracking-[0.09em] uppercase text-[#617769] font-extrabold p-[16px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                    Completed
                  </th>
                  <th className="text-[10px] tracking-[0.09em] uppercase text-[#617769] font-extrabold p-[16px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                    Scheduled / ongoing
                  </th>
                  <th className="text-[10px] tracking-[0.09em] uppercase text-[#617769] font-extrabold p-[16px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                    Progress
                  </th>
                </tr>
              </thead>

              <tbody>
                {patientRows.map((patient) => {
                  const own = rows.filter(
                    (t) => String(t.patient_id) === String(patient.patient_id)
                  );

                  const done = own.filter(
                    (t) =>
                      (t.session_status || "").toLowerCase() === "completed"
                  ).length;

                  const value = own.length
                    ? Math.round((done / own.length) * 100)
                    : 0;

                  const remaining = own.filter(
                    (t) =>
                      !["completed", "missed", "interrupted"].includes(
                        (t.session_status || "scheduled").toLowerCase()
                      )
                  ).length;

                  return (
                    <tr key={patient.patient_id} className="hover:bg-[#f8fbf6]">
                      <td className="p-[16px_17px] border-b border-[#edf1eb] text-[11px] text-[#536b5c] align-middle">
                        <div className="flex items-center gap-[9px] text-[#254b38]">
                          <span className="w-[30px] h-[30px] rounded-full bg-[#e7f1e4] grid place-items-center text-[#2d744c] font-extrabold shrink-0">
                            {(patient.name || "P")
                              .slice(0, 1)
                              .toUpperCase()}
                          </span>
                          <b className="font-bold">
                            {patient.name || "Patient"}
                          </b>
                        </div>
                      </td>

                      <td className="p-[16px_17px] border-b border-[#edf1eb] text-[11px] text-[#536b5c] align-middle">
                        {own.length}
                      </td>
                      <td className="p-[16px_17px] border-b border-[#edf1eb] text-[11px] text-[#536b5c] align-middle">
                        {done}
                      </td>
                      <td className="p-[16px_17px] border-b border-[#edf1eb] text-[11px] text-[#536b5c] align-middle">
                        {remaining}
                      </td>

                      <td className="p-[16px_17px] border-b border-[#edf1eb] text-[11px] text-[#536b5c] align-middle">
                        <div className="w-[90px] h-[7px] bg-[#edf1eb] rounded-[10px] overflow-hidden inline-block align-middle mr-[8px]">
                          <i
                            className="block h-full bg-[#4c9563] rounded-[10px] not-italic"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <b className="text-[10px] text-[#315e41] font-bold">
                          {value}%
                        </b>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-[30px] text-center text-[#87948a] text-[12px]">
            Your progress summary will appear when your care records are
            available.
          </div>
        )}
      </section>

      <p className="text-[10px] text-[#89968d] m-[13px_2px]">
        Progress is based only on treatment and session status records
        currently available in your account.
      </p>
    </div>
  );
}

export default Progress;
