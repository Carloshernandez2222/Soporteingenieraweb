#!/bin/bash 

# Script de inicio para FastAPI en Azure App Service 
# Asegura que Python busque módulos en el directorio actual
export PYTHONPATH=$PYTHONPATH:.

# El puerto lo asigna Azure automáticamente 
PORT=${PORT:-8000} 

echo "==========================================" 
echo "🚀 Iniciando FastAPI en el puerto $PORT" 
echo "📁 Archivo principal: conection.py" 
echo "🔧 Instancia de FastAPI: test" 
echo "==========================================" 

# Iniciar la aplicación con Gunicorn 
# Apuntamos a 'conection:test'
gunicorn -w 4 -k uvicorn.workers.UvicornWorker conection:test --bind 0.0.0.0:$PORT