import { useState } from "react";
import Footer from "./Footer";

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_USER = {
  firstName: "Alex",
  lastName: "Mwale",
  email: "alex.mwale@email.com",
  phone: "+260 97 123 4567",
  memberSince: "March 2022",
  memberTier: "Summit Member",
  avatarInitials: "AM",
  addresses: [
    {
      id: 1,
      label: "Home",
      line1: "14 Acacia Drive",
      line2: "Kabulonga",
      city: "Lusaka",
      country: "Zambia",
      isDefault: true,
    },
    {
      id: 2,
      label: "Work",
      line1: "Plot 4662, Addis Ababa Roundabout",
      line2: "Ridgeway",
      city: "Lusaka",
      country: "Zambia",
      isDefault: false,
    },
  ],
  orders: [
    {
      id: "ORD-00142",
      date: "12 Oct 2025",
      status: "Delivered",
      total: 1250.0,
      items: ["Trail Runner Pro Boots", "Merino Base Layer"],
    },
    {
      id: "ORD-00139",
      date: "4 Sep 2025",
      status: "Delivered",
      total: 780.5,
      items: ["Trekking Poles (Pair)", "Hydration Pack 2L"],
    },
    {
      id: "ORD-00127",
      date: "18 Jul 2025",
      status: "Delivered",
      total: 3400.0,
      items: ["4-Season Tent"],
    },
  ],
  savedItems: [
    { id: 1, name: "Summit Hardshell Jacket", price: 2199.0 },
    { id: 2, name: "GPS Navigation Watch", price: 4850.0 },
    { id: 3, name: "Ultralight Sleeping Bag", price: 1650.0 },
  ],
  activityPreferences: ["Hiking", "Climbing", "Camping"],
};

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

/** Section wrapper card */
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
        <h2 className="text-sm font-bold tracking-widest text-gray-900 uppercase">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

