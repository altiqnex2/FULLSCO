import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettings() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // توجيه المستخدم إلى صفحة إعدادات الموقع الرئيسية
  useEffect(() => {
    toast({
      title: "تم نقلك",
      description: "تم توحيد صفحات الإعدادات، وتم نقلك إلى الصفحة الرئيسية للإعدادات"
    });
    
    // توجيه المستخدم إلى صفحة إعدادات الموقع (site-settings)
    navigate('/admin/site-settings');
  }, [navigate, toast]);
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <p>جاري توجيهك إلى صفحة الإعدادات...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="flex">
        {/* Sidebar for desktop */}
        {!isMobile && <Sidebar isMobileOpen={false} onClose={() => {}} />}
        
        {/* Mobile Sidebar */}
        {isMobile && <Sidebar isMobileOpen={sidebarOpen} onClose={closeSidebar} />}
        
        {/* Main Content */}
        <main className={`flex-1 p-4 md:p-6 ${!isMobile ? 'mr-64' : ''}`}>
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-6">
            {isMobile && (
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={toggleSidebar} 
                className="text-muted-foreground"
              >
                <Menu className="h-6 w-6" />
              </Button>
            )}
            <h1 className="text-2xl font-bold">إعدادات الموقع</h1>
            <Button onClick={handleSaveSettings}>
              <Save className="ml-2 h-4 w-4" />
              حفظ الإعدادات
            </Button>
          </div>
          
          <Tabs defaultValue="general">
            <TabsList className="mb-6 w-full justify-start">
              <TabsTrigger value="general">عام</TabsTrigger>
              <TabsTrigger value="seo">تحسين محركات البحث</TabsTrigger>
              <TabsTrigger value="advanced">إعدادات متقدمة</TabsTrigger>
            </TabsList>
            
            {/* إعدادات عامة */}
            <TabsContent value="general">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>إعدادات الموقع الرئيسية</CardTitle>
                  <CardDescription>
                    التفاصيل الأساسية لموقعك التي تظهر للزوار
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">اسم الموقع</Label>
                    <Input 
                      id="site-name" 
                      value={siteName} 
                      onChange={(e) => setSiteName(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-description">وصف الموقع</Label>
                    <Textarea 
                      id="site-description" 
                      value={siteDescription} 
                      onChange={(e) => setSiteDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">البريد الإلكتروني للتواصل</Label>
                    <Input 
                      id="contact-email" 
                      type="email"
                      value={contactEmail} 
                      onChange={(e) => setContactEmail(e.target.value)} 
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>خيارات المستخدمين</CardTitle>
                  <CardDescription>
                    إدارة خيارات المستخدمين والتفاعل في الموقع
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">النشرة البريدية</h4>
                      <p className="text-sm text-muted-foreground">
                        تفعيل النشرة البريدية للمستخدمين
                      </p>
                    </div>
                    <Switch 
                      checked={enableNewsletter} 
                      onCheckedChange={setEnableNewsletter} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">التسجيل في الموقع</h4>
                      <p className="text-sm text-muted-foreground">
                        السماح للمستخدمين بالتسجيل في الموقع
                      </p>
                    </div>
                    <Switch 
                      checked={enableRegistration} 
                      onCheckedChange={setEnableRegistration} 
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* إعدادات SEO */}
            <TabsContent value="seo">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>إعدادات تحسين محركات البحث</CardTitle>
                  <CardDescription>
                    ضبط العناصر المهمة لتحسين ظهور موقعك في محركات البحث
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="meta-title">عنوان الموقع (Meta Title)</Label>
                    <Input 
                      id="meta-title" 
                      value={metaTitle} 
                      onChange={(e) => setMetaTitle(e.target.value)} 
                    />
                    <p className="text-xs text-muted-foreground">
                      العنوان الذي يظهر في نتائج البحث ومشاركات السوشيال ميديا (يفضل أقل من 60 حرف)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meta-description">وصف الموقع (Meta Description)</Label>
                    <Textarea 
                      id="meta-description" 
                      value={metaDescription} 
                      onChange={(e) => setMetaDescription(e.target.value)} 
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      الوصف الذي يظهر في نتائج البحث ومشاركات السوشيال ميديا (يفضل أقل من 160 حرف)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ga-id">معرف جوجل أناليتكس</Label>
                    <Input 
                      id="ga-id" 
                      value={googleAnalyticsId} 
                      onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                      placeholder="مثال: G-XXXXXXXXXX أو UA-XXXXXXXX-X" 
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* إعدادات متقدمة */}
            <TabsContent value="advanced">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>إعدادات متقدمة</CardTitle>
                  <CardDescription>
                    إعدادات خاصة بالمطورين والخبراء
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md text-yellow-700">
                    <p className="font-medium">تنبيه</p>
                    <p className="text-sm">
                      يرجى الحذر عند تغيير الإعدادات المتقدمة. قد تؤثر التغييرات على أداء الموقع بشكل كبير.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="custom-code">ترميز HTML/CSS/JS مخصص</Label>
                    <Textarea 
                      id="custom-code" 
                      placeholder="<!-- ضع الكود المخصص هنا -->"
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      سيتم إضافة هذا الكود إلى الصفحة الرئيسية في وسم head
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}