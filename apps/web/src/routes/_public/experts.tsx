import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle, Star, XCircle } from "lucide-react";
import { useState } from "react";
import z from "zod";
import Loader from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FiltersSection } from "@/features/user/components/sections/filterSection";
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

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    languages || [],
  );
  const [selectedExperience, setSelectedExperience] = useState<string>(
    minYearsOfExperience?.toString() || "",
  );
  const [searchInput, setSearchInput] = useState<string>(searchKeyword || "");

  const experienceOptions = [
    { id: "exp-any", value: "", label: "Any experience" },
    { id: "exp-1", value: "1", label: "1+ years" },
    { id: "exp-2", value: "2", label: "2+ years" },
    { id: "exp-3", value: "3", label: "3+ years" },
    { id: "exp-5", value: "5", label: "5+ years" },
    { id: "exp-10", value: "10", label: "10+ years" },
  ];

  const availableLanguages = ["hindi", "english"];
  const [selectedDuration, setSelectedDuration] = useState("30 Minutes");

  const toggleLanguage = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((l) => l !== language)
        : [...prev, language],
    );
  };

  const toggleExperience = (exp: string) => {
    setSelectedExperience((prev) => (prev === exp ? "" : exp));
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

  const handleFavorite = (id: number) => {
    // Implement favorite functionality
    console.log(`Added expert ${id} to favorites`);
  };

  const handleShare = (id: number) => {
    // Implement share functionality
    console.log(`Sharing expert ${id}`);
  };

  const handleBookSession = (id: number) => {
    // Implement booking functionality
    console.log(`Booking session with expert ${id}`);
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
    <section className="bg-white">
      <div className="bg-[#016E69] py-20">
        <h1 className="container mx-auto font-bold text-6xl">Experts</h1>
      </div>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <h2 className="font-bold text-4xl text-black">
            Explore Cardiology Experts
          </h2>
          <p className="max-w-4xl text-center text-black text-lg">
            Experience personalized solutions designed to meet your unique
            needs. Our platform connects you with experts and resources that
            drive success.
          </p>
        </div>
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
            <FiltersSection
              searchQuery={searchInput}
              setSearchQuery={setSearchInput}
              languages={availableLanguages}
              selectedLanguages={selectedLanguages}
              toggleLanguage={toggleLanguage}
              experienceOptions={experienceOptions}
              selectedExperiences={
                selectedExperience ? [selectedExperience] : []
              } // ✅ adapt to array
              toggleExperience={toggleExperience}
              applyFilters={applyFilters}
            />
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
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                  {experts.map((expert) => (
                    <Card
                      key={expert.id}
                      className="flex flex-col items-start gap-3.5 rounded-xl border border-[#e3e3e3] border-solid bg-white px-[19px] py-4"
                    >
                      <img
                        width={478}
                        height={292}
                        className="h-auto w-full rounded-md object-cover"
                        alt={`${expert.firstName} ${expert.lastName} profile`}
                        src={expert.image}
                      />

                      <CardContent className="w-full p-0">
                        <div className="mt-3.5 flex w-full items-start gap-[30px]">
                          <div className="flex flex-grow flex-col items-start gap-[5px]">
                            <div className="h-7 w-full whitespace-nowrap font-bold text-black text-xl leading-[30px]">
                              {expert.firstName} {expert.lastName}
                            </div>

                            {expert.specializations?.length > 0 && (
                              <div className="inline-flex flex-wrap items-start gap-[3px]">
                                {expert.specializations
                                  .slice(0, 2)
                                  .map((spec) => (
                                    <Badge key={spec.id} className="text-xs">
                                      {spec.name}
                                    </Badge>
                                  ))}
                                {expert.specializations.length > 2 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    +{expert.specializations.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            )}

                            {expert.perHourRate && (
                              <div className="h-[51px] w-full font-normal text-sm leading-[normal]">
                                <span className="font-medium text-[#313131]">
                                  Starting from <br />
                                </span>
                                <span className="font-bold text-[#016d68] text-[22px]">
                                  ₹{expert.perHourRate}/hour
                                </span>
                              </div>
                            )}

                            <div className="flex h-[31.03px] w-full items-center gap-2">
                              <div className="inline-flex h-6 items-center gap-1">
                                <div className="w-fit font-normal text-[#6d6d6d] text-sm">
                                  {expert.position}
                                </div>
                              </div>

                              <img
                                width={1}
                                height={11}
                                className="object-cover"
                                alt="Line"
                                src="https://c.animaapp.com/mcknz73dMW2Mce/img/line-1.svg"
                              />

                              <div className="inline-flex h-6 items-center gap-1">
                                <div className="w-fit font-normal text-[#6d6d6d] text-sm">
                                  {expert.experience}
                                </div>
                              </div>
                            </div>

                            <div className="flex h-[43px] w-full flex-col items-start gap-3">
                              <Select
                                value={selectedDuration}
                                onValueChange={setSelectedDuration}
                              >
                                <SelectTrigger className="flex w-full rounded-md border border-[#d5ebea] bg-white px-[13px] py-[11.5px]">
                                  <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="15 Minutes">
                                    15 Minutes
                                  </SelectItem>
                                  <SelectItem value="30 Minutes">
                                    30 Minutes
                                  </SelectItem>
                                  <SelectItem value="45 Minutes">
                                    45 Minutes
                                  </SelectItem>
                                  <SelectItem value="60 Minutes">
                                    60 Minutes
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {expert.averageRating && (
                              <div className="relative flex h-8 w-full items-center">
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

                          <div className="ml-auto flex h-[39px] items-center gap-2.5">
                            <Button
                              onClick={() => handleFavorite(expert.id)}
                              className="h-[30px] w-[30px] cursor-pointer"
                            >
                              <img
                                width={30}
                                height={30}
                                alt="Heart"
                                src="https://c.animaapp.com/mcknz73dMW2Mce/img/heart.svg"
                              />
                            </Button>

                            <Button
                              onClick={() => handleShare(expert.id)}
                              className="cursor-pointer"
                            >
                              <img
                                width={30}
                                height={30}
                                alt="Share"
                                src="https://c.animaapp.com/mcknz73dMW2Mce/img/share.svg"
                              />
                            </Button>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleBookSession(expert.id)}
                          className="mt-3.5 flex h-11 w-full items-center justify-center rounded-md bg-[#016d68] px-8"
                        >
                          <span className="whitespace-nowrap text-center font-semibold text-base text-neutral-50">
                            Book a Session
                          </span>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

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
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
