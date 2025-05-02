import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Save } from 'lucide-react';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/admin/admin-layout';

// Types
type Scholarship = {
  id: number;
  title: string;
};

type SuccessStoryData = {
  name: string;
  title: string;
  content: string;
  scholarshipId?: number | null;
  photo?: string | null;
  isPublished: boolean;
};

const CreateSuccessStory = () => {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // State for form data
  const [formData, setFormData] = useState<SuccessStoryData>({
    name: '',
    title: '',
    content: '',
    scholarshipId: null,
    photo: null,
    isPublished: false
  });
  
  // Handle text input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Fetch scholarships for dropdown
  const { data: scholarships, isLoading: isLoadingScholarships } = useQuery<Scholarship[]>({
    queryKey: ['/api/scholarships'],
  });
  
  // Mutation for creating success story
  const createMutation = useMutation({
    mutationFn: async (data: SuccessStoryData) => {
      const response = await fetch('/api/success-stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('حدث خطأ أثناء حفظ قصة النجاح');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate cache and redirect
      queryClient.invalidateQueries({ queryKey: ['/api/success-stories'] });
      setLocation('/admin/success-stories');
    },
  });
  
  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.title || !formData.content) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    // Convert scholarshipId to number if it exists
    const dataToSubmit = {
      ...formData,
      scholarshipId: formData.scholarshipId ? Number(formData.scholarshipId) : null
    };
    
    // Submit data
    createMutation.mutate(dataToSubmit);
  };

  // Header actions
  const actions = (
    <button
      onClick={() => setLocation('/admin/success-stories')}
      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2"
    >
      <ArrowRight className="h-4 w-4" />
      العودة للقائمة
    </button>
  );
  
  return (
    <AdminLayout title="إضافة قصة نجاح جديدة" actions={actions}>
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-medium mb-4 pb-2 border-b">بيانات قصة النجاح</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Name */}
            <div className="flex flex-col">
              <label htmlFor="name" className="mb-2 font-medium text-gray-700">
                اسم صاحب القصة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="أدخل اسم صاحب القصة"
                className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            {/* Title */}
            <div className="flex flex-col">
              <label htmlFor="title" className="mb-2 font-medium text-gray-700">
                عنوان القصة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="أدخل عنوان القصة"
                className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          {/* Content */}
          <div className="mb-6">
            <label htmlFor="content" className="mb-2 font-medium text-gray-700 block">
              محتوى القصة <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="أدخل تفاصيل قصة النجاح"
              className="border p-3 rounded-md w-full h-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          {/* Related Scholarship */}
          <div className="mb-6">
            <label htmlFor="scholarshipId" className="mb-2 font-medium text-gray-700 block">
              المنحة المرتبطة
            </label>
            <select
              id="scholarshipId"
              name="scholarshipId"
              value={formData.scholarshipId || ''}
              onChange={handleChange}
              className="border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">- اختر منحة -</option>
              {isLoadingScholarships ? (
                <option disabled>جاري تحميل المنح...</option>
              ) : (
                scholarships?.map(scholarship => (
                  <option key={scholarship.id} value={scholarship.id}>
                    {scholarship.title}
                  </option>
                ))
              )}
            </select>
          </div>
          
          {/* Photo - Placeholder for future implementation */}
          <div className="mb-6">
            <label htmlFor="photo" className="mb-2 font-medium text-gray-700 block">
              الصورة (اختياري)
            </label>
            <div className="border p-4 rounded-md bg-gray-50 text-center">
              <p className="text-gray-500 mb-2">خاصية رفع الصور ستكون متاحة قريباً</p>
            </div>
          </div>
          
          {/* Publish Status */}
          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleCheckboxChange}
                className="h-4 w-4 ml-2 text-blue-600 focus:ring-blue-500 rounded"
              />
              <label htmlFor="isPublished" className="font-medium text-gray-700">
                نشر القصة فوراً
              </label>
            </div>
            <p className="text-gray-500 text-sm mt-1 mr-6">
              إذا لم تفعل هذا الخيار، سيتم حفظ القصة كمسودة ويمكنك نشرها لاحقاً
            </p>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setLocation('/admin/success-stories')}
            className="px-4 py-2 border rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                حفظ القصة
              </>
            )}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default CreateSuccessStory;