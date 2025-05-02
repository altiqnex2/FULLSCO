import { createContext, ReactNode, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export interface SiteSettings {
  id: number;
  siteName: string;
  siteTagline?: string;
  siteDescription?: string;
  favicon?: string;
  logo?: string;
  logoDark?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  enableDarkMode: boolean;
  rtlDirection: boolean;
  defaultLanguage: string;
  enableNewsletter: boolean;
  enableScholarshipSearch: boolean;
  footerText?: string;
  footerCopyrightText?: string;
  footerStyle?: string;
  footerBackgroundColor?: string;
  footerTextColor?: string;
  footerColumns?: number;
  customFooterHtml?: string;
}

interface SiteSettingsContextValue {
  settings: SiteSettings | null;
  isLoading: boolean;
  error: Error | null;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const { data: settings, isLoading, error, refetch } = useQuery<SiteSettings, Error>({
    queryKey: ['/api/site-settings'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/site-settings');
        if (!response.ok) {
          throw new Error('Failed to fetch site settings');
        }
        const data = await response.json();
        console.log('Site settings loaded successfully:', data);
        return data;
      } catch (error) {
        console.error('Error fetching site settings:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 1, // دقيقة واحدة
    refetchOnWindowFocus: false, // عدم إعادة التحميل عند التركيز لتحسين الأداء
  });

  // تطبيق الإعدادات على المستند
  useEffect(() => {
    if (settings) {
      console.log('Applying site settings to document:', settings);
      
      // تطبيق اتجاه RTL
      document.documentElement.dir = settings.rtlDirection ? 'rtl' : 'ltr';
      
      // تطبيق اللغة الافتراضية
      document.documentElement.lang = settings.defaultLanguage || 'ar';
      
      // تطبيق الألوان على المتغيرات في CSS
      // تحويل ألوان hex إلى HSL للاستفادة من نظام الألوان في tailwind
      const hexToHSL = (hex: string) => {
        // إزالة # من بداية اللون
        const hexColor = hex.replace('#', '');
        
        // تحويل RGB إلى مقياس [0-1]
        const r = parseInt(hexColor.substr(0, 2), 16) / 255;
        const g = parseInt(hexColor.substr(2, 2), 16) / 255;
        const b = parseInt(hexColor.substr(4, 2), 16) / 255;
        
        // حساب القيم HSL
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          
          if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
          else if (max === g) h = (b - r) / d + 2;
          else h = (r - g) / d + 4;
          
          h *= 60;
        }
        
        return {
          h: Math.round(h),
          s: Math.round(s * 100),
          l: Math.round(l * 100)
        };
      };
      
      // تطبيق اللون الأساسي
      if (settings.primaryColor) {
        try {
          const hsl = hexToHSL(settings.primaryColor);
          // تطبيق قيم HSL مباشرة على متغير الألوان الرئيسي
          document.documentElement.style.setProperty('--primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
          console.log(`Applied primary color: ${hsl.h} ${hsl.s}% ${hsl.l}%`);
        } catch (e) {
          console.error('Error parsing primary color:', e);
        }
      }
      
      // تطبيق اللون الثانوي
      if (settings.secondaryColor) {
        try {
          const hsl = hexToHSL(settings.secondaryColor);
          document.documentElement.style.setProperty('--secondary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
          console.log(`Applied secondary color: ${hsl.h} ${hsl.s}% ${hsl.l}%`);
        } catch (e) {
          console.error('Error parsing secondary color:', e);
        }
      }
      
      // تطبيق لون التمييز
      if (settings.accentColor) {
        try {
          const hsl = hexToHSL(settings.accentColor);
          document.documentElement.style.setProperty('--accent', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
          console.log(`Applied accent color: ${hsl.h} ${hsl.s}% ${hsl.l}%`);
          
          // تعيين لون النص المناسب للأزرار ذات لون التمييز
          document.documentElement.style.setProperty('--accent-foreground', '0 0% 100%');
        } catch (e) {
          console.error('Error parsing accent color:', e);
        }
      }
      
      // تطبيق أيقونة الموقع (favicon)
      if (settings.favicon) {
        const existingFavicon = document.querySelector('link[rel="icon"]');
        if (existingFavicon) {
          existingFavicon.setAttribute('href', settings.favicon);
        } else {
          const faviconLink = document.createElement('link');
          faviconLink.rel = 'icon';
          faviconLink.href = settings.favicon;
          document.head.appendChild(faviconLink);
        }
      }
    }
  }, [settings]);

  return (
    <SiteSettingsContext.Provider value={{ settings: settings || null, isLoading, error: error || null }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}