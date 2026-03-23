const StatCard = ({ title, value, subtitle }) => (
  <div className="card">
    <p className="text-sm font-medium uppercase tracking-wide text-slate-500">{title}</p>
    <h3 className="mt-2 text-3xl font-bold text-slate-900">{value}</h3>
    <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
  </div>
);

export default StatCard;
