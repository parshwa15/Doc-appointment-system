import { useEffect, useState } from "react";
import { patientApi } from "../services/api";

const PatientDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({ search: "", minRating: 0 });
  const [booking, setBooking] = useState({ doctorId: "", hospitalId: "", date: "", timeSlot: "", paymentMode: "Cash" });
  const selectedDoctor = doctors.find((doctor) => doctor._id === booking.doctorId);

  const loadDoctors = async () => {
    const { data } = await patientApi.getDoctors(filters);
    setDoctors(data);
  };

  const loadAppointments = async () => {
    const { data } = await patientApi.getAppointments();
    setAppointments(data);
  };

  useEffect(() => {
    loadDoctors();
    loadAppointments();
  }, []);

  const applyFilters = async (event) => {
    event.preventDefault();
    loadDoctors();
  };

  const chooseDoctor = (doctorId) => {
    const doctor = doctors.find((item) => item._id === doctorId);
    if (!doctor) {
      return;
    }

    setBooking((prev) => ({
      ...prev,
      doctorId: doctor._id,
      hospitalId: doctor.hospitalId?._id || "",
      timeSlot: doctor.timeSlots?.[0] || "",
    }));
  };

  const book = async (event) => {
    event.preventDefault();
    await patientApi.bookAppointment(booking);
    setBooking({ doctorId: "", hospitalId: "", date: "", timeSlot: "", paymentMode: "Cash" });
    loadAppointments();
  };

  const reviewDoctor = async (doctorId) => {
    await patientApi.addReview({ doctorId, rating: 5, comment: "Great consultation" });
    loadDoctors();
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="text-3xl font-bold text-slate-900">Patient Dashboard</h2>

      <section className="mt-6 card">
        <h3 className="text-xl font-semibold">Find Doctors</h3>
        <form onSubmit={applyFilters} className="mt-3 grid gap-3 sm:grid-cols-3">
          <input className="rounded-lg border px-3 py-2" placeholder="Specialization" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <input className="rounded-lg border px-3 py-2" type="number" min="0" max="5" placeholder="Min rating" value={filters.minRating} onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })} />
          <button className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white" type="submit">Apply</button>
        </form>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="rounded-xl border p-3">
              <h4 className="font-semibold">{doctor.name}</h4>
              <p className="text-sm text-slate-600">{doctor.profession}</p>
              <p className="text-sm">Rating: {doctor.ratings}</p>
              <button type="button" onClick={() => reviewDoctor(doctor._id)} className="mt-2 rounded bg-slate-900 px-3 py-1 text-xs text-white">Give 5 Star Review</button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <form className="card space-y-3" onSubmit={book}>
          <h3 className="text-xl font-semibold">Book Appointment</h3>
          <select className="w-full rounded-lg border px-3 py-2" required value={booking.doctorId} onChange={(e) => chooseDoctor(e.target.value)}>
            <option value="">Select Doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name} - {doctor.profession}
              </option>
            ))}
          </select>
          <input className="w-full rounded-lg border px-3 py-2 bg-slate-50" placeholder="Hospital" value={selectedDoctor?.hospitalId?.name || ""} readOnly />
          <input className="w-full rounded-lg border px-3 py-2" type="date" required value={booking.date} onChange={(e) => setBooking({ ...booking, date: e.target.value })} />
          <select className="w-full rounded-lg border px-3 py-2" required value={booking.timeSlot} onChange={(e) => setBooking({ ...booking, timeSlot: e.target.value })}>
            <option value="">Select Time Slot</option>
            {(selectedDoctor?.timeSlots || []).map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
          <select className="w-full rounded-lg border px-3 py-2" value={booking.paymentMode} onChange={(e) => setBooking({ ...booking, paymentMode: e.target.value })}>
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
          </select>
          <button className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white" type="submit">Book</button>
        </form>

        <div className="card">
          <h3 className="text-xl font-semibold">My Appointments</h3>
          <div className="mt-4 space-y-3">
            {appointments.map((a) => (
              <div key={a._id} className="rounded-lg border p-3">
                <p className="font-semibold">{a.doctorId?.name}</p>
                <p className="text-sm text-slate-600">{a.hospitalId?.name}</p>
                <p className="text-sm">{a.date} | {a.timeSlot} | {a.status}</p>
              </div>
            ))}
            {appointments.length === 0 ? <p className="text-sm text-slate-500">No appointments yet.</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
};

export default PatientDashboard;
