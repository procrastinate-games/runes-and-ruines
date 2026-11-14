export const ITEMS: Record<string, {name:string; icon:string; description:string; price:number; type:'weapon'|'consumable'|'upgrade'|'quest'}> = {
 sword:{name:'Дорожный меч',icon:'sword',description:'Урон: 11. Бьёт врага на соседней клетке. Каждое попадание восстанавливает 3 ед. энергии.',price:0,type:'weapon'},
 iron:{name:'Клинок стража',icon:'sword',description:'Урон: 17. Улучшенный меч для ближнего боя. Каждое попадание восстанавливает 3 ед. энергии.',price:65,type:'weapon'},
 heavy:{name:'Меч без надписи',icon:'sword',description:'Урон: 23. Тяжёлый клинок, найденный в тайнике. При ударе игнорирует 3 ед. брони врага.',price:0,type:'weapon'},
 crossbow:{name:'Короткий арбалет',icon:'crossbow',description:'Урон: 12. Дальность: 5 клеток. Для выстрела нужен болт и прямая видимость цели.',price:35,type:'weapon'},
 focus:{name:'Рунный кристалл',icon:'spark',description:'Позволяет применять «Искру», «Огненную печать» и «Ударную волну». Энергия для заклинаний восстанавливается на 2 ед. за раунд.',price:0,type:'weapon'},
 bolts:{name:'Арбалетные болты',icon:'crossbow',description:'Один болт на выстрел. В лавке продаются связками по 12 штук.',price:10,type:'consumable'},
 heal:{name:'Лечебный настой',icon:'potion',description:'Восстанавливает 35 ед. здоровья. Нажмите H, чтобы выпить его, не открывая сумку.',price:15,type:'consumable'},
 full:{name:'Крепкий лечебный настой',icon:'potion',description:'Полностью восстанавливает здоровье.',price:35,type:'consumable'},
 strength:{name:'Зелье силы',icon:'strength',description:'Повышает урон на 5 ед. на 8 раундов. Повторный приём продлевает действие, но не усиливает эффект.',price:25,type:'consumable'},
 focusTonic:{name:'Зелье энергии',icon:'spark',description:'Восстанавливает 20 ед. энергии для заклинаний.',price:20,type:'consumable'},
 haste:{name:'Зелье скорости',icon:'haste',description:'В течение 5 раундов позволяет совершать два действия перед каждым ответом врагов. Очередь действий показана на экране.',price:30,type:'consumable'},
 cleanse:{name:'Очищающая мазь',icon:'cleanse',description:'Снимает горение и истощение.',price:15,type:'consumable'},
 armor:{name:'Пластинчатый жилет',icon:'shield',description:'Повышает броню с 2 до 5. Улучшение действует постоянно.',price:60,type:'upgrade'},
 copper:{name:'Медный ключ',icon:'key',description:'Открывает медную решётку в катакомбах. После использования остаётся у вас.',price:0,type:'quest'},
 mineKey:{name:'Ключ шахтёра',icon:'key',description:'Открывает дверь и решётку шахтной станции. После использования остаётся у вас.',price:0,type:'quest'},
 rune:{name:'Забытая руна',icon:'rune',description:'Руна из синей книги. Отнесите её Антариону: он сможет прочитать надпись.',price:0,type:'quest'},
 ring:{name:'Кольцо памяти',icon:'ring',description:'Награда из тайника хранителя. Увеличивает максимальный запас энергии на 10.',price:0,type:'quest'},
};
export const SPELLS: Record<string,{name:string;shortName:string;cost:number;range:number;damage:number;icon:string;description:string}>={
 spark:{name:'Искра',shortName:'Искра',cost:8,range:4,damage:14,icon:'spark',description:'Разряд молнии. Урон: 14. Дальность: 4 клетки. Особенно эффективен против костяных часовых и рунных стрелков.'},
 fire:{name:'Огненная печать',shortName:'Печать',cost:12,range:4,damage:9,icon:'fire',description:'Урон: 9. Дальность: 4 клетки. Поджигает цель и врагов на соседних клетках. Горение наносит ещё по 4 урона в течение 3 раундов.'},
 echo:{name:'Ударная волна',shortName:'Волна',cost:11,range:2,damage:7,icon:'echo',description:'Урон: 7. Дальность: 2 клетки. Отталкивает врага на клетку и оглушает на 1 раунд. Повторное оглушение возможно не сразу.'},
};
export const ENEMIES = {
 mold:{name:'Плесневый ползун',hp:16,attack:6,armor:0,xp:16,gold:8,range:1,resist:{spark:1,fire:1.5,echo:1},hint:'Уязвим к огню · атакует вблизи'},
 goblin:{name:'Гоблин-искатель',hp:28,attack:8,armor:1,xp:24,gold:12,range:1,resist:{spark:1,fire:1,echo:1},hint:'Преследует и обходит препятствия · атакует вблизи'},
 guard:{name:'Костяной часовой',hp:42,attack:11,armor:7,xp:35,gold:18,range:1,resist:{spark:1.5,fire:0.5,echo:1},hint:'Броня: 7 · уязвим к молнии · действует через раунд'},
 archer:{name:'Рунный стрелок',hp:24,attack:9,armor:1,xp:30,gold:16,range:5,resist:{spark:1.5,fire:1,echo:1},hint:'Стреляет на 5 клеток · перед выстрелом целится'},
 scribe:{name:'Теневой переписчик',hp:36,attack:7,armor:2,xp:40,gold:20,range:3,resist:{spark:0.5,fire:1.5,echo:1.5},hint:'Похищает энергию · держится на расстоянии · уязвим к огню'},
 boss:{name:'Безымянный Регент',hp:150,attack:14,armor:4,xp:120,gold:60,range:1,resist:{spark:1,fire:0.5,echo:0.5},hint:'Две фазы боя · выходите из красной зоны перед ударом'},
} as const;
export const XP_THRESHOLDS=[0,70,200,390];
export const SHOP=['heal','full','bolts','strength','focusTonic','haste','cleanse','iron','armor'];
export const STATUS_NAMES:Record<string,string>={strength:'Сила',haste:'Ускорение',burn:'Горение',weaken:'Истощение',stun:'Оглушение'};
