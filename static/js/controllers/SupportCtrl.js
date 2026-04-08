class SupportCtrl {
    constructor(view, apiService, userName = "") {
        this.view = view;
        this.api = apiService;
        this.userName = userName; // Recibimos el nombre para devolverlo al Home si cancela
    }

    init() {
        this.view.render();
        // Si ya tenemos el nombre del usuario (del login), lo pre-llenamos por comodidad
        if(this.userName) {
            document.getElementById('sup-nombre').value = this.userName;
        }
        this.bindEvents();
    }

    bindEvents() {
        const form = document.getElementById('support-form');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // IMPORTANTE: Los nombres de estas variables (izquierda) 
            // ahora coinciden EXACTAMENTE con el BaseModel de Python
            const formData = {
                nombre: document.getElementById('sup-nombre').value,
                email: document.getElementById('sup-email').value, 
                descripcion: document.getElementById('sup-desc').value
            };

            const btn = form.querySelector('.btn-submit');
            btn.textContent = "Enviando a FastAPI...";
            btn.style.opacity = "0.7";

            try {
                // Aquí usamos tu ApiService que ya conecta con "/casos/crear"
                await this.api.registrarCaso(formData);
                
                this.view.showAlert('¡Caso enviado exitosamente!', 'success');
                form.style.display = 'none'; // Ocultamos el formulario al terminar

                // Devolvemos al Home automáticamente
                setTimeout(() => {
                    const homeView = new HomeView();
                    const homeController = new HomeCtrl(homeView, this.api);
                    homeController.init(formData.nombre);
                }, 2500);

            } catch (error) {
                this.view.showAlert('Hubo un error al conectar con el servidor.', 'error');
                btn.textContent = "Enviar Reclamo";
                btn.style.opacity = "1";
            }
        });

        // Evento para cancelar y volver al Home con el botón inferior
        document.getElementById('btn-back-home').addEventListener('click', () => {
            const homeView = new HomeView();
            const homeController = new HomeCtrl(homeView, this.api);
            homeController.init(this.userName); // Le devolvemos su nombre al Home
        });

        // ==========================================
        // NUEVO: Controlamos el botón "Inicio" del Header superior
        // ==========================================
        document.getElementById('nav-home').onclick = (e) => {
            e.preventDefault();
            const homeView = new HomeView();
            const homeController = new HomeCtrl(homeView, this.api);
            homeController.init(this.userName); // Lo devolvemos al Dashboard
        };
    }
}