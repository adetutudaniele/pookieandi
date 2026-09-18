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
      actions: {
        Row: {
          action_id: string
          action_type: string
          created_at: string
          game_session_id: string
          id: string
          participant_id: string | null
          payload: Json
          result: Json | null
          round_id: string | null
          sequence: number
        }
        Insert: {
          action_id: string
          action_type: string
          created_at?: string
          game_session_id: string
          id?: string
          participant_id?: string | null
          payload?: Json
          result?: Json | null
          round_id?: string | null
          sequence?: number
        }
        Update: {
          action_id?: string
          action_type?: string
          created_at?: string
          game_session_id?: string
          id?: string
          participant_id?: string | null
          payload?: Json
          result?: Json | null
          round_id?: string | null
          sequence?: number
        }
        Relationships: [
          {
            foreignKeyName: "actions_game_session_id_fkey"
            columns: ["game_session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          game_type: string
          id: string
          room_id: string
          round_number: number
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          game_type: string
          id?: string
          room_id: string
          round_number?: number
          started_at?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          game_type?: string
          id?: string
          room_id?: string
          round_number?: number
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_secrets: {
        Row: {
          created_at: string
          participant_id: string
          participant_token: string
        }
        Insert: {
          created_at?: string
          participant_id: string
          participant_token?: string
        }
        Update: {
          created_at?: string
          participant_id?: string
          participant_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "participant_secrets_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: true
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          connected_at: string | null
          created_at: string
          display_name: string
          id: string
          last_seen_at: string
          role: string
          room_id: string
          status: string
          user_id: string | null
        }
        Insert: {
          connected_at?: string | null
          created_at?: string
          display_name?: string
          id?: string
          last_seen_at?: string
          role: string
          room_id: string
          status?: string
          user_id?: string | null
        }
        Update: {
          connected_at?: string | null
          created_at?: string
          display_name?: string
          id?: string
          last_seen_at?: string
          role?: string
          room_id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      player_stats: {
        Row: {
          display_name: string | null
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          display_name?: string | null
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          display_name?: string | null
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      private_submissions: {
        Row: {
          created_at: string
          game_session_id: string
          id: string
          participant_id: string
          payload: Json
          revealed_at: string | null
          round_id: string
          submission_type: string
        }
        Insert: {
          created_at?: string
          game_session_id: string
          id?: string
          participant_id: string
          payload?: Json
          revealed_at?: string | null
          round_id: string
          submission_type: string
        }
        Update: {
          created_at?: string
          game_session_id?: string
          id?: string
          participant_id?: string
          payload?: Json
          revealed_at?: string | null
          round_id?: string
          submission_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "private_submissions_game_session_id_fkey"
            columns: ["game_session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_submissions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_submissions_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
        }
        Relationships: []
      }
      room_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          participant_id: string | null
          room_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          participant_id?: string | null
          room_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          participant_id?: string | null
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_messages_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          active_game: string
          created_at: string
          expires_at: string
          game_state: Json
          id: string
          invite_token: string
          messages: Json
          player1_connected: boolean
          player1_name: string
          player2_connected: boolean
          player2_name: string | null
          room_code: string
          scores: Json
          shown_prompts: Json
          status: string
          updated_at: string
        }
        Insert: {
          active_game?: string
          created_at?: string
          expires_at?: string
          game_state?: Json
          id?: string
          invite_token?: string
          messages?: Json
          player1_connected?: boolean
          player1_name?: string
          player2_connected?: boolean
          player2_name?: string | null
          room_code: string
          scores?: Json
          shown_prompts?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          active_game?: string
          created_at?: string
          expires_at?: string
          game_state?: Json
          id?: string
          invite_token?: string
          messages?: Json
          player1_connected?: boolean
          player1_name?: string
          player2_connected?: boolean
          player2_name?: string | null
          room_code?: string
          scores?: Json
          shown_prompts?: Json
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      rounds: {
        Row: {
          completed_at: string | null
          game_session_id: string
          id: string
          round_number: number
          started_at: string
          state: Json
          state_version: number
          status: string
          timer_duration_seconds: number | null
          timer_started_at: string | null
          timer_status: string
        }
        Insert: {
          completed_at?: string | null
          game_session_id: string
          id?: string
          round_number: number
          started_at?: string
          state?: Json
          state_version?: number
          status?: string
          timer_duration_seconds?: number | null
          timer_started_at?: string | null
          timer_status?: string
        }
        Update: {
          completed_at?: string | null
          game_session_id?: string
          id?: string
          round_number?: number
          started_at?: string
          state?: Json
          state_version?: number
          status?: string
          timer_duration_seconds?: number | null
          timer_started_at?: string | null
          timer_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rounds_game_session_id_fkey"
            columns: ["game_session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      score_events: {
        Row: {
          created_at: string
          game_session_id: string
          id: string
          participant_id: string
          points: number
          reason: string
          round_id: string | null
        }
        Insert: {
          created_at?: string
          game_session_id: string
          id?: string
          participant_id: string
          points?: number
          reason: string
          round_id?: string | null
        }
        Update: {
          created_at?: string
          game_session_id?: string
          id?: string
          participant_id?: string
          points?: number
          reason?: string
          round_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "score_events_game_session_id_fkey"
            columns: ["game_session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_events_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_events_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      session_history: {
        Row: {
          duration_minutes: number
          final_scores: Json
          id: string
          partner_name: string
          played_at: string
          rounds_played: number
          user_id: string
        }
        Insert: {
          duration_minutes?: number
          final_scores?: Json
          id?: string
          partner_name?: string
          played_at?: string
          rounds_played?: number
          user_id: string
        }
        Update: {
          duration_minutes?: number
          final_scores?: Json
          id?: string
          partner_name?: string
          played_at?: string
          rounds_played?: number
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          device_id: string
          device_label: string
          id: string
          last_seen_at: string
          revoked: boolean
          user_agent: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_id: string
          device_label?: string
          id?: string
          last_seen_at?: string
          revoked?: boolean
          user_agent?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_id?: string
          device_label?: string
          id?: string
          last_seen_at?: string
          revoked?: boolean
          user_agent?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_round_state: {
        Args: {
          p_expected_version: number
          p_round_id: string
          p_state: Json
          p_status?: string
          p_timer_duration?: number
          p_timer_started_at?: string
          p_timer_status?: string
        }
        Returns: number
      }
      claim_participant_slot: {
        Args: { p_display_name: string; p_role: string; p_room_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
