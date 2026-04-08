class LoginView {
    constructor() {
        // Buscamos el contenedor dinámico que pusimos en el index.html
        this.appContent = document.getElementById('app-content');
    }

    // Dibuja la pantalla de login
    render() {
        this.appContent.innerHTML = `
            <div class="support-container" style="text-align: center;">
                <h1 class="support-title" style="text-align: center;">Iniciar Sesión</h1>
                <p class="support-subtitle" style="text-align: center;">Accede para gestionar tus casos de soporte.</p>

                <div id="login-alert" class="alert"></div>

                <form id="login-form">
                    <div class="form-group">
                        <label for="login-user">Celular o Correo</label>
                        <input type="text" id="login-user" placeholder="Ej: 300 123 4567" required>
                    </div>

                    <div class="form-group">
                        <label for="login-pass">Contraseña</label>
                        <input type="password" id="login-pass" placeholder="Tu contraseña" required>
                    </div>

                    <button type="submit" class="btn-submit">Ingresar</button>
                </form>

                <div style="margin-top: 24px; display: flex; flex-direction: column; gap: 12px;">
                    <a href="#" id="link-forgot" style="color: var(--color-primary); font-weight: bold;">¿Olvidaste tu contraseña?</a>
                    <span style="color: var(--color-text-muted);">
                        ¿No tienes cuenta? <a href="#" id="link-register" style="color: var(--color-primary); font-weight: bold;">Regístrate</a>
                    </span>
                </div>
            </div>
        `;
    }

    // Muestra errores si las credenciales fallan
    showError(message) {
        const alertBox = document.getElementById('login-alert');
        alertBox.textContent = message;
        alertBox.className = 'alert alert-error'; // Usa la clase roja de tu variables.css
        alertBox.style.display = 'block';
    }
}