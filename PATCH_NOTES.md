# Actualización del Sistema NutriDeli - Parche [Versión Actual]

Estas son las mejoras, correcciones y cambios visuales aplicados en la plataforma y aplicación móvil para agilizar las operaciones y brindar una mejor experiencia al equipo.

---

## Cambios en Interfaz y Experiencia de Usuario (UI/UX)

* **Nuevo Menú de Opciones (Tarjetas):** Se limpiaron las tarjetas de Productos e Insumos. Ahora en lugar de múltiples botones amontonados, hay un único botón de **"OPCIONES"** anclado en la esquina inferior derecha. Al presionarlo, se despliega un menú interactivo con íconos y psicología de color:
  * **Verde:** Acciones principales (Comprar / Reabastecer).
  * **Azul:** Modificaciones y ajustes (Editar, Configurar).
  * **Naranja:** Desglose o cuidado (Desarmar combos).
  * **Rojo:** Acciones destructivas (Registrar Pérdida, Eliminar).
* **Organización Visual de Tarjetas:** Se reestructuró la cuadrícula de las tarjetas de catálogo e inventario. Ahora la información de "Stock Físico" y "Disponible" se muestra como etiquetas (badges) ordenadas bajo el precio, logrando que todas las tarjetas mantengan el mismo alto y se vean simétricas.
* **Rediseño de "Agregar Insumo":** El gran formulario fijo que ocupaba un tercio de la pantalla de Insumos fue eliminado. Ahora la vista del inventario es más amplia y el formulario se abre de forma emergente (Modal) al tocar el botón azul de "+ Agregar Insumo" en la parte superior.
* **Estética del Buscador:** Se añadieron bordes curvos (20px) a todas las barras de búsqueda del sistema, dándole una apariencia más moderna y de aplicación móvil nativa.

## Arquitectura y Configuración

* **Independencia de Configuración:** Se separó la pestaña de "Gestión de Usuarios". Ahora existe una pestaña exclusiva de **"Configuración"** donde se controlan los datos bancarios de la empresa y permisos globales (como permitir pagos parciales). La pantalla de "Usuarios" queda única y exclusivamente para crear perfiles y otorgar roles al personal.

## Facturación y Cobranza

* **Abonos Multi-Moneda:** Ahora la ventana de "Registrar Nuevo Abono" cuenta con un botón para alternar el registro entre dólares (USD) y bolívares (VES), facilitando el cobro en divisas.
* **Cálculo Inteligente de Restantes:** Al cobrar un pedido que ya tenía abonos previos, la alerta de pago del sistema (tanto en USD como en Pago Móvil) ahora resta automáticamente lo ya abonado e indica el monto exacto restante, evitando errores de sobrecobro.
* **Status "Parcial":** Identificador visual mejorado para pedidos con abonos que aún no se han pagado en su totalidad.

---

## Nota Informativa para el Equipo: ¿Por qué fluctúa la Ganancia Neta en el Tablero?

Es posible que al revisar el Tablero Principal noten que el valor de **"Ganancia Neta"** a veces sube bruscamente y luego tiene pequeñas caídas. Queremos aclarar cómo funciona este indicador para su tranquilidad:

El sistema calcula la ganancia real así: 
*(Ingresos por Ventas)* **MENOS** *(Costo de la Mercancía consumida)*

**¿Por qué ven "saltos"?**
1. **Ventas en Negativo (El Efecto Fantasma):** Si venden un producto antes de darle entrada al sistema (o antes de registrar la producción), el sistema suma toda esa venta como ganancia pura, porque **aún no sabe qué ingredientes se gastaron**. Eso hace que la gráfica suba de forma exagerada.
2. **El Ajuste a la Realidad:** Cuando el equipo por fin va al módulo de Producción y registra lo que se fabricó, el sistema automáticamente descuenta la carne, masa, vegetales, etc. del inventario, suma el costo, y se lo resta a las ventas. Ahí es cuando ven que la ganancia **baja a su nivel correcto y real**.
3. **Mermas:** Cada vez que le dan a "Registrar Pérdida" a un insumo dañado, el sistema reconoce el gasto del material perdido y baja un poco la ganancia neta.

**Recomendación:** Para que la gráfica sea una línea suave y perfecta, intenten registrar la Producción de sus combos y pasteles *antes* o al mismo tiempo en que hacen las ventas, evitando así que el inventario caiga en números negativos temporales.
