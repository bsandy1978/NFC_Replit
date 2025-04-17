import { 
  users, 
  type User, 
  type InsertUser, 
  businessCards, 
  type BusinessCard, 
  type InsertBusinessCard 
} from "@shared/schema";

// Define interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Business card operations
  getBusinessCard(id: number): Promise<BusinessCard | undefined>;
  getBusinessCardsByUserId(userId: number): Promise<BusinessCard[]>;
  getBusinessCardByDeviceId(deviceId: string): Promise<BusinessCard | undefined>;
  createBusinessCard(card: InsertBusinessCard): Promise<BusinessCard>;
  updateBusinessCard(id: number, card: Partial<InsertBusinessCard>): Promise<BusinessCard | undefined>;
  deleteBusinessCard(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private businessCards: Map<number, BusinessCard>;
  private userIdCounter: number;
  private businessCardIdCounter: number;

  constructor() {
    this.users = new Map();
    this.businessCards = new Map();
    this.userIdCounter = 1;
    this.businessCardIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Business card operations
  async getBusinessCard(id: number): Promise<BusinessCard | undefined> {
    return this.businessCards.get(id);
  }

  async getBusinessCardsByUserId(userId: number): Promise<BusinessCard[]> {
    return Array.from(this.businessCards.values()).filter(
      (card) => card.userId === userId
    );
  }

  async getBusinessCardByDeviceId(deviceId: string): Promise<BusinessCard | undefined> {
    return Array.from(this.businessCards.values()).find(
      (card) => card.deviceId === deviceId
    );
  }

  async createBusinessCard(insertCard: InsertBusinessCard): Promise<BusinessCard> {
    const id = this.businessCardIdCounter++;
    const now = new Date();
    
    const card: BusinessCard = {
      ...insertCard,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.businessCards.set(id, card);
    return card;
  }

  async updateBusinessCard(id: number, updateData: Partial<InsertBusinessCard>): Promise<BusinessCard | undefined> {
    const existingCard = await this.getBusinessCard(id);
    
    if (!existingCard) {
      return undefined;
    }
    
    const updatedCard: BusinessCard = {
      ...existingCard,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.businessCards.set(id, updatedCard);
    return updatedCard;
  }

  async deleteBusinessCard(id: number): Promise<boolean> {
    return this.businessCards.delete(id);
  }
}

export const storage = new MemStorage();
