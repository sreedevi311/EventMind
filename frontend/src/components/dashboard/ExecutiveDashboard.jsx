import {
  Activity,
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  DollarSign,
  ShieldAlert,
  Ticket,
  Users,
} from "lucide-react";

const KPI = ({ title, value, icon: Icon, subtitle, accent }) => {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </h3>
          {subtitle && (
            <p className="mt-2 text-xs text-gray-400">{subtitle}</p>
          )}
        </div>

        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
          style={{
            background: accent,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

const ExecutiveDashboard = ({ data }) => {
  if (!data) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-gray-200 bg-white shadow-sm">
        <p className="text-gray-500">Loading executive dashboard...</p>
      </div>
    );
  }

  const { kpis, risks } = data;

  const healthGradient =
    kpis.eventHealth === "Critical"
      ? "linear-gradient(135deg,#FEE2E2,#FCA5A5)"
      : kpis.eventHealth === "Needs Attention"
      ? "linear-gradient(135deg,#FEF3C7,#FCD34D)"
      : "linear-gradient(135deg,#DCFCE7,#86EFAC)";

  const healthText =
    kpis.eventHealth === "Critical"
      ? "text-red-700"
      : kpis.eventHealth === "Needs Attention"
      ? "text-amber-700"
      : "text-green-700";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="mb-2 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Executive overview
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Executive Dashboard
          </h1>
        </div>
      </div>

      <div
        className="rounded-3xl border border-gray-100 p-6 shadow-sm"
        style={{
          background: healthGradient,
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Event Health</p>
            <h2 className={`mt-3 text-3xl font-bold ${healthText}`}>
              {kpis.eventHealth}
            </h2>
            <p className="mt-2 text-sm font-medium text-gray-700">
              {kpis.eventStatus}
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 text-gray-800 shadow-sm backdrop-blur-sm">
            <Activity className="h-7 w-7" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPI
          title="Registrations"
          value={kpis.registrations}
          icon={Ticket}
          accent="linear-gradient(135deg,#2563EB,#60A5FA)"
        />

        <KPI
          title="Check-ins"
          value={kpis.checkIns}
          icon={CalendarCheck}
          accent="linear-gradient(135deg,#7C3AED,#A78BFA)"
        />

        <KPI
          title="Attendance Rate"
          value={`${kpis.attendanceRate}%`}
          icon={Users}
          accent="linear-gradient(135deg,#16A34A,#4ADE80)"
        />

        <KPI
          title="Sponsors"
          value={kpis.sponsors}
          icon={DollarSign}
          accent="linear-gradient(135deg,#F59E0B,#FCD34D)"
        />

        <KPI
          title="Open Incidents"
          value={kpis.openIncidents}
          icon={AlertTriangle}
          accent="linear-gradient(135deg,#F97316,#FDBA74)"
        />

        <KPI
          title="Critical Incidents"
          value={kpis.criticalIncidents}
          icon={ShieldAlert}
          accent="linear-gradient(135deg,#DC2626,#F87171)"
        />

        <KPI
          title="Confirmed Registrations"
          value={kpis.confirmedRegistrations}
          icon={CheckCircle2}
          accent="linear-gradient(135deg,#059669,#34D399)"
        />

        <KPI
          title="Sponsor ROI"
          value={kpis.sponsorROI ? `${kpis.sponsorROI}%` : "N/A"}
          icon={DollarSign}
          accent="linear-gradient(135deg,#0EA5E9,#38BDF8)"
          subtitle={
            kpis.sponsorROI
              ? "Based on available revenue data"
              : "Revenue data unavailable"
          }
        />
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Key Risks & Alerts</h2>
        </div>

        {risks?.length > 0 ? (
          <div className="space-y-3">
            {risks.map((risk, index) => (
              <div
                key={index}
                className="rounded-2xl border border-l-4 border-amber-300 bg-amber-50/70 p-4 text-sm text-gray-700"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </div>
                  <span>{risk.message}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            No major operational risks detected.
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutiveDashboard;