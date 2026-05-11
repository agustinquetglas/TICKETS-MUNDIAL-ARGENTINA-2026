'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function PagoExitosoContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const [confirmado, setConfirmado] = useState(false);

  useEffect(() => {
    if (!paymentId) return;

    fetch(`${API_URL}/tickets/confirm/${paymentId}`, {
      method: 'POST',
    })
      .then(() => setConfirmado(true))
      .catch(() => setConfirmado(true)); // mostramos confirmado igual
  }, [paymentId]);

  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <h1>¡Pago exitoso!</h1>
      <p>Tu entrada fue confirmada. Vas a recibir un mail con el detalle.</p>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link href="/compras-realizadas">
          <button className="btn-cancelar" style={{ borderColor: '#22c55e', color: '#22c55e' }}>Mis Entradas</button>
        </Link>
        <Link href="/">
          <button className="btn-continuar" style={{ maxWidth: '200px' }}>Inicio</button>
        </Link>
      </div>
    </div>
  );
}

export default function PagoExitoso() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PagoExitosoContent />
    </Suspense>
  );
}
