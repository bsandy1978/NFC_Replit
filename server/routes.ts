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
  
  // Admin route to generate pre-defined NFC links
  app.post("/api/admin/generate-links", isAdmin, async (req: Request, res: Response) => {
    try {
      const count = Number(req.body.count) || 10;
      const prefix = req.body.prefix || "";
      const templateId = req.body.templateId;
      
      if (count < 1 || count > 1000) {
        return res.status(400).json({ message: "Count must be between 1 and 1000" });
      }
      
      // If template ID is provided, check if it exists
      if (templateId) {
        const templateCard = await storage.getBusinessCard(templateId);
        if (!templateCard) {
          return res.status(404).json({ message: "Template card not found" });
        }
      }
      
      const slugs: string[] = [];
      const links: any[] = [];
      
      // Generate links
      for (let i = 0; i < count; i++) {
        // Generate a unique slug with optional prefix
        let uniqueSlug = prefix ? `${prefix}-${nanoid(8)}` : nanoid(10);
        
        // Ensure slug is unique
        let isUnique = false;
        let attempts = 0;
        
        while (!isUnique && attempts < 5) {
          const existingLink = await storage.getPublicLinkBySlug(uniqueSlug);
          if (!existingLink) {
            isUnique = true;
          } else {
            // If not unique, generate a new one
            uniqueSlug = prefix ? `${prefix}-${nanoid(8)}` : nanoid(10);
            attempts++;
          }
        }
        
        if (!isUnique) {
          return res.status(500).json({ message: "Failed to generate unique slugs after multiple attempts" });
        }
        
        // Store the slug for response
        slugs.push(uniqueSlug);
        
        // Create the public link without associating it with a card yet (set businessCardId to null)
        // This marks it as an unclaimed pre-generated link
        const link = await storage.createPublicLink({
          businessCardId: 0, // Special value to indicate unclaimed
          uniqueSlug,
          isActive: true,
          isPreGenerated: true,
          templateId: templateId || null
        });
        
        links.push(link);
      }
      
      return res.status(201).json({ slugs, links });
    } catch (error) {
      console.error("Error generating NFC links:", error);
      return res.status(500).json({ message: "Failed to generate NFC links" });
    }
  });
  
  // Get all unassigned/unclaimed pre-generated links
  app.get("/api/admin/unassigned-links", isAdmin, async (req: Request, res: Response) => {
    try {
      const links = await storage.getUnassignedLinks();
      return res.json(links);
    } catch (error) {
      console.error("Error fetching unassigned links:", error);
      return res.status(500).json({ message: "Failed to fetch unassigned links" });
    }
  });
  
  // Get template cards for pre-generated links
  app.get("/api/admin/template-cards", isAdmin, async (req: Request, res: Response) => {
    try {
      // Get template cards (where isTemplate = true)
      const templateCards = await storage.getTemplateCards();
      return res.json(templateCards);
    } catch (error) {
      console.error("Error fetching template cards:", error);
      return res.status(500).json({ message: "Failed to fetch template cards" });
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
  
  // NFC Card Routes
  // Get NFC link information - used in the claim page
  app.get("/api/nfc-links/:slug", async (req: Request, res: Response) => {
    try {
      const slug = req.params.slug;
      const link = await storage.getPublicLinkBySlug(slug);
      
      if (!link || !link.isActive) {
        return res.status(404).json({ message: "NFC link not found or inactive" });
      }
      
      // Get template card if applicable
      let templateCard = null;
      if (link.templateId) {
        templateCard = await storage.getBusinessCard(link.templateId);
      }
      
      return res.json({
        id: link.id,
        uniqueSlug: link.uniqueSlug,
        isActive: link.isActive,
        isPreGenerated: link.isPreGenerated,
        isClaimed: link.isClaimed,
        claimedAt: link.claimedAt,
        templateId: link.templateId,
        templateCard
      });
    } catch (error) {
      console.error("Error fetching NFC link info:", error);
      return res.status(500).json({ message: "Failed to fetch NFC link information" });
    }
  });
  
  // Claim an NFC link
  app.post("/api/nfc-links/:slug/claim", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const slug = req.params.slug;
      const userId = req.user.id;
      
      // Get the link
      const link = await storage.getPublicLinkBySlug(slug);
      
      if (!link) {
        return res.status(404).json({ message: "NFC link not found" });
      }
      
      if (!link.isActive) {
        return res.status(400).json({ message: "This NFC link is not active" });
      }
      
      if (link.isClaimed) {
        return res.status(400).json({ message: "This NFC link has already been claimed" });
      }
      
      // Get template card if provided
      let templateData: any = {
        userId,
        deviceId: nanoid(), // Generate a new device ID for the card
        firstName: "",
        lastName: "",
        jobTitle: "",
        company: "",
        email: "",
        template: "Classic"
      };
      
      if (link.templateId) {
        const templateCard = await storage.getBusinessCard(link.templateId);
        if (templateCard) {
          // Copy fields from the template
          const { 
            id, userId: templateUserId, deviceId: templateDeviceId, 
            createdAt, updatedAt, isTemplate, templateName, templateDescription,
            ...templateFields 
          } = templateCard;
          
          templateData = {
            ...templateFields,
            userId,
            deviceId: nanoid()
          };
        }
      }
      
      // Create a new business card for the user
      const newCard = await storage.createBusinessCard(templateData);
      
      // Claim the link with the new card
      const claimedLink = await storage.claimPublicLink(slug, userId, newCard.id);
      
      if (!claimedLink) {
        return res.status(500).json({ message: "Failed to claim the NFC link" });
      }
      
      return res.status(201).json({
        message: "NFC card claimed successfully",
        businessCardId: newCard.id,
        link: claimedLink
      });
    } catch (error) {
      console.error("Error claiming NFC link:", error);
      return res.status(500).json({ message: "Failed to claim NFC link" });
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
