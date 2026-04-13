import { Product } from './types';

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
    image: 'https://picsum.photos/seed/cctv/600/400',
  },
  {
    id: 'sec-2',
    name: 'Smart Biometric Door Lock',
    description: 'Fingerprint and keypad entry for maximum home security.',
    costPrice: 450,
    sellingPrice: calculateSellingPrice(450),
    category: 'Security',
    image: 'https://picsum.photos/seed/doorlock/600/400',
  },
  {
    id: 'sec-3',
    name: 'Wireless Alarm System Kit',
    description: 'Complete home alarm system with door sensors and siren.',
    costPrice: 320,
    sellingPrice: calculateSellingPrice(320),
    category: 'Security',
    image: 'https://picsum.photos/seed/alarm/600/400',
  },

  // Solar
  {
    id: 'sol-1',
    name: '450W Monocrystalline Solar Panel',
    description: 'High-efficiency solar panel for residential and commercial use.',
    costPrice: 600,
    sellingPrice: calculateSellingPrice(600),
    category: 'Solar',
    image: 'https://picsum.photos/seed/solarpanel/600/400',
  },
  {
    id: 'sol-2',
    name: '5kW Hybrid Solar Inverter',
    description: 'Smart inverter with battery backup support and remote monitoring.',
    costPrice: 2800,
    sellingPrice: calculateSellingPrice(2800),
    category: 'Solar',
    image: 'https://picsum.photos/seed/inverter/600/400',
  },
  {
    id: 'sol-3',
    name: '100Ah LiFePO4 Battery',
    description: 'Deep cycle lithium battery for solar energy storage.',
    costPrice: 1500,
    sellingPrice: calculateSellingPrice(1500),
    category: 'Solar',
    image: 'https://picsum.photos/seed/battery/600/400',
  },

  // Accessories
  {
    id: 'acc-1',
    name: 'Solar DC Cable (100m)',
    description: 'UV resistant 4mm DC cable for solar installations.',
    costPrice: 180,
    sellingPrice: calculateSellingPrice(180),
    category: 'Accessories',
    image: 'https://picsum.photos/seed/cable/600/400',
  },
  {
    id: 'acc-2',
    name: 'CCTV BNC Connector (Pack of 10)',
    description: 'High-quality gold-plated BNC connectors for video signal.',
    costPrice: 45,
    sellingPrice: calculateSellingPrice(45),
    category: 'Accessories',
    image: 'https://picsum.photos/seed/connector/600/400',
  },
  {
    id: 'acc-3',
    name: 'Aluminum Solar Mounting Rail',
    description: 'Durable mounting rail for secure solar panel installation.',
    costPrice: 120,
    sellingPrice: calculateSellingPrice(120),
    category: 'Accessories',
    image: 'https://picsum.photos/seed/rail/600/400',
  },
];

export const BUSINESS_INFO = {
  name: 'Izwan Systec Enterprise',
  regNo: '202103055724 (CA0318484-D)',
  bank: 'CIMB Bank',
  accountNo: '8604630283',
};
