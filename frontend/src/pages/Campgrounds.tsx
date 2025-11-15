import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone } from "lucide-react";
import Header from "@/components/Header";
import { fetchCampgrounds } from "@/services/campgrounds";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Campgrounds = () => {
  const { data: campgrounds, isLoading, isError, error } = useQuery({
    queryKey: ["campgrounds"],
    queryFn: fetchCampgrounds,
  });

  const getImage = (province: string) =>
    `https://source.unsplash.com/featured/600x400/?camping,${encodeURIComponent(province)}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Available Campgrounds</h1>
          <p className="text-muted-foreground">Choose your perfect camping destination</p>
        </div>

        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <Spinner label="Loading campgrounds" />
          </div>
        )}

        {isError && (
          <Alert variant="destructive" className="mb-8">
            <AlertTitle>Unable to load campgrounds</AlertTitle>
            <AlertDescription>{error instanceof Error ? error.message : "Unknown error"}</AlertDescription>
          </Alert>
        )}

        {campgrounds && campgrounds.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campgrounds.map((campground) => (
              <Card key={campground._id} className="overflow-hidden animate-fade-in">
                <img
                  src={getImage(campground.province)}
                  alt={campground.name}
                  className="h-48 w-full object-cover"
                />
                <CardHeader>
                  <CardTitle>{campground.name}</CardTitle>
                  <CardDescription className="capitalize">
                    {campground.district}, {campground.province} ({campground.region} region)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                      {campground.address}, {campground.district}, {campground.province} {campground.postalcode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{campground.tel || "Contact info unavailable"}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link to={`/book/${campground._id}`}>Book Now</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
        {campgrounds && campgrounds.length === 0 && !isLoading && !isError && (
          <Alert className="mt-8">
            <AlertTitle>No campgrounds found</AlertTitle>
            <AlertDescription>
              The backend does not have any campgrounds yet. Please seed the database to start booking.
            </AlertDescription>
          </Alert>
        )}
    </div>
  );
};

export default Campgrounds;
