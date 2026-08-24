import { sqliteTable, text, integer, real, uniqueIndex, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  bio: text("bio").default("").notNull(),
  reputation: integer("reputation").default(0).notNull(),
  role: text("role").default("user").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (t) => [
  uniqueIndex("users_username_idx").on(t.username),
  uniqueIndex("users_email_idx").on(t.email),
]);

export const passwordResetTokens = sqliteTable("password_reset_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  usedAt: integer("used_at", { mode: "timestamp" }),
}, (t) => [index("prt_token_idx").on(t.tokenHash)]);

export const proposals = sqliteTable("proposals", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  problem: text("problem").notNull(),
  description: text("description").default("").notNull(),
  experience: text("experience").default("").notNull(),
  solution: text("solution").default("").notNull(),
  category: text("category").notNull(),
  sector: text("sector").notNull(),
  city: text("city"),
  country: text("country"),
  authorId: text("author_id").references(() => users.id).notNull(),
  viewsCount: integer("views_count").default(0).notNull(),
  status: text("status").default("published").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (t) => [
  uniqueIndex("proposals_slug_idx").on(t.slug),
  index("proposals_category_idx").on(t.category),
  index("proposals_sector_idx").on(t.sector),
]);

export const votes = sqliteTable("votes", {
  id: text("id").primaryKey(),
  proposalId: text("proposal_id").references(() => proposals.id).notNull(),
  userId: text("user_id").references(() => users.id).notNull(),
  kind: text("kind").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (t) => [
  uniqueIndex("votes_unique_idx").on(t.proposalId, t.userId, t.kind),
  index("votes_proposal_idx").on(t.proposalId),
]);

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  proposalId: text("proposal_id").references(() => proposals.id).notNull(),
  userId: text("user_id").references(() => users.id).notNull(),
  parentId: text("parent_id"),
  kind: text("kind").notNull(),
  body: text("body").notNull(),
  status: text("status").default("published").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (t) => [index("comments_proposal_idx").on(t.proposalId)]);

export const snapshots = sqliteTable("snapshots", {
  id: text("id").primaryKey(),
  proposalId: text("proposal_id").references(() => proposals.id).notNull(),
  day: text("day").notNull(),
  score: real("score").notNull(),
  participants: integer("participants").notNull(),
}, (t) => [index("snapshots_proposal_idx").on(t.proposalId)]);

export const sources = sqliteTable("sources", {
  id: text("id").primaryKey(),
  proposalId: text("proposal_id").references(() => proposals.id).notNull(),
  url: text("url").notNull(),
  label: text("label").default("").notNull(),
});

export const moderationLog = sqliteTable("moderation_log", {
  id: text("id").primaryKey(),
  adminId: text("admin_id"),
  action: text("action").notNull(),
  proposalId: text("proposal_id"),
  commentId: text("comment_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  proposalId: text("proposal_id").references(() => proposals.id),
  commentId: text("comment_id").references(() => comments.id),
  userId: text("user_id").references(() => users.id).notNull(),
  reason: text("reason").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
