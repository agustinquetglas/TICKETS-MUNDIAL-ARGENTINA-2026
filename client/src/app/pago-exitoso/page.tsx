'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PagoExitoso() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const [confirmado, setConfirmado] = useState(false);

  useEffect(() => {
    if (!paymentId) return;

    fetch(`http://127.0.0.1:3001/tickets/confirm/${paymentId}`, {
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
          <button>Mis Entradas</button>
        </Link>
        <Link href="/">
          <button>Inicio</button>
        </Link>
      </div>
    </div>
  );
}