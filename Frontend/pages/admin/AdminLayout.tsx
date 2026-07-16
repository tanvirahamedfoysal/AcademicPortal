import { Outlet } from "react-router-dom";
import DashboardShell, { NavGroup } from "../../components/DashboardShell";

const groups: NavGroup[] = [
  {
    title: "People management",
    items: [
      { to: "/admin", label: "Overview", icon: "📊", end: true },
      { to: "/admin/students", label: "Students & Alumni", icon: "🎓" },
      { to: "/admin/moderators", label: "Moderators", icon: "🛡️" },
      { to: "/admin/collaborators", label: "Collaborators", icon: "🤝" },
    ],
  },
  {
    title: "Content",
    items: [
      { to: "/admin/articles", label: "Articles", icon: "📝" },
      { to: "/admin/portfolio", label: "Portfolio", icon: "🎨" },
    ],
  },
  {
    title: "Lab resources",
    items: [{ to: "/admin/repository", label: "Repository", icon: "📁" }],
  },
  {
    title: "System",
    items: [
      { to: "/admin/inbox", label: "Inbox", icon: "✉️" },
      { to: "/admin/audit-logs", label: "Audit Logs", icon: "🧾" },
    ],
  },
];

export default function AdminLayout() {
  return (
    <DashboardShell groups={groups} title="Admin Center" subtitle="Dashboard / Overview">
      <Outlet />
    </DashboardShell>
  );
}
