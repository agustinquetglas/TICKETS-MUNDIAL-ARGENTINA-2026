import { MercadoPagoConfig, Preference } from 'mercadopago';
import { PaymentStrategy } from './PaymentStrategy';

export class MercadoPagoStrategy implements PaymentStrategy {
    async createPaymentIntent(ticketData: any): Promise<string> {

        const client = new MercadoPagoConfig({
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
        });

        const preference = new Preference(client);

        // Definimos la URL base (Vercel en producción, localhost en desarrollo)
        const BASE_URL = 'https://tickets-mundial-argentina-2026.vercel.app';

        try {
            const result = await preference.create({
                body: {
                    items: [
                        {
                            id: ticketData.productoId || 'ticket-mundial-2026',
                            title: 'Ticket Mundial Argentina 2026',
                            quantity: Number(ticketData.cantidad) || 1,
                            unit_price: Number(ticketData.precio || ticketData.unit_price) || 50000,
                            currency_id: 'ARS'
                        }
                    ],

                    external_reference: String(ticketData.compraId || 'pedido-prueba'),

                    // Actualización de URLs de retorno a producción
                    back_urls: {
                        success: `${BASE_URL}/pago-exitoso`,
                        failure: `${BASE_URL}/pago-fallido`,
                        pending: `${BASE_URL}/pago-pendiente`
                    },
                    auto_return: 'approved', // Esto hace que Mercado Pago redirija automáticamente al usuario al terminar
                }
            });

            return result.init_point!;

        } catch (error) {
            console.error('Error al crear la preferencia en Mercado Pago:', error);
            throw new Error('No se pudo processar el pago del ticket');
        }
    }
}