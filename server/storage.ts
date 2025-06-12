import {
  users,
  monsters,
  foodLogs,
  symptomLogs,
  sleepLogs,
  sunExposureLogs,
  supplementLogs,
  medicationLogs,
  communityPosts,
  postReplies,
  dailyRiddles,
  riddleAnswers,
  activityLogs,
  type User,
  type UpsertUser,
  type Monster,
  type InsertMonster,
  type FoodLog,
  type InsertFoodLog,
  type SymptomLog,
  type InsertSymptomLog,
  type SleepLog,
  type InsertSleepLog,
  type SunExposureLog,
  type InsertSunExposureLog,
  type SupplementLog,
  type InsertSupplementLog,
  type MedicationLog,
  type InsertMedicationLog,
  type CommunityPost,
  type InsertCommunityPost,
  type PostReply,
  type InsertPostReply,
  type DailyRiddle,
  type RiddleAnswer,
  type InsertRiddleAnswer,
  type ActivityLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, profile: Partial<User>): Promise<User>;
  updateUserPoints(id: string, points: number): Promise<void>;
  
  // Monster operations
  createMonster(monster: InsertMonster): Promise<Monster>;
  getUserActiveMonster(userId: string): Promise<Monster | undefined>;
  updateMonsterHealth(monsterId: number, health: number): Promise<void>;
  tombMonster(monsterId: number): Promise<void>;
  
  // Food logging
  createFoodLog(foodLog: InsertFoodLog): Promise<FoodLog>;
  getUserFoodLogs(userId: string, date?: string): Promise<FoodLog[]>;
  
  // Symptom logging
  createSymptomLog(symptomLog: InsertSymptomLog): Promise<SymptomLog>;
  getUserSymptomLogs(userId: string, date?: string): Promise<SymptomLog[]>;
  
  // Sleep logging
  createSleepLog(sleepLog: InsertSleepLog): Promise<SleepLog>;
  getUserSleepLogs(userId: string, date?: string): Promise<SleepLog[]>;
  
  // Sun exposure logging
  createSunExposureLog(sunLog: InsertSunExposureLog): Promise<SunExposureLog>;
  getUserSunExposureLogs(userId: string, date?: string): Promise<SunExposureLog[]>;
  
  // Supplement logging
  createSupplementLog(supplementLog: InsertSupplementLog): Promise<SupplementLog>;
  getUserSupplementLogs(userId: string, date?: string): Promise<SupplementLog[]>;
  
  // Medication logging
  createMedicationLog(medicationLog: InsertMedicationLog): Promise<MedicationLog>;
  getUserMedicationLogs(userId: string, date?: string): Promise<MedicationLog[]>;
  
  // Community operations
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  getCommunityPosts(limit?: number, offset?: number): Promise<CommunityPost[]>;
  getCommunityPost(id: number): Promise<CommunityPost | undefined>;
  createPostReply(reply: InsertPostReply): Promise<PostReply>;
  getPostReplies(postId: number): Promise<PostReply[]>;
  
  // Riddles
  getTodaysRiddle(): Promise<DailyRiddle | undefined>;
  submitRiddleAnswer(answer: InsertRiddleAnswer): Promise<RiddleAnswer>;
  getUserRiddleAnswer(userId: string, riddleId: number): Promise<RiddleAnswer | undefined>;
  
  // Activity logging
  logActivity(userId: string, action: string, description: string, pointsEarned?: number): Promise<ActivityLog>;
  getUserActivities(userId: string, limit?: number): Promise<ActivityLog[]>;
  
  // Dashboard data
  getUserDashboardData(userId: string): Promise<{
    completedTasks: string[];
    totalTasks: number;
    weeklyProgress: {
      loggingStreak: number;
      monsterHealthAvg: number;
      pointsEarned: number;
    };
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, profile: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPoints(id: string, points: number): Promise<void> {
    await db
      .update(users)
      .set({ points: sql`${users.points} + ${points}` })
      .where(eq(users.id, id));
  }

  // Monster operations
  async createMonster(monster: InsertMonster): Promise<Monster> {
    const [newMonster] = await db
      .insert(monsters)
      .values(monster)
      .returning();
    return newMonster;
  }

  async getUserActiveMonster(userId: string): Promise<Monster | undefined> {
    const [monster] = await db
      .select()
      .from(monsters)
      .where(and(eq(monsters.userId, userId), eq(monsters.isActive, true)))
      .orderBy(desc(monsters.createdAt));
    return monster;
  }

  async updateMonsterHealth(monsterId: number, health: number): Promise<void> {
    await db
      .update(monsters)
      .set({ health })
      .where(eq(monsters.id, monsterId));
  }

  async tombMonster(monsterId: number): Promise<void> {
    await db
      .update(monsters)
      .set({ isActive: false, tombedAt: new Date() })
      .where(eq(monsters.id, monsterId));
  }

  // Food logging
  async createFoodLog(foodLog: InsertFoodLog): Promise<FoodLog> {
    const [newFoodLog] = await db
      .insert(foodLogs)
      .values(foodLog)
      .returning();
    return newFoodLog;
  }

  async getUserFoodLogs(userId: string, date?: string): Promise<FoodLog[]> {
    const query = db.select().from(foodLogs).where(eq(foodLogs.userId, userId));
    
    if (date) {
      query.where(and(eq(foodLogs.userId, userId), eq(foodLogs.date, date)));
    }
    
    return await query.orderBy(desc(foodLogs.createdAt));
  }

  // Symptom logging
  async createSymptomLog(symptomLog: InsertSymptomLog): Promise<SymptomLog> {
    const [newSymptomLog] = await db
      .insert(symptomLogs)
      .values(symptomLog)
      .returning();
    return newSymptomLog;
  }

  async getUserSymptomLogs(userId: string, date?: string): Promise<SymptomLog[]> {
    const query = db.select().from(symptomLogs).where(eq(symptomLogs.userId, userId));
    
    if (date) {
      query.where(and(eq(symptomLogs.userId, userId), eq(symptomLogs.date, date)));
    }
    
    return await query.orderBy(desc(symptomLogs.createdAt));
  }

  // Sleep logging
  async createSleepLog(sleepLog: InsertSleepLog): Promise<SleepLog> {
    const [newSleepLog] = await db
      .insert(sleepLogs)
      .values(sleepLog)
      .returning();
    return newSleepLog;
  }

  async getUserSleepLogs(userId: string, date?: string): Promise<SleepLog[]> {
    const query = db.select().from(sleepLogs).where(eq(sleepLogs.userId, userId));
    
    if (date) {
      query.where(and(eq(sleepLogs.userId, userId), eq(sleepLogs.date, date)));
    }
    
    return await query.orderBy(desc(sleepLogs.createdAt));
  }

  // Sun exposure logging
  async createSunExposureLog(sunLog: InsertSunExposureLog): Promise<SunExposureLog> {
    const [newSunLog] = await db
      .insert(sunExposureLogs)
      .values(sunLog)
      .returning();
    return newSunLog;
  }

  async getUserSunExposureLogs(userId: string, date?: string): Promise<SunExposureLog[]> {
    const query = db.select().from(sunExposureLogs).where(eq(sunExposureLogs.userId, userId));
    
    if (date) {
      query.where(and(eq(sunExposureLogs.userId, userId), eq(sunExposureLogs.date, date)));
    }
    
    return await query.orderBy(desc(sunExposureLogs.createdAt));
  }

  // Supplement logging
  async createSupplementLog(supplementLog: InsertSupplementLog): Promise<SupplementLog> {
    const [newSupplementLog] = await db
      .insert(supplementLogs)
      .values(supplementLog)
      .returning();
    return newSupplementLog;
  }

  async getUserSupplementLogs(userId: string, date?: string): Promise<SupplementLog[]> {
    const query = db.select().from(supplementLogs).where(eq(supplementLogs.userId, userId));
    
    if (date) {
      query.where(and(eq(supplementLogs.userId, userId), eq(supplementLogs.date, date)));
    }
    
    return await query.orderBy(desc(supplementLogs.createdAt));
  }

  // Medication logging
  async createMedicationLog(medicationLog: InsertMedicationLog): Promise<MedicationLog> {
    const [newMedicationLog] = await db
      .insert(medicationLogs)
      .values(medicationLog)
      .returning();
    return newMedicationLog;
  }

  async getUserMedicationLogs(userId: string, date?: string): Promise<MedicationLog[]> {
    const query = db.select().from(medicationLogs).where(eq(medicationLogs.userId, userId));
    
    if (date) {
      query.where(and(eq(medicationLogs.userId, userId), eq(medicationLogs.date, date)));
    }
    
    return await query.orderBy(desc(medicationLogs.createdAt));
  }

  // Community operations
  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const [newPost] = await db
      .insert(communityPosts)
      .values(post)
      .returning();
    return newPost;
  }

  async getCommunityPosts(limit = 50, offset = 0): Promise<CommunityPost[]> {
    return await db
      .select()
      .from(communityPosts)
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getCommunityPost(id: number): Promise<CommunityPost | undefined> {
    const [post] = await db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.id, id));
    return post;
  }

  async createPostReply(reply: InsertPostReply): Promise<PostReply> {
    const [newReply] = await db
      .insert(postReplies)
      .values(reply)
      .returning();
    return newReply;
  }

  async getPostReplies(postId: number): Promise<PostReply[]> {
    return await db
      .select()
      .from(postReplies)
      .where(eq(postReplies.postId, postId))
      .orderBy(desc(postReplies.createdAt));
  }

  // Riddles
  async getTodaysRiddle(): Promise<DailyRiddle | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const [riddle] = await db
      .select()
      .from(dailyRiddles)
      .where(eq(dailyRiddles.date, today));
    return riddle;
  }

  async submitRiddleAnswer(answer: InsertRiddleAnswer): Promise<RiddleAnswer> {
    const [newAnswer] = await db
      .insert(riddleAnswers)
      .values(answer)
      .returning();
    return newAnswer;
  }

  async getUserRiddleAnswer(userId: string, riddleId: number): Promise<RiddleAnswer | undefined> {
    const [answer] = await db
      .select()
      .from(riddleAnswers)
      .where(and(eq(riddleAnswers.userId, userId), eq(riddleAnswers.riddleId, riddleId)));
    return answer;
  }

  // Activity logging
  async logActivity(userId: string, action: string, description: string, pointsEarned = 0): Promise<ActivityLog> {
    const [activity] = await db
      .insert(activityLogs)
      .values({
        userId,
        action,
        description,
        pointsEarned,
      })
      .returning();
    
    // Update user points if any earned
    if (pointsEarned > 0) {
      await this.updateUserPoints(userId, pointsEarned);
    }
    
    return activity;
  }

  async getUserActivities(userId: string, limit = 10): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }

  // Dashboard data
  async getUserDashboardData(userId: string): Promise<{
    completedTasks: string[];
    totalTasks: number;
    weeklyProgress: {
      loggingStreak: number;
      monsterHealthAvg: number;
      pointsEarned: number;
    };
  }> {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Check completed tasks for today
    const completedTasks: string[] = [];
    
    // Check if user has logged food today
    const [todayFoodLog] = await db
      .select()
      .from(foodLogs)
      .where(and(eq(foodLogs.userId, userId), eq(foodLogs.date, today)))
      .limit(1);
    if (todayFoodLog) completedTasks.push('food_log');
    
    // Check if user has logged symptoms today
    const [todaysSymptomLog] = await db
      .select()
      .from(symptomLogs)
      .where(and(eq(symptomLogs.userId, userId), eq(symptomLogs.date, today)))
      .limit(1);
    if (todaysSymptomLog) completedTasks.push('symptom_log');
    
    // Check if user has logged sleep
    const [todaySleepLog] = await db
      .select()
      .from(sleepLogs)
      .where(and(eq(sleepLogs.userId, userId), eq(sleepLogs.date, today)))
      .limit(1);
    if (todaySleepLog) completedTasks.push('sleep_log');
    
    // Check if user answered today's riddle
    const todaysRiddle = await this.getTodaysRiddle();
    if (todaysRiddle) {
      const userAnswer = await this.getUserRiddleAnswer(userId, todaysRiddle.id);
      if (userAnswer) completedTasks.push('riddle_answer');
    }
    
    // Get weekly activities for points calculation
    const weeklyActivities = await db
      .select()
      .from(activityLogs)
      .where(and(eq(activityLogs.userId, userId), gte(activityLogs.createdAt, new Date(weekAgo))))
      .orderBy(desc(activityLogs.createdAt));
    
    const pointsEarned = weeklyActivities.reduce((sum, activity) => sum + (activity.pointsEarned || 0), 0);
    
    // Calculate logging streak (simplified - count consecutive days with any activity)
    const loggingStreak = Math.min(weeklyActivities.length, 7);
    
    // Get monster health average
    const activeMonster = await this.getUserActiveMonster(userId);
    const monsterHealthAvg = activeMonster?.health || 100;
    
    return {
      completedTasks,
      totalTasks: 10, // Total number of daily tasks
      weeklyProgress: {
        loggingStreak,
        monsterHealthAvg,
        pointsEarned,
      },
    };
  }
}

export const storage = new DatabaseStorage();
