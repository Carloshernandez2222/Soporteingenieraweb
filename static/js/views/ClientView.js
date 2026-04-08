// La Clase ClientView se encarga EXCLUSIVAMENTE de dibujar la pantalla y mostrar mensajes.
class ClientView {
    constructor() {
        // Buscamos el div vacío que dejamos en el index.html
        this.appContainer = document.getElementById('app-container');
    }

    // Método principal: Pinta el formulario en la pantalla
    renderSupportForm() {
        // Inyectamos el HTML directamente en el DOM
        this.appContainer.innerHTML = `
            <div class="support-container">
                <h1 class="support-title">Centro de Soporte</h1>
                <p class="support-subtitle">¿Tuviste un problema con tu pedido? Cuéntanos y lo solucionamos rápido.</p>

                <div id="alert-box" class="alert"></div>

                <form id="support-form">
                    
                    <div class="form-group">
                        <label for="cliente-nombre">Nombre Completo</label>
                        <input type="text" id="cliente-nombre" placeholder="Ej: Mateo Sotelo" required>
                    </div>

                    <div class="form-group">
                        <label for="cliente-telefono">Número de Celular</label>
                        <input type="tel" id="cliente-telefono" placeholder="Ej: 300 123 4567" required>
                    </div>

                    <div class="form-group">
                        <label for="cliente-problema">¿Qué sucedió?</label>
                        <textarea id="cliente-problema" placeholder="Ej: Mi pedido llegó incompleto o dañado..." required></textarea>
                    </div>

                    <button type="submit" class="btn-submit">Enviar Reclamo</button>
                </form>
            </div>
        `;
    }

    // Método auxiliar: Muestra un mensaje en pantalla (éxito o error)
    showAlert(message, type) {
        const alertBox = document.getElementById('alert-box');
        alertBox.textContent = message;
        
        // Limpiamos clases previas
        alertBox.className = 'alert'; 
        
        if (type === 'success') {
            alertBox.classList.add('alert-success');
            // Ocultamos el formulario para calmar la ansiedad del usuario
            document.getElementById('support-form').style.display = 'none';
        } else {
            alertBox.classList.add('alert-error');
        }
        
        // Hacemos visible la caja
        alertBox.style.display = 'block';
    }
}