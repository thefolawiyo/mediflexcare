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
      appointments: {
        Row: {
          appt_date: string
          appt_time: string
          created_at: string
          department: string | null
          doctor_id: string | null
          doctor_name: string | null
          id: string
          notes: string | null
          patient_id: string
          status: Database["public"]["Enums"]["appointment_status"]
          type: Database["public"]["Enums"]["appointment_type"]
        }
        Insert: {
          appt_date: string
          appt_time: string
          created_at?: string
          department?: string | null
          doctor_id?: string | null
          doctor_name?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          status?: Database["public"]["Enums"]["appointment_status"]
          type?: Database["public"]["Enums"]["appointment_type"]
        }
        Update: {
          appt_date?: string
          appt_time?: string
          created_at?: string
          department?: string | null
          doctor_id?: string | null
          doctor_name?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          type?: Database["public"]["Enums"]["appointment_type"]
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          head_id: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          head_id?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          head_id?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      lab_tests: {
        Row: {
          completed_at: string | null
          id: string
          ordered_at: string
          ordered_by: string | null
          ordered_by_name: string | null
          patient_id: string
          priority: Database["public"]["Enums"]["lab_priority"]
          results: string | null
          status: Database["public"]["Enums"]["lab_status"]
          test_type: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          ordered_at?: string
          ordered_by?: string | null
          ordered_by_name?: string | null
          patient_id: string
          priority?: Database["public"]["Enums"]["lab_priority"]
          results?: string | null
          status?: Database["public"]["Enums"]["lab_status"]
          test_type: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          ordered_at?: string
          ordered_by?: string | null
          ordered_by_name?: string | null
          patient_id?: string
          priority?: Database["public"]["Enums"]["lab_priority"]
          results?: string | null
          status?: Database["public"]["Enums"]["lab_status"]
          test_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_tests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          blood_type: string | null
          date_of_birth: string | null
          email: string | null
          emergency_contact: string | null
          gender: string | null
          id: string
          insurance_id: string | null
          insurance_provider: string | null
          name: string
          phone: string | null
          registered_at: string
          status: Database["public"]["Enums"]["patient_status"]
          user_id: string | null
        }
        Insert: {
          address?: string | null
          blood_type?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          gender?: string | null
          id?: string
          insurance_id?: string | null
          insurance_provider?: string | null
          name: string
          phone?: string | null
          registered_at?: string
          status?: Database["public"]["Enums"]["patient_status"]
          user_id?: string | null
        }
        Update: {
          address?: string | null
          blood_type?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          gender?: string | null
          id?: string
          insurance_id?: string | null
          insurance_provider?: string | null
          name?: string
          phone?: string | null
          registered_at?: string
          status?: Database["public"]["Enums"]["patient_status"]
          user_id?: string | null
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          dispensed_at: string | null
          dosage: string | null
          duration: string | null
          frequency: string | null
          id: string
          medication: string
          notes: string | null
          patient_id: string
          prescribed_at: string
          prescribed_by: string | null
          prescribed_by_name: string | null
          status: Database["public"]["Enums"]["rx_status"]
        }
        Insert: {
          dispensed_at?: string | null
          dosage?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          medication: string
          notes?: string | null
          patient_id: string
          prescribed_at?: string
          prescribed_by?: string | null
          prescribed_by_name?: string | null
          status?: Database["public"]["Enums"]["rx_status"]
        }
        Update: {
          dispensed_at?: string | null
          dosage?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          medication?: string
          notes?: string | null
          patient_id?: string
          prescribed_at?: string
          prescribed_by?: string | null
          prescribed_by_name?: string | null
          status?: Database["public"]["Enums"]["rx_status"]
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string | null
          full_name: string
          id: string
          joined_at: string
          phone: string | null
          specialization: string | null
          status: Database["public"]["Enums"]["staff_status"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string
          id: string
          joined_at?: string
          phone?: string | null
          specialization?: string | null
          status?: Database["public"]["Enums"]["staff_status"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string
          id?: string
          joined_at?: string
          phone?: string | null
          specialization?: string | null
          status?: Database["public"]["Enums"]["staff_status"]
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
      vitals: {
        Row: {
          bp_diastolic: number | null
          bp_systolic: number | null
          heart_rate: number | null
          height: number | null
          id: string
          notes: string | null
          oxygen_saturation: number | null
          patient_id: string
          recorded_at: string
          recorded_by: string | null
          respiratory_rate: number | null
          temperature: number | null
          weight: number | null
        }
        Insert: {
          bp_diastolic?: number | null
          bp_systolic?: number | null
          heart_rate?: number | null
          height?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          patient_id: string
          recorded_at?: string
          recorded_by?: string | null
          respiratory_rate?: number | null
          temperature?: number | null
          weight?: number | null
        }
        Update: {
          bp_diastolic?: number | null
          bp_systolic?: number | null
          heart_rate?: number | null
          height?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          patient_id?: string
          recorded_at?: string
          recorded_by?: string | null
          respiratory_rate?: number | null
          temperature?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vitals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
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
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "patient"
        | "doctor"
        | "nurse"
        | "receptionist"
        | "admin"
        | "lab"
        | "pharmacy"
      appointment_status:
        | "scheduled"
        | "checked-in"
        | "in-progress"
        | "completed"
        | "cancelled"
        | "no-show"
      appointment_type: "consultation" | "follow-up" | "emergency" | "procedure"
      lab_priority: "routine" | "urgent" | "stat"
      lab_status: "pending" | "in-progress" | "completed" | "cancelled"
      patient_status: "active" | "inactive" | "discharged"
      rx_status: "pending" | "dispensed" | "cancelled"
      staff_status: "active" | "inactive" | "on-leave"
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
      app_role: [
        "patient",
        "doctor",
        "nurse",
        "receptionist",
        "admin",
        "lab",
        "pharmacy",
      ],
      appointment_status: [
        "scheduled",
        "checked-in",
        "in-progress",
        "completed",
        "cancelled",
        "no-show",
      ],
      appointment_type: ["consultation", "follow-up", "emergency", "procedure"],
      lab_priority: ["routine", "urgent", "stat"],
      lab_status: ["pending", "in-progress", "completed", "cancelled"],
      patient_status: ["active", "inactive", "discharged"],
      rx_status: ["pending", "dispensed", "cancelled"],
      staff_status: ["active", "inactive", "on-leave"],
    },
  },
} as const
