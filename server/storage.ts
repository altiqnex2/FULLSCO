import { db } from "@db";
import { 
  users,
  categories,
  posts,
  comments,
  type User,
  type Category,
  type Post,
  type Comment,
  type InsertCategory,
  type InsertPost,
  type InsertComment
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

// Categories
export const getAllCategories = async (): Promise<Category[]> => {
  return await db.query.categories.findMany({
    orderBy: categories.name,
  });
};

export const getCategoryById = async (id: number): Promise<Category | undefined> => {
  return await db.query.categories.findFirst({
    where: eq(categories.id, id),
  });
};

export const createCategory = async (data: InsertCategory): Promise<Category> => {
  const [newCategory] = await db.insert(categories).values(data).returning();
  return newCategory;
};

export const updateCategory = async (id: number, data: Partial<InsertCategory>): Promise<Category> => {
  const [updatedCategory] = await db
    .update(categories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning();
  return updatedCategory;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await db.delete(categories).where(eq(categories.id, id));
};

// Posts
export const getAllPosts = async (): Promise<Post[]> => {
  return await db.query.posts.findMany({
    orderBy: desc(posts.createdAt),
    with: {
      author: true,
      category: true,
    },
  });
};

export const getPostById = async (id: number): Promise<Post | undefined> => {
  return await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: {
      author: true,
      category: true,
    },
  });
};

export const getPostBySlug = async (slug: string): Promise<Post | undefined> => {
  return await db.query.posts.findFirst({
    where: eq(posts.slug, slug),
    with: {
      author: true,
      category: true,
    },
  });
};

export const createPost = async (data: any): Promise<Post> => {
  const [newPost] = await db.insert(posts).values(data).returning();
  return await getPostById(newPost.id) as Post;
};

export const updatePost = async (id: number, data: any): Promise<Post> => {
  const [updatedPost] = await db
    .update(posts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(posts.id, id))
    .returning();
  return await getPostById(updatedPost.id) as Post;
};

export const deletePost = async (id: number): Promise<void> => {
  // First delete all comments associated with this post
  await db.delete(comments).where(eq(comments.postId, id));
  
  // Then delete the post
  await db.delete(posts).where(eq(posts.id, id));
};

// Comments
export const getCommentsByPostId = async (postId: number): Promise<Comment[]> => {
  return await db.query.comments.findMany({
    where: eq(comments.postId, postId),
    orderBy: desc(comments.createdAt),
    with: {
      author: true,
    },
  });
};

export const createComment = async (data: InsertComment): Promise<Comment> => {
  const [newComment] = await db.insert(comments).values(data).returning();
  return await db.query.comments.findFirst({
    where: eq(comments.id, newComment.id),
    with: {
      author: true,
    },
  }) as Comment;
};

export const updateComment = async (id: number, data: Partial<InsertComment>): Promise<Comment> => {
  const [updatedComment] = await db
    .update(comments)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(comments.id, id))
    .returning();
  return await db.query.comments.findFirst({
    where: eq(comments.id, updatedComment.id),
    with: {
      author: true,
    },
  }) as Comment;
};

export const deleteComment = async (id: number): Promise<void> => {
  await db.delete(comments).where(eq(comments.id, id));
};

// Export all functions
export const storage = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getCommentsByPostId,
  createComment,
  updateComment,
  deleteComment,
};
