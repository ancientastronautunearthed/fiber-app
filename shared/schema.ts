import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  numeric,
  date,
  time
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Additional Morgellons-specific fields
  height: numeric("height"), // in inches
  weight: numeric("weight"), // in pounds
  age: integer("age"),
  gender: varchar("gender"),
  city: varchar("city"),
  state: varchar("state"),
  diagnosisStatus: varchar("diagnosis_status"), // 'diagnosed' or 'suspect'
  misdiagnoses: text("misdiagnoses"),
  points: integer("points").default(0),
});

// Morgellons Monster table
export const monsters = pgTable("monsters", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  imageUrl: varchar("image_url"),
  descriptiveWords: jsonb("descriptive_words"), // array of 5 words
  health: integer("health").default(100),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  tombedAt: timestamp("tombed_at"),
});

// Daily Food Logs
export const foodLogs = pgTable("food_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: date("date").notNull(),
  mealType: varchar("meal_type").notNull(), // breakfast, lunch, dinner, snack
  foodItems: text("food_items").notNull(),
  calories: numeric("calories"),
  protein: numeric("protein"),
  carbs: numeric("carbs"),
  fat: numeric("fat"),
  sugar: numeric("sugar"),
  aiAnalysis: text("ai_analysis"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily Symptom Logs
export const symptomLogs = pgTable("symptom_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: date("date").notNull(),
  timeOfDay: varchar("time_of_day").notNull(), // morning, afternoon, evening
  symptoms: jsonb("symptoms"), // array of symptom objects with severity
  customSymptoms: text("custom_symptoms"),
  mood: integer("mood"), // 1-10 scale
  overallFeeling: integer("overall_feeling"), // 1-10 scale
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sleep Logs
export const sleepLogs = pgTable("sleep_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: date("date").notNull(),
  bedTime: time("bed_time"),
  wakeTime: time("wake_time"),
  hoursSlept: numeric("hours_slept"),
  quality: integer("quality"), // 1-10 scale
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sun Exposure Logs
export const sunExposureLogs = pgTable("sun_exposure_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: date("date").notNull(),
  duration: integer("duration"), // minutes
  timeOfDay: varchar("time_of_day"),
  location: varchar("location"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Supplement Logs
export const supplementLogs = pgTable("supplement_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: date("date").notNull(),
  supplementName: varchar("supplement_name").notNull(),
  dosage: varchar("dosage"),
  frequency: varchar("frequency"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medication Logs
export const medicationLogs = pgTable("medication_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: date("date").notNull(),
  medicationName: varchar("medication_name").notNull(),
  dosage: varchar("dosage"),
  frequency: varchar("frequency"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily Riddles
export const dailyRiddles = pgTable("daily_riddles", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  question: text("question").notNull(),
  options: jsonb("options").notNull(), // array of options
  correctAnswer: integer("correct_answer").notNull(),
  explanation: text("explanation"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Riddle Answers
export const riddleAnswers = pgTable("riddle_answers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  riddleId: integer("riddle_id").references(() => dailyRiddles.id).notNull(),
  answer: integer("answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  pointsEarned: integer("points_earned").default(0),
  answeredAt: timestamp("answered_at").defaultNow(),
});

// Community Posts
export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category").notNull(), // success_story, question, tip, etc.
  isAnonymous: boolean("is_anonymous").default(false),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Community Post Replies
export const postReplies = pgTable("post_replies", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => communityPosts.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isAnonymous: boolean("is_anonymous").default(false),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Activity Logs
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  action: varchar("action").notNull(),
  description: text("description"),
  pointsEarned: integer("points_earned").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas for validation
export const upsertUserSchema = createInsertSchema(users);
export const insertMonsterSchema = createInsertSchema(monsters).omit({ id: true, createdAt: true });
export const insertFoodLogSchema = createInsertSchema(foodLogs).omit({ id: true, createdAt: true });
export const insertSymptomLogSchema = createInsertSchema(symptomLogs).omit({ id: true, createdAt: true });
export const insertSleepLogSchema = createInsertSchema(sleepLogs).omit({ id: true, createdAt: true });
export const insertSunExposureLogSchema = createInsertSchema(sunExposureLogs).omit({ id: true, createdAt: true });
export const insertSupplementLogSchema = createInsertSchema(supplementLogs).omit({ id: true, createdAt: true });
export const insertMedicationLogSchema = createInsertSchema(medicationLogs).omit({ id: true, createdAt: true });
export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPostReplySchema = createInsertSchema(postReplies).omit({ id: true, createdAt: true });
export const insertRiddleAnswerSchema = createInsertSchema(riddleAnswers).omit({ id: true, answeredAt: true });

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMonster = z.infer<typeof insertMonsterSchema>;
export type Monster = typeof monsters.$inferSelect;
export type InsertFoodLog = z.infer<typeof insertFoodLogSchema>;
export type FoodLog = typeof foodLogs.$inferSelect;
export type InsertSymptomLog = z.infer<typeof insertSymptomLogSchema>;
export type SymptomLog = typeof symptomLogs.$inferSelect;
export type InsertSleepLog = z.infer<typeof insertSleepLogSchema>;
export type SleepLog = typeof sleepLogs.$inferSelect;
export type InsertSunExposureLog = z.infer<typeof insertSunExposureLogSchema>;
export type SunExposureLog = typeof sunExposureLogs.$inferSelect;
export type InsertSupplementLog = z.infer<typeof insertSupplementLogSchema>;
export type SupplementLog = typeof supplementLogs.$inferSelect;
export type InsertMedicationLog = z.infer<typeof insertMedicationLogSchema>;
export type MedicationLog = typeof medicationLogs.$inferSelect;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertPostReply = z.infer<typeof insertPostReplySchema>;
export type PostReply = typeof postReplies.$inferSelect;
export type InsertRiddleAnswer = z.infer<typeof insertRiddleAnswerSchema>;
export type RiddleAnswer = typeof riddleAnswers.$inferSelect;
export type DailyRiddle = typeof dailyRiddles.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
