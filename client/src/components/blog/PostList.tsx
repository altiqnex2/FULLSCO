import { useQuery, useMutation } from "@tanstack/react-query";
import { Post } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function PostList() {
  const [, navigate] = useLocation();
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/posts"],
  });

  // Delete mutation
  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف المقال بنجاح",
      });
      setPostToDelete(null);
    },
    onError: (error) => {
      console.error("Error deleting post:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المقال",
        variant: "destructive",
      });
    },
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle edit button click
  const handleEdit = (postId: number) => {
    navigate(`/posts/edit/${postId}`);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (postToDelete) {
      deletePostMutation.mutate(postToDelete);
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">{t("recentPosts")}</h2>
          <Button
            onClick={() => navigate("/posts/new")}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {t("createPost")}
          </Button>
        </div>

        {isLoading ? (
          <div className="py-20 text-center">
            <p>جاري التحميل...</p>
          </div>
        ) : posts?.length === 0 ? (
          <div className="py-20 text-center">
            <p>لا توجد مقالات. أنشئ مقالك الأول!</p>
          </div>
        ) : (
          <div className="border-t border-gray-200">
            {posts?.map((post: Post) => (
              <div key={post.id} className="py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center text-sm text-gray-500">
                      <span className="ml-3">التصنيف: {post.category?.name || "-"}</span>
                      <span className="ml-3">الحالة: {post.status === "published" ? t("published") : t("draft")}</span>
                      <span>
                        {post.status === "published"
                          ? `${t("publishDate")}: ${formatDate(post.publishedAt || "")}`
                          : `${t("creationDate")}: ${formatDate(post.createdAt)}`}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center">
                    <button
                      className="mr-2 text-gray-400 hover:text-gray-500"
                      onClick={() => handleEdit(post.id)}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      className="mr-2 text-gray-400 hover:text-red-500"
                      onClick={() => setPostToDelete(post.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination (simplified for now) */}
        {posts?.length > 0 && (
          <div className="mt-5 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {t("showing")} <span className="font-medium">1</span> {t("to")}{" "}
              <span className="font-medium">{posts.length}</span> {t("of")}{" "}
              <span className="font-medium">{posts.length}</span> {t("posts_plural")}
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button variant="outline" size="sm" disabled>
                {t("previous")}
              </Button>
              <Button variant="outline" size="sm" disabled>
                {t("next")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Delete confirmation dialog */}
      <AlertDialog open={postToDelete !== null} onOpenChange={() => setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
