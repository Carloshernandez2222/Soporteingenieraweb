class HomeView {
    constructor() {
        this.appContent = document.getElementById('app-content');
    }

    // Recibimos el nombre del usuario para personalizar el saludo
    render(userName) {
        this.appContent.innerHTML = `
            <div class="support-container">
                <h1 class="support-title">Hola, ${userName}</h1>
                <p class="support-subtitle">¿En qué te podemos ayudar el día de hoy?</p>

                <button id="btn-new-case" class="btn-submit" style="margin-bottom: var(--spacing-lg); font-size: 1.2rem;">
                    📝 Reportar un Problema
                </button>

                <hr style="border: 0; border-top: 1px solid var(--border-color); margin: var(--spacing-lg) 0;">

                <div style="background-color: var(--color-background); padding: var(--spacing-lg); border-radius: var(--border-radius); border: 2px solid var(--border-color);">
                    <h2 style="font-size: 1.3rem; margin-bottom: var(--spacing-sm);">🤖 Asistente Virtual 24/7</h2>
                    <p style="color: var(--color-text-muted); margin-bottom: var(--spacing-md);">
                        Respuestas inmediatas sobre tu pedido, envíos y devoluciones.
                    </p>
                    <button id="btn-chat" class="btn-submit" style="background-color: var(--color-text-main); height: 50px;">
                        Iniciar Chat
                    </button>
                </div>
            </div>
        `;
        
        // Cambiamos el header para mostrar que ya estamos logueados
        document.getElementById('nav-login').classList.add('hidden');
        document.getElementById('nav-register').classList.add('hidden');
        document.getElementById('nav-home').classList.remove('hidden');
    }
}