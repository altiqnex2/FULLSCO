import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("display_name").notNull(),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

// Scholarship Categories Table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description")
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true
});

// Scholarship Level Table
export const levels = pgTable("levels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique()
});

export const insertLevelSchema = createInsertSchema(levels).omit({
  id: true
});

// Countries Table
export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique()
});

export const insertCountrySchema = createInsertSchema(countries).omit({
  id: true
});

// Scholarships Table
export const scholarships = pgTable("scholarships", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  deadline: text("deadline"),
  amount: text("amount"),
  isFeatured: boolean("is_featured").default(false),
  isFullyFunded: boolean("is_fully_funded").default(false),
  countryId: integer("country_id").references(() => countries.id),
  levelId: integer("level_id").references(() => levels.id),
  categoryId: integer("category_id").references(() => categories.id),
  requirements: text("requirements"),
  applicationLink: text("application_link"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertScholarshipSchema = createInsertSchema(scholarships).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Blog Posts Table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  authorId: integer("author_id").references(() => users.id).notNull(),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Tags Table
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique()
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true
});

// Post Tags Junction Table
export const postTags = pgTable("post_tags", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  tagId: integer("tag_id").references(() => tags.id).notNull()
});

export const insertPostTagSchema = createInsertSchema(postTags).omit({
  id: true
});

// Success Stories Table
export const successStories = pgTable("success_stories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  scholarshipName: text("scholarship_name"),
  imageUrl: text("image_url"),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertSuccessStorySchema = createInsertSchema(successStories).omit({
  id: true,
  createdAt: true
});

// Newsletter Subscribers Table
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertSubscriberSchema = createInsertSchema(subscribers).omit({
  id: true,
  createdAt: true
});

// SEO Settings Table
export const seoSettings = pgTable("seo_settings", {
  id: serial("id").primaryKey(),
  pagePath: text("page_path").notNull().unique(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  ogImage: text("og_image"),
  keywords: text("keywords")
});

export const insertSeoSettingsSchema = createInsertSchema(seoSettings).omit({
  id: true
});

// Site Settings Table
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull(),
  siteTagline: text("site_tagline"),
  siteDescription: text("site_description"),
  favicon: text("favicon"),
  logo: text("logo"),
  logoDark: text("logo_dark"),
  email: text("email"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  address: text("address"),
  facebook: text("facebook"),
  twitter: text("twitter"),
  instagram: text("instagram"),
  youtube: text("youtube"),
  linkedin: text("linkedin"),
  primaryColor: text("primary_color"),
  secondaryColor: text("secondary_color"),
  accentColor: text("accent_color"),
  enableDarkMode: boolean("enable_dark_mode"),
  rtlDirection: boolean("rtl_direction"),
  defaultLanguage: text("default_language"),
  enableNewsletter: boolean("enable_newsletter"),
  enableScholarshipSearch: boolean("enable_scholarship_search"),
  footerText: text("footer_text"),
  
  // Home Page Sections
  showHeroSection: boolean("show_hero_section"),
  showFeaturedScholarships: boolean("show_featured_scholarships"),
  showSearchSection: boolean("show_search_section"),
  showCategoriesSection: boolean("show_categories_section"),
  showCountriesSection: boolean("show_countries_section"),
  showLatestArticles: boolean("show_latest_articles"),
  showSuccessStories: boolean("show_success_stories"),
  showNewsletterSection: boolean("show_newsletter_section"),
  showStatisticsSection: boolean("show_statistics_section"),
  showPartnersSection: boolean("show_partners_section"),
  
  // Section Titles and Descriptions
  heroTitle: text("hero_title"),
  heroSubtitle: text("hero_subtitle"),
  heroDescription: text("hero_description"),
  featuredScholarshipsTitle: text("featured_scholarships_title"),
  featuredScholarshipsDescription: text("featured_scholarships_description"),
  categoriesSectionTitle: text("categories_section_title"),
  categoriesSectionDescription: text("categories_section_description"),
  countriesSectionTitle: text("countries_section_title"),
  countriesSectionDescription: text("countries_section_description"),
  latestArticlesTitle: text("latest_articles_title"),
  latestArticlesDescription: text("latest_articles_description"),
  successStoriesTitle: text("success_stories_title"),
  successStoriesDescription: text("success_stories_description"),
  newsletterSectionTitle: text("newsletter_section_title"),
  newsletterSectionDescription: text("newsletter_section_description"),
  statisticsSectionTitle: text("statistics_section_title"),
  statisticsSectionDescription: text("statistics_section_description"),
  partnersSectionTitle: text("partners_section_title"),
  partnersSectionDescription: text("partners_section_description"),
  
  // Page Layouts
  homePageLayout: text("home_page_layout"),
  scholarshipPageLayout: text("scholarship_page_layout"),
  articlePageLayout: text("article_page_layout"),
  
  // Custom CSS
  customCss: text("custom_css"),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true
});

// Static Pages Table
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  isPublished: boolean("is_published").default(true),
  showInFooter: boolean("show_in_footer").default(false),
  showInHeader: boolean("show_in_header").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Export Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Level = typeof levels.$inferSelect;
export type InsertLevel = z.infer<typeof insertLevelSchema>;

export type Country = typeof countries.$inferSelect;
export type InsertCountry = z.infer<typeof insertCountrySchema>;

export type Scholarship = typeof scholarships.$inferSelect;
export type InsertScholarship = z.infer<typeof insertScholarshipSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;

export type PostTag = typeof postTags.$inferSelect;
export type InsertPostTag = z.infer<typeof insertPostTagSchema>;

export type SuccessStory = typeof successStories.$inferSelect;
export type InsertSuccessStory = z.infer<typeof insertSuccessStorySchema>;

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;

export type SeoSetting = typeof seoSettings.$inferSelect;
export type InsertSeoSetting = z.infer<typeof insertSeoSettingsSchema>;

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingsSchema>;

export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
