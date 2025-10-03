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
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          billing_generated: boolean | null
          billing_id: string | null
          created_at: string | null
          customer_id: string
          duration_minutes: number
          id: string
          notes: string | null
          salon_id: string | null
          service_id: string
          staff_id: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          billing_generated?: boolean | null
          billing_id?: string | null
          created_at?: string | null
          customer_id: string
          duration_minutes: number
          id?: string
          notes?: string | null
          salon_id?: string | null
          service_id: string
          staff_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          billing_generated?: boolean | null
          billing_id?: string | null
          created_at?: string | null
          customer_id?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          salon_id?: string | null
          service_id?: string
          staff_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salon_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string
          salon_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone: string
          salon_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string
          salon_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salon_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          brand: string | null
          category: string | null
          cost_price: number
          created_at: string | null
          description: string | null
          id: string
          min_stock_level: number | null
          name: string
          salon_id: string | null
          selling_price: number
          stock_quantity: number
          supplier: string | null
          supplier_mobile: string | null
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          category?: string | null
          cost_price: number
          created_at?: string | null
          description?: string | null
          id?: string
          min_stock_level?: number | null
          name: string
          salon_id?: string | null
          selling_price: number
          stock_quantity?: number
          supplier?: string | null
          supplier_mobile?: string | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          category?: string | null
          cost_price?: number
          created_at?: string | null
          description?: string | null
          id?: string
          min_stock_level?: number | null
          name?: string
          salon_id?: string | null
          selling_price?: number
          stock_quantity?: number
          supplier?: string | null
          supplier_mobile?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salon_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          sale_id: string
          service_id: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          sale_id: string
          service_id?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          sale_id?: string
          service_id?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          customer_id: string
          discount_amount: number | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          sale_date: string | null
          salon_id: string | null
          staff_id: string | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          customer_id: string
          discount_amount?: number | null
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          sale_date?: string | null
          salon_id?: string | null
          staff_id?: string | null
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          customer_id?: string
          discount_amount?: number | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          sale_date?: string | null
          salon_id?: string | null
          staff_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salon_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      salon_profiles: {
        Row: {
          address: string
          business_license: string | null
          city: string
          country: string
          created_at: string
          description: string | null
          email: string
          id: string
          operating_hours: Json | null
          owner_name: string
          phone: string
          salon_name: string
          services_offered: string[] | null
          social_media: Json | null
          state: string
          updated_at: string
          user_id: string
          website: string | null
          zip_code: string
        }
        Insert: {
          address: string
          business_license?: string | null
          city: string
          country?: string
          created_at?: string
          description?: string | null
          email: string
          id?: string
          operating_hours?: Json | null
          owner_name: string
          phone: string
          salon_name: string
          services_offered?: string[] | null
          social_media?: Json | null
          state: string
          updated_at?: string
          user_id: string
          website?: string | null
          zip_code: string
        }
        Update: {
          address?: string
          business_license?: string | null
          city?: string
          country?: string
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          operating_hours?: Json | null
          owner_name?: string
          phone?: string
          salon_name?: string
          services_offered?: string[] | null
          social_media?: Json | null
          state?: string
          updated_at?: string
          user_id?: string
          website?: string | null
          zip_code?: string
        }
        Relationships: []
      }
      salon_settings: {
        Row: {
          business_settings: Json | null
          created_at: string | null
          id: string
          notification_settings: Json | null
          operational_settings: Json | null
          salon_id: string
          security_settings: Json | null
          updated_at: string | null
        }
        Insert: {
          business_settings?: Json | null
          created_at?: string | null
          id?: string
          notification_settings?: Json | null
          operational_settings?: Json | null
          salon_id: string
          security_settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          business_settings?: Json | null
          created_at?: string | null
          id?: string
          notification_settings?: Json | null
          operational_settings?: Json | null
          salon_id?: string
          security_settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salon_settings_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: true
            referencedRelation: "salon_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          name: string
          price: number
          salon_id: string | null
          status: Database["public"]["Enums"]["service_status"] | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes: number
          id?: string
          name: string
          price: number
          salon_id?: string | null
          status?: Database["public"]["Enums"]["service_status"] | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          name?: string
          price?: number
          salon_id?: string | null
          status?: Database["public"]["Enums"]["service_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salon_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          commission_rate: number | null
          created_at: string | null
          email: string
          first_name: string
          hire_date: string
          id: string
          last_name: string
          phone: string
          role: string
          salary: number | null
          salon_id: string | null
          specialization: string[] | null
          status: Database["public"]["Enums"]["staff_status"] | null
          updated_at: string | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string | null
          email: string
          first_name: string
          hire_date: string
          id?: string
          last_name: string
          phone: string
          role: string
          salary?: number | null
          salon_id?: string | null
          specialization?: string[] | null
          status?: Database["public"]["Enums"]["staff_status"] | null
          updated_at?: string | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string | null
          email?: string
          first_name?: string
          hire_date?: string
          id?: string
          last_name?: string
          phone?: string
          role?: string
          salary?: number | null
          salon_id?: string | null
          specialization?: string[] | null
          status?: Database["public"]["Enums"]["staff_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salon_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string | null
          id: string
          movement_type: string
          notes: string | null
          product_id: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          movement_type: string
          notes?: string | null
          product_id: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          movement_type?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          salon_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          salon_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          salon_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salon_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_salon_id: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _salon_id: string
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "staff" | "user"
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
        | "waiting"
      payment_method: "cash" | "card" | "upi" | "wallet"
      payment_status: "pending" | "paid" | "refunded" | "failed"
      service_status: "active" | "inactive"
      staff_status: "active" | "inactive" | "on_leave"
      user_role: "admin" | "manager" | "staff" | "user"
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
      app_role: ["admin", "manager", "staff", "user"],
      appointment_status: [
        "scheduled",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
        "waiting",
      ],
      payment_method: ["cash", "card", "upi", "wallet"],
      payment_status: ["pending", "paid", "refunded", "failed"],
      service_status: ["active", "inactive"],
      staff_status: ["active", "inactive", "on_leave"],
      user_role: ["admin", "manager", "staff", "user"],
    },
  },
} as const
