import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-slate-900">
          Doctor Appointment System
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {!role ? (
            <Link className="rounded-lg bg-brand-500 px-4 py-2 font-medium text-white" to="/login">
              Login
            </Link>
          ) : (
            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-slate-800 px-4 py-2 font-medium text-white"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
