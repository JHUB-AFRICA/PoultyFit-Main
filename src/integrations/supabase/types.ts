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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      county_bylaws: {
        Row: {
          county: string
          id: string
          max_birds_residential: number | null
          notes: string | null
          permit_required: boolean
          setback_meters: number | null
          source_url: string | null
          sub_county: string | null
          updated_at: string
        }
        Insert: {
          county: string
          id?: string
          max_birds_residential?: number | null
          notes?: string | null
          permit_required?: boolean
          setback_meters?: number | null
          source_url?: string | null
          sub_county?: string | null
          updated_at?: string
        }
        Update: {
          county?: string
          id?: string
          max_birds_residential?: number | null
          notes?: string | null
          permit_required?: boolean
          setback_meters?: number | null
          source_url?: string | null
          sub_county?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      disease_predictions: {
        Row: {
          created_at: string
          id: string
          ml_response: Json | null
          species: string | null
          symptoms: string[]
          top_disease_slug: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ml_response?: Json | null
          species?: string | null
          symptoms?: string[]
          top_disease_slug?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ml_response?: Json | null
          species?: string | null
          symptoms?: string[]
          top_disease_slug?: string | null
          user_id?: string
        }
        Relationships: []
      }
      diseases: {
        Row: {
          created_at: string
          id: string
          name: string
          prevention: string | null
          slug: string
          species: string[]
          symptoms: string[]
          treatment_notes: string | null
          urgency: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          prevention?: string | null
          slug: string
          species?: string[]
          symptoms?: string[]
          treatment_notes?: string | null
          urgency?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          prevention?: string | null
          slug?: string
          species?: string[]
          symptoms?: string[]
          treatment_notes?: string | null
          urgency?: string
        }
        Relationships: []
      }
      farms: {
        Row: {
          budget_kes: number | null
          county: string | null
          created_at: string
          housing: string | null
          id: string
          name: string
          poultry_type_id: string | null
          space_m2: number | null
          sub_county: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_kes?: number | null
          county?: string | null
          created_at?: string
          housing?: string | null
          id?: string
          name: string
          poultry_type_id?: string | null
          space_m2?: number | null
          sub_county?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_kes?: number | null
          county?: string | null
          created_at?: string
          housing?: string | null
          id?: string
          name?: string
          poultry_type_id?: string | null
          space_m2?: number | null
          sub_county?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farms_poultry_type_id_fkey"
            columns: ["poultry_type_id"]
            isOneToOne: false
            referencedRelation: "poultry_types"
            referencedColumns: ["id"]
          },
        ]
      }
      feasibility_reports: {
        Row: {
          created_at: string
          farm_id: string | null
          id: string
          inputs: Json
          results: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          farm_id?: string | null
          id?: string
          inputs: Json
          results: Json
          user_id: string
        }
        Update: {
          created_at?: string
          farm_id?: string | null
          id?: string
          inputs?: Json
          results?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feasibility_reports_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_ingredients: {
        Row: {
          category: string
          created_at: string
          energy_kcal: number
          id: string
          name: string
          notes: string | null
          protein_pct: number
          slug: string
        }
        Insert: {
          category: string
          created_at?: string
          energy_kcal: number
          id?: string
          name: string
          notes?: string | null
          protein_pct: number
          slug: string
        }
        Update: {
          category?: string
          created_at?: string
          energy_kcal?: number
          id?: string
          name?: string
          notes?: string | null
          protein_pct?: number
          slug?: string
        }
        Relationships: []
      }
      feed_prices: {
        Row: {
          brand: string
          county: string | null
          created_at: string
          feed_type: string
          id: string
          price_kes_per_kg: number
          source: string | null
          updated_at: string
        }
        Insert: {
          brand: string
          county?: string | null
          created_at?: string
          feed_type: string
          id?: string
          price_kes_per_kg: number
          source?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string
          county?: string | null
          created_at?: string
          feed_type?: string
          id?: string
          price_kes_per_kg?: number
          source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      feed_products: {
        Row: {
          agrovet_name: string | null
          brand: string | null
          category: string
          county: string | null
          created_at: string
          goal: string
          id: string
          notes: string | null
          poultry_type: string
          price_kes: number
          product_name: string
          source: string | null
          stage: string
          unit_size: string
          updated_at: string
        }
        Insert: {
          agrovet_name?: string | null
          brand?: string | null
          category?: string
          county?: string | null
          created_at?: string
          goal: string
          id?: string
          notes?: string | null
          poultry_type: string
          price_kes: number
          product_name: string
          source?: string | null
          stage: string
          unit_size?: string
          updated_at?: string
        }
        Update: {
          agrovet_name?: string | null
          brand?: string | null
          category?: string
          county?: string | null
          created_at?: string
          goal?: string
          id?: string
          notes?: string | null
          poultry_type?: string
          price_kes?: number
          product_name?: string
          source?: string | null
          stage?: string
          unit_size?: string
          updated_at?: string
        }
        Relationships: []
      }
      poultry_types: {
        Row: {
          created_at: string
          feed_g_per_day: number
          id: string
          maturity_weeks: number
          name: string
          notes: string | null
          purpose: string
          slug: string
          space_per_bird_m2: number
          water_ml_per_day: number
        }
        Insert: {
          created_at?: string
          feed_g_per_day: number
          id?: string
          maturity_weeks: number
          name: string
          notes?: string | null
          purpose: string
          slug: string
          space_per_bird_m2: number
          water_ml_per_day: number
        }
        Update: {
          created_at?: string
          feed_g_per_day?: number
          id?: string
          maturity_weeks?: number
          name?: string
          notes?: string | null
          purpose?: string
          slug?: string
          space_per_bird_m2?: number
          water_ml_per_day?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          county: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          sub_county: string | null
          updated_at: string
        }
        Insert: {
          county?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          sub_county?: string | null
          updated_at?: string
        }
        Update: {
          county?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          sub_county?: string | null
          updated_at?: string
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
      vets: {
        Row: {
          county: string | null
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["vet_kind"]
          lat: number | null
          lng: number | null
          name: string
          phone: string | null
          services: string[]
          sub_county: string | null
        }
        Insert: {
          county?: string | null
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["vet_kind"]
          lat?: number | null
          lng?: number | null
          name: string
          phone?: string | null
          services?: string[]
          sub_county?: string | null
        }
        Update: {
          county?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["vet_kind"]
          lat?: number | null
          lng?: number | null
          name?: string
          phone?: string | null
          services?: string[]
          sub_county?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
      app_role: "user" | "admin"
      vet_kind: "vet" | "agrovet"
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
      app_role: ["user", "admin"],
      vet_kind: ["vet", "agrovet"],
    },
  },
} as const
