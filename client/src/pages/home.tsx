import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Hero from '@/components/hero';
import FeaturedScholarships from '@/components/featured-scholarships';
import ScholarshipCategories from '@/components/scholarship-categories';
import LatestArticles from '@/components/latest-articles';
import SuccessStories from '@/components/success-stories';
import Newsletter from '@/components/newsletter';
import AdminPreview from '@/components/admin-preview';
import { SiteSetting } from '@shared/schema';

const Home = () => {
  // الحصول على إعدادات الموقع
  const { data: siteSettings, isLoading } = useQuery<SiteSetting>({
    queryKey: ['/api/site-settings'],
  });
  
  // تعيين بيانات الصفحة التعريفية
  useEffect(() => {
    if (siteSettings) {
      // استخدام عنوان الموقع من الإعدادات
      document.title = `${siteSettings.siteName} - ${siteSettings.siteTagline || 'اعثر على فرصة المنحة الدراسية المثالية'}`;
      
      // استخدام وصف الموقع من الإعدادات
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', siteSettings.siteDescription || 'اكتشف آلاف المنح الدراسية حول العالم واحصل على إرشادات حول كيفية التقديم بنجاح.');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = siteSettings.siteDescription || 'اكتشف آلاف المنح الدراسية حول العالم واحصل على إرشادات حول كيفية التقديم بنجاح.';
        document.head.appendChild(meta);
      }
      
      // تطبيق CSS المخصص إذا كان موجودًا
      if (siteSettings.customCss) {
        const style = document.getElementById('custom-css') || document.createElement('style');
        style.id = 'custom-css';
        style.textContent = siteSettings.customCss;
        if (!document.getElementById('custom-css')) {
          document.head.appendChild(style);
        }
      }
    }
  }, [siteSettings]);

  // إظهار رسالة التحميل إذا كانت البيانات قيد التحميل
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل الصفحة...</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      {/* عرض كل مكون فقط إذا كان ممكّنًا في إعدادات الموقع */}
      {siteSettings?.showHeroSection && (
        <Hero 
          title={siteSettings.heroTitle || "اكتشف المنح الدراسية المثالية لمستقبلك"} 
          description={siteSettings.heroDescription || "آلاف المنح الدراسية حول العالم في مكان واحد، مع إرشادات للتقديم الناجح وتحقيق أهدافك الأكاديمية"} 
        />
      )}
      
      {siteSettings?.showFeaturedScholarships && (
        <FeaturedScholarships />
      )}
      
      {siteSettings?.showCategoriesSection && (
        <ScholarshipCategories />
      )}
      
      {siteSettings?.showLatestArticles && (
        <LatestArticles />
      )}
      
      {siteSettings?.showSuccessStories && (
        <SuccessStories />
      )}
      
      {siteSettings?.showNewsletterSection && siteSettings?.enableNewsletter && (
        <Newsletter />
      )}
      
      <AdminPreview />
    </main>
  );
};

export default Home;
