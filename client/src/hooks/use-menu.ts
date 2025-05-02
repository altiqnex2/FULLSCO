import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export interface MenuItem {
  id: number;
  menuId: number;
  parentId: number | null;
  title: string;
  type: 'page' | 'category' | 'level' | 'country' | 'link' | 'scholarship' | 'post';
  url: string | null;
  targetBlank: boolean;
  pageId: number | null;
  categoryId: number | null;
  levelId: number | null;
  countryId: number | null;
  scholarshipId: number | null;
  postId: number | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  children?: MenuItem[];
}

export interface Menu {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  location: 'header' | 'footer' | 'sidebar' | 'mobile';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuStructure {
  id: number;
  name: string;
  slug: string;
  location: 'header' | 'footer' | 'sidebar' | 'mobile';
  items?: MenuItem[];
  // هيكل مرن للتعامل مع الاستجابات المتنوعة من API
  [key: string]: any;
}

export function useMenus() {
  return useQuery({
    queryKey: ['/api/menus'],
    refetchOnWindowFocus: false
  });
}

export function useMenu(id: number) {
  return useQuery({
    queryKey: ['/api/menus', id],
    enabled: !!id,
    refetchOnWindowFocus: false
  });
}

export function useMenuByLocation(location: 'header' | 'footer' | 'sidebar' | 'mobile') {
  return useQuery({
    queryKey: ['/api/menus/location', location],
    refetchOnWindowFocus: false
  });
}

export function useMenuStructure(location: 'header' | 'footer' | 'sidebar' | 'mobile') {
  return useQuery<MenuStructure>({
    queryKey: ['/api/menu-structure', location],
    queryFn: async () => {
      // استخدام نقطة نهاية محددة لكل موقع
      console.log(`Fetching menu structure for ${location}`);
      
      // إضافة معامل عشوائي لمنع التخزين المؤقت في المتصفح
      const cacheBuster = new Date().getTime();
      
      // تصحيح مسار الاستدعاء - الاستدعاء يكون للنقطة النهائية الرئيسية وليس مع وجود location في المسار
      const response = await fetch(`/api/menu-structure?_=${cacheBuster}`);
      if (!response.ok) {
        throw new Error(`Error fetching menu structure for ${location}`);
      }
      const data = await response.json();
      console.log(`Menu data for ${location}:`, data);
      
      // استرجاع القائمة المناسبة وفقًا للموقع المطلوب
      if (data && data[location]) {
        console.log(`Menu structure for ${location}:`, data[location]);
        return data[location];
      } else {
        console.error(`Error loading menu for ${location}:`, data);
        throw new Error(`Menu structure for ${location} not found`);
      }
    },
    refetchOnWindowFocus: true,  // إعادة تحميل البيانات عند التركيز على النافذة
    refetchInterval: 3000  // إعادة تحميل البيانات كل 3 ثواني
  });
}

export function useMenuItems(menuId: number, parentId?: number | null) {
  let queryUrl = `/api/menu-items/menu/${menuId}`;
  if (parentId !== undefined) {
    queryUrl += `?parentId=${parentId === null ? 'null' : parentId}`;
  }
  
  return useQuery<MenuItem[]>({
    queryKey: ['/api/menu-items/menu', menuId, parentId],
    queryFn: () => fetch(queryUrl).then(res => res.json()),
    enabled: !!menuId,
    refetchOnWindowFocus: false
  });
}

export function useMenuItemsWithDetails(menuId: number) {
  const queryUrl = `/api/menu-items-with-details/menu/${menuId}`;
  
  return useQuery({
    queryKey: [queryUrl],
    enabled: !!menuId,
    refetchOnWindowFocus: false
  });
}