class ClientCtrl {
    constructor(view, apiService) {
        this.view = view;
        this.api = apiService;
    }

    // Arranca el controlador
    init() {
        // 1. Le decimos a la vista que dibuje el formulario
        this.view.renderSupportForm();
        
        // 2. Escuchamos cuando el usuario haga clic en "Enviar"
        this.bindEvents();
    }

    bindEvents() {
        const form = document.getElementById('support-form');
        form.addEventListener('submit', async (evento) => {
            evento.preventDefault(); // Evita que la página recargue

            // Recolectamos los datos de las cajas de texto (inputs)
            const formData = {
                nombre: document.getElementById('cliente-nombre').value,
                telefono: document.getElementById('cliente-telefono').value,
                descripcion: document.getElementById('cliente-problema').value
            };

            try {
                // Le pasamos los datos al Modelo (API)
                await this.api.registrarCaso(formData);
                
                // Si todo sale bien, la Vista muestra el éxito (cumpliendo nuestro diseño UX)
                this.view.showAlert('¡Tu caso fue recibido exitosamente! Nos contactaremos pronto.', 'success');
            } catch (error) {
                // Si falla, la Vista muestra el error
                this.view.showAlert('Hubo un problema al enviar tu caso. Por favor, intenta de nuevo.', 'error');
            }
        });
    }
}