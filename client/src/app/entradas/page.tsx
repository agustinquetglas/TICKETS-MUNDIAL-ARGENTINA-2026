'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '../../utils/supabase/client';
import DarkModeToggle from '../../components/DarkModeToggle';

type SectorDB = {
  id: string;
  nombre_sector: string;
  precio_sector: number;
  Stock: number;
  partido_id: number;
};

export default function PaginaCompra() {
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
    fetch(`http://localhost:3001/sectores/${partidoId}`)
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

    const response = await fetch('http://localhost:3001/tickets/comprar', {
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
    <main className="main-compra">
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem' }}>
        <DarkModeToggle />
      </div>
      <h2 className="titulo">SELECCIONÁ TUS ENTRADAS</h2>

      <div className="compra-container">
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
              value={sectorSeleccionado?.id ?? ''}
              onChange={(e) => {
                const found = sectores.find((s) => s.id === e.target.value);
                setSectorSeleccionado(found ?? null);
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
          <p className="precio">USD {sectorSeleccionado?.precio_sector ?? '—'}</p>
        </div>

        <div className="box-cantidad">
          <p className="label-cantidad">Cantidad de entradas</p>
          <div className="cantidad-container">
            <button
              type="button"
              className="btn-cantidad"
              onClick={() => {
                setCantidad(Math.max(1, cantidad - 1));
              }}
            >
              −
            </button>
            <span className="cantidad-numero">{cantidad}</span>
            <button
              type="button"
              className="btn-cantidad"
              onClick={() => {
                setCantidad(Math.min(6, cantidad + 1));
              }}
            >
              +
            </button>
          </div>
        </div>

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

        <Image
          className="img-estadio"
          src="/estadio.png"
          alt="Estadio"
          width={900}
          height={450}
          priority
        />

        <button type="button" className="btn-continuar" onClick={onClickComprar} disabled={loading}>
          {loading ? 'PROCESANDO...' : 'CONTINUAR →'}
        </button>

        <button 
          type="button" 
          className="btn-cancelar"
          onClick={() => router.back()} 
          disabled={loading}
        >
          CANCELAR
        </button>
      </div>
    </main>
  );
}