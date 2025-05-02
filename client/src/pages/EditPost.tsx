import { useQuery, useMutation } from "@tanstack/react-query";
import PostEditor from "@/components/blog/PostEditor";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

interface EditPostProps {
  id: string;
}

export default function EditPost({ id }: EditPostProps) {
  const [, navigate] = useLocation();
  const postId = parseInt(id);

  // Fetch post data
  const { data: post, isLoading } = useQuery({
    queryKey: [`/api/posts/${postId}`],
    enabled: !!postId && !isNaN(postId),
  });

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const res = await apiRequest("PUT", `/api/posts/${postId}`, postData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}`] });
      navigate("/");
    },
  });

  const handleSave = async (postData: any) => {
    await updatePostMutation.mutateAsync(postData);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!post) {
    return <div>المقال غير موجود</div>;
  }

  return (
    <PostEditor initialPost={post} onSave={handleSave} />
  );
}
