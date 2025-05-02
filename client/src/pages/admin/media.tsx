import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, RefreshCw, X, Menu, Image as ImageIcon, File, Trash2, Download, Copy, CheckCircle, Filter, Grid, List, Search, UploadCloud } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/admin/sidebar';

// زودج سكيما للتحقق من صحة البيانات
const mediaFileSchema = z.object({
  title: z.string().optional(),
  alt: z.string().optional(),
  file: z.instanceof(File).optional(),
  url: z.string().url('يجب أن يكون رابط صالح').optional(),
});

type MediaFileFormValues = z.infer<typeof mediaFileSchema>;

// واجهة ملف الوسائط
interface MediaFile {
  id: number;
  filename: string;
  originalFilename: string;
  url: string;
  mimeType: string;
  size: number;
  title?: string;
  alt?: string;
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
}

export default function MediaManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileType, setFileType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('newest');
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // استلام ملفات الوسائط من الخادم
  const { data: mediaFiles, isLoading, isError, refetch } = useQuery<MediaFile[]>({
    queryKey: ['/api/media'],
    queryFn: async () => {
      try {
        // سنضيف نقطة نهاية API لاحقًا - في الوقت الحالي استخدم بيانات تجريبية للتطوير
        // const response = await fetch('/api/media');
        // if (!response.ok) throw new Error('فشل في استلام ملفات الوسائط');
        // return response.json();
        
        // بيانات تجريبية للعرض أثناء التطوير
        return [
          {
            id: 1,
            filename: 'scholarship-thumbnail-1.jpg',
            originalFilename: 'scholarship_image_1.jpg',
            url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            mimeType: 'image/jpeg',
            size: 153000,
            title: 'منحة فولبرايت الصورة الرئيسية',
            alt: 'طلاب يدرسون في مكتبة',
            width: 800,
            height: 600,
            createdAt: '2025-02-10T12:00:00Z',
            updatedAt: '2025-02-10T12:00:00Z',
          },
          {
            id: 2,
            filename: 'ebook-scholarship-guide.pdf',
            originalFilename: 'Ultimate Scholarship Guide 2025.pdf',
            url: 'https://example.com/files/ebook-scholarship-guide.pdf',
            mimeType: 'application/pdf',
            size: 2500000,
            title: 'دليل المنح الدراسية 2025',
            createdAt: '2025-02-05T10:30:00Z',
            updatedAt: '2025-02-05T10:30:00Z',
          },
          {
            id: 3,
            filename: 'university-campus.jpg',
            originalFilename: 'university_campus.jpg',
            url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            mimeType: 'image/jpeg',
            size: 245000,
            title: 'حرم جامعي',
            alt: 'صورة لحرم جامعي',
            width: 1200,
            height: 800,
            createdAt: '2025-01-28T09:15:00Z',
            updatedAt: '2025-01-28T09:15:00Z',
          },
          {
            id: 4,
            filename: 'scholarship-application-template.docx',
            originalFilename: 'Scholarship Application Template.docx',
            url: 'https://example.com/files/scholarship-application-template.docx',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            size: 125000,
            title: 'نموذج طلب منحة دراسية',
            createdAt: '2025-01-20T15:45:00Z',
            updatedAt: '2025-01-20T15:45:00Z',
          },
          {
            id: 5,
            filename: 'student-studying.jpg',
            originalFilename: 'student_study_abroad.jpg',
            url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            mimeType: 'image/jpeg',
            size: 198000,
            title: 'طالب يدرس في الخارج',
            alt: 'طالب يدرس في مكتبة في الخارج',
            width: 900,
            height: 600,
            createdAt: '2025-01-15T11:20:00Z',
            updatedAt: '2025-01-15T11:20:00Z',
          },
          {
            id: 6,
            filename: 'scholarship-budget-template.xlsx',
            originalFilename: 'Scholarship Budget Planner.xlsx',
            url: 'https://example.com/files/scholarship-budget-template.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            size: 75000,
            title: 'نموذج ميزانية المنحة الدراسية',
            createdAt: '2025-01-10T14:30:00Z',
            updatedAt: '2025-01-10T14:30:00Z',
          },
          {
            id: 7,
            filename: 'graduation-ceremony.jpg',
            originalFilename: 'graduation_ceremony_2024.jpg',
            url: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            mimeType: 'image/jpeg',
            size: 310000,
            title: 'حفل تخرج 2024',
            alt: 'طلاب في حفل تخرج',
            width: 1500,
            height: 1000,
            createdAt: '2025-01-05T08:45:00Z',
            updatedAt: '2025-01-05T08:45:00Z',
          },
          {
            id: 8,
            filename: 'scholarship-presentation.pptx',
            originalFilename: 'How to Win Scholarships.pptx',
            url: 'https://example.com/files/scholarship-presentation.pptx',
            mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            size: 3200000,
            title: 'عرض تقديمي: كيفية الفوز بالمنح الدراسية',
            createdAt: '2024-12-28T16:15:00Z',
            updatedAt: '2024-12-28T16:15:00Z',
          },
        ] as MediaFile[];
      } catch (error) {
        console.error('Error fetching media files:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
  });

  // رفع ملف وسائط جديد
  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // سيتم إضافة نقطة نهاية API لاحقًا
      // const response = await fetch('/api/media/upload', {
      //   method: 'POST',
      //   body: data,
      // });
      // if (!response.ok) throw new Error('فشل في رفع الملف');
      // return response.json();
      
      // محاكاة استجابة API
      const file = data.get('file') as File;
      const title = data.get('title') as string;
      const alt = data.get('alt') as string;
      
      if (!file) {
        throw new Error('لم يتم تحديد ملف');
      }
      
      const now = new Date().toISOString();
      const id = Math.max(0, ...mediaFiles?.map(file => file.id) || []) + 1;
      
      return {
        id,
        filename: file.name.toLowerCase().replace(/\s+/g, '-'),
        originalFilename: file.name,
        url: URL.createObjectURL(file),
        mimeType: file.type,
        size: file.size,
        title: title || undefined,
        alt: alt || undefined,
        width: file.type.startsWith('image/') ? 800 : undefined,
        height: file.type.startsWith('image/') ? 600 : undefined,
        createdAt: now,
        updatedAt: now,
      } as MediaFile;
    },
    onSuccess: (newFile) => {
      queryClient.setQueryData(['/api/media'], (old: MediaFile[] | undefined) => 
        [...(old || []), newFile]
      );
      toast({ title: 'تم الرفع بنجاح', description: 'تم رفع الملف بنجاح' });
      setIsUploadDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في رفع الملف: ${error.message}`, variant: 'destructive' });
    },
  });

  // تحديث معلومات ملف وسائط
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: { title?: string, alt?: string } }) => {
      // سيتم إضافة نقطة نهاية API لاحقًا
      // const response = await fetch(`/api/media/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      // if (!response.ok) throw new Error('فشل في تحديث معلومات الملف');
      // return response.json();
      
      // محاكاة استجابة API
      const file = mediaFiles?.find(file => file.id === id);
      
      if (!file) {
        throw new Error('الملف غير موجود');
      }
      
      return {
        ...file,
        ...data,
        updatedAt: new Date().toISOString(),
      } as MediaFile;
    },
    onSuccess: (updatedFile) => {
      queryClient.setQueryData(['/api/media'], (old: MediaFile[] | undefined) => 
        (old || []).map(file => file.id === updatedFile.id ? updatedFile : file)
      );
      toast({ title: 'تم التحديث بنجاح', description: 'تم تحديث معلومات الملف بنجاح' });
      setIsDetailsDialogOpen(false);
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في تحديث معلومات الملف: ${error.message}`, variant: 'destructive' });
    },
  });

  // حذف ملف وسائط
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      // سيتم إضافة نقطة نهاية API لاحقًا
      // const response = await fetch(`/api/media/${id}`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) throw new Error('فشل في حذف الملف');
      // return response.json();
      
      // محاكاة استجابة API
      return { success: true, id };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/media'], (old: MediaFile[] | undefined) => 
        (old || []).filter(file => file.id !== data.id)
      );
      toast({ title: 'تم الحذف بنجاح', description: 'تم حذف الملف بنجاح' });
      setIsDeleteDialogOpen(false);
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في حذف الملف: ${error.message}`, variant: 'destructive' });
    },
  });

  // حذف مجموعة من ملفات الوسائط
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      // سيتم إضافة نقطة نهاية API لاحقًا
      // const response = await fetch(`/api/media/bulk-delete`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ids }),
      // });
      // if (!response.ok) throw new Error('فشل في حذف الملفات');
      // return response.json();
      
      // محاكاة استجابة API
      return { success: true, ids };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/media'], (old: MediaFile[] | undefined) => 
        (old || []).filter(file => !data.ids.includes(file.id))
      );
      toast({ title: 'تم الحذف بنجاح', description: `تم حذف ${data.ids.length} ملفات بنجاح` });
      setSelectedFiles([]);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في حذف الملفات: ${error.message}`, variant: 'destructive' });
    },
  });

  // نموذج رفع ملف جديد
  const uploadForm = useForm<MediaFileFormValues>({
    resolver: zodResolver(mediaFileSchema),
    defaultValues: {
      title: '',
      alt: '',
      file: undefined,
    },
  });

  // نموذج تعديل معلومات الملف
  const detailsForm = useForm<{ title: string, alt: string }>({
    defaultValues: {
      title: selectedFile?.title || '',
      alt: selectedFile?.alt || '',
    },
  });

  // تحديث نموذج تفاصيل الملف عند تغيير الملف المحدد
  useEffect(() => {
    if (selectedFile) {
      detailsForm.reset({
        title: selectedFile.title || '',
        alt: selectedFile.alt || '',
      });
    }
  }, [selectedFile, detailsForm]);

  // فلترة الملفات حسب معايير البحث
  const filteredFiles = mediaFiles?.filter(file => {
    // فلترة حسب البحث
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        file.filename.toLowerCase().includes(search) ||
        file.originalFilename.toLowerCase().includes(search) ||
        (file.title && file.title.toLowerCase().includes(search)) ||
        (file.alt && file.alt.toLowerCase().includes(search))
      );
    }
    
    // فلترة حسب نوع الملف
    if (fileType !== 'all') {
      if (fileType === 'image' && !file.mimeType.startsWith('image/')) return false;
      if (fileType === 'document' && !(
        file.mimeType.includes('pdf') ||
        file.mimeType.includes('word') ||
        file.mimeType.includes('excel') ||
        file.mimeType.includes('spreadsheet') ||
        file.mimeType.includes('text')
      )) return false;
      if (fileType === 'other' && (
        file.mimeType.startsWith('image/') ||
        file.mimeType.includes('pdf') ||
        file.mimeType.includes('word') ||
        file.mimeType.includes('excel') ||
        file.mimeType.includes('spreadsheet') ||
        file.mimeType.includes('text')
      )) return false;
    }
    
    return true;
  }) || [];

  // ترتيب الملفات
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'name_asc') return a.filename.localeCompare(b.filename);
    if (sortBy === 'name_desc') return b.filename.localeCompare(a.filename);
    if (sortBy === 'size_asc') return a.size - b.size;
    if (sortBy === 'size_desc') return b.size - a.size;
    return 0;
  });

  // التحقق من اختيار ملف
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      uploadForm.setValue('file', files[0]);
    }
  };

  // تنفيذ رفع الملف
  const handleUploadFile = (data: MediaFileFormValues) => {
    if (!data.file) {
      toast({ title: 'خطأ!', description: 'يرجى اختيار ملف للرفع', variant: 'destructive' });
      return;
    }
    
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.title) formData.append('title', data.title);
    if (data.alt) formData.append('alt', data.alt);
    
    uploadMutation.mutate(formData);
  };

  // تنفيذ تحديث معلومات الملف
  const handleUpdateFile = (data: { title: string, alt: string }) => {
    if (selectedFile) {
      updateMutation.mutate({
        id: selectedFile.id,
        data: {
          title: data.title || undefined,
          alt: data.alt || undefined,
        },
      });
    }
  };

  // التبديل بين تحديد ملف
  const toggleFileSelection = (id: number) => {
    setSelectedFiles(prev => 
      prev.includes(id)
        ? prev.filter(fileId => fileId !== id)
        : [...prev, id]
    );
  };

  // التحقق مما إذا كان الملف محدد
  const isFileSelected = (id: number) => {
    return selectedFiles.includes(id);
  };

  // تحديد جميع الملفات
  const selectAllFiles = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(file => file.id));
    }
  };

  // نسخ رابط الملف إلى الحافظة
  const copyFileUrl = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        toast({ title: 'تم النسخ', description: 'تم نسخ رابط الملف إلى الحافظة' });
      })
      .catch(error => {
        toast({ title: 'خطأ!', description: 'فشل في نسخ الرابط', variant: 'destructive' });
        console.error('Failed to copy URL:', error);
      });
  };

  // تنسيق حجم الملف
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // الحصول على أيقونة الملف حسب نوعه
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-6 w-6" />;
    return <File className="h-6 w-6" />;
  };

  // الحصول على اسم مختصر للملف
  const getShortFileName = (filename: string, maxLength = 20) => {
    if (filename.length <= maxLength) return filename;
    
    const extension = filename.split('.').pop() || '';
    const nameWithoutExtension = filename.slice(0, filename.lastIndexOf('.'));
    
    if (nameWithoutExtension.length <= maxLength - extension.length - 1) {
      return filename;
    }
    
    return nameWithoutExtension.slice(0, maxLength - extension.length - 4) + '...' + extension;
  };

  // إعادة ضبط نموذج الرفع عند فتح نافذة الرفع
  useEffect(() => {
    if (isUploadDialogOpen) {
      uploadForm.reset({
        title: '',
        alt: '',
        file: undefined,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isUploadDialogOpen, uploadForm]);

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
          console.log('Media: closing sidebar');
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
              <h1 className="text-xl md:text-2xl font-bold">مكتبة الوسائط</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="ml-2 h-4 w-4" />
                تحديث
              </Button>
              
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    رفع ملف جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>رفع ملف وسائط جديد</DialogTitle>
                    <DialogDescription>
                      قم برفع ملف جديد إلى مكتبة الوسائط. يمكنك رفع صور، مستندات، وملفات أخرى.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...uploadForm}>
                    <form onSubmit={uploadForm.handleSubmit(handleUploadFile)} className="space-y-4">
                      <FormField
                        control={uploadForm.control}
                        name="file"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                          <FormItem>
                            <FormLabel>اختر ملفًا</FormLabel>
                            <FormControl>
                              <div className="grid gap-2">
                                <Input
                                  ref={fileInputRef}
                                  type="file"
                                  onChange={handleFileChange}
                                  className="file:text-foreground-muted file:bg-muted"
                                  {...fieldProps}
                                />
                                {value && (
                                  <div className="text-sm text-muted-foreground">
                                    الملف المختار: {(value as File).name} ({formatFileSize((value as File).size)})
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormDescription>
                              الحد الأقصى لحجم الملف: 10 ميجابايت. الأنواع المدعومة: JPG، PNG، GIF، PDF، DOCX، XLSX، PPTX.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={uploadForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>عنوان الملف (اختياري)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="مثال: صورة الحرم الجامعي" />
                            </FormControl>
                            <FormDescription>
                              عنوان وصفي يساعد في التعرف على الملف
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={uploadForm.control}
                        name="alt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>نص بديل (اختياري)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="وصف الصورة للقراء الشاشة" />
                            </FormControl>
                            <FormDescription>
                              نص بديل للصور لتحسين إمكانية الوصول وSEO
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit" disabled={uploadMutation.isPending || !uploadForm.getValues('file')}>
                          {uploadMutation.isPending ? (
                            <>
                              <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                              جاري الرفع...
                            </>
                          ) : (
                            <>
                              <UploadCloud className="ml-2 h-4 w-4" />
                              رفع الملف
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

          {/* أدوات الفلترة والبحث */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في الوسائط..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={fileType} onValueChange={setFileType}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="ml-2 h-4 w-4" />
                  <SelectValue placeholder="جميع الملفات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الملفات</SelectItem>
                  <SelectItem value="image">صور</SelectItem>
                  <SelectItem value="document">مستندات</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="الأحدث أولاً" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث أولاً</SelectItem>
                  <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                  <SelectItem value="name_asc">الاسم (أ-ي)</SelectItem>
                  <SelectItem value="name_desc">الاسم (ي-أ)</SelectItem>
                  <SelectItem value="size_asc">الحجم (الأصغر أولاً)</SelectItem>
                  <SelectItem value="size_desc">الحجم (الأكبر أولاً)</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="icon"
                title="عرض الشبكة"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-muted' : ''}
              >
                <Grid className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                title="عرض القائمة"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-muted' : ''}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* شريط أدوات المجموعة */}
          {selectedFiles.length > 0 && (
            <div className="bg-muted py-2 px-4 rounded-md mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                  onCheckedChange={selectAllFiles}
                  id="select-all"
                />
                <label htmlFor="select-all" className="text-sm cursor-pointer">
                  {selectedFiles.length} ملفات محددة
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500"
                  onClick={() => bulkDeleteMutation.mutate(selectedFiles)}
                  disabled={bulkDeleteMutation.isPending}
                >
                  {bulkDeleteMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span className="mr-2">حذف المحدد</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFiles([])}
                >
                  <X className="h-4 w-4" />
                  <span className="mr-2">إلغاء التحديد</span>
                </Button>
              </div>
            </div>
          )}

          {/* محتوى الوسائط */}
          <Card>
            <CardContent className="p-6">
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
              ) : sortedFiles.length === 0 ? (
                <div className="text-center py-10">
                  {searchTerm || fileType !== 'all' ? (
                    <div className="space-y-2">
                      <p className="text-muted-foreground">لا توجد ملفات تطابق معايير البحث</p>
                      <Button variant="outline" onClick={() => { setSearchTerm(''); setFileType('all'); }}>
                        إعادة ضبط البحث
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="mx-auto p-6 bg-muted rounded-full w-20 h-20 flex items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-lg">مكتبة الوسائط فارغة</h3>
                      <p className="text-muted-foreground">قم برفع ملفات الوسائط لاستخدامها في الموقع</p>
                      <Button onClick={() => setIsUploadDialogOpen(true)}>
                        <UploadCloud className="ml-2 h-4 w-4" />
                        رفع الملفات
                      </Button>
                    </div>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {sortedFiles.map(file => (
                    <div key={file.id} className="relative group">
                      <div 
                        className={cn(
                          "border rounded-md overflow-hidden",
                          isFileSelected(file.id) && "ring-2 ring-primary"
                        )}
                      >
                        {/* تحديد الملف */}
                        <div className="absolute top-2 right-2 z-20">
                          <Checkbox
                            checked={isFileSelected(file.id)}
                            onCheckedChange={() => toggleFileSelection(file.id)}
                            className="bg-background/80 data-[state=checked]:bg-primary"
                          />
                        </div>
                        
                        {/* معاينة الملف */}
                        <div 
                          className="h-32 flex items-center justify-center bg-muted/50 cursor-pointer"
                          onClick={() => {
                            setSelectedFile(file);
                            setIsDetailsDialogOpen(true);
                          }}
                        >
                          {file.mimeType.startsWith('image/') ? (
                            <img 
                              src={file.url} 
                              alt={file.alt || file.title || file.filename} 
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <div className="text-center">
                              {getFileIcon(file.mimeType)}
                              <div className="text-xs mt-1 text-muted-foreground">
                                {file.mimeType.split('/')[1]?.toUpperCase()}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* معلومات الملف */}
                        <div className="p-2">
                          <h3 className="text-sm font-medium truncate" title={file.title || file.originalFilename}>
                            {file.title || getShortFileName(file.originalFilename)}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        
                        {/* أزرار الإجراءات */}
                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-2 transition-opacity">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => copyFileUrl(file.url)}
                              title="نسخ الرابط"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => window.open(file.url, '_blank')}
                              title="تنزيل"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-red-500"
                              onClick={() => {
                                setSelectedFile(file);
                                setIsDeleteDialogOpen(true);
                              }}
                              title="حذف"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right px-2 py-2 whitespace-nowrap w-10">
                          <Checkbox
                            checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                            onCheckedChange={selectAllFiles}
                          />
                        </th>
                        <th className="text-right px-4 py-2 whitespace-nowrap font-medium">اسم الملف</th>
                        <th className="text-right px-4 py-2 whitespace-nowrap font-medium">النوع</th>
                        <th className="text-right px-4 py-2 whitespace-nowrap font-medium">الحجم</th>
                        <th className="text-right px-4 py-2 whitespace-nowrap font-medium">تاريخ الرفع</th>
                        <th className="text-left px-4 py-2 whitespace-nowrap font-medium">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedFiles.map(file => (
                        <tr key={file.id} className="border-b hover:bg-muted/30">
                          <td className="text-right px-2 py-2 whitespace-nowrap">
                            <Checkbox
                              checked={isFileSelected(file.id)}
                              onCheckedChange={() => toggleFileSelection(file.id)}
                            />
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getFileIcon(file.mimeType)}
                              <div>
                                <div className="font-medium truncate max-w-xs" title={file.title || file.originalFilename}>
                                  {file.title || file.originalFilename}
                                </div>
                                <div className="text-xs text-muted-foreground" dir="ltr">
                                  {file.filename}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm" dir="ltr">
                            {file.mimeType}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {formatFileSize(file.size)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {new Date(file.createdAt).toLocaleDateString('ar-SA')}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedFile(file);
                                  setIsDetailsDialogOpen(true);
                                }}
                                title="تفاصيل"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => copyFileUrl(file.url)}
                                title="نسخ الرابط"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => window.open(file.url, '_blank')}
                                title="تنزيل"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-500"
                                onClick={() => {
                                  setSelectedFile(file);
                                  setIsDeleteDialogOpen(true);
                                }}
                                title="حذف"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* نافذة تفاصيل الملف */}
          <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>تفاصيل الملف</DialogTitle>
                <DialogDescription>
                  عرض وتعديل بيانات الملف
                </DialogDescription>
              </DialogHeader>
              {selectedFile && (
                <div className="space-y-4">
                  {/* معاينة الملف */}
                  <div className="flex justify-center bg-muted/50 rounded-md p-4 max-h-72 overflow-hidden">
                    {selectedFile.mimeType.startsWith('image/') ? (
                      <img 
                        src={selectedFile.url} 
                        alt={selectedFile.alt || selectedFile.title || selectedFile.filename} 
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        {getFileIcon(selectedFile.mimeType)}
                        <div className="text-sm mt-1 text-muted-foreground">
                          {selectedFile.mimeType.split('/')[1]?.toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* معلومات الملف */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">اسم الملف:</div>
                      <div dir="ltr" className="text-muted-foreground break-all">
                        {selectedFile.filename}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">الحجم:</div>
                      <div className="text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">نوع الملف:</div>
                      <div dir="ltr" className="text-muted-foreground">
                        {selectedFile.mimeType}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">تاريخ الرفع:</div>
                      <div className="text-muted-foreground">
                        {new Date(selectedFile.createdAt).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                    {selectedFile.width && selectedFile.height && (
                      <div>
                        <div className="font-medium">الأبعاد:</div>
                        <div dir="ltr" className="text-muted-foreground">
                          {selectedFile.width} × {selectedFile.height}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="font-medium">الرابط:</div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyFileUrl(selectedFile.url)}
                          title="نسخ الرابط"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <span dir="ltr" className="text-xs text-muted-foreground truncate max-w-48">
                          {selectedFile.url}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* نموذج تعديل العنوان والوصف */}
                  <form onSubmit={detailsForm.handleSubmit(handleUpdateFile)} className="space-y-4 pt-4 border-t">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="title" className="text-sm font-medium leading-none">
                          عنوان الملف
                        </label>
                        <Input
                          id="title"
                          placeholder="أدخل عنوانًا وصفيًا للملف"
                          {...detailsForm.register('title')}
                        />
                        <p className="text-sm text-muted-foreground">
                          عنوان وصفي يساعد في التعرف على الملف
                        </p>
                      </div>
                      
                      {selectedFile.mimeType.startsWith('image/') && (
                        <div className="grid gap-2">
                          <label htmlFor="alt" className="text-sm font-medium leading-none">
                            النص البديل
                          </label>
                          <Input
                            id="alt"
                            placeholder="وصف للصورة للقراء الشاشة"
                            {...detailsForm.register('alt')}
                          />
                          <p className="text-sm text-muted-foreground">
                            نص بديل للصور لتحسين إمكانية الوصول وSEO
                          </p>
                        </div>
                      )}
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
                            <CheckCircle className="ml-2 h-4 w-4" />
                            حفظ التغييرات
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* نافذة تأكيد الحذف */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيتم حذف الملف "{selectedFile?.title || selectedFile?.originalFilename}" بشكل نهائي.
                  هذا الإجراء لا يمكن التراجع عنه.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => selectedFile && deleteMutation.mutate(selectedFile.id)}
                  className="bg-red-500 hover:bg-red-600"
                >
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