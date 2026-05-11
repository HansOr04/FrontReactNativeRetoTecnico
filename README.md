# BancoApp — Prueba Técnica Frontend React Native

## Descripción

App React Native para gestión de productos financieros bancarios.
Consume el backend Node.js local (repo-interview-main) a través de su API REST.

---

## Stack tecnológico

| Herramienta | Versión |
|---|---|
| React Native | 0.85.3 |
| TypeScript | 5.8.3 |
| React Navigation (native-stack) | v7 |
| Jest | 29 |
| @testing-library/react-native | 13 |

---

## Arquitectura

El proyecto sigue **Clean Architecture** con cuatro capas:

```
┌─────────────────────────────────────────────────────────┐
│  Presentation  (screens/, components/)                  │
│  ProductListScreen · ProductDetailScreen · FormScreen   │
│  ProductItem · SearchBar · FormField                    │
└──────────────────────┬──────────────────────────────────┘
                       │ usa
┌──────────────────────▼──────────────────────────────────┐
│  Application  (hooks/)                                  │
│  useProducts · useProductForm                           │
└──────────────────────┬──────────────────────────────────┘
                       │ depende de (interfaz)
┌──────────────────────▼──────────────────────────────────┐
│  Domain  (model/, repository/)                          │
│  Product · ProductFormData · IProductRepository         │
│  FieldValidation · FormValidationState                  │
└──────────────────────▲──────────────────────────────────┘
                       │ implementa
┌──────────────────────┴──────────────────────────────────┐
│  Infrastructure  (api/)                                 │
│  ProductApiRepository · apiClient                       │
└─────────────────────────────────────────────────────────┘
```

### Por qué esta arquitectura facilita el testing

Los hooks reciben el repositorio como parámetro con un default al singleton real:

```typescript
export const useProducts = (
  repository: IProductRepository = productRepository,
) => { ... };
```

En los tests se inyecta un `jest.Mocked<IProductRepository>` sin tocar el módulo real,
sin `jest.mock()` en los archivos y sin llamadas HTTP reales. Cada test es un
simple `renderHook(() => useProducts(mockRepository))`.

---

## Requisitos previos

- Node.js 18+
- React Native CLI configurado (no Expo)
- Backend corriendo: `npm run start:dev` en `repo-interview-main`
  → servidor en `http://localhost:3002`

---

## Instalación

```bash
npm install

# Solo macOS/iOS
cd ios && pod install && cd ..
```

---

## Cómo ejecutar

```bash
# Android
npx react-native run-android

# iOS
npx react-native run-ios
```

---

## Configuración de la URL del backend

Editar `src/infrastructure/api/apiClient.ts`, línea `BASE_URL`:

| Entorno | URL |
|---|---|
| Emulador Android | `http://10.0.2.2:3002/bp` |
| Emulador iOS / macOS | `http://localhost:3002/bp` |
| Dispositivo físico | `http://{TU_IP_LOCAL}:3002/bp` |

---

## Tests

```bash
npm test                        # ejecutar todos los tests
npm test -- --coverage          # con reporte de cobertura
npm test -- --watchAll          # modo watch para desarrollo
```

---

## Funcionalidades implementadas (SemiSenior)

| # | Funcionalidad | Estado |
|---|---|---|
| F1 | Lista de productos con navegación al detalle | ✅ |
| F2 | Búsqueda en tiempo real por nombre e ID | ✅ |
| F3 | Contador de registros filtrados | ✅ |
| F4 | Formulario de creación con validaciones y verificación de ID único | ✅ |
| F5 | Formulario de edición con ID deshabilitado | ✅ deseable SemiSenior |
| F6 | Modal de eliminación con confirmación | ✅ deseable SemiSenior |
| — | Skeleton loading animado en pantalla principal | ✅ deseable Senior |

---

## Cobertura de tests

| Suite | Tests |
|---|---|
| `useProducts` | 8 tests unitarios |
| `useProductForm` | 12 tests unitarios |
| `App` | 1 test de integración |
| **Total** | **21 tests** |

---

## Verificación final (checklist de entrega)

```bash
# 1. Dependencias
npm install

# 2. TypeScript sin errores
npx tsc --noEmit

# 3. Tests en verde
npm test
```

Luego levantar el backend y el emulador:

```bash
# Terminal 1 — backend
cd ../repo-interview-main && npm run start:dev

# Terminal 2 — app
npx react-native run-android   # o run-ios
```

Verificar en el emulador:

- [ ] Lista carga productos del backend
- [ ] Búsqueda filtra en tiempo real
- [ ] Contador actualiza al buscar
- [ ] Tap en producto → pantalla de detalle
- [ ] Botón Editar → formulario con datos pre-cargados
- [ ] ID deshabilitado en modo edición
- [ ] Botón Eliminar → modal de confirmación
- [ ] Confirmar eliminación → vuelve a la lista sin el producto
- [ ] Formulario vacío → muestra errores de validación en todos los campos
- [ ] ID duplicado → "Este ID ya está registrado"
- [ ] Fecha revisión se calcula automáticamente al ingresar fecha liberación
- [ ] Botón Reiniciar → limpia el formulario y borra errores
