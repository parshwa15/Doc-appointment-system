import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ role: "patient", adminId: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const roleToAction = {
        softwareAdmin: authApi.softwareAdminLogin,
        hospitalAdmin: authApi.hospitalAdminLogin,
        doctor: authApi.doctorLogin,
        patient: authApi.patientLogin,
      };

      const payload =
        form.role === "hospitalAdmin"
          ? {
              adminId: form.adminId,
              email: form.email,
              password: form.password,
            }
          : {
              email: form.email,
              password: form.password,
            };

      const { data } = await roleToAction[form.role](payload);

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", form.role);
      if (form.role === "hospitalAdmin") {
        localStorage.setItem("hospitalName", data.hospitalName || "");
      } else {
        localStorage.removeItem("hospitalName");
      }

      const routeMap = {
        softwareAdmin: "/software-admin/dashboard",
        hospitalAdmin: "/hospital-admin/dashboard",
        doctor: "/doctor/dashboard",
        patient: "/patient/dashboard",
      };

      navigate(routeMap[form.role]);
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <div className="card">
        <h2 className="text-2xl font-bold text-slate-900">Role Login</h2>
        <p className="mt-1 text-sm text-slate-600">Use seeded accounts or your registered credentials.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
          >
            <option value="softwareAdmin">Software Admin</option>
            <option value="hospitalAdmin">Hospital Admin</option>
            <option value="doctor">Doctor</option>
            <option value="patient">Patient</option>
          </select>

          {form.role === "hospitalAdmin" ? (
            <input
              required
              placeholder="Hospital Admin ID (e.g. HA001)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.adminId}
              onChange={(event) => setForm({ ...form, adminId: event.target.value })}
            />
          ) : null}

          <input
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />

          <input
            type="password"
            required
            placeholder="Password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />

          <button className="w-full rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white" type="submit">
            Login
          </button>
        </form>

        {message ? <p className="mt-3 text-sm text-rose-600">{message}</p> : null}
      </div>
    </main>
  );
};

export default LoginPage;
