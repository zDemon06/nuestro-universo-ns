# Nuestro Universo de Amor · N + S

Proyecto React + Vite + Three.js/React Three Fiber + Supabase Auth. Preparado para Render Static Site.

## 1. Ejecutar localmente
1. Instala Node.js LTS desde https://nodejs.org/
2. Abre esta carpeta en VS Code.
3. En la terminal ejecuta `npm install`.
4. Copia `.env.example` y llama a la copia `.env.local`.
5. Completa las variables de Supabase como se explica abajo.
6. Ejecuta `npm run dev` y abre la URL que muestre Vite.

## 2. Conectar Supabase
1. Crea un proyecto en https://supabase.com/dashboard
2. Copia Project URL y la Publishable key (o la legacy anon key) desde Connect / API Settings.
3. En `.env.local`, coloca:
   `VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co`
   `VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA`
4. Guarda y reinicia Vite con Ctrl+C y `npm run dev`.
5. En Supabase abre Authentication > Users > Add user / Create user y crea la cuenta de Nathalie con email y contraseña. El proyecto no ofrece registro público.
6. Nunca uses `service_role`, secret key ni la contraseña de la base de datos en React o variables `VITE_`.

## 3. Personalizar el mensaje final
Edita `FINAL_DEDICATION` en `src/App.jsx`.

## 4. Publicar en Render
Sube los archivos a un repositorio GitHub sin `.env.local`. En Render selecciona New > Static Site:
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
Agrega las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Environment y despliega. En Supabase, configura Authentication > URL Configuration para permitir tu URL `https://...onrender.com` cuando sea necesario.

## Seguridad
La clave pública está destinada al navegador. No guardes contraseñas en tablas propias ni publiques claves secretas. El inicio de sesión usa Supabase Auth con correo y contraseña.
