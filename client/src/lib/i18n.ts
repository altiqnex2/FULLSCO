/**
 * Simple i18n utility for Arabic language support
 */

export const translations = {
  ar: {
    home: "الرئيسية",
    posts: "المقالات",
    categories: "التصنيفات",
    comments: "التعليقات",
    profile: "الملف الشخصي",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    createPost: "إنشاء مقال جديد",
    recentPosts: "المقالات الحديثة",
    title: "عنوان المقال",
    enterTitle: "أدخل عنوان المقال هنا",
    category: "التصنيف",
    featuredImage: "صورة الغلاف",
    dragAndDrop: "قم بسحب وإفلات الصورة هنا أو",
    browse: "تصفح من جهازك",
    content: "محتوى المقال",
    tags: "الوسوم",
    addTag: "أضف وسماً وإضغط Enter",
    status: "الحالة:",
    draft: "مسودة",
    published: "منشور",
    preview: "معاينة",
    publish: "نشر المقال",
    save: "حفظ التغييرات",
    showing: "عرض",
    of: "من أصل",
    posts_plural: "مقالات",
    previous: "السابق",
    next: "التالي",
    category_tech: "تقنية",
    category_culture: "ثقافة",
    category_science: "علوم",
    category_literature: "أدب",
    category_sports: "رياضة",
    publishDate: "تاريخ النشر",
    creationDate: "تاريخ الإنشاء",
    edit: "تعديل",
    delete: "حذف",
    deleteConfirm: "هل أنت متأكد من حذف هذا المقال؟",
    postSaved: "تم حفظ المقال بنجاح!",
    errorOccurred: "حدث خطأ. الرجاء المحاولة مرة أخرى."
  }
};

export const t = (key: keyof typeof translations.ar): string => {
  return translations.ar[key] || key;
};
