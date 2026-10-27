import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginBackground from "../assets/colin-moldenhauer-RMhgATUx0Cc-unsplash.jpg";
import { apiFetch } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import type { AuthUser } from "../context/AuthContext";

interface LoginResponse {
  token: string;
  user: AuthUser;
}

function LogIn() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: { email: email.trim(), password },
      });
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex">
      <div
        className="flex flex-col items-center justify-center min-h-full w-full text-white text-3xl font-bold before:absolute before:inset-0 before:bg-black/40 bg-cover"
        style={{ backgroundImage: `url(${loginBackground})` }}
      >
        <p className="relative z-10" />

        <form
          onSubmit={handleSubmit}
          noValidate
          className="relative z-10 flex flex-col gap-10 items-center justify-center bg-white/10 backdrop-blur-xs backdrop-saturate-150 text-white font-normal p-5 pt-10 ms-auto me-10 h-3/4 w-1/3 text-sm shadow rounded-2xl"
        >
          <h2 className="mx-auto font-bold text-3xl mb-10">Log In</h2>

          {error && (
            <div className="w-3/4 bg-red-500/20 border border-red-400 rounded-lg px-4 py-2 text-xs text-red-200 font-medium">
              {error}
            </div>
          )}

          <div className="w-3/4 flex flex-col gap-2">
            <label htmlFor="email" className="me-auto text-lg">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              className="border-b border-green-300 hover:border-green-400 w-full bg-transparent placeholder-white/50 focus:outline-none pb-1"
            />
          </div>

          <div className="w-3/4 flex flex-col gap-2">
            <label htmlFor="password" className="me-auto text-lg">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              className="border-b border-green-300 hover:border-green-400 w-full bg-transparent placeholder-white/50 focus:outline-none pb-1"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="border border-white rounded-lg text-black font-semibold bg-white h-10 w-3/7 mx-auto transition duration-700 ease-in-out hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in…" : "Log In"}
          </button>

          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="font-bold hover:underline">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LogIn;
