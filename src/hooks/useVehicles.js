import { useCallback, useEffect, useRef, useState } from 'react';
import * as storage from '../services/vehicleStorage';
import * as queue from '../services/syncQueue';
import * as cloud from '../services/cloud';
import { mergeVehicles } from '../utils/vehicleMerge';

const SEED_KEY = 'car-manager:cloud-seeded';

async function applyOp(uid, op) {
  switch (op.type) {
    case 'vehicle-set':
      return cloud.pushVehicle(uid, op.vehicle);
    case 'vehicle-delete':
      await cloud.deleteVehicleDoc(uid, op.vehicleId);
      return cloud.pushTombstone(uid, op.vehicleId);
    default:
      return Promise.resolve();
  }
}

export function useVehicles(user, authReady) {
  const [vehicles, setVehicles] = useState(() => storage.getVehicles());
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

        let tombs = [];
        try {
          tombs = await cloud.pullTombstones(user.uid);
        } catch {
          tombs = [];
        }

        if (tombs.length > 0) {
          const before = storage.getVehicles();
          const cleaned = before.filter((v) => !tombs.includes(v.id));
          if (cleaned.length !== before.length) {
            storage.replaceVehicles(cleaned);
          }
        }

        if (!localStorage.getItem(SEED_KEY)) {
          for (const vehicle of storage.getVehicles()) {
            queue.enqueue({ type: 'vehicle-set', vehicle });
          }
          localStorage.setItem(SEED_KEY, '1');
        }

        const remote = await cloud.pullAll(user.uid);
        if (cancelled) return;
        const cleanRemote = remote.filter((v) => !tombs.includes(v.id));
        if (cleanRemote.length > 0) {
          const merged = mergeVehicles(storage.getVehicles(), cleanRemote);
          setVehicles(storage.replaceVehicles(merged));
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

  const commit = (next, ops) => {
    ops.forEach((op) => queue.enqueue(op));
    setVehicles(next);
    flush();
  };

  const fullOf = (next, id) => next.find((v) => v.id === id);

  const addVehicle = (data) => {
    const next = storage.addVehicle(data);
    commit(next, [{ type: 'vehicle-set', vehicle: next[0] }]);
    return next[0];
  };

  const updateVehicle = (id, data) => {
    const next = storage.updateVehicle(id, data);
    commit(next, [{ type: 'vehicle-set', vehicle: fullOf(next, id) }]);
  };

  const removeVehicle = (id) => {
    const next = storage.deleteVehicle(id);
    commit(next, [{ type: 'vehicle-delete', vehicleId: id }]);
  };

  const importVehicles = (imported) => {
    const next = storage.importVehicles(imported);
    const ops = imported
      .filter((v) => v && v.id)
      .map((v) => ({ type: 'vehicle-set', vehicle: fullOf(next, v.id) }));
    commit(next, ops);
  };

  const addService = (vehicleId, record) => {
    const next = storage.addService(vehicleId, record);
    commit(next, [{ type: 'vehicle-set', vehicle: fullOf(next, vehicleId) }]);
  };

  const deleteService = (vehicleId, serviceId) => {
    const next = storage.deleteService(vehicleId, serviceId);
    commit(next, [{ type: 'vehicle-set', vehicle: fullOf(next, vehicleId) }]);
  };

  const addFuel = (vehicleId, entry) => {
    const next = storage.addFuel(vehicleId, entry);
    commit(next, [{ type: 'vehicle-set', vehicle: fullOf(next, vehicleId) }]);
  };

  const deleteFuel = (vehicleId, fuelId) => {
    const next = storage.deleteFuel(vehicleId, fuelId);
    commit(next, [{ type: 'vehicle-set', vehicle: fullOf(next, vehicleId) }]);
  };

    const addReminder = (vehicleId, data) => {
    const next = storage.addReminder(vehicleId, data);
    commit(next, [{ type: 'vehicle-set', vehicle: fullOf(next, vehicleId) }]);
  };

  const deleteReminder = (vehicleId, reminderId) => {
    const next = storage.deleteReminder(vehicleId, reminderId);
    commit(next, [{ type: 'vehicle-set', vehicle: fullOf(next, vehicleId) }]);
  };

  const toggleReminder = (vehicleId, reminderId) => {
    const next = storage.toggleReminder(vehicleId, reminderId);
    commit(next, [{ type: 'vehicle-set', vehicle: fullOf(next, vehicleId) }]);
  };

  return {
    vehicles,
    syncStatus,
    addVehicle,
    updateVehicle,
    removeVehicle,
    importVehicles,
    addService,
    deleteService,
    addFuel,
    deleteFuel,
    addReminder,
    deleteReminder,
    toggleReminder,
  };
}