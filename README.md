# ARQAP-Frontend

## Instalación y ejecución

1. Instala Volta:
	[https://volta.sh](https://volta.sh)

2. Clona el repositorio y entra a la carpeta:
	```powershell
	git clone <url-del-repo>
	cd ARQAP-Frontend
	```

3. Instala las dependencias usando el lockfile:
	```powershell
	npm ci
	```

4. Para que el front este conectado con el back, en el archivo lib/api.ts agregar tu ip en la variable API_URL
   	```powershell
	const API_URL = //"http://{tu ip}:8080"; 
	```

5. Ejecuta la app:
	```powershell
	npm run web
	```

Esto asegura que todos los desarrolladores usen la misma versión de Node y dependencias, evitando problemas de compatibilidad.

## Tecnologías utilizadas
- React Native
- Expo
- Volta.js (Para gestionar la version de node en la PC de cada desarrollador)