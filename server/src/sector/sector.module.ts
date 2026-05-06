import { Module } from '@nestjs/common';
import { SectorRepository } from './sector.repository';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    providers: [SectorRepository],
    exports: [SectorRepository]
})
export class SectorModule { }