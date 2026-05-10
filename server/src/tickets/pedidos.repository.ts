import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PedidosRepository {
    constructor(private readonly supabaseService: SupabaseService) { }

    async crearPedido(datosPedido: any) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('Pedidos')
            .insert(datosPedido)
            .select()
            .single();

        if (error) {
            console.error('Error al crear pedido en Supabase:', error);
            throw new InternalServerErrorException('Error al registrar el pedido: ' + error.message);
        }

        return data;
    }

    async actualizarEstadoPago(pedidoId: string, estado: string, referenciaPago: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { error } = await supabase
            .from('Pedidos')
            .update({
                estado_pago: estado,
                referencia_pago: referenciaPago
            })
            .eq('id', pedidoId);

        if (error) {
            console.error('Error al actualizar estado del pedido:', error);
            throw new InternalServerErrorException('Error al actualizar el pedido');
        }
    }

    async obtenerPedidosDeUsuario(usuarioId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('Pedidos')
            .select(`
                id,
                fecha_compra,
                estado_pago,
                monto_total,
                Tickets (
                    id,
                    Partidos (
                        equipo_a,
                        equipo_b
                    )
                )
            `)
            .eq('usuario_id', usuarioId)
            .order('fecha_compra', { ascending: false });

        if (error) {
            console.error('Error al obtener pedidos de Supabase:', error);
            throw new InternalServerErrorException('Error al obtener las reservas');
        }

        return data;
    }
}