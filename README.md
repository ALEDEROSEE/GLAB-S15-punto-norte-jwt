# Punto Norte

Laboratorio 15 de seguridad en comercio electrónico. Punto Norte muestra el historial de pedidos de una cuenta de demostración. Django REST Framework restringe los datos de cada cliente y React gestiona el inicio, la restauración y el cierre de sesión.

## Ejecutar en Windows

Requisitos del entorno: Python 3.12 o posterior y Node.js 22.12 o posterior. Abre dos terminales de PowerShell en la carpeta del proyecto.

En la primera terminal, prepara Django.

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r .\backend\requirements.txt
.\.venv\Scripts\python.exe .\backend\manage.py migrate
.\.venv\Scripts\python.exe .\backend\manage.py crear_demo
.\.venv\Scripts\python.exe .\backend\manage.py runserver 127.0.0.1:8000 --noreload
```

En la segunda terminal, levanta React.

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Abre [Punto Norte](http://127.0.0.1:5173/login). La cuenta sembrada es `cliente.demo` y su contraseña de práctica es `Lab15-Cliente-demo!`. El panel muestra los pedidos ficticios PED-1042 y PED-1051. Si abres [la ruta privada](http://127.0.0.1:5173/tienda) antes de iniciar sesión o después de cerrarla, React muestra el formulario.

## API

| Método y ruta | Entrada | Respuesta esperada |
| --- | --- | --- |
| `GET /api/publico` | Ninguna | `200` y mensaje público |
| `GET /api/privado` | `Authorization: Bearer <access>` | `200` con usuario y pedidos propios, o `401` sin acceso válido |
| `POST /api/token/` | `username`, `password` | `200` con `access` y `refresh`, o `401` por credenciales incorrectas |
| `POST /api/token/refresh/` | `refresh` | `200` con nuevo par, o `401` si la renovación ya no es válida |
| `POST /api/token/logout/` | `refresh` | `200` después de revocar la renovación |

El access dura cinco minutos. El refresh dura una hora desde la última emisión y se reemplaza al renovar. Django rechaza el refresh anterior y devuelve únicamente los pedidos del usuario identificado por el token. React guarda el par en una sola clave en `sessionStorage`, vuelve a validar al recargar y borra la clave al cerrar. El access previamente emitido conserva su vencimiento original.

CORS permite `http://127.0.0.1:5173` y `http://localhost:5173`. Para reproducir en local el ejemplo de CORS abierto de la guía, define `CORS_ALLOW_ALL_ORIGINS=1` antes de arrancar Django con `DEBUG` activo. El frontend acepta `VITE_API_BASE_URL` si necesitas otro host. En desarrollo, Django genera una clave efímera si no recibe `DJANGO_SECRET_KEY`. Reiniciar el servidor con esa clave efímera invalida la sesión anterior.

## Pruebas

```powershell
.\.venv\Scripts\python.exe .\backend\manage.py check
.\.venv\Scripts\python.exe .\backend\manage.py test api -v 2
npm.cmd --prefix frontend run build
npx.cmd --yes newman@6.2.1 run .\postman\GLAB-S15-JWT.postman_collection.json
```

Newman necesita el servidor Django activo. La colección también se puede importar desde [Postman](postman/README.md). El código y la cuenta están preparados para la práctica local con datos ficticios.
