import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, cn } from "@/lib/utils";
import Sidebar from "@/components/admin/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  XCircle,
  Menu,
} from "lucide-react";
import { Scholarship, Country, Level, Category } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminScholarships = () => {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch scholarships
  const {
    data: scholarships,
    isLoading,
    error,
  } = useQuery<Scholarship[]>({
    queryKey: ["/api/scholarships"],
    enabled: isAuthenticated,
  });

  // Fetch related data
  const { data: countries } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
    enabled: isAuthenticated,
  });

  const { data: levels } = useQuery<Level[]>({
    queryKey: ["/api/levels"],
    enabled: isAuthenticated,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated,
  });

  // Delete scholarship mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/scholarships/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "تم حذف المنحة",
        description: "تم حذف المنحة الدراسية بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scholarships"] });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: `فشل في حذف المنحة: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      deleteMutation.mutate(deleteId);
    }
  };

  const getCountryName = (countryId?: number) => {
    if (!countryId || !countries) return "";
    const country = countries.find((c) => c.id === countryId);
    return country?.name || "";
  };

  const getLevelName = (levelId?: number) => {
    if (!levelId || !levels) return "";
    const level = levels.find((l) => l.id === levelId);
    return level?.name || "";
  };

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId || !categories) return "";
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "";
  };

  const filteredScholarships = scholarships?.filter((scholarship) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      scholarship.title.toLowerCase().includes(search) ||
      scholarship.description.toLowerCase().includes(search) ||
      getCountryName(scholarship.countryId).toLowerCase().includes(search) ||
      getLevelName(scholarship.levelId).toLowerCase().includes(search)
    );
  });

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
          console.log('Scholarships: closing sidebar');
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
              <h1 className="text-xl md:text-2xl font-bold">إدارة المنح الدراسية</h1>
            </div>
            <Link href="/admin/scholarships/create">
              <Button className="flex items-center w-full sm:w-auto shadow-soft">
                <PlusCircle className="ml-2 h-4 w-4" /> إضافة منحة جديدة
              </Button>
            </Link>
          </div>

          <div className="bg-card p-4 md:p-6 rounded-lg shadow-soft mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن المنح..."
                  className="pr-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredScholarships?.length || 0} منحة دراسية
              </div>
            </div>

            {isLoading ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                <p className="mt-2 text-muted-foreground">جاري تحميل المنح الدراسية...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <XCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
                <h3 className="text-lg font-medium mb-1">
                  خطأ في تحميل المنح الدراسية
                </h3>
                <p className="text-muted-foreground">يرجى المحاولة مرة أخرى لاحقًا.</p>
              </div>
            ) : filteredScholarships && filteredScholarships.length > 0 ? (
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العنوان</TableHead>
                      <TableHead className="hidden md:table-cell">الدولة</TableHead>
                      <TableHead className="hidden md:table-cell">المستوى</TableHead>
                      <TableHead className="hidden lg:table-cell">الموعد النهائي</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead className="text-left">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredScholarships.map((scholarship) => (
                      <TableRow key={scholarship.id}>
                        <TableCell className="font-medium">
                          {scholarship.title}
                          <div className="md:hidden text-xs text-muted-foreground mt-1">
                            {getCountryName(scholarship.countryId)} • {getLevelName(scholarship.levelId)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {getCountryName(scholarship.countryId)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {getLevelName(scholarship.levelId)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {scholarship.deadline || "مستمر"}
                        </TableCell>
                        <TableCell>
                          {scholarship.isFeatured ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">مميز</Badge>
                          ) : (
                            <Badge variant="secondary">عادي</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-start gap-2">
                            <Link
                              href={`/scholarships/${scholarship.slug}`}
                              target="_blank"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link
                              href={`/admin/scholarships/edit/${scholarship.id}`}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                              onClick={() => handleDeleteClick(scholarship.id)}
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
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  لم يتم العثور على منح دراسية. قم بإنشاء أول منحة باستخدام زر "إضافة منحة جديدة".
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* نافذة تأكيد الحذف */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف المنحة الدراسية</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف هذه المنحة؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "جاري الحذف..." : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminScholarships;
