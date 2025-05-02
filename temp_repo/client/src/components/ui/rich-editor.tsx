import React, { useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Edit, Image, BarChart2, Search, Settings, FileText } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';

interface RichEditorProps {
  initialValue?: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number | string;
  minHeight?: number | string;
  dir?: 'rtl' | 'ltr';
  seoTitle?: string;
  onSeoTitleChange?: (title: string) => void;
  seoDescription?: string;
  onSeoDescriptionChange?: (description: string) => void;
  seoKeywords?: string;
  onSeoKeywordsChange?: (keywords: string) => void;
  focusKeyword?: string;
  onFocusKeywordChange?: (keyword: string) => void;
  readOnly?: boolean;
  className?: string;
}

export default function RichEditor({
  initialValue = '',
  onChange,
  placeholder = 'ابدأ الكتابة هنا...',
  height = 500,
  minHeight = 400,
  dir = 'rtl',
  seoTitle = '',
  onSeoTitleChange,
  seoDescription = '',
  onSeoDescriptionChange,
  seoKeywords = '',
  onSeoKeywordsChange,
  focusKeyword = '',
  onFocusKeywordChange,
  readOnly = false,
  className = '',
}: RichEditorProps) {
  const editorRef = useRef<any>(null);
  const [content, setContent] = useState(initialValue);
  const [activeTab, setActiveTab] = useState('editor');
  const [wordCount, setWordCount] = useState(0);
  const [seoScore, setSeoScore] = useState(0);
  const [readability, setReadability] = useState(0);
  const [seoAnalysis, setSeoAnalysis] = useState<Array<{text: string, status: 'good' | 'warning' | 'bad', score: number}>>([]);
  const [readabilityAnalysis, setReadabilityAnalysis] = useState<Array<{text: string, status: 'good' | 'warning' | 'bad', score: number}>>([]);
  
  // يمكن استخدام المفتاح المخزن في متغيرات البيئة
  const apiKey = 'zxu5jgj7pezp6ynprlvz57e3jbj2acfcnbemx0vhm0cdcl1i';
  
  // التغييرات في المحتوى
  const handleEditorChange = (newContent: string) => {
    setContent(newContent);
    onChange(newContent);
    
    // حساب عدد الكلمات
    const textContent = stripHtml(newContent);
    const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    
    // تحليل SEO وقابلية القراءة إذا كان هناك كلمة رئيسية
    if (focusKeyword) {
      analyzeSeo(newContent, focusKeyword, seoTitle, seoDescription);
      analyzeReadability(textContent);
    }
  };
  
  // تحليل السيو
  const analyzeSeo = (content: string, keyword: string, title: string, description: string) => {
    const analysis: Array<{text: string, status: 'good' | 'warning' | 'bad', score: number}> = [];
    const textContent = stripHtml(content).toLowerCase();
    const keywordLower = keyword.toLowerCase();
    
    // التحقق من وجود الكلمة المفتاحية في العنوان
    if (title.toLowerCase().includes(keywordLower)) {
      analysis.push({
        text: 'الكلمة المفتاحية موجودة في العنوان',
        status: 'good',
        score: 15
      });
    } else {
      analysis.push({
        text: 'الكلمة المفتاحية غير موجودة في العنوان',
        status: 'bad',
        score: 0
      });
    }
    
    // التحقق من وجود الكلمة المفتاحية في الوصف
    if (description.toLowerCase().includes(keywordLower)) {
      analysis.push({
        text: 'الكلمة المفتاحية موجودة في الوصف',
        status: 'good',
        score: 10
      });
    } else {
      analysis.push({
        text: 'الكلمة المفتاحية غير موجودة في الوصف',
        status: 'bad',
        score: 0
      });
    }
    
    // التحقق من وجود الكلمة المفتاحية في أول 100 كلمة
    const first100Words = textContent.split(' ').slice(0, 100).join(' ');
    if (first100Words.includes(keywordLower)) {
      analysis.push({
        text: 'الكلمة المفتاحية موجودة في بداية المحتوى',
        status: 'good',
        score: 10
      });
    } else {
      analysis.push({
        text: 'الكلمة المفتاحية غير موجودة في بداية المحتوى',
        status: 'warning',
        score: 5
      });
    }
    
    // كثافة الكلمة المفتاحية
    const keywordCount = (textContent.match(new RegExp(keywordLower, 'g')) || []).length;
    const wordCount = textContent.split(' ').length;
    const keywordDensity = (keywordCount / wordCount) * 100;
    
    if (keywordDensity > 0.5 && keywordDensity < 2.5) {
      analysis.push({
        text: `كثافة الكلمة المفتاحية مثالية (${keywordDensity.toFixed(1)}%)`,
        status: 'good',
        score: 15
      });
    } else if (keywordDensity > 0 && keywordDensity <= 0.5) {
      analysis.push({
        text: `كثافة الكلمة المفتاحية منخفضة (${keywordDensity.toFixed(1)}%)`,
        status: 'warning',
        score: 7
      });
    } else if (keywordDensity >= 2.5 && keywordDensity < 4) {
      analysis.push({
        text: `كثافة الكلمة المفتاحية مرتفعة قليلاً (${keywordDensity.toFixed(1)}%)`,
        status: 'warning',
        score: 7
      });
    } else if (keywordDensity >= 4) {
      analysis.push({
        text: `كثافة الكلمة المفتاحية مرتفعة جداً (${keywordDensity.toFixed(1)}%)`,
        status: 'bad',
        score: 0
      });
    } else {
      analysis.push({
        text: 'الكلمة المفتاحية غير موجودة في المحتوى',
        status: 'bad',
        score: 0
      });
    }
    
    // التحقق من العناوين الفرعية (Headers)
    if (content.toLowerCase().includes('<h2') || content.toLowerCase().includes('<h3')) {
      analysis.push({
        text: 'تم استخدام العناوين الفرعية',
        status: 'good',
        score: 10
      });
      
      // التحقق من وجود الكلمة المفتاحية في العناوين الفرعية
      const headings = content.match(/<h[2-3][^>]*>(.*?)<\/h[2-3]>/gi) || [];
      let keywordInHeadings = false;
      
      for (const heading of headings) {
        const headingText = stripHtml(heading).toLowerCase();
        if (headingText.includes(keywordLower)) {
          keywordInHeadings = true;
          break;
        }
      }
      
      if (keywordInHeadings) {
        analysis.push({
          text: 'الكلمة المفتاحية موجودة في العناوين الفرعية',
          status: 'good',
          score: 10
        });
      } else {
        analysis.push({
          text: 'الكلمة المفتاحية غير موجودة في العناوين الفرعية',
          status: 'warning',
          score: 5
        });
      }
    } else {
      analysis.push({
        text: 'لم يتم استخدام العناوين الفرعية',
        status: 'bad',
        score: 0
      });
    }
    
    // التحقق من طول المحتوى
    if (wordCount >= 800) {
      analysis.push({
        text: 'طول المحتوى ممتاز (أكثر من 800 كلمة)',
        status: 'good',
        score: 10
      });
    } else if (wordCount >= 500) {
      analysis.push({
        text: 'طول المحتوى جيد (أكثر من 500 كلمة)',
        status: 'good',
        score: 7
      });
    } else if (wordCount >= 300) {
      analysis.push({
        text: 'طول المحتوى متوسط (أكثر من 300 كلمة)',
        status: 'warning',
        score: 5
      });
    } else {
      analysis.push({
        text: 'طول المحتوى قصير جداً (أقل من 300 كلمة)',
        status: 'bad',
        score: 2
      });
    }
    
    // التحقق من وجود الصور
    if (content.toLowerCase().includes('<img')) {
      analysis.push({
        text: 'تم استخدام الصور في المحتوى',
        status: 'good',
        score: 10
      });
      
      // التحقق من وجود النص البديل في الصور
      const images = content.match(/<img[^>]*>/gi) || [];
      let allImagesHaveAlt = true;
      
      for (const img of images) {
        if (!img.includes('alt=') || img.includes('alt=""') || img.includes('alt=\'\'')) {
          allImagesHaveAlt = false;
          break;
        }
      }
      
      if (allImagesHaveAlt) {
        analysis.push({
          text: 'جميع الصور تحتوي على نص بديل',
          status: 'good',
          score: 5
        });
      } else {
        analysis.push({
          text: 'بعض الصور لا تحتوي على نص بديل',
          status: 'bad',
          score: 0
        });
      }
    } else {
      analysis.push({
        text: 'لم يتم استخدام الصور في المحتوى',
        status: 'warning',
        score: 3
      });
    }
    
    // التحقق من وجود الروابط
    if (content.toLowerCase().includes('<a')) {
      analysis.push({
        text: 'تم استخدام الروابط في المحتوى',
        status: 'good',
        score: 5
      });
    } else {
      analysis.push({
        text: 'لم يتم استخدام الروابط في المحتوى',
        status: 'warning',
        score: 2
      });
    }
    
    // حساب النتيجة الإجمالية
    const totalScore = analysis.reduce((sum, item) => sum + item.score, 0);
    const maxScore = 100; // النتيجة القصوى
    const finalScore = Math.round((totalScore / maxScore) * 100);
    
    setSeoAnalysis(analysis);
    setSeoScore(finalScore);
  };
  
  // تحليل قابلية القراءة
  const analyzeReadability = (text: string) => {
    const analysis: Array<{text: string, status: 'good' | 'warning' | 'bad', score: number}> = [];
    
    // تقسيم النص إلى جمل
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const wordCount = text.split(/\s+/).filter(w => w.trim().length > 0).length;
    
    // متوسط طول الجملة
    const avgSentenceLength = wordCount / (sentences.length || 1);
    
    if (avgSentenceLength <= 15) {
      analysis.push({
        text: 'متوسط طول الجملة جيد جداً',
        status: 'good',
        score: 20
      });
    } else if (avgSentenceLength <= 20) {
      analysis.push({
        text: 'متوسط طول الجملة جيد',
        status: 'good',
        score: 15
      });
    } else if (avgSentenceLength <= 25) {
      analysis.push({
        text: 'متوسط طول الجملة مقبول',
        status: 'warning',
        score: 10
      });
    } else {
      analysis.push({
        text: 'متوسط طول الجملة طويل جداً',
        status: 'bad',
        score: 5
      });
    }
    
    // تحقق من الفقرات الطويلة
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    const longParagraphs = paragraphs.filter(p => {
      const paraWords = p.split(/\s+/).filter(w => w.trim().length > 0);
      return paraWords.length > 100;
    });
    
    if (longParagraphs.length === 0) {
      analysis.push({
        text: 'جميع الفقرات بطول مناسب',
        status: 'good',
        score: 20
      });
    } else if (longParagraphs.length <= paragraphs.length * 0.2) {
      analysis.push({
        text: 'بعض الفقرات طويلة',
        status: 'warning',
        score: 10
      });
    } else {
      analysis.push({
        text: 'معظم الفقرات طويلة جداً',
        status: 'bad',
        score: 5
      });
    }
    
    // تحقق من وجود العناوين الفرعية
    if (sentences.length > 20) {
      analysis.push({
        text: 'يجب استخدام العناوين الفرعية لتقسيم المحتوى الطويل',
        status: 'warning',
        score: 10
      });
    }
    
    // الكلمات الصعبة - هذا محاكاة فقط (يحتاج لقاموس حقيقي)
    const complexWordRatio = 0.15; // افتراضي
    
    if (complexWordRatio < 0.1) {
      analysis.push({
        text: 'نسبة الكلمات الصعبة منخفضة',
        status: 'good',
        score: 20
      });
    } else if (complexWordRatio < 0.15) {
      analysis.push({
        text: 'نسبة الكلمات الصعبة مقبولة',
        status: 'good',
        score: 15
      });
    } else if (complexWordRatio < 0.2) {
      analysis.push({
        text: 'نسبة الكلمات الصعبة متوسطة',
        status: 'warning',
        score: 10
      });
    } else {
      analysis.push({
        text: 'نسبة الكلمات الصعبة مرتفعة',
        status: 'bad',
        score: 5
      });
    }
    
    // استخدام الصيغة المبنية للمعلوم (هذا سيكون تقريبي في النسخة العربية)
    analysis.push({
      text: 'استخدم صيغة المبني للمعلوم بدل المبني للمجهول',
      status: 'warning',
      score: 10
    });
    
    // حساب النتيجة الإجمالية
    const totalScore = analysis.reduce((sum, item) => sum + item.score, 0);
    const maxScore = 100; // النتيجة القصوى
    const finalScore = Math.round((totalScore / maxScore) * 100);
    
    setReadabilityAnalysis(analysis);
    setReadability(finalScore);
  };
  
  // Helper function to strip HTML tags
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };
  
  return (
    <div className={`rich-editor ${className}`}>
      <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 bg-white dark:bg-gray-800 border">
          <TabsTrigger value="editor">
            <Edit className="h-4 w-4 ml-2" />
            المحرر
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Search className="h-4 w-4 ml-2" />
            تحسين SEO
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart2 className="h-4 w-4 ml-2" />
            تحليل المحتوى
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 ml-2" />
            إعدادات
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="mt-0">
          {wordCount > 0 && (
            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{wordCount} كلمة</span>
            </div>
          )}
          
          <Editor
            apiKey={apiKey}
            onInit={(evt: any, editor: any) => editorRef.current = editor}
            initialValue={initialValue}
            value={content}
            onEditorChange={handleEditorChange}
            init={{
              height,
              min_height: minHeight,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount',
                'directionality', 'emoticons', 'codesample', 'pagebreak', 'nonbreaking', 
                'autoresize'
              ],
              toolbar1: 'undo redo | styles | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | numlist bullist | link image | ltr rtl | preview',
              toolbar2: 'forecolor backcolor | removeformat | table | pagebreak | emoticons | visualblocks | searchreplace | codesample | fullscreen',
              content_style: 'body { font-family:Arial,Helvetica,sans-serif; font-size:14px }',
              menubar: true,
              statusbar: true,
              resize: true,
              branding: false,
              promotion: false,
              directionality: dir,
              language: 'ar',
              placeholder: placeholder,
              readonly: readOnly,
              block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6;',
              setup: (editor: any) => {
                editor.on('WordCountUpdate', function(e: any) {
                  setWordCount(e.wordCount);
                });
              },
              images_upload_handler: (blobInfo: any, progress: any) => new Promise((resolve, reject) => {
                // هنا يمكن إضافة منطق رفع الصور إلى الخادم
                const reader = new FileReader();
                reader.onload = () => {
                  resolve(reader.result as string);
                };
                reader.onerror = () => {
                  reject('حدث خطأ أثناء قراءة الملف');
                };
                reader.readAsDataURL(blobInfo.blob());
              }),
              inline_styles: true,
              visual: true,
              browser_spellcheck: true,
              contextmenu: false,
              entity_encoding: 'raw'
            }}
          />
        </TabsContent>
        
        <TabsContent value="seo" className="mt-0">
          <div className="space-y-4">
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>إعدادات SEO</span>
                  {seoScore > 0 && (
                    <Badge variant={seoScore >= 70 ? 'success' : seoScore >= 40 ? 'warning' : 'destructive'} className="ml-2">
                      {seoScore}%
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  قم بتحسين عنوان الصفحة والوصف والكلمات المفتاحية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">
                    عنوان SEO 
                    <span className="text-xs text-muted-foreground mr-1">
                      (مثالي: 50-60 حرف)
                    </span>
                  </Label>
                  <Input
                    id="seoTitle"
                    placeholder="أدخل عنوان SEO"
                    value={seoTitle}
                    onChange={(e) => onSeoTitleChange?.(e.target.value)}
                    className="bg-white dark:bg-gray-800"
                    maxLength={70}
                  />
                  {seoTitle && (
                    <div className="text-xs flex justify-between items-center">
                      <span className={seoTitle.length > 60 ? 'text-red-500' : (seoTitle.length < 40 ? 'text-yellow-500' : 'text-green-500')}>
                        {seoTitle.length} / 70
                      </span>
                      {seoTitle.length > 60 && <span className="text-red-500">عنوان طويل جداً</span>}
                      {seoTitle.length < 40 && seoTitle.length > 0 && <span className="text-yellow-500">عنوان قصير</span>}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="seoDescription">
                    وصف SEO 
                    <span className="text-xs text-muted-foreground mr-1">
                      (مثالي: 140-160 حرف)
                    </span>
                  </Label>
                  <Textarea
                    id="seoDescription"
                    placeholder="أدخل وصف SEO"
                    value={seoDescription}
                    onChange={(e) => onSeoDescriptionChange?.(e.target.value)}
                    className="resize-none bg-white dark:bg-gray-800"
                    maxLength={170}
                    rows={3}
                  />
                  {seoDescription && (
                    <div className="text-xs flex justify-between items-center">
                      <span className={seoDescription.length > 160 ? 'text-red-500' : (seoDescription.length < 120 ? 'text-yellow-500' : 'text-green-500')}>
                        {seoDescription.length} / 170
                      </span>
                      {seoDescription.length > 160 && <span className="text-red-500">وصف طويل جداً</span>}
                      {seoDescription.length < 120 && seoDescription.length > 0 && <span className="text-yellow-500">وصف قصير</span>}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="focusKeyword">
                    الكلمة المفتاحية الرئيسية 
                    <span className="text-xs text-muted-foreground mr-1">
                      (مهم جداً لتحليل SEO)
                    </span>
                  </Label>
                  <Input
                    id="focusKeyword"
                    placeholder="أدخل الكلمة المفتاحية الرئيسية"
                    value={focusKeyword}
                    onChange={(e) => onFocusKeywordChange?.(e.target.value)}
                    className="bg-white dark:bg-gray-800"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="seoKeywords">
                    الكلمات المفتاحية
                    <span className="text-xs text-muted-foreground mr-1">
                      (مفصولة بفواصل)
                    </span>
                  </Label>
                  <Textarea
                    id="seoKeywords"
                    placeholder="مثال: منح دراسية, منح خارجية, الدراسة في الخارج"
                    value={seoKeywords}
                    onChange={(e) => onSeoKeywordsChange?.(e.target.value)}
                    className="resize-none bg-white dark:bg-gray-800"
                    rows={2}
                  />
                </div>
                
                {focusKeyword && content && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">تحليل SEO</h4>
                      <div className="flex items-center">
                        <span className="text-sm font-medium ml-2">النتيجة:</span>
                        <span className={`text-sm font-bold ${seoScore >= 70 ? 'text-green-600' : seoScore >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                          {seoScore}%
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={seoScore} 
                      className="h-2 bg-gray-200" 
                    />
                    
                    <div className="mt-4 space-y-3">
                      {seoAnalysis.map((analysis, index) => (
                        <div key={index} className="flex items-start gap-2">
                          {analysis.status === 'good' && (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          )}
                          {analysis.status === 'warning' && (
                            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          )}
                          {analysis.status === 'bad' && (
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          )}
                          <span className="text-sm">{analysis.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {!focusKeyword && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-800 text-sm">
                      قم بإدخال الكلمة المفتاحية الرئيسية للحصول على تحليل SEO
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">معاينة نتائج البحث</CardTitle>
                <CardDescription>
                  كيف ستظهر صفحتك في محركات البحث
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 border rounded-md">
                  <h3 className="text-blue-600 text-base font-medium hover:underline truncate">
                    {seoTitle || 'عنوان الصفحة سيظهر هنا'}
                  </h3>
                  <div className="text-gray-800 text-xs">
                    {window.location.host}/{seoTitle ? (seoTitle.toLowerCase().replace(/\s+/g, '-')) : 'slug-will-appear-here'}
                  </div>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {seoDescription || 'وصف الصفحة سيظهر هنا. قم بإضافة وصف يلخص محتوى الصفحة بشكل دقيق وجذاب للمستخدم.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-0">
          <div className="space-y-4">
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>إحصائيات المحتوى</span>
                </CardTitle>
                <CardDescription>
                  معلومات تفصيلية حول محتوى النص
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded-md text-center">
                    <span className="text-gray-500 text-xs">عدد الكلمات</span>
                    <h4 className="text-xl font-bold text-gray-800">{wordCount}</h4>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md text-center">
                    <span className="text-gray-500 text-xs">وقت القراءة</span>
                    <h4 className="text-xl font-bold text-gray-800">{Math.ceil(wordCount / 200)} دقائق</h4>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md text-center">
                    <span className="text-gray-500 text-xs">درجة القراءة</span>
                    <h4 className="text-xl font-bold text-gray-800">{readability}%</h4>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md text-center">
                    <span className="text-gray-500 text-xs">درجة SEO</span>
                    <h4 className="text-xl font-bold text-gray-800">{seoScore}%</h4>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-3">جودة المحتوى</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">قابلية القراءة</span>
                        <span className={`text-sm font-medium ${readability >= 70 ? 'text-green-600' : readability >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                          {readability}%
                        </span>
                      </div>
                      <Progress 
                        value={readability} 
                        className="h-1.5 bg-gray-200" 
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">تحسين محركات البحث</span>
                        <span className={`text-sm font-medium ${seoScore >= 70 ? 'text-green-600' : seoScore >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                          {seoScore}%
                        </span>
                      </div>
                      <Progress 
                        value={seoScore} 
                        className="h-1.5 bg-gray-200" 
                      />
                    </div>
                  </div>
                </div>
                
                {/* تحليل قابلية القراءة */}
                {wordCount > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">تحليل قابلية القراءة</h4>
                    <div className="space-y-3">
                      {readabilityAnalysis.map((analysis, index) => (
                        <div key={index} className="flex items-start gap-2">
                          {analysis.status === 'good' && (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          )}
                          {analysis.status === 'warning' && (
                            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          )}
                          {analysis.status === 'bad' && (
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          )}
                          <span className="text-sm">{analysis.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {wordCount === 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-blue-800 text-sm">
                      قم بإضافة محتوى في المحرر للحصول على التحليل
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-0">
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">إعدادات المحرر</CardTitle>
              <CardDescription>
                تخصيص خيارات المحرر والظهور
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start gap-2">
                  <Image className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-blue-800 text-sm font-medium mb-1">إضافة الصور</h4>
                    <p className="text-blue-700 text-xs">
                      يمكنك رفع الصور مباشرة عن طريق زر "إدراج صورة" في المحرر. تأكد من إضافة نص بديل للصور لتحسين السيو.
                    </p>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-start gap-2">
                  <BarChart2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-green-800 text-sm font-medium mb-1">تحليل SEO مباشر</h4>
                    <p className="text-green-700 text-xs">
                      المحرر يقوم بتحليل المحتوى تلقائياً لتحسين الظهور في محركات البحث. استخدم الكلمة المفتاحية في العنوان والمقدمة والعناوين الفرعية.
                    </p>
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-md p-3 flex items-start gap-2">
                  <Settings className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-purple-800 text-sm font-medium mb-1">أدوات متقدمة</h4>
                    <p className="text-purple-700 text-xs">
                      استخدم أدوات المحرر المتقدمة مثل إضافة الجداول والقوائم والاقتباسات لإثراء المحتوى وجعله أكثر جاذبية وتنظيماً.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}