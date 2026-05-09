
'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "../utils/supabase/client";
import DarkModeToggle from "../components/DarkModeToggle";
import UserMenu from "../components/UserMenu";

type Partido = {
  id: number;
  equipo_a: string;
  equipo_b: string;
  fecha: string;
  precio_base: number;
};

// Mapa de logos por país (los que tienen imagen en /public)
const logos: { [key: string]: string } = {
  'ARGENTINA': '/logo-argentina.png',
  'ARGELIA': '/logo-argelia.png',
  'AUSTRIA': '/logo-austria.png',
  'JORDANIA': '/logo-jordania.png',
  'BRASIL': '/logo-brasil.png',
};

const getLogo = (equipo: string) => logos[equipo.toUpperCase()] ?? '/Logo-Copa-Mundial.png';

export default function Page() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchPartidos = async () => {
      try {
        const res = await fetch('http://127.0.0.1:3001/partidos');
        if (!res.ok) throw new Error('Error al cargar partidos');
        const data = await res.json();
        
        const partidosProcesados = data.map((p: any) => ({
          ...p,
          precio_base: p.precio_base || (p.Sector && p.Sector.length > 0 
            ? Math.min(...p.Sector.map((s: any) => s.precio_sector))
            : p.precio_base || 0)
        }));

        setPartidos(partidosProcesados);
      } catch (err) {
        console.error('Error fetching partidos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPartidos();
  }, []);

  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return {
      dia: dias[fecha.getDay()],
      numero: fecha.getDate(),
      hora: fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <>
      <header className="header">
        <DarkModeToggle />
        <UserMenu />
      </header>

      <main>
        <h2 className="titulo">PARTIDOS DISPONIBLES</h2>

        {loading && <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando partidos...</p>}

        {!loading && partidos.length === 0 && (
          <p style={{ textAlign: 'center', padding: '2rem' }}>No hay partidos disponibles.</p>
        )}

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 max-w-6xl mx-auto px-4">
          {partidos.map((partido) => {
            const { dia, numero, hora } = formatearFecha(partido.fecha);
            return (
              <div key={partido.id} className="bg-[#1a2233] border border-gray-700 rounded-xl p-5 flex flex-col justify-between hover:border-gray-500 transition-all shadow-lg">

                {/* 1. Fila superior compacta */}
                <div className="flex justify-between items-center text-xs text-gray-400 mb-4 border-b border-gray-800 pb-2">
                  <span className="font-medium tracking-wide uppercase">{dia} {numero} • {hora} HS</span>
                  <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded-md text-[10px] font-bold tracking-wider">
                    FASE DE GRUPOS
                  </span>
                </div>

                {/* 2. Fila central: Equipos */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex flex-col items-center gap-2 w-1/3">
                    <img className="w-16 h-16 object-contain" src={getLogo(partido.equipo_a)} alt={partido.equipo_a} />
                    <span className="font-bold text-sm text-center text-white">{partido.equipo_a}</span>
                  </div>

                  <div className="w-1/3 text-center">
                    <span className="text-gray-600 font-black text-sm bg-gray-900/50 px-3 py-1 rounded-full">VS</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 w-1/3">
                    <img className="w-16 h-16 object-contain" src={getLogo(partido.equipo_b)} alt={partido.equipo_b} />
                    <span className="font-bold text-sm text-center text-white">{partido.equipo_b}</span>
                  </div>
                </div>

                {/* 3. Precio */}
                <div className="flex justify-between items-end mb-4 bg-black/20 p-3 rounded-lg">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Precio desde</span>
                  <span className="text-2xl font-black text-green-400">USD {partido.precio_base}</span>
                </div>

                {/* 4. Botón Comprar */}
                <Link href={`/entradas?partido_id=${partido.id}`} className="w-full">
                  <button className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-3 rounded-lg transition-all active:scale-[0.98]">
                    COMPRAR ENTRADA
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
