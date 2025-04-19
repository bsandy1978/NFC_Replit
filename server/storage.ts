import { 
  users, 
  type User, 
  type InsertUser, 
  businessCards, 
  type BusinessCard, 
  type InsertBusinessCard,
  publicLinks,
  type PublicLink,
  type InsertPublicLink
} from "@shared/schema";
import session from "express-session";
// @ts-ignore
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

// Define interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Business card operations
  getBusinessCard(id: number): Promise<BusinessCard | undefined>;
  getBusinessCardsByUserId(userId: number): Promise<BusinessCard[]>;
  getBusinessCardByDeviceId(deviceId: string): Promise<BusinessCard | undefined>;
  getAllBusinessCards(): Promise<BusinessCard[]>;
  createBusinessCard(card: InsertBusinessCard): Promise<BusinessCard>;
  updateBusinessCard(id: number, card: Partial<InsertBusinessCard>): Promise<BusinessCard | undefined>;
  deleteBusinessCard(id: number): Promise<boolean>;
  
  // Public link operations
  getPublicLink(id: number): Promise<PublicLink | undefined>;
  getPublicLinkBySlug(slug: string): Promise<PublicLink | undefined>;
  getPublicLinksByBusinessCardId(businessCardId: number): Promise<PublicLink[]>;
  createPublicLink(link: InsertPublicLink): Promise<PublicLink>;
  updatePublicLink(id: number, linkData: Partial<InsertPublicLink>): Promise<PublicLink | undefined>;
  incrementPublicLinkViewCount(id: number): Promise<void>;
  deletePublicLink(id: number): Promise<boolean>;
  
  // Pre-generated NFC links operations
  getUnassignedLinks(): Promise<PublicLink[]>;
  claimPublicLink(slug: string, userId: number, businessCardId: number): Promise<PublicLink | undefined>;
  
  // Template cards operations
  getTemplateCards(): Promise<BusinessCard[]>;
  createTemplateCard(card: InsertBusinessCard): Promise<BusinessCard>;
  
  // Session store for authentication
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    const PostgresSessionStore = connectPgSimple(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const { db } = await import("./db");
    return db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { db } = await import("./db");
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Business card operations
  async getBusinessCard(id: number): Promise<BusinessCard | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [card] = await db
      .select()
      .from(businessCards)
      .where(eq(businessCards.id, id));
    return card;
  }

  async getBusinessCardsByUserId(userId: number): Promise<BusinessCard[]> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    return db
      .select()
      .from(businessCards)
      .where(eq(businessCards.userId, userId));
  }

  async getBusinessCardByDeviceId(deviceId: string): Promise<BusinessCard | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const { desc } = await import("drizzle-orm");
    const [card] = await db
      .select()
      .from(businessCards)
      .where(eq(businessCards.deviceId, deviceId))
      .orderBy(desc(businessCards.updatedAt));
    return card;
  }

  async getAllBusinessCards(): Promise<BusinessCard[]> {
    const { db } = await import("./db");
    const { desc } = await import("drizzle-orm");
    return db
      .select()
      .from(businessCards)
      .orderBy(desc(businessCards.updatedAt));
  }

  async createBusinessCard(insertCard: InsertBusinessCard): Promise<BusinessCard> {
    const { db } = await import("./db");
    const [card] = await db
      .insert(businessCards)
      .values(insertCard)
      .returning();
    return card;
  }

  async updateBusinessCard(id: number, updateData: Partial<InsertBusinessCard>): Promise<BusinessCard | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const now = new Date();
    
    const [updatedCard] = await db
      .update(businessCards)
      .set({ ...updateData, updatedAt: now })
      .where(eq(businessCards.id, id))
      .returning();
    
    return updatedCard;
  }

  async deleteBusinessCard(id: number): Promise<boolean> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const result = await db
      .delete(businessCards)
      .where(eq(businessCards.id, id))
      .returning({ id: businessCards.id });
    
    return result.length > 0;
  }

  // Public link operations
  async getPublicLink(id: number): Promise<PublicLink | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [link] = await db
      .select()
      .from(publicLinks)
      .where(eq(publicLinks.id, id));
    return link;
  }

  async getPublicLinkBySlug(slug: string): Promise<PublicLink | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [link] = await db
      .select()
      .from(publicLinks)
      .where(eq(publicLinks.uniqueSlug, slug));
    return link;
  }

  async getPublicLinksByBusinessCardId(businessCardId: number): Promise<PublicLink[]> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    return db
      .select()
      .from(publicLinks)
      .where(eq(publicLinks.businessCardId, businessCardId));
  }

  async createPublicLink(link: InsertPublicLink): Promise<PublicLink> {
    const { db } = await import("./db");
    const [newLink] = await db
      .insert(publicLinks)
      .values(link)
      .returning();
    return newLink;
  }

  async updatePublicLink(id: number, linkData: Partial<InsertPublicLink>): Promise<PublicLink | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [updatedLink] = await db
      .update(publicLinks)
      .set(linkData)
      .where(eq(publicLinks.id, id))
      .returning();
    return updatedLink;
  }

  async incrementPublicLinkViewCount(id: number): Promise<void> {
    const { db } = await import("./db");
    const { eq, sql } = await import("drizzle-orm");
    await db
      .update(publicLinks)
      .set({ 
        viewCount: sql`${publicLinks.viewCount} + 1`
      })
      .where(eq(publicLinks.id, id));
  }

  async deletePublicLink(id: number): Promise<boolean> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const result = await db
      .delete(publicLinks)
      .where(eq(publicLinks.id, id))
      .returning({ id: publicLinks.id });
    
    return result.length > 0;
  }
  
  // Pre-generated NFC links operations
  async getUnassignedLinks(): Promise<PublicLink[]> {
    const { db } = await import("./db");
    const { eq, and, isNull } = await import("drizzle-orm");
    return db
      .select()
      .from(publicLinks)
      .where(
        and(
          eq(publicLinks.isPreGenerated, true),
          eq(publicLinks.isClaimed, false),
          eq(publicLinks.isActive, true)
        )
      );
  }
  
  async claimPublicLink(slug: string, userId: number, businessCardId: number): Promise<PublicLink | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    
    // Get the link first
    const link = await this.getPublicLinkBySlug(slug);
    if (!link || !link.isPreGenerated || link.isClaimed) {
      return undefined;
    }
    
    // Update the link to mark it as claimed
    const [updatedLink] = await db
      .update(publicLinks)
      .set({
        isClaimed: true,
        claimedAt: new Date(),
        claimedByUserId: userId,
        businessCardId
      })
      .where(eq(publicLinks.id, link.id))
      .returning();
      
    return updatedLink;
  }
  
  // Template cards operations
  async getTemplateCards(): Promise<BusinessCard[]> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    return db
      .select()
      .from(businessCards)
      .where(eq(businessCards.isTemplate, true));
  }
  
  async createTemplateCard(card: InsertBusinessCard): Promise<BusinessCard> {
    return this.createBusinessCard({
      ...card,
      isTemplate: true
    });
  }
}

export const storage = new DatabaseStorage();
