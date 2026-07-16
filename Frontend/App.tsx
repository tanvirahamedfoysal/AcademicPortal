import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Researchers from "./pages/Researchers";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import Portfolio from "./pages/Portfolio";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentDashboard from "./pages/StudentDashboard";

import AdminLayout from "./pages/admin/AdminLayout";
import Overview from "./pages/admin/Overview";
import Students from "./pages/admin/Students";
import Moderators from "./pages/admin/Moderators";
import Collaborators from "./pages/admin/Collaborators";
import AdminArticles from "./pages/admin/Articles";
import AdminPortfolio from "./pages/admin/AdminPortfolio";
import Repository from "./pages/admin/Repository";
import Inbox from "./pages/admin/Inbox";
import AuditLogs from "./pages/admin/AuditLogs";

export default function App() {
  return (
    <Routes>
      {/* Public / visitor routes */}
      <Route path="/" element={<Home />} />
      <Route path="/researchers" element={<Researchers />} />
      <Route path="/articles" element={<Articles />} />
      <Route path="/articles/:id" element={<ArticleDetail />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Student dashboard */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allow={["STUDENT"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin console */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allow={["ADMIN", "MODERATOR"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="students" element={<Students />} />
        <Route path="moderators" element={<Moderators />} />
        <Route path="collaborators" element={<Collaborators />} />
        <Route path="articles" element={<AdminArticles />} />
        <Route path="portfolio" element={<AdminPortfolio />} />
        <Route path="repository" element={<Repository />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="audit-logs" element={<AuditLogs />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
