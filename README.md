# BancoApp

Aplicación React Native con TypeScript para gestión de productos financieros bancarios.
Implementa Clean Architecture con separación estricta entre dominio, aplicación e infraestructura.

## Requisitos previos

| Herramienta | Versión mínima |
|-------------|----------------|
| Node.js | 18.x |
| React Native CLI | 0.85+ |
| Android Studio / Xcode | según plataforma |
| JDK | 17 (Android) |

Asegúrate de haber completado la [guía de configuración del entorno](https://reactnative.dev/docs/set-up-your-environment) antes de continuar.

## Levantar el proyecto

### 1. Instalar dependencias

```bash
npm install
```

Para iOS (solo macOS):
```bash
cd ios && pod install && cd ..
```

### 2. Configurar la URL del backend

El cliente HTTP apunta por defecto a `http://localhost:3002/bp`.
Para cambiarlo edita una sola línea en `src/infrastructure/api/apiClient.ts`:

```ts
const BASE_URL = 'http://localhost:3002/bp'; // ← cambia esta URL
```

Si el backend corre en un dispositivo físico o emulador, usa la IP de tu máquina
(p.ej. `http://192.168.1.x:3002/bp`) en lugar de `localhost`.

### 3. Iniciar Metro

```bash
npm start
```

### 4. Ejecutar la app

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

## Ejecutar los tests

```bash
npm test
```

Para modo watch:
```bash
npm test -- --watchAll
```

## Estructura del proyecto

```
src/
├── domain/                        # Entidades y contratos (sin dependencias externas)
│   ├── model/
│   │   └── Product.ts             # Interface Product, ProductFormData, ProductFormErrors
│   └── repository/
│       └── IProductRepository.ts  # Contrato de acceso a datos
│
├── infrastructure/                # Implementaciones concretas de los contratos
│   └── api/
│       ├── apiClient.ts               # Cliente HTTP base (fetch)
│       └── ProductApiRepository.ts    # Implementación HTTP de IProductRepository
│
├── application/                   # Lógica de negocio — hooks reutilizables
│   └── hooks/
│       ├── useProducts.ts         # Listado, búsqueda y eliminación
│       └── useProductForm.ts      # Validaciones y envío del formulario
│
├── presentation/                  # UI pura — sin lógica de negocio
│   ├── screens/
│   │   ├── ProductListScreen.tsx
│   │   ├── ProductDetailScreen.tsx
│   │   └── ProductFormScreen.tsx
│   ├── components/
│   │   ├── ProductItem.tsx        # Fila del listado
│   │   ├── SearchBar.tsx          # Campo de búsqueda
│   │   └── FormField.tsx          # Input con label y error
│   └── navigation/
│       └── AppNavigator.tsx       # Stack navigator y RootStackParamList
│
├── constants/
│   └── colors.ts                  # Paleta de colores (amarillo banco)
│
└── __tests__/
    ├── useProducts.test.ts
    └── useProductForm.test.ts
```

## Principios aplicados

- **Clean Architecture**: dominio sin dependencias externas, infraestructura intercambiable.
- **SRP**: cada archivo tiene una única responsabilidad.
- **DIP**: los hooks y screens dependen de `IProductRepository`, no de `ProductApiRepository`.
- **Sin lógica en UI**: los componentes solo renderizan; los hooks contienen todo el comportamiento.
- **TypeScript estricto**: `strict: true` en tsconfig, sin `any` explícito.
- **Estilos**: `StyleSheet.create()` puro — sin frameworks de terceros.

## Endpoints del backend (localhost:3002)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /bp/products | Listar todos los productos |
| POST | /bp/products | Crear producto |
| PUT | /bp/products/:id | Actualizar producto |
| DELETE | /bp/products/:id | Eliminar producto |
| GET | /bp/products/verification?id=X | Verificar si el ID existe |

---

# Getting Started (React Native original)

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
