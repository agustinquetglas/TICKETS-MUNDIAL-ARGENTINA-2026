import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabaseAnon: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');
    const supabaseServiceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl) {
      this.logger.error('Falta SUPABASE_URL en el archivo .env.');
      return;
    }

    if (supabaseKey) {
      this.supabaseAnon = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      });
      this.logger.log('Cliente Anon de Supabase inicializado.');
    }

    if (supabaseServiceRoleKey) {
      this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      });
      this.logger.log('Cliente Admin (Service Role) de Supabase inicializado.');
    }
  }

  getClient(): SupabaseClient {
    if (!this.supabaseAnon) {
      throw new Error('El cliente Anon de Supabase no se pudo inicializar.');
    }
    return this.supabaseAnon;
  }

  getAdminClient(): SupabaseClient {
    if (!this.supabaseAdmin) {
      throw new Error('El cliente Admin de Supabase no se pudo inicializar.');
    }
    return this.supabaseAdmin;
  }
}
