import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PanelLeft, Check, Save, Home, Columns } from 'lucide-react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Define site settings type
type SiteSettings = {
  showHeroSection?: boolean;
  showFeaturedScholarships?: boolean;
  showSearchSection?: boolean;
  showCategoriesSection?: boolean;
  showCountriesSection?: boolean;
  showLatestArticles?: boolean;
  showSuccessStories?: boolean;
  showNewsletterSection?: boolean;
  showStatisticsSection?: boolean;
  showPartnersSection?: boolean;
  [key: string]: any;
};

const AdminHomeLayout = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch site settings
  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ['/api/site-settings'],
  });

  // State for settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    showHeroSection: true,
    showFeaturedScholarships: true,
    showSearchSection: true,
    showCategoriesSection: true,
    showCountriesSection: true,
    showLatestArticles: true,
    showSuccessStories: true,
    showNewsletterSection: true,
    showStatisticsSection: true,
    showPartnersSection: true,
  });
  
  // Update state when settings are loaded
  useEffect(() => {
    if (settings) {
      setSiteSettings({
        showHeroSection: settings.showHeroSection ?? true,
        showFeaturedScholarships: settings.showFeaturedScholarships ?? true,
        showSearchSection: settings.showSearchSection ?? true,
        showCategoriesSection: settings.showCategoriesSection ?? true,
        showCountriesSection: settings.showCountriesSection ?? true,
        showLatestArticles: settings.showLatestArticles ?? true,
        showSuccessStories: settings.showSuccessStories ?? true,
        showNewsletterSection: settings.showNewsletterSection ?? true,
        showStatisticsSection: settings.showStatisticsSection ?? true,
        showPartnersSection: settings.showPartnersSection ?? true,
      });
    }
  }, [settings]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: SiteSettings) => {
      const response = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });
      if (!response.ok) throw new Error('فشل في تحديث الإعدادات');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-settings'] });
      toast({ 
        title: 'تم الحفظ بنجاح', 
        description: 'تم تحديث إعدادات الصفحة الرئيسية بنجاح' 
      });
    },
    onError: (error) => {
      toast({ 
        title: 'خطأ!', 
        description: `فشل في تحديث الإعدادات: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  });

  // Update settings handler
  const handleToggle = (settingName: string) => {
    setSiteSettings(prev => ({
      ...prev,
      [settingName]: !prev[settingName as keyof typeof prev]
    }));
  };

  // Save settings handler
  const handleSave = () => {
    updateSettingsMutation.mutate(siteSettings);
  };

  // Action buttons for header
  const actions = (
    <Button 
      onClick={handleSave}
      disabled={updateSettingsMutation.isPending}
      className="flex items-center gap-2"
    >
      {updateSettingsMutation.isPending ? (
        <>
          <PanelLeft className="h-4 w-4 animate-spin" />
          جاري الحفظ...
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          حفظ التغييرات
        </>
      )}
    </Button>
  );

  return (
    <AdminLayout title="تخصيص الصفحة الرئيسية" actions={actions}>
      <div className="space-y-6">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-4">جاري تحميل الإعدادات...</p>
          </div>
        ) : (
          <>
            {/* Hero Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Home className="h-5 w-5 ml-2 text-blue-500" />
                  <CardTitle>معاينة الصفحة الرئيسية</CardTitle>
                </div>
                <CardDescription>
                  معاينة للصفحة الرئيسية بناءً على الإعدادات الحالية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 border rounded-lg p-4 overflow-hidden">
                  <img
                    src="https://via.placeholder.com/800x400?text=Homepage+Preview"
                    alt="معاينة الصفحة الرئيسية"
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sections Toggle */}
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Columns className="h-5 w-5 ml-2 text-blue-500" />
                  <CardTitle>عناصر الصفحة الرئيسية</CardTitle>
                </div>
                <CardDescription>
                  قم بتفعيل أو تعطيل الأقسام التي تريد عرضها في الصفحة الرئيسية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {Object.entries(siteSettings).map(([key, value]) => (
                    <div key={key} className="py-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">
                          {key === 'showHeroSection' && 'قسم الترحيب (Hero)'}
                          {key === 'showFeaturedScholarships' && 'المنح المميزة'}
                          {key === 'showSearchSection' && 'قسم البحث'}
                          {key === 'showCategoriesSection' && 'التصنيفات'}
                          {key === 'showCountriesSection' && 'الدول'}
                          {key === 'showLatestArticles' && 'أحدث المقالات'}
                          {key === 'showSuccessStories' && 'قصص النجاح'}
                          {key === 'showNewsletterSection' && 'النشرة البريدية'}
                          {key === 'showStatisticsSection' && 'الإحصائيات'}
                          {key === 'showPartnersSection' && 'شركاء النجاح'}
                        </h3>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={value}
                          onChange={() => handleToggle(key)}
                        />
                        <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 
                          peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                          peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:right-[2px] 
                          after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                          after:transition-all peer-checked:bg-blue-500`}>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 bg-blue-50 p-4 rounded-md">
                  <p className="text-sm text-blue-700">
                    ملاحظة: عند تعطيل قسم معين، لن يتم حذف البيانات المرتبطة به، ولكن سيتم إخفاء القسم فقط من الصفحة الرئيسية.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminHomeLayout;