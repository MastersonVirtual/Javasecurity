# Configuración Firebase para InternaMatutino

Esta web guarda los chats en **Cloud Firestore**. No tenés que crear documentos a mano: la app los crea con **ID automático** cuando mandás el primer mensaje.

## 1. Crear proyecto

1. Entrá a <https://console.firebase.google.com/>.
2. Tocá **Agregar proyecto**.
3. Nombre del proyecto: `InternaMatutino`.
4. ID del proyecto: en tus capturas ya aparece como `internamatutino`.
5. Google Analytics: puede quedar desactivado para esta app.
6. Tocá **Crear proyecto**.

## 2. Crear la app web

1. Dentro del proyecto, tocá el icono **Web** (`</>`).
2. Apodo de la app: `InternaMatutino Web`.
3. Firebase Hosting: activalo solo si vas a publicar desde Firebase Hosting; si la subís por otro lado, no hace falta.
4. Tocá **Registrar app**.
5. Copiá el objeto `firebaseConfig` completo que te muestra Firebase. El **Número del proyecto** (`99060177629` en tus capturas) no alcanza: necesitás el objeto de configuración de la app web, especialmente `apiKey`, `projectId` y `appId`.

## 3. Pegar la configuración en `index.html`

Buscá el bloque `firebaseConfig` en `index.html` y reemplazá los valores vacíos por los valores de tu proyecto:

```js
const firebaseConfig = window.INTERNAMATUTINO_FIREBASE_CONFIG || {
  apiKey:'TU_API_KEY',
  authDomain:'TU_PROJECT_ID.firebaseapp.com',
  projectId:'TU_PROJECT_ID',
  storageBucket:'TU_PROJECT_ID.appspot.com',
  messagingSenderId:'TU_MESSAGING_SENDER_ID',
  appId:'TU_APP_ID'
};
```

> Importante: el campo más crítico es `projectId`. Si queda vacío, la app funciona localmente pero **no guarda en Firebase**.

## 4. Crear Firestore Database

1. En Firebase Console, andá a **Compilación / Build** → **Firestore Database**.
2. Tocá **Crear base de datos**.
3. Elegí **Modo de prueba** para validar rápido que todo guarda.
4. Ubicación recomendada: una región cercana, por ejemplo `nam5 (United States)` si no tenés preferencia.
5. Tocá **Habilitar**.

## 5. Reglas de Firestore para probar

En **Firestore Database** → pestaña **Reglas**, pegá esto para probar sin login Firebase:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{messageId} {
      allow read, create: if true;
      allow update, delete: if false;
    }

    match /privateMessages/{messageId} {
      allow read, create: if true;
      allow update, delete: if false;
    }

    match /tasks/{taskId} {
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

Si querés preparar las colecciones visualmente, como máximo creá la colección con un documento temporal y después borrá ese documento. Pero no es necesario: Firestore crea `messages` y `privateMessages` automáticamente con el primer envío exitoso.

## 6. Colecciones que usa la app

No las crees a mano salvo que quieras verificar visualmente. La app las crea sola.

### `messages`

Uso: mensajes generales y mensajes de canales (`General turno`, `Fresh`, `Atención al cliente`, `Monitoreo`).

- **Collection ID:** `messages`
- **Document ID:** automático (`Auto ID`)
- Campos que guarda la app:
  - `channel` — string
  - `operator` — string
  - `post` — string
  - `text` — string
  - `important` — boolean
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
  - `createdAtMs` — number

### `tasks`

Uso: tareas creadas desde la sección tareas o desde un mensaje de chat.

- **Collection ID:** `tasks`
- **Document ID:** automático (`Auto ID`)

## 7. Prueba completa

1. Abrí la web.
2. Ingresá con clave `Matutino2026`.
3. Entrá a **Chat**.
4. Enviá un mensaje en `General turno`.
5. En Firebase Console → **Firestore Database** → **Datos**, debería aparecer la colección `messages` con un documento nuevo.
6. Volvé a la web, elegí un operador en **Privados** y enviá un mensaje.
7. En Firestore debería aparecer `privateMessages` con un documento nuevo.

## 8. Si no guarda

Revisá en este orden:

1. Arriba de la web debe decir `Firebase conectado: internamatutino`. Si dice `Firebase sin configurar` o `Firebase SDK no cargó`, todavía no está conectando.
2. `projectId` no está vacío en `index.html` y vale `internamatutino`.
3. Firestore Database está creado, no solo el proyecto Firebase.
4. Las reglas están publicadas y permiten `create` en `messages` y `privateMessages`.
5. La consola del navegador no muestra `Missing or insufficient permissions`.
6. La consola del navegador no muestra errores de dominio/API key.
7. Estás mirando el mismo proyecto cuyo `projectId` pegaste en la web.
