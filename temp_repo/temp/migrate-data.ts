import { Pool } from 'pg';

// إنشاء اتصال بقاعدة البيانات المصدر
const sourcePool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_KId7fvpRz9gA@ep-icy-shape-a4agoh7h.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

// إنشاء اتصال بقاعدة البيانات الهدف
const targetPool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_7aoVNLhgyUj8@ep-rapid-cloud-a4636yby-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

// دالة لنقل البيانات من جدول معين
async function migrateTable(tableName: string, sourcePool: Pool, targetPool: Pool) {
  try {
    console.log(`بدء نقل بيانات جدول ${tableName}`);
    
    // الحصول على جميع البيانات من الجدول المصدر
    const { rows } = await sourcePool.query(`SELECT * FROM "${tableName}"`);
    
    if (rows.length === 0) {
      console.log(`جدول ${tableName} فارغ. لا توجد بيانات للنقل.`);
      return;
    }
    
    console.log(`تم العثور على ${rows.length} صف في جدول ${tableName}`);
    
    // الحصول على أسماء الأعمدة من الصف الأول
    const columns = Object.keys(rows[0]);
    const columnList = columns.map(col => `"${col}"`).join(', ');
    
    // إفراغ الجدول قبل نقل البيانات الجديدة
    try {
      await targetPool.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
      console.log(`تم إفراغ جدول ${tableName} في قاعدة البيانات الهدف`);
    } catch (error) {
      console.error(`خطأ في إفراغ جدول ${tableName}:`, error);
      // استمر بالتنفيذ
    }
    
    // إدراج البيانات صف بصف
    for (const row of rows) {
      try {
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const insertQuery = `INSERT INTO "${tableName}" (${columnList}) VALUES (${placeholders})`;
        
        const values = columns.map(col => row[col]);
        await targetPool.query(insertQuery, values);
      } catch (error) {
        console.error(`خطأ في إدراج صف في جدول ${tableName}:`, error);
        // استمر بالصف التالي
      }
    }
    
    console.log(`تم نقل بيانات جدول ${tableName} بنجاح`);
  } catch (error) {
    console.error(`خطأ في نقل جدول ${tableName}:`, error);
  }
}

// دالة رئيسية لنقل جميع البيانات
async function migrateAllData() {
  try {
    // ترتيب الجداول بناء على اعتمادياتها
    const tables = [
      "users",
      "categories",
      "levels",
      "countries",
      "tags",
      "scholarships",
      "posts",
      "post_tags",
      "success_stories",
      "subscribers",
      "comments",
      "pages",
      "seo_settings",
      // "site_settings" // لا نقوم بنقله لأننا أنشأناه بالفعل مع القيم الافتراضية
    ];
    
    // نقل كل جدول على حدة
    for (const table of tables) {
      await migrateTable(table, sourcePool, targetPool);
    }
    
    console.log("تم الانتهاء من نقل جميع البيانات بنجاح");
  } catch (error) {
    console.error("حدث خطأ أثناء نقل البيانات:", error);
  } finally {
    // إغلاق الاتصال بقواعد البيانات
    await sourcePool.end();
    await targetPool.end();
    console.log("تم إغلاق الاتصال بقواعد البيانات");
  }
}

// تنفيذ عملية النقل
migrateAllData();