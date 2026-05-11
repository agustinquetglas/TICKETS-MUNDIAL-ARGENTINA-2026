import { Controller, Post, Body, HttpException, HttpStatus, Get, Param } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { ComprarTicketsDto } from './dto/comprar-tickets.dto';
import { PaymentProcessor } from '../payments/PaymentProcessor';
import { MercadoPagoStrategy } from '../payments/MercadoPagoStrategy';

@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Post('comprar')
    async comprarTickets(@Body() body: ComprarTicketsDto) {
        return await this.ticketsService.procesarCompra(
            body.partidoId,
            body.usuarioId,
            body.cantidad,
            body.sectorId
        );
    }

    @Post('checkout')
    async crearCheckout(@Body() datosCompra: any) {
        const mpStrategy = new MercadoPagoStrategy();
        const processor = new PaymentProcessor(mpStrategy);

        try {
            const urlPago = await processor.processTicketPayment(datosCompra);
            return { url: urlPago };
        } catch (_error) {
            throw new HttpException('Falló la generación del checkout', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('webhook/mercadopago')
    async webhookMercadoPago(@Body() body: any) {
        if (body.type === 'payment' && body.data?.id) {
            await this.ticketsService.confirmarPago(body.data.id);
        }
        return { ok: true };
    }

    @Get('mis-entradas/:usuarioId')
    async obtenerMisEntradas(@Param('usuarioId') usuarioId: string) {
        return await this.ticketsService.obtenerMisEntradas(usuarioId);
    }

    @Get('confirmar/:pagoId')
    async confirmarPagoLocal(@Param('pagoId') pagoId: string) {
        await this.ticketsService.confirmarPago(pagoId);
        return { ok: true };
    }

    @Get('sincronizar-pagos/:usuarioId')
    async sincronizarPagos(@Param('usuarioId') usuarioId: string) {
        return await this.ticketsService.sincronizarPagosPendientes(usuarioId);
    }
}