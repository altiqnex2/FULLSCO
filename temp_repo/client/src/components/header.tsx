import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, ChevronDown, Menu, GraduationCap, BookOpen, MapPin, Globe, Award, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { usePages } from "@/hooks/use-pages";

const Header = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { settings, isLoading: settingsLoading } = useSiteSettings();
  const { data: headerPages, isLoading: pagesLoading } = usePages({ showInHeader: true });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location === path;
  const isPageActive = (slug: string) => location === `/page/${slug}`;

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? "bg-white/95 shadow-sm backdrop-blur-md" 
          : "bg-white"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              {settings?.logo ? (
                <img 
                  src={settings.logo} 
                  alt={settings?.siteName || 'FULLSCO'} 
                  className="h-8 md:h-10" 
                />
              ) : (
                <span className="text-2xl font-bold tracking-tight text-primary md:text-3xl">
                  {settings?.siteName || 'FULLSCO'}
                </span>
              )}
              {settings?.siteTagline && (
                <span className="ml-2 text-xs text-muted-foreground hidden sm:block">
                  {settings.siteTagline}
                </span>
              )}
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="ml-10 hidden space-x-1 md:flex lg:space-x-2">
              <Link href="/">
                <span className={`link-hover flex items-center px-3 py-2 text-sm font-medium transition-colors ${isActive('/') ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>
                  الرئيسية
                </span>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="link-hover flex items-center px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary">
                    المنح الدراسية <ChevronDown className="mr-1 h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="animate-slide-up w-56">
                  <DropdownMenuItem asChild className="flex cursor-pointer items-center gap-2 py-2">
                    <Link href="/scholarships?level=bachelor">
                      <div className="flex w-full items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" /> البكالوريوس
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="flex cursor-pointer items-center gap-2 py-2">
                    <Link href="/scholarships?level=masters">
                      <div className="flex w-full items-center gap-2">
                        <Award className="h-4 w-4 text-accent" /> الماجستير
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="flex cursor-pointer items-center gap-2 py-2">
                    <Link href="/scholarships?level=phd">
                      <div className="flex w-full items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" /> الدكتوراه
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="flex cursor-pointer items-center gap-2 py-2">
                    <Link href="/scholarships?funded=true">
                      <div className="flex w-full items-center gap-2">
                        <Award className="h-4 w-4 text-accent" /> تمويل كامل
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="flex cursor-pointer items-center gap-2 py-2">
                    <Link href="/scholarships">
                      <div className="flex w-full items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" /> حسب الدولة
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="flex cursor-pointer items-center gap-2 py-2">
                    <Link href="/scholarships">
                      <div className="flex w-full items-center gap-2">
                        <MapPin className="h-4 w-4 text-accent" /> جميع المنح
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Link href="/articles">
                <span className={`link-hover flex items-center px-3 py-2 text-sm font-medium transition-colors ${isActive('/articles') ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>
                  موارد تعليمية
                </span>
              </Link>
              
              <Link href="/success-stories">
                <span className={`link-hover flex items-center px-3 py-2 text-sm font-medium transition-colors ${isActive('/success-stories') ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>
                  قصص نجاح
                </span>
              </Link>
              
              {/* عرض الصفحات الثابتة في الرأس */}
              {headerPages?.filter(page => page.showInHeader && page.isPublished).map(page => (
                <Link key={page.id} href={`/page/${page.slug}`}>
                  <span className={`link-hover flex items-center px-3 py-2 text-sm font-medium transition-colors ${isPageActive(page.slug) ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>
                    {page.title}
                  </span>
                </Link>
              ))}
              
              {/* الصفحات الافتراضية إذا لم يتم العثور على الصفحات الديناميكية */}
              {(!headerPages || headerPages.length === 0) && (
                <>
                  <Link href="/about">
                    <span className={`link-hover flex items-center px-3 py-2 text-sm font-medium transition-colors ${isActive('/about') ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>
                      عن الموقع
                    </span>
                  </Link>
                  
                  <Link href="/contact">
                    <span className={`link-hover flex items-center px-3 py-2 text-sm font-medium transition-colors ${isActive('/contact') ? 'text-primary' : 'text-foreground/80 hover:text-primary'}`}>
                      اتصل بنا
                    </span>
                  </Link>
                </>
              )}
            </nav>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden lg:block">
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="ابحث عن المنح..." 
                  className="h-10 w-64 rounded-full bg-muted/70 px-4 py-2 pl-10 pr-4 text-sm shadow-soft transition-all focus-visible:bg-white focus-visible:shadow-md focus-visible:ring-accent" 
                />
                <div className="absolute inset-y-0 left-3 flex items-center">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              {user ? (
                <Link href="/admin">
                  <Button 
                    className="button-hover hidden items-center gap-2 rounded-full border-primary bg-primary/10 text-primary hover:bg-primary/20 sm:flex"
                    variant="outline"
                  >
                    <User className="h-4 w-4" />
                    <span>لوحة التحكم</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/admin/login">
                  <Button 
                    variant="outline" 
                    className="button-hover hidden items-center gap-2 rounded-full text-primary hover:bg-primary/10 sm:flex"
                  >
                    <User className="h-4 w-4" />
                    <span>تسجيل الدخول</span>
                  </Button>
                </Link>
              )}
              
              <Link href="/subscribe">
                <Button 
                  className="button-hover rounded-full bg-accent font-medium text-white shadow-soft transition-all hover:bg-accent/90"
                >
                  اشترك الآن
                </Button>
              </Link>
              
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="القائمة"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      {mobileMenuOpen && (
        <div className="animate-fade-in absolute inset-x-0 top-16 z-50 border-t border-border bg-background/95 pb-6 shadow-md backdrop-blur-md md:hidden">
          <div className="container mx-auto px-4 pt-2 sm:px-6">
            <div className="relative my-4 w-full">
              <Input 
                type="text" 
                placeholder="ابحث عن المنح..." 
                className="h-10 w-full rounded-full bg-muted/70 px-4 py-2 pl-10 pr-4 text-sm focus-visible:bg-white focus-visible:ring-accent" 
              />
              <div className="absolute inset-y-0 left-3 flex items-center">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-1 py-2">
              <Link href="/">
                <div className="flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-medium text-foreground/80 hover:bg-muted hover:text-primary">
                  <span className={isActive('/') ? 'text-primary font-semibold' : ''}>الرئيسية</span>
                </div>
              </Link>
              <Link href="/scholarships">
                <div className="flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-medium text-foreground/80 hover:bg-muted hover:text-primary">
                  <span className={isActive('/scholarships') ? 'text-primary font-semibold' : ''}>المنح الدراسية</span>
                </div>
              </Link>
              <Link href="/articles">
                <div className="flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-medium text-foreground/80 hover:bg-muted hover:text-primary">
                  <span className={isActive('/articles') ? 'text-primary font-semibold' : ''}>موارد تعليمية</span>
                </div>
              </Link>
              <Link href="/success-stories">
                <div className="flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-medium text-foreground/80 hover:bg-muted hover:text-primary">
                  <span className={isActive('/success-stories') ? 'text-primary font-semibold' : ''}>قصص نجاح</span>
                </div>
              </Link>
              
              {/* عرض الصفحات الثابتة في القائمة المتنقلة */}
              {headerPages?.filter(page => page.showInHeader && page.isPublished).map(page => (
                <Link key={page.id} href={`/page/${page.slug}`}>
                  <div className="flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-medium text-foreground/80 hover:bg-muted hover:text-primary">
                    <span className={isPageActive(page.slug) ? 'text-primary font-semibold' : ''}>
                      {page.title}
                    </span>
                  </div>
                </Link>
              ))}
              
              {/* الصفحات الافتراضية إذا لم يتم العثور على الصفحات الديناميكية */}
              {(!headerPages || headerPages.length === 0) && (
                <>
                  <Link href="/about">
                    <div className="flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-medium text-foreground/80 hover:bg-muted hover:text-primary">
                      <span className={isActive('/about') ? 'text-primary font-semibold' : ''}>عن الموقع</span>
                    </div>
                  </Link>
                  <Link href="/contact">
                    <div className="flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-medium text-foreground/80 hover:bg-muted hover:text-primary">
                      <span className={isActive('/contact') ? 'text-primary font-semibold' : ''}>اتصل بنا</span>
                    </div>
                  </Link>
                </>
              )}
            </div>
            
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
              {user ? (
                <Link href="/admin" className="flex-1">
                  <Button className="w-full">لوحة التحكم</Button>
                </Link>
              ) : (
                <Link href="/admin/login" className="flex-1">
                  <Button variant="outline" className="w-full">تسجيل الدخول</Button>
                </Link>
              )}
              <Link href="/subscribe" className="flex-1">
                <Button className="w-full bg-accent text-white hover:bg-accent/90">اشترك الآن</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
