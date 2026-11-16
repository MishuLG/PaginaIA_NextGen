# NextGen // Arquitectura de Agentes & Tokenomics de Nueva Generación

Plataforma web interactiva e informativa de alto impacto visual diseñada bajo estándares de ingeniería de software moderna para educar sobre el uso eficiente, seguro y escalable de la Inteligencia Artificial en el co-desarrollo de sistemas.

---

## 🚀 Inicio Rápido

### Opción A: Ejecutar con `json-server` (Recomendada con Node.js / npx)

Para iniciar la base de datos mock REST en el puerto `3000`:
```bash
npx json-server --watch db.json --port 3000
```
> **Endpoints disponibles:**
> - `GET /users` - Listado y validación de usuarios
> - `GET /comments` - Listado de aportes de la comunidad
> - `POST /comments` - Publicación de nuevos comentarios
> - `PATCH /comments/:id` - Actualización de likes y reacciones

### Opción B: Ejecutar con Servidor Python Zero-Dependency (Sin instalación de Node)

Si no dispones de Node.js instalado o prefieres un backend nativo en Python 3:
```bash
python server/mock_api.py
```
*Este servidor emula de forma idéntica los endpoints REST de `json-server` con soporte completo de CORS y persistencia directa en `db.json`.*

### Opción C: Modo Resiliente / Standalone (Doble Clic Directo)
Si abres `index.html` directamente en tu navegador sin ningún servidor activo, el motor de contingencia de NextGen activará automáticamente el **Modo Local Resiliente**, sembrando la sesión y los comentarios a partir de los datos iniciales de `db.json` mediante `localStorage` para que **nada falle** durante tu evaluación visual.

---

## 🔐 Credenciales Demo de Prueba

Para probar el flujo de autenticación y publicación como usuario autenticado en 1 clic (o mediante formulario):

| Usuario | Correo Electrónico | Contraseña | Rol / Especialidad |
| :--- | :--- | :--- | :--- |
| **Elena Rostova** | `elena.arch@nextgen.ai` | `NextGen2026!` | *Senior AI Systems Architect* (MCP & Swarms) |
| **Marcus Vance** | `marcus.token@nextgen.ai` | `NextGen2026!` | *Lead Tokenomics Engineer* (AST Pruning) |
| **Sofia Chen** | `sofia.dev@nextgen.ai` | `NextGen2026!` | *Staff Full-Stack Dev* (Zero-Leak & Schemas) |

---

## 🏛️ Arquitectura Técnica y Módulos

```
pagina IA/
│
├── index.html              # Layout semántico HTML5, Viewports Sticky y Accesibilidad
├── db.json                 # Base de datos mock inicial con usuarios y comentarios técnicos
├── package.json            # Metadatos del proyecto y scripts de inicio
├── README.md               # Especificación técnica, guía de inicio y arquitectura
│
├── css/
│   ├── styles.css          # Sistema de diseño Apple Dark Studio, Glassmorphism, HiDPI
│   └── animations.css      # Keyframes cinemáticos, efectos de radar y pulsos lumínicos
│
├── js/
│   ├── app.js              # Coordinador de ciclo de vida y sistema global de Notificaciones Toast
│   ├── security.js         # Sanitizador estricto contra XSS, validador RFC 5322 y Zero-Leak DLP
│   ├── scroll-engine.js    # Sincronización a 60fps de Lenis Smooth Scroll y GSAP ScrollTrigger
│   ├── frame-generator.js  # Generador matemático/vectorial de 80 fotogramas para el Canvas 2D
│   ├── canvas-scroller.js  # Apple-Style Scrubbing con soporte Retina HiDPI y Cover/Contain dinámico
│   ├── animations.js       # Coreografías GSAP, staggers, parallax de profundidad y clip-paths
│   ├── auth.js             # Autenticación segura REST/Local con hash SHA-256 (sin contraseñas planas)
│   ├── comments.js         # CRUD de comentarios con sanitización XSS, likes y tags temáticos
│   └── telemetry.js        # HUD de telemetría en vivo, simulador tokenómico y laboratorio DLP
│
└── server/
    └── mock_api.py         # Servidor REST Python con CORS para emular json-server
```

---

## 🧠 Núcleo de Contenido Educativo ("NextGen")

