import { Pool } from 'pg';

// إنشاء اتصال بقاعدة البيانات المصدر
const sourcePool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_KId7fvpRz9gA@ep-icy-shape-a4agoh7h.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

// إنشاء اتصال بقاعدة البيانات الهدف
const targetPool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_7aoVNLhgyUj8@ep-rapid-cloud-a4636yby-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

async function migrateData() {
  try {
    // التأكد من الاتصال
    await sourcePool.query('SELECT 1');
    await targetPool.query('SELECT 1');
    console.log('تم الاتصال بكلا قاعدتي البيانات بنجاح');

    // الحصول على قائمة الجداول من قاعدة البيانات المصدر
    const tablesResult = await sourcePool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
    );
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log('الجداول المراد نقلها:', tables);

    // نقل البيانات من كل جدول
    for (const tableName of tables) {
      try {
        // تخطي جداول معينة إذا كانت غير ضرورية
        if (['_drizzle_migrations'].includes(tableName)) {
          console.log(`تخطي جدول ${tableName} (جدول نظام)`);
          continue;
        }

        // الحصول على البيانات من قاعدة البيانات المصدر
        const dataResult = await sourcePool.query(`SELECT * FROM "${tableName}"`);
        const data = dataResult.rows;
        
        if (data.length === 0) {
          console.log(`جدول ${tableName} فارغ، لا توجد بيانات للنقل`);
          continue;
        }

        console.log(`بدء نقل البيانات من جدول ${tableName}. عدد الصفوف: ${data.length}`);

        try {
          // إفراغ الجدول في قاعدة البيانات الهدف قبل النقل (مع التعامل مع الأخطاء)
          await targetPool.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
        } catch (truncateError) {
          console.error(`خطأ في إفراغ جدول ${tableName}:`, truncateError.message);
          // محاولة إنشاء الجدول
          // استمر رغم الخطأ
        }
        
        // بناء استعلام الإدراج
        if (data.length > 0) {
          const columns = Object.keys(data[0]);
          const columnNames = columns.map(col => `"${col}"`).join(', ');
          
          // إدراج البيانات صف بصف
          for (const row of data) {
            try {
              const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
              const insertQuery = `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders})`;
              
              // تحويل القيم إلى مصفوفة للاستعلام المعد
              const valueArray = columns.map(col => row[col]);
              
              await targetPool.query(insertQuery, valueArray);
            } catch (rowError) {
              console.error(`خطأ في إدراج صف في الجدول ${tableName}:`, rowError.message);
              // استمر بالصف التالي
            }
          }
        }
        
        console.log(`تم نقل بيانات جدول ${tableName} بنجاح!`);
      } catch (tableError) {
        console.error(`خطأ في نقل جدول ${tableName}:`, tableError.message);
        // استمر بالجدول التالي
      }
    }

    console.log('تم الانتهاء من نقل البيانات بنجاح!');
  } catch (error) {
    console.error('حدث خطأ أثناء نقل البيانات:', error);
  } finally {
    // إغلاق الاتصال بقاعدة البيانات
    sourcePool.end();
    targetPool.end();
    console.log('تم إغلاق الاتصال بقاعدة البيانات');
  }
}

// تنفيذ عملية النقل
migrateData();
