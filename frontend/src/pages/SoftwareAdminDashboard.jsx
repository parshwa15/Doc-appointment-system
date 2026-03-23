import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import { softwareAdminApi } from "../services/api";

const SoftwareAdminDashboard = () => {
  const [hospitals, setHospitals] = useState([]);
  const [hospitalAdmins, setHospitalAdmins] = useState([]);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", contactNo: "", password: "" });
  const [form, setForm] = useState({
    name: "",
    address: "",
    contactNo: "",
    description: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    adminContactNo: "",
  });
  const [editingHospitalId, setEditingHospitalId] = useState("");
  const [hospitalAdminForm, setHospitalAdminForm] = useState({
    hospitalId: "",
    name: "",
    email: "",
    password: "",
    contactNo: "",
  });
  const [editingHospitalAdminId, setEditingHospitalAdminId] = useState("");
  const [createdAdmin, setCreatedAdmin] = useState(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = async () => {
    const [profileRes, hospitalsRes, adminsRes] = await Promise.all([
      softwareAdminApi.getProfile(),
      softwareAdminApi.getHospitals(),
      softwareAdminApi.getHospitalAdmins(),
    ]);

    setProfileForm({
      name: profileRes.data.name || "",
      email: profileRes.data.email || "",
      contactNo: profileRes.data.contactNo || "",
      password: "",
    });
    setHospitals(hospitalsRes.data);
    setHospitalAdmins(adminsRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateProfile = async (event) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    try {
      const payload = {
        name: profileForm.name,
        email: profileForm.email,
        contactNo: profileForm.contactNo,
      };

      if (profileForm.password) {
        payload.password = profileForm.password;
      }

      await softwareAdminApi.updateProfile(payload);
      setMessage("Profile updated successfully");
      setProfileForm((prev) => ({ ...prev, password: "" }));
      loadData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to update profile");
    }
  };

  const createHospital = async (event) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    try {
      if (editingHospitalId) {
        await softwareAdminApi.updateHospital(editingHospitalId, {
          name: form.name,
          address: form.address,
          contactNo: form.contactNo,
          description: form.description,
        });
        setCreatedAdmin(null);
        setMessage("Hospital updated successfully");
      } else {
        const { data } = await softwareAdminApi.createHospital({
          name: form.name,
          address: form.address,
          contactNo: form.contactNo,
          description: form.description,
          adminName: form.adminName,
          adminEmail: form.adminEmail,
          adminPassword: form.adminPassword,
          adminContactNo: form.adminContactNo,
        });
        setCreatedAdmin(data.hospitalAdminCredentials || null);
        setMessage("Hospital and hospital admin created successfully");
      }

      setForm({
        name: "",
        address: "",
        contactNo: "",
        description: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
        adminContactNo: "",
      });
      setEditingHospitalId("");
      loadData();
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to save hospital";
      setErrorMessage(msg);
      window.alert(msg);
    }
  };

  const editHospital = (hospital) => {
    setForm({
      name: hospital.name,
      address: hospital.address,
      contactNo: hospital.contactNo,
      description: hospital.description || "",
      adminName: "",
      adminEmail: "",
      adminPassword: "",
      adminContactNo: "",
    });
    setEditingHospitalId(hospital._id);
    setCreatedAdmin(null);
  };

  const deleteHospital = async (id) => {
    await softwareAdminApi.deleteHospital(id);
    loadData();
  };

  const submitHospitalAdmin = async (event) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    try {
      if (editingHospitalAdminId) {
        const payload = {
          hospitalId: hospitalAdminForm.hospitalId,
          name: hospitalAdminForm.name,
          email: hospitalAdminForm.email,
          contactNo: hospitalAdminForm.contactNo,
        };

        await softwareAdminApi.updateHospitalAdmin(editingHospitalAdminId, payload);
        setMessage("Hospital admin updated successfully");
      } else {
        const { data } = await softwareAdminApi.createHospitalAdmin(hospitalAdminForm);
        setCreatedAdmin(data.credentials || null);
        setMessage("Hospital admin created successfully");
      }

      setHospitalAdminForm({ hospitalId: "", name: "", email: "", password: "", contactNo: "" });
      setEditingHospitalAdminId("");
      loadData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to save hospital admin");
    }
  };

  const editHospitalAdmin = (admin) => {
    setHospitalAdminForm({
      hospitalId: admin.hospitalId?._id || "",
      name: admin.name,
      email: admin.email,
      password: "",
      contactNo: admin.contactNo,
    });
    setEditingHospitalAdminId(admin._id);
  };

  const deleteHospitalAdmin = async (id) => {
    await softwareAdminApi.deleteHospitalAdmin(id);
    setMessage("Hospital admin deleted successfully");
    loadData();
  };

  const totalHospitals = useMemo(() => hospitals.length, [hospitals]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="text-3xl font-bold text-slate-900">Software Admin Dashboard</h2>
      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
      {errorMessage ? <p className="mt-3 text-sm text-rose-600">{errorMessage}</p> : null}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Hospitals" value={totalHospitals} subtitle="Registered in system" />
        <StatCard title="Hospital Admins" value={hospitalAdmins.length} subtitle="Managed admins" />
      </section>

      <section className="mt-8">
        <form onSubmit={updateProfile} className="card grid gap-3 sm:grid-cols-2">
          <h3 className="sm:col-span-2 text-xl font-semibold">Software Admin Profile</h3>
          <input className="rounded-lg border px-3 py-2" placeholder="Name" required value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
          <input className="rounded-lg border px-3 py-2" type="email" placeholder="Email" required value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
          <input className="rounded-lg border px-3 py-2" placeholder="Contact No" required value={profileForm.contactNo} onChange={(e) => setProfileForm({ ...profileForm, contactNo: e.target.value })} />
          <input className="rounded-lg border px-3 py-2" type="password" placeholder="New Password (optional)" value={profileForm.password} onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })} />
          <button className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white" type="submit">Update Profile</button>
        </form>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <form onSubmit={createHospital} className="card space-y-3">
          <h3 className="text-xl font-semibold">{editingHospitalId ? "Update Hospital" : "Add Hospital"}</h3>
          <input className="w-full rounded-lg border px-3 py-2" placeholder="Hospital name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="w-full rounded-lg border px-3 py-2" placeholder="Address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input className="w-full rounded-lg border px-3 py-2" placeholder="Contact no" required value={form.contactNo} onChange={(e) => setForm({ ...form, contactNo: e.target.value })} />
          <textarea className="w-full rounded-lg border px-3 py-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          {!editingHospitalId ? (
            <>
              <input className="w-full rounded-lg border px-3 py-2" placeholder="Hospital Admin Name" required value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} />
              <input className="w-full rounded-lg border px-3 py-2" type="email" placeholder="Hospital Admin Email" required value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} />
              <input className="w-full rounded-lg border px-3 py-2" type="password" placeholder="Hospital Admin Password" required value={form.adminPassword} onChange={(e) => setForm({ ...form, adminPassword: e.target.value })} />
              <input className="w-full rounded-lg border px-3 py-2" placeholder="Hospital Admin Contact No" required value={form.adminContactNo} onChange={(e) => setForm({ ...form, adminContactNo: e.target.value })} />
            </>
          ) : null}

          <button className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white" type="submit">{editingHospitalId ? "Update Hospital" : "Create Hospital"}</button>
          {editingHospitalId ? (
            <button
              type="button"
              className="rounded-lg bg-slate-200 px-4 py-2 font-semibold text-slate-800"
              onClick={() => {
                setEditingHospitalId("");
                setForm({
                  name: "",
                  address: "",
                  contactNo: "",
                  description: "",
                  adminName: "",
                  adminEmail: "",
                  adminPassword: "",
                  adminContactNo: "",
                });
              }}
            >
              Cancel Edit
            </button>
          ) : null}

          {createdAdmin ? (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
              <p className="font-semibold">Hospital Admin Created</p>
              <p>Admin ID: {createdAdmin.adminId}</p>
              <p>Email: {createdAdmin.email}</p>
              <p>Password: {createdAdmin.password}</p>
              <p className="mt-1 text-xs">Use these credentials on Hospital Admin Login page.</p>
            </div>
          ) : null}
        </form>

        <div className="card">
          <h3 className="text-xl font-semibold">Hospital List</h3>
          <div className="mt-4 space-y-3">
            {hospitals.map((item) => (
              <div key={item._id} className="rounded-xl border border-slate-200 p-3">
                <h4 className="font-semibold">{item.name}</h4>
                <p className="text-sm text-slate-600">{item.address}</p>
                <p className="text-xs text-slate-500">{item.contactNo}</p>

                <div className="mt-3 rounded-lg bg-slate-50 p-2 text-xs text-slate-700">
                  <p className="font-semibold text-slate-800">Hospital Admin Details</p>
                  {item.hospitalAdmin ? (
                    <>
                      <p>Admin ID: {item.hospitalAdmin.adminId}</p>
                      <p>Name: {item.hospitalAdmin.name}</p>
                      <p>Email: {item.hospitalAdmin.email}</p>
                      <p>Contact: {item.hospitalAdmin.contactNo}</p>
                    </>
                  ) : (
                    <p>No hospital admin linked.</p>
                  )}
                </div>

                <div className="mt-2 flex gap-2">
                  <button type="button" className="rounded bg-amber-500 px-3 py-1 text-xs text-white" onClick={() => editHospital(item)}>
                    Edit
                  </button>
                  <button type="button" className="rounded bg-rose-600 px-3 py-1 text-xs text-white" onClick={() => deleteHospital(item._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {hospitals.length === 0 ? <p className="text-sm text-slate-500">No hospitals found.</p> : null}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <form onSubmit={submitHospitalAdmin} className="card space-y-3">
          <h3 className="text-xl font-semibold">{editingHospitalAdminId ? "Update Hospital Admin" : "Add Hospital Admin"}</h3>
          <select className="w-full rounded-lg border px-3 py-2" required value={hospitalAdminForm.hospitalId} onChange={(e) => setHospitalAdminForm({ ...hospitalAdminForm, hospitalId: e.target.value })}>
            <option value="">Select Hospital</option>
            {hospitals.map((hospital) => (
              <option key={hospital._id} value={hospital._id}>{hospital.name}</option>
            ))}
          </select>
          <input className="w-full rounded-lg border px-3 py-2" placeholder="Admin Name" required value={hospitalAdminForm.name} onChange={(e) => setHospitalAdminForm({ ...hospitalAdminForm, name: e.target.value })} />
          <input className="w-full rounded-lg border px-3 py-2" type="email" placeholder="Admin Email" required value={hospitalAdminForm.email} onChange={(e) => setHospitalAdminForm({ ...hospitalAdminForm, email: e.target.value })} />
          {!editingHospitalAdminId ? (
            <input className="w-full rounded-lg border px-3 py-2" type="password" placeholder="Password" required value={hospitalAdminForm.password} onChange={(e) => setHospitalAdminForm({ ...hospitalAdminForm, password: e.target.value })} />
          ) : null}
          <input className="w-full rounded-lg border px-3 py-2" placeholder="Admin Contact No" required value={hospitalAdminForm.contactNo} onChange={(e) => setHospitalAdminForm({ ...hospitalAdminForm, contactNo: e.target.value })} />
          <button className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white" type="submit">{editingHospitalAdminId ? "Update Hospital Admin" : "Create Hospital Admin"}</button>
          {editingHospitalAdminId ? (
            <button type="button" className="rounded-lg bg-slate-200 px-4 py-2 font-semibold text-slate-800" onClick={() => { setEditingHospitalAdminId(""); setHospitalAdminForm({ hospitalId: "", name: "", email: "", password: "", contactNo: "" }); }}>
              Cancel Edit
            </button>
          ) : null}
        </form>

        <div className="card">
          <h3 className="text-xl font-semibold">Hospital Admin List</h3>
          <div className="mt-4 space-y-3">
            {hospitalAdmins.map((admin) => (
              <div key={admin._id} className="rounded-xl border border-slate-200 p-3">
                <h4 className="font-semibold">{admin.name}</h4>
                <p className="text-xs text-slate-500">{admin.adminId}</p>
                <p className="text-sm text-slate-600">{admin.email}</p>
                <p className="text-xs text-slate-500">{admin.contactNo}</p>
                <p className="mt-1 text-xs text-slate-700">Hospital: {admin.hospitalId?.name || "N/A"}</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" className="rounded bg-amber-500 px-3 py-1 text-xs text-white" onClick={() => editHospitalAdmin(admin)}>Edit</button>
                  <button type="button" className="rounded bg-rose-600 px-3 py-1 text-xs text-white" onClick={() => deleteHospitalAdmin(admin._id)}>Delete</button>
                </div>
              </div>
            ))}
            {hospitalAdmins.length === 0 ? <p className="text-sm text-slate-500">No hospital admins found.</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
};

export default SoftwareAdminDashboard;
