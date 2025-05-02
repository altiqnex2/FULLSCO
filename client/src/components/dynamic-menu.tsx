import { Link } from "wouter";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useMenuStructure, type MenuItem } from "@/hooks/use-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DynamicMenuProps {
  location: 'header' | 'footer' | 'sidebar' | 'mobile';
  className?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  dropdownClassName?: string;
  dropdownItemClassName?: string;
  parentIcon?: boolean;
  onItemClick?: () => void;
}

export const DynamicMenu = ({
  location,
  className = "",
  itemClassName = "",
  activeItemClassName = "",
  dropdownClassName = "",
  dropdownItemClassName = "",
  parentIcon = true,
  onItemClick
}: DynamicMenuProps) => {
  const { data: menuStructure, isLoading, error } = useMenuStructure(location);
  const [location1] = useLocation();
  
  const isActive = (path: string) => location1 === path;
  const isPageActive = (slug: string) => location1 === `/page/${slug}`;
  
  if (isLoading) {
    return <div className={className}>جاري التحميل...</div>;
  }
  
  if (error) {
    console.error(`Error loading menu for ${location}:`, error);
    return <div className={className}>تعذر تحميل القائمة: خطأ في الاتصال</div>;
  }
  
  if (!menuStructure) {
    console.error(`Menu structure for ${location} is undefined`);
    return <div className={className}>تعذر تحميل القائمة: لا توجد بيانات</div>;
  }

  // طباعة هيكل القائمة للتشخيص
  console.log(`Menu structure for ${location}:`, menuStructure);
  
  // تحقق من هيكل البيانات المستلمة
  // هناك احتمالان: إما أن تكون العناصر مباشرة في menuStructure.items
  // أو أن تكون تحت اسم الموقع مثل menuStructure.header.items أو menuStructure.footer.items
  let menuItems;
  
  if (menuStructure.items) {
    menuItems = menuStructure.items;
  } else if (menuStructure[location] && menuStructure[location].items) {
    menuItems = menuStructure[location].items;
  } else {
    // محاولة البحث عن العناصر في المفاتيح الأخرى
    const firstKey = Object.keys(menuStructure).find(key => 
      menuStructure[key] && typeof menuStructure[key] === 'object' && menuStructure[key].items);
    
    if (firstKey && menuStructure[firstKey].items) {
      console.log(`Found items in the key: ${firstKey}`);
      menuItems = menuStructure[firstKey].items;
    } else {
      console.error(`Menu items for ${location} are undefined`);
      return <div className={className}>تعذر تحميل القائمة: لا توجد عناصر</div>;
    }
  }
  
  // تأكد من أن menuItems مصفوفة
  if (!Array.isArray(menuItems)) {
    console.error(`Menu items for ${location} is not an array:`, menuItems);
    return <div className={className}>تعذر تحميل القائمة: بيانات غير صالحة</div>;
  }
  
  // نستخدم العناصر مباشرة من بيانات API دون تصفية إضافية
  // لأن النقطة النهائية لـ API ترجع بالفعل القائمة المطلوبة فقط
  let filteredItems = menuItems;
  
  // للتوافق مع السجل القديم
  console.log(`Using menu items for location: ${location} with ${menuItems?.length || 0} items`);

  const getItemUrl = (item: MenuItem): string => {
    switch (item.type) {
      case 'page':
        return `/page/${item.pageId}`;
      case 'category':
        return `/scholarships?category=${item.categoryId}`;
      case 'level':
        return `/scholarships?level=${item.levelId}`;
      case 'country':
        return `/scholarships?country=${item.countryId}`;
      case 'scholarship':
        return `/scholarship/${item.scholarshipId}`;
      case 'post':
        return `/article/${item.postId}`;
      case 'link':
        return item.url || '#';
      default:
        return '#';
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    const itemUrl = getItemUrl(item);
    const hasChildren = item.children && item.children.length > 0;
    
    const activeClass = isActive(itemUrl) || isPageActive(itemUrl.replace('/page/', '')) 
      ? activeItemClassName 
      : '';
    
    if (hasChildren) {
      return (
        <DropdownMenu key={item.id}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={`${itemClassName} ${activeClass} flex items-center gap-1`}>
              {item.title}
              {parentIcon && <ChevronDown className="h-4 w-4 opacity-70" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className={dropdownClassName}>
            {item.children?.map((child) => (
              <DropdownMenuItem key={child.id} asChild className={dropdownItemClassName}>
                {child.type === 'link' && child.targetBlank ? (
                  <a href={child.url || '#'} target="_blank" rel="noopener noreferrer" className="w-full">
                    {child.title}
                  </a>
                ) : (
                  <Link href={getItemUrl(child)} onClick={onItemClick}>
                    <div className="flex w-full items-center">
                      {child.title}
                    </div>
                  </Link>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    
    // للروابط الخارجية
    if (item.type === 'link' && item.targetBlank) {
      return (
        <a 
          key={item.id}
          href={item.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={`${itemClassName} ${activeClass}`}
          onClick={onItemClick}
        >
          {item.title}
        </a>
      );
    }
    
    // للروابط الداخلية
    return (
      <Link key={item.id} href={itemUrl} onClick={onItemClick}>
        <span className={`${itemClassName} ${activeClass}`}>
          {item.title}
        </span>
      </Link>
    );
  };

  return (
    <div className={className}>
      {filteredItems.map(renderMenuItem)}
    </div>
  );
};

function useLocation() {
  return useState(window.location.pathname);
}