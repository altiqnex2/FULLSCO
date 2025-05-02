import { useState, useEffect } from 'react';
import { useLocation, Redirect } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import Sidebar from '@/components/admin/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  Menu,
  Loader2,
  Bell,
  User,
  Settings,
  LogOut,
  Search,
  Sun,
  Moon
} from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from '@/components/notifications/notification-provider';
import { Input } from '@/components/ui/input';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
}

const AdminLayout = ({ children, title, actions, breadcrumbs }: AdminLayoutProps) => {
  const { isLoading: authLoading, isAuthenticated, isAdmin, user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const [, navigate] = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      // إذا كان المستخدم مسجل دخول ولكن ليس لديه صلاحية مدير
      navigate('/');
    }

    // تحقق من وضع السمة (theme)
    const savedTheme = localStorage.getItem('admin-theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate]);

  // تبديل وضع السمة
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('admin-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // في حالة جاري التحميل
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-gray-900">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">جاري تحميل لوحة التحكم...</p>
      </div>
    );
  }

  // في حالة عدم تسجيل الدخول أو ليس مدير
  if (!isAuthenticated || !isAdmin) {
    return null; // سيتم التوجيه بواسطة useEffect
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className={`min-h-screen bg-background dark:bg-gray-900 flex text-foreground dark:text-gray-100`} dir="rtl">
      {/* السايدبار */}
      <Sidebar 
        isMobileOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* المحتوى الرئيسي */}
      <main 
        className={cn(
          "flex-1 min-h-screen transition-all duration-300 flex flex-col",
          !isMobile && "mr-64"
        )}
      >
        {/* الهيدر */}
        <header className="sticky top-0 z-30 border-b bg-background/95 dark:bg-gray-900/95 backdrop-blur py-3 px-4 shadow-sm">
          <div className="flex items-center justify-between max-w-full mx-auto">
            <div className="flex items-center gap-2">
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
              <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {/* بحث عام */}
              <div className="relative hidden md:block ml-2">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث سريع..."
                  className="pl-3 pr-9 w-[300px] bg-white dark:bg-gray-800"
                />
              </div>
              
              {/* زر تبديل الثيم */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleTheme}
                className="ml-1"
              >
                {theme === 'light' ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />}
              </Button>
              
              {/* زر الإشعارات */}
              <NotificationBell />
              
              {/* قائمة المستخدم */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {user ? 'AD' : 'UN'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center cursor-pointer"
                    onClick={() => navigate('/admin/profile')}
                  >
                    <User className="ml-2 h-4 w-4" />
                    الملف الشخصي
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center cursor-pointer"
                    onClick={() => navigate('/admin/settings')}
                  >
                    <Settings className="ml-2 h-4 w-4" />
                    الإعدادات
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center text-red-500 hover:text-red-500 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* أزرار إضافية - إذا كانت موجودة */}
              {actions && (
                <>
                  <Separator orientation="vertical" className="h-6 mx-2" />
                  <div className="flex items-center gap-2">
                    {actions}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* مسار التنقل */}
        {breadcrumbs && (
          <div className="bg-muted/30 dark:bg-gray-800/30 px-4 py-2 text-sm text-muted-foreground">
            {breadcrumbs}
          </div>
        )}

        {/* المحتوى */}
        <div className="flex-grow p-4 md:p-6">
          {children}
        </div>
        
        {/* تذييل الصفحة */}
        <footer className="py-3 px-6 text-center border-t text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} FULLSCO. جميع الحقوق محفوظة.</p>
        </footer>
      </main>
      
      {/* مكون الإشعارات */}
      <Toaster />
    </div>
  );
};

export default AdminLayout;