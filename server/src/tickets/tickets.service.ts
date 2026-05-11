import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PartidosRepository } from '../partidos/partidos.repository';
import { PedidosRepository } from './pedidos.repository';
import { TicketsRepository } from './tickets.repository';
import { SectorRepository } from '../sector/sector.repository';
import { MercadoPagoStrategy } from '../payments/MercadoPagoStrategy';
import { PaymentProcessor } from '../payments/PaymentProcessor';

@Injectable()
export class TicketsService {
    constructor(
        private readonly partidosRepo: PartidosRepository,
        private readonly pedidosRepo: PedidosRepository,
        private readonly ticketsRepo: TicketsRepository,
        private readonly sectorRepo: SectorRepository,
    ) { }

    async procesarCompra(partidoId: number, usuarioId: string, cantidadAComprar: number, sectorId: string) {

        if (cantidadAComprar < 1 || cantidadAComprar > 6) {
            throw new BadRequestException('Error: Solo se pueden adquirir entre 1 y 6 entradas por pedido.');
        }

        const partido = await this.partidosRepo.obtenerPorId(partidoId);
        if (!partido) {
            throw new BadRequestException('El partido seleccionado no se encuentra disponible.');
        }

        const sector = await this.sectorRepo.obtenerPorId(sectorId);
        if (!sector) {
            throw new BadRequestException('El sector seleccionado no existe.');
        }

        if (Number(sector.partido_id) !== Number(partidoId)) {
            throw new BadRequestException('El sector no pertenece al partido indicado.');
        }

        if (cantidadAComprar > sector.Stock) {
            throw new BadRequestException(`Stock insuficiente. Solo quedan ${sector.Stock} entradas disponibles en ese sector.`);
        }

        const montoTotal = sector.precio_sector * cantidadAComprar;

        try {
            const nuevoPedido = await this.pedidosRepo.crearPedido({
                usuario_id: usuarioId,
                monto_total: montoTotal,
                fecha_compra: new Date(),
                estado_pago: 'PENDIENTE',
                referencia_pago: null
            });

            const ticketsAGenerar = [];
            for (let i = 0; i < cantidadAComprar; i++) {
                ticketsAGenerar.push({
                    pedido_id: nuevoPedido.id,
                    partido_id: partido.id,
                    sector_id: sector.id,
                    vendido: false
                });
            }

            await this.ticketsRepo.crearMultiplesTickets(ticketsAGenerar);

            const nuevoStock = sector.Stock - cantidadAComprar;
            await this.sectorRepo.actualizarStock(sector.id, nuevoStock);

            const mpStrategy = new MercadoPagoStrategy();
            const processor = new PaymentProcessor(mpStrategy);
            const urlPago = await processor.processTicketPayment({
                compraId: nuevoPedido.id,
                productoId: String(partido.id),
                cantidad: cantidadAComprar,
                precio: sector.precio_sector
            });

            return {
                exito: true,
                pedidoId: nuevoPedido.id,
                montoTotal: montoTotal,
                cantidad: cantidadAComprar,
                urlPago: urlPago,
                mensaje: 'Pedido generado correctamente. Completá el pago para asegurar tu lugar en el estadio.'
            };

        } catch (error: any) {
            console.error('Error in procesarCompra:', error);
            throw new InternalServerErrorException('Error: ' + (error.message || JSON.stringify(error)));
        }
    }

    async confirmarPago(pagoId: string) {
        try {
            const { MercadoPagoConfig, Payment } = await import('mercadopago');
            const client = new MercadoPagoConfig({
                accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
            });
            const payment = new Payment(client);
            const resultado = await payment.get({ id: pagoId });

            if (resultado.status === 'approved') {
                await this.pedidosRepo.actualizarEstadoPago(
                    String(resultado.external_reference!),
                    'PAGADO',
                    pagoId
                );
            }
        } catch (error) {
            console.error('Error al confirmar pago:', error);
        }
    }

    async obtenerMisEntradas(usuarioId: string) {
        if (!usuarioId) {
            throw new BadRequestException('ID de usuario requerido');
        }
        return await this.pedidosRepo.obtenerPedidosDeUsuario(usuarioId);
    }

    async sincronizarPagosPendientes(usuarioId: string) {
        try {
            const pedidos = await this.pedidosRepo.obtenerPedidosDeUsuario(usuarioId);
            const pendientes = pedidos.filter((p: any) => p.estado_pago === 'PENDIENTE');

            if (pendientes.length === 0) return { ok: true };

            const { MercadoPagoConfig, Payment } = await import('mercadopago');
            const client = new MercadoPagoConfig({
                accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
            });
            const paymentClient = new Payment(client);

            for (const pedido of pendientes) {
                const result = await paymentClient.search({
                options: {
                    external_reference: String(pedido.id)
                }
            }); 

                console.log('RESULTADO MP:', JSON.stringify(result, null, 2));

                if (result.results && result.results.length > 0) {
                    const pagosAprobados = result.results.filter((p: any) => p.status === 'approved');
                    if (pagosAprobados.length > 0) {
                        const pago = pagosAprobados[0];
                        await this.pedidosRepo.actualizarEstadoPago(pedido.id, 'PAGADO', String(pago.id));
                    }
                }
            }
            return { ok: true };
        } catch (error) {
            console.error('Error al sincronizar pagos:', error);
            return { ok: false };
        }
    }
}