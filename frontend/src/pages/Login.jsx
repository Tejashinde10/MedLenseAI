import { useState } from "react";
import api from "@/api/axiosClient";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    try {
      const res = await api.post("/api/auth/login", { email, password });

      // Save token + user into context
      login(res.data.token, res.data.user);

      // Redirect
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-lg border">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>

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
            onClick={handleLogin}
            className="bg-primary text-primary-foreground p-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Login
          </button>
        </div>

        <p className="text-sm text-center mt-4 text-muted-foreground">
          Don’t have an account?{" "}
          <Link to="/Register" className="text-primary underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
