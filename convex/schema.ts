import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// Extend users table with isAdmin field
const usersTable = defineTable({
  name: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  image: v.optional(v.string()),
  emailVerificationTime: v.optional(v.number()),
  phoneVerificationTime: v.optional(v.number()),
  isAnonymous: v.optional(v.boolean()),
  isAdmin: v.optional(v.boolean()),
}).index("by_email", ["email"]);

const applicationTables = {
  announcements: defineTable({
    title: v.string(),
    content: v.string(),
    date: v.number(),
    important: v.optional(v.boolean()),
    imageId: v.optional(v.id("_storage")),
  })
    .index("by_date", ["date"])
    .searchIndex("search_title", { searchField: "title" })
    .searchIndex("search_content", { searchField: "content" }),
  
  events: defineTable({
    title: v.string(),
    description: v.string(),
    date: v.number(),
    venue: v.string(),
    imageId: v.optional(v.id("_storage")),
  })
    .index("by_date", ["date"])
    .searchIndex("search_title", { searchField: "title" })
    .searchIndex("search_description", { searchField: "description" }),

  facilities: defineTable({
    name: v.string(),
    description: v.string(),
    imageId: v.optional(v.id("_storage")),
  }),

  achievements: defineTable({
    title: v.string(),
    description: v.string(),
    date: v.number(),
    imageId: v.optional(v.id("_storage")),
  }).index("by_date", ["date"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
  users: usersTable,
});
