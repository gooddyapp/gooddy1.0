# gooddy → iOS / App Store

## Estado del repo

- Capacitor configurado: `appId` `com.gooddy.app`, `webDir` `dist`
- Scripts: `npm run build:app`, `npm run ios`
- Shell nativo: StatusBar / Splash / Keyboard en `src/lib/native.ts`

## Requisito en este Mac

Hoy solo hay **Command Line Tools**. Para compilar y subir a App Store hace falta:

1. Instalar **Xcode** desde la Mac App Store (grande, ~7–12 GB).
2. Abrir Xcode una vez → aceptar licencia → instalar componentes extra.
3. En Terminal:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
xcodebuild -version
```

4. Instalar CocoaPods (Capacitor iOS lo usa):

```bash
sudo gem install cocoapods
# o: brew install cocoapods
pod --version
```

## Flujo diario

```bash
npm run build:app   # build web + sync a ios/
npm run ios         # sync + abrir Xcode
```

En Xcode:

1. Target **App** → Signing & Capabilities → tu **Team** (Apple Developer).
2. Bundle ID: `com.gooddy.app` (debe coincidir con App Store Connect).
3. Version `1.0.0`, Build `1` (subí el Build en cada envío).
4. Destino: iPhone físico o simulador.
5. ▶ Run.

## Primera subida a App Store Connect

1. Cuenta [Apple Developer Program](https://developer.apple.com) (~99 USD/año).
2. [App Store Connect](https://appstoreconnect.apple.com) → My Apps → + → New App  
   - Bundle ID: `com.gooddy.app`  
   - Nombre: gooddy  
3. Privacy Policy URL + Support URL (obligatorias).
4. En Xcode: **Product → Archive** → Distribute → App Store Connect → Upload.
5. En Connect: elegir el build → capturas → App Privacy → Submit for Review.

## Lo que el binario ya cumple

- Política, términos y soporte dentro de la app (Ajustes y al guardar el plan) y como páginas estáticas: `public/privacy.html`, `public/terms.html`, `public/support.html`.
- Consentimiento de datos de salud separado del marketing (el marketing queda desmarcado).
- Edad mínima 16, con casilla obligatoria al crear el perfil.
- Borrar la cuenta y todos los datos en Ajustes. No hay copia en la nube.
- iOS: `ITSAppUsesNonExemptEncryption` = false y `PrivacyInfo.xcprivacy` (sin tracking, sin datos enviados fuera del teléfono).
- Android: `allowBackup=false`, reglas de backup vacías, permiso `POST_NOTIFICATIONS`, `targetSdk` 36.
- Las predicciones del ciclo se muestran como estimaciones, no como anticoncepción ni consejo médico.

Antes de enviar, publica esas tres páginas en un `https://` público y pega las URLs en App Store Connect y Play Console. La ficha también necesita un email de soporte real.

## Respuestas para los formularios

**App Privacy (Apple):** si el usuario crea cuenta, los datos de salud se guardan en Supabase, solo en su fila, por HTTPS. Declara Health y Email como datos ligados a la identidad, sin tracking, sin publicidad, sin venta. Cifrado en tránsito: sí. Categoría: Health & Fitness. Edad: 16+.

**Sin cuenta:** el modo local no sube datos. En cuanto la cuenta esté activa, el formulario de la tienda debe decir que sí se recogen.

**Data safety (Google): no se recogen ni se comparten datos de usuario** fuera del teléfono. La app no está dirigida a niños. Eliminación de cuenta: dentro de la app. Notificaciones: opcionales.

## Notas para el revisor (sugeridas)

- Cycle tracking is educational only — not contraception or medical advice.
- All wellness data stays on-device (no cloud account required).
- To preview: complete onboarding → log a period → open Home / Cycle.

## Iconos / splash (siguiente)

Colocá:

- `resources/icon.png` (1024×1024, sin transparencia)
- `resources/splash.png`

Luego:

```bash
npx capacitor-assets generate --ios
npx cap sync ios
```
