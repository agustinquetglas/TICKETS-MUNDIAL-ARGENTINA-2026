export default function UpdatePasswordPage() {
  return (
    <main className="login-main">
      <div className="login-card">
        
        {/* dejo la imagen de la copa en la izquiera */}
        <div className="login-image-container">
          <img 
            src="/logo-login-verde.png" 
            alt="Mundial 2026 Verde" 
            className="login-image" 
          />
        </div>

        {/* formulario para actualizar la contraseña a la derecha */}
        <div className="login-box">
          <h2 className="login-titulo">NUEVA CONTRASEÑA</h2>
          
          <p style={{ textAlign: 'center', marginBottom: '20px', fontSize: '14px', color: '#555' }}>
            Ingresá tu nueva contraseña para acceder a la plataforma.
          </p>

          <form className="form">
            <input 
              type="password" 
              placeholder="Nueva contraseña" 
              className="input" 
              required 
            />
            <input 
              type="password" 
              placeholder="Confirmar nueva contraseña" 
              className="input" 
              required 
            />
            <button type="submit" className="btn-primary">
              ACTUALIZAR CONTRASEÑA
            </button>
            
            <div className="form-links">
              <button type="button" className="btn-link">
                Cancelar y volver al inicio
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}