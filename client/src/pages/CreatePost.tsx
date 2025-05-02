import { useMutation } from "@tanstack/react-query";
import PostEditor from "@/components/blog/PostEditor";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function CreatePost() {
  const [, navigate] = useLocation();

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const res = await apiRequest("POST", "/api/posts", postData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      navigate("/");
    },
  });

  const handleSave = async (postData: any) => {
    await createPostMutation.mutateAsync(postData);
  };

  return (
    <PostEditor onSave={handleSave} />
  );
}
