import { JsonFileStore } from '@/lib/store';

export interface InventoryItem {
  id: string; // Changed from productId to id for Store compatibility
  productId: string; // Kept for backward compatibility
  totalStock: number;
  reserved: number;
  warehouses: {
    [key: string]: number;
  };
  lowStockThreshold: number;
}

const defaultInventory: InventoryItem[] = [
  {
    id: "prod_123",
    productId: "prod_123",
    totalStock: 150,
    reserved: 20,
    warehouses: {
      "ny_main": 100,
      "sf_hub": 50
    },
    lowStockThreshold: 10
  },
  {
    id: "prod_456",
    productId: "prod_456",
    totalStock: 50,
    reserved: 0,
    warehouses: {
      "ny_main": 50
    },
    lowStockThreshold: 15
  },
  {
    id: "prod_789",
    productId: "prod_789",
    totalStock: 0,
    reserved: 0,
    warehouses: [
      { id: "wh_2", location: "LA", stock: 0 }
    ],
    lowStockThreshold: 5
  }
];
