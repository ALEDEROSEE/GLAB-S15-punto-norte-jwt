# Validación de la API con Postman

1. Levanta Django en `http://127.0.0.1:8000` y crea la cuenta de demostración según el README del proyecto.
2. En Postman de escritorio, elige **Import** y abre `GLAB-S15-JWT.postman_collection.json`.
3. En **Variables** puedes cambiar `baseUrl`, `username`, `password` y `frontendOrigin`. La clave precargada corresponde a la cuenta de demostración local.
4. Abre **Run collection**, selecciona las solicitudes en el orden original y ejecuta una iteración local. Los scripts reutilizan el par de tokens durante el flujo y limpian las variables de sesión al terminar.

En PowerShell también puedes usar Newman, el ejecutor oficial de colecciones Postman para la terminal. Ejecuta este comando desde `lab15`.

```powershell
npx.cmd --yes newman@6.2.1 run .\postman\GLAB-S15-JWT.postman_collection.json
```

| Operación | Resultado esperado |
| --- | --- |
| Consultar la ruta pública sin credenciales | `200` con el mensaje de acceso público |
| Consultar la ruta privada sin Bearer | `401` |
| Enviar una clave incorrecta al inicio de sesión | `401` sin tokens |
| Iniciar sesión con la cuenta de demo | `200` con `access` y `refresh` |
| Consultar la ruta privada con Bearer | `200` con el usuario y sus pedidos de demo |
| Renovar la sesión | `200` con otro par de tokens |
| Cerrar la sesión | `200`, refresh añadido a la lista de bloqueo |
| Intentar renovar el refresh después del cierre | `401` sin un nuevo `access` |
| Consultar la ruta privada otra vez sin Bearer | `401` |
| Comprobar el preflight del origen de React | `200` con CORS y permiso para `Authorization` |

El cierre limpia los tokens en React e invalida el `refresh` en Django. Un `access` emitido previamente conserva su vencimiento original.

[Ejecutar una colección con Newman](https://learning.postman.com/docs/collections/using-newman-cli/installing-running-newman)
