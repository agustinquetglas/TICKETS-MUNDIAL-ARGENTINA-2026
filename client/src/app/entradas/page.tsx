'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '../../utils/supabase/client';
import DarkModeToggle from '../../components/DarkModeToggle';
import UserMenu from '../../components/UserMenu';

type SectorDB = {
  id: string;
  nombre_sector: string;
  precio_sector: number;
  Stock: number;
  partido_id: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function PaginaCompraContent() {
  const [sectores, setSectores] = useState<SectorDB[]>([]);
  const [sectorSeleccionado, setSectorSeleccionado] = useState<SectorDB | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSectores, setLoadingSectores] = useState<boolean>(true);
  const [mensaje, setMensaje] = useState<string>('');
  const [error, setError] = useState<string>('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const partidoIdStr = searchParams.get('partido_id');

  const supabase = createClient();

  const partidoId = useMemo(() => {
    const n = Number(partidoIdStr);
    return Number.isFinite(n) ? n : null;
  }, [partidoIdStr]);

  // Cargar sectores reales del partido desde el backend
  useEffect(() => {
    if (!partidoId) {
      setError('No se seleccionó ningún partido. Volvé a la página principal.');
      setLoadingSectores(false);
      return;
    }
    setLoadingSectores(true);
    fetch(`${API_URL}/sectores/${partidoId}`)
      .then((res) => res.json())
      .then((data: SectorDB[]) => {
        setSectores(data);
        if (data.length > 0) setSectorSeleccionado(data[0]);
      })
      .catch(() => setError('No se pudieron cargar los sectores del partido.'))
      .finally(() => setLoadingSectores(false));
  }, [partidoId]);

  const handleComprar = async (): Promise<void> => {
    console.log('CLICK EN COMPRAR');

    if (!partidoId) {
      setError('No se seleccionó ningún partido. Volvé a la página principal.');
      return;
    }

    if (!sectorSeleccionado) {
      setError('Seleccioná un sector antes de continuar.');
      return;
    }

    setLoading(true);
    setError('');
    setMensaje('');

    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data.user) {
      setError('Debés iniciar sesión para comprar entradas.');
      setLoading(false);
      router.push('/login');
      return;
    }

    const response = await fetch(`${API_URL}/tickets/comprar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        partidoId,
        usuarioId: data.user.id,
        cantidad,
        sectorId: sectorSeleccionado.id,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.message || 'Error al procesar la compra');
      setLoading(false);
      return;
    }

    if (!result.urlPago) {
      setError('No se recibió la URL de pago.');
      setLoading(false);
      return;
    }

    window.location.href = result.urlPago;
  };

  const onClickComprar = () => {
    void handleComprar();
  };

  return (
    <>
      <main className="main-compra">
        <h2 className="titulo" style={{ marginTop: '2rem', fontSize: '1.8rem', letterSpacing: '2px' }}>SELECCIONÁ TUS ENTRADAS</h2>

        <div className="compra-layout">
          {/* LADO IZQUIERDO: SELECCIÓN */}
          <div className="compra-card">
            {mensaje ? (
              <p className="compra-msg compra-msg--ok" role="status">
                {mensaje}
              </p>
            ) : null}

            {error ? (
              <p className="compra-msg compra-msg--error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="sector">
              <label className="label-sector" htmlFor="sector">
                Sector
              </label>
              {loadingSectores ? (
                <p>Cargando sectores...</p>
              ) : (
                <select
                  id="sector"
                  className="selector-sector"
                  value={sectorSeleccionado?.id || ''}
                  onChange={(e) => {
                    const s = sectores.find((sec) => sec.id === e.target.value);
                    if (s) setSectorSeleccionado(s);
                  }}
                >
                  {sectores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre_sector}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="box-precio">
              <p className="label-precio">Precio por entrada</p>
              <p className="precio">
                {sectorSeleccionado ? `USD ${sectorSeleccionado.precio_sector}` : '—'}
              </p>
            </div>

            <div className="box-cantidad">
              <label className="label-cantidad">Cantidad de entradas</label>
              <div className="cantidad-container">
                <button
                  type="button"
                  className="btn-cantidad"
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                >
                  −
                </button>
                <span className="cantidad-numero">{cantidad}</span>
                <button
                  type="button"
                  className="btn-cantidad"
                  onClick={() => setCantidad(Math.min(6, cantidad + 1))}
                >
                  +
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                Máximo 6 por persona
              </p>
            </div>

            <div className="total-box">
               <p>A pagar:</p>
               <h3 className="total-amount">Total: ${sectorSeleccionado ? sectorSeleccionado.precio_sector * cantidad : 0}</h3>
            </div>
          </div>

          {/* LADO DERECHO: MAPA Y REFERENCIAS */}
          <div className="estadio-container">
            <Image
              src="/estadio.png"
              alt="Estadio"
              width={450}
              height={300}
              className="img-estadio"
              priority
            />
            <div className="referencias">
              <div className="referencia-box">
                <span className="color-ref vip-color"></span>
                <p>VIP</p>
              </div>
              <div className="referencia-box">
                <span className="color-ref platea-color"></span>
                <p>Platea</p>
              </div>
              <div className="referencia-box">
                <span className="color-ref popular-color"></span>
                <p>Popular</p>
              </div>
              <div className="referencia-box">
                <span className="color-ref nodisponible-color"></span>
                <p>No disponible</p>
              </div>
            </div>
          </div>
        </div>

        <div className="compra-acciones">
          <button
            type="button"
            className="btn-continuar"
            onClick={onClickComprar}
            disabled={loading || !sectorSeleccionado}
          >
            {loading ? 'Procesando...' : 'CONTINUAR AL PAGO →'}
          </button>

          <button
            type="button"
            className="btn-cancelar"
            onClick={() => router.push('/')}
          >
            CANCELAR
          </button>
        </div>
      </main>
    </>
  );
}

export default function PaginaCompra() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PaginaCompraContent />
    </Suspense>
  );
}