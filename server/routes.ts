import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertBusinessCardSchema, insertPublicLinkSchema, businessCardFormSchema } from "@shared/schema";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
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

  // Public link sharing routes
  app.post("/api/public-links", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const businessCardId = Number(req.body.businessCardId);
      
      // Check if card exists
      const card = await storage.getBusinessCard(businessCardId);
      if (!card) {
        return res.status(404).json({ message: "Business card not found" });
      }
      
      // Use custom slug if provided, otherwise generate one
      const uniqueSlug = req.body.uniqueSlug || nanoid(10);
      
      // Check if slug is already in use
      if (req.body.uniqueSlug) {
        const existingLink = await storage.getPublicLinkBySlug(uniqueSlug);
        if (existingLink) {
          return res.status(400).json({ message: "This slug is already in use. Please choose another one." });
        }
      }
      
      const publicLink = await storage.createPublicLink({
        businessCardId,
        uniqueSlug,
        isActive: true
      });
      
      return res.status(201).json(publicLink);
    } catch (error) {
      console.error("Error creating public link:", error);
      return res.status(500).json({ message: "Failed to create public link" });
    }
  });

  // Get public links by card ID
  app.get("/api/public-links/by-card/:cardId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const cardId = Number(req.params.cardId);
      
      // Check if card exists
      const card = await storage.getBusinessCard(cardId);
      if (!card) {
        return res.status(404).json({ message: "Business card not found" });
      }
      
      // Get all public links for this card
      const links = await storage.getPublicLinksByBusinessCardId(cardId);
      return res.json(links);
    } catch (error) {
      console.error("Error fetching public links for card:", error);
      return res.status(500).json({ message: "Failed to fetch public links" });
    }
  });
  
  // Delete a public link
  app.delete("/api/public-links/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      // Check if link exists
      const link = await storage.getPublicLink(id);
      if (!link) {
        return res.status(404).json({ message: "Public link not found" });
      }
      
      // Delete the link
      await storage.deletePublicLink(id);
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting public link:", error);
      return res.status(500).json({ message: "Failed to delete public link" });
    }
  });
  
  // Get business card by public link slug - for public view
  app.get("/api/public-links/:slug", async (req: Request, res: Response) => {
    try {
      const slug = req.params.slug;
      const link = await storage.getPublicLinkBySlug(slug);
      
      if (!link || !link.isActive) {
        return res.status(404).json({ message: "Public link not found or inactive" });
      }
      
      // Increment view count
      await storage.incrementPublicLinkViewCount(link.id);
      
      // Get associated business card
      const card = await storage.getBusinessCard(link.businessCardId);
      
      if (!card) {
        return res.status(404).json({ message: "Business card not found" });
      }
      
      return res.json(card);
    } catch (error) {
      console.error("Error fetching public link:", error);
      return res.status(500).json({ message: "Failed to fetch public link" });
    }
  });

  // Admin routes
  // Get all users (admin only)
  app.get("/api/admin/users", isAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from user objects
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      return res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get all business cards (admin only)
  app.get("/api/admin/business-cards", isAdmin, async (req: Request, res: Response) => {
    try {
      const cards = await storage.getAllBusinessCards();
      return res.json(cards);
    } catch (error) {
      console.error("Error fetching all business cards:", error);
      return res.status(500).json({ message: "Failed to fetch business cards" });
    }
  });

  // Get all public links (admin only)
  app.get("/api/admin/public-links", isAdmin, async (req: Request, res: Response) => {
    try {
      // This would need to be implemented in storage
      const cards = await storage.getAllBusinessCards();
      const linksPromises = cards.map(card => 
        storage.getPublicLinksByBusinessCardId(card.id)
      );
      
      const nestedLinks = await Promise.all(linksPromises);
      const links = nestedLinks.flat();
      
      return res.json(links);
    } catch (error) {
      console.error("Error fetching public links:", error);
      return res.status(500).json({ message: "Failed to fetch public links" });
    }
  });

  // Toggle public link active status (admin only)
  app.patch("/api/admin/public-links/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { isActive } = req.body;
      
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: "isActive must be a boolean" });
      }
      
      const link = await storage.getPublicLink(id);
      if (!link) {
        return res.status(404).json({ message: "Public link not found" });
      }
      
      const updatedLink = await storage.updatePublicLink(id, { isActive });
      return res.json(updatedLink);
    } catch (error) {
      console.error("Error updating public link:", error);
      return res.status(500).json({ message: "Failed to update public link" });
    }
  });

  // Admin delete user (admin only)
  app.delete("/api/admin/users/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      // Don't allow deleting the current admin user
      if (req.user.id === id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Delete all user's business cards first
      const cards = await storage.getBusinessCardsByUserId(id);
      for (const card of cards) {
        // Delete all public links for this card
        const links = await storage.getPublicLinksByBusinessCardId(card.id);
        for (const link of links) {
          await storage.deletePublicLink(link.id);
        }
        
        // Delete the card
        await storage.deleteBusinessCard(card.id);
      }
      
      // This would need to be implemented in storage
      // await storage.deleteUser(id);
      
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting user:", error);
      return res.status(500).json({ message: "Failed to delete user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
