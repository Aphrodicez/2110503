import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tent } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const { user, logout, isLoading } = useAuth();
  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";

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
                <Button asChild variant="ghost" disabled={isLoading}>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild disabled={isLoading}>
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
                <div className="flex items-center gap-3 border-l border-border pl-4 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{user.name}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs uppercase tracking-wide">
                    {user.role}
                  </span>
                </div>
                <Button onClick={logout} variant="outline">
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
