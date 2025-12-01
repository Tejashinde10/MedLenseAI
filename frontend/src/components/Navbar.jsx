import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const { token, logout } = useAuth();

  return (
    <nav className="w-full border-b bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="MedLense AI"
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-800">MedLense AI</h1>
            <p className="text-xs text-gray-500 -mt-1">
              Smart Medical Report Reader
            </p>
          </div>
        </Link>

        {/* BUTTONS RIGHT */}
        <div className="flex items-center gap-3">
          {!token ? (
            <>
              <Link to="/Register">
                <button className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
                  Sign Up
                </button>
              </Link>

              <Link to="/login">
                <button className="px-5 py-2 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition">
                  Login
                </button>
              </Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="px-5 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
