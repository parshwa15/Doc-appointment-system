import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  softwareAdminLogin: (payload) => api.post("/software-admin/login", payload),
  hospitalAdminLogin: (payload) => api.post("/hospital-admin/login", payload),
  doctorLogin: (payload) => api.post("/doctor/login", payload),
  patientLogin: (payload) => api.post("/patient/login", payload),
  patientRegister: (payload) => api.post("/patient/register", payload),
};

export const softwareAdminApi = {
  getProfile: () => api.get("/software-admin/profile"),
  updateProfile: (payload) => api.put("/software-admin/profile", payload),
  getHospitals: () => api.get("/software-admin/hospitals"),
  createHospital: (payload) => api.post("/software-admin/create-hospital", payload),
  updateHospital: (id, payload) => api.put(`/software-admin/update-hospital/${id}`, payload),
  deleteHospital: (id) => api.delete(`/software-admin/delete-hospital/${id}`),
  createHospitalAdmin: (payload) => api.post("/software-admin/create-hospital-admin", payload),
  getHospitalAdmins: () => api.get("/software-admin/hospital-admins"),
  updateHospitalAdmin: (id, payload) => api.put(`/software-admin/update-hospital-admin/${id}`, payload),
  deleteHospitalAdmin: (id) => api.delete(`/software-admin/delete-hospital-admin/${id}`),
};

export const hospitalAdminApi = {
  getProfile: () => api.get("/hospital-admin/profile"),
  updateProfile: (payload) => api.put("/hospital-admin/profile", payload),
  getDoctors: () => api.get("/hospital-admin/doctors"),
  getPatients: () => api.get("/hospital-admin/patients"),
  createDoctor: (payload) => api.post("/hospital-admin/create-doctor", payload),
  createPatient: (payload) => api.post("/hospital-admin/create-patient", payload),
  updateDoctor: (id, payload) => api.put(`/hospital-admin/update-doctor/${id}`, payload),
  deleteDoctor: (id) => api.delete(`/hospital-admin/delete-doctor/${id}`),
  updatePatient: (id, payload) => api.put(`/hospital-admin/update-patient/${id}`, payload),
  deletePatient: (id) => api.delete(`/hospital-admin/delete-patient/${id}`),
  getAppointments: () => api.get("/hospital-admin/appointments"),
  updateAppointmentStatus: (id, payload) =>
    api.put(`/hospital-admin/update-appointment-status/${id}`, payload),
};

export const doctorApi = {
  getAppointments: () => api.get("/doctor/appointments"),
  updateStatus: (id, payload) => api.put(`/doctor/update-status/${id}`, payload),
  addPrescription: (payload) => api.post("/doctor/add-prescription", payload),
  addTimeSlot: (payload) => api.post("/doctor/add-timeslot", payload),
};

export const patientApi = {
  getDoctors: (params) => api.get("/patient/doctors", { params }),
  bookAppointment: (payload) => api.post("/patient/book-appointment", payload),
  getAppointments: () => api.get("/patient/appointments"),
  addReview: (payload) => api.post("/patient/review", payload),
};
