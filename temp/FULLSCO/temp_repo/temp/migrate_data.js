const { Client } = require('pg');

// إنشاء اتصال بقاعدة البيانات المصدر
const sourceClient = new Client("postgresql://neondb_owner:npg_KId7fvpRz9gA@ep-icy-shape-a4agoh7h.us-east-1.aws.neon.tech/neondb?sslmode=require");

// إنشاء اتصال بقاعدة البيانات الهدف
const targetClient = new Client("postgresql://neondb_owner:npg_7aoVNLhgyUj8@ep-rapid-cloud-a4636yby-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require");

async function migrateData() {
  try {
    // الاتصال بقاعدة البيانات المصدر والهدف
    await sourceClient.connect();
    await targetClient.connect();
    console.log('تم الاتصال بكلا قاعدتي البيانات بنجاح');

    // الحصول على قائمة الجداول من قاعدة البيانات المصدر
    const tablesResult = await sourceClient.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
    );
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log('الجداول المراد نقلها:', tables);

    // إنشاء الجداول من خلال الـ Drizzle schema
    // (نفترض أنها ستكون موجودة أو تم إنشاؤها بالفعل)

    // نقل البيانات من كل جدول
    for (const tableName of tables) {
      try {
        // الحصول على البيانات من قاعدة البيانات المصدر
        const dataResult = await sourceClient.query(`SELECT * FROM ${tableName}`);
        const data = dataResult.rows;
        
        if (data.length === 0) {
          console.log(`جدول ${tableName} فارغ، لا توجد بيانات للنقل`);
          continue;
        }

        console.log(`بدء نقل البيانات من جدول ${tableName}. عدد الصفوف: ${data.length}`);

        // إفراغ الجدول في قاعدة البيانات الهدف قبل النقل
        await targetClient.query(`TRUNCATE TABLE ${tableName} CASCADE`);
        
        // بناء استعلام الإدراج
        const columns = Object.keys(data[0]);
        const columnNames = columns.join(', ');
        
        // إدراج البيانات صف بصف (لتجنب حدود حجم استعلام SQL)
        for (const row of data) {
          const values = columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}')`;
            if (typeof val === 'object' && val instanceof Date) return `'${val.toISOString()}')`;
            if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}')`;
            return val;
          });
          
          try {
            const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
            const insertQuery = `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`;
            
            // تحويل القيم إلى مصفوفة للاستعلام المعد
            const valueArray = columns.map(col => row[col]);
            
            await targetClient.query(insertQuery, valueArray);
          } catch (rowError) {
            console.error(`خطأ في إدراج صف في الجدول ${tableName}:`, rowError.message);
            // استمر بالصف التالي
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
    console.error('حدث خطأ أثناء نقل البيانات:', error.message);
  } finally {
    // إغلاق الاتصال بقاعدة البيانات
    await sourceClient.end();
    await targetClient.end();
    console.log('تم إغلاق الاتصال بقاعدة البيانات');
  }
}

// تنفيذ عملية النقل
migrateData();
