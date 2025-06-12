import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateMonster, analyzeNutrition } from "./openai";
import { 
  insertMonsterSchema,
  insertFoodLogSchema,
  insertSymptomLogSchema,
  insertSleepLogSchema,
  insertSunExposureLogSchema,
  insertSupplementLogSchema,
  insertMedicationLogSchema,
  insertCommunityPostSchema,
  insertPostReplySchema,
  insertRiddleAnswerSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = req.body;
      
      const updatedUser = await storage.updateUserProfile(userId, profileData);
      
      // Log activity
      await storage.logActivity(userId, 'profile_update', 'Updated profile information', 10);
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Monster routes
  app.post('/api/monster/create', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { descriptiveWords } = req.body;
      
      if (!descriptiveWords || descriptiveWords.length !== 5) {
        return res.status(400).json({ message: "Must provide exactly 5 descriptive words" });
      }
      
      // Generate monster with AI
      const monsterData = await generateMonster(descriptiveWords);
      
      const monsterInput = insertMonsterSchema.parse({
        userId,
        name: monsterData.name,
        imageUrl: monsterData.imageUrl,
        descriptiveWords,
        health: 100,
        isActive: true,
      });
      
      const monster = await storage.createMonster(monsterInput);
      
      // Log activity
      await storage.logActivity(userId, 'monster_created', `Created new monster: ${monster.name}`, 50);
      
      res.json(monster);
    } catch (error) {
      console.error("Error creating monster:", error);
      res.status(500).json({ message: "Failed to create monster" });
    }
  });

  app.get('/api/monster/active', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const monster = await storage.getUserActiveMonster(userId);
      res.json(monster);
    } catch (error) {
      console.error("Error fetching active monster:", error);
      res.status(500).json({ message: "Failed to fetch active monster" });
    }
  });

  app.patch('/api/monster/:id/health', isAuthenticated, async (req: any, res) => {
    try {
      const monsterId = parseInt(req.params.id);
      const { health } = req.body;
      
      await storage.updateMonsterHealth(monsterId, health);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating monster health:", error);
      res.status(500).json({ message: "Failed to update monster health" });
    }
  });

  // Food logging routes
  app.post('/api/food-log', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const foodLogData = req.body;
      
      // Analyze nutrition with AI
      const nutritionData = await analyzeNutrition(foodLogData.foodItems);
      
      const foodLogInput = insertFoodLogSchema.parse({
        ...foodLogData,
        userId,
        ...nutritionData,
      });
      
      const foodLog = await storage.createFoodLog(foodLogInput);
      
      // Update monster health based on food quality
      const monster = await storage.getUserActiveMonster(userId);
      if (monster) {
        const healthChange = nutritionData.healthImpact || 0;
        const newHealth = Math.max(0, Math.min(100, monster.health + healthChange));
        await storage.updateMonsterHealth(monster.id, newHealth);
      }
      
      // Log activity
      await storage.logActivity(userId, 'food_logged', `Logged ${foodLogData.mealType}`, 5);
      
      res.json(foodLog);
    } catch (error) {
      console.error("Error creating food log:", error);
      res.status(500).json({ message: "Failed to create food log" });
    }
  });

  app.get('/api/food-log', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date } = req.query;
      const foodLogs = await storage.getUserFoodLogs(userId, date as string);
      res.json(foodLogs);
    } catch (error) {
      console.error("Error fetching food logs:", error);
      res.status(500).json({ message: "Failed to fetch food logs" });
    }
  });

  // Symptom logging routes
  app.post('/api/symptom-log', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const symptomLogData = req.body;
      
      const symptomLogInput = insertSymptomLogSchema.parse({
        ...symptomLogData,
        userId,
      });
      
      const symptomLog = await storage.createSymptomLog(symptomLogInput);
      
      // Update monster health based on symptoms
      const monster = await storage.getUserActiveMonster(userId);
      if (monster) {
        const overallFeeling = symptomLogData.overallFeeling || 5;
        const healthChange = Math.floor((overallFeeling - 5) * 2); // -10 to +10 range
        const newHealth = Math.max(0, Math.min(100, monster.health + healthChange));
        await storage.updateMonsterHealth(monster.id, newHealth);
      }
      
      // Log activity
      await storage.logActivity(userId, 'symptoms_logged', `Logged ${symptomLogData.timeOfDay} symptoms`, 5);
      
      res.json(symptomLog);
    } catch (error) {
      console.error("Error creating symptom log:", error);
      res.status(500).json({ message: "Failed to create symptom log" });
    }
  });

  app.get('/api/symptom-log', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date } = req.query;
      const symptomLogs = await storage.getUserSymptomLogs(userId, date as string);
      res.json(symptomLogs);
    } catch (error) {
      console.error("Error fetching symptom logs:", error);
      res.status(500).json({ message: "Failed to fetch symptom logs" });
    }
  });

  // Sleep logging routes
  app.post('/api/sleep-log', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sleepLogData = req.body;
      
      const sleepLogInput = insertSleepLogSchema.parse({
        ...sleepLogData,
        userId,
      });
      
      const sleepLog = await storage.createSleepLog(sleepLogInput);
      
      // Update monster health based on sleep quality
      const monster = await storage.getUserActiveMonster(userId);
      if (monster) {
        const sleepQuality = sleepLogData.quality || 5;
        const healthChange = Math.floor((sleepQuality - 5) * 1.5); // -7.5 to +7.5 range
        const newHealth = Math.max(0, Math.min(100, monster.health + healthChange));
        await storage.updateMonsterHealth(monster.id, newHealth);
      }
      
      // Log activity
      await storage.logActivity(userId, 'sleep_logged', 'Logged sleep quality', 5);
      
      res.json(sleepLog);
    } catch (error) {
      console.error("Error creating sleep log:", error);
      res.status(500).json({ message: "Failed to create sleep log" });
    }
  });

  // Sun exposure logging routes
  app.post('/api/sun-exposure-log', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sunLogData = req.body;
      
      const sunLogInput = insertSunExposureLogSchema.parse({
        ...sunLogData,
        userId,
      });
      
      const sunLog = await storage.createSunExposureLog(sunLogInput);
      
      // Log activity
      await storage.logActivity(userId, 'sun_logged', 'Logged sun exposure', 3);
      
      res.json(sunLog);
    } catch (error) {
      console.error("Error creating sun exposure log:", error);
      res.status(500).json({ message: "Failed to create sun exposure log" });
    }
  });

  // Supplement and medication logging routes
  app.post('/api/supplement-log', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const supplementLogData = req.body;
      
      const supplementLogInput = insertSupplementLogSchema.parse({
        ...supplementLogData,
        userId,
      });
      
      const supplementLog = await storage.createSupplementLog(supplementLogInput);
      
      // Log activity
      await storage.logActivity(userId, 'supplement_logged', `Logged supplement: ${supplementLogData.supplementName}`, 3);
      
      res.json(supplementLog);
    } catch (error) {
      console.error("Error creating supplement log:", error);
      res.status(500).json({ message: "Failed to create supplement log" });
    }
  });

  app.post('/api/medication-log', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const medicationLogData = req.body;
      
      const medicationLogInput = insertMedicationLogSchema.parse({
        ...medicationLogData,
        userId,
      });
      
      const medicationLog = await storage.createMedicationLog(medicationLogInput);
      
      // Log activity
      await storage.logActivity(userId, 'medication_logged', `Logged medication: ${medicationLogData.medicationName}`, 3);
      
      res.json(medicationLog);
    } catch (error) {
      console.error("Error creating medication log:", error);
      res.status(500).json({ message: "Failed to create medication log" });
    }
  });

  // Community routes
  app.post('/api/community/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = req.body;
      
      const postInput = insertCommunityPostSchema.parse({
        ...postData,
        userId,
      });
      
      const post = await storage.createCommunityPost(postInput);
      
      // Log activity
      await storage.logActivity(userId, 'community_post', 'Created community post', 10);
      
      res.json(post);
    } catch (error) {
      console.error("Error creating community post:", error);
      res.status(500).json({ message: "Failed to create community post" });
    }
  });

  app.get('/api/community/posts', async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const posts = await storage.getCommunityPosts(Number(limit), Number(offset));
      res.json(posts);
    } catch (error) {
      console.error("Error fetching community posts:", error);
      res.status(500).json({ message: "Failed to fetch community posts" });
    }
  });

  app.get('/api/community/posts/:id', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getCommunityPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching community post:", error);
      res.status(500).json({ message: "Failed to fetch community post" });
    }
  });

  app.post('/api/community/posts/:id/replies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.id);
      const replyData = req.body;
      
      const replyInput = insertPostReplySchema.parse({
        ...replyData,
        userId,
        postId,
      });
      
      const reply = await storage.createPostReply(replyInput);
      
      // Log activity
      await storage.logActivity(userId, 'community_reply', 'Replied to community post', 5);
      
      res.json(reply);
    } catch (error) {
      console.error("Error creating post reply:", error);
      res.status(500).json({ message: "Failed to create post reply" });
    }
  });

  app.get('/api/community/posts/:id/replies', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const replies = await storage.getPostReplies(postId);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching post replies:", error);
      res.status(500).json({ message: "Failed to fetch post replies" });
    }
  });

  // Riddle routes
  app.get('/api/riddle/today', async (req, res) => {
    try {
      const riddle = await storage.getTodaysRiddle();
      res.json(riddle);
    } catch (error) {
      console.error("Error fetching today's riddle:", error);
      res.status(500).json({ message: "Failed to fetch today's riddle" });
    }
  });

  app.post('/api/riddle/answer', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { riddleId, answer } = req.body;
      
      // Check if user already answered this riddle
      const existingAnswer = await storage.getUserRiddleAnswer(userId, riddleId);
      if (existingAnswer) {
        return res.status(400).json({ message: "Already answered this riddle" });
      }
      
      // Get the riddle to check correct answer
      const riddle = await storage.getTodaysRiddle();
      if (!riddle || riddle.id !== riddleId) {
        return res.status(400).json({ message: "Invalid riddle" });
      }
      
      const isCorrect = answer === riddle.correctAnswer;
      const pointsEarned = isCorrect ? 25 : 5; // 25 points for correct, 5 for participation
      
      const riddleAnswerInput = insertRiddleAnswerSchema.parse({
        userId,
        riddleId,
        answer,
        isCorrect,
        pointsEarned,
      });
      
      const riddleAnswer = await storage.submitRiddleAnswer(riddleAnswerInput);
      
      // Log activity
      await storage.logActivity(
        userId, 
        'riddle_answered', 
        isCorrect ? 'Answered riddle correctly!' : 'Answered riddle', 
        pointsEarned
      );
      
      res.json({ 
        ...riddleAnswer, 
        isCorrect, 
        correctAnswer: riddle.correctAnswer,
        explanation: riddle.explanation 
      });
    } catch (error) {
      console.error("Error submitting riddle answer:", error);
      res.status(500).json({ message: "Failed to submit riddle answer" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dashboardData = await storage.getUserDashboardData(userId);
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Activity feed routes
  app.get('/api/activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { limit = 10 } = req.query;
      const activities = await storage.getUserActivities(userId, Number(limit));
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
