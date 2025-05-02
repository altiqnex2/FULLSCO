import { db } from "./index";
import * as schema from "@shared/schema";
import { faker } from "@faker-js/faker/locale/ar";
import { eq } from "drizzle-orm";
import slugify from "slugify";

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Check if we already have users
    const existingUsers = await db.query.users.findMany();
    
    // Only seed admin user if none exists
    if (existingUsers.length === 0) {
      console.log("Seeding admin user...");
      await db.insert(schema.users).values({
        username: "admin",
        password: "$2a$10$vQiyFQYjAgG00VFJ9.i2aOAWmDAlQOrH50MtBhKaRLHrV00X04OSu", // password: admin123
        name: "أحمد العلي",
        email: "admin@fullsco.com",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      });
    }

    // Seed categories if they don't exist
    const existingCategories = await db.query.categories.findMany();
    
    if (existingCategories.length === 0) {
      console.log("Seeding categories...");
      const categories = [
        { name: "تقنية", slug: "technology", description: "مقالات عن التكنولوجيا والبرمجة" },
        { name: "ثقافة", slug: "culture", description: "مقالات عن الثقافة والفن" },
        { name: "علوم", slug: "science", description: "مقالات علمية وأبحاث" },
        { name: "أدب", slug: "literature", description: "مقالات أدبية وقصص" },
        { name: "رياضة", slug: "sports", description: "مقالات عن الرياضة" },
      ];
      
      for (const category of categories) {
        await db.insert(schema.categories).values(category);
      }
    }

    // Seed initial posts if none exist
    const existingPosts = await db.query.posts.findMany();
    
    if (existingPosts.length === 0) {
      console.log("Seeding initial posts...");
      
      // Get the first user (admin)
      const admin = await db.query.users.findFirst();
      if (!admin) {
        throw new Error("Admin user not found!");
      }
      
      // Get category IDs
      const categories = await db.query.categories.findMany();
      const categoryIds = categories.map(c => c.id);
      
      // Sample posts
      const samplePosts = [
        {
          title: "كيفية تطوير تطبيقات الويب باستخدام React و Express",
          content: `<h2>مقدمة</h2>
          <p>في هذا المقال، سنتعلم كيفية تطوير تطبيقات الويب باستخدام تقنيات React و Express.</p>
          <h3>لماذا React؟</h3>
          <p>React هي مكتبة جافاسكريبت تساعد على بناء واجهات المستخدم التفاعلية بسهولة.</p>
          <h3>لماذا Express؟</h3>
          <p>Express هو إطار عمل سريع وغير رأي لتطبيقات Node.js يوفر مجموعة قوية من الميزات لتطوير تطبيقات الويب.</p>`,
          slug: "react-express-web-development",
          excerpt: "تعلم كيفية بناء تطبيقات ويب حديثة باستخدام React وExpress",
          featuredImage: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          status: "published",
          authorId: admin.id,
          categoryId: categoryIds[0],
          tags: ["React", "Express", "JavaScript", "برمجة"],
          publishedAt: new Date(2023, 3, 15).toISOString(),
        },
        {
          title: "أساسيات قواعد البيانات PostgreSQL",
          content: `<h2>مقدمة إلى PostgreSQL</h2>
          <p>PostgreSQL هي قاعدة بيانات علائقية مفتوحة المصدر قوية ومتقدمة.</p>
          <h3>مميزات PostgreSQL</h3>
          <ul>
            <li>دعم للأنواع المعقدة من البيانات</li>
            <li>توافق مع معايير SQL</li>
            <li>قابلية للتوسع</li>
            <li>أمان قوي</li>
          </ul>`,
          slug: "postgresql-database-basics",
          excerpt: "تعرف على المفاهيم الأساسية لقواعد بيانات PostgreSQL",
          featuredImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          status: "draft",
          authorId: admin.id,
          categoryId: categoryIds[0],
          tags: ["PostgreSQL", "Database", "SQL", "قواعد البيانات"],
        },
        {
          title: "أهمية محررات النصوص الغنية في تطبيقات الويب",
          content: `<h2>محررات النصوص الغنية</h2>
          <p>محررات النصوص الغنية هي أدوات تتيح للمستخدمين إنشاء محتوى منسق بسهولة.</p>
          <h3>TinyMCE</h3>
          <p>TinyMCE هو محرر نصوص غني شائع يستخدم في العديد من تطبيقات الويب.</p>
          <h3>مميزات محررات النصوص الغنية</h3>
          <ul>
            <li>تنسيق النص</li>
            <li>إدراج الصور والمرفقات</li>
            <li>إنشاء جداول</li>
            <li>سهولة الاستخدام</li>
          </ul>`,
          slug: "rich-text-editors-importance",
          excerpt: "اكتشف كيف تحسن محررات النصوص الغنية تجربة المستخدم",
          featuredImage: "https://images.unsplash.com/photo-1516131206008-dd041a9764fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          status: "published",
          authorId: admin.id,
          categoryId: categoryIds[1],
          tags: ["محررات النصوص", "تجربة المستخدم", "TinyMCE"],
          publishedAt: new Date(2023, 3, 5).toISOString(),
        }
      ];
      
      for (const post of samplePosts) {
        await db.insert(schema.posts).values(post);
      }
    }

    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
  }
}

seed();
