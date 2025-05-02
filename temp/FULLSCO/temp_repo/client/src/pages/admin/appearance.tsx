import { useQuery } from '@tanstack/react-query';
import { Palette, Save, Moon, Sun, EyeOff, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/admin-layout';

// Define site settings type
type SiteSettings = {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  enableDarkMode?: boolean;
  rtlDirection?: boolean;
  [key: string]: any;
};

const AdminAppearance = () => {
  // Fetch site settings
  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ['/api/site-settings'],
  });
  
  // State for color settings
  const [colorSettings, setColorSettings] = useState<SiteSettings>({
    primaryColor: '#3b82f6',
    secondaryColor: '#f59e0b',
    accentColor: '#000fff',
    enableDarkMode: false,
    rtlDirection: true,
  });

  // Initialize state with settings when loaded
  useEffect(() => {
    if (settings) {
      setColorSettings({
        primaryColor: settings.primaryColor || '#3b82f6',
        secondaryColor: settings.secondaryColor || '#f59e0b',
        accentColor: settings.accentColor || '#000fff',
        enableDarkMode: settings.enableDarkMode || false,
        rtlDirection: settings.rtlDirection || true,
      });
    }
  }, [settings]);

  // Handle color change
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setColorSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle toggle change
  const handleToggleChange = (name: string) => {
    setColorSettings(prev => ({
      ...prev,
      [name]: !prev[name as keyof typeof prev]
    }));
  };

  // Save settings handler
  const handleSave = () => {
    // Placeholder for save functionality
    alert('تم حفظ الإعدادات بنجاح');
  };

  // Function to get contrasting text color for a hexadecimal color
  const getContrastText = (hexColor: string | undefined) => {
    if (!hexColor) return '#ffffff';
    
    // Convert hex to RGB
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);
    
    // Calculate brightness (luminance)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Return white or black based on brightness
    return brightness > 125 ? '#000000' : '#ffffff';
  };

  // Actions for AdminLayout header
  const actions = (
    <button 
      onClick={handleSave}
      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
    >
      <Save className="h-4 w-4" />
      حفظ التغييرات
    </button>
  );

  return (
    <AdminLayout title="المظهر والألوان" actions={actions}>
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4">جاري تحميل الإعدادات...</p>
        </div>
      ) : (
        <>
          {/* Color Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Palette className="h-5 w-5 ml-2 text-blue-500" />
                <h2 className="text-lg font-bold">ألوان الموقع</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Color */}
              <div className="space-y-3">
                <label className="block font-medium">
                  اللون الرئيسي (Primary)
                </label>
                <div className="flex flex-col gap-2">
                  <div
                    className="h-16 rounded-md flex items-center justify-center text-md font-semibold"
                    style={{ 
                      backgroundColor: colorSettings.primaryColor || '#3b82f6',
                      color: getContrastText(colorSettings.primaryColor) 
                    }}
                  >
                    اللون الرئيسي
                  </div>
                  <input
                    type="color"
                    name="primaryColor"
                    value={colorSettings.primaryColor || '#3b82f6'}
                    onChange={handleColorChange}
                    className="w-full h-10 cursor-pointer rounded-md"
                  />
                  <input
                    type="text"
                    name="primaryColor"
                    value={colorSettings.primaryColor || '#3b82f6'}
                    onChange={handleColorChange}
                    className="border rounded-md p-2 text-sm"
                  />
                </div>
              </div>
              
              {/* Secondary Color */}
              <div className="space-y-3">
                <label className="block font-medium">
                  اللون الثانوي (Secondary)
                </label>
                <div className="flex flex-col gap-2">
                  <div
                    className="h-16 rounded-md flex items-center justify-center text-md font-semibold"
                    style={{ 
                      backgroundColor: colorSettings.secondaryColor || '#f59e0b',
                      color: getContrastText(colorSettings.secondaryColor) 
                    }}
                  >
                    اللون الثانوي
                  </div>
                  <input
                    type="color"
                    name="secondaryColor"
                    value={colorSettings.secondaryColor || '#f59e0b'}
                    onChange={handleColorChange}
                    className="w-full h-10 cursor-pointer rounded-md"
                  />
                  <input
                    type="text"
                    name="secondaryColor"
                    value={colorSettings.secondaryColor || '#f59e0b'}
                    onChange={handleColorChange}
                    className="border rounded-md p-2 text-sm"
                  />
                </div>
              </div>
              
              {/* Accent Color */}
              <div className="space-y-3">
                <label className="block font-medium">
                  لون التمييز (Accent)
                </label>
                <div className="flex flex-col gap-2">
                  <div
                    className="h-16 rounded-md flex items-center justify-center text-md font-semibold"
                    style={{ 
                      backgroundColor: colorSettings.accentColor || '#000fff',
                      color: getContrastText(colorSettings.accentColor) 
                    }}
                  >
                    لون التمييز
                  </div>
                  <input
                    type="color"
                    name="accentColor"
                    value={colorSettings.accentColor || '#000fff'}
                    onChange={handleColorChange}
                    className="w-full h-10 cursor-pointer rounded-md"
                  />
                  <input
                    type="text"
                    name="accentColor"
                    value={colorSettings.accentColor || '#000fff'}
                    onChange={handleColorChange}
                    className="border rounded-md p-2 text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8 space-y-6">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between py-3 border-t">
                <div className="flex items-center gap-3">
                  {colorSettings.enableDarkMode ? (
                    <Moon className="h-5 w-5 text-indigo-600" />
                  ) : (
                    <Sun className="h-5 w-5 text-amber-500" />
                  )}
                  <div>
                    <h3 className="font-medium">الوضع الداكن (Dark Mode)</h3>
                    <p className="text-sm text-gray-500">تفعيل الوضع الداكن للموقع</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={colorSettings.enableDarkMode}
                    onChange={() => handleToggleChange('enableDarkMode')}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 
                    peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                    peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:right-[2px] 
                    after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                    after:transition-all peer-checked:bg-blue-500">
                  </div>
                </label>
              </div>
              
              {/* RTL Direction Toggle */}
              <div className="flex items-center justify-between py-3 border-t">
                <div className="flex items-center gap-3">
                  {colorSettings.rtlDirection ? (
                    <Eye className="h-5 w-5 text-green-600" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <h3 className="font-medium">اتجاه الموقع من اليمين إلى اليسار (RTL)</h3>
                    <p className="text-sm text-gray-500">تحديد اتجاه المحتوى في الموقع</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={colorSettings.rtlDirection}
                    onChange={() => handleToggleChange('rtlDirection')}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 
                    peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                    peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:right-[2px] 
                    after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                    after:transition-all peer-checked:bg-blue-500">
                  </div>
                </label>
              </div>
            </div>
            
            <div className="mt-6 bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-700">
                ملاحظة: سيتم تطبيق التغييرات على جميع صفحات الموقع بعد الحفظ.
              </p>
            </div>
          </div>
          
          {/* Preview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">معاينة المظهر</h2>
            
            <div className="border rounded-lg p-6 overflow-hidden">
              <h3 className="text-xl font-bold mb-2" style={{ color: colorSettings.primaryColor || '#3b82f6' }}>
                عنوان بالون الرئيسي
              </h3>
              <p className="mb-4">هذا نص تجريبي لمعاينة الخط والألوان في موقع FULLSCO.</p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <button 
                  className="px-4 py-2 rounded-md text-white"
                  style={{ backgroundColor: colorSettings.primaryColor || '#3b82f6' }}
                >
                  زر رئيسي
                </button>
                <button 
                  className="px-4 py-2 rounded-md text-white"
                  style={{ backgroundColor: colorSettings.secondaryColor || '#f59e0b' }}
                >
                  زر ثانوي
                </button>
                <button 
                  className="px-4 py-2 rounded-md text-white"
                  style={{ backgroundColor: colorSettings.accentColor || '#000fff' }}
                >
                  زر التمييز
                </button>
              </div>
              
              <div className="flex gap-2 mb-4">
                <div 
                  className="w-6 h-6 rounded-full" 
                  style={{ backgroundColor: colorSettings.primaryColor || '#3b82f6' }}
                ></div>
                <div 
                  className="w-6 h-6 rounded-full" 
                  style={{ backgroundColor: colorSettings.secondaryColor || '#f59e0b' }}
                ></div>
                <div 
                  className="w-6 h-6 rounded-full" 
                  style={{ backgroundColor: colorSettings.accentColor || '#000fff' }}
                ></div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div 
                  className="flex-1 p-4 rounded-md text-white"
                  style={{ backgroundColor: colorSettings.primaryColor || '#3b82f6' }}
                >
                  عنصر بلون رئيسي
                </div>
                <div 
                  className="flex-1 p-4 rounded-md text-white"
                  style={{ backgroundColor: colorSettings.secondaryColor || '#f59e0b' }}
                >
                  عنصر بلون ثانوي
                </div>
                <div 
                  className="flex-1 p-4 rounded-md text-white"
                  style={{ backgroundColor: colorSettings.accentColor || '#000fff' }}
                >
                  عنصر بلون التمييز
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
                onClick={handleSave}
              >
                <Save className="h-4 w-4" />
                حفظ التغييرات
              </button>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminAppearance;