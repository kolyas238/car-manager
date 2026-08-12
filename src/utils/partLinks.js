// Форматы поиска магазинов. Если магазин поменял URL — правим здесь в одном месте.
export function partSearchLinks(article) {
  const q = encodeURIComponent(article);
  return [
    { label: 'Emex', url: `https://www.emex.ru/#/search?query=${q}` },
    { label: 'Яндекс', url: `https://yandex.ru/search/?text=${q} купить` },
    { label: 'Маркет', url: `https://market.yandex.ru/search?text=${q}` },
    { label: 'Ozon', url: `https://www.ozon.ru/search/?text=${q}` },
    { label: 'WB', url: `https://www.wildberries.ru/catalog/0/search.aspx?search=${q}` },
  ];
}