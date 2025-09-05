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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_assessments: {
        Row: {
          ai_assessment: string
          charting_id: string
          confidence_score: number | null
          created_at: string
          doctor_id: string
          id: string
          recommended_herbs: string | null
          recommended_treatments: string | null
          suggested_icd10_codes: string | null
        }
        Insert: {
          ai_assessment: string
          charting_id: string
          confidence_score?: number | null
          created_at?: string
          doctor_id: string
          id?: string
          recommended_herbs?: string | null
          recommended_treatments?: string | null
          suggested_icd10_codes?: string | null
        }
        Update: {
          ai_assessment?: string
          charting_id?: string
          confidence_score?: number | null
          created_at?: string
          doctor_id?: string
          id?: string
          recommended_herbs?: string | null
          recommended_treatments?: string | null
          suggested_icd10_codes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_assessments_charting_id_fkey"
            columns: ["charting_id"]
            isOneToOne: false
            referencedRelation: "charting"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_assessments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          chief_complaint: string | null
          created_at: string
          doctor_id: string
          duration_minutes: number
          id: string
          notes: string | null
          patient_id: string
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          chief_complaint?: string | null
          created_at?: string
          doctor_id: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          patient_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          chief_complaint?: string | null
          created_at?: string
          doctor_id?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          patient_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      charting: {
        Row: {
          acupuncture_points: string | null
          appointment_id: string
          assessment: string | null
          created_at: string
          doctor_id: string
          id: string
          objective: string | null
          patient_id: string
          plan: string | null
          subjective: string | null
          treatment_performed: string | null
          updated_at: string
          vitals: Json | null
        }
        Insert: {
          acupuncture_points?: string | null
          appointment_id: string
          assessment?: string | null
          created_at?: string
          doctor_id: string
          id?: string
          objective?: string | null
          patient_id: string
          plan?: string | null
          subjective?: string | null
          treatment_performed?: string | null
          updated_at?: string
          vitals?: Json | null
        }
        Update: {
          acupuncture_points?: string | null
          appointment_id?: string
          assessment?: string | null
          created_at?: string
          doctor_id?: string
          id?: string
          objective?: string | null
          patient_id?: string
          plan?: string | null
          subjective?: string | null
          treatment_performed?: string | null
          updated_at?: string
          vitals?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "charting_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charting_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charting_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_claims: {
        Row: {
          appointment_id: string
          claim_amount: number
          claim_number: string | null
          cpt_codes: string[]
          created_at: string
          diagnosis: string
          doctor_id: string
          icd10_codes: string[]
          id: string
          patient_id: string
          status: string
          submitted_at: string | null
          treatment_description: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          claim_amount: number
          claim_number?: string | null
          cpt_codes: string[]
          created_at?: string
          diagnosis: string
          doctor_id: string
          icd10_codes: string[]
          id?: string
          patient_id: string
          status?: string
          submitted_at?: string | null
          treatment_description: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          claim_amount?: number
          claim_number?: string | null
          cpt_codes?: string[]
          created_at?: string
          diagnosis?: string
          doctor_id?: string
          icd10_codes?: string[]
          id?: string
          patient_id?: string
          status?: string
          submitted_at?: string | null
          treatment_description?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claims_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_profiles: {
        Row: {
          bio: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          location: string | null
          phone: string | null
          profile_image_url: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          location?: string | null
          phone?: string | null
          profile_image_url?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          location?: string | null
          phone?: string | null
          profile_image_url?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_type: string
          order_id: string
          photo_id: string
          price: number
          print_option_id: string | null
          quantity: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_type: string
          order_id: string
          photo_id: string
          price: number
          print_option_id?: string | null
          quantity?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          item_type?: string
          order_id?: string
          photo_id?: string
          price?: number
          print_option_id?: string | null
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_order_items_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_photo"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_print_option"
            columns: ["print_option_id"]
            isOneToOne: false
            referencedRelation: "print_options"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          status: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_intent_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_intent_id?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_intent_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_orders_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "marketplace_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          allergies: string | null
          created_at: string
          current_medications: string | null
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          gender: string | null
          id: string
          insurance_group_number: string | null
          insurance_policy_number: string | null
          insurance_provider: string | null
          medical_history: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          created_at?: string
          current_medications?: string | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          gender?: string | null
          id?: string
          insurance_group_number?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          medical_history?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          allergies?: string | null
          created_at?: string
          current_medications?: string | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          gender?: string | null
          id?: string
          insurance_group_number?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          medical_history?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      photographer_payouts: {
        Row: {
          amount: number
          created_at: string
          id: string
          photographer_id: string
          processed_at: string | null
          status: string | null
          stripe_transfer_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          photographer_id: string
          processed_at?: string | null
          status?: string | null
          stripe_transfer_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          photographer_id?: string
          processed_at?: string | null
          status?: string | null
          stripe_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_payouts_photographer"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "marketplace_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      photos: {
        Row: {
          created_at: string
          date_taken: string
          description: string | null
          digital_price: number
          id: string
          image_url: string
          is_active: boolean | null
          is_featured: boolean | null
          latitude: number | null
          location: string
          longitude: number | null
          metadata: Json | null
          photographer_id: string
          tags: Json | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_taken: string
          description?: string | null
          digital_price: number
          id?: string
          image_url: string
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          location: string
          longitude?: number | null
          metadata?: Json | null
          photographer_id: string
          tags?: Json | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_taken?: string
          description?: string | null
          digital_price?: number
          id?: string
          image_url?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          metadata?: Json | null
          photographer_id?: string
          tags?: Json | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_photos_photographer"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "marketplace_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      print_options: {
        Row: {
          created_at: string
          description: string | null
          height_inches: number
          id: string
          is_active: boolean | null
          name: string
          price: number
          type: Database["public"]["Enums"]["print_type"]
          width_inches: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          height_inches: number
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          type: Database["public"]["Enums"]["print_type"]
          width_inches: number
        }
        Update: {
          created_at?: string
          description?: string | null
          height_inches?: number
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          type?: Database["public"]["Enums"]["print_type"]
          width_inches?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
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
          check_role: Database["public"]["Enums"]["user_role"]
          user_uuid: string
        }
        Returns: boolean
      }
    }
    Enums: {
      order_status: "pending" | "completed" | "cancelled" | "refunded"
      print_type: "matte_paper" | "canvas" | "metal" | "acrylic"
      user_role: "patient" | "doctor" | "admin"
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
      order_status: ["pending", "completed", "cancelled", "refunded"],
      print_type: ["matte_paper", "canvas", "metal", "acrylic"],
      user_role: ["patient", "doctor", "admin"],
    },
  },
} as const
