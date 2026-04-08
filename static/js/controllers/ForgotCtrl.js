class ForgotCtrl {
    constructor(view, apiService) {
        this.view = view;
        this.api = apiService;
    }

    init() {
        this.view.render();
        this.bindEvents();
    }

    bindEvents() {
        const form = document.getElementById('forgot-form');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Efecto visual
            const btn = form.querySelector('.btn-submit');
            btn.textContent = "Enviando código...";
            btn.style.opacity = "0.7";

            // Simulamos el envío del SMS/Correo
            setTimeout(() => {
                this.view.showSuccess("¡Código enviado! Revisa tu celular o correo.");
                btn.textContent = "Código Enviado";
                btn.disabled = true;

                // Después de 3 segundos, lo devolvemos al login
                setTimeout(() => {
                    const loginView = new LoginView();
                    const loginController = new LoginCtrl(loginView, this.api);
                    loginController.init();
                }, 3000);
            }, 1000);
        });

        // Evento para volver manualmente
        document.getElementById('link-back-login').addEventListener('click', (e) => {
            e.preventDefault();
            const loginView = new LoginView();
            const loginController = new LoginCtrl(loginView, this.api);
            loginController.init();
        });
    }
}