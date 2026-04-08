class HomeCtrl {
    // AHORA RECIBE LA API
    constructor(view, apiService) {
        this.view = view;
        this.api = apiService;
        this.userName = ""; 
    }

    init(userName) {
        this.userName = userName; // Guardamos el nombre
        this.view.render(userName);
        this.bindEvents();
    }

    bindEvents() {
        // Escucha el botón de crear caso (Solo usamos el nuevo SupportCtrl)
        document.getElementById('btn-new-case').addEventListener('click', () => {
            const supportView = new SupportView();
            const supportController = new SupportCtrl(supportView, this.api, this.userName); 
            supportController.init();
        });

        // Escucha el botón del chatbot
        document.getElementById('btn-chat').addEventListener('click', () => {
            alert("¡Pronto conectaremos el asistente virtual aquí!");
        });

        // ==========================================
        // NUEVO: Controlamos el botón "Inicio" del Header
        // ==========================================
        document.getElementById('nav-home').onclick = (e) => {
            e.preventDefault(); // Evita que la página salte hacia arriba
            console.log("Ya estás en el Inicio");
        };
    }
}