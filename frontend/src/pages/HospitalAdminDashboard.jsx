import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import { hospitalAdminApi } from "../services/api";

const HospitalAdminDashboard = () => {
  const hospitalName = localStorage.getItem("hospitalName") || "Unknown Hospital";
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    contactNo: "",
  });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");

  const initialDoctorForm = {
    name: "",
    email: "",
    password: "",
    profession: "",
    experience: 0,
    contactNo: "",
    age: 30,
  };

  const initialPatientForm = {
    name: "",
    email: "",
    password: "",
    contactNo: "",
    gender: "Male",
    age: 25,
    bloodGroup: "O+",
    assignedDoctorId: "",
  };

  const [doctorForm, setDoctorForm] = useState(initialDoctorForm);
  const [patientForm, setPatientForm] = useState(initialPatientForm);
  const [editingDoctorId, setEditingDoctorId] = useState("");
  const [editingPatientId, setEditingPatientId] = useState("");

  const load = async () => {
    const [profileRes, doctorRes, patientRes, appointmentRes] = await Promise.all([
      hospitalAdminApi.getProfile(),
      hospitalAdminApi.getDoctors(),
      hospitalAdminApi.getPatients(),
      hospitalAdminApi.getAppointments(),
    ]);

    setProfileForm({
      name: profileRes.data.name || "",
      email: profileRes.data.email || "",
      contactNo: profileRes.data.contactNo || "",
    });
    setDoctors(doctorRes.data);
    setPatients(patientRes.data);
    setAppointments(appointmentRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (id, status) => {
    await hospitalAdminApi.updateAppointmentStatus(id, { status });
    load();
  };

  const updateProfile = async (event) => {
    event.preventDefault();

    const payload = {
      name: profileForm.name,
      email: profileForm.email,
      contactNo: profileForm.contactNo,
    };

    await hospitalAdminApi.updateProfile(payload);
    setMessage("Hospital admin profile updated successfully");
    load();
  };

  const submitDoctor = async (event) => {
    event.preventDefault();

    if (editingDoctorId) {
      const payload = { ...doctorForm };
      if (!payload.password) {
        delete payload.password;
      }
      await hospitalAdminApi.updateDoctor(editingDoctorId, payload);
      setMessage("Doctor updated successfully");
    } else {
      await hospitalAdminApi.createDoctor(doctorForm);
      setMessage("Doctor created successfully");
    }

    setDoctorForm(initialDoctorForm);
    setEditingDoctorId("");
    load();
  };

  const submitPatient = async (event) => {
    event.preventDefault();

    if (editingPatientId) {
      const payload = { ...patientForm };
      if (!payload.password) {
        delete payload.password;
      }
      if (!payload.assignedDoctorId) {
        payload.assignedDoctorId = null;
      }
      await hospitalAdminApi.updatePatient(editingPatientId, payload);
      setMessage("Patient updated successfully");
    } else {
      await hospitalAdminApi.createPatient({
        ...patientForm,
        assignedDoctorId: patientForm.assignedDoctorId || null,
      });
      setMessage("Patient created successfully");
    }

    setPatientForm(initialPatientForm);
    setEditingPatientId("");
    load();
  };

  const editDoctor = (doctor) => {
    setDoctorForm({
      name: doctor.name,
      email: doctor.email,
      password: "",
      profession: doctor.profession,
      experience: doctor.experience,
      contactNo: doctor.contactNo,
      age: doctor.age,
    });
    setEditingDoctorId(doctor._id);
  };

  const editPatient = (patient) => {
    setPatientForm({
      name: patient.name,
      email: patient.email,
      password: "",
      contactNo: patient.contactNo,
      gender: patient.gender,
      age: patient.age,
      bloodGroup: patient.bloodGroup,
      assignedDoctorId: patient.assignedDoctorId?._id || "",
    });
    setEditingPatientId(patient._id);
  };

  const removeDoctor = async (doctorId) => {
    await hospitalAdminApi.deleteDoctor(doctorId);
    setMessage("Doctor deleted successfully");
    load();
  };

  const removePatient = async (patientId) => {
    await hospitalAdminApi.deletePatient(patientId);
    setMessage("Patient deleted successfully");
    load();
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="text-3xl font-bold text-slate-900">Hospital Admin Dashboard</h2>
      <p className="mt-1 text-sm font-medium text-slate-700">Hospital: {hospitalName}</p>
      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Doctors" value={doctors.length} subtitle="Managed doctors" />
        <StatCard title="Patients" value={patients.length} subtitle="Registered patients" />
        <StatCard title="Appointments" value={appointments.length} subtitle="Hospital appointments" />
      </section>

      <section className="mt-8">
        <form onSubmit={updateProfile} className="card grid gap-3 sm:grid-cols-2">
          <h3 className="sm:col-span-2 text-xl font-semibold">Hospital Admin Profile</h3>
          <input className="rounded-lg border px-3 py-2" placeholder="Name" required value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
          <input className="rounded-lg border px-3 py-2" type="email" placeholder="Email" required value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
          <input className="rounded-lg border px-3 py-2" placeholder="Contact No" required value={profileForm.contactNo} onChange={(e) => setProfileForm({ ...profileForm, contactNo: e.target.value })} />
          <button className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white" type="submit">Update Profile</button>
        </form>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <form onSubmit={submitDoctor} className="card grid gap-3 sm:grid-cols-2">
          <h3 className="sm:col-span-2 text-xl font-semibold">
            {editingDoctorId ? "Update Doctor" : "Create Doctor"}
          </h3>
          <input className="rounded-lg border px-3 py-2" placeholder="Name" value={doctorForm.name} onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })} required />
          <input className="rounded-lg border px-3 py-2" placeholder="Email" type="email" value={doctorForm.email} onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })} required />
          <input className="rounded-lg border px-3 py-2" placeholder={editingDoctorId ? "Password (optional)" : "Password"} type="password" value={doctorForm.password} onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })} required={!editingDoctorId} />
          <input className="rounded-lg border px-3 py-2" placeholder="Profession" value={doctorForm.profession} onChange={(e) => setDoctorForm({ ...doctorForm, profession: e.target.value })} required />
          <input className="rounded-lg border px-3 py-2" type="number" placeholder="Experience" value={doctorForm.experience} onChange={(e) => setDoctorForm({ ...doctorForm, experience: Number(e.target.value) })} required />
          <input className="rounded-lg border px-3 py-2" placeholder="Contact No" value={doctorForm.contactNo} onChange={(e) => setDoctorForm({ ...doctorForm, contactNo: e.target.value })} required />
          <input className="rounded-lg border px-3 py-2 sm:col-span-2" type="number" placeholder="Age" value={doctorForm.age} onChange={(e) => setDoctorForm({ ...doctorForm, age: Number(e.target.value) })} required />
          <button className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white" type="submit">
            {editingDoctorId ? "Update Doctor" : "Create Doctor"}
          </button>
          {editingDoctorId ? (
            <button type="button" className="rounded-lg bg-slate-200 px-4 py-2 font-semibold text-slate-800" onClick={() => { setEditingDoctorId(""); setDoctorForm(initialDoctorForm); }}>
              Cancel Edit
            </button>
          ) : null}
        </form>

        <form onSubmit={submitPatient} className="card grid gap-3 sm:grid-cols-2">
          <h3 className="sm:col-span-2 text-xl font-semibold">
            {editingPatientId ? "Update Patient" : "Create Patient"}
          </h3>
          <input className="rounded-lg border px-3 py-2" placeholder="Name" value={patientForm.name} onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })} required />
          <input className="rounded-lg border px-3 py-2" placeholder="Email" type="email" value={patientForm.email} onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })} required />
          <input className="rounded-lg border px-3 py-2" placeholder={editingPatientId ? "Password (optional)" : "Password"} type="password" value={patientForm.password} onChange={(e) => setPatientForm({ ...patientForm, password: e.target.value })} required={!editingPatientId} />
          <input className="rounded-lg border px-3 py-2" placeholder="Contact No" value={patientForm.contactNo} onChange={(e) => setPatientForm({ ...patientForm, contactNo: e.target.value })} required />
          <select className="rounded-lg border px-3 py-2" value={patientForm.gender} onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <input className="rounded-lg border px-3 py-2" type="number" placeholder="Age" value={patientForm.age} onChange={(e) => setPatientForm({ ...patientForm, age: Number(e.target.value) })} required />
          <select className="rounded-lg border px-3 py-2 sm:col-span-2" value={patientForm.assignedDoctorId} onChange={(e) => setPatientForm({ ...patientForm, assignedDoctorId: e.target.value })}>
            <option value="">Assign doctor (optional)</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name} ({doctor.doctorId})
              </option>
            ))}
          </select>
          <input className="rounded-lg border px-3 py-2 sm:col-span-2" placeholder="Blood Group" value={patientForm.bloodGroup} onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value })} required />
          <button className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white" type="submit">
            {editingPatientId ? "Update Patient" : "Create Patient"}
          </button>
          {editingPatientId ? (
            <button type="button" className="rounded-lg bg-slate-200 px-4 py-2 font-semibold text-slate-800" onClick={() => { setEditingPatientId(""); setPatientForm(initialPatientForm); }}>
              Cancel Edit
            </button>
          ) : null}
        </form>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-xl font-semibold">Doctor Management</h3>
          <div className="mt-4 space-y-3">
            {doctors.map((doctor) => (
              <div key={doctor._id} className="rounded-xl border border-slate-200 p-3">
                <h4 className="font-semibold">{doctor.name}</h4>
                <p className="text-sm text-slate-600">{doctor.profession} | {doctor.email}</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" className="rounded bg-amber-500 px-3 py-1 text-xs text-white" onClick={() => editDoctor(doctor)}>Edit</button>
                  <button type="button" className="rounded bg-rose-600 px-3 py-1 text-xs text-white" onClick={() => removeDoctor(doctor._id)}>Delete</button>
                </div>
              </div>
            ))}
            {doctors.length === 0 ? <p className="text-sm text-slate-500">No doctors found.</p> : null}
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold">Patient Management</h3>
          <div className="mt-4 space-y-3">
            {patients.map((patient) => (
              <div key={patient._id} className="rounded-xl border border-slate-200 p-3">
                <h4 className="font-semibold">{patient.name}</h4>
                <p className="text-sm text-slate-600">{patient.email} | {patient.bloodGroup}</p>
                <p className="text-xs text-slate-500">Assigned Doctor: {patient.assignedDoctorId?.name || "Not Assigned"}</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" className="rounded bg-amber-500 px-3 py-1 text-xs text-white" onClick={() => editPatient(patient)}>Edit</button>
                  <button type="button" className="rounded bg-rose-600 px-3 py-1 text-xs text-white" onClick={() => removePatient(patient._id)}>Delete</button>
                </div>
              </div>
            ))}
            {patients.length === 0 ? <p className="text-sm text-slate-500">No patients found.</p> : null}
          </div>
        </div>
      </section>

      <section className="mt-8 card">
        <h3 className="text-xl font-semibold">Appointment Management</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-2">Patient</th>
                <th className="py-2">Doctor</th>
                <th className="py-2">Date</th>
                <th className="py-2">Slot</th>
                <th className="py-2">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a._id} className="border-b">
                  <td className="py-2">{a.patientId?.name}</td>
                  <td className="py-2">{a.doctorId?.name}</td>
                  <td className="py-2">{a.date}</td>
                  <td className="py-2">{a.timeSlot}</td>
                  <td className="py-2">{a.status}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button className="rounded bg-emerald-600 px-2 py-1 text-white" onClick={() => changeStatus(a._id, "Accepted")} type="button">Accept</button>
                      <button className="rounded bg-rose-600 px-2 py-1 text-white" onClick={() => changeStatus(a._id, "Rejected")} type="button">Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default HospitalAdminDashboard;
