# Drive Clon - Almacenamiento S3 con Next.js, LocalStack y Terraform

Este proyecto es un clon de Google Drive que posee Drag & Drop para subir archivos (documentos, imágenes, videos) y organizarlos en carpetas guardadas localmente en un Bucket de AWS S3 mediante LocalStack.

---

## Herramientas y Tecnologías

- **Frontend & Backend**: Next.js 15+ (App Router, TypeScript y CSS Modules).
- **Infraestructura Local**: AWS S3 simulado localmente con LocalStack.
- **Terraform**: para crear y gestionar el bucket S3.
- **Docker & Docker Compose**: para ejecutar LocalStack de forma aislada.
- **pnpm**: para la instalación eficiente de dependencias.

---

## Variables de Entorno

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_ENDPOINT=http://localhost:4566
AWS_S3_BUCKET=drive-clon-bucket
```

---

## Guía de Inicio

Paso 1: Levantar LocalStack con docker:

```bash
docker compose up -d localstack
```

Paso 2: Ejecutar el Bucket con Terraform:

```bash
# Entrar a la carpeta de Terraform
cd terraform

# Inicializar los plugins (AWS Provider)
terraform init

# Crear los recursos (el bucket y su bloqueo de acceso público)
terraform apply -auto-approve
```

Una vez que LocalStack esté arriba (puedes verificarlo en [http://localhost:4566/_localstack/health](http://localhost:4566/_localstack/health)):

---

Paso 3: Instalar dependencias e iniciar Next.js:

```bash
# Instalar dependencias de Next.js
pnpm install

# Iniciar servidor local
pnpm run dev
```

Abre **[http://localhost:3000](http://localhost:3000)** en tu navegador para interactuar con la aplicación.

---

## Estructura del Proyecto

```text
├── terraform/               # Archivos de aprovisionamiento de infraestructura (IaC)
│   ├── main.tf              # Definición de recursos S3
│   ├── providers.tf         # Configuración del proveedor de AWS
│   ├── variables.tf         # Variables por defecto para local y AWS
│   └── outputs.tf           # Datos de salida (Bucket Name, ARN)
├── src/
│   ├── app/                 # Rutas de Next.js (App Router)
│   │   ├── api/             # API Endpoints
│   │   │   ├── files/       # Obtener lista de metadatos de archivos y carpetas
│   │   │   ├── upload/      # Subida física de archivos a S3 y creación de carpetas
│   │   │   └── download/    # Descarga directa de archivos de S3 mediante stream
│   │   ├── globals.css      # Variables de color del diseño Google Drive
│   │   └── page.tsx         # Página principal y control de estados
│   ├── components/          # Componentes reutilizables
│   │   ├── Dropzone.tsx     # Zona de arrastrar y soltar archivos
│   │   ├── FileList.tsx     # Navegación, buscador y listado de archivos/carpetas
│   │   └── RecentFiles.tsx  # Grid de sugerencias de los 3 últimos archivos
│   └── lib/
│       └── s3.ts            # Inicialización del AWS SDK S3Client
├── docker-compose.yml       # Orquestador del contenedor de LocalStack
└── Dockerfile               # Empaquetado de la aplicación Next.js para producción
```