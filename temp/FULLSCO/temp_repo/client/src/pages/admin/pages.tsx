import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Edit, Trash2, RefreshCw, Check, X, Menu, FileText, Eye, Archive } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/admin/sidebar';

// محرر النصوص الغني (يمكن تبديله بأي محرر نصوص غني متوافق مع React)
// في المستقبل يمكن استخدام CKEditor أو TinyMCE أو Quill
const RichTextEditor = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-[300px] font-mono"
      dir="rtl"
    />
  );
};

// زودج سكيما للتحقق من صحة البيانات
const pageSchema = z.object({
  title: z.string().min(1, 'العنوان مطلوب'),
  slug: z.string().min(1, 'المسار المختصر مطلوب').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'المسار المختصر يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط'),
  content: z.string().min(1, 'المحتوى مطلوب'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isPublished: z.boolean().default(true),
  showInFooter: z.boolean().default(false),
  showInHeader: z.boolean().default(false),
});

type PageFormValues = z.infer<typeof pageSchema>;

// واجهة للصفحة
interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  showInFooter: boolean;
  showInHeader: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PagesManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // استلام الصفحات من الخادم
  const { data: pages, isLoading, isError, refetch } = useQuery<Page[]>({
    queryKey: ['/api/admin/pages'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/admin/pages', {
          credentials: 'include' // لإرسال معلومات الجلسة
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'فشل في استلام الصفحات');
        }
        
        return response.json();
      } catch (error) {
        console.error('Error fetching pages:', error);
        throw error;
      }
    },
    enabled: isAuthenticated
  });

  // فلترة الصفحات حسب التبويب النشط
  const filteredPages = pages?.filter(page => {
    if (activeTab === 'all') return true;
    if (activeTab === 'published') return page.isPublished;
    if (activeTab === 'drafts') return !page.isPublished;
    if (activeTab === 'footer') return page.showInFooter;
    if (activeTab === 'header') return page.showInHeader;
    return true;
  }) || [];

  // إضافة صفحة جديدة
  const addMutation = useMutation({
    mutationFn: async (newPage: PageFormValues) => {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPage),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في إضافة الصفحة');
      }
      
      return response.json();
    },
    onSuccess: (newPage) => {
      // تحديث ذاكرة التخزين المؤقت
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pages'] });
      toast({ title: 'تم الإضافة بنجاح', description: 'تمت إضافة الصفحة الجديدة بنجاح' });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في إضافة الصفحة: ${error.message}`, variant: 'destructive' });
    }
  });

  // تعديل صفحة
  const updateMutation = useMutation({
    mutationFn: async (updatedPage: PageFormValues & { id: number }) => {
      const { id, ...pageData } = updatedPage;
      const response = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في تحديث الصفحة');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // تحديث ذاكرة التخزين المؤقت
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pages'] });
      toast({ title: 'تم التحديث بنجاح', description: 'تم تحديث الصفحة بنجاح' });
      setIsEditDialogOpen(false);
      setSelectedPage(null);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في تحديث الصفحة: ${error.message}`, variant: 'destructive' });
    }
  });

  // حذف صفحة
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في حذف الصفحة');
      }
      
      return { success: true, id };
    },
    onSuccess: () => {
      // تحديث ذاكرة التخزين المؤقت
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pages'] });
      toast({ title: 'تم الحذف بنجاح', description: 'تم حذف الصفحة بنجاح' });
      setIsDeleteDialogOpen(false);
      setSelectedPage(null);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في حذف الصفحة: ${error.message}`, variant: 'destructive' });
    }
  });

  // تغيير حالة النشر للصفحة
  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: number, isPublished: boolean }) => {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في تغيير حالة النشر');
      }
      
      return await response.json();
    },
    onSuccess: (updatedPage: Page) => {
      // تحديث ذاكرة التخزين المؤقت
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pages'] });
      toast({ 
        title: updatedPage.isPublished ? 'تم النشر بنجاح' : 'تم إلغاء النشر', 
        description: updatedPage.isPublished ? 'الصفحة الآن منشورة ومتاحة للزوار' : 'الصفحة الآن غير منشورة' 
      });
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في تغيير حالة النشر: ${error.message}`, variant: 'destructive' });
    }
  });

  // نموذج إضافة صفحة جديدة
  const addForm = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      isPublished: true,
      showInFooter: false,
      showInHeader: false,
    },
  });

  // نموذج تعديل صفحة
  const editForm = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: selectedPage?.title || '',
      slug: selectedPage?.slug || '',
      content: selectedPage?.content || '',
      metaTitle: selectedPage?.metaTitle || '',
      metaDescription: selectedPage?.metaDescription || '',
      isPublished: selectedPage?.isPublished || true,
      showInFooter: selectedPage?.showInFooter || false,
      showInHeader: selectedPage?.showInHeader || false,
    },
  });

  // تحديث نموذج التعديل عند تغيير الصفحة المحددة
  useEffect(() => {
    if (selectedPage) {
      editForm.reset({
        title: selectedPage.title,
        slug: selectedPage.slug,
        content: selectedPage.content,
        metaTitle: selectedPage.metaTitle || '',
        metaDescription: selectedPage.metaDescription || '',
        isPublished: selectedPage.isPublished,
        showInFooter: selectedPage.showInFooter,
        showInHeader: selectedPage.showInHeader,
      });
    }
  }, [selectedPage, editForm]);

  // إعادة ضبط نموذج الإضافة عند فتح نافذة الإضافة
  useEffect(() => {
    if (isAddDialogOpen) {
      addForm.reset({
        title: '',
        slug: '',
        content: '',
        metaTitle: '',
        metaDescription: '',
        isPublished: true,
        showInFooter: false,
        showInHeader: false,
      });
    }
  }, [isAddDialogOpen, addForm]);

  // معالجة حدث إرسال نموذج الإضافة
  const onSubmitAdd = (data: PageFormValues) => {
    addMutation.mutate(data);
  };

  // معالجة حدث إرسال نموذج التعديل
  const onSubmitEdit = (data: PageFormValues) => {
    if (selectedPage) {
      updateMutation.mutate({ ...data, id: selectedPage.id });
    }
  };

  // تحضير الصفحة للتعديل
  const handleEdit = (page: Page) => {
    setSelectedPage(page);
    setIsEditDialogOpen(true);
  };

  // تحضير الصفحة للحذف
  const handleDelete = (page: Page) => {
    setSelectedPage(page);
    setIsDeleteDialogOpen(true);
  };

  // تحضير الصفحة للمعاينة
  const handlePreview = (page: Page) => {
    setSelectedPage(page);
    setIsPreviewDialogOpen(true);
  };

  // تغيير حالة النشر
  const togglePublish = (page: Page) => {
    togglePublishMutation.mutate({ id: page.id, isPublished: !page.isPublished });
  };

  // تأكيد الحذف
  const confirmDelete = () => {
    if (selectedPage) {
      deleteMutation.mutate(selectedPage.id);
    }
  };

  // إنتاج slug من العنوان
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  // معالجة تلقائية لإنشاء slug عند كتابة العنوان في نموذج الإضافة
  const handleTitleChangeAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    addForm.setValue('title', title);
    
    // إذا لم يتم تعديل الـ slug يدويًا، قم بتحديثه تلقائيًا
    if (!addForm.getValues('slug') || addForm.getValues('slug') === generateSlug(addForm.getValues('title'))) {
      const slug = generateSlug(title);
      addForm.setValue('slug', slug);
    }
    
    // إذا لم يتم تعديل عنوان ميتا، قم بتعيينه إلى العنوان + اسم الموقع
    if (!addForm.getValues('metaTitle')) {
      addForm.setValue('metaTitle', title ? `${title} | FULLSCO` : '');
    }
  };

  // معالجة تلقائية لإنشاء slug عند كتابة العنوان في نموذج التعديل
  const handleTitleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    editForm.setValue('title', title);
    
    // إذا لم يتم تعديل الـ slug يدويًا، قم بتحديثه تلقائيًا
    if (!editForm.getValues('slug') || editForm.getValues('slug') === generateSlug(editForm.getValues('title'))) {
      const slug = generateSlug(title);
      editForm.setValue('slug', slug);
    }
    
    // إذا لم يتم تعديل عنوان ميتا، قم بتعيينه إلى العنوان + اسم الموقع
    if (!editForm.getValues('metaTitle')) {
      editForm.setValue('metaTitle', title ? `${title} | FULLSCO` : '');
    }
  };

  // في حالة تحميل بيانات المصادقة أو عدم تسجيل الدخول
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        جاري التحميل...
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen relative overflow-x-hidden">
      {/* السايدبار للجوال */}
      <Sidebar 
        isMobileOpen={sidebarOpen} 
        onClose={() => {
          console.log('Pages: closing sidebar');
          setSidebarOpen(false);
        }} 
      />
      
      {/* المحتوى الرئيسي */}
      <div className={cn(
        "transition-all duration-300",
        isMobile ? "w-full" : "mr-64"
      )}>
        <main className="p-4 md:p-6">
          {/* زر فتح السايدبار في الجوال والهيدر */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center">
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-2" 
                  onClick={() => setSidebarOpen(true)}
                  aria-label="فتح القائمة"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <h1 className="text-xl md:text-2xl font-bold">إدارة الصفحات الثابتة</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="ml-2 h-4 w-4" />
                تحديث
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    إضافة صفحة
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>إضافة صفحة جديدة</DialogTitle>
                    <DialogDescription>
                      أضف صفحة ثابتة جديدة للموقع. اضغط على حفظ عند الانتهاء.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...addForm}>
                    <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={addForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>عنوان الصفحة</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  onChange={handleTitleChangeAdd}
                                  placeholder="مثال: من نحن" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addForm.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>المسار المختصر (Slug)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="مثال: about" dir="ltr" />
                              </FormControl>
                              <FormDescription>
                                سيستخدم هذا في عنوان URL. يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={addForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>محتوى الصفحة</FormLabel>
                            <FormControl>
                              <RichTextEditor
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormDescription>
                              يمكنك استخدام HTML لتنسيق المحتوى
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={addForm.control}
                          name="metaTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>عنوان ميتا (SEO)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="مثال: من نحن | FULLSCO" />
                              </FormControl>
                              <FormDescription>
                                عنوان الصفحة لمحركات البحث
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addForm.control}
                          name="metaDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>وصف ميتا (SEO)</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="وصف قصير للصفحة لمحركات البحث" />
                              </FormControl>
                              <FormDescription>
                                وصف الصفحة الذي سيظهر في نتائج البحث
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <FormField
                          control={addForm.control}
                          name="isPublished"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>نشر الصفحة</FormLabel>
                                <FormDescription>
                                  هل هذه الصفحة منشورة؟
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addForm.control}
                          name="showInFooter"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>عرض في التذييل</FormLabel>
                                <FormDescription>
                                  هل تظهر في قائمة التذييل؟
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addForm.control}
                          name="showInHeader"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>عرض في الهيدر</FormLabel>
                                <FormDescription>
                                  هل تظهر في قائمة الهيدر؟
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={addMutation.isPending}>
                          {addMutation.isPending ? (
                            <>
                              <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                              جاري الحفظ...
                            </>
                          ) : (
                            <>
                              <Check className="ml-2 h-4 w-4" />
                              حفظ
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">جميع الصفحات</TabsTrigger>
              <TabsTrigger value="published">منشورة</TabsTrigger>
              <TabsTrigger value="drafts">مسودات</TabsTrigger>
              <TabsTrigger value="footer">في التذييل</TabsTrigger>
              <TabsTrigger value="header">في الهيدر</TabsTrigger>
            </TabsList>
            
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>
                  {activeTab === 'all' && 'جميع الصفحات'}
                  {activeTab === 'published' && 'الصفحات المنشورة'}
                  {activeTab === 'drafts' && 'المسودات'}
                  {activeTab === 'footer' && 'صفحات التذييل'}
                  {activeTab === 'header' && 'صفحات الهيدر'}
                </CardTitle>
                <CardDescription>
                  {activeTab === 'all' && 'قائمة بجميع الصفحات الثابتة في الموقع'}
                  {activeTab === 'published' && 'الصفحات المنشورة والمتاحة للزوار'}
                  {activeTab === 'drafts' && 'المسودات غير المنشورة (صفحات قيد الإنشاء)'}
                  {activeTab === 'footer' && 'الصفحات التي تظهر في قائمة التذييل'}
                  {activeTab === 'header' && 'الصفحات التي تظهر في قائمة الهيدر'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span className="mr-2">جاري التحميل...</span>
                  </div>
                ) : isError ? (
                  <div className="text-center py-4 text-red-500">
                    <p>حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.</p>
                    <Button variant="outline" onClick={() => refetch()} className="mt-2">
                      إعادة المحاولة
                    </Button>
                  </div>
                ) : filteredPages.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>لا توجد صفحات في هذه الفئة حاليًا.</p>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(true)} className="mt-2">
                      إضافة صفحة جديدة
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10 text-right">الرقم</TableHead>
                          <TableHead className="text-right">العنوان</TableHead>
                          <TableHead className="text-right">المسار</TableHead>
                          <TableHead className="text-right w-[120px]">الحالة</TableHead>
                          <TableHead className="text-right">آخر تحديث</TableHead>
                          <TableHead className="text-left w-[180px]">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPages.map((page) => (
                          <TableRow key={page.id} className={!page.isPublished ? 'opacity-60' : ''}>
                            <TableCell>{page.id}</TableCell>
                            <TableCell className="font-medium">{page.title}</TableCell>
                            <TableCell dir="ltr">/{page.slug}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <span className={`px-2 py-1 rounded-full text-xs ${page.isPublished ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                  {page.isPublished ? 'منشورة' : 'مسودة'}
                                </span>
                                {page.showInFooter && (
                                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                    في التذييل
                                  </span>
                                )}
                                {page.showInHeader && (
                                  <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                    في الهيدر
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell dir="ltr" className="text-sm text-muted-foreground">
                              {new Date(page.updatedAt).toLocaleDateString('ar-SA')}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  onClick={() => handlePreview(page)}
                                  title="معاينة"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  onClick={() => togglePublish(page)}
                                  title={page.isPublished ? 'إلغاء النشر' : 'نشر'}
                                >
                                  {page.isPublished ? (
                                    <Archive className="h-4 w-4" />
                                  ) : (
                                    <FileText className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  onClick={() => handleEdit(page)}
                                  title="تعديل"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  className="text-red-500"
                                  onClick={() => handleDelete(page)}
                                  title="حذف"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </Tabs>

          {/* نافذة تعديل الصفحة */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>تعديل الصفحة</DialogTitle>
                <DialogDescription>
                  قم بتعديل محتوى الصفحة وإعداداتها. اضغط على حفظ عند الانتهاء.
                </DialogDescription>
              </DialogHeader>
              {selectedPage && (
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={editForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>عنوان الصفحة</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                onChange={handleTitleChangeEdit}
                                placeholder="مثال: من نحن" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={editForm.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>المسار المختصر (Slug)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="مثال: about" dir="ltr" />
                            </FormControl>
                            <FormDescription>
                              سيستخدم هذا في عنوان URL. يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={editForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>محتوى الصفحة</FormLabel>
                          <FormControl>
                            <RichTextEditor
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription>
                            يمكنك استخدام HTML لتنسيق المحتوى
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={editForm.control}
                        name="metaTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>عنوان ميتا (SEO)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="مثال: من نحن | FULLSCO" />
                            </FormControl>
                            <FormDescription>
                              عنوان الصفحة لمحركات البحث
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={editForm.control}
                        name="metaDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>وصف ميتا (SEO)</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="وصف قصير للصفحة لمحركات البحث" />
                            </FormControl>
                            <FormDescription>
                              وصف الصفحة الذي سيظهر في نتائج البحث
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField
                        control={editForm.control}
                        name="isPublished"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>نشر الصفحة</FormLabel>
                              <FormDescription>
                                هل هذه الصفحة منشورة؟
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={editForm.control}
                        name="showInFooter"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>عرض في التذييل</FormLabel>
                              <FormDescription>
                                هل تظهر في قائمة التذييل؟
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={editForm.control}
                        name="showInHeader"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>عرض في الهيدر</FormLabel>
                              <FormDescription>
                                هل تظهر في قائمة الهيدر؟
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? (
                          <>
                            <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                            جاري الحفظ...
                          </>
                        ) : (
                          <>
                            <Check className="ml-2 h-4 w-4" />
                            حفظ التغييرات
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              )}
            </DialogContent>
          </Dialog>

          {/* نافذة معاينة الصفحة */}
          <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>معاينة: {selectedPage?.title}</DialogTitle>
                <DialogDescription>
                  معاينة محتوى الصفحة كما سيظهر للمستخدمين
                </DialogDescription>
              </DialogHeader>
              {selectedPage && (
                <div className="p-4 border rounded-md bg-white">
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedPage.content }}
                  />
                </div>
              )}
              <DialogFooter>
                <Button 
                  variant="outline"
                  onClick={() => setIsPreviewDialogOpen(false)}
                >
                  إغلاق
                </Button>
                {selectedPage && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsPreviewDialogOpen(false);
                      handleEdit(selectedPage);
                    }}
                  >
                    <Edit className="ml-2 h-4 w-4" />
                    تعديل
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* نافذة تأكيد الحذف */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيتم حذف الصفحة "{selectedPage?.title}" بشكل نهائي. 
                  هذا الإجراء لا يمكن التراجع عنه.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
                  {deleteMutation.isPending ? (
                    <>
                      <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                      جارٍ الحذف...
                    </>
                  ) : (
                    'حذف'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  );
}