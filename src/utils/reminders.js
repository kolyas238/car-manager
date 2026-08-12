// статус напоминания: done / overdue / soon / planned
export function reminderStatus(reminder, vehicle) {
  if (reminder.done) return 'done';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (reminder.dueMileage && (vehicle.mileage || 0) >= reminder.dueMileage) {
    return 'overdue';
  }

  if (reminder.dueDate) {
    const due = new Date(reminder.dueDate);
    if (due < today) return 'overdue';
    const days = (due - today) / 86400000;
    if (days <= 14) return 'soon';
  }

  if (
    reminder.dueMileage &&
    reminder.dueMileage - (vehicle.mileage || 0) <= 1000
  ) {
    return 'soon';
  }

  return 'planned';
}

export function vehicleAlerts(vehicle) {
  let overdue = 0;
  let soon = 0;
  for (const reminder of vehicle.reminders || []) {
    const status = reminderStatus(reminder, vehicle);
    if (status === 'overdue') overdue += 1;
    else if (status === 'soon') soon += 1;
  }
  return { overdue, soon };
}