import { Module } from '@nestjs/common';
import { SectorRepository } from './sector.repository';
import { SectorController } from './sector.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    controllers: [SectorController],
    providers: [SectorRepository],
    exports: [SectorRepository]
})
export class SectorModule { }