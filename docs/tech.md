# Техническое задание и проверка готовности

## Технологии

TypeScript (strict), Vite, Three.js, CSS; допускается Vitest для тестов. Без серверной БД, регистрации, платных API и обязательных CDN. Цель — GitHub Pages. Приложение должно загружаться с относительных путей, в том числе на `/runes-and-ruins/`.

## Декомпозиция

```text
src/
  main.ts
  game/
    actions.ts          # один контроллер ходов
    state.ts            # чистый игровой state
    grid.ts             # tile collision, doors, pathing, LOS
    combat.ts           # урон, резисты, крит, зелья, статусы
    ai.ts               # pursuit, ranged, retreat, telegraph
    inventory.ts        # equip, purchase, consume
    quests.ts           # Antarion's simple quest flags, secrets
    rng.ts              # seeded randomness
  content/
    levels.ts           # минимум три авторские карты
    encounters.ts
    items.ts
    dialogs.ru.ts
    quests.ts
  render/
    scene.ts            # Three.js and interpolation
    dungeon.ts          # reusable low-poly walls / floor
    enemies.ts          # original sprite billboards or models
    particles.ts
  ui/
    hud.ts
    controls.ts
    dialogs.ts
    map.ts
    inventory.ts
    journal.ts
    menu.ts
  save/
    storage.ts
  audio/
    effects.ts
styles/
  main.css
tests/
  engine.test.ts
  quests.test.ts
  saves.test.ts
  reachability.test.ts
```

Это рекомендуемая структура, можно адаптировать, сохраняя разделение игровой логики и рендера.

## Архитектура событий

Каждое действие типа `Move`, `Turn`, `Attack`, `Cast`, `UseItem`, `Interact`, `Wait` возвращает `ActionResult` (`ok`, `costTurn`, `log`, `events`). Рендер отвечает только за события, не принимает решения о повреждениях. Валидатор карты исполняется при старте/тесте. Блокировка ввода на время камерной анимации исключает двойные ходы.

Контракт `tile`:

```ts
type Facing = 'N' | 'E' | 'S' | 'W';
type Tile = 'wall' | 'floor' | 'doorClosed' | 'doorOpen' | 'exit' | 'secretWall';
interface PlayerState {
  x: number; y: number; facing: Facing;
  hp: number; maxHp: number; focus: number; maxFocus: number;
  level: number; xp: number; gold: number;
  inventory: Record<string, number>;
  equipped: string;
  statuses: Array<{id:string; remaining:number}>;
}
interface QuestFlags {
  antarionMet: boolean;
  antarionQuestAccepted: boolean;
  forgottenRuneFound: boolean;
  antarionQuestCompleted: boolean;
  antarionSecretOpened: boolean;
  bossDefeated: boolean;
}
```

## Минимальные тесты (должны запускаться автоматически)

1. В стену пройти нельзя, положение неизменно, ход не израсходован.
2. Четыре поворота по 90° возвращают исходное направление; после 100 движений нет дробных координат.
3. Враг не получает ход без действий игрока. После успешного действия все активные враги корректно обрабатываются.
4. Атака через стену запрещена, боеприпас не тратится при недопустимой цели.
5. Бафф со сроком 3 хода снимается после 3 циклов; ускорение не даёт больше 2 действий на один ход врага.
6. Враги не проходят сквозь стены или друг друга; открытая дверь меняет достижимость.
7. EXP начисляется единожды за победу, уникальный лут не дублируется.
8. Квест Антариона принимает одну уже найденную до начала квеста Забытую руну, открывает секретный проход, награду выдаёт однократно.
9. Нет softlock: путь от входа к выходу каждой карты существует с учётом доступных ключей и переключателей; квестовые предметы доступны.
10. Сохранение и загрузка сохраняют имя, позицию, поворот, врагов, монеты, флаги Антариона, открытые двери, познанную карту, статус босса; битый save вызывает новый запуск или предложение нового начала.
11. При `hp <= 0` появляется defeat screen; при победе босса — ending screen.
12. Production build (`npm run build`) компилируется без TypeScript-ошибок.

## Визуальная проверка вручную

- 1366×768: HUD читаем, карта не перекрывает центр.
- 390×844 portrait: явное предложение повернуть экран или хороший адаптивный лейаут.
- 844×390 landscape: тач-кнопки достаточно крупны, игрок может пройти стартовую комнату одной рукой/двумя большими пальцами.
- Ближний враг не проходит сквозь камеру, не разваливается текстура или спрайт.
- Переключение оружия, карта, инвентарь, диалоги не вызывают дублирующих действий.
- Отключённый звук не влияет на управление; новая игра не затирает save молча.

## Проверка маршрута

Обязательная последовательность: начало -> первый враг -> ключ -> выход 1 -> торговец -> мост -> выход 2 -> Антарион -> главная руническая головоломка -> босс -> одна короткая концовка. Дополнительно: Антарион -> загадка в соседнем зале -> одна Забытая руна -> возврат к Антариону -> необязательный секретный проход с наградой. Проверить, что фото референса Жоржа НЕ включено в production build, а созданный портрет Жоржа виден в UI.

## Релиз

Собрать `README.md` с кнопками/раскладкой, GIF/screenshots **собственной игры** (не оригинала), инструкцией `npm install && npm run dev`, корректным скриптом `npm run build`, атрибуцией реальных лицензий, описанием сохранений. Публикация в браузере. Не выдавать технический прототип за завершённый проект.

## Implemented release notes

The user-specified organization template overrides the generic GitHub Pages release suggestion above: the configured publisher is the unchanged shared GitHub Actions workflow. The exact repository and catalog slug is `runes-and-ruines`. Relative base './' still supports static subpath hosting. See platform-project-notes.md and README.md.

Actual test stack: Vitest for the pure engine and authored campaign route validation; Playwright Chromium for browser regressions. Dev-only mutation hooks are compiled out of production. Runtime read-only inspection is retained. Static geometry and library decoration are batched with InstancedMesh; no postprocessing/shadows, DPR capped at 1.7 (1 in low mode). Synthesized audio is unlocked only by a user gesture.
