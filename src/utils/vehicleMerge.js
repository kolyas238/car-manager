export function mergeVehicles(local, remote) {
  const byId = new Map(local.map((v) => [v.id, v]));
  for (const remoteVehicle of remote) {
    const localVehicle = byId.get(remoteVehicle.id);
    if (
      !localVehicle ||
      (remoteVehicle.updatedAt || 0) > (localVehicle.updatedAt || 0)
    ) {
      byId.set(remoteVehicle.id, remoteVehicle);
    }
  }
  return [...byId.values()];
}