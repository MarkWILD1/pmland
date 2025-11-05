# Meta Conversions API - Guía de Configuración para Plan Maestro

## 🚀 ¿Qué es la API de Conversiones de Meta?

La API de Conversiones de Meta te permite enviar eventos directamente desde tu servidor a Meta, mejorando:
- **Precisión del tracking** (no depende de cookies)
- **Privacidad del usuario** (datos encriptados)
- **Cumplimiento con GDPR/CCPA**
- **Mejor optimización** de campañas

## 📋 Pasos para Configurar

### 1. Obtener Access Token de Meta

1. Ve a [Facebook Business Manager](https://business.facebook.com/)
2. Navega a **Configuración > Cuentas de empresa**
3. Selecciona tu cuenta de empresa
4. Ve a **Sistema de usuarios** > **Usuarios del sistema**
5. Crea un nuevo usuario del sistema o usa uno existente
6. Genera un **Access Token** con permisos:
   - `ads_management`
   - `business_management`
   - `ads_read`

### 2. Configurar el Access Token

En `index.html`, reemplaza:
```javascript
const META_ACCESS_TOKEN = 'TU_ACCESS_TOKEN_AQUI';
```

Con tu token real:
```javascript
const META_ACCESS_TOKEN = 'tu_token_real_aqui';
```

### 3. Implementar el Endpoint del Servidor

#### Opción A: Node.js/Express
```bash
npm install express axios
```

Usa el archivo `api/meta-conversions-node.js` (para Node.js) o `api/meta-conversions.php` (para PHP) en tu servidor.

#### Opción B: PHP
Usa el archivo `api/meta-conversions.php` en tu servidor web.

### 4. Configurar el Servidor

#### Para Node.js:
```javascript
const express = require('express');
const metaConversions = require('./api/meta-conversions');
const app = express();

app.use('/api', metaConversions);
app.listen(3000);
```

#### Para PHP:
Sube `api/meta-conversions.php` a tu servidor y asegúrate de que:
- PHP cURL esté habilitado
- El archivo sea accesible desde `/api/meta-conversions.php`

## 🔧 Configuración Avanzada

### Eventos Personalizados

La API ya está configurada para enviar automáticamente:
- `PageView` - Visitas a la página
- `Lead` - Interés en registrarse
- `InitiateCheckout` - Intención de compra
- `ViewContent` - Exploración de contenido

### Datos de Usuario

La API captura automáticamente:
- IP del cliente
- User Agent
- Cookies de Facebook (_fbc, _fbp)
- URL de origen
- Timestamp del evento

## 📊 Beneficios para Plan Maestro

### 1. Tracking Mejorado
- **Doble tracking**: Pixel + Conversions API
- **Mayor precisión** en la medición
- **Mejor atribución** de conversiones

### 2. Privacidad
- **Cumplimiento GDPR** automático
- **Datos encriptados** en tránsito
- **Control total** sobre los datos

### 3. Optimización
- **Algoritmos mejorados** de Meta
- **Mejor targeting** de audiencias
- **Reducción de costos** por conversión

## 🚨 Consideraciones Importantes

### Seguridad
- **Nunca expongas** el Access Token en el frontend
- **Usa variables de entorno** para tokens
- **Implementa rate limiting** en tu servidor

### Monitoreo
- **Revisa logs** regularmente
- **Monitorea errores** de la API
- **Verifica eventos** en Facebook Events Manager

## 📈 Próximos Pasos

1. **Configurar Access Token** real
2. **Implementar endpoint** del servidor
3. **Probar eventos** en modo desarrollo
4. **Monitorear métricas** en Facebook Ads Manager
5. **Optimizar campañas** basado en datos

## 🔍 Verificación

Para verificar que funciona:
1. **Facebook Events Manager** - Ver eventos en tiempo real
2. **Console del navegador** - Revisar logs de JavaScript
3. **Logs del servidor** - Verificar respuestas de Meta API

---

**Nota**: Esta implementación es para fines educativos. Para producción, asegúrate de implementar todas las medidas de seguridad necesarias.
