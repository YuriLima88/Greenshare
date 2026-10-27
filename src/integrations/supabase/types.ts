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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      DOACAO: {
        Row: {
          atualizado_em: string
          categoria: string
          criado_em: string
          data_validade: string | null
          descricao: string
          foto_url: string | null
          id_doacao: number
          id_usuario_doador: number
          janela_retirada_fim: string
          janela_retirada_inicio: string
          local_retirada: string | null
          quantidade: number
          status: string
          titulo: string
          unidade_medida: string
        }
        Insert: {
          atualizado_em?: string
          categoria: string
          criado_em?: string
          data_validade?: string | null
          descricao: string
          foto_url?: string | null
          id_doacao?: number
          id_usuario_doador: number
          janela_retirada_fim: string
          janela_retirada_inicio: string
          local_retirada?: string | null
          quantidade: number
          status?: string
          titulo: string
          unidade_medida: string
        }
        Update: {
          atualizado_em?: string
          categoria?: string
          criado_em?: string
          data_validade?: string | null
          descricao?: string
          foto_url?: string | null
          id_doacao?: number
          id_usuario_doador?: number
          janela_retirada_fim?: string
          janela_retirada_inicio?: string
          local_retirada?: string | null
          quantidade?: number
          status?: string
          titulo?: string
          unidade_medida?: string
        }
        Relationships: [
          {
            foreignKeyName: "DOACAO_id_usuario_doador_fkey"
            columns: ["id_usuario_doador"]
            isOneToOne: false
            referencedRelation: "USUARIO"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      RESERVA: {
        Row: {
          data_reserva: string
          data_retirada: string | null
          expira_em: string
          id_doacao: number
          id_reserva: number
          id_usuario_receptor: number
          status_reserva: string
        }
        Insert: {
          data_reserva?: string
          data_retirada?: string | null
          expira_em?: string
          id_doacao: number
          id_reserva?: number
          id_usuario_receptor: number
          status_reserva?: string
        }
        Update: {
          data_reserva?: string
          data_retirada?: string | null
          expira_em?: string
          id_doacao?: number
          id_reserva?: number
          id_usuario_receptor?: number
          status_reserva?: string
        }
        Relationships: [
          {
            foreignKeyName: "RESERVA_id_doacao_fkey"
            columns: ["id_doacao"]
            isOneToOne: false
            referencedRelation: "DOACAO"
            referencedColumns: ["id_doacao"]
          },
          {
            foreignKeyName: "RESERVA_id_usuario_receptor_fkey"
            columns: ["id_usuario_receptor"]
            isOneToOne: false
            referencedRelation: "USUARIO"
            referencedColumns: ["id_usuario"]
          },
        ]
      }
      USUARIO: {
        Row: {
          auth_id: string | null
          bairro: string | null
          criado_em: string
          email: string
          id_usuario: number
          nome: string
          telefone: string | null
          tipo_perfil: string
          tipo_pessoa: string
        }
        Insert: {
          auth_id?: string | null
          bairro?: string | null
          criado_em?: string
          email: string
          id_usuario?: number
          nome: string
          telefone?: string | null
          tipo_perfil: string
          tipo_pessoa: string
        }
        Update: {
          auth_id?: string | null
          bairro?: string | null
          criado_em?: string
          email?: string
          id_usuario?: number
          nome?: string
          telefone?: string | null
          tipo_perfil?: string
          tipo_pessoa?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      confirmar_entrega: { Args: { p_id_reserva: number }; Returns: undefined }
      expirar_reservas: { Args: never; Returns: undefined }
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
