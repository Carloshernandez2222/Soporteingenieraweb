class ServicioSoporte:
    def __init__(self):
        # Obtenemos la ruta absoluta de la carpeta raíz de tu proyecto
        base_dir = os.getcwd() 
        
        # Obligamos a que el archivo soporte.db se cree en la raíz
        self.db_path = os.path.join(base_dir, "soporte.db")
        
        # Conectamos
        conn = sqlite3.connect(self.db_path)
        # ... (deja el resto de tu código de creación de tablas igual)