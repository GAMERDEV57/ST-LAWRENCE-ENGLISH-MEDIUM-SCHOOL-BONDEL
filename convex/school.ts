import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Admin check helper
async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  // Consider user not admin if not explicitly set to true
  if (!user || user.isAdmin !== true) throw new Error("Not authorized");
  return user;
}

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const setAdmin = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // For the first admin, allow setting if no admin exists
    const anyAdmin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isAdmin"), true))
      .unique();
    
    // If there's no admin yet, check if this is the admin@school.in account
    if (!anyAdmin && args.email === "admin@school.in") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .unique();
      if (user) {
        await ctx.db.patch(user._id, { isAdmin: true });
        return;
      }
    }

    // Otherwise require admin access
    await requireAdmin(ctx);
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { isAdmin: true });
  },
});

export const listAnnouncements = query({
  args: {},
  handler: async (ctx) => {
    const announcements = await ctx.db
      .query("announcements")
      .withIndex("by_date")
      .order("desc")
      .take(5);

    return Promise.all(
      announcements.map(async (announcement) => ({
        ...announcement,
        imageUrl: announcement.imageId ? await ctx.storage.getUrl(announcement.imageId) : null,
      }))
    );
  },
});

export const listEvents = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_date")
      .order("desc")
      .take(3);

    return Promise.all(
      events.map(async (event) => ({
        ...event,
        imageUrl: event.imageId ? await ctx.storage.getUrl(event.imageId) : null,
      }))
    );
  },
});

export const listFacilities = query({
  args: {},
  handler: async (ctx) => {
    const facilities = await ctx.db.query("facilities").collect();
    return Promise.all(
      facilities.map(async (facility) => ({
        ...facility,
        imageUrl: facility.imageId ? await ctx.storage.getUrl(facility.imageId) : null,
      }))
    );
  },
});

export const listAchievements = query({
  args: {},
  handler: async (ctx) => {
    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_date")
      .order("desc")
      .take(4);

    return Promise.all(
      achievements.map(async (achievement) => ({
        ...achievement,
        imageUrl: achievement.imageId ? await ctx.storage.getUrl(achievement.imageId) : null,
      }))
    );
  },
});

export const addAnnouncement = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    important: v.optional(v.boolean()),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.insert("announcements", {
      ...args,
      date: Date.now(),
    });
  },
});

export const addEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    venue: v.string(),
    date: v.number(),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.insert("events", args);
  },
});

export const addFacility = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.insert("facilities", args);
  },
});

export const addAchievement = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.insert("achievements", {
      ...args,
      date: Date.now(),
    });
  },
});

export const deleteAnnouncement = mutation({
  args: { id: v.id("announcements") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const announcement = await ctx.db.get(args.id);
    if (announcement?.imageId) {
      await ctx.storage.delete(announcement.imageId);
    }
    await ctx.db.delete(args.id);
  },
});

export const deleteEvent = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const event = await ctx.db.get(args.id);
    if (event?.imageId) {
      await ctx.storage.delete(event.imageId);
    }
    await ctx.db.delete(args.id);
  },
});

export const deleteFacility = mutation({
  args: { id: v.id("facilities") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const facility = await ctx.db.get(args.id);
    if (facility?.imageId) {
      await ctx.storage.delete(facility.imageId);
    }
    await ctx.db.delete(args.id);
  },
});

export const deleteAchievement = mutation({
  args: { id: v.id("achievements") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const achievement = await ctx.db.get(args.id);
    if (achievement?.imageId) {
      await ctx.storage.delete(achievement.imageId);
    }
    await ctx.db.delete(args.id);
  },
});

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const user = await ctx.db.get(userId);
    // Consider user not admin if not explicitly set to true
    return user?.isAdmin === true;
  },
});

// New search functions
export const searchAnnouncements = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const titleResults = await ctx.db
      .query("announcements")
      .withSearchIndex("search_title", (q) => q.search("title", args.query))
      .take(5);

    const contentResults = await ctx.db
      .query("announcements")
      .withSearchIndex("search_content", (q) => q.search("content", args.query))
      .take(5);

    // Combine and deduplicate results
    const seen = new Set();
    const allResults = [...titleResults, ...contentResults].filter(item => {
      if (seen.has(item._id.toString())) return false;
      seen.add(item._id.toString());
      return true;
    });

    return Promise.all(
      allResults.map(async (announcement) => ({
        ...announcement,
        imageUrl: announcement.imageId ? await ctx.storage.getUrl(announcement.imageId) : null,
      }))
    );
  },
});

export const searchEvents = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const titleResults = await ctx.db
      .query("events")
      .withSearchIndex("search_title", (q) => q.search("title", args.query))
      .take(5);

    const descriptionResults = await ctx.db
      .query("events")
      .withSearchIndex("search_description", (q) => q.search("description", args.query))
      .take(5);

    // Combine and deduplicate results
    const seen = new Set();
    const allResults = [...titleResults, ...descriptionResults].filter(item => {
      if (seen.has(item._id.toString())) return false;
      seen.add(item._id.toString());
      return true;
    });

    return Promise.all(
      allResults.map(async (event) => ({
        ...event,
        imageUrl: event.imageId ? await ctx.storage.getUrl(event.imageId) : null,
      }))
    );
  },
});

// Edit functions
export const editAnnouncement = mutation({
  args: {
    id: v.id("announcements"),
    title: v.string(),
    content: v.string(),
    important: v.optional(v.boolean()),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const editEvent = mutation({
  args: {
    id: v.id("events"),
    title: v.string(),
    description: v.string(),
    venue: v.string(),
    date: v.number(),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const editFacility = mutation({
  args: {
    id: v.id("facilities"),
    name: v.string(),
    description: v.string(),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const editAchievement = mutation({
  args: {
    id: v.id("achievements"),
    title: v.string(),
    description: v.string(),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});
