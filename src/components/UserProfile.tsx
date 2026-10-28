import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";
import type { AuthUser } from "../context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Address {
  id: number;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  country: string;
  isDefault: boolean;
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: string[];
}

interface SavedItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  img: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatZMW(amount: number) {
  return `ZMW ${amount.toLocaleString("en-ZM", { minimumFractionDigits: 2 })}`;
}

function statusColor(status: string) {
  if (status === "Delivered") return "bg-green-100 text-green-800";
  if (status === "Processing") return "bg-yellow-100 text-yellow-800";
  if (status === "Cancelled") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-600";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold tracking-widest text-gray-900 uppercase">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function EditableField({
  label,
  value,
  type = "text",
  editing,
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  editing: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border border-green-400 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      ) : (
        <span className="text-sm text-gray-900">{value || "—"}</span>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UserProfile() {
  const { user: authUser, token, isAuthenticated, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect unauthenticated visitors
  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  // ── State ──────────────────────────────────────────────────────────────────

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [activities, setActivities] = useState<string[]>([]);

  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "saved">("orders");
  const [saveError, setSaveError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const [editDraft, setEditDraft] = useState({
    firstName: authUser?.firstName ?? "",
    lastName: authUser?.lastName ?? "",
    email: authUser?.email ?? "",
    phone: authUser?.phone ?? "",
  });

  const [passwordDraft, setPasswordDraft] = useState({ current: "", next: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ── Load supplementary data ────────────────────────────────────────────────

  useEffect(() => {
    if (!token) return;

    Promise.all([
      apiFetch<Address[]>("/api/users/me/addresses", { token }),
      apiFetch<Order[]>("/api/users/me/orders", { token }),
      apiFetch<SavedItem[]>("/api/users/me/saved-items", { token }),
      apiFetch<string[]>("/api/users/me/activity-preferences", { token }),
    ])
      .then(([addr, ord, saved, acts]) => {
        setAddresses(addr);
        setOrders(ord);
        setSavedItems(saved);
        setActivities(acts);
      })
      .catch(() => {
        // Non-critical — page still renders with what we have from authUser
      });
  }, [token]);

  if (!authUser) return null;
  const currentUser = authUser;

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function savePersonal() {
    setSaveLoading(true);
    setSaveError("");
    try {
      const updated = await apiFetch<AuthUser>("/api/users/me", {
        method: "PUT",
        token,
        body: {
          firstName: editDraft.firstName.trim(),
          lastName: editDraft.lastName.trim(),
          email: editDraft.email.trim(),
          phone: editDraft.phone.trim() || null,
        },
      });
      updateUser(updated);
      setEditingPersonal(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSaveLoading(false);
    }
  }

  function cancelPersonal() {
    setEditDraft({
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      phone: currentUser.phone ?? "",
    });
    setEditingPersonal(false);
    setSaveError("");
  }

  async function savePassword() {
    if (passwordDraft.next !== passwordDraft.confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }
    if (passwordDraft.next.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    setPasswordError("");
    setPasswordLoading(true);
    try {
      await apiFetch("/api/users/me/password", {
        method: "PUT",
        token,
        body: { currentPassword: passwordDraft.current, newPassword: passwordDraft.next },
      });
      setPasswordDraft({ current: "", next: "", confirm: "" });
      setEditingPassword(false);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function removeActivity(activity: string) {
    setActivities((prev) => prev.filter((a) => a !== activity));
    try {
      await apiFetch(`/api/users/me/activity-preferences/${encodeURIComponent(activity)}`, {
        method: "DELETE",
        token,
      });
    } catch {
      // Refresh if it failed
      const acts = await apiFetch<string[]>("/api/users/me/activity-preferences", { token }).catch(() => activities);
      setActivities(acts);
    }
  }

  async function saveNotifications(prefs: AuthUser["notifications"]) {
    try {
      await apiFetch("/api/users/me/notifications", {
        method: "PUT",
        token,
        body: prefs,
      });
      updateUser({ ...currentUser, notifications: prefs });
    } catch {
      // silent — toggles will revert on next load
    }
  }

  async function handleLogout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST", token });
    } catch {
      // no-op
    }
    logout();
    navigate("/");
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero banner */}
      <div className="bg-green-700">
        <div className="max-w-4xl mx-auto px-4 py-10 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-green-900 flex items-center justify-center shrink-0 shadow-lg">
            <span className="text-white text-2xl font-bold tracking-widest">
              {authUser.avatarInitials}
            </span>
          </div>
          <div className="text-white">
            <p className="text-xs font-bold tracking-widest uppercase text-green-200 mb-0.5">
              {authUser.memberTier}
            </p>
            <h1 className="text-2xl font-bold">
              {authUser.firstName} {authUser.lastName}
            </h1>
            <p className="text-sm text-green-200 mt-0.5">Member since {authUser.memberSince}</p>
          </div>
        </div>
      </div>

      {/* Page body */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
        {/* Personal Details */}
        <SectionCard
          title="Personal Details"
          action={
            !editingPersonal ? (
              <button
                onClick={() => setEditingPersonal(true)}
                className="text-xs font-bold text-white bg-gray-900 rounded-full py-1.5 px-4 hover:bg-gray-700 transition-colors"
              >
                Edit
              </button>
            ) : null
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <EditableField label="First Name" value={editDraft.firstName} editing={editingPersonal} onChange={(v) => setEditDraft((d) => ({ ...d, firstName: v }))} />
            <EditableField label="Last Name" value={editDraft.lastName} editing={editingPersonal} onChange={(v) => setEditDraft((d) => ({ ...d, lastName: v }))} />
            <EditableField label="Email Address" value={editDraft.email} type="email" editing={editingPersonal} onChange={(v) => setEditDraft((d) => ({ ...d, email: v }))} />
            <EditableField label="Phone Number" value={editDraft.phone} type="tel" editing={editingPersonal} onChange={(v) => setEditDraft((d) => ({ ...d, phone: v }))} />
          </div>
          {saveError && <p className="text-xs text-red-600 mt-3">{saveError}</p>}
          {editingPersonal && (
            <div className="flex gap-3 mt-6">
              <button onClick={() => void savePersonal()} disabled={saveLoading} className="text-xs font-bold text-white bg-green-600 rounded-full py-2 px-5 hover:bg-green-700 transition-colors disabled:opacity-60">
                {saveLoading ? "Saving…" : "Save Changes"}
              </button>
              <button onClick={cancelPersonal} className="text-xs font-bold text-gray-700 border border-gray-300 rounded-full py-2 px-5 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          )}
        </SectionCard>

        {/* Password */}
        <SectionCard
          title="Password & Security"
          action={
            !editingPassword ? (
              <button onClick={() => setEditingPassword(true)} className="text-xs font-bold text-white bg-gray-900 rounded-full py-1.5 px-4 hover:bg-gray-700 transition-colors">
                Change
              </button>
            ) : null
          }
        >
          {!editingPassword ? (
            <p className="text-sm text-gray-500">Keep your account secure by using a unique, strong password.</p>
          ) : (
            <div className="flex flex-col gap-4 max-w-sm">
              {(["current", "next", "confirm"] as const).map((key) => (
                <div key={key} className="flex flex-col gap-1">
                  <label htmlFor={`pwd-${key}`} className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {key === "current" ? "Current Password" : key === "next" ? "New Password" : "Confirm New Password"}
                  </label>
                  <input
                    id={`pwd-${key}`}
                    type="password"
                    value={passwordDraft[key]}
                    onChange={(e) => setPasswordDraft((d) => ({ ...d, [key]: e.target.value }))}
                    className="border border-green-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="••••••••"
                  />
                </div>
              ))}
              {passwordError && <p className="text-xs text-red-600 font-medium">{passwordError}</p>}
              <div className="flex gap-3 mt-2">
                <button onClick={() => void savePassword()} disabled={passwordLoading} className="text-xs font-bold text-white bg-green-600 rounded-full py-2 px-5 hover:bg-green-700 transition-colors disabled:opacity-60">
                  {passwordLoading ? "Updating…" : "Update Password"}
                </button>
                <button onClick={() => { setEditingPassword(false); setPasswordError(""); setPasswordDraft({ current: "", next: "", confirm: "" }); }} className="text-xs font-bold text-gray-700 border border-gray-300 rounded-full py-2 px-5 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Addresses */}
        <SectionCard
          title="Saved Addresses"
          action={
            <button className="text-xs font-bold text-white bg-gray-900 rounded-full py-1.5 px-4 hover:bg-gray-700 transition-colors">
              + Add New
            </button>
          }
        >
          {addresses.length === 0 ? (
            <p className="text-sm text-gray-400">No saved addresses yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="border border-gray-200 rounded-xl p-4 flex flex-col gap-1 relative">
                  {addr.isDefault && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{addr.label}</span>
                  <p className="text-sm text-gray-900 mt-1 leading-relaxed">
                    {addr.line1}
                    {addr.line2 && <><br />{addr.line2}</>}
                    <br />{addr.city}, {addr.country}
                  </p>
                  <div className="flex gap-3 mt-3">
                    <button className="text-xs font-medium text-green-700 hover:underline">Edit</button>
                    {!addr.isDefault && (
                      <button className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors">Remove</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Orders & Saved Items */}
        <SectionCard title="Activity">
          <div className="flex gap-2 mb-6">
            {(["orders", "saved"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-bold rounded-full py-1.5 px-4 border transition-colors ${activeTab === tab ? "bg-gray-900 text-white border-gray-900" : "text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              >
                {tab === "orders" ? "Order History" : "Saved Items"}
              </button>
            ))}
          </div>

          {activeTab === "orders" && (
            <div className="flex flex-col gap-3">
              {orders.length === 0 ? (
                <p className="text-sm text-gray-400">No orders yet.</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{order.id}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${statusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{order.date}</p>
                      <p className="text-xs text-gray-600">{order.items.join(" · ")}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-sm font-bold text-gray-900">{formatZMW(order.total)}</span>
                      <button className="text-xs font-bold text-white bg-gray-900 rounded-full py-1.5 px-4 hover:bg-gray-700 transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "saved" && (
            <div className="flex flex-col gap-3">
              {savedItems.length === 0 ? (
                <p className="text-sm text-gray-400">No saved items yet.</p>
              ) : (
                savedItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {item.img ? (
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-6 h-6 text-gray-400" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatZMW(item.price)}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button className="text-xs font-bold text-white bg-green-600 rounded-full py-1.5 px-4 hover:bg-green-700 transition-colors">
                        Add to Cart
                      </button>
                      <button aria-label="Remove saved item" className="text-gray-400 hover:text-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </SectionCard>

        {/* Activity Preferences */}
        <SectionCard title="Activity Preferences">
          <p className="text-xs text-gray-500 mb-4">We use these to personalise your recommendations.</p>
          <div className="flex flex-wrap gap-2">
            {activities.map((activity) => (
              <span key={activity} className="flex items-center gap-1.5 text-xs font-medium text-gray-900 border border-green-500 rounded-full py-1 px-3">
                {activity}
                <button aria-label={`Remove ${activity}`} onClick={() => void removeActivity(activity)} className="text-gray-400 hover:text-red-500 transition-colors leading-none">×</button>
              </span>
            ))}
            <button className="text-xs font-medium text-green-700 border border-dashed border-green-400 rounded-full py-1 px-3 hover:bg-green-50 transition-colors">
              + Add Activity
            </button>
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard title="Notification Preferences">
          <div className="flex flex-col gap-4">
            {(
              [
                { label: "Order updates & shipping", key: "orderUpdates" as const },
                { label: "Deals and promotions", key: "deals" as const },
                { label: "New arrivals in my categories", key: "newArrivals" as const },
                { label: "Newsletter", key: "newsletter" as const },
              ] as const
            ).map(({ label, key }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-800">{label}</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={authUser.notifications[key]}
                    onChange={(e) => {
                      const updated = { ...authUser.notifications, [key]: e.target.checked };
                      void saveNotifications(updated);
                    }}
                    className="sr-only peer"
                    aria-label={label}
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-checked:bg-green-600 rounded-full transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
              </label>
            ))}
          </div>
        </SectionCard>

        {/* Account actions */}
        <SectionCard title="Account">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => void handleLogout()}
              className="text-xs font-bold text-gray-700 border border-gray-300 rounded-full py-2 px-5 hover:bg-gray-100 transition-colors"
            >
              Log Out
            </button>
            <button className="text-xs font-bold text-red-600 border border-red-300 rounded-full py-2 px-5 hover:bg-red-50 transition-colors">
              Delete Account
            </button>
          </div>
        </SectionCard>
      </main>

      <Footer />
    </div>
  );
}
