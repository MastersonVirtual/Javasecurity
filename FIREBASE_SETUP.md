# Configuración Firebase para Interna Virtual

Esta web guarda los chats en **Cloud Firestore**. No tenés que crear documentos a mano: la app los crea con **ID automático** cuando mandás el primer mensaje.

## 1. Crear proyecto

1. Entrá a <https://console.firebase.google.com/>.
2. Tocá **Agregar proyecto**.
3. Nombre del proyecto: `Interna Virtual`.
4. ID del proyecto: en tus capturas ya aparece como `internamatutino`.
5. Google Analytics: puede quedar desactivado para esta app.
6. Tocá **Crear proyecto**.

## 2. Crear la app web

1. Dentro del proyecto, tocá el icono **Web** (`</>`).
2. Apodo de la app: `Interna Virtual Web`.
3. Firebase Hosting: activalo solo si vas a publicar desde Firebase Hosting; si la subís por otro lado, no hace falta.
4. Tocá **Registrar app**.
5. Copiá el objeto `firebaseConfig` completo que te muestra Firebase. El **Número del proyecto** (`99060177629` en tus capturas) no alcanza: necesitás el objeto de configuración de la app web, especialmente `apiKey`, `projectId` y `appId`.

## 3. Pegar la configuración en `index.html`

Buscá el bloque `firebaseConfig` en `index.html` y reemplazá los valores vacíos por los valores de tu proyecto:

```js
const firebaseConfig = window.INTERNAMATUTINO_FIREBASE_CONFIG || {
  apiKey:'AIzaSyC7pjDCHeshyyiYrSr422w-huAQEGptPXY',
  authDomain:'internamatutino.firebaseapp.com',
  projectId:'internamatutino',
  storageBucket:'internamatutino.firebasestorage.app',
  messagingSenderId:'99060177629',
  appId:'1:99060177629:web:2273c3ea8778678f651934'
};
```

> Ya dejé cargado en el código el objeto completo de tu app web `Interna Virtual Web`, incluyendo `apiKey`, `projectId`, `messagingSenderId` y `appId`.


## 4. Configurar Google Maps para recorridas

Para que el mapa GPS use Google Maps necesitás una **Google Maps API Key** con **Maps JavaScript API** habilitada y con el dominio de la web autorizado. Esa clave no es la misma que Firebase.

En `index.html` podés dejarla configurada antes del script principal o inyectarla desde el hosting:

```js
window.INTERNAMATUTINO_GOOGLE_MAPS_CONFIG = {
  apiKey: 'AIzaSyC7pjDCHeshyyiYrSr422w-huAQEGptPXY',
  minRouteMeters: 15,
  maxAccuracyMeters: 80,
  minRouteSeconds: 25
};
```

- `minRouteMeters`: distancia mínima entre puntos automáticos de recorrida. Menos metros = más detalle y más escrituras en Firestore.
- `maxAccuracyMeters`: descarta puntos con mala precisión para no dibujar recorridos corridos o poco confiables. Si el celular informa peor precisión, la app avisa que espere mejor señal GPS.
- `minRouteSeconds`: tiempo mínimo entre puntos automáticos. Esto evita que el GPS escriba cada décima de segundo, que Firestore dispare lecturas constantes y que el chat o el mapa parezcan recargarse todo el tiempo.
- La tarjeta **Tiempo activo tareas** suma el tiempo desde que una visita fue aceptada/iniciada hasta que se completa; la tarjeta de velocidad promedio se quitó porque no aportaba control confiable en recorridas urbanas con poca distancia.
- Si no cargás `apiKey`, la app muestra un aviso dentro del mapa y sigue guardando datos de Firestore.

## 5. Crear Firestore Database

1. En Firebase Console, andá a **Compilación / Build** → **Firestore Database**.
2. Tocá **Crear base de datos**.
3. Elegí **Modo de prueba** para validar rápido que todo guarda.
4. Ubicación recomendada: una región cercana, por ejemplo `nam5 (United States)` si no tenés preferencia.
5. Tocá **Habilitar**.

