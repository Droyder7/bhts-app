import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Loader from "@/components/loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { orpc } from "@/utils/orpc";

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
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Categories</h1>
        <p className="mt-2 text-muted-foreground">
          Explore all available categories ({categories.length} total)
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">No categories found</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => handleCategoryClick(category)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{category.name}</span>
                  {category.isPrimary && (
                    <span className="rounded-full bg-primary px-2 py-1 font-medium text-primary-foreground text-xs">
                      Primary
                    </span>
                  )}
                </CardTitle>
                {category.description && (
                  <CardDescription className="line-clamp-2">
                    {category.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span
                      className={`inline-flex items-center gap-1 font-medium ${
                        category.isActive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          category.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </CardContent>
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
  );
}
