#!/bin/bash

# echo "🚀 Activando entorno virtual..."
# source venv/bin/activate

echo "🧹 Eliminando carpetas de migrations..."
for app in auth area modulo rol permiso usuario formulario; do
    rm -rf apps/$app/migrations
    mkdir apps/$app/migrations
    touch apps/$app/migrations/__init__.py
    echo "✅ Eliminada y creada migrations para $app"
done

echo "🛠️ Ejecutando makemigrations para cada app..."
python3 manage.py makemigrations auth
python3 manage.py makemigrations area
python3 manage.py makemigrations modulo
python3 manage.py makemigrations rol
python3 manage.py makemigrations permiso
python3 manage.py makemigrations usuario
python3 manage.py makemigrations formulario

echo "📦 Ejecutando migrate..."
python3 manage.py migrate

echo "📥 Cargando datos iniciales..."
python3 manage.py loaddata fixtures/*

# echo "🛑 Desactivando entorno virtual..."
# deactivate

echo "✅ Reset completo!"
