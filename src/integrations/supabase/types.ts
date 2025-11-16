export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_response_suggestions: {
        Row: {
          company_research_id: string | null
          created_at: string | null
          email_body: string
          follow_up_date: string | null
          id: string
          key_points: string[] | null
          lead_id: string | null
          priority_level: string | null
          subject_line: string
        }
        Insert: {
          company_research_id?: string | null
          created_at?: string | null
          email_body: string
          follow_up_date?: string | null
          id?: string
          key_points?: string[] | null
          lead_id?: string | null
          priority_level?: string | null
          subject_line: string
        }
        Update: {
          company_research_id?: string | null
          created_at?: string | null
          email_body?: string
          follow_up_date?: string | null
          id?: string
          key_points?: string[] | null
          lead_id?: string | null
          priority_level?: string | null
          subject_line?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_response_suggestions_company_research_id_fkey"
            columns: ["company_research_id"]
            isOneToOne: false
            referencedRelation: "company_research"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_response_suggestions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "contact_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_response_suggestions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_analytics_detailed"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          company_email: string | null
          company_name: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          company_email?: string | null
          company_name?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          company_email?: string | null
          company_name?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      company_research: {
        Row: {
          company_name: string | null
          created_at: string | null
          domain: string
          expires_at: string | null
          id: string
          industry: string | null
          key_products: string[] | null
          linkedin_info: string | null
          recent_news: string | null
          researched_at: string | null
          website_summary: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          domain: string
          expires_at?: string | null
          id?: string
          industry?: string | null
          key_products?: string[] | null
          linkedin_info?: string | null
          recent_news?: string | null
          researched_at?: string | null
          website_summary?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          domain?: string
          expires_at?: string | null
          id?: string
          industry?: string | null
          key_products?: string[] | null
          linkedin_info?: string | null
          recent_news?: string | null
          researched_at?: string | null
          website_summary?: string | null
        }
        Relationships: []
      }
      contact_leads: {
        Row: {
          admin_notes: string | null
          annual_volume: string | null
          assigned_to: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string
          priority: Database["public"]["Enums"]["lead_priority"]
          project_type: string
          project_types:
            | Database["public"]["Enums"]["project_type_option"][]
            | null
          status: Database["public"]["Enums"]["lead_status"]
          technical_requirements: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          annual_volume?: string | null
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone: string
          priority?: Database["public"]["Enums"]["lead_priority"]
          project_type: string
          project_types?:
            | Database["public"]["Enums"]["project_type_option"][]
            | null
          status?: Database["public"]["Enums"]["lead_status"]
          technical_requirements: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          annual_volume?: string | null
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string
          priority?: Database["public"]["Enums"]["lead_priority"]
          project_type?: string
          project_types?:
            | Database["public"]["Enums"]["project_type_option"][]
            | null
          status?: Database["public"]["Enums"]["lead_status"]
          technical_requirements?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      linkedin_carousels: {
        Row: {
          admin_user_id: string
          caption: string
          created_at: string
          cta_action: string | null
          desired_outcome: string | null
          format: string | null
          generation_settings: Json | null
          id: string
          image_urls: Json | null
          is_favorite: boolean | null
          pain_point: string | null
          performance_metrics: Json | null
          proof_points: string | null
          slides: Json
          target_audience: string
          topic: string
          updated_at: string
        }
        Insert: {
          admin_user_id: string
          caption: string
          created_at?: string
          cta_action?: string | null
          desired_outcome?: string | null
          format?: string | null
          generation_settings?: Json | null
          id?: string
          image_urls?: Json | null
          is_favorite?: boolean | null
          pain_point?: string | null
          performance_metrics?: Json | null
          proof_points?: string | null
          slides: Json
          target_audience: string
          topic: string
          updated_at?: string
        }
        Update: {
          admin_user_id?: string
          caption?: string
          created_at?: string
          cta_action?: string | null
          desired_outcome?: string | null
          format?: string | null
          generation_settings?: Json | null
          id?: string
          image_urls?: Json | null
          is_favorite?: boolean | null
          pain_point?: string | null
          performance_metrics?: Json | null
          proof_points?: string | null
          slides?: Json
          target_audience?: string
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      processed_product_images: {
        Row: {
          brand: string | null
          category: string
          created_at: string
          custom_prompt: string | null
          description: string | null
          enhanced_url: string
          file_size: number | null
          id: string
          is_featured: boolean | null
          is_visible: boolean | null
          model: string | null
          name: string
          original_filename: string
          original_url: string
          processed_by: string | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category: string
          created_at?: string
          custom_prompt?: string | null
          description?: string | null
          enhanced_url: string
          file_size?: number | null
          id?: string
          is_featured?: boolean | null
          is_visible?: boolean | null
          model?: string | null
          name: string
          original_filename: string
          original_url: string
          processed_by?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string
          created_at?: string
          custom_prompt?: string | null
          description?: string | null
          enhanced_url?: string
          file_size?: number | null
          id?: string
          is_featured?: boolean | null
          is_visible?: boolean | null
          model?: string | null
          name?: string
          original_filename?: string
          original_url?: string
          processed_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      product_catalog: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      lead_analytics_detailed: {
        Row: {
          annual_volume: string | null
          company: string | null
          created_at: string | null
          email: string | null
          id: string | null
          is_converted: boolean | null
          lead_date: string | null
          name: string | null
          phone: string | null
          priority: Database["public"]["Enums"]["lead_priority"] | null
          project_types:
            | Database["public"]["Enums"]["project_type_option"][]
            | null
          status: Database["public"]["Enums"]["lead_status"] | null
          time_bucket: string | null
          updated_at: string | null
        }
        Insert: {
          annual_volume?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          is_converted?: never
          lead_date?: never
          name?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["lead_priority"] | null
          project_types?:
            | Database["public"]["Enums"]["project_type_option"][]
            | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          time_bucket?: never
          updated_at?: string | null
        }
        Update: {
          annual_volume?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          is_converted?: never
          lead_date?: never
          name?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["lead_priority"] | null
          project_types?:
            | Database["public"]["Enums"]["project_type_option"][]
            | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          time_bucket?: never
          updated_at?: string | null
        }
        Relationships: []
      }
      lead_metrics_by_period: {
        Row: {
          active_leads: number | null
          closed_leads: number | null
          conversion_rate: number | null
          new_leads: number | null
          period: string | null
          rejected_leads: number | null
          total_leads: number | null
        }
        Relationships: []
      }
      project_type_distribution: {
        Row: {
          conversion_rate: number | null
          converted_count: number | null
          count: number | null
          project_type:
            | Database["public"]["Enums"]["project_type_option"]
            | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      lead_priority: "low" | "medium" | "high"
      lead_status:
        | "new"
        | "contacted"
        | "in_progress"
        | "quoted"
        | "closed"
        | "rejected"
      project_type_option:
        | "dental_implants"
        | "orthopedic_implants"
        | "spinal_implants"
        | "veterinary_implants"
        | "surgical_instruments"
        | "micro_precision_parts"
        | "custom_tooling"
        | "medical_devices"
        | "measurement_tools"
        | "other_medical"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      lead_priority: ["low", "medium", "high"],
      lead_status: [
        "new",
        "contacted",
        "in_progress",
        "quoted",
        "closed",
        "rejected",
      ],
      project_type_option: [
        "dental_implants",
        "orthopedic_implants",
        "spinal_implants",
        "veterinary_implants",
        "surgical_instruments",
        "micro_precision_parts",
        "custom_tooling",
        "medical_devices",
        "measurement_tools",
        "other_medical",
      ],
    },
  },
} as const
