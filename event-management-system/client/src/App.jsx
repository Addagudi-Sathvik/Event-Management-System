import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AboutPage from "./pages/AboutPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLayout from "./pages/AdminLayout";
import AdminAllEvents from "./pages/AdminAllEvents";
import AdminUsers from "./pages/AdminUsers";
import DiscoverEventsPage from "./pages/DiscoverEventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import LandingPage from "./pages/LandingPage";
import OrganizerDashboardPage from "./pages/OrganizerDashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CreateEventPage from "./pages/CreateEventPage";
import ScanTicketPage from "./pages/ScanTicketPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/events" element={<DiscoverEventsPage />} />
        <Route path="/events/:id" element={<EventDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="pending" element={<AdminDashboard />} />
          <Route path="events" element={<AdminAllEvents />} />
          <Route path="users" element={<AdminUsers />} />
          <Route index element={<AdminDashboard />} />
        </Route>
        <Route
          path="/organizer/dashboard"
          element={
            <ProtectedRoute roles={["organizer"]}>
              <OrganizerDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/create-event"
          element={
            <ProtectedRoute roles={["organizer"]}>
              <CreateEventPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/scan-ticket"
          element={
            <ProtectedRoute roles={["organizer"]}>
              <ScanTicketPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