/** Editable text field row */
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
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </span>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border border-green-400 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      ) : (
        <span className="text-sm text-gray-900">{value}</span>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserProfile() {
  const [user, setUser] = useState(MOCK_USER);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "saved">("orders");

  // Temp edit state for personal details
  const [editDraft, setEditDraft] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
  });

  const [passwordDraft, setPasswordDraft] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState("");

  function savePersonal() {
    setUser((prev) => ({ ...prev, ...editDraft }));
    setEditingPersonal(false);
  }

  function cancelPersonal() {
    setEditDraft({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    });
    setEditingPersonal(false);
  }

  function savePassword() {
    if (passwordDraft.next !== passwordDraft.confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }
    if (passwordDraft.next.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    setPasswordError("");
    setPasswordDraft({ current: "", next: "", confirm: "" });
    setEditingPassword(false);
  }

  function removeActivity(activity: string) {
    setUser((prev) => ({
      ...prev,
      activityPreferences: prev.activityPreferences.filter((a) => a !== activity),
    }));
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ── Hero banner ── */}
      <div className="bg-green-700 pt-[56px]">
        <div className="max-w-4xl mx-auto px-4 py-10 flex items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-green-900 flex items-center justify-center shrink-0 shadow-lg">
            <span className="text-white text-2xl font-bold tracking-widest">
              {user.avatarInitials}
            </span>
          </div>

          {/* Name + tier */}
          <div className="text-white">
            <p className="text-xs font-bold tracking-widest uppercase text-green-200 mb-0.5">
              {user.memberTier}
            </p>
            <h1 className="text-2xl font-bold">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-green-200 mt-0.5">
              Member since {user.memberSince}
            </p>
          </div>
        </div>
      </div>

      {/* ── Page body ── */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
        {/* ── Personal Details ── */}
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
            <EditableField
              label="First Name"
              value={editDraft.firstName}
              editing={editingPersonal}
              onChange={(v) => setEditDraft((d) => ({ ...d, firstName: v }))}
            />
            <EditableField
              label="Last Name"
              value={editDraft.lastName}
              editing={editingPersonal}
              onChange={(v) => setEditDraft((d) => ({ ...d, lastName: v }))}
            />
            <EditableField
              label="Email Address"
              value={editDraft.email}
              type="email"
              editing={editingPersonal}
              onChange={(v) => setEditDraft((d) => ({ ...d, email: v }))}
            />
            <EditableField
              label="Phone Number"
              value={editDraft.phone}
              type="tel"
              editing={editingPersonal}
              onChange={(v) => setEditDraft((d) => ({ ...d, phone: v }))}
            />
          </div>

          {editingPersonal && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={savePersonal}
                className="text-xs font-bold text-white bg-green-600 rounded-full py-2 px-5 hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={cancelPersonal}
                className="text-xs font-bold text-gray-700 border border-gray-300 rounded-full py-2 px-5 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </SectionCard>

        {/* ── Password ── */}
        <SectionCard
          title="Password & Security"
          action={
            !editingPassword ? (
              <button
                onClick={() => setEditingPassword(true)}
                className="text-xs font-bold text-white bg-gray-900 rounded-full py-1.5 px-4 hover:bg-gray-700 transition-colors"
              >
                Change
              </button>
            ) : null
          }
        >
          {!editingPassword ? (
            <p className="text-sm text-gray-500">
              Your password was last updated recently. Keep your account secure
              by using a unique, strong password.
            </p>
          ) : (
            <div className="flex flex-col gap-4 max-w-sm">
              {(
                [
                  ["Current Password", "current"],
                  ["New Password", "next"],
                  ["Confirm New Password", "confirm"],
                ] as const
              ).map(([label, key]) => (
                <div key={key} className="flex flex-col gap-1">
                  <label
                    htmlFor={`pwd-${key}`}
                    className="text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {label}
                  </label>
                  <input
                    id={`pwd-${key}`}
                    type="password"
                    value={passwordDraft[key]}
                    onChange={(e) =>
                      setPasswordDraft((d) => ({ ...d, [key]: e.target.value }))
                    }
                    className="border border-green-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="••••••••"
                  />
                </div>
              ))}

              {passwordError && (
                <p className="text-xs text-red-600 font-medium">{passwordError}</p>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  onClick={savePassword}
                  className="text-xs font-bold text-white bg-green-600 rounded-full py-2 px-5 hover:bg-green-700 transition-colors"
                >
                  Update Password
                </button>
                <button
                  onClick={() => {
                    setEditingPassword(false);
                    setPasswordError("");
                    setPasswordDraft({ current: "", next: "", confirm: "" });
                  }}
                  className="text-xs font-bold text-gray-700 border border-gray-300 rounded-full py-2 px-5 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── Addresses ── */}
        <SectionCard
          title="Saved Addresses"
          action={
            <button className="text-xs font-bold text-white bg-gray-900 rounded-full py-1.5 px-4 hover:bg-gray-700 transition-colors">
              + Add New
            </button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.addresses.map((addr) => (
              <div
                key={addr.id}
                className="border border-gray-200 rounded-xl p-4 flex flex-col gap-1 relative"
              >
                {addr.isDefault && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  {addr.label}
                </span>
                <p className="text-sm text-gray-900 mt-1 leading-relaxed">
                  {addr.line1}
                  <br />
                  {addr.line2}
                  <br />
                  {addr.city}, {addr.country}
                </p>
                <div className="flex gap-3 mt-3">
                  <button className="text-xs font-medium text-green-700 hover:underline">
                    Edit
                  </button>
                  {!addr.isDefault && (
                    <button className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Orders & Saved Items (tabs) ── */}
        <SectionCard title="Activity">
          {/* Tab switcher */}
          <div className="flex gap-2 mb-6">
            {(["orders", "saved"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-bold rounded-full py-1.5 px-4 border transition-colors ${
                  activeTab === tab
                    ? "bg-gray-900 text-white border-gray-900"
                    : "text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {tab === "orders" ? "Order History" : "Saved Items"}
              </button>
            ))}
          </div>

          {/* Orders */}
          {activeTab === "orders" && (
            <div className="flex flex-col gap-3">
              {user.orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        {order.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${statusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{order.date}</p>
                    <p className="text-xs text-gray-600">
                      {order.items.join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-sm font-bold text-gray-900">
                      {formatZMW(order.total)}
                    </span>
                    <button className="text-xs font-bold text-white bg-gray-900 rounded-full py-1.5 px-4 hover:bg-gray-700 transition-colors">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Saved Items */}
          {activeTab === "saved" && (
            <div className="flex flex-col gap-3">
              {user.savedItems.length === 0 ? (
                <p className="text-sm text-gray-400">No saved items yet.</p>
              ) : (
                user.savedItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3"
                  >
                    {/* Placeholder thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.2}
                        stroke="currentColor"
                        className="w-6 h-6 text-gray-400"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                        />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatZMW(item.price)}
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button className="text-xs font-bold text-white bg-green-600 rounded-full py-1.5 px-4 hover:bg-green-700 transition-colors">
                        Add to Cart
                      </button>
                      <button
                        aria-label="Remove saved item"
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.8}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18 18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </SectionCard>

        {/* ── Activity Preferences ── */}
        <SectionCard title="Activity Preferences">
          <p className="text-xs text-gray-500 mb-4">
            We use these to personalise your recommendations.
          </p>
          <div className="flex flex-wrap gap-2">
            {user.activityPreferences.map((activity) => (
              <span
                key={activity}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-900 border border-green-500 rounded-full py-1 px-3"
              >
                {activity}
                <button
                  aria-label={`Remove ${activity}`}
                  onClick={() => removeActivity(activity)}
                  className="text-gray-400 hover:text-red-500 transition-colors leading-none"
                >
                  ×
                </button>
              </span>
            ))}
            <button className="text-xs font-medium text-green-700 border border-dashed border-green-400 rounded-full py-1 px-3 hover:bg-green-50 transition-colors">
              + Add Activity
            </button>
          </div>
        </SectionCard>

        {/* ── Notifications ── */}
        <SectionCard title="Notification Preferences">
          <div className="flex flex-col gap-4">
            {[
              { label: "Order updates & shipping", key: "orderUpdates", on: true },
              { label: "Deals and promotions", key: "deals", on: true },
              { label: "New arrivals in my categories", key: "newArrivals", on: false },
              { label: "Newsletter", key: "newsletter", on: false },
            ].map((pref) => (
              <label
                key={pref.key}
                className="flex items-center justify-between cursor-pointer"
              >
                <span className="text-sm text-gray-800">{pref.label}</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    defaultChecked={pref.on}
                    className="sr-only peer"
                    aria-label={pref.label}
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-checked:bg-green-600 rounded-full transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
              </label>
            ))}
          </div>
        </SectionCard>

        {/* ── Danger zone ── */}
        <SectionCard title="Account">
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="text-xs font-bold text-gray-700 border border-gray-300 rounded-full py-2 px-5 hover:bg-gray-100 transition-colors">
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
