#!/bin/bash

# echo "Activando entorno virtual..."
# source venv/bin/activate

echo "Limpiando carpeta complementarios/cache..."
CACHE_DIR="./complementarios/cache"
if [ -d "$CACHE_DIR" ]; then
    rm -rf "$CACHE_DIR"/*
    echo "Contenido de $CACHE_DIR eliminado."
else
    echo "La carpeta $CACHE_DIR no existe."
fi

echo "Eliminando carpetas de migrations..."
for app in auth area categoria modulo rol permiso usuario formulario construccion_formulario respuesta; do
    rm -rf apps/$app/migrations
    mkdir apps/$app/migrations
    touch apps/$app/migrations/__init__.py
    echo "Eliminada y creada migrations para $app"
done

echo "Ejecutando makemigrations para cada app..."
python3 manage.py makemigrations auth
python3 manage.py makemigrations area
python3 manage.py makemigrations categoria
python3 manage.py makemigrations modulo
python3 manage.py makemigrations formulario
python3 manage.py makemigrations construccion_formulario
python3 manage.py makemigrations respuesta
python3 manage.py makemigrations rol
python3 manage.py makemigrations permiso
python3 manage.py makemigrations usuario

echo "Ejecutando migrate..."
python3 manage.py migrate

echo "Cargando datos iniciales..."

python3 manage.py loaddata fixtures/permiso.json
python3 manage.py loaddata fixtures/rol.json
python3 manage.py loaddata fixtures/usuario.json
python3 manage.py loaddata fixtures/area.json
python3 manage.py loaddata fixtures/categoria.json
python3 manage.py loaddata fixtures/modulo.json
python3 manage.py loaddata fixtures/tipos_de_dato.json

# echo "Desactivando entorno virtual..."
# deactivate

echo "ESETEADO CON ÉXITO"
