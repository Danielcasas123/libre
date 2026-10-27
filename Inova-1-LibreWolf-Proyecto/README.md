# Inova 1 + LibreWolf para Windows

Aplicación de escritorio Electron con interfaz oscura y una barra de búsqueda que abre búsquedas y accesos web en **LibreWolf real**.

## Cómo está organizado

- `src/`: interfaz inicial oscura, lógica de escritorio y puente seguro IPC.
- `.github/workflows/build-windows.yml`: descarga el paquete portable oficial de LibreWolf durante la compilación, comprueba que exista `librewolf.exe` y lo empaqueta en el instalador NSIS.
- `package.json`: configuración Electron Builder para crear `Inova-1-Setup-1.0.0.exe`.

## Crear el instalador en GitHub Actions

1. Crea un repositorio de GitHub y sube el contenido de esta carpeta a la raíz (incluida la carpeta oculta `.github`).
2. Abre la pestaña **Actions** y habilita los flujos si GitHub lo solicita.
3. Ejecuta **Build Inova 1 for Windows** con **Run workflow**, o haz un `push` a `main`/`master`.
4. Espera a que el flujo termine. El paso de descarga debe mostrar la versión/tag de LibreWolf y el paso final debe confirmar el instalador.
5. En la página de la ejecución, descarga el artefacto **Inova-1-Windows-Installer**. Dentro estará el `.exe`.

La primera compilación necesita conexión a internet para descargar dependencias de npm y el paquete oficial de LibreWolf. El instalador incluye los archivos del navegador y no requiere instalar LibreWolf por separado.

## Desarrollo local

Para ejecutar la interfaz sin el navegador empaquetado: `npm install` y `npm start`. Las búsquedas de navegador no funcionarán hasta que se descargue LibreWolf en `resources/librewolf/`. El flujo de GitHub Actions se encarga de ese paso automáticamente.

## Limitaciones y comprobación

Este ZIP contiene el **código fuente y el flujo de compilación**, no los aproximadamente cientos de MB de binarios de LibreWolf. La acción descarga el paquete real desde la publicación de LibreWolf al compilar. No se afirma que el instalador ya haya sido generado o probado en Windows: eso solo puede confirmarse después de ejecutar correctamente el flujo de GitHub Actions.

## Si falla la descarga del navegador

El flujo falla deliberadamente si la API oficial no devuelve el paquete portable x86_64, el archivo parece incompleto o no aparece `librewolf.exe`. Así no produce silenciosamente un instalador que parezca completo pero no incluya el navegador.
