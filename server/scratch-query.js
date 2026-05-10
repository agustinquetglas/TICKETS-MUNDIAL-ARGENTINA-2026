const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testQuery() {
    const { data, error } = await supabase
        .from('Pedidos')
        .select(`
            id,
            fecha_compra,
            estado_pago,
            Tickets (
                id,
                Partidos (
                    equipo_a,
                    equipo_b
                )
            )
        `)
        .limit(1);
    
    console.log(JSON.stringify(data, null, 2));
    console.log("Error:", error);
}

testQuery();
