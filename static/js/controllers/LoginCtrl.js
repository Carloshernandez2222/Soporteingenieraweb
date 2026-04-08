class LoginCtrl {
    constructor(view, apiService) {
        this.view = view;
        this.api = apiService;
    }

    init() {
        this.view.render();
        this.bindEvents();
    }

    bindEvents() {
        const form = document.getElementById('login-form');
        
        form.addEventListener('submit', async (evento) => {
            evento.preventDefault();

            const user = document.getElementById('login-user').value;
            const pass = document.getElementById('login-pass').value;

            if (user === "" || pass === "") {
                this.view.showError("Por favor, completa todos los campos.");
                return;
            }

            const btn = form.querySelector('.btn-submit');
            btn.textContent = "Cargando...";
            btn.style.opacity = "0.7";
            
            setTimeout(() => {
                const homeView = new HomeView();
                // AQUÍ PASAMOS LA API AL HOME
                const homeController = new HomeCtrl(homeView, this.api); 
                homeController.init(user);
            }, 1000); 
        });

        document.getElementById('link-register').addEventListener('click', (e) => {
            e.preventDefault();
            const registerView = new RegisterView();
            const registerController = new RegisterCtrl(registerView, this.api);
            registerController.init();
        });

        document.getElementById('link-forgot').addEventListener('click', (e) => {
            e.preventDefault();
            const forgotView = new ForgotView();
            const forgotController = new ForgotCtrl(forgotView, this.api);
            forgotController.init();
        });
    }
}