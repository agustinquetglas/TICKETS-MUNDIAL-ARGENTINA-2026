"use client";

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
  ARGENTINA: "/Flag_of_Argentina.png",
  ARGELIA: "/Flag_of_Algeria.png",
  AUSTRIA: "/Flag_of_Austria.png",
  JORDANIA: "/Flag_of_Jordan.png",
};

const getLogo = (equipo: string) =>
  logos[equipo.toUpperCase()] ?? "/Logo-Copa-Mundial.png";

const getEstadio = (local: string, visitante: string) => {
  // pongo a argentina como local siempre
  if (local === "ARGENTINA") {
    if (visitante === "ARGELIA") return "Arrowhead Stadium, Kansas City";
    if (visitante === "AUSTRIA") return "AT&T Stadium, Dallas";
    if (visitante === "JORDANIA") return "AT&T Stadium, Arlington";
  }
};

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
    const dias = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    return {
      dia: dias[fecha.getDay()],
      numero: fecha.getDate(),
      hora: fecha.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <>
      <header className="header">
        <DarkModeToggle />
        <UserMenu />
      </header>

      <main>
        <h2 className="titulo !mt-[10px] !mb-[20px]">PARTIDOS DISPONIBLES</h2>

        {loading && (
          <p style={{ textAlign: "center", padding: "2rem" }}>
            Cargando partidos...
          </p>
        )}

        {!loading && partidos.length === 0 && (
          <p style={{ textAlign: "center", padding: "2rem" }}>
            No hay partidos disponibles.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-6 max-w-6xl mx-auto px-4">
          {partidos.map((partido) => {
            const { dia, numero, hora } = formatearFecha(partido.fecha);
            return (
              <div key={partido.id} className="flex flex-col mb-4">
               
                {/* 1. Encabezado: Fecha, Hora y Fase ) */}
                <div 
                  className="flex items-center justify-between border-b border-gray-700 p-4 text-white" 
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  {/* Izquierda: 16 JUN */}
                  <div className="flex flex-col items-center  w-24 shrink-0">
                    <span className="text-2xl font-bold leading-none">{numero}</span>
                    <span className="text-[12px] text-gray-500 font-black tracking-widest mt-1">JUN</span>
                  </div>

                  {/* Centro: MARTES 10:00 PM */}
                  <div className="flex flex-col items-start pl-10 flex-grow">
                    <span className="text-sm font-bold uppercase tracking-tight">{dia}</span>
                    <span className="text-xs text-gray-400 font-mono">{hora} P.M.</span>
                  </div>


                  {/*  [ FASE DE GRUPOS ] */}
                  <div className="pl-4">
                    <span className="text-sm font-black text-white tracking-[0.2em] uppercase">
                      [ FASE DE GRUPOS ]
                    </span>
                  </div>
                </div>

                {/* 2. Tarjeta Azul (Bordes rectos y etiqueta en el techo) */}
                <div className="bg-[#1a2233] border border-gray-700 rounded-none flex flex-col transition-all shadow-lg overflow-hidden">

                  <div className="p-5 pt-2 flex flex-col justify-between h-full">
                    {/* Fila superior: Sede con ícono */}
                    <div className="flex justify-center items-center mb-5 border-b border-gray-700/50 pb-3">
                      <span className="text-base font-bold text-white-400 uppercase tracking-wide flex items-center gap-2">
                        <span className="text-red-400 text-sm">📍</span> 
                        {getEstadio(partido.equipo_a, partido.equipo_b)}
                      </span>
                    </div>

                    {/* Fila central: Banderas y VS */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex flex-col items-center gap-2 w-1/3">
                        <img className="w-16 h-10 object-cover rounded-none shadow-sm border border-gray-700" src={getLogo(partido.equipo_a)} alt={partido.equipo_a} />
                        <span className="font-bold text-sm text-center text-white uppercase">{partido.equipo_a}</span>
                      </div>

                      <div className="w-1/3 text-center">
                        <span className="text-white font-black text-sm">VS</span>
                      </div>

                      <div className="flex flex-col items-center gap-2 w-1/3">
                        <img className="w-16 h-10 object-cover rounded-none shadow-sm border border-gray-700" src={getLogo(partido.equipo_b)} alt={partido.equipo_b} />
                        <span className="font-bold text-sm text-center text-white uppercase">{partido.equipo_b}</span>
                      </div>
                    </div>

                    {/* Precio y Botón  */}
                    <div className="flex justify-between items-end mb-4 bg-black/20 p-3 rounded-none">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Precio desde</span>
                      <span className="text-2xl font-black text-green-400">USD {partido.precio_base}</span>
                    </div>

                    <div className="flex justify-center mt-2">
                      <Link href={`/entradas?partido_id=${partido.id}`} className="w-[85%]">
                        <button className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-3 rounded-none transition-all active:scale-[0.98] shadow-md">
                          CONSEGUÍ TU ENTRADA
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
