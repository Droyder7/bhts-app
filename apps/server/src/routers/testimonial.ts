import { desc } from "drizzle-orm";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { Procedures } from "../lib/orpc";

export const testimonialRouter = {
  getAllTestimonial: Procedures.public.handler(async () => {
    const allTestimonials = await db.query.testimonials.findMany({
      where: undefined, // No specific filter for now
      orderBy: desc(testimonials.createdAt),
      limit: 5,
    });

    return allTestimonials;
  }),
};

export type TestimonialRouter = typeof testimonialRouter;
