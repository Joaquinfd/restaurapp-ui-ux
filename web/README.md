# RestaurApp - Frontend (UI/UX)

Documentación completa para la instalación, configuración y ejecución del frontend de RestaurApp.

---

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Instalación de Herramientas](#instalación-de-herramientas)
- [Instalación y Configuración del Proyecto](#instalación-y-configuración-del-proyecto)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Comandos Disponibles](#comandos-disponibles)
- [shadcn/ui](#shadcnui)
- [Path Aliases](#path-aliases)
- [Troubleshooting](#troubleshooting)

---

## Ejecución en local para revisión

- Tener requisitos previos (NVM, Node 24, pnpm)
- Ejecutar:

```bash
pnpm install
pnpm dev
```
- Abrir ```http://localhost:3000```

## 📌 Requisitos Previos

Antes de comenzar, asegúrate de tener:

- **Windows, macOS o Linux**
- **Git** instalado ([descargar](https://git-scm.com/))
- **Acceso a terminal/PowerShell**

---

## 🔧 Instalación de Herramientas

### Paso 1: Instalar NVM (Node Version Manager)

#### **En Windows:**

1. Descarga el instalador: [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)
2. Descarga `nvm-setup.exe` (la última versión)
3. Ejecuta el instalador y sigue los pasos por defecto
4. Reinicia PowerShell o CMD
5. Verifica la instalación:

```powershell
nvm --version
```

#### **En macOS/Linux:**

```bash
# Usa curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# O usa Homebrew (macOS)
brew install nvm

# Reinicia la terminal y verifica
nvm --version
```

---

### Paso 2: Instalar Node.js y npm con NVM

```bash
# Ver versiones disponibles
nvm list available

# Instalar la versión LTS recomendada (v20.x)
nvm install 24

# Establecer como versión por defecto
nvm use 24

# Verificar que está instalado
node --version   # v24.x.x
npm --version    # 10.x.x
```

---

### Paso 3: Instalar pnpm

pnpm es un gestor de paquetes más rápido y eficiente que npm.

```bash
# Instalar pnpm globalmente
npm install -g pnpm

# Verificar instalación
pnpm --version   # 8.x.x o superior

# Ver configuración de pnpm
pnpm config list
```

---

## 📦 Instalación y Configuración del Proyecto

### Paso 1: Clonar el Repositorio

```bash
# Navega a la carpeta donde quieres el proyecto
cd ~/Documentos  # o tu carpeta preferida

# Clona el repositorio
git clone https://github.com/tu-usuario/restaurapp-ui-ux.git

# Entra a la carpeta
cd restaurapp-ui-ux

# Verifica que estés en la rama correcta (main o develop)
git branch
```

---

### Paso 2: Instalar Dependencias

```bash
# Instala todas las dependencias del proyecto
pnpm install

# Esto creará la carpeta node_modules y el archivo pnpm-lock.yaml
```

Si tienes problemas, prueba limpiar e instalar de nuevo:

```bash
# Limpiar caché
pnpm store prune

# Instalar nuevamente
pnpm install
```

---

### Paso 3: Verificar la Instalación

```bash
# Ver versiones instaladas
pnpm list next react react-dom

# Ver todas las dependencias
pnpm list

# Verificar scripts disponibles
pnpm run
```

Deberías ver una salida similar a:

```
 pnpm run

Lifecycles:
  dev       next dev
  build     next build
  start     next start
  lint      next lint
```

---

## 🚀 Ejecutar el Proyecto

### Modo Desarrollo (con hot-reload)

Este es el modo recomendado mientras desarrollas. Cualquier cambio se reflejará inmediatamente.

```bash
# Desde la carpeta raíz del proyecto
pnpm dev
```

**Resultado esperado:**

```
> restaurapp-ui-ux@0.1.0 dev
> next dev

  ▲ Next.js 14.x.x
  
  ✓ Ready in 2.5s
  
  Local:        http://localhost:3000
  Environments: .env.local

  ✓ Compiled /src/app/layout.tsx
  ✓ Compiled /src/app/page.tsx
```

Abre tu navegador en **http://localhost:3000** y verás la aplicación.

### Para detener el servidor:

Presiona **Ctrl+C** en la terminal.

---

### Modo Producción

```bash
# Compilar la aplicación
pnpm build

# Iniciar el servidor de producción
pnpm start

# La app estará en http://localhost:3000
```

---

## 📁 Estructura del Proyecto

```
restaurapp-ui-ux/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Layout raíz
│   │   ├── page.tsx            # Página home
│   │   ├── globals.css         # Estilos globales
│   │   └── (routes)/           # Rutas anidadas
│   │       ├── about/
│   │       └── contact/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       └── Card.tsx
│   ├── hooks/
│   │   ├── useWindowSize.ts
│   │   └── useAuth.ts
│   ├── utils/
│   │   ├── helpers.ts
│   │   ├── validators.ts
│   │   └── api.ts
│   ├── lib/
│   │   ├── db.ts
│   │   └── auth.ts
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── styles/
│   │   ├── variables.css
│   │   └── theme.css
│   ├── types/
│   │   └── index.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   └── config/
│       └── constants.ts
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── .gitignore
```

---

## 📝 Comandos Disponibles

```bash
# Desarrollo
pnpm dev              # Inicia servidor en localhost:3000 con hot-reload

# Build y Producción
pnpm build            # Compila el proyecto para producción
pnpm start            # Inicia servidor de producción

# Linting y Calidad de Código
pnpm lint             # Ejecuta ESLint
pnpm lint --fix       # Arregla errores automáticamente

# Gestión de Paquetes
pnpm add <package>    # Instala una dependencia
pnpm add -D <package> # Instala como dev dependency
pnpm update           # Actualiza todas las dependencias
pnpm remove <package> # Desinstala un paquete

# Limpiar
pnpm prune            # Limpia node_modules
pnpm store prune      # Limpia el caché de pnpm
```

---


## 🎨 shadcn/ui

Este proyecto usa [shadcn/ui](https://ui.shadcn.com/) como librería de componentes. A diferencia de otras librerías, shadcn copia el código fuente de los componentes directamente en el proyecto (`src/components/ui/`), lo que permite modificarlos libremente.

### Configuración del proyecto

| Propiedad | Valor | Descripción |
|-----------|-------|-------------|
| **Style** | `base-maia` | Variante visual basada en [Base UI](https://base-ui.com/) (no Radix) |
| **Base color** | `neutral` | Paleta de colores base |
| **Librería de iconos** | `hugeicons` | Reemplaza a lucide-react |
| **CSS variables** | activadas | Soporte para temas claro/oscuro |

> **Importante:** Esta configuración usa **Base UI** como primitiva de componentes en lugar de Radix UI. Algunas APIs difieren del setup estándar de shadcn.

---

### Agregar un componente

#### Paso 1: Explorar los componentes disponibles

Visita [ui.shadcn.com/components](https://ui.shadcn.com/components) y elige el componente que necesitas. Toma nota del nombre exacto (en minúsculas, ej. `dialog`, `data-table`).

#### Paso 2: Ejecutar el CLI

Desde la carpeta `web/`:

```bash
pnpm dlx shadcn@latest add <nombre-componente>

# Ejemplos
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add data-table
```

El CLI copiará el archivo del componente a `src/components/ui/` e instalará automáticamente las dependencias que requiera.

#### Paso 3: Importar y usar

```tsx
// Importa usando el alias @/components/ui/
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function MyComponent() {
  return (
    <Dialog>
      <Button>Abrir</Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Título</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
```

#### Paso 4: Personalizar (opcional)

Como el código vive en el proyecto, puedes editar directamente `src/components/ui/<componente>.tsx` para ajustar estilos, variantes o comportamiento sin afectar otros proyectos.

> **Nota:** No ejecutes `pnpm dlx shadcn@latest add` sobre un componente que ya fue modificado localmente — sobreescribirá tus cambios.

---

### Usar iconos (Hugeicons)

Este proyecto usa `@hugeicons/react` en lugar de lucide-react. La API requiere dos imports: el renderer y el icono.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { SearchIcon, ChevronLeft } from "@hugeicons/core-free-icons";

// Uso básico
<HugeiconsIcon icon={SearchIcon} size={20} />

// Con color heredado del texto (equivalente a currentColor)
<HugeiconsIcon icon={ChevronLeft} size={16} color="currentColor" />

// Con clase CSS para tamaño
<HugeiconsIcon icon={SearchIcon} className="h-5 w-5" />
```

Puedes explorar los iconos disponibles en [hugeicons.com](https://hugeicons.com/).

---

### Diferencia clave: `render` en vez de `asChild`

En el shadcn estándar (con Radix) se usa `asChild` para renderizar un componente como otro elemento. Con Base UI, el equivalente es la prop `render`:

```tsx
// ❌ NO funciona en este proyecto (Radix)
<TooltipTrigger asChild>
  <Link href="/ruta">Ver</Link>
</TooltipTrigger>

// ✅ Correcto (Base UI)
<TooltipTrigger render={<Link href="/ruta" />}>
  Ver
</TooltipTrigger>
```

Esta diferencia aplica a todos los primitivos de Base UI: `TooltipTrigger`, `DialogTrigger`, `PopoverTrigger`, etc.

---

## 📚 Recursos Útiles

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de pnpm](https://pnpm.io/)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [NVM en GitHub](https://github.com/nvm-sh/nvm)
- [shadcn/ui](https://ui.shadcn.com/)
- [Base UI](https://base-ui.com/)
- [Hugeicons](https://hugeicons.com/)

---

## 👥 Contribución

Para contribuir al proyecto:

1. Crea una rama: `git checkout -b feature/nombre-feature`
2. Haz tus cambios
3. Commit: `git commit -m "feat: descripción del cambio"`
4. Push: `git push origin feature/nombre-feature`
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

## ✉️ Soporte

Si encuentras problemas, abre un issue en el repositorio o contacta al equipo de desarrollo.

---

**Última actualización:** Abril 2026  
**Versión:** 1.0.0  
**Mantenedor:** Tu Nombre




















This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
