import React, { useState } from 'react';
import { TouchableOpacity, View, Text, FlatList, Image } from 'react-native';
import { Sheet } from 'tamagui';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react-native';
import { useCart } from './card';
import tw from 'twrnc';

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

const ModalCardCalzado = () => {
  const [open, setOpen] = useState(false);
  const { cart, removeFromCart, updateQuantity, totalItems, totalAmount } = useCart();

  

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={tw`flex-row items-center p-4 bg-white rounded-lg mb-2`}>
      {/* <Text>{item.variantes[0]}</Text> */}
      <Image 
        source={{ uri: item.imagen_url || 'https://via.placeholder.com/150' }} 
        style={tw`w-16 h-16 rounded-lg mr-4`} 
      />
      <View style={tw`flex-1`}>
        <Text style={tw`text-lg font-bold`}>{item.modelo}</Text>
        <Text style={tw`text-gray-500`}>${item.precio_venta.toFixed(2)}</Text>
      </View>
      <View style={tw`flex-row items-center`}>
        <TouchableOpacity 
          onPress={() => {
            if (item.quantity > 1) {
              updateQuantity(item._id, item.quantity - 1);
            }
          }}
          style={tw`p-2 bg-gray-100 rounded-l-lg`}
        >
          <Minus size={20} color="#000" />
        </TouchableOpacity>
        <Text style={tw`px-4 py-2 bg-gray-200`}>{item.quantity}</Text>
        <TouchableOpacity 
          onPress={() => updateQuantity(item._id, item.quantity + 1)}
          style={tw`p-2 bg-gray-100 rounded-r-lg`}
        >
          <Plus size={20} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => removeFromCart(item._id)}
          style={tw`ml-2`}
        >
          <Trash2 size={20} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <TouchableOpacity
        style={tw`w-10 h-10 bg-zinc-800 rounded-lg items-center justify-center`}
        onPress={() => setOpen(true)}>
        <ShoppingCart size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        snapPoints={[80]}
        position={0}
        dismissOnSnapToBottom>
        <Sheet.Overlay />
        <Sheet.Frame>
          <Sheet.Handle />
          <View style={tw`p-4 flex-1 bg-zinc-800`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`text-2xl font-bold text-white`}>Carro de compras ({totalItems} productos)</Text>
              <TouchableOpacity
                style={tw`w-10 h-10 rounded-full bg-gray-100 items-center justify-center`}
                onPress={() => setOpen(false)}>
                <ShoppingCart size={20} style={tw`text-black`} />
              </TouchableOpacity>
            </View>

            {cart.length === 0 ? (
              <View style={tw`flex-1 items-center justify-center`}>
                <Text style={tw`text-lg text-gray-500`}>El Carro esta vacío</Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={cart}
                  renderItem={renderCartItem}
                  keyExtractor={item => item._id}
                  style={tw`flex-1`}
                />

                <View style={tw`mt-4 p-4 bg-gray-100 rounded-lg`}>
                  <View style={tw`flex-row justify-between mb-2`}>
                    <Text style={tw`text-lg font-bold`}>Total</Text>
                    <Text style={tw`text-lg font-bold`}>${totalAmount.toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity 
                    style={tw`bg-black rounded-lg p-4 items-center`}
                    onPress={() => {
                      // Implement checkout logic
                      console.log('Proceed to checkout');
                    }}
                  >
                    <Text style={tw`text-white font-bold text-lg`}>Vender</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Sheet.Frame>
      </Sheet>
    </>
  );
};

export default ModalCardCalzado;