import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

type LinkedInCarousel = Tables<"linkedin_carousels">;

// Fetch all LinkedIn carousels (optionally filter by status)
export function useLinkedInPosts(status?: string) {
  return useQuery({
    queryKey: ["linkedin_carousels", status],
    queryFn: async () => {
      let query = supabase
        .from("linkedin_carousels")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as LinkedInCarousel[];
    },
  });
}

// Fetch single LinkedIn carousel by ID
export function useLinkedInPost(id: string) {
  return useQuery({
    queryKey: ["linkedin_carousel", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("linkedin_carousels")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as LinkedInCarousel;
    },
    enabled: !!id,
  });
}

// Update LinkedIn carousel
export function useUpdateLinkedInPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<LinkedInCarousel>) => {
      const { data, error } = await supabase
        .from("linkedin_carousels")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as LinkedInCarousel;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["linkedin_carousels"] });
      queryClient.invalidateQueries({ queryKey: ["linkedin_carousel", data.id] });
      toast.success("Post atualizado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Error updating LinkedIn carousel:", error);
      toast.error("Erro ao atualizar post");
    },
  });
}

// Approve LinkedIn carousel
export function useApproveLinkedInPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("linkedin_carousels")
        .update({
          status: "approved",
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as LinkedInCarousel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linkedin_carousels"] });
      toast.success("Post aprovado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Error approving carousel:", error);
      toast.error("Erro ao aprovar post");
    },
  });
}

// Reject LinkedIn carousel
export function useRejectLinkedInPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data, error } = await supabase
        .from("linkedin_carousels")
        .update({
          status: "archived",
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as LinkedInCarousel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linkedin_carousels"] });
      toast.success("Post rejeitado");
    },
    onError: (error: any) => {
      console.error("Error rejecting carousel:", error);
      toast.error("Erro ao rejeitar post");
    },
  });
}

// Publish LinkedIn carousel (after approval)
export function usePublishLinkedInPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("linkedin_carousels")
        .update({
          status: "published",
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as LinkedInCarousel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linkedin_carousels"] });
      toast.success("Post publicado no LinkedIn!");
    },
    onError: (error: any) => {
      console.error("Error publishing carousel:", error);
      toast.error("Erro ao publicar post");
    },
  });
}

// Delete LinkedIn carousel
export function useDeleteLinkedInPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("linkedin_carousels")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linkedin_carousels"] });
      toast.success("Post deletado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Error deleting carousel:", error);
      toast.error("Erro ao deletar post");
    },
  });
}

// Get content approval items (combines blogs and LinkedIn carousels)
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

      // Fetch draft/pending LinkedIn carousels
      const { data: linkedInCarousels, error: linkedInError } = await supabase
        .from("linkedin_carousels")
        .select("*")
        .in("status", ["draft", "pending_approval"])
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
        ...(linkedInCarousels || []).map((carousel: any) => ({
          id: carousel.id,
          type: 'linkedin' as const,
          title: carousel.topic,
          content_preview: carousel.slides?.[0]?.headline || carousel.caption?.substring(0, 100) || '',
          status: carousel.status,
          created_at: carousel.created_at,
          ai_generated: true,
          full_data: carousel,
        })),
      ];

      // Sort by created_at
      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return items;
    },
  });
}
