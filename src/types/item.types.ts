// items
export type Item = {
  id: number;
  name: string;
  property: string;
  propvalue: number;
  description: string;
  price: number;
  img: string;
  quantity?: number; // how many the user owns — only set for inventory items
};