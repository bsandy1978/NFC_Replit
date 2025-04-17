import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { businessCardFormSchema, z } from "zod";
import { insertBusinessCardSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for business cards
  app.get("/api/business-cards", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const deviceId = req.query.deviceId as string | undefined;
      
      if (userId) {
        const cards = await storage.getBusinessCardsByUserId(userId);
        return res.json(cards);
      }
      
      if (deviceId) {
        const card = await storage.getBusinessCardByDeviceId(deviceId);
        return res.json(card || null);
      }
      
      return res.status(400).json({ message: "Missing userId or deviceId parameter" });
    } catch (error) {
      console.error("Error fetching business cards:", error);
      return res.status(500).json({ message: "Failed to fetch business cards" });
    }
  });

  app.get("/api/business-cards/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const card = await storage.getBusinessCard(id);
      
      if (!card) {
        return res.status(404).json({ message: "Business card not found" });
      }
      
      return res.json(card);
    } catch (error) {
      console.error("Error fetching business card:", error);
      return res.status(500).json({ message: "Failed to fetch business card" });
    }
  });

  app.post("/api/business-cards", async (req: Request, res: Response) => {
    try {
      const validatedData = insertBusinessCardSchema.parse(req.body);
      const card = await storage.createBusinessCard(validatedData);
      return res.status(201).json(card);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      console.error("Error creating business card:", error);
      return res.status(500).json({ message: "Failed to create business card" });
    }
  });

  app.put("/api/business-cards/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const existingCard = await storage.getBusinessCard(id);
      
      if (!existingCard) {
        return res.status(404).json({ message: "Business card not found" });
      }
      
      // Partial validation for update
      const validatedData = insertBusinessCardSchema.partial().parse(req.body);
      const updatedCard = await storage.updateBusinessCard(id, validatedData);
      
      return res.json(updatedCard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      console.error("Error updating business card:", error);
      return res.status(500).json({ message: "Failed to update business card" });
    }
  });

  app.delete("/api/business-cards/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const existingCard = await storage.getBusinessCard(id);
      
      if (!existingCard) {
        return res.status(404).json({ message: "Business card not found" });
      }
      
      await storage.deleteBusinessCard(id);
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting business card:", error);
      return res.status(500).json({ message: "Failed to delete business card" });
    }
  });

  // Auto-save endpoint for business cards
  app.post("/api/business-cards/auto-save", async (req: Request, res: Response) => {
    try {
      const { deviceId, ...cardData } = req.body;
      
      if (!deviceId) {
        return res.status(400).json({ message: "Device ID is required" });
      }
      
      // Check if card exists for this device
      const existingCard = await storage.getBusinessCardByDeviceId(deviceId);
      
      if (existingCard) {
        // Update existing card
        const updatedCard = await storage.updateBusinessCard(existingCard.id, cardData);
        return res.json(updatedCard);
      } else {
        // Create new card
        const newCard = await storage.createBusinessCard({
          deviceId,
          ...cardData
        });
        return res.status(201).json(newCard);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      console.error("Error auto-saving business card:", error);
      return res.status(500).json({ message: "Failed to auto-save business card" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
