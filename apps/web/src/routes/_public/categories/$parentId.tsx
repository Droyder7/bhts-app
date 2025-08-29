import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/utils/orpc";
import CategoryImg from "../../../../public/assets/category-img.png";

export const Route = createFileRoute("/_public/categories/$parentId")({
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(
      orpc.category.getAllByParent.queryOptions({
        input: { parentId: params.parentId },
      }),
    ),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { parentId } = Route.useParams();
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery(
    orpc.category.getAllByParent.queryOptions({
      input: { parentId },
    }),
  );

  // Get parent category info for the header
  const { data: parentCategory, isLoading: isParentLoading } = useQuery(
    orpc.category.getById.queryOptions({
      input: { id: parentId },
    }),
  );

  if (isLoading || isParentLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>
          </Button>
          <h1 className="font-bold text-3xl">Loading...</h1>
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
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>
          </Button>
          <h1 className="font-bold text-3xl">Error</h1>
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

  const categoryList = categories || [];
  const parentName = parentCategory?.name || "Unknown Category";

  return (
    <section className="bg-white">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4 text-black">
            <Link to="/categories">
              <ArrowLeft className="mr-2 h-4 w-4 text-black" />
              Back to Categories
            </Link>
          </Button>
          <h1 className="font-bold text-3xl text-black">
            Categories under "{parentName}"
          </h1>
          <p className="mt-2 text-muted-foreground">
            {categoryList.length} subcategories found
          </p>
        </div>

        {categoryList.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">
                No subcategories found for this category
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categoryList.map((category) => (
              <Card
                key={category.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => {
                  // If this category has a parent, navigate to show its siblings
                  navigate({
                    to: "/experts",
                    search: { category: category.id },
                  });
                }}
              >
                <img src={CategoryImg} alt="category-img" />
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
      </div>
    </section>
  );
}
