import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { 
  LayoutDashboard, 
  GraduationCap, 
  FileText, 
  Users, 
  Settings, 
  Search, 
  BarChart, 
  LogOut,
  Menu,
  X,
  Home,
  FolderTree,
  School,
  Globe,
  MapPin,
  Palette,
  FileEdit,
  ListTree,
  ImageIcon,
  ShieldCheck,
  Database,
  ChevronDown,
  ChevronLeft,
  BookOpen,
  Newspaper,
  Trophy,
  Bell,
  Mail,
  MessageSquare,
  Sparkles,
  Award,
  PanelLeft,
  MoveHorizontal,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { NotificationBell } from '@/components/notifications/notification-provider';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

type NavItem = {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: NavItem[];
  badge?: string;
  badgeColor?: string;
};

// تجميع العناصر في مجموعات منطقية
const navItems: NavItem[] = [
  { href: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard },
  
  { 
    label: 'إدارة المنح',
    icon: GraduationCap,
    items: [
      { href: '/admin/scholarships', label: 'المنح الدراسية', icon: GraduationCap, badge: '24', badgeColor: 'bg-blue-500' },
      { href: '/admin/scholarships/create', label: 'إضافة منحة جديدة', icon: FileEdit },
      { href: '/admin/categories', label: 'التصنيفات', icon: FolderTree },
      { href: '/admin/levels', label: 'المستويات الدراسية', icon: School },
      { href: '/admin/countries', label: 'الدول', icon: Globe, badge: 'جديد', badgeColor: 'bg-green-500' },
    ]
  },
  
  { 
    label: 'المحتوى', 
    icon: FileText,
    items: [
      { href: '/admin/posts', label: 'المقالات', icon: Newspaper, badge: '18', badgeColor: 'bg-blue-500' },
      { href: '/admin/posts/create', label: 'إضافة مقال جديد', icon: FileEdit },
      { href: '/admin/pages', label: 'الصفحات الثابتة', icon: BookOpen },
      { href: '/admin/menus', label: 'القوائم والروابط', icon: ListTree },
      { href: '/admin/media', label: 'مكتبة الوسائط', icon: ImageIcon },
      { href: '/admin/success-stories', label: 'قصص النجاح', icon: Trophy, badge: 'جديد', badgeColor: 'bg-green-500' },
    ]
  },
  
  { 
    label: 'إدارة المستخدمين',
    icon: Users,
    items: [
      { href: '/admin/users', label: 'المستخدمين', icon: Users, badge: '240+', badgeColor: 'bg-blue-500' },
      { href: '/admin/roles', label: 'الأدوار والتصاريح', icon: ShieldCheck },
      { href: '/admin/subscribers', label: 'المشتركين', icon: Mail, badge: '12', badgeColor: 'bg-orange-500' },
      { href: '/admin/messages', label: 'الرسائل', icon: MessageSquare, badge: '5', badgeColor: 'bg-red-500' },
    ]
  },
  
  { 
    label: 'تخصيص الموقع',
    icon: Palette,
    items: [
      { href: '/admin/site-settings', label: 'الإعدادات العامة', icon: Settings },
      { href: '/admin/appearance', label: 'المظهر والألوان', icon: LayoutGrid },
      { href: '/admin/home-layout', label: 'تخصيص الرئيسية', icon: PanelLeft },
    ]
  },
  
  { 
    label: 'تحليلات وإعدادات',
    icon: BarChart,
    items: [
      { href: '/admin/analytics', label: 'تحليلات الزيارات', icon: BarChart },
      { href: '/admin/seo', label: 'تحسين محركات البحث', icon: Search },
      { href: '/admin/backups', label: 'النسخ الاحتياطي', icon: Database },
    ]
  },
];

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isMobileOpen, onClose }: SidebarProps) => {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const isMobile = useIsMobile();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  // للكشف عن المجموعة النشطة تلقائيًا
  useEffect(() => {
    // تمديد المجموعة التي تحتوي على الرابط النشط تلقائيًا
    const newExpandedGroups: Record<string, boolean> = {};
    
    navItems.forEach((item, index) => {
      if (item.items) {
        const hasActiveItem = item.items.some(subItem => subItem.href === location);
        if (hasActiveItem) {
          newExpandedGroups[`group-${index}`] = true;
        }
      }
    });
    
    setExpandedGroups(prevState => ({
      ...prevState,
      ...newExpandedGroups
    }));
  }, [location]);
  
  // إزالة تعليق overflow من الجسم عند تنظيف المكون
  useEffect(() => {
    // إعادة تمكين التمرير عند تفكيك المكون
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // معالجة فتح وإغلاق السايدبار
  useEffect(() => {
    if (isMobile) {
      if (isMobileOpen) {
        // فتح السايدبار في وضع الموبايل
        document.body.style.overflow = 'hidden'; // منع التمرير في الخلفية
      } else {
        // إغلاق السايدبار في وضع الموبايل
        document.body.style.overflow = ''; // إعادة تمكين التمرير
      }
    } else {
      // تأكد من إعادة تمكين التمرير دائمًا في وضع سطح المكتب
      document.body.style.overflow = '';
    }
  }, [isMobileOpen, isMobile]);

  const handleLogout = () => {
    // إعادة تمكين التمرير قبل تسجيل الخروج
    document.body.style.overflow = '';
    logout();
  };

  const isActive = (path: string) => location === path;
  
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };
  
  return (
    <>
      {/* طبقة التظليل خلف السايدبار عند فتحه في الموبايل */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* السايدبار */}
      <aside 
        ref={sidebarRef}
        className={cn(
          "bg-background dark:bg-gray-900 flex flex-col border-r dark:border-gray-800 shadow-lg z-50 transition-all duration-300 ease-in-out",
          isMobile 
            ? "fixed inset-y-0 right-0 w-74 transform" 
            : "w-64 h-screen sticky top-0"
        )}
        style={{
          transform: isMobile 
            ? isMobileOpen ? 'translateX(0)' : 'translateX(100%)' 
            : 'none'
        }}
        aria-hidden={isMobile && !isMobileOpen}
      >
        {/* زر الإغلاق - تم تغيير الموضع ليناسب الاتجاه العربي RTL */}
        {isMobile && (
          <button 
            className="absolute -left-10 top-4 bg-primary text-primary-foreground p-2 rounded-l-md shadow-lg" 
            onClick={onClose}
            aria-label="إغلاق القائمة"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* رأس السايدبار */}
        <div className="p-4 flex items-center justify-between border-b dark:border-gray-800">
          <Link href="/admin" className="flex items-center">
            <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-md mr-2">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-xl font-bold flex items-center">
                FULL<span className="text-primary">SCO</span>
              </div>
              <span className="text-xs text-muted-foreground">لوحة الإدارة</span>
            </div>
          </Link>
        </div>
        
        {/* قائمة التنقل */}
        <ScrollArea className="flex-1">
          <div className="px-3 py-3">
            {/* زر العودة للموقع */}
            <Link href="/">
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between px-3 py-2 h-auto text-sm rounded-md mb-4",
                )}
              >
                <div className="flex items-center">
                  <Home className="ml-2 h-4 w-4" />
                  العودة للموقع
                </div>
                <MoveHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </Link>
            
            <Separator className="my-3" />

            {/* العناصر الرئيسية */}
            <div className="space-y-1">
              {navItems.map((item, index) => {
                // إذا كان العنصر بدون قائمة فرعية
                if (!item.items && item.href) {
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive(item.href) ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-between px-3 py-2 h-auto text-sm rounded-md my-1",
                          isActive(item.href) && "bg-primary text-primary-foreground"
                        )}
                      >
                        <div className="flex items-center">
                          <item.icon className="ml-2 h-4 w-4" />
                          {item.label}
                        </div>
                        {item.badge && (
                          <Badge className={cn("mr-1 text-white", item.badgeColor || "bg-primary")}>
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  );
                }
                
                // إذا كان العنصر مع قائمة فرعية
                if (item.items) {
                  const groupKey = `group-${index}`;
                  const isExpanded = expandedGroups[groupKey];
                  
                  // التحقق من وجود عنصر نشط في المجموعة
                  const hasActiveChild = item.items.some(subItem => 
                    subItem.href && isActive(subItem.href)
                  );
                  
                  // عدد العناصر التي تحتوي على شارات
                  const badgeCount = item.items.filter(subItem => subItem.badge).length;
                  
                  return (
                    <Collapsible
                      key={groupKey}
                      open={isExpanded}
                      onOpenChange={() => toggleGroup(groupKey)}
                      className="w-full"
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-between px-3 py-2 h-auto text-sm rounded-md my-1",
                            hasActiveChild && "bg-secondary/20",
                            hasActiveChild && "text-primary font-medium"
                          )}
                        >
                          <div className="flex items-center">
                            <item.icon className="ml-2 h-4.5 w-4.5" />
                            {item.label}
                          </div>
                          <div className="flex items-center">
                            {badgeCount > 0 && (
                              <Badge variant="secondary" className="ml-2">
                                {badgeCount}
                              </Badge>
                            )}
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 mr-1" />
                            ) : (
                              <ChevronLeft className="h-4 w-4 mr-1" />
                            )}
                          </div>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="pr-3 py-1 mr-2 border-r dark:border-gray-700 space-y-1">
                          {item.items.map((subItem) => (
                            <Link key={subItem.href} href={subItem.href || '#'}>
                              <Button
                                variant={isActive(subItem.href || '') ? "default" : "ghost"}
                                className={cn(
                                  "w-full justify-between px-3 py-2 h-auto text-sm rounded-md",
                                  isActive(subItem.href || '') && "bg-primary text-primary-foreground",
                                )}
                              >
                                <div className="flex items-center">
                                  <subItem.icon className="ml-2 h-4 w-4" />
                                  {subItem.label}
                                </div>
                                {subItem.badge && (
                                  <Badge className={cn("mr-1 text-white", subItem.badgeColor || "bg-primary")}>
                                    {subItem.badge}
                                  </Badge>
                                )}
                              </Button>
                            </Link>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                }
                
                return null;
              })}
            </div>
          </div>
        </ScrollArea>
        
        {/* ذيل السايدبار */}
        <div className="p-4 border-t dark:border-gray-800 mt-auto">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <Award className="h-4 w-4 text-primary ml-2" />
                <span className="text-xs text-muted-foreground">حالة النظام: نشط</span>
              </div>
              <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">بريميوم</Badge>
            </div>
            
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
