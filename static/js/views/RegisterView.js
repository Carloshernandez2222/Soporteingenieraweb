class RegisterView {
    constructor() {
        this.appContent = document.getElementById('app-content');
    }

    render() {
        this.appContent.innerHTML = `
            <div class="support-container" style="text-align: center;">
                <h1 class="support-title" style="text-align: center;">Crear Cuenta</h1>
                <p class="support-subtitle" style="text-align: center;">Regístrate para hacer seguimiento a tus solicitudes.</p>

                <form id="register-form">
                    <div class="form-group">
                        <label for="reg-nombre">Nombre Completo</label>
                        <input type="text" id="reg-nombre" placeholder="Ej: Mateo Sotelo" required>
                    </div>
                    <div class="form-group">
                        <label for="reg-user">Celular o Correo</label>
                        <input type="text" id="reg-user" placeholder="Ej: 300 123 4567" required>
                    </div>
                    <div class="form-group">
                        <label for="reg-pass">Crear Contraseña</label>
                        <input type="password" id="reg-pass" placeholder="Mínimo 6 caracteres" required>
                    </div>

                    <button type="submit" class="btn-submit">Registrarme</button>
                </form>

                <div style="margin-top: 24px;">
                    <span style="color: var(--color-text-muted);">
                        ¿Ya tienes cuenta? <a href="#" id="link-back-login" style="color: var(--color-primary); font-weight: bold;">Inicia Sesión</a>
                    </span>
                </div>
            </div>
        `;
    }
}