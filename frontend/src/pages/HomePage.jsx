import { Link } from "react-router-dom";

const roles = [
  { label: "Software Admin", route: "/software-admin/dashboard" },
  { label: "Hospital Admin", route: "/hospital-admin/dashboard" },
  { label: "Doctor", route: "/doctor/dashboard" },
  { label: "Patient", route: "/patient/dashboard" },
];

const HomePage = () => (
  <main className="mx-auto max-w-6xl px-4 py-12">
    <section className="rounded-3xl bg-gradient-to-r from-brand-700 to-slate-900 p-8 text-white shadow-xl">
      <p className="text-sm uppercase tracking-[0.25em] text-brand-100">MERN Stack Project</p>
      <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">Doctor Appointment System</h1>
      <p className="mt-4 max-w-2xl text-slate-100">
        Manage hospitals, doctors, patients, and appointments with secure role-based dashboards.
      </p>
      <div className="mt-6 flex gap-3">
        <Link className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-slate-900" to="/login">
          Login by Role
        </Link>
        <Link className="rounded-lg border border-white/70 px-5 py-2 text-sm font-semibold" to="/patient/register">
          Patient Register
        </Link>
      </div>
    </section>

    <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {roles.map((role) => (
        <Link key={role.label} to={role.route} className="card transition hover:-translate-y-1 hover:shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900">{role.label}</h3>
          <p className="mt-2 text-sm text-slate-600">Dedicated dashboard and API workflows.</p>
        </Link>
      ))}
    </section>
  </main>
);

export default HomePage;
