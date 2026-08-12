const QUEUE_KEY = 'car-manager:sync-queue';

export function getQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY)) || [];
  } catch {
    return [];
  }
}

export function enqueue(op) {
  const queue = [...getQueue(), op];
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  return queue;
}

export function shiftQueue() {
  const queue = getQueue();
  queue.shift();
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  return queue;
}