import React, { createContext, useContext, useState, useCallback } from 'react';

interface IProveedor {
  nombre: string;
  rfc: string;
  direccion: string;
  telefonos: string[];
  email: string;
  productos_suministrados: string[];
  historial_compras: {
    total_compras: number;
    ultima_compra: string;
  };
  _id: string;
}

interface ICalzado {
  _id: string;
  codigo_barras: string;
  modelo: string;
  marca: string;
  descripcion: string;
  precio_compra: number;
  precio_venta: number;
  variantes: string[];
  proveedor?: IProveedor;
  proveedores_ids: string[];
  estado: string;
  fecha_registro: string;
  createdAt: string;
  updatedAt: string;
}

interface CartItem extends ICalzado {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: ICalzado) => void;
  removeFromCart: (itemId: string) => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((item: ICalzado) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(cartItem => cartItem._id === item._id);
      if (existingItem) {
        return currentCart.map(cartItem =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...currentCart, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(currentCart => currentCart.filter(item => item._id !== itemId));
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.precio_venta * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, totalItems, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};