class HomeCtrl {
    constructor(view) {
        this.view = view;
    }

    // Inicializa la pantalla recibiendo el nombre del usuario
    init(userName) {
        this.view.render(userName);
        this.bindEvents();
    }

    bindEvents() {
        // Escucha el botón de crear caso
        document.getElementById('btn-new-case').addEventListener('click', () => {
            alert("¡Simulación: Navegando a la pantalla de Crear Caso!");
            // Aquí llamaremos al ClientCtrl que creamos al principio
        });

        // Escucha el botón del chatbot
        document.getElementById('btn-chat').addEventListener('click', () => {
            alert("¡Simulación: Abriendo ventana del Chatbot!");
            // Aquí abriremos el componente del chat
        });
    }
}