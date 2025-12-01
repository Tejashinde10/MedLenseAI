import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();

  if (!token) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-[380px] p-6 animate-in fade-in slide-in-from-bottom">
          <h2 className="text-xl font-bold text-center mb-2">Login Required</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            To continue, please login or create an account.
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <a
              href="/login"
              className="block w-full text-center bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </a>

            <a
              href="/Register"
              className="block w-full text-center border border-gray-300 py-2.5 rounded-lg hover:bg-gray-100 transition"
            >
              Create Account
            </a>
          </div>

          {/* Close Button */}
          <div className="text-center mt-5">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:underline"
            >
              Close
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
