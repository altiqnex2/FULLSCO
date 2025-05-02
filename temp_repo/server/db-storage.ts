import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  users, User, InsertUser,
  categories, Category, InsertCategory,
  levels, Level, InsertLevel,
  countries, Country, InsertCountry,
  scholarships, Scholarship, InsertScholarship,
  posts, Post, InsertPost,
  tags, Tag, InsertTag,
  postTags, PostTag, InsertPostTag,
  successStories, SuccessStory, InsertSuccessStory,
  subscribers, Subscriber, InsertSubscriber,
  seoSettings, SeoSetting, InsertSeoSetting,
  siteSettings, SiteSetting, InsertSiteSetting,
  pages, Page, InsertPage
} from "@shared/schema";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    // Use raw query since the schema differs from actual table
    const result = await db.execute(sql`
      SELECT id, username, password, display_name as "fullName", email, role, created_at as "createdAt"
      FROM users 
      WHERE id = ${id}
    `);
    
    if (result.length === 0) return undefined;
    
    // Convert the first row to User type
    return result[0] as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Use raw query since the schema differs from actual table
    const result = await db.execute(sql`
      SELECT id, username, password, display_name as "fullName", email, role, created_at as "createdAt"
      FROM users 
      WHERE username = ${username}
    `);
    
    if (result.length === 0) return undefined;
    
    // Convert the first row to User type
    return result[0] as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    // Use raw query since the schema differs from actual table
    const result = await db.execute(sql`
      SELECT id, username, password, display_name as "fullName", email, role, created_at as "createdAt"
      FROM users 
      WHERE email = ${email}
    `);
    
    if (result.rows.length === 0) return undefined;
    
    // Convert the first row to User type
    return result.rows[0] as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async listUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Static Page operations
  async getPage(id: number): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.id, id));
    return page;
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));
    return page;
  }

  async createPage(page: InsertPage): Promise<Page> {
    const [newPage] = await db.insert(pages).values(page).returning();
    return newPage;
  }

  async updatePage(id: number, page: Partial<InsertPage>): Promise<Page | undefined> {
    const [updatedPage] = await db.update(pages).set(page).where(eq(pages.id, id)).returning();
    return updatedPage;
  }

  async deletePage(id: number): Promise<boolean> {
    const result = await db.delete(pages).where(eq(pages.id, id));
    return true; // In PostgreSQL, the result doesn't contain affected rows count directly
  }

  async listPages(filters?: { isPublished?: boolean, showInHeader?: boolean, showInFooter?: boolean }): Promise<Page[]> {
    let query = db.select().from(pages);
    
    if (filters) {
      const conditions = [];
      if (filters.isPublished !== undefined) {
        conditions.push(eq(pages.isPublished, filters.isPublished));
      }
      if (filters.showInHeader !== undefined) {
        conditions.push(eq(pages.showInHeader, filters.showInHeader));
      }
      if (filters.showInFooter !== undefined) {
        conditions.push(eq(pages.showInFooter, filters.showInFooter));
      }
      
      if (conditions.length > 0) {
        for (const condition of conditions) {
          query = query.where(condition);
        }
      }
    }
    
    return await query;
  }

  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    await db.delete(categories).where(eq(categories.id, id));
    return true;
  }

  async listCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  // Level operations
  async getLevel(id: number): Promise<Level | undefined> {
    const [level] = await db.select().from(levels).where(eq(levels.id, id));
    return level;
  }

  async getLevelBySlug(slug: string): Promise<Level | undefined> {
    const [level] = await db.select().from(levels).where(eq(levels.slug, slug));
    return level;
  }

  async createLevel(level: InsertLevel): Promise<Level> {
    const [newLevel] = await db.insert(levels).values(level).returning();
    return newLevel;
  }

  async listLevels(): Promise<Level[]> {
    return await db.select().from(levels);
  }

  // Country operations
  async getCountry(id: number): Promise<Country | undefined> {
    const [country] = await db.select().from(countries).where(eq(countries.id, id));
    return country;
  }

  async getCountryBySlug(slug: string): Promise<Country | undefined> {
    const [country] = await db.select().from(countries).where(eq(countries.slug, slug));
    return country;
  }

  async createCountry(country: InsertCountry): Promise<Country> {
    const [newCountry] = await db.insert(countries).values(country).returning();
    return newCountry;
  }

  async listCountries(): Promise<Country[]> {
    return await db.select().from(countries);
  }

  // Scholarship operations
  async getScholarship(id: number): Promise<Scholarship | undefined> {
    const [scholarship] = await db.select().from(scholarships).where(eq(scholarships.id, id));
    return scholarship;
  }

  async getScholarshipBySlug(slug: string): Promise<Scholarship | undefined> {
    const [scholarship] = await db.select().from(scholarships).where(eq(scholarships.slug, slug));
    return scholarship;
  }

  async createScholarship(scholarship: InsertScholarship): Promise<Scholarship> {
    const [newScholarship] = await db.insert(scholarships).values(scholarship).returning();
    return newScholarship;
  }

  async updateScholarship(id: number, scholarship: Partial<InsertScholarship>): Promise<Scholarship | undefined> {
    const [updatedScholarship] = await db.update(scholarships).set(scholarship).where(eq(scholarships.id, id)).returning();
    return updatedScholarship;
  }

  async deleteScholarship(id: number): Promise<boolean> {
    await db.delete(scholarships).where(eq(scholarships.id, id));
    return true;
  }

  async listScholarships(filters?: { isFeatured?: boolean, countryId?: number, levelId?: number, categoryId?: number }): Promise<Scholarship[]> {
    let query = db.select().from(scholarships);
    
    if (filters) {
      const conditions = [];
      if (filters.isFeatured !== undefined) {
        conditions.push(eq(scholarships.isFeatured, filters.isFeatured));
      }
      if (filters.countryId !== undefined) {
        conditions.push(eq(scholarships.countryId, filters.countryId));
      }
      if (filters.levelId !== undefined) {
        conditions.push(eq(scholarships.levelId, filters.levelId));
      }
      if (filters.categoryId !== undefined) {
        conditions.push(eq(scholarships.categoryId, filters.categoryId));
      }
      
      if (conditions.length > 0) {
        for (const condition of conditions) {
          query = query.where(condition);
        }
      }
    }
    
    return await query;
  }

  // Post operations
  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    return post;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined> {
    const [updatedPost] = await db.update(posts).set(post).where(eq(posts.id, id)).returning();
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    await db.delete(posts).where(eq(posts.id, id));
    return true;
  }

  async incrementPostViews(id: number): Promise<boolean> {
    // Note: views column doesn't exist in the actual table
    // This is a placeholder implementation since we can't track views in the DB
    const post = await this.getPost(id);
    if (!post) return false;
    
    // No actual increment is performed since the column doesn't exist
    return true;
  }

  async listPosts(filters?: { authorId?: number }): Promise<Post[]> {
    let query = db.select().from(posts);
    
    if (filters && filters.authorId !== undefined) {
      query = query.where(eq(posts.authorId, filters.authorId));
    }
    
    return await query.orderBy(desc(posts.createdAt));
  }

  // Tag operations
  async getTag(id: number): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag;
  }

  async getTagBySlug(slug: string): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.slug, slug));
    return tag;
  }

  async createTag(tag: InsertTag): Promise<Tag> {
    const [newTag] = await db.insert(tags).values(tag).returning();
    return newTag;
  }

  async listTags(): Promise<Tag[]> {
    return await db.select().from(tags);
  }

  // Post-Tag operations
  async getPostTags(postId: number): Promise<Tag[]> {
    const result = await db.select({ tag: tags })
      .from(postTags)
      .leftJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, postId));
    
    return result.map(r => r.tag);
  }

  async getTagPosts(tagId: number): Promise<Post[]> {
    const result = await db.select({ post: posts })
      .from(postTags)
      .leftJoin(posts, eq(postTags.postId, posts.id))
      .where(eq(postTags.tagId, tagId));
    
    return result.map(r => r.post);
  }

  async addTagToPost(postId: number, tagId: number): Promise<PostTag> {
    const [result] = await db.insert(postTags)
      .values({ postId, tagId })
      .returning();
    
    return result;
  }

  async removeTagFromPost(postId: number, tagId: number): Promise<boolean> {
    await db.delete(postTags)
      .where(and(eq(postTags.postId, postId), eq(postTags.tagId, tagId)));
    
    return true;
  }

  // Success Story operations
  async getSuccessStory(id: number): Promise<SuccessStory | undefined> {
    const [story] = await db.select().from(successStories).where(eq(successStories.id, id));
    return story;
  }

  async getSuccessStoryBySlug(slug: string): Promise<SuccessStory | undefined> {
    const [story] = await db.select().from(successStories).where(eq(successStories.slug, slug));
    return story;
  }

  async createSuccessStory(story: InsertSuccessStory): Promise<SuccessStory> {
    const [newStory] = await db.insert(successStories).values(story).returning();
    return newStory;
  }

  async updateSuccessStory(id: number, story: Partial<InsertSuccessStory>): Promise<SuccessStory | undefined> {
    const [updatedStory] = await db.update(successStories).set(story).where(eq(successStories.id, id)).returning();
    return updatedStory;
  }

  async deleteSuccessStory(id: number): Promise<boolean> {
    await db.delete(successStories).where(eq(successStories.id, id));
    return true;
  }

  async listSuccessStories(): Promise<SuccessStory[]> {
    return await db.select().from(successStories);
  }

  // Newsletter subscriber operations
  async getSubscriber(id: number): Promise<Subscriber | undefined> {
    const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.id, id));
    return subscriber;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.email, email));
    return subscriber;
  }

  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const [newSubscriber] = await db.insert(subscribers).values(subscriber).returning();
    return newSubscriber;
  }

  async listSubscribers(): Promise<Subscriber[]> {
    return await db.select().from(subscribers);
  }

  // SEO settings operations
  async getSeoSetting(id: number): Promise<SeoSetting | undefined> {
    const [seoSetting] = await db.select().from(seoSettings).where(eq(seoSettings.id, id));
    return seoSetting;
  }

  async getSeoSettingByPath(pagePath: string): Promise<SeoSetting | undefined> {
    const [seoSetting] = await db.select().from(seoSettings).where(eq(seoSettings.pagePath, pagePath));
    return seoSetting;
  }

  async createSeoSetting(seoSetting: InsertSeoSetting): Promise<SeoSetting> {
    const [newSeoSetting] = await db.insert(seoSettings).values(seoSetting).returning();
    return newSeoSetting;
  }

  async updateSeoSetting(id: number, seoSetting: Partial<InsertSeoSetting>): Promise<SeoSetting | undefined> {
    const [updatedSeoSetting] = await db.update(seoSettings).set(seoSetting).where(eq(seoSettings.id, id)).returning();
    return updatedSeoSetting;
  }

  async listSeoSettings(): Promise<SeoSetting[]> {
    return await db.select().from(seoSettings);
  }

  // Site settings operations
  async getSiteSettings(): Promise<SiteSetting | undefined> {
    // Use raw query to get the site settings, since schema and actual table structure might differ
    const result = await db.execute(sql`SELECT * FROM site_settings LIMIT 1`);
    if (result.length === 0) return undefined;
    
    // Map DB fields to our schema
    const dbSettings = result[0];
    
    // Create a settings object with required fields from the schema
    // Adding null/default values for missing columns
    const settings: any = {
      id: dbSettings.id,
      siteName: dbSettings.site_name,
      siteTagline: dbSettings.site_tagline || null,
      siteDescription: dbSettings.site_description || null,
      favicon: dbSettings.favicon || null,
      logo: dbSettings.logo || null,
      logoDark: dbSettings.logo_dark || null,
      email: dbSettings.email || null,
      phone: dbSettings.phone || null,
      whatsapp: dbSettings.whatsapp || null,
      address: dbSettings.address || null,
      facebook: dbSettings.facebook || null,
      twitter: dbSettings.twitter || null,
      instagram: dbSettings.instagram || null,
      youtube: dbSettings.youtube || null,
      linkedin: dbSettings.linkedin || null,
      primaryColor: dbSettings.primary_color || null,
      secondaryColor: dbSettings.secondary_color || null,
      accentColor: dbSettings.accent_color || null,
      enableDarkMode: dbSettings.enable_dark_mode || null,
      rtlDirection: dbSettings.rtl_direction || null,
      defaultLanguage: dbSettings.default_language || null,
      enableNewsletter: dbSettings.enable_newsletter || null,
      enableScholarshipSearch: dbSettings.enable_scholarship_search || null,
      footerText: dbSettings.footer_text || null,
      showHeroSection: dbSettings.show_hero_section || null,
      customCss: dbSettings.custom_css || null
    };
    
    return settings as SiteSetting;
  }

  async updateSiteSettings(settings: Partial<InsertSiteSetting>): Promise<SiteSetting> {
    console.log("DB storage: updating site settings:", JSON.stringify(settings, null, 2));
    
    // Check if there's any site settings record
    const existingSettings = await this.getSiteSettings();
    console.log("DB storage: existing settings:", existingSettings ? JSON.stringify(existingSettings, null, 2) : "None");
    
    try {
      // معالجة البيانات بتنظيفها للتأكد من تناسبها مع هيكل قاعدة البيانات
      const cleanedSettings: any = { ...settings };
      
      // تحويل القيم الفارغة (سلاسل فارغة) إلى null لأن قاعدة البيانات تتوقع ذلك
      Object.keys(cleanedSettings).forEach(key => {
        if (cleanedSettings[key] === '') {
          cleanedSettings[key] = null;
        }
      });
      
      console.log("DB storage: cleaned settings:", JSON.stringify(cleanedSettings, null, 2));
      
      if (existingSettings) {
        console.log("DB storage: updating existing settings with ID:", existingSettings.id);
        // Use drizzle's update method
        await db.update(siteSettings)
          .set(cleanedSettings)
          .where(eq(siteSettings.id, existingSettings.id));
      } else {
        console.log("DB storage: inserting new settings");
        // Use drizzle's insert method
        await db.insert(siteSettings).values(cleanedSettings);
      }
      
      // Fetch the updated settings
      const updatedSettings = await this.getSiteSettings();
      console.log("DB storage: settings after update:", JSON.stringify(updatedSettings, null, 2));
      
      return updatedSettings as SiteSetting;
    } catch (error) {
      console.error("DB storage: error updating site settings:", error);
      throw error;
    }
  }

  // Analytics operations - simplified implementations
  async getVisitStats(period?: string): Promise<any> {
    // This would typically involve querying analytics data from a dedicated table
    // For now returning mock data
    return {
      visits: 1000,
      uniqueVisitors: 800,
      pageViews: 2500,
      period: period || 'month'
    };
  }

  async getPostStats(): Promise<any> {
    const totalPosts = await db.select({ count: sql<number>`count(*)` }).from(posts);
    return {
      total: totalPosts[0].count,
      popular: await db.select().from(posts).orderBy(desc(posts.createdAt)).limit(5)
    };
  }

  async getScholarshipStats(): Promise<any> {
    const totalScholarships = await db.select({ count: sql<number>`count(*)` }).from(scholarships);
    const featuredCount = await db.select({ count: sql<number>`count(*)` })
      .from(scholarships)
      .where(eq(scholarships.isFeatured, true));
    
    return {
      total: totalScholarships[0].count,
      featured: featuredCount[0].count
    };
  }

  async getTrafficSources(): Promise<any> {
    // Mock data for traffic sources
    return [
      { source: 'Direct', percentage: 40 },
      { source: 'Social Media', percentage: 25 },
      { source: 'Search Engines', percentage: 20 },
      { source: 'Referrals', percentage: 15 }
    ];
  }

  async getTopContent(type: string = 'all', limit: number = 5): Promise<any> {
    if (type === 'posts' || type === 'all') {
      const topPosts = await db.select().from(posts).orderBy(desc(posts.createdAt)).limit(limit);
      return { posts: topPosts };
    } else if (type === 'scholarships') {
      const topScholarships = await db.select().from(scholarships).limit(limit);
      return { scholarships: topScholarships };
    }
    
    return {};
  }
}