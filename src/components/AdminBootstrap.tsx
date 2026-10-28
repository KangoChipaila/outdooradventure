import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";
import type { AuthUser } from "../context/AuthContext";

interface BootstrapResponse {
  token: string;
  user: AuthUser;
}

export default function AdminBootstrap() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.password) {
      setError("All fields are required.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch<BootstrapResponse>("/api/auth/bootstrap-admin", {
        method: "POST",
        body: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
        },
      });

      login(data.token, data.user);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the admin account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-700">Setup</p>
          <h1 className="mt-2 text-3xl font-black text-gray-900">Create first admin</h1>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-gray-700">
              <span className="font-medium">First name</span>
              <input
                value={form.firstName}
                onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-500"
              />
            </label>

            <label className="space-y-1 text-sm text-gray-700">
              <span className="font-medium">Last name</span>
              <input
                value={form.lastName}
                onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-500"
              />
            </label>
          </div>

          <label className="block space-y-1 text-sm text-gray-700">
            <span className="font-medium">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-500"
            />
          </label>

          <label className="block space-y-1 text-sm text-gray-700">
            <span className="font-medium">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-green-500"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-green-700 px-5 py-3 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-60"
          >
            {loading ? "Creating admin..." : "Create admin account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already set up? <Link to="/login" className="font-semibold text-green-700 hover:underline">Go to login</Link>
        </p>
      </div>
    </div>
  );
}
