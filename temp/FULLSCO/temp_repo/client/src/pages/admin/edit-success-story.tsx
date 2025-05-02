import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useForm } from 'react-hook-form';
import { useSuccessStory, useUpdateSuccessStory } from '@/hooks/use-success-stories';
import AdminLayout from '@/components/admin/admin-layout';
import { ArrowRight, Save, Trash, CheckCircle, XCircle } from 'lucide-react';

type FormValues = {
  name: string;
  title: string;
  content: string;
  scholarshipName?: string;
  imageUrl?: string;
  isPublished: boolean;
};

const EditSuccessStory = () => {
  const params = useParams<{ id: string }>();
  const storyId = parseInt(params.id);
  const [, setLocation] = useLocation();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // جلب بيانات قصة النجاح
  const { successStory, isLoading } = useSuccessStory(storyId);
  
  // استخدام هوك تحديث قصة النجاح
  const updateStoryMutation = useUpdateSuccessStory();

  // إعداد نموذج التحرير
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormValues>();

  // ملء النموذج ببيانات قصة النجاح عند تحميلها
  useEffect(() => {
    if (successStory) {
      reset({
        name: successStory.name,
        title: successStory.title,
        content: successStory.content,
        scholarshipName: successStory.scholarshipName || '',
        imageUrl: successStory.imageUrl || '',
        isPublished: successStory.isPublished === true,
      });
    }
  }, [successStory, reset]);

  // معالجة تقديم النموذج
  const onSubmit = async (data: FormValues) => {
    try {
      setSaving(true);
      setError(null);

      // تحديث قصة النجاح
      await updateStoryMutation.mutateAsync({
        id: storyId,
        data: {
          name: data.name,
          title: data.title,
          content: data.content,
          scholarshipName: data.scholarshipName || null,
          imageUrl: data.imageUrl || null,
          isPublished: data.isPublished,
        },
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError((err as Error).message || 'حدث خطأ أثناء حفظ البيانات');
    } finally {
      setSaving(false);
    }
  };

  // العودة إلى صفحة قصص النجاح
  const handleGoBack = () => {
    setLocation('/admin/success-stories');
  };

  // تبديل حالة النشر
  const togglePublish = () => {
    setValue('isPublished', !Boolean(successStory?.isPublished));
  };

  // ظهار رسالة التحميل
  if (isLoading) {
    return (
      <AdminLayout title="تحميل..." actions={null}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  // إظهار رسالة الخطأ إذا لم يتم العثور على القصة
  if (!successStory && !isLoading) {
    return (
      <AdminLayout title="قصة غير موجودة" actions={null}>
        <div className="bg-red-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-red-700 mb-2">لم يتم العثور على القصة</h2>
          <p className="text-gray-700 mb-4">تعذر العثور على قصة النجاح المطلوبة. ربما تم حذفها أو أن الرابط غير صحيح.</p>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            العودة إلى قصص النجاح
          </button>
        </div>
      </AdminLayout>
    );
  }

  // أزرار الإجراءات في رأس الصفحة
  const actions = (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={togglePublish}
        className={`px-4 py-2 rounded flex items-center gap-2 ${
          successStory?.isPublished
            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`}
      >
        {successStory?.isPublished ? (
          <>
            <XCircle className="h-4 w-4" />
            تحويل إلى مسودة
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4" />
            نشر القصة
          </>
        )}
      </button>
      <button
        type="button"
        onClick={handleGoBack}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-2"
      >
        <ArrowRight className="h-4 w-4" />
        رجوع
      </button>
    </div>
  );

  return (
    <AdminLayout title={`تعديل قصة: ${successStory?.title}`} actions={actions}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* رسائل النجاح والخطأ */}
        {error && (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 p-4 rounded-md">
            <p className="text-green-700">تم حفظ التغييرات بنجاح</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* اسم الشخص */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              اسم الشخص <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'الاسم مطلوب' })}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* عنوان القصة */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              عنوان القصة <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              {...register('title', { required: 'العنوان مطلوب' })}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* اسم المنحة */}
          <div className="space-y-2">
            <label htmlFor="scholarshipName" className="block text-sm font-medium text-gray-700">
              اسم المنحة المرتبطة (اختياري)
            </label>
            <input
              id="scholarshipName"
              type="text"
              {...register('scholarshipName')}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* رابط الصورة */}
          <div className="space-y-2">
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
              رابط الصورة (اختياري)
            </label>
            <input
              id="imageUrl"
              type="text"
              {...register('imageUrl')}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* محتوى القصة */}
        <div className="space-y-2">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            محتوى القصة <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            rows={12}
            {...register('content', { required: 'المحتوى مطلوب' })}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          ></textarea>
          {errors.content && (
            <p className="text-red-500 text-sm">{errors.content.message}</p>
          )}
        </div>

        {/* حالة النشر */}
        <div className="flex items-center space-x-2 space-x-reverse">
          <input
            id="isPublished"
            type="checkbox"
            {...register('isPublished')}
            className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
            نشر القصة
          </label>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleGoBack}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                حفظ التغييرات
              </>
            )}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default EditSuccessStory;