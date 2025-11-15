import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tent } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdmin");
    window.location.href = "/";
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Tent className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">CampBook</span>
          </Link>

          <nav className="flex items-center gap-4">
            {!isLoggedIn ? (
              <>
                <Button asChild variant="ghost">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link to="/campgrounds">Campgrounds</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/my-bookings">My Bookings</Link>
                </Button>
                {isAdmin && (
                  <Button asChild variant="ghost">
                    <Link to="/admin/bookings">Admin</Link>
                  </Button>
                )}
                <Button onClick={handleLogout} variant="outline">
                  Logout
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
