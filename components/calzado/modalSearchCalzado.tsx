import React, { useState, useEffect } from 'react';
import { Barcode, X, AlertCircle } from 'lucide-react-native';
import { Sheet } from 'tamagui';
import tw from 'twrnc';
import { TouchableOpacity, View, Text, TextInput, ScrollView, ActivityIndicator, Image } from 'react-native';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import axios from 'axios';
import BarcodeGenerator from '../global/BarCodeGenerator';

const ip = '10.31.7.47';

// Interfaces
interface IVariante {
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
  variantes: IVariante[];
  proveedor?: IProveedor;
  proveedores_ids?: string[];
  estado: string;
  fecha_registro: string;
  createdAt: string;
  updatedAt: string;
}

interface IStats {
  calzadosDisponibles: number;
  calzadosAgotados: number;
  totalStock: number;
  stockBajo: number;
  ultimaActualizacion: string;
}

interface IApiResponse {
  status: number;
  metadata: {
    total: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
    responseTimeMs: number;
    timestamp: string;
    searchParams: {
      codigo?: string;
      page: number;
      perPage: number;
    };
  };
  stats: IStats;
  data: ICalzado[];
  error?: {
    message: string;
    type: string;
  };
}

// Component Props interfaces remain the same...
interface TableRowProps {
  label: string;
  value: string | number;
}

interface ErrorMessageProps {
  message: string;
}

interface EstadoIndicatorProps {
  estado: string;
}

// Utility Components
const TableRow: React.FC<TableRowProps> = ({ label, value }) => (
  <View style={tw`flex-row border-b border-gray-200 w-full`}>
    <View style={tw`w-1/2 p-2 border-r border-gray-200`}>
      <Text style={tw`text-black font-bold`}>{label}</Text>
    </View>
    <View style={tw`w-1/2 p-2`}>
      <Text style={tw`text-black`}>{value.toString()}</Text>
    </View>
  </View>
);

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <View style={tw`bg-red-100 border border-red-400 rounded-lg p-4 mb-4 flex-row items-center`}>
    <AlertCircle size={24} color="#EF4444" style={tw`mr-2`} />
    <Text style={tw`text-red-700 flex-1`}>{message}</Text>
  </View>
);

const LoadingSpinner: React.FC = () => (
  <View style={tw`flex-1 justify-center items-center p-4`}>
    <ActivityIndicator size="large" color="#3B82F6" />
    <Text style={tw`text-gray-600 mt-2`}>Buscando calzado...</Text>
  </View>
);

const EstadoIndicator: React.FC<EstadoIndicatorProps> = ({ estado }) => {
  const getEstadoStyle = (estado: string): { container: string; text: string } => {
    switch (estado.toLowerCase()) {
      case 'disponible':
        return {
          container: 'bg-green-100 border-green-200',
          text: 'text-green-800'
        };
      case 'agotado':
        return {
          container: 'bg-red-100 border-red-200',
          text: 'text-red-800'
        };
      default:
        return {
          container: 'bg-gray-100 border-gray-200',
          text: 'text-gray-800'
        };
    }
  };

  const style = getEstadoStyle(estado);

  return (
    <View style={tw`${style.container} border rounded-full px-4 py-2 self-start`}>
      <Text style={tw`${style.text} font-medium`}>{estado}</Text>
    </View>
  );
};

