export function formatAge(age) {
  const lastTwo = age % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return `${age} лет`;

  switch (age % 10) {
    case 1: return `${age} год`;
    case 2:
    case 3:
    case 4: return `${age} года`;
    default: return `${age} лет`;
  }
}