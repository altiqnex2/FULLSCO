import { useEffect, useState, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TagInput from "./TagInput";
import { t } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Post, Category } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PostEditorProps {
  initialPost?: Partial<Post>;
  onSave: (postData: any) => Promise<void>;
}

export default function PostEditor({ initialPost, onSave }: PostEditorProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(initialPost?.title || "");
  const [category, setCategory] = useState(initialPost?.categoryId?.toString() || "");
  const [content, setContent] = useState(initialPost?.content || "");
  const [status, setStatus] = useState(initialPost?.status || "draft");
  const [tags, setTags] = useState<string[]>(initialPost?.tags || []);
  const [imageUrl, setImageUrl] = useState(initialPost?.featuredImage || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast({
        title: "خطأ",
        description: "عنوان المقال مطلوب",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get content from editor
      const editorContent = editorRef.current ? editorRef.current.getContent() : content;

      const postData = {
        title,
        categoryId: category ? parseInt(category) : undefined,
        content: editorContent,
        status,
        tags,
        featuredImage: imageUrl,
      };

      await onSave(postData);
      
      toast({
        title: "نجاح",
        description: t("postSaved"),
      });
    } catch (error) {
      console.error("Error saving post:", error);
      toast({
        title: "خطأ",
        description: t("errorOccurred"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // In a real app, we would upload the file to a server
      // For now, create a local object URL
      const imageUrl = URL.createObjectURL(file);
      setImageUrl(imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الصورة",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardContent className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {initialPost?.id ? "تعديل المقال" : t("createPost")}
        </h1>
        
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4">
            <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              {t("title")}
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("enterTitle")}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
            />
          </div>
          
          {/* Category */}
          <div className="mb-4">
            <Label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              {t("category")}
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="اختر تصنيف" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat: Category) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Featured Image */}
          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              {t("featuredImage")}
            </Label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imageUrl ? (
                  <div className="mb-3">
                    <img src={imageUrl} alt="صورة المعاينة" className="mx-auto h-48 object-cover" />
                  </div>
                ) : null}
                <div className="flex flex-col items-center text-sm text-gray-600">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p>{t("dragAndDrop")}</p>
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none mt-2">
                    <span>{t("browse")}</span>
                    <input
                      id="file-upload"
                      ref={fileInputRef}
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content / TinyMCE Editor */}
          <div className="mb-6">
            <Label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              {t("content")}
            </Label>
            <Editor
              apiKey="q471jgf8f3tf021wog7g5ja3spibypjg739h8z86gbz2fi6h"
              onInit={(evt, editor) => editorRef.current = editor}
              initialValue={content}
              init={{
                height: 400,
                directionality: 'rtl',
                plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                content_style: 'body { font-family: "Merriweather", serif; font-size: 16px; line-height: 1.6; }',
                images_upload_handler: (blobInfo, progress) => {
                  return new Promise((resolve) => {
                    // In a real app, this would upload to a server
                    // For now, return a data URL
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      resolve(e.target?.result as string);
                    };
                    reader.readAsDataURL(blobInfo.blob());
                  });
                }
              }}
            />
          </div>
          
          {/* Tags */}
          <div className="mb-6">
            <Label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              {t("tags")}
            </Label>
            <TagInput initialTags={tags} onChange={setTags} />
          </div>
          
          {/* Status and Publish */}
          <div className="flex flex-wrap items-center justify-between mt-8">
            <div className="flex items-center">
              <Label htmlFor="status" className="mr-2 text-sm font-medium text-gray-700">
                {t("status")}
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t("draft")}</SelectItem>
                  <SelectItem value="published">{t("published")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-3 space-x-reverse mt-4 sm:mt-0">
              <Button type="button" variant="outline">
                {t("preview")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {initialPost?.id ? t("save") : t("publish")}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
