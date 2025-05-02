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
  
  if (error || !menuStructure || !menuStructure.items) {
    return <div className={className}>تعذر تحميل القائمة</div>;
  }

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
      {menuStructure.items.map(renderMenuItem)}
    </div>
  );
};

function useLocation() {
  return useState(window.location.pathname);
}