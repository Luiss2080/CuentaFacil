<div align="center">
  <img src="./public/favicon.svg" alt="SplitIt Pro Logo" width="100"/>
  <h1>SplitIt Pro 💸</h1>
  <p><strong>La forma más inteligente, justa y moderna de dividir la cuenta con tus amigos.</strong></p>

  [![React](https://img.shields.io/badge/React-18.x-61dafb?style=flat&logo=react&logoColor=black)](#)
  [![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=flat&logo=vite&logoColor=white)](#)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-Animaciones-ff0055?style=flat&logo=framer)](#)
  [![Testing](https://img.shields.io/badge/Vitest-Testing-729B1B?style=flat&logo=vitest&logoColor=white)](#)

</div>

---

## 🌟 ¿Qué es SplitIt Pro?

Originalmente una sencilla calculadora de propinas, **SplitIt Pro** ha evolucionado gracias a la metodología **SDD (Spec-Driven Development)** hacia una aplicación nivel *Enterprise* diseñada con una interfaz *Ultra UI Glassmorphism*. 

Ya sea que necesites dividir la cuenta en partes iguales o asignar el consumo exacto a cada persona, SplitIt Pro calcula la propina y los impuestos de forma totalmente proporcional, justa y a prueba de errores.

## ✨ Características Principales

- ⚖️ **División Avanzada (Proporcional):** Asigna consumos específicos a cada persona. La aplicación calculará exactamente qué parte de los impuestos y la propina debe pagar cada uno.
- 🎨 **Ultra UI & Animaciones:** Interfaz construida con efectos Glassmorphism, avatares dinámicos y transiciones ultra-fluidas impulsadas por `framer-motion`.
- 💾 **Persistencia Automática:** Tus datos no se pierden al recargar la página gracias a la integración nativa con `LocalStorage`.
- 📸 **Exportación de Tickets:** Un solo clic genera una imagen (`.png`) perfecta de tu recibo para compartir por WhatsApp o redes sociales usando `html2canvas`.
- 🗂️ **Historial de Cuentas:** Guarda y consulta tus recibos anteriores.
- 🎉 **Micro-interacciones:** Confeti visual cuando cuadras tus cuentas a la perfección.
- 🌍 **Configuración Regional:** Soporte multi-moneda (USD, EUR, BOB, MXN) e impuestos configurables.

## 🚀 Inicio Rápido

El proyecto está empaquetado con **Vite** para una experiencia de desarrollo instantánea.

```bash
# 1. Clona el repositorio e ingresa al directorio
cd calculadora-propinas-web

# 2. Instala las dependencias
npm install

# 3. Levanta el servidor de desarrollo local
npm run dev
```
Abre tu navegador en `http://localhost:5173` y disfruta de la aplicación.

## 🧪 Testing Automatizado

Para garantizar precisión matemática en la división de gastos y la asignación proporcional, el núcleo lógico de la aplicación (el custom hook `useBilling`) está cubierto por pruebas unitarias sólidas utilizando **Vitest** y **React Testing Library**.

Para correr la suite de pruebas y comprobar el estado del sistema, ejecuta:
```bash
npx vitest run
```

## 📚 Documentación Adicional

Para más detalles sobre el funcionamiento y la ingeniería detrás del proyecto, consulta nuestros manuales dedicados:

- 📖 **[Manual de Usuario](./MANUAL.md)** - Guía completa de uso, configuración y FAQ para el usuario final.
- ⚙️ **[Arquitectura](./ARCHITECTURE.md)** - Documentación técnica detallando el stack, el patrón de diseño BEM, el estado de componentes y el algoritmo matemático utilizado.

---
<div align="center">
  <p>Construido con dedicación para que dividir la cuenta no rompa amistades. 🍻</p>
</div>
