import { Pencil, Trash2, ShoppingCart } from 'lucide-react-native'
import { Button } from 'tamagui'
import React, { useEffect, useState, createContext, useContext, useCallback } from 'react'
import tw from 'twrnc'
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import axios from 'axios'
import BarcodeGenerator from '../global/BarCodeGenerator'
const ip = "192.168.0.187"

// Interfaces
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

interface ApiResponse {
  status: number;
  path: string;
  metadata: {
    total: number;
    responseTimeMs: number;
    timestamp: string;
  };
  stats: {
    calzadosDisponibles: number;
    calzadosAgotados: number;
    ultimaActualizacion: string;
  };
  data: ICalzado[];
}

// Context Creation
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider Component
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

// Custom Hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Cart Icon Component
const CartIcon = () => {
  const { totalItems } = useCart();
  
  return (
    <TouchableOpacity style={tw`relative`}>
      <ShoppingCart size={24} color="black" />
      {totalItems > 0 && (
        <View style={tw`absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center`}>
          <Text style={tw`text-white text-xs`}>{totalItems}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Table Row Component
const TableRow = ({ label, value }: { label: string; value: string | number }) => (
  <View style={tw`flex-row border-b border-gray-200 w-full`}>
    <View style={tw`w-1/2 p-2 border-r border-gray-200`}>
      <Text style={tw`text-black font-bold`}>{label}</Text>
    </View>
    <View style={tw`w-1/2 p-2`}>
      <Text style={tw`text-black`}>{value}</Text>
    </View>
  </View>
);

// Estado Indicator Component
const EstadoIndicator = ({ estado }: { estado: string }) => {
  const getBackgroundColor = (estado: string) => {
    switch (estado) {
      case 'disponible':
        return 'bg-green-300';
      case 'agotado':
        return 'bg-red-200';
      default:
        return '';
    }
  };

  return (
    <View style={tw`flex-row items-center justify-center`}>
      <Text style={tw`font-bold mr-2 text-black`}>Estado:</Text>
      <View style={tw`${getBackgroundColor(estado)} rounded-md`}>
        <Text style={tw`px-2 py-1 text-black`}>
          {estado}
        </Text>
      </View>
    </View>
  );
};

// Main Card Component Content
const CardCalzadoContent = () => {
  const [calzados, setCalzados] = useState<ICalzado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart, totalItems, totalAmount } = useCart();

  const fetchCalzados = async () => {
    try {
      const response = await axios.get<ApiResponse>(`http://${ip}:3000/api/calzado`);
      setCalzados(response.data.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error fetching calzados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalzados();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text style={tw`text-red-500 text-lg`}>{error}</Text>
      </View>
    );
  }

  return (
    <>
      {/* Cart Summary */}
      <View style={tw`flex-row justify-between items-center p-4 bg-white border-b border-gray-200`}>
        <View style={tw`flex-row items-center`}>
          <CartIcon />
          <Text style={tw`ml-2 text-black`}>({totalItems} items)</Text>
        </View>
        <Text style={tw`text-black font-bold`}>Total: ${totalAmount.toFixed(2)}</Text>
      </View>

      <ScrollView contentContainerStyle={tw`pb-5 mx-2`}>
        {calzados.length === 0 ? (
          <Text style={tw`text-black text-center mt-5 text-lg`}>Sin datos para mostrar</Text>
        ) : (
          calzados.map((item) => (
            <View key={item._id} style={tw`mt-5 border-2 border-black bg-white rounded-lg p-4 shadow-lg`}>
              {/* Header */}
              <View style={tw`flex-row items-center justify-between mb-4`}>
                <Text style={tw`text-lg font-bold text-black`}>{item.modelo}</Text>
                <View style={tw`flex-row items-center`}>
                  <TouchableOpacity>
                    <Button
                      icon={<ShoppingCart />}
                      variant="outlined"
                      size="$3"
                      style={tw`text-white text-xl bg-green-500 mr-1.5`}
                      onPress={() => addToCart(item)}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Button
                      icon={<Pencil />}
                      variant="outlined"
                      size="$3"
                      style={tw`text-white text-xl bg-blue-500 mr-1.5`}
                      onPress={() => { }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Button
                      icon={<Trash2 />}
                      variant="outlined"
                      size="$3"
                      style={tw`text-white text-xl bg-red-500 mr-1.5`}
                      onPress={() => { }}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Contenido Principal */}
              <View style={tw`flex-row mb-4`}>
                <View style={tw`w-1/3 bg-gray-100 rounded-lg mr-2 h-32 items-center justify-center`}>
                  <Text style={tw`text-gray-500`}>Foto</Text>
                </View>

                <View style={tw`w-2/3 border border-gray-200 rounded-lg overflow-hidden`}>
                  <TableRow label="Marca" value={item.marca} />
                  <TableRow label="Descripción" value={item.descripcion} />
                  <TableRow label="Precio de Compra" value={`$${item.precio_compra}`} />
                  <TableRow label="Precio de Venta" value={`$${item.precio_venta}`} />
                </View>
              </View>

              <View style={tw`mb-4`}>
                <EstadoIndicator estado={item.estado} />
              </View>

              <View style={tw`mb-4 border border-gray-200 rounded-lg p-2`}>
                <Text style={tw`text-black font-bold text-center mb-2`}>Colores Disponibles</Text>
                <View style={tw`flex-row justify-center`}>
                  <Text style={tw`text-gray-500`}>Sección de colores aquí</Text>
                </View>
              </View>

              {item.proveedor && (
                <View style={tw`mb-4 border border-gray-200 rounded-lg overflow-hidden`}>
                  <Text style={tw`text-black font-bold text-center py-2 bg-gray-50`}>
                    Información del Proveedor
                  </Text>
                  <TableRow label="Nombre" value={item.proveedor.nombre} />
                  <TableRow label="Email" value={item.proveedor.email} />
                </View>
              )}

              <View style={tw`mb-4 border border-gray-200 rounded-lg overflow-hidden`}>
                <TableRow label="Fecha de Registro" value={formatDate(item.fecha_registro)} />
                <TableRow label="Última Actualización" value={formatDate(item.updatedAt)} />
              </View>

              <View style={tw`items-center mt-4`}>
                <Text style={tw`text-black font-bold mb-2`}>Código de Barras</Text>
                <BarcodeGenerator value={`${item.codigo_barras}`} height={50}/>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </>
  );
};

// Wrapper Component with Provider
const CardCalzado = () => {
  return (
    <CartProvider>
      <CardCalzadoContent />
    </CartProvider>
  );
};

export default CardCalzado;