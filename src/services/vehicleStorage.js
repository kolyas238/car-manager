const KEY = 'car-manager:vehicles';
const TOMB_KEY = 'car-manager:tombstones';

function readVehicles() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function writeVehicles(vehicles) {
  localStorage.setItem(KEY, JSON.stringify(vehicles));
  return vehicles;
}

export function getVehicles() {
  return readVehicles();
}

export function replaceVehicles(vehicles) {
  return writeVehicles(vehicles);
}

export function addVehicle(data) {
  const vehicle = {
    ...data,
    id: crypto.randomUUID(),
    services: [],
    fuel: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  return writeVehicles([vehicle, ...readVehicles()]);
}

export function updateVehicle(id, data) {
  return writeVehicles(
    readVehicles().map((v) =>
      v.id === id ? { ...v, ...data, updatedAt: Date.now() } : v
    )
  );
}

export function deleteVehicle(id) {
  const next = readVehicles().filter((v) => v.id !== id);
  writeVehicles(next);
  addTombstone(id);
  return next;
}

export function addService(vehicleId, record) {
  return writeVehicles(
    readVehicles().map((v) =>
      v.id === vehicleId
        ? {
            ...v,
            services: [
              { ...record, id: crypto.randomUUID() },
              ...(v.services || []),
            ],
            updatedAt: Date.now(),
          }
        : v
    )
  );
}

export function deleteService(vehicleId, serviceId) {
  return writeVehicles(
    readVehicles().map((v) =>
      v.id === vehicleId
        ? {
            ...v,
            services: (v.services || []).filter((s) => s.id !== serviceId),
            updatedAt: Date.now(),
          }
        : v
    )
  );
}

export function addFuel(vehicleId, entry) {
  return writeVehicles(
    readVehicles().map((v) =>
      v.id === vehicleId
        ? {
            ...v,
            fuel: [{ ...entry, id: crypto.randomUUID() }, ...(v.fuel || [])],
            updatedAt: Date.now(),
          }
        : v
    )
  );
}

export function deleteFuel(vehicleId, fuelId) {
  return writeVehicles(
    readVehicles().map((v) =>
      v.id === vehicleId
        ? {
            ...v,
            fuel: (v.fuel || []).filter((f) => f.id !== fuelId),
            updatedAt: Date.now(),
          }
        : v
    )
  );
}

export function importVehicles(imported) {
  const byId = new Map(readVehicles().map((v) => [v.id, v]));
  for (const item of imported) {
    if (item && item.id) {
      byId.set(item.id, { services: [], fuel: [], ...item });
      removeTombstone(item.id);
    }
  }
  return writeVehicles([...byId.values()]);
}

// ─── надгробия: синхронизация удалений ───
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