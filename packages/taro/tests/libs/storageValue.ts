export const markStorageValue = (value: string): string => {
  return JSON.stringify({
    data: value,
  });
};

export const unmarkStorageValue = (itemKey: string): string => {
  const data = JSON.parse(localStorage.getItem(itemKey)!);

  return data.data;
};
