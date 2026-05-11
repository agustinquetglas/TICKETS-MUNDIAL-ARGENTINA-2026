const userId = 'f7fe8640-cdb1-4aed-b148-dac91097596c'; // Or some real user ID

async function run() {
    const res = await fetch('http://localhost:3001/tickets/comprar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            partidoId: 1, 
            usuarioId: userId,
            cantidad: 1,
            sectorId: '40a7fc87-cad9-429f-a7a1-83cb31082549' 
        })
    });
    console.log(res.status, await res.text());
}
run();
