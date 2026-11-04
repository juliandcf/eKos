# eKos 🎙️✨

**Teleprónter y Karaoke Interactivo en Tiempo Real con Detección Palabra por Palabra.**

**eKos** es una aplicación web de teleprónter y karaoke que sigue en tiempo real lo que una persona va cantando o hablando por el micrófono, palabra por palabra, con cero latencia y de forma 100% gratuita (sin APIs de pago ni servidores externos, ejecutándose de forma nativa en el navegador del cliente).

---

## 🌟 Características Principales

- **Seguimiento Palabra por Palabra (< 150 ms):** Resalta la palabra exacta en el milisegundo en que se pronuncia.
- **Auto-Scroll Suave y Centrado:** La palabra activa ejecuta `scrollIntoView({ behavior: 'smooth', block: 'center' })` para mantener siempre el foco en el centro vertical de la pantalla.
- **Ventana Deslizante Lookahead (3–4 palabras):** Si el cantante se salta un artículo o el micrófono no capta una sílaba, el motor salta limpiamente hacia adelante marcando las intermedias como leídas. **El teleprónter nunca se queda trabado**.
- **Tolerancia Fonética & Fuzzy Matching:**
  - Normalización NFD para descartar tildes y signos ortográficos.
  - Asimilación fonética del español: equivalencia entre *b* y *v*, seseo (*c/z/s*), yeísmo (*y/ll*) y haches mudas.
  - Tolerancia de distancia de edición (Levenshtein) para admitir vibratos o ligeras variaciones al cantar.
- **Puntero Lineal Monótono:** El cursor avanza estrictamente de izquierda a derecha sin retrocesos erráticos, gestionando repeticiones continuas con total precisión (ej. *"más, más, más"*).
- **Web Audio API & Visualizador Reactivo:** Analizador en tiempo real con Canvas de 64 bandas de frecuencia y medidor de nivel RMS.
- **Reconexión Automática Transparente:** Manejo del evento `onend` de `SpeechRecognition` para reiniciar la escucha ante silencios momentáneos sin cortar la sesión.
- **Biblioteca de Letras & Pegado Personalizado:**
  - Incluye éxitos y textos preparados (*Bésame Mucho*, *Despacito*, *La Bamba*, *Cielito Lindo*, *Bohemian Rhapsody*, discursos y clásicos).
  - Modal para pegar cualquier letra o guion propio con conteo de palabras automático.
- **Modo Ensayo / Simulación:** Permite ensayar y ver el karaoke desplazarse automáticamente según el tempo (BPM) sin necesidad de hablar por el micrófono.
- **Controles de Accesibilidad:** Regulador de tamaño de fuente (22px a 48px), selector de idioma (Español España, México, Colombia, EE.UU., Inglés) y atajos de teclado.

---

## 🚀 Publicar en GitHub Pages

Este proyecto ya cuenta con el flujo de automatización configurado en `.github/workflows/deploy.yml` y las rutas relativas preparadas en `vite.config.ts` (`base: './'`).

### Pasos para publicar:

1. **Subir los cambios a tu repositorio de GitHub:**
   ```bash
   git add .
   git commit -m "feat: eKos teleprompter and karaoke setup for GitHub Pages"
   git push origin main
   ```
   *(o `git push origin master` según el nombre de tu rama principal)*.

2. **Habilitar GitHub Pages en el repositorio:**
   - Ve a tu repositorio en GitHub.
   - Entra en **Settings** (Configuración) > **Pages** (en el menú lateral izquierdo).
   - En la sección **Build and deployment** > **Source**, selecciona **GitHub Actions**.

3. **¡Listo!**
   - GitHub ejecutará automáticamente el workflow y publicará tu aplicación en:
   ```text
   https://<tu-usuario>.github.io/<tu-repositorio>/
   ```

---

## 💻 Ejecución Local

Si deseas probar o modificar el proyecto en tu máquina local:

```bash
# 1. Clonar el repositorio
git clone https://github.com/<tu-usuario>/<tu-repositorio>.git
cd <tu-repositorio>

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Compilar para producción
npm run build
```

---

## ⌨️ Atajos de Teclado

| Tecla | Acción |
| :--- | :--- |
| `Espacio` | Avanzar una palabra manual / Pausar modo ensayo |
| `M` | Activar / Pausar micrófono |
| `R` | Reiniciar el teleprónter al principio |
| `Flecha Derecha` | Avanzar palabra |
| `Flecha Izquierda` | Retroceder palabra |
| `Clic en palabra` | Saltar inmediatamente el cursor a esa palabra |

---

## 🛠️ Tecnologías Utilizadas

- **React 19 & TypeScript**
- **Vite 8**
- **Tailwind CSS v4**
- **Web Speech API** (`SpeechRecognition` / `webkitSpeechRecognition`)
- **Web Audio API** (`AudioContext`, `createMediaStreamSource`, `AnalyserNode`)
- **Lucide React** (Iconografía)

---

## 🌐 Compatibilidad de Navegadores

La **Web Speech API** nativa está soportada de forma nativa en:
- Google Chrome (Escritorio y Android)
- Microsoft Edge
- Apple Safari (macOS e iOS 14.5+)
- Opera y navegadores basados en Chromium

> **Nota:** Para que el reconocimiento por voz funcione correctamente, la página debe servirse bajo protocolo seguro `https://` (GitHub Pages ya incluye SSL automático) y el usuario debe autorizar el permiso del micrófono al hacer clic en **"Activar Micrófono"**. Para navegadores o situaciones sin micrófono, se incluye el **Modo Ensayo**.

---

Desarrollado con ❤️ y cero dependencias de pago.
