class LoginCtrl {
    constructor(view, apiService) {
        this.view = view;
        this.api = apiService;
    }

    // Inicializa la pantalla
    init() {
        this.view.render();
        this.bindEvents();
    }

    // Escucha las interacciones del usuario
    bindEvents() {
        const form = document.getElementById('login-form');
        
        form.addEventListener('submit', async (evento) => {
            evento.preventDefault();

            const user = document.getElementById('login-user').value;
            const pass = document.getElementById('login-pass').value;

            // Simulación de Login 
            if (user === "" || pass === "") {
                this.view.showError("Por favor, completa todos los campos.");
                return;
            }

            console.log("Login exitoso para:", user);
            
            // Efecto visual de carga
            const btn = form.querySelector('.btn-submit');
            btn.textContent = "Cargando...";
            btn.style.opacity = "0.7";
            
            // ==========================================
            // AQUÍ ESTÁ EL CAMBIO: LA NAVEGACIÓN REAL
            // ==========================================
            setTimeout(() => {
                // 1. Instanciamos la vista y controlador del Home
                const homeView = new HomeView();
                const homeController = new HomeCtrl(homeView);
                
                // 2. Arrancamos el Home pasándole el nombre del usuario
                // Esto borrará el Login de la pantalla y dibujará el Home
                homeController.init(user);
                
            }, 1000); 
            // ==========================================
        });

        // Escuchar clics en los enlaces (Por ahora los dejamos simulados hasta hacer las otras pantallas)
        document.getElementById('link-register').addEventListener('click', (e) => {
            e.preventDefault();
            alert("Simulación: Navegando a pantalla de Registro");
        });
    }
}