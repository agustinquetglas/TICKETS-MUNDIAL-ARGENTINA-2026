'use client';

import Link from 'next/link';
import DarkModeToggle from '../../components/DarkModeToggle';

export default function PaginaMisEntradas() {

    return (
        <>
            <header className="header">
                <DarkModeToggle />
                <Link href="/" className="btn-volver">
                    Volver
                </Link>
            </header>

            <main className="main-entradas">
                <h2 className="titulo-entradas">MIS ENTRADAS</h2>

                <div className="tabla-header">
                    <p>Partido</p>
                    <p>Reserva</p>
                    <p>Fecha de compra</p>
                    <p>Ver comprobante</p>
                </div>

                <div className="tabla-fila">
                    <p>Argentina vs Argelia</p>
                    <p>8005282</p>
                    <p>16/08/2024 10:24:59</p>
                    <button className="btn-comprobante">comprobante</button>
                </div>

                <div className="tabla-fila">
                    <p>Argentina vs Francia</p>
                    <p>6024971</p>
                    <p>23/02/2024 10:16:35</p>
                    <button className="btn-comprobante">comprobante</button>
                </div>

                <div className="tabla-fila">
                    <p>Brasil vs Alemania</p>
                    <p>4257283</p>
                    <p>25/07/2023 10:09:54</p>
                    <button className="btn-comprobante">comprobante</button>
                </div>

            </main>
        </>
    );
}