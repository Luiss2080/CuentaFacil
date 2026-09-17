# Arquitectura: CuentaFacil

## Stack Tecnológico
- **Core:** React 18, Vite.
- **Styling:** CSS Puro (Variables nativas, media queries, flexbox/grid) con metodología BEM/utility classes y diseño Glassmorphism.
- **Iconografía:** `lucide-react` (iconos vectoriales ligeros).
- **Exportación de Imagen:** `html2canvas` (renderizado de nodos DOM a lienzo HTML5).
- **State Management & Persistencia:** Custom hook (`useBilling`) integrado con `localStorage`.

## Estructura de Componentes
- `App.jsx`: Contenedor principal que maneja el layout y coordina los eventos.
- `Modal.jsx`: Componente genérico para renderizar contenido en un portal o ventana emergente.
- `hooks/useBilling.js`: Abstracción de estado. Maneja toda la lógica matemática para la división, propinas, impuestos y proporcionalidades.

## Lógica de Asignación Proporcional
En el "Split Individual" o avanzado, se requiere que cada persona pague su parte del plato más la parte proporcional de la propina y el impuesto.
El algoritmo utilizado es:
1. `Subtotal Individual / Subtotal Global = Ratio de Consumo`.
2. `Propina Persona = Propina Total * Ratio`.
3. `Impuesto Persona = Impuesto Total * Ratio`.
4. `Total Persona = Subtotal Individual + Propina Persona + Impuesto Persona`.

Esto asegura precisión al céntimo.
