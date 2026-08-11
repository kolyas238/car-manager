export function getUniqueValues(cats, key) {
  const values = cats
    .map((cat) => (cat[key] || '').trim())
    .filter(Boolean);
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'ru'));
}

export function filterAndSortCats(cats, { query, breed, color, sortBy }) {
  let result = [...cats];

  const q = query.trim().toLowerCase();
  if (q) {
    result = result.filter((cat) =>
      [cat.name, cat.breed, cat.color]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    );
  }

  if (breed !== 'all') {
    result = result.filter((cat) => (cat.breed || '') === breed);
  }
  if (color !== 'all') {
    result = result.filter((cat) => (cat.color || '') === color);
  }

  const sorters = {
    newest: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    name: (a, b) => a.name.localeCompare(b.name, 'ru'),
    'age-asc': (a, b) => a.age - b.age,
    'age-desc': (a, b) => b.age - a.age,
    'weight-asc': (a, b) => a.weight - b.weight,
    'weight-desc': (a, b) => b.weight - a.weight,
  };

  result.sort(sorters[sortBy] || sorters.newest);
  return result;
}