export const TOUR_PHOTOS: Record<string, string> = {
  "Mangrove Tunnels & Mudflats Kayak Tour": "https://risingtidefl.com/wp-content/uploads/2018/07/thais-mangrove-tunnel.jpg",
  "Heart of Rookery Bay Kayak Tour": "https://risingtidefl.com/wp-content/uploads/2019/10/Heart-of-the-Rookery-Bay-Kayak-Tour-image-1.jpg",
  "Sunset Bird Rookery Kayak Tour": "https://risingtidefl.com/wp-content/uploads/2018/07/Sunset-Bird-Rookery-Kayak-Tour-image-4-1024x683.jpg",
  "Essence of the Estuary Eco-Cruise": "https://risingtidefl.com/wp-content/uploads/2024/12/boat-3-scaled-2-1024x683.jpeg",
  "Life's a Beach Barrier Island Shelling": "https://risingtidefl.com/wp-content/uploads/2020/11/20200926-DSC_4423-SMALLER-1024x683.jpg",
  "High Points Ancient Island Excursion": "https://risingtidefl.com/wp-content/uploads/2020/11/JRH2791-scaled-1-1024x683.jpg",
  "Sunset Bird Rookery Cruise": "https://risingtidefl.com/wp-content/uploads/2020/04/Sunset-Bird-Rookery-Boat-Cruise-image-5-1024x683.jpg",
  "Sunset to Full Moon Cruise": "https://risingtidefl.com/wp-content/uploads/2020/01/Sunset-to-Full-Moon-Cruise-image-1-1024x539.jpg",
};
export function getTourPhoto(name?: string): string | undefined {
  if (!name) return undefined;
  if (TOUR_PHOTOS[name]) return TOUR_PHOTOS[name];
  // fuzzy: match by first significant word
  const lower = name.toLowerCase();
  const key = Object.keys(TOUR_PHOTOS).find(k => {
    const kLower = k.toLowerCase();
    return lower.includes(kLower.split(' ')[0]) || kLower.includes(lower.split(' ')[0]);
  });
  return key ? TOUR_PHOTOS[key] : undefined;
}
