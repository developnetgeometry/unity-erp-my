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
      attendance_config: {
        Row: {
          auto_clockout_enabled: boolean | null
          company_id: string
          correction_window_hours: number | null
          created_at: string
          default_clock_in_time: string | null
          default_clock_out_time: string | null
          geofence_radius_meters: number | null
          grace_period_minutes: number | null
          id: string
          notification_settings: Json | null
          ot_auto_close_hours: number | null
          updated_at: string
          work_days: Json | null
        }
        Insert: {
          auto_clockout_enabled?: boolean | null
          company_id: string
          correction_window_hours?: number | null
          created_at?: string
          default_clock_in_time?: string | null
          default_clock_out_time?: string | null
          geofence_radius_meters?: number | null
          grace_period_minutes?: number | null
          id?: string
          notification_settings?: Json | null
          ot_auto_close_hours?: number | null
          updated_at?: string
          work_days?: Json | null
        }
        Update: {
          auto_clockout_enabled?: boolean | null
          company_id?: string
          correction_window_hours?: number | null
          created_at?: string
          default_clock_in_time?: string | null
          default_clock_out_time?: string | null
          geofence_radius_meters?: number | null
          grace_period_minutes?: number | null
          id?: string
          notification_settings?: Json | null
          ot_auto_close_hours?: number | null
          updated_at?: string
          work_days?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_corrections: {
        Row: {
          attachment_url: string | null
          attendance_record_id: string | null
          correction_type: Database["public"]["Enums"]["correction_type"]
          created_at: string
          employee_id: string
          id: string
          is_within_deadline: boolean | null
          reason: string
          requested_clock_in: string | null
          requested_clock_out: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: Database["public"]["Enums"]["correction_status"]
          submission_deadline: string | null
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          attendance_record_id?: string | null
          correction_type: Database["public"]["Enums"]["correction_type"]
          created_at?: string
          employee_id: string
          id?: string
          is_within_deadline?: boolean | null
          reason: string
          requested_clock_in?: string | null
          requested_clock_out?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["correction_status"]
          submission_deadline?: string | null
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          attendance_record_id?: string | null
          correction_type?: Database["public"]["Enums"]["correction_type"]
          created_at?: string
          employee_id?: string
          id?: string
          is_within_deadline?: boolean | null
          reason?: string
          requested_clock_in?: string | null
          requested_clock_out?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["correction_status"]
          submission_deadline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_corrections_attendance_record_id_fkey"
            columns: ["attendance_record_id"]
            isOneToOne: false
            referencedRelation: "attendance_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_corrections_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          adjusted_by: string | null
          attendance_date: string
          clock_in_latitude: number | null
          clock_in_longitude: number | null
          clock_in_time: string | null
          clock_out_latitude: number | null
          clock_out_longitude: number | null
          clock_out_time: string | null
          correction_id: string | null
          created_at: string
          employee_id: string
          hours_worked: number | null
          id: string
          is_manually_adjusted: boolean
          is_provisional: boolean | null
          leave_id: string | null
          locked_for_payroll: boolean | null
          notes: string | null
          overtime_hours: number | null
          shift_id: string | null
          site_id: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          updated_at: string
        }
        Insert: {
          adjusted_by?: string | null
          attendance_date: string
          clock_in_latitude?: number | null
          clock_in_longitude?: number | null
          clock_in_time?: string | null
          clock_out_latitude?: number | null
          clock_out_longitude?: number | null
          clock_out_time?: string | null
          correction_id?: string | null
          created_at?: string
          employee_id: string
          hours_worked?: number | null
          id?: string
          is_manually_adjusted?: boolean
          is_provisional?: boolean | null
          leave_id?: string | null
          locked_for_payroll?: boolean | null
          notes?: string | null
          overtime_hours?: number | null
          shift_id?: string | null
          site_id?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
        }
        Update: {
          adjusted_by?: string | null
          attendance_date?: string
          clock_in_latitude?: number | null
          clock_in_longitude?: number | null
          clock_in_time?: string | null
          clock_out_latitude?: number | null
          clock_out_longitude?: number | null
          clock_out_time?: string | null
          correction_id?: string | null
          created_at?: string
          employee_id?: string
          hours_worked?: number | null
          id?: string
          is_manually_adjusted?: boolean
          is_provisional?: boolean | null
          leave_id?: string | null
          locked_for_payroll?: boolean | null
          notes?: string | null
          overtime_hours?: number | null
          shift_id?: string | null
          site_id?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_correction_id_fkey"
            columns: ["correction_id"]
            isOneToOne: false
            referencedRelation: "attendance_corrections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_leave_id_fkey"
            columns: ["leave_id"]
            isOneToOne: false
            referencedRelation: "employee_leaves"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "work_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          branch_name: string
          company_id: string
          created_at: string
          id: string
          is_head_office: boolean
          phone: string | null
        }
        Insert: {
          address?: string | null
          branch_name: string
          company_id: string
          created_at?: string
          id?: string
          is_head_office?: boolean
          phone?: string | null
        }
        Update: {
          address?: string | null
          branch_name?: string
          company_id?: string
          created_at?: string
          id?: string
          is_head_office?: boolean
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string
          business_type: string
          company_name: string
          created_at: string
          email: string
          id: string
          phone: string
          registration_no: string
          status: string
        }
        Insert: {
          address: string
          business_type: string
          company_name: string
          created_at?: string
          email: string
          id?: string
          phone: string
          registration_no: string
          status?: string
        }
        Update: {
          address?: string
          business_type?: string
          company_name?: string
          created_at?: string
          email?: string
          id?: string
          phone?: string
          registration_no?: string
          status?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          employee_count: number
          id: string
          manager_id: string | null
          name: string
          positions: string[] | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          employee_count?: number
          id?: string
          manager_id?: string | null
          name: string
          positions?: string[] | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          employee_count?: number
          id?: string
          manager_id?: string | null
          name?: string
          positions?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_leaves: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          attachment_url: string | null
          company_id: string
          created_at: string
          employee_id: string
          end_date: string
          id: string
          leave_type: Database["public"]["Enums"]["leave_type"]
          reason: string
          rejection_reason: string | null
          start_date: string
          status: Database["public"]["Enums"]["leave_status"]
          total_days: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          attachment_url?: string | null
          company_id: string
          created_at?: string
          employee_id: string
          end_date: string
          id?: string
          leave_type: Database["public"]["Enums"]["leave_type"]
          reason: string
          rejection_reason?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["leave_status"]
          total_days: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          attachment_url?: string | null
          company_id?: string
          created_at?: string
          employee_id?: string
          end_date?: string
          id?: string
          leave_type?: Database["public"]["Enums"]["leave_type"]
          reason?: string
          rejection_reason?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["leave_status"]
          total_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_leaves_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_leaves_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_leaves_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_shifts: {
        Row: {
          created_at: string
          effective_from: string
          effective_until: string | null
          employee_id: string
          id: string
          shift_id: string
          updated_at: string
          work_days: Json
        }
        Insert: {
          created_at?: string
          effective_from: string
          effective_until?: string | null
          employee_id: string
          id?: string
          shift_id: string
          updated_at?: string
          work_days?: Json
        }
        Update: {
          created_at?: string
          effective_from?: string
          effective_until?: string | null
          employee_id?: string
          id?: string
          shift_id?: string
          updated_at?: string
          work_days?: Json
        }
        Relationships: [
          {
            foreignKeyName: "employee_shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_shifts_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_sites: {
        Row: {
          created_at: string | null
          employee_id: string
          id: string
          is_primary: boolean | null
          site_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          id?: string
          is_primary?: boolean | null
          site_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          id?: string
          is_primary?: boolean | null
          site_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_sites_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_sites_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "work_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          branch_id: string | null
          company_id: string
          created_at: string
          department_id: string | null
          email: string | null
          employee_number: string
          full_name: string
          ic_number: string | null
          id: string
          join_date: string
          phone: string | null
          position: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          branch_id?: string | null
          company_id: string
          created_at?: string
          department_id?: string | null
          email?: string | null
          employee_number: string
          full_name: string
          ic_number?: string | null
          id?: string
          join_date: string
          phone?: string | null
          position: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          branch_id?: string | null
          company_id?: string
          created_at?: string
          department_id?: string | null
          email?: string | null
          employee_number?: string
          full_name?: string
          ic_number?: string | null
          id?: string
          join_date?: string
          phone?: string | null
          position?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_log: {
        Row: {
          created_at: string
          data: Json | null
          employee_id: string
          id: string
          message: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          read_at: string | null
          sent_at: string
          title: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          employee_id: string
          id?: string
          message: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          read_at?: string | null
          sent_at?: string
          title: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          employee_id?: string
          id?: string
          message?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          read_at?: string | null
          sent_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      overtime_sessions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          attendance_record_id: string
          auto_closed_at: string | null
          created_at: string
          employee_id: string
          id: string
          is_approved: boolean | null
          ot_in_latitude: number
          ot_in_longitude: number
          ot_in_time: string
          ot_out_latitude: number | null
          ot_out_longitude: number | null
          ot_out_time: string | null
          site_id: string
          status: string
          total_ot_hours: number | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          attendance_record_id: string
          auto_closed_at?: string | null
          created_at?: string
          employee_id: string
          id?: string
          is_approved?: boolean | null
          ot_in_latitude: number
          ot_in_longitude: number
          ot_in_time: string
          ot_out_latitude?: number | null
          ot_out_longitude?: number | null
          ot_out_time?: string | null
          site_id: string
          status?: string
          total_ot_hours?: number | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          attendance_record_id?: string
          auto_closed_at?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          is_approved?: boolean | null
          ot_in_latitude?: number
          ot_in_longitude?: number
          ot_in_time?: string
          ot_out_latitude?: number | null
          ot_out_longitude?: number | null
          ot_out_time?: string | null
          site_id?: string
          status?: string
          total_ot_hours?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "overtime_sessions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overtime_sessions_attendance_record_id_fkey"
            columns: ["attendance_record_id"]
            isOneToOne: false
            referencedRelation: "attendance_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overtime_sessions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overtime_sessions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "work_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          email: string
          email_verified: boolean | null
          full_name: string
          id: string
          status: string | null
          updated_at: string
          verification_token: string | null
          verification_token_expires_at: string | null
          verified_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email: string
          email_verified?: boolean | null
          full_name: string
          id: string
          status?: string | null
          updated_at?: string
          verification_token?: string | null
          verification_token_expires_at?: string | null
          verified_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string
          email_verified?: boolean | null
          full_name?: string
          id?: string
          status?: string | null
          updated_at?: string
          verification_token?: string | null
          verification_token_expires_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      public_holidays: {
        Row: {
          company_id: string
          created_at: string
          holiday_date: string
          holiday_name: string
          id: string
          is_recurring: boolean
        }
        Insert: {
          company_id: string
          created_at?: string
          holiday_date: string
          holiday_name: string
          id?: string
          is_recurring?: boolean
        }
        Update: {
          company_id?: string
          created_at?: string
          holiday_date?: string
          holiday_name?: string
          id?: string
          is_recurring?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "public_holidays_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          company_id: string
          created_at: string
          end_time: string
          grace_period_minutes: number
          id: string
          is_active: boolean
          lunch_break_minutes: number
          shift_name: string
          start_time: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          end_time: string
          grace_period_minutes?: number
          id?: string
          is_active?: boolean
          lunch_break_minutes?: number
          shift_name: string
          start_time: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          end_time?: string
          grace_period_minutes?: number
          id?: string
          is_active?: boolean
          lunch_break_minutes?: number
          shift_name?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
      work_sites: {
        Row: {
          address: string | null
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          latitude: number
          longitude: number
          radius_meters: number
          site_name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          latitude: number
          longitude: number
          radius_meters?: number
          site_name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          latitude?: number
          longitude?: number
          radius_meters?: number
          site_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_sites_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      calculate_hours_worked: {
        Args: {
          p_clock_in: string
          p_clock_out: string
          p_lunch_break_minutes?: number
        }
        Returns: number
      }
      calculate_overtime_hours: {
        Args: { p_clock_out_time: string; p_shift_end_time: string }
        Returns: number
      }
      can_clock_at_site: {
        Args: { p_employee_id: string; p_site_id: string }
        Returns: boolean
      }
      determine_attendance_status: {
        Args: {
          p_clock_in_time: string
          p_grace_period_minutes: number
          p_shift_start_time: string
        }
        Returns: Database["public"]["Enums"]["attendance_status"]
      }
      get_attendance_config: {
        Args: { p_company_id: string }
        Returns: {
          auto_clockout_enabled: boolean
          correction_window_hours: number
          geofence_radius_meters: number
          grace_period_minutes: number
          notification_settings: Json
          ot_auto_close_hours: number
          work_days: Json
        }[]
      }
      get_user_company_id: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_employee_on_leave: {
        Args: { p_date: string; p_employee_id: string }
        Returns: boolean
      }
      validate_geofence: {
        Args: { p_latitude: number; p_longitude: number; p_site_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "company_admin"
        | "hr_manager"
        | "finance_manager"
        | "employee"
      attendance_status:
        | "on_time"
        | "late"
        | "half_day"
        | "absent"
        | "leave"
        | "holiday"
      correction_status: "pending" | "approved" | "rejected"
      correction_type: "clock_in" | "clock_out" | "both" | "full_record"
      leave_status: "pending" | "approved" | "rejected" | "cancelled"
      leave_type:
        | "annual"
        | "sick"
        | "emergency"
        | "unpaid"
        | "maternity"
        | "paternity"
      notification_type:
        | "late_arrival"
        | "missed_clockout"
        | "ot_reminder"
        | "correction_approved"
        | "correction_rejected"
        | "auto_clockout"
        | "ot_auto_closed"
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
        "super_admin",
        "company_admin",
        "hr_manager",
        "finance_manager",
        "employee",
      ],
      attendance_status: [
        "on_time",
        "late",
        "half_day",
        "absent",
        "leave",
        "holiday",
      ],
      correction_status: ["pending", "approved", "rejected"],
      correction_type: ["clock_in", "clock_out", "both", "full_record"],
      leave_status: ["pending", "approved", "rejected", "cancelled"],
      leave_type: [
        "annual",
        "sick",
        "emergency",
        "unpaid",
        "maternity",
        "paternity",
      ],
      notification_type: [
        "late_arrival",
        "missed_clockout",
        "ot_reminder",
        "correction_approved",
        "correction_rejected",
        "auto_clockout",
        "ot_auto_closed",
      ],
    },
  },
} as const
