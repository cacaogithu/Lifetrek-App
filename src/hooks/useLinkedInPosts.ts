import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LinkedInPost, LinkedInPostInsert, LinkedInPostUpdate } from "@/types/linkedin";
import { toast } from "sonner";

// Fetch all LinkedIn posts (optionally filter by status)
export function useLinkedInPosts(status?: string) {
  return useQuery({
    queryKey: ["linkedin_posts", status],
    queryFn: async () => {
      let query = supabase
        .from("linkedin_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as LinkedInPost[];
    },
  });
}

// Fetch single LinkedIn post by ID
export function useLinkedInPost(id: string) {
  return useQuery({
    queryKey: ["linkedin_post", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("linkedin_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as LinkedInPost;
    },
    enabled: !!id,
  });
}

// Create new LinkedIn post
export function useCreateLinkedInPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: LinkedInPostInsert) => {
      const { data, error } = await supabase
        .from("linkedin_posts")
        .insert(post)
        .select()
        .single();

      if (error) throw error;
      return data as LinkedInPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linkedin_posts"] });
      toast.success("Post do LinkedIn criado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Error creating LinkedIn post:", error);
      toast.error("Erro ao criar post do LinkedIn");
    },
  });
}

// Update LinkedIn post
export function useUpdateLinkedInPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: LinkedInPostUpdate) => {
      const { data, error } = await supabase
        .from("linkedin_posts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as LinkedInPost;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["linkedin_posts"] });
      queryClient.invalidateQueries({ queryKey: ["linkedin_post", data.id] });
      toast.success("Post atualizado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Error updating LinkedIn post:", error);
      toast.error("Erro ao atualizar post");
    },
  });
}

// Approve LinkedIn post
export function useApproveLinkedInPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("linkedin_posts")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as LinkedInPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linkedin_posts"] });
      toast.success("Post aprovado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Error approving post:", error);
      toast.error("Erro ao aprovar post");
    },
  });
}

// Reject LinkedIn post
export function useRejectLinkedInPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data, error } = await supabase
        .from("linkedin_posts")
        .update({
          status: "rejected",
          rejection_reason: reason,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as LinkedInPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linkedin_posts"] });
      toast.success("Post rejeitado");
    },
    onError: (error: any) => {
      console.error("Error rejecting post:", error);
      toast.error("Erro ao rejeitar post");
    },
  });
}

// Publish LinkedIn post (after approval)
export function usePublishLinkedInPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("linkedin_posts")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as LinkedInPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linkedin_posts"] });
      toast.success("Post publicado no LinkedIn!");
    },
    onError: (error: any) => {
      console.error("Error publishing post:", error);
      toast.error("Erro ao publicar post");
    },
  });
}

// Delete LinkedIn post
export function useDeleteLinkedInPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("linkedin_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linkedin_posts"] });
      toast.success("Post deletado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Error deleting post:", error);
      toast.error("Erro ao deletar post");
    },
  });
}

// Get content approval items (combines blogs and LinkedIn posts)
export function useContentApprovalItems() {
  return useQuery({
    queryKey: ["content_approval_items"],
    queryFn: async () => {
      // Fetch pending blogs
      const { data: blogs, error: blogsError } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "pending_review")
        .order("created_at", { ascending: false });

      if (blogsError) throw blogsError;

      // Fetch pending LinkedIn posts
      const { data: linkedInPosts, error: linkedInError } = await supabase
        .from("linkedin_posts")
        .select("*")
        .eq("status", "pending_approval")
        .order("created_at", { ascending: false });

      if (linkedInError) throw linkedInError;

      // Combine and format
      const items = [
        ...(blogs || []).map((blog: any) => ({
          id: blog.id,
          type: 'blog' as const,
          title: blog.title,
          content_preview: blog.excerpt || blog.content.substring(0, 150),
          status: blog.status,
          created_at: blog.created_at,
          ai_generated: blog.ai_generated || false,
          full_data: blog,
        })),
        ...(linkedInPosts || []).map((post: any) => ({
          id: post.id,
          type: 'linkedin' as const,
          title: post.topic,
          content_preview: post.carousel_data?.slides?.[0]?.headline || '',
          status: post.status,
          created_at: post.created_at,
          ai_generated: post.ai_generated || false,
          full_data: post,
        })),
      ];

      // Sort by created_at
      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return items;
    },
  });
}
