const { MercadoPagoConfig, Preference } = require('mercadopago');
require('dotenv').config();

async function testMP() {
    const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
    });
    const preference = new Preference(client);

    try {
        const result = await preference.create({
            body: {
                items: [
                    {
                        id: 'ticket-mundial-2026',
                        title: 'Ticket Mundial Argentina 2026',
                        quantity: 1,
                        unit_price: 50000,
                        currency_id: 'ARS'
                    }
                ],
                external_reference: 'pedido-prueba',
                back_urls: {
                    success: 'http://127.0.0.1:3000/pago-exitoso',
                    failure: 'http://127.0.0.1:3000/pago-fallido',
                    pending: 'http://127.0.0.1:3000/pago-pendiente'
                },
                auto_return: 'approved'
            }
        });
        console.log("Success:", result.init_point);
    } catch (error) {
        console.error("Error creating preference:", error.message, error.cause);
    }
}
testMP();
