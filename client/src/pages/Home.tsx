import { useQuery } from "@tanstack/react-query";
import PostList from "@/components/blog/PostList";

export default function Home() {
  return (
    <div>
      <PostList />
    </div>
  );
}
