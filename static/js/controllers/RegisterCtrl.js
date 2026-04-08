class RegisterCtrl {
    constructor(view, apiService) {
        this.view = view;
        this.api = apiService;
    }

    init() {
        this.view.render();
        this.bindEvents();
    }

    bindEvents() {
        const form = document.getElementById('register-form');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = document.getElementById('reg-nombre').value;
            
            // Efecto visual
            const btn = form.querySelector('.btn-submit');
            btn.textContent = "Creando cuenta...";
            btn.style.opacity = "0.7";

            // Navegamos automáticamente al Home simulando éxito
            setTimeout(() => {
                const homeView = new HomeView();
                const homeController = new HomeCtrl(homeView, this.api);
                homeController.init(nombre); // Le pasamos el nombre al Home
            }, 1000);
        });

        // Evento para volver al Login
        document.getElementById('link-back-login').addEventListener('click', (e) => {
            e.preventDefault();
            const loginView = new LoginView();
            const loginController = new LoginCtrl(loginView, this.api);
            loginController.init();
        });
    }
}