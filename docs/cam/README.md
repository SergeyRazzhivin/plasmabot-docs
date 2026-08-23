# CAM-ядро (@plasmaresis/cam)

Раздел для разработчиков и интеграторов. CAM-постпроцессор Плазмобота -
чистая TypeScript-библиотека: превращает контуры (SVG или набор замкнутых
петель) в **G-code под Klipper** с плазма-спецификой - компенсация ширины
реза (kerf), врезки lead-in/out, точки прокола (pierce), микро-перемычки
(tabs) и безопасный порядок реза. Работает и тестируется без платы и
моторов.

## Конвейер

```
SVG / loops
   ↓ classify      какие петли - контур детали, какие - отверстия
   ↓ kerf          сдвиг факела на kerf/2 в сторону отхода
   ↓ leads         врезка/выход в зону отхода (без надреза на детали)
   ↓ tabs          микро-перемычки, чтобы деталь не упала в рез
   ↓ order         сначала отверстия, потом контур; ближний-первым по проходам
   ↓ emit          G-code под Klipper (M3/M5, arc-OK, pierce-delay)
G-code
```

## Использование

```ts
import { processSvg, processLoops } from "@plasmaresis/cam";

// Из SVG
const { gcode, pierces, pathCount } = processSvg(svgString, {
  originToZero: true,
  config: {
    kerf: 1.2,                // ширина реза, мм (факел уходит на kerf/2 в отход)
    cutFeed: 1800,            // подача реза, мм/мин
    pierceDelay: 0.5,         // задержка прокола, с
    lead: { type: "line", length: 4, angleDeg: 45, outLength: 2 },
    tabs: { enabled: true, count: 3, length: 1.5 },
    torch: { on: "PLASMA_ON", off: "PLASMA_OFF", waitArcOk: "PLASMA_WAIT_ARC" },
  },
});

// Или из готовых петель
const r = processLoops([outerLoop, holeLoop], { config: { kerf: 1.2 } });
```

## Параметрические детали

Типовые сварные детали генерируются кодом, не моделью - LLM лишь вытаскивает
числа в объект параметров, геометрию строит ядро. Пример "косынка 100x100,
катет 80, отверстие 12":

```ts
import { gusset, processLoops } from "@plasmaresis/cam";

const loops = gusset({ legX: 100, legY: 80, chamfer: 15, holes: [{ x: 25, y: 20, dia: 12 }] });
const { gcode } = processLoops(loops, { originToZero: true, config: { kerf: 1.2 } });
```

Доступно: `plate` (пластина со скруглением углов и отверстиями), `gusset`
(косынка с обрезкой угла), `flange` (фланец с расточкой и болтовой
окружностью), `strap` (накладка/полоса с отверстиями по концам),
`circleLoop` (примитив).

## Конфигурация (PostConfig)

| Поле | Назначение |
|---|---|
| `kerf` | ширина реза, мм. Факел смещается на `kerf/2` в сторону отхода: внешний контур растёт, отверстие ужимается |
| `cutFeed` | подача реза, units/min |
| `pierceDelay` | задержка после поджига перед движением, с → `G4 P<ms>` |
| `lead` | врезка/выход: `type` (`line`/`none`), `length`, `angleDeg`, `outLength` |
| `tabs` | микро-перемычки: `enabled`, `count`, `length` (мм) |
| `torch.on/off` | команды поджига/гашения (макросы Klipper, по умолчанию `M3`/`M5`) |
| `torch.waitArcOk` | строка ожидания arc-OK после поджига (обязательно для боевого реза) |
| `pierceHeight`/`cutHeight`/`safeZ` | опционально. По умолчанию Z не пишется - им владеет внешний THC-модуль. Задавать только для rig'а, где Z ведёт Klipper |
| `precision` | знаков после запятой в координатах |

## Klipper: куда подключать

По архитектуре проекта THC-модуль владеет осью Z, Klipper ведёт только XY.
Хендшейк с источником плазмы - пара макросов в printer.cfg:

```ini
# Поджиг факела (сухой контакт на источник)
[output_pin torch]
pin: PA1
value: 0

[gcode_macro PLASMA_ON]
gcode: SET_PIN PIN=torch VALUE=1

[gcode_macro PLASMA_OFF]
gcode: SET_PIN PIN=torch VALUE=0

# Ожидание сигнала arc-OK / transfer от источника перед движением
[gcode_button arc_ok]
pin: PA2
[gcode_macro PLASMA_WAIT_ARC]
gcode:
    {% if not printer['gcode_button arc_ok'].state == "PRESSED" %}
        RESPOND TYPE=error MSG="No arc transfer"
    {% endif %}
```

::: warning
`PLASMA_WAIT_ARC` обязателен: без подтверждения переноса дуги контроллер
начнёт рез "в воздухе" или прожжёт старт.
:::

## Архитектурные заметки

- **Kerf-офсет - на Clipper** (`clipper-lib`): робастно держит отверстия,
  вогнутые углы, самопересечения и мителинг; целочисленные координаты
  (масштаб 1e4 = 0.0001 мм).
- **Перемычки = повторный прокол.** Над перемычкой факел гасится и
  поджигается снова - осознанный компромисс ради того, чтобы деталь не
  упала в рез.
- **Безопасный порядок:** сначала самые вложенные петли (отверстия), потом
  внешний контур - чтобы деталь не сместилась до конца реза.
