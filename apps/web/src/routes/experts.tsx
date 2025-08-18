import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Star,
  XCircle,
} from "lucide-react";
import Loader from "@/components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/experts")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(orpc.expert.getAll.queryOptions({ input: {} })),
  component: RouteComponent,
});

function RouteComponent() {
  const {
    data: expertsData,
    isLoading,
    error,
  } = useQuery(
    orpc.expert.getAll.queryOptions({
      input: {},
    }),
  );

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-bold text-3xl">Experts</h1>
          <p className="mt-2 text-muted-foreground">
            Find and connect with verified experts
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-bold text-3xl">Experts</h1>
          <p className="mt-2 text-muted-foreground">
            Find and connect with verified experts
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="mb-2 text-destructive">Failed to load experts</p>
            <p className="text-muted-foreground text-sm">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const experts = expertsData?.experts || [];

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Experts</h1>
        <p className="mt-2 text-muted-foreground">
          Find and connect with verified experts ({experts.length} total)
        </p>
      </div>

      {experts.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">No experts found</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {experts.map((expert) => (
            <Card
              key={expert.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={expert.user?.image || undefined}
                        alt={`${expert.firstName} ${expert.lastName}`}
                      />
                      <AvatarFallback>
                        {expert.firstName?.[0]}
                        {expert.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate text-lg">
                        {expert.firstName} {expert.lastName}
                      </CardTitle>
                      <div className="mt-1 flex items-center gap-1">
                        {getVerificationIcon(expert.verificationStatus)}
                        <span className="text-muted-foreground text-sm capitalize">
                          {expert.verificationStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={getStatusColor(expert.accountStatus)}
                  >
                    {expert.accountStatus}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {expert.bio && (
                  <CardDescription className="line-clamp-2">
                    {expert.bio}
                  </CardDescription>
                )}

                {(expert.city || expert.state) && (
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {expert.city}
                      {expert.city && expert.state && ", "}
                      {expert.state}
                    </span>
                  </div>
                )}

                {expert.skills && expert.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {expert.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {expert.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{expert.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  {expert.averageRating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {expert.averageRating}
                      </span>
                      <span className="text-muted-foreground">
                        ({expert.totalSessions || 0} sessions)
                      </span>
                    </div>
                  )}
                </div>

                {expert.perHourRate && (
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      ₹{expert.perHourRate}/hour
                    </span>
                  </div>
                )}

                {expert.specializations &&
                  expert.specializations.length > 0 && (
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Specializations:</p>
                      <div className="flex flex-wrap gap-1">
                        {expert.specializations.slice(0, 2).map((spec) => (
                          <Badge
                            key={spec.id}
                            variant={spec.isPrimary ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {spec.category.name}
                            {spec.isPrimary && " (Primary)"}
                          </Badge>
                        ))}
                        {expert.specializations.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{expert.specializations.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                {expert.languages && expert.languages.length > 0 && (
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <span>Languages:</span>
                    <span className="capitalize">
                      {expert.languages.join(", ")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {expertsData?.pagination && (
        <div className="mt-8 flex items-center justify-center">
          <div className="text-muted-foreground text-sm">
            Showing {experts.length} of {expertsData.pagination.total} experts
            {expertsData.pagination.totalPages > 1 && (
              <span>
                {" "}
                (Page {expertsData.pagination.page} of{" "}
                {expertsData.pagination.totalPages})
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
