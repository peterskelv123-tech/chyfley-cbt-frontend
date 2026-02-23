export const arrayToSetSelector = (arr, key) => {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  if (!key) return null;

  const map = new Map();

  for (const item of arr) {
    const value = item?.[key];
    if (value !== undefined && value !== null && !map.has(value)) {
      map.set(value, { id: item.id, [key]: value });
    }
  }

  const uniqueValues = Array.from(map.values());

  return uniqueValues.length > 1 ? uniqueValues : null;
};

