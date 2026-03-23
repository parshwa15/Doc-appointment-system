import { useEffect, useState } from "react";
import { doctorApi } from "../services/api";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [slot, setSlot] = useState("09:30 AM");
  const [prescription, setPrescription] = useState({ appointmentId: "", prescription: "", paymentMode: "Cash" });

  const load = async () => {
    const { data } = await doctorApi.getAppointments();
    setAppointments(data);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await doctorApi.updateStatus(id, { status });
    load();
  };

  const addSlot = async () => {
    await doctorApi.addTimeSlot({ timeSlot: slot });
    load();
  };

  const submitPrescription = async (event) => {
    event.preventDefault();
    await doctorApi.addPrescription(prescription);
    setPrescription({ appointmentId: "", prescription: "", paymentMode: "Cash" });
    load();
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="text-3xl font-bold text-slate-900">Doctor Dashboard</h2>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="card">
          <h3 className="text-xl font-semibold">Appointments</h3>
          <div className="mt-4 space-y-3">
            {appointments.map((a) => (
              <div key={a._id} className="rounded-lg border p-3">
                <p className="font-semibold">{a.patientId?.name}</p>
                <p className="text-sm text-slate-600">{a.date} - {a.timeSlot}</p>
                <p className="text-sm">Status: {a.status}</p>
                <div className="mt-2 flex gap-2">
                  <button className="rounded bg-emerald-600 px-2 py-1 text-xs text-white" type="button" onClick={() => updateStatus(a._id, "Accepted")}>Accept</button>
                  <button className="rounded bg-rose-600 px-2 py-1 text-xs text-white" type="button" onClick={() => updateStatus(a._id, "Rejected")}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div className="card">
            <h3 className="text-xl font-semibold">Add Time Slot</h3>
            <div className="mt-3 flex gap-2">
              <input className="w-full rounded-lg border px-3 py-2" value={slot} onChange={(e) => setSlot(e.target.value)} />
              <button className="rounded-lg bg-brand-500 px-4 py-2 text-white" onClick={addSlot} type="button">Add</button>
            </div>
          </div>

          <form className="card space-y-3" onSubmit={submitPrescription}>
            <h3 className="text-xl font-semibold">Prescription Form</h3>
            <input className="w-full rounded-lg border px-3 py-2" placeholder="Appointment ID" value={prescription.appointmentId} onChange={(e) => setPrescription({ ...prescription, appointmentId: e.target.value })} required />
            <textarea className="w-full rounded-lg border px-3 py-2" placeholder="Prescription details" value={prescription.prescription} onChange={(e) => setPrescription({ ...prescription, prescription: e.target.value })} required />
            <select className="w-full rounded-lg border px-3 py-2" value={prescription.paymentMode} onChange={(e) => setPrescription({ ...prescription, paymentMode: e.target.value })}>
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
            </select>
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-white" type="submit">Save Prescription</button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default DoctorDashboard;
