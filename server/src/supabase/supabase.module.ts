import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Global()
@Module({
  imports: [SupabaseModule],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule { }
