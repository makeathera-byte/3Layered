// TypeScript types for Supabase database
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          mobile: string | null
          photo_url: string | null
          google_id: string | null
          role: string
          password_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          mobile?: string | null
          photo_url?: string | null
          google_id?: string | null
          role?: string
          password_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          mobile?: string | null
          photo_url?: string | null
          google_id?: string | null
          role?: string
          password_hash?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          title: string
          description: string | null
          price: number
          images: string[]
          category: string
          material: string | null
          inventory: number
          is_customizable: boolean
          is_trending: boolean
          is_featured: boolean
          discount_percentage: number
          tags: string[]
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          price: number
          images?: string[]
          category: string
          material?: string | null
          inventory?: number
          is_customizable?: boolean
          is_trending?: boolean
          is_featured?: boolean
          discount_percentage?: number
          tags?: string[]
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          price?: number
          images?: string[]
          category?: string
          material?: string | null
          inventory?: number
          is_customizable?: boolean
          is_trending?: boolean
          is_featured?: boolean
          discount_percentage?: number
          tags?: string[]
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      cart: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          customization_note: string | null
          customization_image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
          customization_note?: string | null
          customization_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          customization_note?: string | null
          customization_image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          order_number: string
          status: string
          total_amount: number
          shipping_address: Json
          billing_address: Json
          payment_method: string | null
          payment_status: string
          tracking_number: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          order_number?: string
          status?: string
          total_amount: number
          shipping_address: Json
          billing_address: Json
          payment_method?: string | null
          payment_status?: string
          tracking_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          order_number?: string
          status?: string
          total_amount?: number
          shipping_address?: Json
          billing_address?: Json
          payment_method?: string | null
          payment_status?: string
          tracking_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_snapshot: Json
          quantity: number
          unit_price: number
          total_price: number
          customization_note: string | null
          customization_image: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_snapshot: Json
          quantity: number
          unit_price: number
          total_price: number
          customization_note?: string | null
          customization_image?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_snapshot?: Json
          quantity?: number
          unit_price?: number
          total_price?: number
          customization_note?: string | null
          customization_image?: string | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string | null
          order_id: string | null
          rating: number
          comment: string | null
          images: string[]
          is_verified_purchase: boolean
          is_approved: boolean
          admin_response: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id?: string | null
          order_id?: string | null
          rating: number
          comment?: string | null
          images?: string[]
          is_verified_purchase?: boolean
          is_approved?: boolean
          admin_response?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string | null
          order_id?: string | null
          rating?: number
          comment?: string | null
          images?: string[]
          is_verified_purchase?: boolean
          is_approved?: boolean
          admin_response?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_sessions: {
        Row: {
          id: string
          user_id: string
          token: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          expires_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      clean_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

