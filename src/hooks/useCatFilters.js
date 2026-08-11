import { useMemo, useState } from 'react';
import { filterAndSortCats, getUniqueValues } from '../utils/catFilters';

const DEFAULT_FILTERS = {
  query: '',
  breed: 'all',
  color: 'all',
  sortBy: 'newest',
};

export function useCatFilters(cats) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const breeds = useMemo(() => getUniqueValues(cats, 'breed'), [cats]);
  const colors = useMemo(() => getUniqueValues(cats, 'color'), [cats]);

  const filteredCats = useMemo(
    () => filterAndSortCats(cats, filters),
    [cats, filters]
  );

  const setFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const isDirty =
    filters.query !== '' ||
    filters.breed !== 'all' ||
    filters.color !== 'all';

  return { filters, setFilter, resetFilters, breeds, colors, filteredCats, isDirty };
}