### 1. Principios de AI Tokenomics
- **Estratificación de Contexto (Context Tiering)**: División de la memoria del modelo en **L1** (Invariantes del sistema y reglas de negocio), **L2** (Esquemas AST dinámicos e interfaces tipadas bajo demanda) y **L3** (Memoria de trabajo y RAG volátil).
- **Arquitectura "Fetch-Once / Process Locally"**: Desacoplamiento de la resolución de dependencias del modelo de lenguaje. Procesamiento local mediante linters y parsers estáticos, transmitiendo únicamente grafos de impacto semántico.
- **Esquemas Contratados (Contract-Driven Schemas)**: Empleo de gramáticas BNF forzadas a nivel de decodificador y validadores en tiempo de ejecución (Zod / Pydantic) para erradicar el desperdicio de tokens y las alucinaciones conversacionales.
- **Fallback Chains**: Estrategias de degradación y enrutamiento inteligente entre modelos ultraligeros de 8B (Flash) para tareas repetitivas y modelos de razonamiento profundo para refactorizaciones complejas.

### 2. Gestión de Ventana de Contexto
- **T-Zero AST Pruner**: Poda determinista de declaraciones muertas, comentarios superfluos e implementaciones privadas no exportadas, logrando una reducción del **-94.4% de tokens**.
- **Mitigación del Efecto "Time-Warp"**: Corrección del aplanamiento cronológico que sufren los LLMs en conversaciones extensas mediante *snapshots* inmutables y registros cronológicos de mutación (WAL).
- **Prevención de "Ghost Reverts"**: Detección y bloqueo automático de colisiones de código mediante hashes SHA-256 por bloque y diffs unificados idempotentes con guardias de concurrencia optimista.

### 3. Orquestación de Agentes y Protocolo MCP
- **Model Context Protocol (MCP)**: Estandarización de herramientas autónomas mediante canales JSON-RPC sobre stdio y SSE.
- **Escaneo Zero-Leak (DLP)**: Interceptación perimetral y ofuscación en tiempo real de claves secretas (`sk-`, JWT, credenciales de base de datos) antes de ser enviadas a redes de inferencia externas.
- **Telemetría en Tiempo Real**: Monitorización continua de tasas de quema de tokens, latencia de herramientas y *health checks* de agentes.

---

## 🍏 Arquitectura Visual Estilo Apple

1. **Scroll Inercial Ultra-Suave (Lenis)**:
   - Configurado con `autoRaf: false` para desacoplar el bucle nativo y ceder el control completo al reloj de alta precisión de GSAP.
   ```javascript
   lenis.on('scroll', ScrollTrigger.update);
   gsap.ticker.add((time) => lenis.raf(time * 1000));
   gsap.ticker.lagSmoothing(0);
   ```

2. **Apple-Style Scrubbing Canvas 2D**:
   - Contenedor con altura de scroll pinning (`350vh`) y un viewport estricto `sticky: top: 0; height: 100vh;`.
   - 80 fotogramas matemáticos y vectoriales pre-renderizados mediante `OffscreenCanvas` y cargados como `createImageBitmap()` para garantizar 60 FPS sin tirones ni caídas de frame.
   - Buffer HiDPI con escalado por `Math.min(window.devicePixelRatio, 2)` para pantallas Retina 4K/5K.
   - Algoritmo matemático dinámico de ajuste tipo `cover` / `contain` que recalcula dinámicamente las coordenadas y dimensiones en cualquier cambio de ventana (*resize*).

3. **Accesibilidad y Movimiento Reducido (`prefers-reduced-motion`)**:
   - Detección automática en tiempo de ejecución.
   - En caso de preferencia activa, se desactiva el scroll inercial, el Canvas se fija en el fotograma estático clave número 45, se añade el atributo `aria-hidden="true"` y se despliega una tarjeta accesible para lectores de pantalla.

---

## 🛡️ Seguridad y Persistencia

- **Sanitización Estricta contra XSS**: Filtrado de etiquetas maliciosas, atributos `on*`, protocolos `javascript:` y normalización de entidades HTML tanto en el cliente como previo a la persistencia.
- **Protección contra Inyecciones**: Validación de longitud, formatos estrictos RFC 5322 para correos y control de complejidad de contraseñas.
- **Persistencia Segura**: No se almacenan contraseñas en texto plano. Las credenciales se contrastan mediante hashes criptográficos SHA-256 antes de emitir tokens de sesión estructurados.
- **Prevención de Spam**: Mecanismo de enfriamiento (*cooldown*) de 2.5 segundos y deshabilitación reactiva de controles para evitar publicaciones duplicadas.

---

© 2026 NextGen Platform. Desarrollado para la Excelencia en la Ingeniería de Software y la Arquitectura de Agentes con IA.


# PaginaIA_NextGen
