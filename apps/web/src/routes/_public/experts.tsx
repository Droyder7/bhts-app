import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Search,
  Star,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import z from "zod";
import Loader from "@/components/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { orpc } from "@/utils/orpc";

const expertsSearchSchema = z.object({
  category: z.string().optional(),
  searchKeyword: z.string().optional(),
  minYearsOfExperience: z.coerce.number().optional(),
  languages: z.array(z.enum(["hindi", "english"])).optional(),
});

type ExpertsSearch = z.infer<typeof expertsSearchSchema>;

export const Route = createFileRoute("/_public/experts")({
  validateSearch: (search): ExpertsSearch => expertsSearchSchema.parse(search),
  loaderDeps: ({
    search: { category, searchKeyword, minYearsOfExperience, languages },
  }) => ({
    category,
    searchKeyword,
    minYearsOfExperience,
    languages,
  }),
  loader: ({
    context: { queryClient },
    deps: { category, searchKeyword, minYearsOfExperience, languages },
  }) =>
    queryClient.ensureQueryData(
      orpc.expert.getAll.queryOptions({
        input: {
          categoryId: category,
          searchKeyword,
          minYearsOfExperience,
          languages,
        },
      }),
    ),
  component: RouteComponent,
});

function RouteComponent() {
  const { category, searchKeyword, minYearsOfExperience, languages } =
    Route.useSearch();
  const navigate = useNavigate();

  // Filter state
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    languages || [],
  );
  const [selectedExperience, setSelectedExperience] = useState<string>(
    minYearsOfExperience?.toString() || "",
  );
  const [searchInput, setSearchInput] = useState<string>(searchKeyword || "");

  const availableLanguages = ["hindi", "english"];
  const experienceOptions = [
    { value: "", label: "Any experience" },
    { value: "1", label: "1+ years" },
    { value: "2", label: "2+ years" },
    { value: "3", label: "3+ years" },
    { value: "5", label: "5+ years" },
    { value: "10", label: "10+ years" },
  ];

  const toggleLanguage = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((l) => l !== language)
        : [...prev, language],
    );
  };

  const applyFilters = () => {
    const searchParams: Record<string, any> = {};

    if (category) searchParams.category = category;
    if (searchInput.trim()) searchParams.searchKeyword = searchInput.trim();
    if (selectedLanguages.length > 0)
      searchParams.languages = selectedLanguages;
    if (selectedExperience)
      searchParams.minYearsOfExperience = Number.parseInt(
        selectedExperience,
        10,
      );

    navigate({
      to: "/experts",
      search: searchParams,
    });
  };
  const {
    data: expertsData,
    isLoading,
    error,
  } = useQuery(
    orpc.expert.getAll.queryOptions({
      input: {
        categoryId: category,
        searchKeyword,
        minYearsOfExperience,
        languages,
      },
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
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <div className="text-center">
          <h1 className="font-bold text-3xl">Experts</h1>
          <p className="mt-2 text-muted-foreground">
            Find and connect with verified experts ({experts.length} total)
          </p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Left Sidebar - Filters */}
        <div className="w-64 flex-shrink-0">
          <div className="sticky top-4">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search experts..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  className="h-8 pr-8 text-xs"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={applyFilters}
                  className="absolute top-0 right-0 h-8 w-8 p-0 hover:bg-transparent"
                >
                  <Search className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Card className="p-4">
              <h2 className="font-semibold">Filters</h2>

              {/* Language Filter */}
              <div>
                <Label className="mb-2 block font-medium text-muted-foreground text-xs">
                  LANGUAGES
                </Label>
                <div className="flex flex-wrap gap-1">
                  {availableLanguages.map((language) => (
                    <Badge
                      key={language}
                      variant={
                        selectedLanguages.includes(language)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer text-xs capitalize transition-colors hover:bg-primary hover:text-primary-foreground"
                      onClick={() => toggleLanguage(language)}
                    >
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Experience Filter */}
              <div>
                <Label className="mb-2 block font-medium text-muted-foreground text-xs">
                  EXPERIENCE
                </Label>
                <RadioGroup
                  value={selectedExperience}
                  onValueChange={setSelectedExperience}
                  className="space-y-2"
                >
                  {experienceOptions.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`exp-${option.value}`}
                        className="h-3 w-3"
                      />
                      <Label
                        htmlFor={`exp-${option.value}`}
                        className="cursor-pointer font-normal text-xs"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Apply Filters Button */}
              <Button
                onClick={applyFilters}
                size="sm"
                className="w-full text-xs"
              >
                Apply Filters
              </Button>
            </Card>
          </div>
        </div>

        {/* Right Content - Experts Grid */}
        <div className="flex-1">
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
                          <Badge
                            key={skill}
                            variant="outline"
                            className="text-xs"
                          >
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

                    {/* {expert.specializations &&
                  expert.specializations.length > 0 && (
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Specializations:</p>
                      <div className="flex flex-wrap gap-1">
                        {expert.specializations.slice(0, 2).map((spec) => (
                          <Badge key={spec.id} className="text-xs">
                            {spec.name}
                          </Badge>
                        ))}
                        {expert.specializations.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{expert.specializations.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )} */}

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
                Showing {experts.length} of {expertsData.pagination.total}{" "}
                experts
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
      </div>
    </div>
  );
}
