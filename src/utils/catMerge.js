// Слияние локальной и облачной баз:
// объединение по id, при конфликте побеждает более свежий (updatedAt)
export function mergeCats(local, remote) {
  const byId = new Map(local.map((cat) => [cat.id, { ...cat }]));

  for (const remoteCat of remote) {
    const localCat = byId.get(remoteCat.id);

    if (!localCat) {
      byId.set(remoteCat.id, remoteCat);
      continue;
    }

    const merged =
      (remoteCat.updatedAt || 0) > (localCat.updatedAt || 0)
        ? { ...localCat, ...remoteCat, photos: localCat.photos || [] }
        : { ...localCat };

    const photosById = new Map(
      (localCat.photos || []).map((photo) => [photo.id, { ...photo }])
    );
    for (const remotePhoto of remoteCat.photos || []) {
      const localPhoto = photosById.get(remotePhoto.id);
      if (!localPhoto) {
        photosById.set(remotePhoto.id, remotePhoto);
      } else if ((remotePhoto.updatedAt || 0) > (localPhoto.updatedAt || 0)) {
        photosById.set(remotePhoto.id, remotePhoto);
      }
    }
    merged.photos = [...photosById.values()];
    byId.set(remoteCat.id, merged);
  }

  return [...byId.values()];
}