import { useState } from "react";
import api from "@/api/axiosClient";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      // FIXED ROUTE: must be lowercase "register"
      const res = await api.post("/api/auth/register", { email, password });

      // Save token + user
      login(res.data.token, res.data.user);

      // Redirect after signup
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Signup failed. User may already exist.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-lg border">
        <h1 className="text-3xl font-bold text-center mb-6">Create Account</h1>

        <div className="flex flex-col gap-4">
          <input
            className="border p-3 rounded-lg bg-input text-foreground"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
          />

          <input
            className="border p-3 rounded-lg bg-input text-foreground"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
          />

          <button
            onClick={handleSignup}
            className="bg-primary text-primary-foreground p-3 rounded-lg font-semibold hover:opacity-90"
          >
            Create Account
          </button>
        </div>

        <p className="text-sm text-center mt-4 text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
