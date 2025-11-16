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
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      outreach_campaigns: {
        Row: {
          created_at: string
          created_by: string
          district: string
          event_date: string | null
          id: string
          organization_id: string
          province: string
          school_type: string
          status: string
          updated_at: string
          visit_date: string | null
          visit_details: Json
        }
        Insert: {
          created_at?: string
          created_by: string
          district: string
          event_date?: string | null
          id?: string
          organization_id: string
          province: string
          school_type: string
          status?: string
          updated_at?: string
          visit_date?: string | null
          visit_details?: Json
        }
        Update: {
          created_at?: string
          created_by?: string
          district?: string
          event_date?: string | null
          id?: string
          organization_id?: string
          province?: string
          school_type?: string
          status?: string
          updated_at?: string
          visit_date?: string | null
          visit_details?: Json
        }
        Relationships: [
          {
            foreignKeyName: "outreach_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_requests: {
        Row: {
          additional_notes: string | null
          alternative_date: string | null
          contact_email: string
          contact_person: string
          contact_phone: string | null
          created_at: string
          expected_participants: number | null
          grade_levels: string[] | null
          id: string
          organization_id: string | null
          outreach_type: string
          preferred_date: string | null
          response_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          school_name: string
          status: string
          updated_at: string
          user_id: string
          workshop_topic: string | null
        }
        Insert: {
          additional_notes?: string | null
          alternative_date?: string | null
          contact_email: string
          contact_person: string
          contact_phone?: string | null
          created_at?: string
          expected_participants?: number | null
          grade_levels?: string[] | null
          id?: string
          organization_id?: string | null
          outreach_type: string
          preferred_date?: string | null
          response_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_name: string
          status?: string
          updated_at?: string
          user_id: string
          workshop_topic?: string | null
        }
        Update: {
          additional_notes?: string | null
          alternative_date?: string | null
          contact_email?: string
          contact_person?: string
          contact_phone?: string | null
          created_at?: string
          expected_participants?: number | null
          grade_levels?: string[] | null
          id?: string
          organization_id?: string | null
          outreach_type?: string
          preferred_date?: string | null
          response_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_name?: string
          status?: string
          updated_at?: string
          user_id?: string
          workshop_topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      questionnaire_responses: {
        Row: {
          additional_info: string | null
          capacity_per_session: number | null
          company_type: string | null
          contact_phone: string | null
          created_at: string
          geographic_coverage: string[] | null
          grade_levels: string[] | null
          id: string
          organization_name: string
          preferred_contact_method: string | null
          preferred_topics: string[] | null
          questionnaire_type: Database["public"]["Enums"]["questionnaire_type"]
          resources_available: string | null
          resources_needed: string | null
          respondent_email: string
          respondent_name: string
          school_district: string | null
          school_province: string | null
          school_type: string | null
          services_offered: string[] | null
          status: string
          student_count: number | null
          subjects_interested: string[] | null
          topics_can_cover: string[] | null
          updated_at: string
        }
        Insert: {
          additional_info?: string | null
          capacity_per_session?: number | null
          company_type?: string | null
          contact_phone?: string | null
          created_at?: string
          geographic_coverage?: string[] | null
          grade_levels?: string[] | null
          id?: string
          organization_name: string
          preferred_contact_method?: string | null
          preferred_topics?: string[] | null
          questionnaire_type: Database["public"]["Enums"]["questionnaire_type"]
          resources_available?: string | null
          resources_needed?: string | null
          respondent_email: string
          respondent_name: string
          school_district?: string | null
          school_province?: string | null
          school_type?: string | null
          services_offered?: string[] | null
          status?: string
          student_count?: number | null
          subjects_interested?: string[] | null
          topics_can_cover?: string[] | null
          updated_at?: string
        }
        Update: {
          additional_info?: string | null
          capacity_per_session?: number | null
          company_type?: string | null
          contact_phone?: string | null
          created_at?: string
          geographic_coverage?: string[] | null
          grade_levels?: string[] | null
          id?: string
          organization_name?: string
          preferred_contact_method?: string | null
          preferred_topics?: string[] | null
          questionnaire_type?: Database["public"]["Enums"]["questionnaire_type"]
          resources_available?: string | null
          resources_needed?: string | null
          respondent_email?: string
          respondent_name?: string
          school_district?: string | null
          school_province?: string | null
          school_type?: string | null
          services_offered?: string[] | null
          status?: string
          student_count?: number | null
          subjects_interested?: string[] | null
          topics_can_cover?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      school_recommendations: {
        Row: {
          campaign_id: string
          created_at: string
          enrollment_total: number | null
          generated_data: Json
          generated_letter: string | null
          id: string
          is_accepted: boolean | null
          is_replacement: boolean | null
          language_of_instruction: string | null
          letter_sent_at: string | null
          responded_at: string | null
          response_status: string | null
          response_token: string | null
          school_id: string | null
          school_response: string | null
          school_response_at: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string
          enrollment_total?: number | null
          generated_data: Json
          generated_letter?: string | null
          id?: string
          is_accepted?: boolean | null
          is_replacement?: boolean | null
          language_of_instruction?: string | null
          letter_sent_at?: string | null
          responded_at?: string | null
          response_status?: string | null
          response_token?: string | null
          school_id?: string | null
          school_response?: string | null
          school_response_at?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string
          enrollment_total?: number | null
          generated_data?: Json
          generated_letter?: string | null
          id?: string
          is_accepted?: boolean | null
          is_replacement?: boolean | null
          language_of_instruction?: string | null
          letter_sent_at?: string | null
          responded_at?: string | null
          response_status?: string | null
          response_token?: string | null
          school_id?: string | null
          school_response?: string | null
          school_response_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_recommendations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "outreach_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_recommendations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          circuit: string | null
          created_at: string
          district: string | null
          educators_2024: number | null
          id: string
          institution_name: string
          latitude: number | null
          learners_2024: number | null
          longitude: number | null
          nat_emis: string
          no_fee_school: string | null
          organization_id: string | null
          phase_ped: string | null
          postal_address: string | null
          province: string
          quintile: string | null
          sector: string | null
          status: string | null
          street_address: string | null
          suburb: string | null
          telephone: string | null
          town_city: string | null
          township_village: string | null
          type_doe: string | null
          urban_rural: string | null
        }
        Insert: {
          circuit?: string | null
          created_at?: string
          district?: string | null
          educators_2024?: number | null
          id?: string
          institution_name: string
          latitude?: number | null
          learners_2024?: number | null
          longitude?: number | null
          nat_emis: string
          no_fee_school?: string | null
          organization_id?: string | null
          phase_ped?: string | null
          postal_address?: string | null
          province: string
          quintile?: string | null
          sector?: string | null
          status?: string | null
          street_address?: string | null
          suburb?: string | null
          telephone?: string | null
          town_city?: string | null
          township_village?: string | null
          type_doe?: string | null
          urban_rural?: string | null
        }
        Update: {
          circuit?: string | null
          created_at?: string
          district?: string | null
          educators_2024?: number | null
          id?: string
          institution_name?: string
          latitude?: number | null
          learners_2024?: number | null
          longitude?: number | null
          nat_emis?: string
          no_fee_school?: string | null
          organization_id?: string | null
          phase_ped?: string | null
          postal_address?: string | null
          province?: string
          quintile?: string | null
          sector?: string | null
          status?: string | null
          street_address?: string | null
          suburb?: string | null
          telephone?: string | null
          town_city?: string | null
          township_village?: string | null
          type_doe?: string | null
          urban_rural?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schools_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organizations: { Args: { _user_id: string }; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_current_user_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "organization" | "admin" | "school_official" | "learner"
      questionnaire_type: "school_needs" | "company_offers"
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
      app_role: ["organization", "admin", "school_official", "learner"],
      questionnaire_type: ["school_needs", "company_offers"],
    },
  },
} as const