const ModalSearchCalzado: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [codigo, setCodigo] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [calzado, setCalzado] = useState<ICalzado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<IStats | null>(null);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const calculateStats = (data: ICalzado[]): IStats => {
    let totalStock = 0;
    let stockBajo = 0;
    let calzadosDisponibles = 0;
    let calzadosAgotados = 0;

    data.forEach(calzado => {
      let calzadoStock = 0;
      let calzadoBajo = false;

      calzado.variantes.forEach(variante => {
        calzadoStock += variante.stock_actual;
        if (variante.stock_actual <= variante.stock_minimo) {
          calzadoBajo = true;
        }
      });

      totalStock += calzadoStock;
      if (calzadoBajo) stockBajo++;
      if (calzadoStock > 0) {
        calzadosDisponibles++;
      } else {
        calzadosAgotados++;
      }
    });

    return {
      calzadosDisponibles,
      calzadosAgotados,
      totalStock,
      stockBajo,
      ultimaActualizacion: new Date().toISOString()
    };
  };

  const handleBarCodeScanned = ({ data }: BarCodeScannerResult) => {
    setScanning(false);
    setCodigo(data);
    buscarCalzado(data);
  };

  const toggleScanner = () => {
    setScanning(!scanning);
    if (!scanning) {
      setError(null);
      setCalzado(null);
    }
  };

  const resetSearch = () => {
    setCodigo('');
    setCalzado(null);
    setError(null);
    setStats(null);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const buscarCalzado = async (codigoSearch: string): Promise<void> => {
    if (!codigoSearch.trim()) {
      setError('Por favor ingrese un código de barras');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCalzado(null);
      
      const response = await axios.get<IApiResponse>(
        `http://${ip}:3000/api/calzado?page=1&perPage=10&codigo=${codigoSearch.trim()}`
      );

      if (response.data.status === 404) {
        setError('No se encontró ningún calzado con ese código de barras');
        return;
      }

      if (response.data.data.length > 0) {
        setCalzado(response.data.data[0]);
        // Calculate new stats based on the data
        const newStats = calculateStats(response.data.data);
        setStats(newStats);
      } else {
        setError('No se encontraron resultados');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error?.message || 'Error al buscar el calzado');
      } else {
        setError('Error desconocido al buscar el calzado');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    buscarCalzado(codigo);
  };

  if (hasPermission === false) {
    return <Text>Sin acceso a la cámara</Text>;
  }

  return (
    <>
      <TouchableOpacity
        style={tw`w-10 h-10 bg-zinc-800 rounded-lg items-center justify-center`}
        onPress={() => {
          setOpen(true);
          resetSearch();
        }}
      >
        <Barcode size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <Sheet
        modal
        open={open}
        onOpenChange={(isOpen: boolean) => {
          setOpen(isOpen);
          if (!isOpen) resetSearch();
        }}
        snapPoints={[80]}
        position={0}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame>
          <Sheet.Handle />
          
          <View style={tw`p-4 flex-1`}>
            {/* Header */}
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`text-xl font-bold text-white`}>
                Buscar Calzado
              </Text>
              <TouchableOpacity
                style={tw`w-10 h-10 rounded-full bg-gray-100 items-center justify-center`}
                onPress={() => setOpen(false)}
              >
                <X size={20} style={tw`text-black`} />
              </TouchableOpacity>
            </View>

            {/* Scanner View */}
            {scanning && (
              <View style={tw`h-64 overflow-hidden rounded-lg mb-4 relative`}>
                <BarCodeScanner
                  onBarCodeScanned={handleBarCodeScanned}
                  style={tw`flex-1`}
                />
                <View style={tw`absolute top-0 left-0 right-0 bg-black bg-opacity-50 p-2`}>
                  <Text style={tw`text-white text-center`}>
                    Apunte al código de barras
                  </Text>
                </View>
              </View>
            )}

            {/* Search Bar */}
            <View style={tw`flex-row items-center gap-2 mb-4`}>
              <TextInput
                style={tw`flex-1 h-12 px-4 border border-gray-300 rounded-lg bg-white`}
                placeholder="Ingrese código de calzado"
                value={codigo}
                onChangeText={setCodigo}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity
                style={tw`w-12 h-12 bg-zinc-800 rounded-lg items-center justify-center`}
                onPress={toggleScanner}
              >
                <Barcode size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Botón de búsqueda */}
            <TouchableOpacity
              style={tw`w-full h-12 bg-blue-500 rounded-lg items-center justify-center mb-4`}
              onPress={handleSearch}
            >
              <Text style={tw`text-white font-bold`}>Buscar</Text>
            </TouchableOpacity>

            {/* Error Message */}
            {error && <ErrorMessage message={error} />}

            {/* Results Area */}
            <ScrollView style={tw`flex-1`}>
              {loading ? (
                <LoadingSpinner />
              ) : calzado ? (
                <View style={tw`border border-gray-200 bg-white rounded-lg p-4 shadow-sm`}>
                  {/* Header Info */}
                  <View style={tw`mb-4`}>
                    <Text style={tw`text-2xl font-bold text-gray-800 mb-2`}>
                      {calzado.modelo}
                    </Text>
                    <EstadoIndicator estado={calzado.estado} />
                  </View>

                  {/* Imagen y Detalles Básicos */}
                  <View style={tw`flex-row mb-6`}>
                    <View style={tw`w-1/3 bg-gray-100 rounded-lg mr-4 aspect-square overflow-hidden`}>
                      {calzado.imagen_url ? (
                        <Image
                          source={{ uri: calzado.imagen_url }}
                          style={tw`w-full h-full`}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={tw`w-full h-full items-center justify-center`}>
                          <Text style={tw`text-gray-500`}>Sin imagen</Text>
                        </View>
                      )}
                    </View>

                    <View style={tw`flex-1`}>
                      <View style={tw`border border-gray-200 rounded-lg overflow-hidden`}>
                        <TableRow label="Marca" value={calzado.marca} />
                        <TableRow label="Descripción" value={calzado.descripcion} />
                        <TableRow 
                          label="Precio Compra" 
                          value={formatCurrency(calzado.precio_compra)}
                        />
                        <TableRow 
                          label="Precio Venta" 
                          value={formatCurrency(calzado.precio_venta)}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Variantes */}
                  <View style={tw`mb-6`}>
                  <Text style={tw`text-lg font-bold text-gray-800 mb-2`}>
                      Variantes Disponibles
                    </Text>
                    <View style={tw`border border-gray-200 rounded-lg overflow-hidden`}>
                      {calzado.variantes.map((variante, index) => (
                        <View 
                          key={variante._id}
                          style={tw`flex-row p-3 ${
                            index !== calzado.variantes.length - 1 ? 'border-b border-gray-200' : ''
                          }`}
                        >
                          <View style={tw`flex-1`}>
                            <Text style={tw`text-gray-800`}>
                              Talla {variante.talla} - {variante.color}
                            </Text>
                            <Text style={tw`text-sm ${
                              variante.stock_actual <= variante.stock_minimo 
                                ? 'text-red-600' 
                                : 'text-green-600'
                            }`}>
                              Stock: {variante.stock_actual} 
                              {variante.stock_actual <= variante.stock_minimo && ' (Stock Bajo)'}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Código de Barras */}
                  <View style={tw`mb-6 p-4 bg-gray-50 rounded-lg items-center`}>
                    <Text style={tw`text-gray-600 mb-2`}>Código de Barras</Text>
                    <BarcodeGenerator 
                      value={calzado.codigo_barras} 
                      height={60}
                    />
                    <Text style={tw`mt-2 text-gray-800 font-mono`}>
                      {calzado.codigo_barras}
                    </Text>
                  </View>

                  {/* Información del Proveedor */}
                  {calzado.proveedor && (
                    <View style={tw`mb-6`}>
                      <Text style={tw`text-lg font-bold text-gray-800 mb-2`}>
                        Información del Proveedor
                      </Text>
                      <View style={tw`border border-gray-200 rounded-lg overflow-hidden`}>
                        <TableRow label="Nombre" value={calzado.proveedor.nombre} />
                        <TableRow label="Email" value={calzado.proveedor.email} />
                        <TableRow 
                          label="Teléfono" 
                          value={calzado.proveedor.telefonos[0] || 'N/A'} 
                        />
                        <TableRow label="RFC" value={calzado.proveedor.rfc} />
                      </View>
                    </View>
                  )}

                  {/* Fechas */}
                  <View style={tw`border border-gray-200 rounded-lg overflow-hidden mb-6`}>
                    <TableRow 
                      label="Registro" 
                      value={formatDate(calzado.fecha_registro)} 
                    />
                    <TableRow 
                      label="Actualización" 
                      value={formatDate(calzado.updatedAt)} 
                    />
                  </View>

                  {/* Estadísticas */}
                  {stats && (
                    <View style={tw`p-4 bg-gray-50 rounded-lg`}>
                      <Text style={tw`text-sm text-gray-500 mb-3`}>
                        Última actualización: {formatDate(stats.ultimaActualizacion)}
                      </Text>
                      <View style={tw`grid grid-cols-2 gap-4`}>
                        <View style={tw`bg-white p-3 rounded-lg border border-gray-200`}>
                          <Text style={tw`text-green-600 text-lg font-bold`}>
                            {stats.calzadosDisponibles}
                          </Text>
                          <Text style={tw`text-sm text-gray-600`}>Calzados Disponibles</Text>
                        </View>
                        <View style={tw`bg-white p-3 rounded-lg border border-gray-200`}>
                          <Text style={tw`text-red-600 text-lg font-bold`}>
                            {stats.calzadosAgotados}
                          </Text>
                          <Text style={tw`text-sm text-gray-600`}>Calzados Agotados</Text>
                        </View>
                        <View style={tw`bg-white p-3 rounded-lg border border-gray-200`}>
                          <Text style={tw`text-blue-600 text-lg font-bold`}>
                            {stats.totalStock}
                          </Text>
                          <Text style={tw`text-sm text-gray-600`}>Stock Total</Text>
                        </View>
                        <View style={tw`bg-white p-3 rounded-lg border border-gray-200`}>
                          <Text style={tw`text-orange-600 text-lg font-bold`}>
                            {stats.stockBajo}
                          </Text>
                          <Text style={tw`text-sm text-gray-600`}>Stock Bajo</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              ) : null}
            </ScrollView>
          </View>
        </Sheet.Frame>
      </Sheet>
    </>
  );
};

export default ModalSearchCalzado;