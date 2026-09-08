import { useState } from "react";

// 1. Completed UserProfileCard Component with full Tailwind styling
function UserProfileCard({ user, theme, actions }) {
  return (
    <div className={`p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6 transition-all duration-300 hover:shadow-lg ${theme.backgroundColor} ${theme.textColor}`}>
      
      {/* Left Column: Avatar & Role Badge */}
      <div className="flex flex-col items-center gap-2">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-inner ${theme.avatarBg}`}>
          {decodeURIComponent(user.avatar)}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${theme.badgeBg}`}>
          {user.role}
        </span>
      </div>

      {/* Right Column: User Info, Stats, & Actions */}
      <div className="flex-1 w-full text-center md:text-left flex flex-col justify-between">
        <div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
            <h4 className="text-xl font-bold">{user.name}</h4>
            <span className={`inline-block self-center px-2 py-0.5 text-xs font-medium rounded-md border ${
              user.status === "Active" || user.status === "Online" 
                ? "bg-green-50 text-green-700 border-green-200" 
                : "bg-gray-50 text-gray-700 border-gray-200"
            }`}>
              {user.status}
            </span>
          </div>
          <p className="text-sm opacity-75 mt-0.5">{user.email}</p>
        </div>

        {/* Dynamic Stats Grid */}
        {user.stats && (
          <div className="grid grid-cols-3 gap-4 my-5 p-3 bg-white/40 backdrop-blur-sm rounded-xl border border-white/20">
            {Object.entries(user.stats).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-xs uppercase tracking-wider opacity-60 font-medium">{key}</div>
                <div className="text-lg font-bold">{value.toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Action Buttons */}
        <div className="flex gap-3 justify-center md:justify-start mt-2">
          {actions.primary && (
            <button
              onClick={actions.primary.onClick}
              className={`px-4 py-2 rounded-lg text-sm font-semibold tracking-wide shadow-sm transition-colors duration-200 ${actions.primary.className}`}
            >
              {actions.primary.label}
            </button>
          )}
          {actions.secondary && (
            <button
              onClick={actions.secondary.onClick}
              className={`px-4 py-2 rounded-lg text-sm font-semibold tracking-wide shadow-sm transition-colors duration-200 ${actions.secondary.className}`}
            >
              {actions.secondary.label}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

// 2. Main ComplexProp Component
const ComplexProp = () => {
  // Added state to capture button clicks dynamically
  const [message, setMessage] = useState("Click an action button above");

  const users = [
    {
      user: {
        name: "Alice Johnson",
        email: "alice@example.com",
        avatar: "👩%E2%80%8D💼",
        role: "Admin",
        status: "Active",
        stats: {
          posts: 145,
          followers: 2834,
          following: 421,
        },
      },
      theme: {
        backgroundColor: "bg-gradient-to-br from-purple-50 to-blue-50",
        textColor: "text-purple-950",
        avatarBg: "bg-purple-200",
        badgeBg: "bg-purple-100 text-purple-800",
      },
      actions: {
        primary: {
          label: "View Profile",
          onClick: () => setMessage("Viewing Alice's profile"),
          className: "bg-purple-600 text-white hover:bg-purple-700",
        },
        secondary: {
          label: "Message",
          onClick: () => setMessage("Opening message to Alice"),
          className: "bg-white text-purple-700 border border-purple-200 hover:bg-purple-100",
        },
      },
    },
    {
      user: {
        name: "Bob Smith",
        email: "bob@example.com",
        avatar: "👨%E2%80%8D💻",
        role: "Developer",
        status: "Online",
        stats: {
          projects: 28,
          commits: 1523,
          reviews: 89,
        },
      },
      theme: {
        backgroundColor: "bg-gradient-to-br from-emerald-50 to-teal-50",
        textColor: "text-emerald-950",
        avatarBg: "bg-emerald-200",
        badgeBg: "bg-emerald-100 text-emerald-800",
      },
      actions: {
        primary: {
          label: "View Profile",
          onClick: () => setMessage("Viewing Bob's profile"),
          className: "bg-emerald-600 text-white hover:bg-emerald-700",
        },
        secondary: {
          label: "Collaborate",
          onClick: () => setMessage("Starting collaboration with Bob"),
          className: "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
        },
      },
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
          User Directory Dashboard
        </h3>
        
        {/* Responsive Grid layout for cards */}
        <div className="grid grid-cols-1 gap-6">
          {users.map((userData, index) => (
            <UserProfileCard key={index} {...userData} />
          ))}
        </div>
      </div>

      {/* Action Notification Bar */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
        <p className="text-sm font-medium text-gray-600">
          <span className="text-gray-400 mr-1">System Action:</span> {message}
        </p>
      </div>
    </div>
  );
};

export default ComplexProp;
