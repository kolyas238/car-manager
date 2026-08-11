import './CatFilters.scss';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'name', label: 'По имени (А–Я)' },
  { value: 'age-asc', label: 'По возрасту (сначала младшие)' },
  { value: 'age-desc', label: 'По возрасту (сначала старшие)' },
  { value: 'weight-asc', label: 'По весу (сначала лёгкие)' },
  { value: 'weight-desc', label: 'По весу (сначала тяжёлые)' },
];

export default function CatFilters({
  filters,
  onFilterChange,
  onReset,
  breeds,
  colors,
  isDirty,
  foundCount,
  totalCount,
}) {
  return (
    <div className="cat-filters">
      <div className="cat-filters__row">
        <input
          className="cat-filters__search"
          type="search"
          placeholder="Поиск: имя, порода, цвет…"
          value={filters.query}
          onChange={(event) => onFilterChange('query', event.target.value)}
        />

        <label className="cat-filters__field">
          <span className="cat-filters__label">Сортировка</span>
          <select
            className="cat-filters__select"
            value={filters.sortBy}
            onChange={(event) => onFilterChange('sortBy', event.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="cat-filters__row">
        <label className="cat-filters__field">
          <span className="cat-filters__label">Порода</span>
          <select
            className="cat-filters__select"
            value={filters.breed}
            onChange={(event) => onFilterChange('breed', event.target.value)}
          >
            <option value="all">Все</option>
            {breeds.map((breed) => (
              <option key={breed} value={breed}>{breed}</option>
            ))}
          </select>
        </label>

        <label className="cat-filters__field">
          <span className="cat-filters__label">Цвет</span>
          <select
            className="cat-filters__select"
            value={filters.color}
            onChange={(event) => onFilterChange('color', event.target.value)}
          >
            <option value="all">Все</option>
            {colors.map((color) => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
        </label>

        <div className="cat-filters__meta">
          <span className="cat-filters__count">
            Найдено: {foundCount} из {totalCount}
          </span>
          {isDirty && (
            <button
              className="cat-filters__reset"
              type="button"
              onClick={onReset}
            >
              Сбросить
            </button>
          )}
        </div>
      </div>
    </div>
  );
}