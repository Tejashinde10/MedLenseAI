import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Layout = ({ children }) => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* NAVBAR */}
      <header className="w-full bg-white/80 backdrop-blur-xl border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-6">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/Logo.jpg"
              alt="MedLense Logo"
              className="h-12 w-12 rounded-md shadow-md object-cover"
            />
            <div className="leading-tight">
              <h1 className="text-lg font-bold tracking-tight">MedLense AI</h1>
              <p className="text-xs text-muted-foreground">
                Smart Medical Report Reader
              </p>
            </div>
          </Link>

          {/* AUTH BUTTONS */}
          <div className="flex items-center gap-3">
            {!token ? (
              <>
                <Link to="/Register">
                  <button className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
                    Sign Up
                  </button>
                </Link>

                <Link to="/login">
                  <button className="px-5 py-2.5 rounded-lg border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 transition">
                    Login
                  </button>
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="pt-10 px-4">{children}</main>
    </div>
  );
};

export default Layout;
