import { useCallback, useEffect, useRef, useState } from 'react';
import * as catStorage from '../services/catStorage';
import * as queue from '../services/syncQueue';
import * as cloud from '../services/cloud';
import { mergeCats } from '../utils/catMerge';

const SEED_KEY = 'car-manager:cloud-seeded';

async function applyOp(uid, op) {
  switch (op.type) {
    case 'cat-set':
      return cloud.pushCat(uid, op.cat);
    case 'cat-delete':
      await cloud.deleteCatWithPhotos(uid, op.catId);
      return cloud.pushTombstone(uid, op.catId);
    case 'photo-set':
      return cloud.pushPhoto(uid, op.catId, op.photo);
    case 'photo-delete':
      return cloud.deletePhoto(uid, op.catId, op.photoId);
    default:
      return Promise.resolve();
  }
}

export function useCats(user, authReady) {
  const [cats, setCats] = useState(() => catStorage.getCats());
  const [syncStatus, setSyncStatus] = useState('local');
  const flushing = useRef(false);
  const prevUidRef = useRef(null);

  const flush = useCallback(async () => {
    if (!user || flushing.current) return;
    if (!navigator.onLine) {
      setSyncStatus('offline');
      return;
    }
    if (queue.getQueue().length === 0) {
      setSyncStatus('synced');
      return;
    }

    flushing.current = true;
    setSyncStatus('syncing');
    try {
      while (queue.getQueue().length > 0) {
        const op = queue.getQueue()[0];
        await applyOp(user.uid, op);
        queue.shiftQueue();
      }
      setSyncStatus('synced');
    } catch (error) {
      console.error('Ошибка синхронизации:', error);
      setSyncStatus('pending');
    } finally {
      flushing.current = false;
    }
  }, [user]);

  // первичная синхронизация после входа
  useEffect(() => {
    if (!authReady || !user) {
      setSyncStatus('local');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        if (prevUidRef.current !== user.uid) {
          localStorage.removeItem(SEED_KEY);
          prevUidRef.current = user.uid;
        }

        // 1) сначала узнаём, кого удалили на других устройствах
        let tombs = [];
        try {
          tombs = await cloud.pullTombstones(user.uid);
        } catch {
          tombs = [];
        }

        // 2) вычищаем удалённых из локальной базы
        if (tombs.length > 0) {
          const before = catStorage.getCats();
          const cleaned = before.filter((cat) => !tombs.includes(cat.id));
          if (cleaned.length !== before.length) {
            catStorage.replaceCats(cleaned);
          }
        }

        // 3) один раз отправляем локальную базу в облако
        if (!localStorage.getItem(SEED_KEY)) {
          for (const cat of catStorage.getCats()) {
            queue.enqueue({ type: 'cat-set', cat });
            for (const photo of cat.photos || []) {
              queue.enqueue({ type: 'photo-set', catId: cat.id, photo });
            }
          }
          localStorage.setItem(SEED_KEY, '1');
        }

        // 4) тянем облако и сливаем (без удалённых)
        const remote = await cloud.pullAll(user.uid);
        if (cancelled) return;
        const cleanRemote = remote.filter((cat) => !tombs.includes(cat.id));
        if (cleanRemote.length > 0) {
          const merged = mergeCats(catStorage.getCats(), cleanRemote);
          setCats(catStorage.replaceCats(merged));
        }
      } catch (error) {
        console.error('Не удалось получить данные из облака:', error);
        if (!cancelled) setSyncStatus('pending');
      }
      flush();
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, user, flush]);

  // ретраи + самовосстановление статуса
  useEffect(() => {
    const onOnline = () => flush();
    const onOffline = () => user && setSyncStatus('offline');
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    const interval = window.setInterval(() => {
      if (!user) return;
      if (!navigator.onLine) {
        setSyncStatus('offline');
      } else if (queue.getQueue().length > 0) {
        flush();
      } else {
        setSyncStatus((s) => (s === 'syncing' ? s : 'synced'));
      }
    }, 15000);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.clearInterval(interval);
    };
  }, [flush, user]);

  // ─── мутации: сначала локально, потом в очередь ───

  const commit = (next, ops) => {
    ops.forEach((op) => queue.enqueue(op));
    setCats(next);
    flush();
  };

  const addCat = (data, photoDataUrls = []) => {
    let next = catStorage.addCat(data);
    const createdId = next[0].id;
    const ops = [{ type: 'cat-set', cat: next[0] }];

    for (const dataUrl of photoDataUrls) {
      try {
        next = catStorage.addPhoto(createdId, dataUrl);
      } catch (error) {
        console.error('Не удалось сохранить фото:', error);
        break;
      }
      const cat = next.find((c) => c.id === createdId);
      ops.push({
        type: 'photo-set',
        catId: createdId,
        photo: cat.photos[cat.photos.length - 1],
      });
      ops.push({ type: 'cat-set', cat });
    }

    commit(next, ops);
    return next.find((c) => c.id === createdId);
  };

  const updateCat = (id, data) => {
    const next = catStorage.updateCat(id, data);
    commit(next, [{ type: 'cat-set', cat: next.find((c) => c.id === id) }]);
  };

  const removeCat = (id) => {
    const next = catStorage.deleteCat(id);
    commit(next, [{ type: 'cat-delete', catId: id }]);
  };

  const importCats = (imported) => {
    const next = catStorage.importCats(imported);
    const ops = [];
    for (const cat of imported) {
      const full = next.find((c) => c.id === cat.id);
      if (!full) continue;
      ops.push({ type: 'cat-set', cat: full });
      for (const photo of full.photos || []) {
        ops.push({ type: 'photo-set', catId: full.id, photo });
      }
    }
    commit(next, ops);
  };

  const addPhoto = (catId, dataUrl) => {
    try {
      const next = catStorage.addPhoto(catId, dataUrl);
      const cat = next.find((c) => c.id === catId);
      const photo = cat.photos[cat.photos.length - 1];
      commit(next, [
        { type: 'photo-set', catId, photo },
        { type: 'cat-set', cat },
      ]);
      return true;
    } catch (error) {
      console.error('Не удалось сохранить фото:', error);
      return false;
    }
  };

  const deletePhoto = (catId, photoId) => {
    const next = catStorage.deletePhoto(catId, photoId);
    commit(next, [
      { type: 'photo-delete', catId, photoId },
      { type: 'cat-set', cat: next.find((c) => c.id === catId) },
    ]);
  };

  const addComment = (catId, photoId, text) => {
    const next = catStorage.addComment(catId, photoId, text);
    const cat = next.find((c) => c.id === catId);
    commit(next, [
      {
        type: 'photo-set',
        catId,
        photo: cat.photos.find((p) => p.id === photoId),
      },
    ]);
  };

  const setProfilePhoto = (catId, photoId) => {
    const next = catStorage.setProfilePhoto(catId, photoId);
    commit(next, [{ type: 'cat-set', cat: next.find((c) => c.id === catId) }]);
  };

  return {
    cats,
    syncStatus,
    addCat,
    updateCat,
    removeCat,
    importCats,
    addPhoto,
    deletePhoto,
    addComment,
    setProfilePhoto,
  };
}