## 6. Reglas de Firestore para probar

En **Firestore Database** → pestaña **Reglas**, pegá esto para probar sin login Firebase:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{messageId} {
      allow read, create: if true;
      allow update, delete: if false;
    }

    match /users/{userId} {
      allow read: if true;
      allow create, update, delete: if true;
    }

    match /privateMessages/{messageId} {
      allow read, create: if true;
      allow update, delete: if false;
    }

    match /tasks/{taskId} {
      allow read, create, update: if true;
      allow delete: if false;
    }

    match /qyaItems/{itemId} {
      allow read, create, update, delete: if true;
    }

    match /fieldLocations/{pointId} {
      allow read, create: if true;
      allow update, delete: if false;
    }

    match /fieldRoutes/{routeId} {
      allow read, create, update: if true;
      allow delete: if false;
    }

    match /fieldTasks/{taskId} {
      allow read, create, update: if true;
      allow delete: if false;
    }

    match /fieldEvents/{eventId} {
      allow read, create: if true;
      allow update, delete: if false;
    }

    match /fieldShiftClosures/{closureId} {
      allow read, create: if true;
      allow update, delete: if false;
    }
  }
}
```

> Esto es para una primera prueba operativa. Después conviene agregar Firebase Authentication para que no sea escritura pública.



## Muy importante: no crees documentos vacíos a mano

Las capturas muestran que creaste un documento en `tasks` con campos vacíos. Eso no hace que el chat guarde. Para los chats **no tenés que crear documentos manualmente**:

- No crees el documento dentro de `messages`.
- No inventes el Document ID.
- No crees campos vacíos.
- La app crea el documento con **Auto ID** cuando apretás enviar.

Si querés preparar las colecciones visualmente, como máximo creá la colección con un documento temporal y después borrá ese documento. Pero no es necesario: Firestore crea `messages`, `privateMessages`, `fieldLocations`, `fieldRoutes`, `fieldTasks`, `fieldEvents` y `fieldShiftClosures` automáticamente con el primer envío exitoso o la primera recorrida GPS.

## 7. Colecciones que usa la app

No las crees a mano salvo que quieras verificar visualmente. La app las crea sola.

### `users`

Uso: altas/bajas de usuarios y listado de privados. La app lee esta colección para armar el selector de login, asignaciones y chats privados.

- **Collection ID:** `users`
- **Document ID:** puede ser el nombre en minúscula o Auto ID.
- Campos recomendados:
  - `name` — string, ejemplo `Lucía`
  - `post` — string, ejemplo `Puesto 1`
  - `active` — boolean; `true` aparece en la app, `false` queda dado de baja
  - `workAreas` — array de strings, ejemplo `["Fresh"]`, `["Monitoreo"]`, `["Atención al cliente"]` o `["Supervisores de Calle"]`
  - `role` — string opcional; usar `fieldSupervisor` para supervisores de calle
  - `phone` — string obligatorio para ingreso por SMS, ejemplo `+59891909182`. Debe corresponder al operador; si no coincide, la app no lo deja entrar.
  - `phones` — array opcional de teléfonos autorizados si un operador puede usar más de un número.
  - `lastSeenMs` — number actualizado automáticamente por la app cada minuto
  - `currentWorkArea` — string actualizado automáticamente al entrar a un canal

Para dar de alta: agregá un documento con `active: true` y `phone` con el número autorizado del operador. Para dar de baja: cambiá `active` a `false`. Para armar bolsas de trabajo, cargá `workAreas` con los canales donde participa cada usuario; `General turno` siempre llega a todos.

Usuarios base que la app crea/usa si faltan en Firebase:

- Romina — Puesto 1 — `Atención al cliente` — `+59893710201`
- Iracema — Puesto 2 — `Atención al cliente` — `+59895218719`
- Justino — Puesto 3 — `Atención al cliente` — `+59893785294`
- Pierina — Puesto 4 — `Monitoreo` — `+59895621772`
- Lucía — Puesto 5 — `Monitoreo` — `+59892343343`
- Mikaela — Puesto 6 — `Atención al cliente` — `+59898237755`
- Maily — Puesto 7 — `Atención al cliente` — `+59892355522`
- Carvel — Puesto 8 — `Fresh`
- Valeria — Puesto 9 — `Fresh` — `+59898530613`
- Miguel — Puesto 10 — `Atención al cliente` — `+59892140688`
- Alexis — Puesto 6 — `Atención al cliente` — `+59891075980`
- Alfonso — `Puesto de referentes` — turno Día — todas las bolsas activas — `+59891909182`
- Manuel — `Líder de equipos` — turno Tarde — todas las bolsas activas
- Caroline — `Líder de equipos` — turno Noche — todas las bolsas activas
- Supervisor de Calle — `Supervisor de calle` — turno Día — teléfono `+59896210983` — `General turno` y `Supervisores de Calle`

Mapa de puestos por bolsa:

- `Atención al cliente`: Puestos 1, 2, 3, 6, 7 y 10
- `Fresh`: Puestos 8 y 9
- `Monitoreo`: Puestos 4 y 5
- `Puesto de referentes`: puesto adicional para líderes/referentes, separado de los puestos 1 al 10

### `messages`

Uso: mensajes generales y mensajes de canales (`General turno`, `Fresh`, `Atención al cliente`, `Monitoreo`, `Supervisores de Calle`).

- **Collection ID:** `messages`
- **Document ID:** automático (`Auto ID`)
- Campos que guarda la app:
  - `channel` — string
  - `audience` — string; `all` para General o el nombre de la bolsa/canal
  - `operator` — string
  - `post` — string
  - `text` — string
  - `important` — boolean
  - `attachments` — array de objetos `{ name, type, url, createdAtMs }` para imágenes adjuntas o pegadas
  - `createdAtMs` — number

### `privateMessages`

Uso: mensajes privados entre operadores.

- **Collection ID:** `privateMessages`
- **Document ID:** automático (`Auto ID`)
- Campos que guarda la app:
  - `from` — string
  - `to` — string
  - `participants` — array de strings
  - `post` — string
  - `text` — string
  - `important` — boolean
  - `attachments` — array de objetos `{ name, type, url, createdAtMs }` para imágenes adjuntas o pegadas
  - `createdAtMs` — number

### `tasks`

Uso: tareas creadas desde la sección tareas o desde un mensaje de chat.

- **Collection ID:** `tasks`
- **Document ID:** automático (`Auto ID`)


### `fieldLocations`

Uso: puntos GPS que registra el supervisor de calle desde el celular. Los líderes los ven en el mapa por turno.

- **Collection ID:** `fieldLocations`
- **Document ID:** automático (`Auto ID`)
- Campos que guarda la app:
  - `supervisor` — string
  - `shift` — string
  - `routeId` — string o null
  - `lat` — number
  - `lng` — number
  - `accuracy` — number
  - `heading` — number o null
  - `speed` — number o null
  - `createdAtMs` — number

### `fieldRoutes`

Uso: inicio y fin de cada recorrida del supervisor para agrupar puntos GPS.

- **Collection ID:** `fieldRoutes`
- **Document ID:** automático (`Auto ID`)
- Campos que guarda la app:
  - `supervisor` — string
  - `shift` — string
  - `status` — string (`En curso` o `Finalizada`)
  - `startedAtMs` — number
  - `endedAtMs` — number cuando finaliza

### `fieldTasks`

Uso: visitas/recorridas por dirección que puede asignar cualquier operador de cualquier turno al supervisor de calle. Primero quedan en `Pendiente de aceptación`; el supervisor las acepta o deniega. Si las acepta, quedan como visita `Pendiente` hasta que llegue y la realice con ubicación/foto.

- **Collection ID:** `fieldTasks`
- **Document ID:** automático (`Auto ID`)
- Campos que guarda la app:
  - `title` — string
  - `assignedTo` — string (`Todos` o nombre del supervisor)
  - `address` — string
  - `lat` / `lng` — number; la app los completa automáticamente geocodificando la dirección
  - `geocodedAddress` / `geocodeStatus` — resultado de Google Geocoding
  - `mapHidden` / `closedAtMs` / `closureId` — se completan al cerrar turno para limpiar el mapa activo y conservar la visita sólo en historial
  - `detail` — string
  - `status` — string (`Pendiente de aceptación`, `Pendiente`, `Denegada` o `Finalizada`)
  - `createdBy` / `requestedBy` — string con el operador que asignó la visita
  - `creatorShift` — turno del operador que la creó
  - `acceptedBy` / `acceptedAtMs` — supervisor y fecha/hora si acepta
  - `deniedBy` / `deniedAtMs` — supervisor y fecha/hora si deniega
  - `completedBy` — string cuando se finaliza
  - `completedAtMs` — number cuando se finaliza
  - `completedLat` / `completedLng` — number cuando el celular permite GPS
  - `photos` — array de objetos `{ name, type, url, createdAtMs }`


### `fieldEvents`

Uso: historial detallado de cada gestión de calle. Acá quedan inicio/finalización de recorrida, ubicaciones manuales, fotos del lugar, tareas completadas y cierre de turno.

- **Collection ID:** `fieldEvents`
- **Document ID:** automático (`Auto ID`)
- Campos que guarda la app:
  - `type` — string (`start`, `manual`, `point`, `photo`, `task`, `finish`, `shiftClose`)
  - `supervisor` — string
  - `shift` — string
  - `routeId` — string o null
  - `lat` / `lng` — number cuando hay ubicación
  - `accuracy` — number o null
  - `note` — string
  - `taskId` — string o null
  - `photo` — objeto `{ name, type, url, createdAtMs }` cuando se adjunta foto
  - `createdAtMs` — number

### `fieldShiftClosures`

Uso: resumen de cierre de turno. Se crea cuando el supervisor toca **Finalizar turno** y confirma dos veces para evitar cierres accidentales.

- **Collection ID:** `fieldShiftClosures`
- **Document ID:** automático (`Auto ID`)
- Campos que guarda la app:
  - `supervisor` — string
  - `shift` — string
  - `closedAtMs` — number
  - `routesCount` — number
  - `totalDurationMs` — number
  - `totalDistanceMeters` — number
  - `pointsCount` — number
  - `eventsCount` — number
  - `photosCount` — number
  - `tasksTotal` / `tasksDone` — number
  - `routeIds` — array de IDs de recorridas incluidas
  - `taskSnapshots` — resumen de visitas/direcciones incluidas para generar el reporte imprimible/PDF


### Flujo correcto de visitas del supervisor

1. Un operador de cualquier puesto entra a **Supervisores** y toca **Asignar visita de calle**.
2. Carga título, supervisor destino, dirección exacta y observaciones de la tarea.
3. La visita queda como `Pendiente de aceptación`. En este estado aparece en la lista del supervisor, pero **no se pinea ni se carga en su mapa**.
4. El supervisor de calle la ve en su lista y puede **Aceptar visita** o **Denegar**.
5. Al aceptar, queda como `Pendiente` dentro de su jornada y recién ahí puede mostrarse como destino operativo del supervisor.
6. El supervisor elige una visita aceptada y toca **Comenzar esta tarea**; ahí se crea una ruta activa y se carga esa dirección en el mapa.
7. Cuando llega al lugar toca **Llegué y realicé visita**; el sistema abre una ventana propia para adjuntar foto desde cámara y escribir una observación.
8. Al guardar, queda `Finalizada` con foto, observación, ubicación, fecha y responsable.
9. Al cerrar la jornada, se genera el resumen en `fieldShiftClosures`, queda disponible el botón **PDF**, y las tareas/rutas cerradas se limpian del mapa activo con `mapHidden: true`. El PDF de ese cierre usa snapshots de esa jornada/día cerrado, no todo el historial desde el inicio.

### `qyaItems`

Uso: preguntas y respuestas del módulo Q&A. La app las lee desde Firestore y permite crear, editar o borrar tarjetas desde el panel administrador usando la clave configurada.

- **Collection ID:** `qyaItems`
- **Document ID:** automático (`Auto ID`)
- Campos que guarda la app:
  - `icon` — string
  - `question` — string
  - `answer` — string, sin límite corto en el campo de escritura de la pantalla
  - `updatedBy` / `updatedAtMs` — se agregan cuando se edita una tarjeta existente
  - `createdBy` — string
  - `createdAtMs` — number

El selector de íconos de Q&A incluye opciones operativas ampliadas para seguridad, ubicaciones, cámaras, herramientas, documentos, horarios y alertas, mostrado como grilla/recuadro de selección. La pregunta y la respuesta no tienen límite corto de caracteres en el formulario. Después de guardar, el formulario se limpia para cargar una nueva consulta. Las tarjetas existentes pueden editarse o borrarse usando la clave de administrador. La búsqueda ignora tildes y acentos, por lo que escribir `monitoreo`, `atencion` o `lucia` encuentra coincidencias aunque el texto guardado tenga acentos.



La vista informativa de líderes muestra la **Dirección GPS** del Supervisor de Calle a partir de la última ubicación recibida. Cada vez que el dispositivo del supervisor registra un nuevo punto GPS, la dirección se recalcula de forma aproximada con Google Geocoder y se vuelve a mostrar en el panel.

## Permisos y claves para la vista de supervisores

Para que la vista tipo panel móvil de supervisores funcione completa no hace falta una clave nueva si ya cargó el mapa. Sí necesitás verificar:

- **Google Maps API key:** ya está cargada en el código. Debe seguir con **Maps JavaScript API** y **Geocoding API** habilitadas, facturación activa y dominio autorizado. Geocoding API es lo que convierte la dirección escrita por el operador en coordenadas para ubicar la visita en el mapa. Ya no se usa DirectionsService ni ruta automática: el mapa muestra pines de visitas pendientes/en curso/finalizadas y ubicación actual.
- **Permiso de ubicación del celular:** el supervisor debe aceptar la ubicación del navegador; en producción la web debe abrirse por `https://` para que el GPS funcione correctamente. En iPhone conviene abrir desde Safari; si se abre dentro de WhatsApp, iOS puede usar el permiso de WhatsApp y no mostrar el cartel del navegador. Revisá Ajustes → Safari/WhatsApp → Ubicación. La app ahora guarda puntos como máximo cada `minRouteSeconds`, sólo si se movió al menos `minRouteMeters` y sólo con precisión aceptable, y las actualizaciones de GPS redibujan sólo marcadores sin reconstruir toda la pantalla. La precisión final depende del GPS/señal del celular; para pegar el recorrido exactamente a calles se puede evaluar más adelante Google Roads API.
- **Reglas de Firestore:** deben permitir leer/crear `fieldLocations`, `fieldRoutes`, `fieldTasks`, `fieldEvents` y `fieldShiftClosures`, porque ahí se guardan mapa, puntos, fotos, tareas y cierre de turno.
- **Vista informativa para líderes:** muestra GPS actual del Supervisor de Calle, precisión, última señal y estado online. No muestra batería ni acciones operativas como cerrar tarea o cerrar jornada.
- **Fotos:** por ahora se guardan como imagen comprimida dentro del documento de Firestore. Si van a subir muchas fotos por día, conviene migrar luego a Firebase Storage.



