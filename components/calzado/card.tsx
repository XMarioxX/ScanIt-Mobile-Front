import {
  Pencil,
  Trash2,
  ShoppingCart,
  CirclePlus,
  Search,
  ScanBarcode,
  Barcode,
  Plus,
} from 'lucide-react-native';
import { Button } from 'tamagui';
import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import tw from 'twrnc';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
  ImageBackground,
  Modal,
} from 'react-native';
import axios from 'axios';
import BarcodeGenerator from '../global/BarCodeGenerator';
import ModalSearchCalzado from './modalSearchCalzado';
import ModalAddCalzado from './modalAddCalzado';
import ModalCardCalzado from './modalCardCalzado';
import EventRegister from './events';

const ip = '10.31.7.47';

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
  imagen_url?: string;
  imagen_public_id?: string;
  variantes: string[];
  proveedor?: IProveedor;
  proveedores_ids?: string[];
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
  updateQuantity: (itemId: string, newQuantity: number) => void;
  totalItems: number;
  totalAmount: number;
}

interface ApiResponse {
  status: number;
  path: string;
  metadata: {
    total: number;
    totalPages: number;
    currentPage: number;
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
    setCart((currentCart) => {
      const existingItem = currentCart.find((cartItem) => cartItem._id === item._id);
      if (existingItem) {
        return currentCart.map((cartItem) =>
          cartItem._id === item._id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        );
      }
      return [...currentCart, { ...item, quantity: 1 }] as CartItem[];
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, newQuantity: number) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((currentCart) => currentCart.filter((item) => item._id !== itemId));
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.precio_venta * item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      totalItems, 
      totalAmount 
    }}>
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
        <View
          style={tw`absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center`}>
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
    switch (estado.toLowerCase()) {
      case 'activo':
        return 'bg-green-300';
      case 'inactivo':
        return 'bg-red-200';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <View style={tw`flex-row items-center justify-center`}>
      <Text style={tw`font-bold mr-2 text-black`}>Estado:</Text>
      <View style={tw`${getBackgroundColor(estado)} rounded-md`}>
        <Text style={tw`px-2 py-1 text-black`}>{estado}</Text>
      </View>
    </View>
  );
};

// Main Card Component Content
const CardCalzadoContent = () => {
  const [calzados, setCalzados] = useState<ICalzado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToCart, totalItems, totalAmount } = useCart();

  const fetchCalzados = async (page: number) => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>(
        `http://${ip}:3000/api/calzado?page=${page}&perPage=1`
      );
      // const response = await axios.get<ApiResponse>(`http://${ip}:3000/api/calzado?${page}&perPage=1`);
      setCalzados(response.data.data);
      setTotalPages(response.data.metadata.totalPages || 1);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error fetching calzados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalzados(currentPage);
    const listener = EventRegister.addEventListener('reloadMainPage', () => {
      console.log('Recargando la información...');
      fetchCalzados(currentPage);
    });

    return () => {
      EventRegister.removeEventListener(listener);
    };
  }, [currentPage]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
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
      <View style={tw`flex-row justify-center items-center w-full gap-x-2`}>
      
        <ModalCardCalzado/>
        <ModalSearchCalzado />
        {/* <ModalAddCalzado /> */}
      </View>
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
            <View
              key={item._id}
              style={tw`mt-5 border-2 border-black bg-white rounded-lg p-4 shadow-lg`}>
              {/* Header */}
              <View style={tw`flex-row items-center justify-between mb-4`}>
                <Text style={tw`text-lg font-bold text-black`}>{item.modelo}</Text>
                <View style={tw`flex-row items-center`}>
                  <TouchableOpacity>
                    <Button
                      icon={<ShoppingCart />}
                      variant="outlined"
                      size="$3"
                      style={tw`text-white text-xl bg-black mr-1.5`}
                      onPress={() => addToCart(item)}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Button
                      icon={<Pencil />}
                      variant="outlined"
                      size="$3"
                      style={tw`text-white text-xl bg-blue-500 mr-1.5`}
                      onPress={() => {}}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Button
                      icon={<Trash2 />}
                      variant="outlined"
                      size="$3"
                      style={tw`text-white text-xl bg-red-500 mr-1.5`}
                      onPress={() => {}}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Contenido Principal */}
              <View style={tw`flex-row mb-4`}>
                <View style={tw`w-1/3 bg-gray-100 rounded-lg mr-2 aspect-square`}>
                  {item.imagen_url ? (
                    <Image
                      source={{ uri: item.imagen_url }}
                      style={tw`w-full h-full`}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={tw`w-full h-full items-center justify-center`}>
                      <Text style={tw`text-gray-500`}>Sin imagen</Text>
                    </View>
                  )}
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

              {item.proveedor && (
                <View style={tw`mb-4 border border-gray-200 rounded-lg overflow-hidden`}>
                  <Text style={tw`text-black font-bold text-center py-2 bg-gray-50`}>
                    Información del Proveedor
                  </Text>
                  <TableRow label="Nombre" value={item.proveedor.nombre} />
                  <TableRow label="Email" value={item.proveedor.email} />
                  <TableRow label="Teléfono" value={item.proveedor.telefonos[0] || 'N/A'} />
                  <TableRow label="RFC" value={item.proveedor.rfc} />
                  <TableRow label="Dirección" value={item.proveedor.direccion} />
                </View>
              )}

              <View style={tw`mb-4 border border-gray-200 rounded-lg overflow-hidden`}>
                <TableRow label="Fecha de Registro" value={formatDate(item.fecha_registro)} />
                <TableRow label="Última Actualización" value={formatDate(item.updatedAt)} />
              </View>

              <View style={tw`items-center mt-4`}>
                <Text style={tw`text-black font-bold mb-2`}>Código de Barras</Text>
                <BarcodeGenerator value={item.codigo_barras} height={50} />
              </View>
            </View>
          ))
        )}
        <View style={tw`flex-row items-center justify-between w-full px-4 mt-4`}>
          {currentPage > 1 ? (
            <TouchableOpacity
              onPress={handlePreviousPage}
              style={tw`px-4 py-2 bg-black rounded-lg`}>
              <Text style={tw`text-white font-bold`}>Anterior</Text>
            </TouchableOpacity>
          ) : (
            <View style={tw`w-20`} />
          )}

          <Text style={tw`text-black font-bold`}>
            Página {currentPage} de {totalPages}
          </Text>

          {currentPage < totalPages ? (
            <TouchableOpacity onPress={handleNextPage} style={tw`px-4 py-2 bg-black rounded-lg`}>
              <Text style={tw`text-white font-bold`}>Siguiente</Text>
            </TouchableOpacity>
          ) : (
            <View style={tw`w-20`} />
          )}
        </View>
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
