export const getAddress = async (lat: number, lng: number) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&accept-language=ja&zoom=14&lat=${lat}&lon=${lng}`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    return json.display_name.split(', ').slice(0, 3).reverse().join(' ');
  } catch (error) {
    console.warn(error);
  }
};
