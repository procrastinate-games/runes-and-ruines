export const ITEMS: Record<string, {name:string; icon:string; description:string; price:number; type:'weapon'|'consumable'|'upgrade'|'quest'}> = {
 sword:{name:'Дорожный меч',icon:'sword',description:'11 урона. Надёжный клинок для соседней клетки. Удар в упор восстанавливает 3 фокуса.',price:0,type:'weapon'},
 iron:{name:'Клинок стража',icon:'sword',description:'17 урона вблизи. Постоянное улучшение; +3 фокуса за попадание.',price:65,type:'weapon'},
 heavy:{name:'Меч без надписи',icon:'sword',description:'Редкий тяжёлый клинок. 23 урона, пробивает 3 брони.',price:0,type:'weapon'},
 crossbow:{name:'Короткий арбалет',icon:'crossbow',description:'12 урона, дальность 5. Расходует болт только при попадании.',price:35,type:'weapon'},
 focus:{name:'Рунный фокус',icon:'spark',description:'Искра, Жар-печать и Отзвук. Фокус восстанавливается на 2 за цикл.',price:0,type:'weapon'},
 bolts:{name:'Болты × 12',icon:'crossbow',description:'Двенадцать болтов для короткого арбалета.',price:10,type:'consumable'},
 heal:{name:'Лечебный настой',icon:'potion',description:'Восстанавливает 35 здоровья. H — быстро выпить.',price:15,type:'consumable'},
 full:{name:'Большой настой',icon:'potion',description:'Полностью восстанавливает здоровье.',price:35,type:'consumable'},
 strength:{name:'Тоник силы',icon:'strength',description:'+5 урона на 8 циклов. Повторное применение обновляет срок.',price:25,type:'consumable'},
 focusTonic:{name:'Тоник фокуса',icon:'spark',description:'Восстанавливает 20 фокуса.',price:20,type:'consumable'},
 haste:{name:'Зелье скорости',icon:'haste',description:'Два действия перед ответом врагов, 5 циклов. Индикатор показывает очередь.',price:30,type:'consumable'},
 cleanse:{name:'Очищающая мазь',icon:'cleanse',description:'Снимает горение и ослабление.',price:15,type:'consumable'},
 armor:{name:'Пластинчатый жилет',icon:'shield',description:'Постоянно повышает броню с 2 до 5.',price:60,type:'upgrade'},
 copper:{name:'Медный ключ',icon:'key',description:'Открывает решётку катакомб. Не расходуется.',price:0,type:'quest'},
 mineKey:{name:'Ключ шахтёра',icon:'key',description:'Для двери станции. Не расходуется.',price:0,type:'quest'},
 rune:{name:'Забытая руна',icon:'rune',description:'Одна руна для Антариона. Её нельзя потерять.',price:0,type:'quest'},
 ring:{name:'Кольцо памяти',icon:'ring',description:'Награда за внимательность: +10 максимального фокуса.',price:0,type:'quest'},
};
export const SPELLS: Record<string,{name:string;cost:number;range:number;damage:number;icon:string;description:string}>={
 spark:{name:'Искра',cost:8,range:4,damage:14,icon:'spark',description:'Молния. Сильна против брони и рунных стрелков.'},
 fire:{name:'Жар-печать',cost:12,range:4,damage:9,icon:'fire',description:'Пламя в радиусе 1 клетки. Горение: 4 урона × 3 цикла.'},
 echo:{name:'Отзвук',cost:11,range:2,damage:7,icon:'echo',description:'Отталкивает на клетку и оглушает на цикл.'},
};
export const ENEMIES = {
 mold:{name:'Плесневый шорох',hp:16,attack:6,armor:0,xp:16,gold:8,range:1,resist:{spark:1,fire:1.5,echo:1},hint:'Уязвим к огню · ближний бой'},
 goblin:{name:'Гоблин-искатель',hp:28,attack:8,armor:1,xp:24,gold:12,range:1,resist:{spark:1,fire:1,echo:1},hint:'Обходит препятствия · ближний бой'},
 guard:{name:'Костяной часовой',hp:42,attack:11,armor:7,xp:35,gold:18,range:1,resist:{spark:1.5,fire:0.5,echo:1},hint:'Броня 7 · уязвим к молнии · медленный'},
 archer:{name:'Рунный стрелок',hp:24,attack:9,armor:1,xp:30,gold:16,range:5,resist:{spark:1.5,fire:1,echo:1},hint:'Дальность 5 · перед выстрелом целится'},
 scribe:{name:'Теневой переписчик',hp:36,attack:7,armor:2,xp:40,gold:20,range:3,resist:{spark:0.5,fire:1.5,echo:1.5},hint:'Крадёт фокус · отступает · боится огня'},
 boss:{name:'Безымянный Регент',hp:150,attack:14,armor:4,xp:120,gold:60,range:1,resist:{spark:1,fire:0.5,echo:0.5},hint:'Две фазы · отойди от отмеченной клетки'},
} as const;
export const XP_THRESHOLDS=[0,70,200,390];
export const SHOP=['heal','full','bolts','strength','focusTonic','haste','cleanse','iron','armor'];
export const STATUS_NAMES:Record<string,string>={strength:'Сила',haste:'Скорость',burn:'Горение',weaken:'Ослабление',stun:'Оглушение'};
