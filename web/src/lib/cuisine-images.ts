const CUISINE_IMAGES: Record<string, string[]> = {
  italiana: [
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=500&fit=crop&q=80",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop&q=80",
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&h=500&fit=crop&q=80",
  ],
  japonesa: [
    "https://images.unsplash.com/photo-1617196034096-8d8ee2898e53?w=800&h=500&fit=crop&q=80",
    "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=500&fit=crop&q=80",
    "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800&h=500&fit=crop&q=80",
  ],
  mexicana: [
    "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=500&fit=crop&q=80",
    "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=800&h=500&fit=crop&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=500&fit=crop&q=80",
  ],
  chilena: [
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=500&fit=crop&q=80",
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=500&fit=crop&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=500&fit=crop&q=80",
  ],
  china: [
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&h=500&fit=crop&q=80",
    "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=500&fit=crop&q=80",
    "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800&h=500&fit=crop&q=80",
  ],
  peruana: [
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&h=500&fit=crop&q=80",
    "https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&h=500&fit=crop&q=80",
    "https://images.unsplash.com/photo-1535400255456-984e4f1e2d4c?w=800&h=500&fit=crop&q=80",
  ],
  americana: [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=500&fit=crop&q=80",
    "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=500&fit=crop&q=80",
    "https://images.unsplash.com/photo-1586816001966-79b736744398?w=800&h=500&fit=crop&q=80",
  ],
  vegetariana: [
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=500&fit=crop&q=80",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=500&fit=crop&q=80",
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=500&fit=crop&q=80",
  ],
};

const CUISINE_KEY_MAP: Record<string, string> = {
  italiana: "italiana",
  italian: "italiana",
  pizza: "italiana",
  pasta: "italiana",
  japonesa: "japonesa",
  japanese: "japonesa",
  sushi: "japonesa",
  ramen: "japonesa",
  mexicana: "mexicana",
  mexican: "mexicana",
  tacos: "mexicana",
  chilena: "chilena",
  chilean: "chilena",
  "comida chilena": "chilena",
  china: "china",
  chinese: "china",
  peruana: "peruana",
  peruvian: "peruana",
  ceviche: "peruana",
  americana: "americana",
  american: "americana",
  burger: "americana",
  hamburger: "americana",
  vegetariana: "vegetariana",
  vegetarian: "vegetariana",
  vegan: "vegetariana",
  vegana: "vegetariana",
};

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=500&fit=crop&q=80",
];

function normalizeCuisine(cuisine: string): string {
  return cuisine
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getCuisineImage(cuisine: string, restaurantId: string): string {
  const normalized = normalizeCuisine(cuisine);
  const key = CUISINE_KEY_MAP[normalized];
  const images = (key ? CUISINE_IMAGES[key] : null) ?? DEFAULT_IMAGES;
  return images[hashId(restaurantId) % images.length];
}

export function getCuisineImages(cuisine: string): string[] {
  const normalized = normalizeCuisine(cuisine);
  const key = CUISINE_KEY_MAP[normalized];
  return (key ? CUISINE_IMAGES[key] : null) ?? DEFAULT_IMAGES;
}
