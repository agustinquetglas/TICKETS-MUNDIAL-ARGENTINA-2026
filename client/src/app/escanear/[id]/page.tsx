'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function EscanearPage() {
    const params = useParams();
    const pedidoId = params.id as string;
    
    const [scanned, setScanned] = useState(false);
    const [loadingScan, setLoadingScan] = useState(false);
    
    // Aquí idealmente se podría consultar al backend si el ticket es válido o si ya fue escaneado,
    // pero por ahora lo simularemos.

    const handleScan = (e?: React.MouseEvent | React.TouchEvent) => {
        if (e) e.preventDefault();
        if (loadingScan) return;
        
        setLoadingScan(true);
        // Simulamos un delay de verificación con la base de datos
        setTimeout(() => {
            setLoadingScan(false);
            setScanned(true);
        }, 1500);
    };

    const displayId = pedidoId ? String(pedidoId) : 'Desconocido';
    const shortId = displayId.includes('-') ? displayId.split('-')[0].toUpperCase() : displayId.toUpperCase();

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#000', color: 'white', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1 style={{ marginBottom: '2rem', textAlign: 'center', fontSize: '2rem', fontWeight: 'bold' }}>Simulador de Acceso</h1>
            <p style={{ marginBottom: '3rem', textAlign: 'center', color: '#aaa' }}>Interfaz para el personal de seguridad del estadio</p>
            
            {!scanned ? (
                <div style={{ backgroundColor: '#111', padding: '3rem 2rem', borderRadius: '20px', maxWidth: '400px', width: '100%', textAlign: 'center', border: '1px solid #333' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <p style={{ color: '#888', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Código a verificar:</p>
                        <strong style={{ fontSize: '1.2rem', wordBreak: 'break-all' }}>{displayId}</strong>
                    </div>
                    
                    <button 
                        type="button"
                        onClick={handleScan}
                        onTouchEnd={handleScan}
                        disabled={loadingScan}
                        style={{ 
                            backgroundColor: loadingScan ? '#666' : '#2196F3', 
                            color: 'white', 
                            border: 'none', 
                            padding: '1rem 2rem', 
                            fontSize: '1.2rem', 
                            borderRadius: '10px', 
                            cursor: loadingScan ? 'not-allowed' : 'pointer', 
                            width: '100%',
                            fontWeight: 'bold',
                            transition: 'background-color 0.3s'
                        }}
                    >
                        {loadingScan ? 'Verificando...' : 'Escanear Ticket'}
                    </button>
                </div>
            ) : (
                <div style={{ backgroundColor: '#4CAF50', padding: '3rem 2rem', borderRadius: '20px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 10px 40px rgba(76, 175, 80, 0.3)' }}>
                    <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        backgroundColor: 'white', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        margin: '0 auto 1.5rem auto'
                    }}>
                        <span style={{ color: '#4CAF50', fontSize: '3rem' }}>✓</span>
                    </div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>¡Acceso Permitido!</h2>
                    <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>El ticket es válido y fue registrado correctamente.</p>
                    <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}>
                        <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Reserva autorizada:</p>
                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{shortId}</p>
                    </div>
                    
                    <button 
                        type="button"
                        onClick={() => setScanned(false)}
                        style={{
                            marginTop: '2rem',
                            backgroundColor: 'transparent',
                            border: '2px solid white',
                            color: 'white',
                            padding: '0.8rem 1.5rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Escanear otro
                    </button>
                </div>
            )}
        </div>
    );
}
