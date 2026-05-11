'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '../../utils/supabase/client';
import DarkModeToggle from '../../components/DarkModeToggle';

type Pedido = {
    id: string;
    fecha_compra: string;
    estado_pago: string;
    monto_total: number;
    Tickets: Array<{
        id: string;
        Partidos: {
            equipo_a: string;
            equipo_b: string;
        };
    }>;
};
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function PaginaMisEntradas() {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');



    useEffect(() => {
        const supabase = createClient();
        const fetchMisEntradas = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setError('Debés iniciar sesión para ver tus entradas.');
                    setLoading(false);
                    return;
                }

                try {
                    // Sincronizamos con MercadoPago por si el usuario no pasó por la pantalla de pago exitoso
                    await fetch(`${API_URL}/tickets/sincronizar-pagos/${user.id}`);
                } catch (e) {
                    console.error('Error sincronizando pagos', e);
                }

                const res = await fetch(`${API_URL}/tickets/mis-entradas/${user.id}`);
                if (!res.ok) throw new Error('Error al obtener las reservas');
                const data = await res.json();
                setPedidos(data);
            } catch (err: any) {
                setError(err.message || 'Ocurrió un error inesperado');
            } finally {
                setLoading(false);
            }
        };

        void fetchMisEntradas();
    }, []);

    const formatearFecha = (fechaStr: string) => {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

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

                {loading ? (
                    <p style={{ textAlign: 'center', marginTop: '2rem', color: 'white' }}>Cargando entradas...</p>
                ) : error ? (
                    <p style={{ textAlign: 'center', marginTop: '2rem', color: '#ff4d4d' }}>{error}</p>
                ) : pedidos.length === 0 ? (
                    <p style={{ textAlign: 'center', marginTop: '2rem', color: 'white' }}>No tenés entradas compradas aún.</p>
                ) : (
                    <>
                        <div className="tabla-header">
                            <p>Partido</p>
                            <p>Reserva</p>
                            <p>Fecha de compra</p>
                            <p>Ver comprobante</p>
                        </div>

                        {pedidos.map((pedido) => {
                            // Asumimos que todos los tickets de un pedido son para el mismo partido
                            const partido = pedido.Tickets[0]?.Partidos;
                            const tituloPartido = partido
                                ? `${partido.equipo_a} vs ${partido.equipo_b}`
                                : 'Partido desconocido';

                            // Recortamos el ID del pedido para mostrar un número de reserva más corto
                            const reservaId = pedido.id.split('-')[0].toUpperCase();

                            return (
                                <div className="tabla-fila" key={pedido.id}>
                                    <p>{tituloPartido}</p>
                                    <p>{reservaId}</p>
                                    <p>{formatearFecha(pedido.fecha_compra)}</p>
                                    {pedido.estado_pago === 'PAGADO' ? (
                                        <Link href={`/comprobante/${pedido.id}`} className="btn-comprobante" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            comprobante
                                        </Link>
                                    ) : (
                                        <span style={{ color: 'orange', fontWeight: 'bold', justifySelf: 'center' }}>
                                            {pedido.estado_pago}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </>
                )}
            </main>
        </>
    );
}