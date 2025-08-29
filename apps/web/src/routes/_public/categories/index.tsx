import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Loader from "@/components/loader";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/utils/orpc";
import CategoryImg from "../../../../public/assets/category-img.png";

export const Route = createFileRoute("/_public/categories/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(
      orpc.category.getAllRootCategories.queryOptions({ input: {} }),
    ),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const {
    data: categoriesData,
    isLoading,
    error,
  } = useQuery(
    orpc.category.getAllRootCategories.queryOptions({
      input: {},
    }),
  );

  const handleCategoryClick = (category: any) => {
    // Navigate to show categories with the same parent
    if (category.isPrimary) {
      // If it's a root category, show its children
      navigate({
        to: "/categories/$parentId",
        params: { parentId: category.id },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-bold text-3xl">Categories</h1>
          <p className="mt-2 text-muted-foreground">
            Explore all available categories
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
          <h1 className="font-bold text-3xl">Categories</h1>
          <p className="mt-2 text-muted-foreground">
            Explore all available categories
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="mb-2 text-destructive">Failed to load categories</p>
            <p className="text-muted-foreground text-sm">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const categories = categoriesData || [];

  return (
    <section className="bg-white">
      <div className="bg-[#016E69] py-20">
        <h1 className="container mx-auto font-bold text-6xl">
          Healthcare & Medicine
        </h1>
      </div>
      <div className="container mx-auto max-w-6xl px-4 py-17">
        <div className="flex flex-col items-center gap-4">
          <h2 className="font-bold text-4xl text-black">
            Healthcare & Medicine
          </h2>
          <p className="max-w-4xl text-center text-black text-lg">
            Experience personalized solutions designed to meet your unique
            needs. Our platform connects you with experts and resources that
            drive success.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">No categories found</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 py-17 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => handleCategoryClick(category)}
              >
                <img src={CategoryImg} alt="" />
                <CardHeader>
                  <CardTitle>
                    <span className="text-[#2D2D2D] text-xl">
                      {category.name}
                    </span>
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* {categoriesData?.pagination && (
        <div className="mt-8 flex items-center justify-center">
          <div className="text-muted-foreground text-sm">
            Showing {categories.length} of {categoriesData.pagination.total}{" "}
            categories
            {categoriesData.pagination.totalPages > 1 && (
              <span>
                {" "}
                (Page {categoriesData.pagination.page} of{" "}
                {categoriesData.pagination.totalPages})
              </span>
            )}
          </div>
        </div>
      )} */}
      </div>
    </section>
  );
}
