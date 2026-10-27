# Plan Maestro — Manual de marca

Paleta ciruela y vino sobre el marrón de base. Aplica a `nuevo1-scroll.html`.

El fondo de la página no cambia: sigue siendo `#2d2621`. La paleta nueva ocupa acentos, botones, textos destacados y superficies.

## Paleta

| Nombre | Hex | RGB | Uso |
| --- | --- | --- | --- |
| Ciruela | `#2A1032` | 42, 16, 50 | Tono más oscuro de la paleta. Se mezcla con el marrón para armar superficies y bordes. No reemplaza el fondo de página. |
| Vino | `#5C1733` | 92, 23, 51 | Fondos de ícono, hover de botón, extremo oscuro de degradados. |
| Carmín | `#8A2F4A` | 138, 47, 74 | Fondo de botón y de pastilla activa. |
| Rosa polvo | `#C99AA8` | 201, 154, 168 | Acento claro: highlights, subrayados, versión, checks, texto destacado. |
| Crema | `#F3EDE8` | 243, 237, 232 | Texto principal, texto sobre botón, títulos. |

### Base que se conserva

| Nombre | Hex | RGB | Uso |
| --- | --- | --- | --- |
| Marrón | `#2d2621` | 45, 38, 33 | Fondo de página, navbar, hero, footer. Texto sobre rosa polvo y sobre la cortina. |

### Superficies derivadas

Marrón mezclado con ciruela. Sirven para tarjetas, acordeón, pastilla de navegación y el cierre.

| Nombre | Hex | Equivale a | Uso |
| --- | --- | --- | --- |
| Superficie | `#2f1f27` | antes `#312b26` | Secciones de cierre, cuerpo del acordeón. |
| Superficie elevada | `#38232f` | antes `#3a322c` | Tarjetas, pastilla inferior, íconos de ecosistema. |
| Borde | `#4d2d3d` | antes `#4a4039` | Bordes de tarjeta, pastilla y botón outline. |
| Texto atenuado | `#c4b3b9` | antes `#bfb6aa` | Navegación en reposo, pie, pistas de scroll. |
| Texto secundario | `#9a8590` | antes `#968a7d` | Subtítulos de sección. |

## Variables CSS

Definidas en `assets/css/nuevo1-scroll-palette.css`.

```css
:root {
    --secondary-color: #C99AA8;
    --success-color: #5C1733;
    --info-color: #C99AA8;
    --warning-color: #C99AA8;
    --danger-color: #8A2F4A;
    --light-color: #F3EDE8;
    --gradient-primary: linear-gradient(160deg, #38232f 0%, #2d2621 100%);
    --gradient-secondary: linear-gradient(135deg, #8A2F4A 0%, #5C1733 100%);
    --gradient-warning: linear-gradient(135deg, #C99AA8 0%, #8A2F4A 100%);
    --gradient-dark: linear-gradient(180deg, #2d2621 0%, #2f1f27 100%);
}
```

`--primary-color` y `--dark-color` siguen en `#2d2621`.

## Combinaciones

El marrón es oscuro. Vino y carmín también. Juntos no se leen.

| Fondo | Texto o ícono | Resultado |
| --- | --- | --- |
| `#2d2621` | `#F3EDE8` | Texto principal. |
| `#2d2621` | `#c4b3b9` o `#9a8590` | Texto secundario. |
| `#2d2621` | `#C99AA8` | Acento. Es el reemplazo cuando un verde oliva o un terracota quedaban como texto sobre el marrón. |
| `#8A2F4A` | `#F3EDE8` | Botón. |
| `#5C1733` | `#F3EDE8` | Botón en hover, ícono con glifo claro. |
| `#C99AA8` | `#2d2621` | Check, cortina, marca sobre rosa. |
| `#38232f` o `#2f1f27` | `#F3EDE8` | Tarjeta. |

No usar `#5C1733` ni `#8A2F4A` como color de texto sobre `#2d2621`. El contraste queda por debajo de lo legible.

## Componentes

### Botón principal

Ingresar, Empezar ahora, pastilla activa de la navegación inferior.

- Fondo `#8A2F4A`
- Texto `#F3EDE8`
- Hover: fondo `#5C1733`, texto `#F3EDE8`
- Borde del mismo color que el fondo

### Botón outline

Fondo transparente, texto y borde `#C99AA8`. Un borde en vino sobre el marrón desaparece.

### Texto destacado

Rosa polvo `#C99AA8`: versión, “MÁS” de las tarjetas, enlaces del pie, subrayado del nav, palabra acentuada de un título.

Degradado de título animado:

`#C99AA8 → #8A2F4A → #5C1733 → #C99AA8 → #F3EDE8`

Degradado de frase (texto recortado, no una barra):

`#F3EDE8 → #C99AA8 → #C99AA8`

Si el degradado se aplica con `background`, hay que repetir `background-clip: text`. El atajo `background` borra el recorte y el texto se ve como una barra rosa.

### Tarjetas

Fondo `#38232f`, borde `#4d2d3d`, título `#F3EDE8`, bajada `#9a8590`. El círculo de check es `#C99AA8` con el signo en `#2d2621`.

### Cortina de sección

Fondo `#C99AA8`. El título de la cortina queda en `#2d2621`.

## Tipografía

| Rol | Familia | Peso |
| --- | --- | --- |
| Wordmark y títulos de sección | Clash Display | 600 |
| Frase del hero | Reckless Neue Light | — |
| Interfaz, nav, botones | Inter, con Poppins de respaldo | 500–700 |

El wordmark va en `#F3EDE8` junto al orbe.

## Qué hacer

- Dejar `#2d2621` como fondo de página, hero, navbar y footer.
- Reservar `#C99AA8` para lo que tiene que verse sobre el marrón.
- Reservar `#8A2F4A` y `#5C1733` para rellenos con texto crema encima.
- Usar las superficies `#2f1f27` y `#38232f` cuando haga falta separar un bloque del fondo, sin salir del marrón.

## Qué evitar

- Reemplazar el fondo marrón por `#2A1032`.
- Texto vino o carmín sobre marrón.
- Volver al dorado `#e5b882`, al tostado `#d4a574`, al oliva `#767e6b` o al terracota `#cb6149` en esta página.
- Aplicar este archivo de paleta en `nuevo1.html`. Esa página conserva la paleta anterior.
