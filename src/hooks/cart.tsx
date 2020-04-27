import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const getProduct = await AsyncStorage.getItem('@goMarketplace:products');

      if (getProduct) {
        setProducts(JSON.parse(getProduct));
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function updateStorage(): Promise<void> {
      await AsyncStorage.setItem(
        '@goMarketplace:products',
        JSON.stringify(products),
      );
    }
    updateStorage();
  }, [products]);

  const addToCart = useCallback(
    async ({ id, title, image_url, price }: Omit<Product, 'quantity'>) => {
      // TODO ADD A NEW ITEM TO THE CART
      const findProduct = products.find(findProducts => findProducts.id === id);
      if (!findProduct) {
        setProducts([
          ...products,
          { id, title, image_url, price, quantity: 1 },
        ]);

        return;
      }

      const updateQuantity = products.map(product => {
        if (product.id !== findProduct.id) return product;

        const moreQuantity = {
          ...product,
          quantity: product.quantity += 1,
        };

        return moreQuantity;
      });

      setProducts(updateQuantity);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const incrementeProduct = products.map(product => {
        if (product.id !== id) return product;

        const increment = {
          ...product,
          quantity: product.quantity += 1,
        };

        return increment;
      });

      setProducts([...incrementeProduct]);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART

      const decrementProduct = products
        .map(product => {
          if (product.id !== id) return product;

          const decrementFind = {
            ...product,
            quantity: product.quantity -= 1,
          };
          return decrementFind;
        })
        .filter(product => product.quantity > 0);
      setProducts(decrementProduct);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
