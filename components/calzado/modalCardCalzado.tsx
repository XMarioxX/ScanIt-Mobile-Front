import React, { useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  FlatList,
  Image,
  ListRenderItem,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Sheet } from 'tamagui';
import { ShoppingCart, Trash2, Plus, Minus, AlertTriangle, X } from 'lucide-react-native';
import axios from 'axios';
import { useCart } from './card';
import tw from 'twrnc';
import uuid from 'react-native-uuid';
import { useNavigation } from '@react-navigation/native';
import EventRegister from './events';

const ip = '10.31.7.47';

// Keep your existing interfaces
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

interface IVariant {
  _id: string;
  calzado_id: string;
  talla: number;
  color: string;
  stock_actual: number;
  stock_minimo: number;
  historial_precios: any[];
  createdAt: string;
  updatedAt: string;
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
  variantes: IVariant[];
  proveedor?: IProveedor;
  proveedores_ids?: string[];
  estado: string;
  fecha_registro: string;
  createdAt: string;
  updatedAt: string;
}

// Modify CartItem to explicitly include all ICalzado properties
interface CartItem extends ICalzado {
  quantity: number;
}

const ModalCardCalzado = () => {
  const [open, setOpen] = useState(false);
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const { cart, removeFromCart, updateQuantity, totalItems, totalAmount } = useCart();
  const [selectedVariants, setSelectedVariants] = useState<Record<string, IVariant>>({});

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [discount, setDiscount] = useState(0);

  const navigation = useNavigation();

  const openClientModal = () => {
    const isVariantSelected = cart.every(
      (item) =>
        selectedVariants[item._id] && selectedVariants[item._id].stock_actual >= item.quantity
    );

    if (!isVariantSelected) {
      Alert.alert(
        'Error',
        'Por favor, selecciona una variante válida para cada producto y verifica el stock.'
      );
      return;
    }

    setOpen(false);
    setClientModalVisible(true);
  };

  const venderCart = async () => {
    try {
      // Validación inicial para mostrar la alerta si los datos del cliente están vacíos
      if (!clientName || !clientEmail || !clientPhone) {
        Alert.alert(
          'Continuar con datos de cliente global',
          `Datos del cliente:\nNombre: ${clientName || 'Global'}\nEmail: ${clientEmail || 'Global@cliente.com'}\nTeléfono: ${clientPhone || '0000000000'}`,
          [
            {
              text: 'Regresar',
              onPress: () => {}, // No hace nada, regresa automáticamente.
              style: 'cancel',
            },
            {
              text: 'Continuar',
              onPress: async () => {
              await procesarVenta({
                nombre: clientName || 'Global',
                email: clientEmail || 'Global@cliente.com',
                telefono: clientPhone || '0000000000',
              });
              },
            },
          ]
        );
        return; // Detiene el flujo para mostrar la alerta.
      }
  
      // Si los datos están completos, procede directamente.
      await procesarVenta({
        nombre: clientName,
        email: clientEmail,
        telefono: clientPhone,
      });
    } catch (error) {
      manejarErrorVenta(error);
    }
  };  
  
  // Nueva función para centralizar el procesamiento de la venta
  const procesarVenta = async (cliente: { nombre: string; email: string; telefono: string }) => {
    const numeroTicket = `TICKET-${Math.floor(Math.random() * 1000000)}`;
  
    const ventaData = {
      id: uuid.v4() as string,
      numero_ticket: numeroTicket,
      fecha_venta: new Date().toISOString(),
      vendedor_id: 'El Mario 123',
      items: cart.map((item) => ({
        variante_id: selectedVariants[item._id]._id,
        cantidad: item.quantity,
        precio: item.precio_venta,
      })),
      descuento: discount || 0,
      metodo_pago: paymentMethod,
      cliente,
    };

    const response = await axios.post(`http://${ip}:3000/api/ventas`, ventaData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    // Limpiar estados y cerrar modal
    cart.forEach((item) => removeFromCart(item._id));
    setSelectedVariants({});
    setClientModalVisible(false);
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setPaymentMethod('efectivo');
  
    Alert.alert('Éxito', 'Venta realizada correctamente');
    EventRegister.emit('reloadMainPage', 'Venta exitosa');
  };
  
  // Manejar errores de forma centralizada
  const manejarErrorVenta = (error: unknown) => {
    console.error('Error en la venta:', error);
  
    if (axios.isAxiosError(error)) {
      if (error.response) {
        Alert.alert('Error', error.response.data.message || 'Error al procesar la venta');
      } else if (error.request) {
        Alert.alert('Error', 'No se pudo conectar con el servidor');
      } else {
        Alert.alert('Error', 'Ocurrió un error inesperado');
      }
    } else {
      Alert.alert('Error', 'No se pudo procesar la venta');
    }
  };  

  // Modificar la función handleVariantChange para reiniciar la cantidad
  const handleVariantChange = (calzadoId: string, variant: IVariant) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [calzadoId]: variant,
    }));

    // Reiniciar la cantidad a 1 cuando se cambia la variante
    updateQuantity(calzadoId, 1);
  };

  const renderCartItem: ListRenderItem<CartItem> = ({ item }) => {
    const selectedVariant = selectedVariants[item._id];

    // Check if the selected variant is low on stock
    const isLowStock = selectedVariant
      ? selectedVariant.stock_actual <= selectedVariant.stock_minimo
      : false;

    return (
      <View
        style={[
          tw`p-4 bg-white rounded-lg mb-4`,
          isLowStock && tw`bg-red-50 border border-red-200`,
        ]}>
        {isLowStock && (
          <View style={tw`flex-row items-center mb-2`}>
            <AlertTriangle size={20} color="red" style={tw`mr-2`} />
            <Text style={tw`text-red-600 font-bold`}>Stock Bajo</Text>
          </View>
        )}

        <View style={tw`flex-row items-center`}>
          <Image
            source={{ uri: item.imagen_url || 'https://via.placeholder.com/150' }}
            style={tw`w-16 h-16 rounded-lg mr-4`}
          />
          <View style={tw`flex-1`}>
            <Text style={tw`text-lg font-bold`}>{item.modelo}</Text>
            <Text style={tw`text-gray-500`}>${item.precio_venta.toFixed(2)}</Text>
          </View>
        </View>

        <View style={tw`mt-4`}>
          <Text style={tw`text-gray-700 mb-2`}>Seleccionar variante:</Text>
          <Picker
            selectedValue={selectedVariant || null}
            onValueChange={(value) => handleVariantChange(item._id, value as IVariant)}
            style={tw`bg-gray-100 rounded-lg`}>
            <Picker.Item label="Selecciona una variante" value={null} />
            {item.variantes.map((variant) => (
              <Picker.Item
                key={variant._id}
                label={`${variant.color} ${variant.talla} (Stock: ${variant.stock_actual})`}
                value={variant}
              />
            ))}
          </Picker>
        </View>

        {selectedVariant && (
          <View style={[tw`mt-4 bg-gray-100 p-4 rounded-lg`, isLowStock && tw`bg-red-100`]}>
            <Text style={tw`text-gray-700 font-bold`}>Información de la variante:</Text>
            <Text style={tw`text-gray-700`}>Talla: {selectedVariant.talla}</Text>
            <Text style={tw`text-gray-700`}>Color: {selectedVariant.color}</Text>
            <Text style={[tw`text-gray-700`, isLowStock ? tw`text-red-600 font-bold` : undefined]}>
              Stock Actual: {selectedVariant.stock_actual}
            </Text>
            <Text style={tw`text-gray-700`}>Stock Mínimo: {selectedVariant.stock_minimo}</Text>
          </View>
        )}

        <View style={tw`flex-row items-center mt-4`}>
          <TouchableOpacity
            onPress={() => {
              if (item.quantity > 1) {
                updateQuantity(item._id, item.quantity - 1);
              }
            }}
            style={tw`p-2 bg-gray-100 rounded-l-lg`}>
            <Minus size={20} color="#000" />
          </TouchableOpacity>
          <Text style={tw`px-4 py-2 bg-gray-200`}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => {
              // Limit quantity to available stock
              if (selectedVariant && item.quantity < selectedVariant.stock_actual) {
                updateQuantity(item._id, item.quantity + 1);
              }
            }}
            style={tw`p-2 bg-gray-100 rounded-r-lg`}>
            <Plus size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeFromCart(item._id)} style={tw`ml-2`}>
            <Trash2 size={20} color="red" />
          </TouchableOpacity>
        </View>

        {/* Low stock warning */}
        {isLowStock && (
          <View style={tw`mt-2 flex-row items-center`}>
            <AlertTriangle size={16} color="red" style={tw`mr-2`} />
            <Text style={tw`text-red-600 text-sm`}>¡Advertencia: Stock muy bajo!</Text>
          </View>
        )}
      </View>
    );
  };

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
              <Text style={tw`text-2xl font-bold text-white`}>
                Carro de compras ({totalItems} productos)
              </Text>
              <TouchableOpacity
                style={tw`w-10 h-10 rounded-full bg-gray-100 items-center justify-center`}
                onPress={() => setOpen(false)}>
                <ShoppingCart size={20} style={tw`text-black`} />
              </TouchableOpacity>
            </View>

            {cart.length === 0 ? (
              <View style={tw`flex-1 items-center justify-center`}>
                <Text style={tw`text-lg text-gray-500`}>El Carro está vacío</Text>
              </View>
            ) : (
              <>
                <FlatList<CartItem>
                  data={cart}
                  renderItem={renderCartItem}
                  keyExtractor={(item) => item._id}
                  style={tw`flex-1`}
                />

                <View style={tw`mt-4 p-4 bg-gray-100 rounded-lg`}>
                  <View style={tw`flex-row justify-between mb-2`}>
                    <Text style={tw`text-lg font-bold`}>Total</Text>
                    <Text style={tw`text-lg font-bold`}>${totalAmount.toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity
                    style={tw`w-full bg-blue-500 rounded-lg p-3`}
                    onPress={openClientModal}>
                    <Text style={tw`text-white text-center`}>Vender</Text>
                  </TouchableOpacity>
                </View>
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={clientModalVisible}
                  onRequestClose={() => {
                    setClientModalVisible(false);
                    setOpen(true);
                  }}>
                  <View style={tw`flex-1 justify-center items-center bg-black/50`}>
                    <View style={tw`w-11/12 bg-white rounded-lg p-6`}>
                      {/* Botón de cerrar */}
                      <TouchableOpacity
                        style={tw`absolute top-4 right-4`}
                        onPress={() => {
                          setClientModalVisible(false);
                          setOpen(true);
                        }}>
                        <X size={24} color="black" />
                      </TouchableOpacity>

                      <Text style={tw`text-2xl font-bold mb-6 text-center`}>Datos del Cliente</Text>

                      {/* Campos de datos del cliente */}
                      <TextInput
                        style={tw`border border-gray-300 rounded-lg p-3 mb-4`}
                        placeholder="Nombre del Cliente"
                        value={clientName}
                        onChangeText={setClientName}
                      />
                      <TextInput
                        style={tw`border border-gray-300 rounded-lg p-3 mb-4`}
                        placeholder="Correo Electrónico"
                        keyboardType="email-address"
                        value={clientEmail}
                        onChangeText={setClientEmail}
                      />
                      <TextInput
                        style={tw`border border-gray-300 rounded-lg p-3 mb-4`}
                        placeholder="Teléfono"
                        keyboardType="phone-pad"
                        value={clientPhone}
                        onChangeText={setClientPhone}
                      />

                      {/* Selector de Método de Pago */}
                      <Text style={tw`text-lg font-semibold mb-2`}>Método de Pago</Text>
                      <Picker
                        selectedValue={paymentMethod}
                        onValueChange={(itemValue) => setPaymentMethod(itemValue)}
                        style={tw`bg-gray-100 rounded-lg mb-4`}>
                        <Picker.Item label="Efectivo" value="efectivo" />
                        <Picker.Item label="Tarjeta de Crédito" value="tarjeta_credito" />
                        <Picker.Item label="Tarjeta de Débito" value="tarjeta_debito" />
                        <Picker.Item label="Transferencia" value="transferencia" />
                      </Picker>
                      <TextInput
                        style={tw`border border-gray-300 rounded-lg p-3 mb-4`}
                        placeholder="Descuento (opcional)"
                        keyboardType="numeric"
                        value={discount.toString()}
                        onChangeText={(text) => setDiscount(Number(text) || 0)}
                      />
                      {/* Botón de Realizar Venta */}
                      <TouchableOpacity
                        style={tw`bg-blue-500 rounded-lg p-4`}
                        onPress={venderCart}
                      >
                        <Text style={tw`text-white text-center font-bold`}>Realizar Venta</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              </>
            )}
          </View>
        </Sheet.Frame>
      </Sheet>
    </>
  );
};

export default ModalCardCalzado;
