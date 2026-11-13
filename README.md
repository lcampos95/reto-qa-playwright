# Reto técnico QA Automation · Playwright + TypeScript

[![Playwright Tests](https://github.com/lcampos95/reto-qa-playwright/actions/workflows/playwright.yml/badge.svg)](https://github.com/lcampos95/reto-qa-playwright/actions/workflows/playwright.yml)

Suite de pruebas automatizadas de **UI** sobre [SauceDemo](https://www.saucedemo.com) y de **API** sobre [ServeRest](https://serverest.dev), construida con Playwright y el runner `@playwright/test`.

El repositorio está organizado en **dos proyectos de pruebas** que comparten una sola configuración y un solo reporte:

| Proyecto | Carpeta | Qué prueba | Proyectos de Playwright |
|---|---|---|---|
| **Frontend** | `frontend/` | UI de SauceDemo (UI-01 a UI-04), escrita en **BDD (Gherkin)** sobre **Page Object Model** | `frontend-setup`, `frontend-chromium`, `frontend-firefox` |
| **Backend** | `backend/` | API de ServeRest (API-01 a API-05) | `backend` |

| | |
|---|---|
| **Escenarios** | 4 de UI (UI-01 a UI-04) y 5 de API (API-01 a API-05) |
| **Navegadores UI** | Chromium y Firefox |
| **Patrón UI** | Page Object Model con componentes y fixtures; escenarios en BDD/Gherkin en español con [playwright-bdd](https://vitalets.github.io/playwright-bdd/) |
| **Reporte** | Reporte HTML de Playwright (+ trazas, capturas y video en fallos) |
| **CI** | GitHub Actions; el reporte se publica como artefacto |

---

## Índice

1. [Requisitos](#1-requisitos)
2. [Instalación](#2-instalación)
3. [Ejecución](#3-ejecución)
4. [Reporte](#4-reporte)
5. [Configuración y variables de entorno](#5-configuración-y-variables-de-entorno)
6. [Estructura del proyecto](#6-estructura-del-proyecto)
7. [Escenarios automatizados](#7-escenarios-automatizados)
8. [Decisiones técnicas](#8-decisiones-técnicas)
9. [Pipeline de CI](#9-pipeline-de-ci)
10. [Cambios frecuentes](#10-cambios-frecuentes)
11. [Uso de herramientas de IA](#11-uso-de-herramientas-de-ia)

---

## 1. Requisitos

- **Node.js 20 o superior** (recomendado 22, la versión fijada en `.nvmrc`).
  > El enunciado pide Node 18+, pero la versión actual de Playwright (1.65) exige Node ≥ 20.
- **npm** 10 o superior (viene con Node).
- **Git**.
- Opcional: Visual Studio Code con la extensión oficial *Playwright Test for VS Code* (recomendada en `.vscode/extensions.json`).

## 2. Instalación

```bash
git clone https://github.com/lcampos95/reto-qa-playwright.git
cd reto-qa-playwright

npm ci                                   # instala dependencias exactas del package-lock
npx playwright install chromium firefox  # descarga los navegadores
```

> En Linux puede hacer falta `npx playwright install --with-deps chromium firefox` para instalar también las librerías del sistema.

No hace falta crear ningún archivo de configuración: los valores del entorno de práctica ya están en `env/.env.qa` (ver [sección 5](#5-configuración-y-variables-de-entorno)).

## 3. Ejecución

| Qué ejecutar | Comando |
|---|---|
| **Suite completa** (frontend + backend) | `npx playwright test` · o `npm test` |
| **Solo UI** · proyecto frontend (Chromium + Firefox) | `npm run test:frontend` · alias `npm run test:ui` |
| Solo UI en Chromium | `npm run test:frontend:chromium` |
| **Solo API** · proyecto backend | `npm run test:backend` · alias `npm run test:api` |
| Solo los escenarios marcados `@smoke` | `npm run test:smoke` |
| Un escenario concreto | `npx playwright test -g "UI-03"` · o por tag de Gherkin `--grep @UI-03` |
| UI con navegador visible | `npm run test:headed` |
| Modo interactivo (UI Mode) | `npx playwright test --ui` |
| Typecheck + lint | `npm run check` |
| Solo generar los tests BDD desde los `.feature` | `npm run bddgen` |
| Listar los pasos BDD disponibles | `npm run bdd:steps` |

Equivalentes sin scripts de npm:

```bash
npx playwright test --project=frontend-chromium --project=frontend-firefox   # solo UI
npx playwright test --project=backend                                        # solo API
```

Al ejecutar el frontend, Playwright corre primero `frontend-setup` (inicio de sesión que se reutiliza); no hay que lanzarlo a mano.

> **BDD sin pasos extra.** Normalmente playwright-bdd exige `npx bddgen && npx playwright test`. Aquí la propia `playwright.config.ts` genera los tests desde los `.feature` al arrancar (`frontend/config/bdd.ts`), así que basta con `npx playwright test`, como pide el reto. Los archivos generados van a `.features-gen/` (ignorado por git) y se regeneran en cada ejecución, por eso nunca quedan desactualizados.

## 4. Reporte

Cada ejecución genera el reporte HTML en `playwright-report/`. Para abrirlo:

```bash
npm run report        # equivale a: npx playwright show-report
```

En el reporte cada escenario muestra sus pasos (`test.step`) y sus etiquetas (`@ui`, `@api`, `@smoke`). Si un test falla, se adjuntan captura de pantalla, video y la **traza** de Playwright, que se puede abrir desde el mismo reporte para ver el DOM, la red y la consola en cada acción.

En CI el reporte se descarga desde la pestaña **Actions → ejecución → Artifacts → `playwright-report`**.

## 5. Configuración y variables de entorno

Ningún test contiene URLs ni credenciales. Todo se lee desde `shared/config/env.ts`, que carga los valores con esta precedencia (de mayor a menor):

1. **Variables de entorno del sistema / CI**
2. **`.env`** en la raíz (local, ignorado por git; plantilla en `.env.example`)
3. **`env/.env.<TEST_ENV>`** (por defecto `env/.env.qa`, versionado)

| Variable | Uso | Valor en `env/.env.qa` |
|---|---|---|
| `TEST_ENV` | Archivo de entorno a cargar desde `env/` | `qa` (por defecto) |
| `UI_BASE_URL` | URL de SauceDemo | `https://www.saucedemo.com` |
| `SAUCE_STANDARD_USER` | Usuario con compra normal | `standard_user` |
| `SAUCE_LOCKED_USER` | Usuario bloqueado | `locked_out_user` |
| `SAUCE_PASSWORD` | Contraseña común de SauceDemo | `secret_sauce` |
| `API_BASE_URL` | URL de ServeRest | `https://serverest.dev` |

Si falta una variable o una URL está mal escrita, la suite falla al arrancar con un mensaje claro en lugar de fallar más tarde en un test.

> `env/.env.qa` se versiona porque sus valores son **públicos** (SauceDemo los muestra en su login) y así `npx playwright test` funciona tras clonar. En un proyecto real ese archivo no llevaría secretos: la contraseña llegaría como variable de entorno o secreto del pipeline.

Ejemplo para sobrescribir un valor puntual:

```bash
# macOS / Linux
API_BASE_URL=http://localhost:3000 npm run test:backend
```

```powershell
# Windows PowerShell
$env:API_BASE_URL="http://localhost:3000"; npm run test:backend
```

## 6. Estructura del proyecto

```
.
├── frontend/                          # PROYECTO FRONTEND · UI de SauceDemo (BDD + POM)
│   ├── features/                      # QUÉ se prueba: escenarios en Gherkin (español)
│   │   ├── login.feature              # UI-01, UI-02
│   │   ├── compra.feature             # UI-03
│   │   └── ordenamiento.feature       # UI-04
│   ├── steps/                         # CÓMO se traduce cada paso: usa los page objects
│   │   ├── comun.steps.ts             # Pasos compartidos entre características
│   │   ├── login.steps.ts
│   │   ├── compra.steps.ts
│   │   └── ordenamiento.steps.ts
│   ├── pages/                         # DÓNDE están los elementos: Page Object Model
│   │   ├── BasePage.ts                # Ruta + título + cabecera comunes
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutInformationPage.ts
│   │   ├── CheckoutOverviewPage.ts
│   │   ├── CheckoutCompletePage.ts
│   │   └── components/
│   │       ├── Header.ts              # Carrito (enlace y contador)
│   │       └── CartItemList.ts        # Lista de productos (carrito y resumen)
│   ├── fixtures/
│   │   └── ui.fixtures.ts             # Page objects, contexto del escenario y Given/When/Then
│   ├── config/
│   │   ├── bdd.ts                     # Configuración de playwright-bdd y generación automática
│   │   └── auth-state.ts              # Ruta del storageState reutilizado
│   ├── data/
│   │   └── users.ts                   # Roles ("standard", "bloqueado") -> usuario de la configuración
│   ├── setup/
│   │   └── auth.setup.ts              # Login único de standard_user (storageState)
│   └── utils/
│       └── price.ts                   # Parseo y suma de precios en centavos
│
├── backend/                           # PROYECTO BACKEND · API de ServeRest
│   ├── api/
│   │   ├── ServeRestClient.ts         # Cliente de la API sobre el request context
│   │   ├── ApiDataRegistry.ts         # Registro y limpieza de datos creados por test
│   │   └── types.ts                   # Contratos (payloads y respuestas)
│   ├── data/
│   │   └── api.data.ts                # Builders de datos únicos y mensajes de la API
│   ├── fixtures/
│   │   └── api.fixtures.ts            # Cliente, precondiciones (adminUser, adminToken) y limpieza
│   ├── utils/
│   │   └── jwt.ts                     # Decodificación del payload de un JWT
│   └── tests/
│       ├── usuarios.spec.ts           # API-01, API-05
│       ├── login.spec.ts              # API-02
│       └── produtos.spec.ts           # API-03, API-04
│
├── shared/
│   └── config/
│       └── env.ts                     # Carga y validación de la configuración (usada por ambos)
├── env/
│   └── .env.qa                        # Configuración del entorno de práctica
├── .github/workflows/playwright.yml   # Pipeline de CI
├── playwright.config.ts               # Proyectos frontend-* y backend, reporter, trazas
├── eslint.config.mjs                  # Reglas de TypeScript y de Playwright
├── tsconfig.json                      # TypeScript estricto + alias (@frontend, @backend, @shared)
└── .env.example                       # Plantilla para overrides locales
```

**Dos proyectos, una configuración.** `frontend/` y `backend/` no se importan entre sí: cada uno tiene su propio código de soporte, datos, fixtures y tests. Lo único compartido es la carga de configuración (`shared/config/env.ts`). Se mantiene un solo `package.json` y un solo `playwright.config.ts` porque el reto pide que la suite completa se ejecute con `npx playwright test` y genere un reporte HTML; cada parte se puede ejecutar por separado con su proyecto de Playwright.

**Capas del frontend (BDD + POM):**

```
features/*.feature  ──►  steps/*.steps.ts  ──►  pages/*.ts  ──►  navegador
  (qué, en Gherkin)       (Dado/Cuando/Entonces)   (locators y acciones)
```

- **Features** (`frontend/features/`): describen el comportamiento en lenguaje de negocio, con los datos de ejemplo (productos, comprador, mensajes esperados). No contienen selectores, URLs ni credenciales.
- **Steps** (`frontend/steps/`): implementan cada frase. Los pasos *Cuando* llaman a métodos de los page objects y los pasos *Entonces* hacen las aserciones. No usan selectores directamente.
- **Page objects** (`frontend/pages/`): la única capa que conoce la pantalla (locators y acciones). Solo validan que la página cargó o que una acción tuvo efecto.

**Separación de responsabilidades en el backend:**

- **Tests** (`backend/tests/`): describen el escenario y contienen las aserciones de negocio.
- **Cliente de API** (`backend/api/`): sabe *cómo* llamar a cada endpoint; no valida, devuelve la respuesta para que el test decida.
- **Datos** (`*/data/`): datos de prueba y textos esperados en un único lugar.
- **Fixtures** (`*/fixtures/`): conectan todo y preparan/limpian precondiciones.

## 7. Escenarios automatizados

### Frontend · UI de SauceDemo (`frontend/features/`)

| ID | Archivo | Qué se valida |
|---|---|---|
| UI-01 | `login.feature` | Login con `standard_user` → URL `/inventory.html`, título *Products*, listado con productos, carrito visible y sin mensaje de error. |
| UI-02 | `login.feature` | Login con `locked_out_user` → mensaje exacto de usuario bloqueado, sigue en el login y no hay productos. Además, si intenta entrar directo a `/inventory.html`, es devuelto al login con el mensaje de acceso restringido. |
| UI-03 | `compra.feature` | Agrega 2 productos (contador = 2) → el carrito contiene exactamente esos productos con su precio y cantidad 1 → completa datos del comprador → en el resumen, **Item total = suma de los precios** de los productos elegidos (y Total = Item total + Tax) → confirmación *Thank you for your order!* y carrito vacío. |
| UI-04 | `ordenamiento.feature` | Ordena por *Price (low to high)* → la opción activa cambia y la **lista completa** de precios queda en el orden esperado (misma cantidad de elementos y orden exacto). Antes verifica que el listado inicial no estaba ya ordenado, para que la prueba realmente demuestre algo. |

Ejemplo (`frontend/features/ordenamiento.feature`):

```gherkin
# language: es
@ui
Característica: Ordenamiento del listado de productos

  @UI-04
  Escenario: UI-04 Ordenar por precio de menor a mayor
    Dado que el usuario autenticado está en el listado de productos
    Y el listado inicial no está ordenado por precio
    Cuando ordena los productos por "Price (low to high)"
    Entonces el criterio de orden activo es "Price (low to high)"
    Y el listado completo queda ordenado por precio de menor a mayor
```

### Backend · API de ServeRest (`backend/tests/`)

| ID | Archivo | Qué se valida |
|---|---|---|
| API-01 | `usuarios.spec.ts` | `POST /usuarios` (admin) → `201`, JSON, body `{ message: "Cadastro realizado com sucesso", _id }` con `_id` de 16 caracteres. Luego `GET /usuarios/{_id}` confirma que se guardó con los datos enviados. |
| API-02 | `login.spec.ts` | `POST /login` → `200`, mensaje de éxito y `authorization` con formato `Bearer <JWT>`. El payload del token pertenece al email del usuario. |
| API-03 | `produtos.spec.ts` | `POST /produtos` con token admin → `201` + `_id`. `GET /produtos/{_id}` devuelve **exactamente** `nome`, `preco`, `descricao` y `quantidade` enviados. |
| API-04 | `produtos.spec.ts` | `POST /produtos` sin header `Authorization` → `401` con el mensaje de token ausente. Luego se verifica que el producto **no** fue creado. |
| API-05 | `usuarios.spec.ts` | `POST /usuarios` con un email ya registrado → `400` con *Este email já está sendo usado*. Sigue habiendo un único usuario con ese email y sus datos no cambiaron. |

## 8. Decisiones técnicas

**BDD sobre POM, sin cambiar de runner.** El reto exige `@playwright/test`, así que no se usó Cucumber.js (que reemplaza el runner). Se usó **playwright-bdd**: convierte cada escenario Gherkin en un test de Playwright, por lo que se conservan fixtures, paralelismo, proyectos por navegador, reintentos, trazas y el reporte HTML (cada paso Gherkin aparece como un paso del test). Los `.feature` están en español (`# language: es`) y son documentación viva que puede leer alguien de negocio; el POM sigue siendo el patrón de diseño y la única capa que toca la UI.

**Pasos declarativos y reutilizables.** Las frases describen intención ("agrega al carrito los productos"), no clics. Los datos de ejemplo viven en el `.feature` (tablas de productos y comprador, mensajes esperados), así un cambio de datos no requiere tocar código. Los parámetros (`{string}`, `{int}`, tablas) permiten reutilizar un mismo paso, y `missingSteps: 'fail-on-gen'` hace que una frase sin implementar falle al generar, con el código sugerido para implementarla.

**Estado dentro de un escenario.** Lo que un paso necesita pasarle a otro (por ejemplo, los productos elegidos y sus precios) se guarda en la fixture `ctx`, que se crea vacía en cada escenario. No hay variables globales ni estado compartido entre escenarios.

**Usuarios por rol.** Los `.feature` dicen `usuario "standard"` o `usuario "bloqueado"`; `frontend/data/users.ts` resuelve el usuario real desde la configuración. Así no hay credenciales en los escenarios.

**Page Object Model con componentes.** Cada pantalla es una clase con sus locators y acciones. Las partes repetidas en varias pantallas son componentes (`Header`, `CartItemList`), así el carrito y el resumen del checkout comparten la misma lógica de lectura. `BasePage` define cómo se comprueba que una página cargó (URL + título), de forma uniforme.

**Fixtures en lugar de `new Page()` en cada test.** Los tests piden los page objects que necesitan (`async ({ inventoryPage, cartPage }) => ...`) y Playwright los crea sobre el `page` aislado de ese test. En API, las precondiciones (`adminUser`, `adminToken`) son fixtures: cada test obtiene datos propios y la limpieza ocurre automáticamente al final.

**Locators estables.** SauceDemo expone atributos `data-test`; se configuró `testIdAttribute: 'data-test'` para usar `getByTestId()`. Los productos se localizan **por nombre**, no por posición ni por ids derivados del nombre, y los botones por rol (`getByRole('button', { name: 'Add to cart' })`).

**Sin esperas fijas.** Toda sincronización usa aserciones *web-first* (`toHaveURL`, `toHaveText`, `toHaveCount`, `toBeVisible`) que reintentan hasta cumplirse. Por ejemplo, tras pulsar *Add to cart* se espera a que el botón cambie a *Remove* antes de seguir. La regla `playwright/no-wait-for-timeout` de ESLint impide introducir `waitForTimeout`.

**Reutilización de sesión (opcional del reto).** El proyecto `frontend-setup` inicia sesión una vez y guarda el `storageState` (cookies + localStorage). Los proyectos `frontend-chromium` y `frontend-firefox` arrancan con esa sesión, cada test en su propio contexto. UI-01 y UI-02 prueban el login, así que `login.feature` lleva el tag `@sin-sesion`: la fixture `storageState` lo detecta (vía `$tags`) y esos escenarios arrancan con el navegador limpio. La cookie de SauceDemo dura 10 minutos, más que una ejecución completa.

**Independencia y paralelismo.** `fullyParallel: true`. Ningún test depende de otro: los de UI tienen contexto propio (carrito incluido) y los de API crean sus propios datos. Se puede comprobar ejecutando un escenario solo (`npx playwright test -g "UI-04"`) o la suite repetida en paralelo (`npx playwright test --workers=4 --repeat-each=3`).

**Datos únicos en la API.** Los builders (`buildUser`, `buildProduct`) generan nombres y emails con `timestamp + fragmento de UUID`, únicos entre ejecuciones, personas y workers en paralelo sobre la instancia pública compartida.

**Limpieza de datos (opcional del reto).** `ApiDataRegistry` registra lo que crea cada test y lo elimina al terminar: primero productos (necesitan el token de un admin que aún exista) y después usuarios. Si una limpieza falla no se marca el test como fallido; se deja una anotación `cleanup-warning` visible en el reporte.

**Precios en centavos.** `29.99 + 9.99` en coma flotante da `39.980000000000004`. Los precios se convierten a enteros en centavos (`frontend/utils/price.ts`) para comparar sumas sin errores de redondeo.

**Aserciones que comprueban comportamiento, no solo códigos.** Además del status, se compara el body completo con `toEqual` (detecta campos de más o de menos), se verifica la persistencia con un `GET` posterior y, en los casos de rechazo, que no hubo efectos secundarios (no se creó el producto ni un usuario duplicado).

**Navegadores.** El frontend corre en Chromium y Firefox (opcional del reto). El backend es un proyecto sin navegador: arranca más rápido y no se ejecuta una vez por navegador.

**Calidad estática.** TypeScript estricto y ESLint con reglas *type-aware* (`no-floating-promises` detecta `await` olvidados, causa habitual de tests inestables) y las reglas recomendadas de `eslint-plugin-playwright`.

**Reintentos.** `retries: 0` en local para no esconder inestabilidad. En CI se permite 1 reintento por ser sitios públicos externos; si un test pasa al reintentarlo, el reporte lo marca como *flaky*.

**Verificación de la propia suite.** Durante el desarrollo se ejecutó la suite contra dobles locales de SauceDemo y ServeRest en los que se inyectaron defectos de forma controlada (Item total con un centavo extra, orden por nombre en vez de precio, usuario bloqueado que entra, carrito que pierde un producto, email duplicado aceptado, producto creado sin token, precio distinto al consultar, token de otro usuario). Cada defecto hizo fallar el test correspondiente.

## 9. Pipeline de CI

`.github/workflows/playwright.yml` se ejecuta en cada push o pull request a `main` y también manualmente (*Run workflow*):

1. Instala dependencias con `npm ci` (con caché).
2. Ejecuta `npm run check` (typecheck + lint).
3. Instala Chromium y Firefox.
4. Ejecuta `npx playwright test` (proyectos frontend y backend).
5. Publica `playwright-report/` como artefacto (14 días) y, si hay fallos, también `test-results/` con trazas y videos.

## 10. Cambios frecuentes

| Cambio | Dónde |
|---|---|
| Comprar otros productos en UI-03 | Tabla de productos en `frontend/features/compra.feature` (sin tocar código) |
| Probar otro criterio de orden | En `ordenamiento.feature`: `"Price (high to low)"` y `... de mayor a menor` (los pasos ya lo soportan) |
| Agregar un navegador (p. ej. WebKit) | Nuevo proyecto en `playwright.config.ts` copiando `frontend-firefox` con `devices['Desktop Safari']` |
| Apuntar a otro entorno | Crear `env/.env.<nombre>` y ejecutar con `TEST_ENV=<nombre>` |
| Cambiar un texto esperado | UI: en el `.feature` correspondiente · API: `API_MESSAGES` en `backend/data/api.data.ts` |
| Nuevo escenario de UI | Escribirlo en un `.feature`; si usa una frase nueva, `npx playwright test` muestra el código sugerido del paso para pegarlo en `frontend/steps/` |
| Nuevo endpoint | Método en `ServeRestClient` + tipo en `backend/api/types.ts` |

## 11. Uso de herramientas de IA

Se usó **Claude (Anthropic)** como asistente durante el reto para:

- Proponer la estructura inicial del proyecto, los page objects, los escenarios Gherkin y sus pasos, el cliente de API y las fixtures.
- Redactar un primer borrador de este README y de los mensajes de commit.
- Contrastar los locators y textos esperados con el bundle JavaScript publicado de SauceDemo, y los mensajes y respuestas de ServeRest con su API pública y su código fuente.

Correcciones y ajustes hechos sobre lo generado:

- **BDD con el runner de Playwright:** se descartó Cucumber.js porque reemplaza el runner `@playwright/test` que exige el reto; se usó playwright-bdd. Como su flujo estándar requiere `npx bddgen` antes de `npx playwright test`, se añadió la generación automática desde la configuración (con protección para no ejecutarse dentro de `bddgen` ni en los workers).
- **Versión de Node:** el enunciado indica Node 18+, pero Playwright 1.65 requiere Node ≥ 20. Se documentó y se fijó la versión en `.nvmrc`.
- **Formato del `_id`:** la primera versión solo validaba que fuera alfanumérico; se ajustó a 16 caracteres según el esquema de validación de ServeRest.
- **Lint en API-02:** un `test.step` asíncrono sin `await` no pasaba ESLint (`require-await`); se reescribió como una aserción con mensaje.
- **Redirección de SauceDemo:** al navegar a `/inventory.html` el sitio responde con HTTP 404 y la SPA redirige (patrón de GitHub Pages). Se verificó que las aserciones *web-first* (`toHaveURL`, `not.toHaveURL`) lo manejan sin esperas fijas.
- **Duración de la sesión:** se confirmó que la cookie de sesión de SauceDemo dura 10 minutos, suficiente para reutilizar el `storageState` dentro de una ejecución.

Todo el código fue revisado, ejecutado y puede explicarse y modificarse en la sesión de revisión.
