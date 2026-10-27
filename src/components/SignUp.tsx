import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginBackground from "../assets/colin-moldenhauer-RMhgATUx0Cc-unsplash.jpg";
import { apiFetch } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import type { AuthUser } from "../context/AuthContext";

interface SignUpForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FieldError {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

function InputField({
  id,
  label,
  type = "text",
  value,
  placeholder,
  error,
  onChange,
  maxLength,
}: {
  id: keyof SignUpForm;
  label: string;
  type?: string;
  value: string;
  placeholder: string;
  error?: string;
  onChange: (v: string) => void;
  maxLength?: number;
}) {
  return (
    <div className="w-3/4 flex flex-col gap-1.5">
      <label htmlFor={id} className="text-lg">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className={`border-b ${
          error ? "border-red-400" : "border-green-300 hover:border-green-400"
        } bg-transparent w-full pb-1 placeholder-white/50 focus:outline-none`}
      />
      {error && (
        <p className="text-xs text-red-300 font-medium">{error}</p>
      )}
    </div>
  );
}

interface SignupResponse {
  token: string;
  user: AuthUser;
}

function SignUp() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState<SignUpForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function setField(field: keyof SignUpForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear the error for this field as the user types
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const newErrors: FieldError = {};

    if (!form.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required.";

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const data = await apiFetch<SignupResponse>("/api/auth/signup", {
        method: "POST",
        body: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          password: form.password,
        },
      });

      // Store auth state and navigate home
      login(data.token, data.user);
      setSuccess(true);
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : "Something went wrong. Please try again." });
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
          className="relative z-10 flex flex-col gap-6 items-center justify-center bg-white/10 backdrop-blur-xs backdrop-saturate-150 text-white font-normal p-5 pt-10 ms-auto me-10 w-1/3 text-sm shadow rounded-2xl"
        >
          <h2 className="mx-auto font-bold text-3xl">Create Account</h2>

          {/* General API error */}
          {errors.general && (
            <div className="w-3/4 bg-red-500/20 border border-red-400 rounded-lg px-4 py-2 text-xs text-red-200 font-medium">
              {errors.general}
            </div>
          )}

          {/* Success banner */}
          {success && (
            <div className="w-3/4 bg-green-500/20 border border-green-400 rounded-lg px-4 py-2 text-xs text-green-200 font-medium text-center">
              Account created! Redirecting to log in…
            </div>
          )}

          {/* ── Name row ── */}
          <div className="w-3/4 flex gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <label htmlFor="firstName" className="text-lg">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                placeholder="Alex"
                onChange={(e) => setField("firstName", e.target.value)}
                className={`border-b ${
                  errors.firstName ? "border-red-400" : "border-green-300 hover:border-green-400"
                } bg-transparent w-full pb-1 placeholder-white/50 focus:outline-none`}
              />
              {errors.firstName && (
                <p className="text-xs text-red-300">{errors.firstName}</p>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label htmlFor="lastName" className="text-lg">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                placeholder="Mwale"
                onChange={(e) => setField("lastName", e.target.value)}
                className={`border-b ${
                  errors.lastName ? "border-red-400" : "border-green-300 hover:border-green-400"
                } bg-transparent w-full pb-1 placeholder-white/50 focus:outline-none`}
              />
              {errors.lastName && (
                <p className="text-xs text-red-300">{errors.lastName}</p>
              )}
            </div>
          </div>

          <InputField
            id="email"
            label="Email Address"
            type="email"
            value={form.email}
            placeholder="alex@email.com"
            error={errors.email}
            onChange={(v) => setField("email", v)}
          />

          <InputField
            id="phone"
            label="Phone (optional)"
            type="tel"
            value={form.phone}
            placeholder="+260 97 123 4567"
            onChange={(v) => setField("phone", v)}
          />

          <InputField
            id="password"
            label="Password"
            type="password"
            value={form.password}
            placeholder="Min. 8 characters"
            error={errors.password}
            onChange={(v) => setField("password", v)}
          />

          <InputField
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            value={form.confirmPassword}
            placeholder="••••••••"
            error={errors.confirmPassword}
            onChange={(v) => setField("confirmPassword", v)}
          />

          <button
            type="submit"
            disabled={loading || success}
            className="border border-white rounded-lg text-black font-semibold bg-white h-10 w-3/7 mx-auto transition duration-700 ease-in-out hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account…" : "Sign Up"}
          </button>

          <p className="pb-4">
            Already have an account?{" "}
            <Link to="/login" className="font-bold hover:underline">
              Log in here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
