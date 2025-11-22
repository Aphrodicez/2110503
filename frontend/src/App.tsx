import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Campgrounds from "./pages/Campgrounds";
import BookCampground from "./pages/BookCampground";
import MyBookings from "./pages/MyBookings";
import AdminBookings from "./pages/AdminBookings";
import NotFound from "./pages/NotFound";
import CampgroundReviews from "./pages/CampgroundReviews";
import { AuthProvider } from "@/context/AuthContext";
import { RequireAuth } from "@/components/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/campgrounds" element={<Campgrounds />} />
            <Route
              path="/campgrounds/:id/reviews"
              element={<CampgroundReviews />}
            />
            <Route
              path="/book/:id"
              element={
                <RequireAuth>
                  <BookCampground />
                </RequireAuth>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <RequireAuth>
                  <MyBookings />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <RequireAuth role="admin">
                  <AdminBookings />
                </RequireAuth>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
