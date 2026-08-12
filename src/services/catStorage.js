const STORAGE_KEY = 'car-manager:cats';

function readCats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCats(cats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
}

export function getCats() {
  return readCats();
}

export function replaceCats(cats) {
  writeCats(cats);
  return cats;
}

export function addCat(data) {
  const now = new Date().toISOString();
  const cat = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    photos: [],
    profilePhotoId: null,
    ...data,
  };
  const cats = [cat, ...readCats()];
  writeCats(cats);
  return cats;
}

export function updateCat(id, data) {
  const now = new Date().toISOString();
  const cats = readCats().map((cat) =>
    cat.id === id ? { ...cat, ...data, updatedAt: now } : cat
  );
  writeCats(cats);
  return cats;
}

export function deleteCat(id) {
  const cats = readCats().filter((cat) => cat.id !== id);
  writeCats(cats);
  addTombstone(id);
  return cats;
}

export function importCats(imported) {
  const byId = new Map(readCats().map((cat) => [cat.id, cat]));
  for (const cat of imported) {
    if (cat && cat.id) {
      byId.set(cat.id, { ...cat });
      removeTombstone(cat.id);
    }
  }
  const cats = [...byId.values()];
  writeCats(cats);
  return cats;
}

// ─── Фото и комментарии ───────────────────────────────

export function addPhoto(catId, dataUrl) {
  const now = new Date().toISOString();
  const photo = {
    id: crypto.randomUUID(),
    dataUrl,
    createdAt: now,
    updatedAt: now,
    comments: [],
  };

  const cats = readCats().map((cat) => {
    if (cat.id !== catId) return cat;
    const photos = [...(cat.photos || []), photo];
    return {
      ...cat,
      photos,
      profilePhotoId: cat.profilePhotoId || photo.id,
      updatedAt: now,
    };
  });

  writeCats(cats);
  return cats;
}

export function deletePhoto(catId, photoId) {
  const now = new Date().toISOString();
  const cats = readCats().map((cat) => {
    if (cat.id !== catId) return cat;
    const photos = (cat.photos || []).filter((photo) => photo.id !== photoId);
    return {
      ...cat,
      photos,
      profilePhotoId:
        cat.profilePhotoId === photoId
          ? (photos[0]?.id ?? null)
          : cat.profilePhotoId,
      updatedAt: now,
    };
  });
  writeCats(cats);
  return cats;
}

export function setProfilePhoto(catId, photoId) {
  const now = new Date().toISOString();
  const cats = readCats().map((cat) =>
    cat.id === catId
      ? { ...cat, profilePhotoId: photoId, updatedAt: now }
      : cat
  );
  writeCats(cats);
  return cats;
}

export function addComment(catId, photoId, text) {
  const now = new Date().toISOString();
  const comment = { id: crypto.randomUUID(), text, createdAt: now };

  const cats = readCats().map((cat) => {
    if (cat.id !== catId) return cat;
    return {
      ...cat,
      updatedAt: now,
      photos: (cat.photos || []).map((photo) =>
        photo.id === photoId
          ? {
              ...photo,
              updatedAt: now,
              comments: [...(photo.comments || []), comment],
            }
          : photo
      ),
    };
  });
  writeCats(cats);
  return cats;
}

// ─── Надгробия: синхронизация удалений ────────────────
const TOMB_KEY = 'car-manager:tombstones';

export function getTombstones() {
  try {
    return JSON.parse(localStorage.getItem(TOMB_KEY)) || [];
  } catch {
    return [];
  }
}

export function addTombstone(id) {
  const tombs = getTombstones();
  if (!tombs.includes(id)) {
    tombs.push(id);
    localStorage.setItem(TOMB_KEY, JSON.stringify(tombs));
  }
}

export function removeTombstone(id) {
  localStorage.setItem(
    TOMB_KEY,
    JSON.stringify(getTombstones().filter((t) => t !== id))
  );
}