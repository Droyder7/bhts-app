import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const testimonials = pgTable("testimonials", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Rating: Assuming a 1-5 scale
  rating: integer("rating").notNull(),

  // User details
  userName: text("user_name").notNull(),
  userImage: text("user_image").notNull(), // store image URL or path

  // Message content
  message: text("message").notNull(),

  // Optional metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect; // Type for reading
export type NewTestimonial = typeof testimonials.$inferInsert; // Type for inserting
