import { useState } from 'react';
import CatCard from '../CatCard/CatCard';
import CatFilters from '../CatFilters/CatFilters';
import { useCatFilters } from '../../hooks/useCatFilters';
import './CatCatalog.scss';

export default function CatCatalog({ cats, onEdit, onDelete, onOpenGallery }) {
  const [visible, setVisible] = useState(false);
  const {
    filters,
    setFilter,
    resetFilters,
    breeds,
    colors,
    filteredCats,
    isDirty,
  } = useCatFilters(cats);

  return (
    <section className="cat-catalog">
      <button
        className="cat-catalog__toggle"
        type="button"
        onClick={() => setVisible((prev) => !prev)}
      >
        {visible ? 'Скрыть котиков 🙈' : `Показать котиков (${cats.length})`}
      </button>

      {visible && (
        <>
          {cats.length > 0 && (
            <CatFilters
              filters={filters}
              onFilterChange={setFilter}
              onReset={resetFilters}
              breeds={breeds}
              colors={colors}
              isDirty={isDirty}
              foundCount={filteredCats.length}
              totalCount={cats.length}
            />
          )}

          {cats.length === 0 ? (
            <p className="cat-catalog__empty">
              Пока нет ни одного котика. Добавьте первого! 🐾
            </p>
          ) : filteredCats.length === 0 ? (
            <p className="cat-catalog__empty">
              Никого не нашли. Попробуйте изменить поиск или фильтры 🔍
            </p>
          ) : (
            <div className="cat-catalog__grid">
              {filteredCats.map((cat) => (
                <CatCard
                  key={cat.id}
                  cat={cat}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onOpenGallery={onOpenGallery}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}