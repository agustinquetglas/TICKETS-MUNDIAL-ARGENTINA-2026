import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UsuariosRepository {
    constructor(private readonly supabaseService: SupabaseService) { }

    async obtenerUsuarioPorId(usuarioId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('Usuario')
            .select('*')
            .eq('id', usuarioId)
            .single();

        if (error) {
            console.error('Error al obtener usuario de Supabase:', error);
            return null;
        }

        return data;
    }

    async actualizarSaldo(usuarioId: string, nuevoSaldo: number) {
        const supabase = this.supabaseService.getAdminClient();
        const { error } = await supabase
            .from('Usuario')
            .update({ Saldo: nuevoSaldo })
            .eq('id', usuarioId);

        if (error) {
            console.error('Error al actualizar saldo del usuario:', error);
            throw new InternalServerErrorException('Error al actualizar el saldo del usuario');
        }

        return true;
    }
}
