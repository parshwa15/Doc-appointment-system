import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api";

const PatientRegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    contactNo: "",
    gender: "Male",
    age: 25,
    bloodGroup: "O+",
  });
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();

    try {
      await authApi.patientRegister(form);
      setMessage("Registration successful. Please login.");
      setTimeout(() => navigate("/login"), 900);
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="card">
        <h2 className="text-2xl font-bold text-slate-900">Patient Registration</h2>
        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <input className="rounded-lg border px-3 py-2" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="rounded-lg border px-3 py-2" placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="rounded-lg border px-3 py-2" placeholder="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input className="rounded-lg border px-3 py-2" placeholder="Contact No" required value={form.contactNo} onChange={(e) => setForm({ ...form, contactNo: e.target.value })} />
          <select className="rounded-lg border px-3 py-2" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <input className="rounded-lg border px-3 py-2" placeholder="Age" type="number" required value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} />
          <input className="rounded-lg border px-3 py-2 sm:col-span-2" placeholder="Blood Group" required value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} />
          <button className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white sm:col-span-2" type="submit">Register</button>
        </form>
        {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
      </div>
    </main>
  );
};

export default PatientRegisterPage;
