'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function PagoExitosoContent() {
    const searchParams = useSearchParams();
    const paymentId = searchParams.get('payment_id');
    const [confirmando, setConfirmando] = useState(true);

    useEffect(() => {
        if (paymentId) {
            // Confirmamos el pago en el backend (ya que los webhooks no llegan a localhost)
            fetch(`${API_URL}/tickets/confirmar/${paymentId}`)
                .then(() => setConfirmando(false))
                .catch((err) => {
                    console.error('Error al confirmar pago', err);
                    setConfirmando(false);
                });
        } else {
            setConfirmando(false);
        }
    }, [paymentId]);

    return (
        <main className="main-entradas" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1 className="titulo-entradas" style={{ color: '#4ade80' }}>¡Pago exitoso!</h1>
            
            {confirmando ? (
                <p style={{ marginTop: '1rem' }}>Confirmando tu reserva en el sistema...</p>
            ) : (
                <>
                    <p style={{ marginTop: '1rem', fontSize: '1.2rem', textAlign: 'center' }}>Tu entrada fue confirmada y tu lugar está asegurado.</p>
                    <p style={{ marginTop: '0.5rem', color: '#9ca3af', textAlign: 'center' }}>Ya podés ver el comprobante en la sección de tus entradas.</p>
                </>
            )}

            <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
                <Link href="/compras-realizadas">
                    <button type="button" className="btn-comprobante" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
                        Mis Entradas
                    </button>
                </Link>
                <Link href="/">
                    <button type="button" className="btn-volver" style={{ position: 'relative', top: 0, left: 0, padding: '1rem 2rem', fontSize: '1rem' }}>
                        Inicio
                    </button>
                </Link>
            </div>
        </main>
    );
}

export default function PagoExitoso() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '5rem' }}>Cargando...</div>}>
            <PagoExitosoContent />
        </Suspense>
    );
}