## Flujo profesional recomendado para Supervisores de Calle

1. **Operador / líder asigna visita:** carga título, dirección exacta y detalle operativo. En esta vista no se usa mapa ni GPS.
2. **Supervisor responde:** acepta o deniega la visita desde su usuario `Supervisor de Calle`.
3. **Visita aceptada:** queda como `Pendiente` y aparece como pin rojo en el mapa del supervisor.
4. **Mapa operativo simple:** las visitas aceptadas aparecen como pines; pendientes en rojo, en curso en azul y realizadas en verde. No se calcula ruta automática ni recorrido más cercano.
5. **Inicio de visita:** el supervisor puede tocar **Comenzar esta tarea** en la tarjeta o **Iniciar recorrido** desde el pin rojo. Ahí se crea una ruta `fieldRoutes`, se toma GPS actual como punto A y la dirección como punto B.
6. **Durante la visita:** se guardan puntos GPS en `fieldLocations` con throttling por tiempo/distancia para no refrescar toda la pantalla.
7. **Cierre de tarea:** la tarea en curso puede cerrarse desde la tarjeta, desde el pin azul o desde el botón **Cerrar tarea** del historial. El cierre exige foto y observación.
8. **Mapa de control:** pendientes rojo, en curso azul, finalizadas verde. Las finalizadas quedan visibles hasta cerrar jornada.
9. **Cerrar jornada:** sólo se permite si no quedan visitas pendientes o en curso. El cierre genera `fieldShiftClosures`, abre el reporte/PDF y limpia únicamente tareas finalizadas o denegadas y sus rutas cerradas; no oculta trabajo pendiente por error.

