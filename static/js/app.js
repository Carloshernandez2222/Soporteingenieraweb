// Esperamos a que el index.html cargue completamente
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Instanciamos los servicios globales
    const apiService = new ApiService();
    
    // 2. Instanciamos la Vista y el Controlador del LOGIN
    const loginView = new LoginView();
    const loginController = new LoginCtrl(loginView, apiService);
    
    // 3. Arrancamos la aplicación mostrando el Login por defecto
    loginController.init();
});