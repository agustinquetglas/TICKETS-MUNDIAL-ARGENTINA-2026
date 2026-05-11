const { MercadoPagoConfig, Payment } = require('mercadopago');
require('dotenv').config();

async function checkMP() {
    const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
    });
    const payment = new Payment(client);

    try {
        const result = await payment.search({
            options: {
                limit: 5,
                offset: 0
            }
        });
        console.log("Found:", result.results.length);
        if (result.results.length > 0) {
            console.log("Status:", result.results[0].status);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}
checkMP();
