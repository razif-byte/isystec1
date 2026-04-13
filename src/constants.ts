import { Product, Review } from './types';

const calculateSellingPrice = (cost: number) => {
  // 30% margin: Selling = Cost / (1 - 0.3)
  return Math.ceil(cost / 0.7);
};

export const PRODUCTS: Product[] = [
  // Security
  {
    id: 'sec-1',
    name: '4K Ultra HD CCTV Camera',
    description: 'High-definition security camera with night vision and motion detection.',
    costPrice: 250,
    sellingPrice: calculateSellingPrice(250),
    category: 'Security',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1000',
  },
  {
    id: 'sec-2',
    name: 'Smart Biometric Door Lock',
    description: 'Fingerprint and keypad entry for maximum home security.',
    costPrice: 450,
    sellingPrice: calculateSellingPrice(450),
    category: 'Security',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1000',
  },
  {
    id: 'sec-3',
    name: 'Wireless Alarm System Kit',
    description: 'Complete home alarm system with door sensors and siren.',
    costPrice: 320,
    sellingPrice: calculateSellingPrice(320),
    category: 'Security',
    image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?q=80&w=1000',
  },

  // Solar
  {
    id: 'sol-1',
    name: '450W Monocrystalline Solar Panel',
    description: 'High-efficiency solar panel for residential and commercial use.',
    costPrice: 600,
    sellingPrice: calculateSellingPrice(600),
    category: 'Solar',
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=1000',
  },
  {
    id: 'sol-2',
    name: '5kW Hybrid Solar Inverter',
    description: 'Smart inverter with battery backup support and remote monitoring.',
    costPrice: 2800,
    sellingPrice: calculateSellingPrice(2800),
    category: 'Solar',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000',
  },
  {
    id: 'sol-3',
    name: '100Ah LiFePO4 Battery',
    description: 'Deep cycle lithium battery for solar energy storage.',
    costPrice: 1500,
    sellingPrice: calculateSellingPrice(1500),
    category: 'Solar',
    image: 'https://images.unsplash.com/photo-1611338003530-99980177b3c4?q=80&w=1000',
  },

  // Accessories
  {
    id: 'acc-1',
    name: 'Solar DC Cable (100m)',
    description: 'UV resistant 4mm DC cable for solar installations.',
    costPrice: 180,
    sellingPrice: calculateSellingPrice(180),
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?q=80&w=1000',
  },
  {
    id: 'acc-2',
    name: 'CCTV BNC Connector (Pack of 10)',
    description: 'High-quality gold-plated BNC connectors for video signal.',
    costPrice: 45,
    sellingPrice: calculateSellingPrice(45),
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?q=80&w=1000',
  },
  {
    id: 'acc-3',
    name: 'Aluminum Solar Mounting Rail',
    description: 'Durable mounting rail for secure solar panel installation.',
    costPrice: 120,
    sellingPrice: calculateSellingPrice(120),
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1542336391-ae2936d8efe4?q=80&w=1000',
  },
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'sec-1',
    userName: 'Ahmad Razif',
    rating: 5,
    comment: 'Very clear image even at night. Highly recommended!',
    date: '2024-03-15',
  },
  {
    id: 'rev-2',
    productId: 'sec-1',
    userName: 'Siti Aminah',
    rating: 4,
    comment: 'Good quality, but installation took some time.',
    date: '2024-03-20',
  },
  {
    id: 'rev-3',
    productId: 'sol-1',
    userName: 'John Doe',
    rating: 5,
    comment: 'Excellent efficiency. My electricity bill dropped significantly.',
    date: '2024-04-01',
  }
];

export const BUSINESS_INFO = {
  name: 'Izwan Systec Enterprise',
  regNo: '202103055724 (CA0318484-D)',
  bank: 'CIMB Bank',
  accountNo: '8604630283',
};
