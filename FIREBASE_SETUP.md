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
  maxAccuracyMeters: 80
};
```

- `minRouteMeters`: distancia mínima entre puntos automáticos de recorrida. Menos metros = más detalle y más escrituras en Firestore.
- `maxAccuracyMeters`: descarta puntos automáticos con mala precisión. El botón **Enviar ubicación** guarda igual aunque sea manual.
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
      allow read, create: if true;
      allow update, delete: if false;
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

Si querés preparar las colecciones visualmente, como máximo creá la colección con un documento temporal y después borrá ese documento. Pero no es necesario: Firestore crea `messages`, `privateMessages`, `fieldLocations`, `fieldRoutes` y `fieldTasks` automáticamente con el primer envío exitoso o la primera recorrida GPS.

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
  - `lastSeenMs` — number actualizado automáticamente por la app cada minuto
  - `currentWorkArea` — string actualizado automáticamente al entrar a un canal

Para dar de alta: agregá un documento con `active: true`. Para dar de baja: cambiá `active` a `false`. Para armar bolsas de trabajo, cargá `workAreas` con los canales donde participa cada usuario; `General turno` siempre llega a todos.

Usuarios base que la app crea/usa si faltan en Firebase:

- Iracema — Puesto 2 — `Atención al cliente`
- Justino — Puesto 3 — `Atención al cliente`
- Pierina — Puesto 4 — `Monitoreo`
- Lucia — Puesto 5 — `Monitoreo`
- Mikaela — Puesto 6 — `Atención al cliente`
- Maily — Puesto 7 — `Atención al cliente`
- Carvel — Puesto 8 — `Fresh`
- Valeria — Puesto 9 — `Fresh`
- Miguel — Puesto 10 — `Atención al cliente`
- Alexis — Puesto 6 — `Atención al cliente`
- Alfonso — `Líder de equipos` — turno Día — todas las bolsas activas
- Manuel — `Líder de equipos` — turno Tarde — todas las bolsas activas
- Caroline — `Líder de equipos` — turno Noche — todas las bolsas activas
- Supervisor de Calle — `Supervisor de calle` — turno Día — `General turno` y `Supervisores de Calle`

Mapa de puestos por bolsa:

- `Atención al cliente`: Puestos 1, 2, 3, 6, 7 y 10
- `Fresh`: Puestos 8 y 9
- `Monitoreo`: Puestos 4 y 5

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

Uso: tareas por dirección que crean los líderes para supervisores de calle. Al finalizar, se guarda quién la hizo, fecha/hora, coordenadas y fotos.

- **Collection ID:** `fieldTasks`
- **Document ID:** automático (`Auto ID`)
- Campos que guarda la app:
  - `title` — string
  - `assignedTo` — string (`Todos` o nombre del supervisor)
  - `address` — string
  - `lat` / `lng` — number opcional
  - `detail` — string
  - `status` — string (`Pendiente` o `Finalizada`)
  - `createdBy` — string
  - `completedBy` — string cuando se finaliza
  - `completedAtMs` — number cuando se finaliza
  - `completedLat` / `completedLng` — number cuando el celular permite GPS
  - `photos` — array de objetos `{ name, type, url, createdAtMs }`

### `qyaItems`

Uso: preguntas y respuestas del módulo Q&A. La app las lee desde Firestore y las crea desde el panel administrador.

- **Collection ID:** `qyaItems`
- **Document ID:** automático (`Auto ID`)
- Campos que guarda la app:
  - `icon` — string
  - `question` — string
  - `answer` — string
  - `createdBy` — string
  - `createdAtMs` — number

## 8. Prueba completa

1. Abrí la web.
2. Elegí el operador del turno automático y entrá a la central.
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
13. Ingresá como `Supervisor de Calle` desde un celular, abrí **Supervisores**, permití la ubicación y tocá **Iniciar recorrida** o **Enviar ubicación**. En Firestore deberían aparecer `fieldLocations` y `fieldRoutes`.
14. Un líder puede entrar a **Supervisores**, crear una tarea de calle y verla luego como `fieldTasks`.

## 9. Si no guarda

Revisá en este orden:

1. En la consola del navegador no debe aparecer `Firebase sin configurar` ni `Firebase SDK no cargó`; si aparece, todavía no está conectando.
2. El objeto completo `firebaseConfig` ya quedó cargado en `index.html` con la app web `Interna Virtual Web`.
3. Firestore Database está creado, no solo el proyecto Firebase.
4. Las reglas están publicadas y permiten leer/escribir las colecciones usadas: `users`, `messages`, `privateMessages`, `tasks`, `qyaItems`, `fieldLocations`, `fieldRoutes` y `fieldTasks`.
5. Para el mapa, la clave de Google Maps tiene Maps JavaScript API habilitada, facturación activa y el dominio autorizado.
5. La consola del navegador no muestra `Missing or insufficient permissions`.
6. La consola del navegador no muestra errores de dominio/API key.
7. Estás mirando el mismo proyecto cuyo `projectId` pegaste en la web.