## 8. Prueba completa

1. Abrí la web.
2. Elegí el operador del turno automático y entrá a la central. Si necesitás cambiar manualmente el turno, seleccioná otro turno y cargá la clave de líder; sin esa clave el ingreso queda bloqueado.
3. Entrá a **Chat**.
4. Enviá un mensaje en `General turno`.
5. En Firebase Console → **Firestore Database** → **Datos**, debería aparecer la colección `messages` con un documento nuevo.
6. Volvé a la web, elegí un operador en **Privados** y enviá un mensaje.
7. En Firestore debería aparecer `privateMessages` con un documento nuevo.
8. Entrá a **Q&A**, agregá una pregunta con la clave de administrador `3321` y verificá que aparezca la colección `qyaItems`.
9. Para usuarios, creá o editá documentos en `users`: `active: true` los muestra; `active: false` los da de baja; `workAreas` define si pertenece a `Fresh`, `Monitoreo`, `Atención al cliente` o `Supervisores de Calle`.
10. La presencia se actualiza cada minuto con `lastSeenMs`; en la app se ve verde si está online y rojo si está offline.
11. En Chat, usá el botón 📎 para adjuntar imágenes o pegá una imagen directamente dentro del campo de mensaje. Esas imágenes se guardan en el campo `attachments` del documento de Firestore.
12. La API key de Google Maps ya quedó cargada en `window.INTERNAMATUTINO_GOOGLE_MAPS_CONFIG.apiKey`; verificá que tenga Maps JavaScript API habilitada y el dominio autorizado.
13. Ingresá como `Supervisor de Calle` desde un celular, abrí **Supervisores**, permití la ubicación y tocá **Centrar ubicación** o comenzá una visita aceptada. En Firestore deberían aparecer `fieldRoutes`, `fieldLocations` y `fieldEvents`. El mapa reutiliza la instancia de Google Maps por usuario/turno, actualiza marcadores sin reconstruir toda la vista, toma **Mi ubicación actual** como centro base del supervisor y el botón **Centrar ubicación** vuelve en vivo a ese punto cuando el GPS entrega una coordenada válida.
14. Cualquier operador puede entrar a **Supervisores**, tocar **Asignar visita de calle**, cargar dirección/detalle y enviarla. En usuarios que no sean `Supervisor de Calle` esta sección no carga mapa ni GPS: funciona sólo como bandeja de asignación y seguimiento. Ya no se cargan latitud/longitud a mano: la app puede geocodificar la dirección, pero mientras queda `Pendiente de aceptación` no se muestra como pin en el mapa del supervisor.
15. El `Supervisor de Calle` es el único que ve el mapa operativo. Ve esas visitas, puede **Aceptar visita** o **Denegar**. Si acepta, queda `Pendiente`; cuando toca **Comenzar esta tarea**, el mapa toma su ubicación GPS actual como punto A y la dirección aceptada como punto B. En ese mapa puede alternar **Mapa/Satélite** y usar **Centrar ubicación** para volver a su posición en vivo. Los pines pendientes aparecen en rojo, las tareas en curso en azul y las realizadas en verde; al tocar un pin pendiente se puede **Iniciar recorrido** desde el mapa, y una tarea en curso se puede **Cerrar tarea** desde el pin o desde el historial. No se calcula ruta automática por cercanía ni se dibuja línea de recorrido.
16. Para cerrar la gestión completa, el supervisor toca **Cerrar jornada** y confirma dos veces dentro del sistema. El resumen queda en `fieldShiftClosures`, las direcciones se limpian del mapa activo con `mapHidden: true`, y el sistema abre automáticamente un reporte estético para imprimir/guardar como PDF. Si el navegador bloquea la ventana, usá el botón **PDF** del historial de cierres guardados.



