<div align="center">
  <img src="./public/favicon.svg" alt="CuentaFacil Logo" width="100"/>
  <h1>CuentaFacil 💸</h1>
  <p><strong>La forma más fácil y justa de dividir la cuenta con tus amigos, con propina, impuestos y proporciones calculadas al céntimo.</strong></p>

  [![React](https://img.shields.io/badge/React-19.x-61dafb?style=flat&logo=react&logoColor=black)](#)
  [![Vite](https://img.shields.io/badge/Vite-8.x-646cff?style=flat&logo=vite&logoColor=white)](#)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-Animaciones-ff0055?style=flat&logo=framer)](#)
  [![Testing](https://img.shields.io/badge/Vitest-Testing-729B1B?style=flat&logo=vitest&logoColor=white)](#)

</div>

---

## 🌟 ¿Qué es CuentaFacil?

**CuentaFacil** es una calculadora de propinas y divisor de cuentas con una
interfaz *Glassmorphism* moderna. Divide la cuenta en partes iguales o asigna
el consumo exacto de cada persona: CuentaFacil calcula la propina y los
impuestos de forma proporcional a lo que consumió cada uno, sin perder ni un
céntimo por el camino.

## ✨ Características

- ⚖️ **División Individual (Proporcional):** asigna a cada persona lo que
  realmente consumió; la propina y el impuesto se reparten en la misma
  proporción que su parte del subtotal.
- 🧮 **División en Partes Iguales:** reparte el total (cuenta + propina +
  impuestos) entre el número de personas que elijas con los botones `+`/`-`.
- 🎨 **Interfaz Glassmorphism:** efectos de vidrio esmerilado y transiciones
  fluidas con `framer-motion`, con tema claro/oscuro automático según las
  preferencias del sistema.
- 💾 **Persistencia Automática:** el monto, la propina, la moneda, las
  personas y el historial se guardan en `localStorage` y se restauran solos
  al recargar la página.
- 📸 **Exportación de Recibo:** descarga el panel de Resumen como imagen PNG
  con un clic, generada en el propio navegador con `html2canvas`.
- 🗂️ **Historial de Cuentas:** guarda hasta 10 recibos recientes (monto,
  fecha, moneda y número de personas), consultables y eliminables desde el
  panel de Historial.
- 🎉 **Micro-interacciones:** confeti al guardar una cuenta y al lograr que
  los montos asignados en el modo Individual cuadren exactamente con la
  cuenta.
- 🌍 **Configuración Regional:** moneda (USD, EUR, BOB, MXN) e impuesto local
  configurables desde el panel de Configuración.

## Cómo usar

1. Escribe el monto de tu cuenta en "Monto de la cuenta".
2. Elige un porcentaje de propina rápido (0/10/15/20/25%).
3. Elige el modo de división:
   - **Partes Iguales:** usa los botones `+`/`-` para fijar el número de
     personas; el panel de Resumen muestra cuánto le toca a cada una.
   - **Individual:** en el panel que se abre, asigna a cada persona lo que
     consumió (Ej: Ana $15, Luis $20); un aviso ("Falta por asignar") indica
     si la suma todavía no cubre el total de la cuenta.
4. Guarda la cuenta en el historial (ícono `+`) o descárgala como imagen
   (ícono de descarga) desde el panel de Resumen.

## Instalación y uso local

El proyecto está empaquetado con **Vite**.

```bash
# 1. Clona el repositorio e ingresa al directorio
git clone https://github.com/Luiss2080/calculadora-propinas-web.git
cd calculadora-propinas-web

# 2. Instala las dependencias
npm install

# 3. Levanta el servidor de desarrollo local
npm run dev
```

Abre tu navegador en `http://localhost:5173`.

Para generar el build de producción (valida que todo compile antes de
desplegar):

```bash
npm run build
```

## Tecnologías

- **React 19** + **Vite 8** — UI y bundling/dev server.
- **framer-motion** — animaciones y transiciones.
- **html2canvas** — exporta el resumen como imagen PNG.
- **canvas-confetti** — micro-interacciones de celebración.
- **lucide-react** — iconografía.
- **CSS puro** — variables nativas, media queries y flexbox/grid (sin
  frameworks de estilos).
- **Vitest** + **React Testing Library** — pruebas unitarias y de
  componentes, sobre **jsdom**.

## Tests

El núcleo de cálculo (`useBilling`: propina, impuestos, división en partes
iguales) y la división proporcional del modo Individual están cubiertos por
pruebas automatizadas con Vitest y React Testing Library.

```bash
npm test
```

## 📚 Documentación Adicional

- 📖 **[Manual de Usuario](./MANUAL.md)** — Guía completa de uso,
  configuración y FAQ para el usuario final.
- ⚙️ **[Arquitectura](./ARCHITECTURE.md)** — Documentación técnica del
  stack, la estructura de componentes y el algoritmo de división
  proporcional.

## Licencia

Este proyecto está bajo la Licencia MIT — ver el archivo
[LICENSE](./LICENSE) para el texto completo.

---
<div align="center">
  <p>Construido con dedicación para que dividir la cuenta no rompa amistades. 🍻</p>
</div>
