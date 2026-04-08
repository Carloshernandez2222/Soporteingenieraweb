class ForgotView {
    constructor() {
        this.appContent = document.getElementById('app-content');
    }

    render() {
        this.appContent.innerHTML = `
            <div class="support-container" style="text-align: center;">
                <h1 class="support-title" style="text-align: center;">Recuperar Contraseña</h1>
                <p class="support-subtitle" style="text-align: center;">Ingresa tu celular o correo y te enviaremos un código temporal para ingresar.</p>
                
                <div id="forgot-alert" class="alert"></div>

                <form id="forgot-form">
                    <div class="form-group">
                        <label for="forgot-user">Celular o Correo</label>
                        <input type="text" id="forgot-user" placeholder="Ej: 300 123 4567" required>
                    </div>

                    <button type="submit" class="btn-submit">Enviar Código</button>
                </form>

                <div style="margin-top: 24px;">
                    <a href="#" id="link-back-login" style="color: var(--color-primary); font-weight: bold;">← Volver al Inicio de Sesión</a>
                </div>
            </div>
        `;
    }

    showSuccess(message) {
        const alertBox = document.getElementById('forgot-alert');
        alertBox.textContent = message;
        alertBox.className = 'alert alert-success';
        alertBox.style.display = 'block';
    }
}