### Si aparece un pin fuera de Uruguay

Si alguna dirección queda marcada cerca de África u otro país, normalmente es porque Google interpretó una dirección incompleta/ambigua o porque quedó guardado un documento viejo de `fieldTasks` con `lat`/`lng` incorrectos. La app ahora valida que las coordenadas estén dentro de Uruguay antes de mostrarlas en el mapa; si una visita vieja sigue mal, editá o borrá sus campos `lat`/`lng` en Firestore para que vuelva a geocodificarse desde `address`.

### Error `ApiTargetBlockedMapError`

Si la consola muestra `Google Maps JavaScript API error: ApiTargetBlockedMapError`, la ubicación del celular no es el problema: la clave está bloqueada para la API que intenta usar el mapa.

1. Entrá a **Google Cloud Console** → **APIs y servicios** → **Credenciales**.
2. Abrí la API key cargada en `window.INTERNAMATUTINO_GOOGLE_MAPS_CONFIG.apiKey`.
3. En **Restricciones de API**, elegí una de estas dos opciones:
   - Para probar rápido: **No restringir clave**.
   - Para producción: **Restringir clave** y marcar **Maps JavaScript API**.
4. Verificá que **Maps JavaScript API** esté habilitada en **APIs y servicios** → **Biblioteca**.
5. Guardá, esperá unos minutos y recargá la web.

Las advertencias de rendimiento o de `google.maps.Marker` no bloquean el mapa; el bloqueo real es `ApiTargetBlockedMapError`.

## 9. Si no guarda

Revisá en este orden:

1. En la consola del navegador no debe aparecer `Firebase sin configurar` ni `Firebase SDK no cargó`; si aparece, todavía no está conectando.
2. El objeto completo `firebaseConfig` ya quedó cargado en `index.html` con la app web `Interna Virtual Web`.
3. Firestore Database está creado, no solo el proyecto Firebase.
4. Las reglas están publicadas y permiten leer/escribir las colecciones usadas: `users`, `messages`, `privateMessages`, `tasks`, `qyaItems`, `fieldLocations`, `fieldRoutes`, `fieldTasks`, `fieldEvents` y `fieldShiftClosures`.
5. Para el mapa, la clave de Google Maps tiene Maps JavaScript API y Geocoding API habilitadas, facturación activa y el dominio autorizado.
5. La consola del navegador no muestra `Missing or insufficient permissions`.
6. La consola del navegador no muestra errores de dominio/API key.
7. Estás mirando el mismo proyecto cuyo `projectId` pegaste en la web.
