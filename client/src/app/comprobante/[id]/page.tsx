'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ComprobantePage() {
    const params = useParams();
    const router = useRouter();
    const pedidoId = params.id as string;
    
    const [pedido, setPedido] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [originUrl, setOriginUrl] = useState('http://localhost:3000');

    const supabase = createClient();

    useEffect(() => {
        let origin = window.location.origin;
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Se fuerza la IP local de tu computadora para que el QR sea accesible desde tu celular (misma red WiFi)
            origin = 'http://192.168.1.26:3000';
        }
        setOriginUrl(origin);

        const fetchPedido = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setError('Debés iniciar sesión para ver el comprobante.');
                    setLoading(false);
                    return;
                }

                const res = await fetch(`${API_URL}/tickets/mis-entradas/${user.id}`);
                if (!res.ok) throw new Error('Error al obtener el comprobante');
                const data = await res.json();
                
                const found = data.find((p: any) => p.id === pedidoId);
                if (!found) {
                    setError('Comprobante no encontrado.');
                } else {
                    setPedido(found);
                }
            } catch (err: any) {
                setError(err.message || 'Error inesperado');
            } finally {
                setLoading(false);
            }
        };

        if (pedidoId) {
            fetchPedido();
        }
    }, [pedidoId]);

    if (loading) return <p style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>Cargando comprobante...</p>;
    if (error) return <p style={{ color: '#ff4d4d', textAlign: 'center', marginTop: '2rem' }}>{error}</p>;
    if (!pedido) return null;

    const partido = pedido.Tickets[0]?.Partidos;
    const tituloPartido = partido ? `${partido.equipo_a} vs ${partido.equipo_b}` : 'Partido desconocido';
    // This will generate a URL based on where the app is being hosted, making it possible to scan if hosted on a local IP
    const qrData = `${originUrl}/escanear/${pedido.id}`;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#111', color: 'white', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Link href="/compras-realizadas" style={{ alignSelf: 'flex-start', color: '#00bfff', textDecoration: 'none', marginBottom: '2rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>&larr;</span> Volver a mis entradas
            </Link>

            <div style={{ backgroundColor: '#222', padding: '2.5rem', borderRadius: '15px', maxWidth: '450px', width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#fff', fontSize: '1.8rem' }}>Ticket Virtual</h1>
                
                <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '10px', marginBottom: '2rem' }}>
                    <QRCodeSVG value={qrData} size={250} />
                </div>

                <div style={{ width: '100%', textAlign: 'left', lineHeight: '1.8', fontSize: '1.1rem' }}>
                    <p style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}><strong>Reserva:</strong> <span style={{ float: 'right', color: '#ccc' }}>{pedido.id.split('-')[0].toUpperCase()}</span></p>
                    <p style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', paddingTop: '0.5rem' }}><strong>Partido:</strong> <span style={{ float: 'right', color: '#ccc' }}>{tituloPartido}</span></p>
                    <p style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', paddingTop: '0.5rem' }}><strong>Monto Pagado:</strong> <span style={{ float: 'right', color: '#4CAF50', fontWeight: 'bold' }}>${pedido.monto_total}</span></p>
                    <p style={{ paddingTop: '0.5rem' }}><strong>Cantidad:</strong> <span style={{ float: 'right', color: '#ccc' }}>{pedido.Tickets.length} ticket(s)</span></p>
                </div>
            </div>
            
            <p style={{ marginTop: '2rem', color: '#888', fontSize: '1rem', textAlign: 'center', maxWidth: '400px' }}>
                Presentá este código QR en el ingreso al estadio. El personal de seguridad lo escaneará para validar tu acceso.
            </p>
        </div>
    );
}
