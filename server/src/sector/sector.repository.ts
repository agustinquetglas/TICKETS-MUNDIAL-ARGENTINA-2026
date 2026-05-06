import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SectorRepository {
    constructor(private readonly supabaseService: SupabaseService) {}

    async obtenerPorId(id: string) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('Sector')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error al obtener sector de Supabase:', error);
            return null;
        }

        return data;
    }

    async obtenerPorPartido(partidoId: number) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('Sector')
            .select('*')
            .eq('partido_id', partidoId);

        if (error) {
            console.error('Error al obtener sectores del partido:', error);
            return [];
        }

        return data;
    }

    async actualizarStock(sectorId: string, nuevoStock: number) {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase
            .from('Sector')
            .update({ Stock: nuevoStock })
            .eq('id', sectorId);

        if (error) {
            console.error('Error al actualizar stock del sector:', error);
            throw new InternalServerErrorException('Error al actualizar el stock del sector');
        }

        return true;
    }
}