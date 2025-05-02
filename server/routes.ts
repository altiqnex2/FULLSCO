import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCategorySchema, insertPostSchema, insertCommentSchema } from "@shared/schema";
import slugify from "slugify";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Categories API endpoints
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const slug = slugify(data.name, { lower: true, strict: true });
      const newCategory = await storage.createCategory({ ...data, slug });
      res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Error creating category" });
    }
  });

  // Posts API endpoints
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Error fetching posts" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getPostById(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Error fetching post" });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      // Use a modified schema for posts since we're generating the slug
      const postData = {
        ...req.body,
        authorId: 1, // Default for simplicity, would normally come from auth
        slug: slugify(req.body.title, { lower: true, strict: true }),
      };
      
      // Handle auto-publishing
      if (postData.status === "published" && !postData.publishedAt) {
        postData.publishedAt = new Date().toISOString();
      }
      
      const newPost = await storage.createPost(postData);
      res.status(201).json(newPost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Error creating post" });
    }
  });

  app.put("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      // Check if post exists
      const existingPost = await storage.getPostById(id);
      if (!existingPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Handle slug update if title changed
      let slug = existingPost.slug;
      if (req.body.title && req.body.title !== existingPost.title) {
        slug = slugify(req.body.title, { lower: true, strict: true });
      }
      
      // Handle publishing status change
      let publishedAt = existingPost.publishedAt;
      if (req.body.status === "published" && existingPost.status !== "published") {
        publishedAt = new Date().toISOString();
      }
      
      const updatedPost = await storage.updatePost(id, {
        ...req.body,
        slug,
        publishedAt,
      });
      
      res.json(updatedPost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Error updating post" });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      await storage.deletePost(id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Error deleting post" });
    }
  });

  // Comments API endpoints
  app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const comments = await storage.getCommentsByPostId(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Error fetching comments" });
    }
  });

  app.post("/api/posts/:postId/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const data = insertCommentSchema.parse({
        ...req.body,
        postId,
        authorId: 1, // Default for simplicity
      });
      
      const newComment = await storage.createComment(data);
      res.status(201).json(newComment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Error creating comment" });
    }
  });

  return httpServer;
}
