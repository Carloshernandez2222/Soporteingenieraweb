class ApiService {
    constructor() {
        // Asumimos que FastAPI corre en el mismo dominio
        this.baseUrl = window.location.origin; 
    }

    // Método para enviar el caso al backend
    async registrarCaso(datosSoporte) {
        try {
            // Llama al endpoint que tienes definido en conection.py
            const response = await fetch(`${this.baseUrl}/casos/crear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosSoporte)
            });

            if (!response.ok) {
                throw new Error('Error al comunicar con el servidor');
            }

            return await response.json();
        } catch (error) {
            console.error("Error en la API:", error);
            throw error;
        }
    }
}