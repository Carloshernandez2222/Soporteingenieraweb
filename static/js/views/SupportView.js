class SupportView {
    constructor() {
        this.appContent = document.getElementById('app-content');
    }

    render() {
        this.appContent.innerHTML = `
            <div class="support-container">
                <h1 class="support-title">Reportar un Problema</h1>
                <p class="support-subtitle">Cuéntanos qué sucedió y te ayudaremos de inmediato.</p>

                <div id="support-alert" class="alert"></div>

                <form id="support-form">
                    <div class="form-group">
                        <label for="sup-nombre">Nombre Completo</label>
                        <input type="text" id="sup-nombre" placeholder="Tu nombre" required>
                    </div>
                    <div class="form-group">
                        <label for="sup-email">Correo o Celular</label>
                        <input type="text" id="sup-email" placeholder="Ej: mateo@correo.com" required>
                    </div>
                    <div class="form-group">
                        <label for="sup-desc">¿Qué sucedió?</label>
                        <textarea id="sup-desc" placeholder="Detalla aquí tu situación..." required></textarea>
                    </div>

                    <button type="submit" class="btn-submit">Enviar Reclamo</button>
                </form>

                <div style="margin-top: 24px; text-align: center;">
                    <button id="btn-back-home" style="background: none; border: none; color: var(--color-primary); font-weight: bold; font-size: 1rem; cursor: pointer;">
                        ← Cancelar y Volver al Inicio
                    </button>
                </div>
            </div>
        `;
    }

    showAlert(message, type) {
        const alertBox = document.getElementById('support-alert');
        alertBox.textContent = message;
        alertBox.className = 'alert ' + (type === 'success' ? 'alert-success' : 'alert-error');
        alertBox.style.display = 'block';
    }
}