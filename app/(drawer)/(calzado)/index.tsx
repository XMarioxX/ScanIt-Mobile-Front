// import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
// import React, { useEffect, useState } from 'react'
// import { Button, Input, Dialog, Sheet } from 'tamagui';
// import { useNavigation, useRouter } from 'expo-router';
// import axios from 'axios';
// import tw from 'twrnc';
// import { AlertTriangle, Pencil, Plus, Trash2, X } from 'lucide-react-native';

// interface Calzado {
//   _id: string;
//   nombre: string;
//   codigoBarras: string;
//   proveedores: string;
//   inversionistas: number;
//   cantidad: number;
//   precioCompra: number;
//   precioVenta: number;
//   estado: string;
//   fechaCreate: string;
//   fechaUpdate: string;
// }

// const Page = () => {
//     const [calzadoData, setCalzadoData] = useState<Calzado[]>([]);
//     const [filteredData, setFilteredData] = useState<Calzado[]>([]);
//     const [searchQuery, setSearchQuery] = useState("");
//     const [currentPage, setCurrentPage] = useState(1);
//     const [modalVisible, setModalVisible] = useState(false);
//     const [selectedCalzado, setSelectedCalzado] = useState<Calzado | null>(null);
//     const [editFormData, setEditFormData] = useState<Partial<Calzado>>({});
//     const [deleteModalVisible, setDeleteModalVisible] = useState(false);
//     const [calzadoToDelete, setCalzadoToDelete] = useState<Calzado | null>(null);

//     const itemsPerPage = 4;
//     const router = useRouter();
//   // const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

//   useEffect(() => {
//       const fetchCalzadoData = async () => {
//           try {
//               const response = await axios.get('http://192.168.34.53:8000/zapateria/calzado/all/');
//               setCalzadoData(response.data);
//               setFilteredData(response.data);
//           } catch (error: any) {
//               console.error('Error fetching data:', error.response ? error.response.data : error.message);
//           }
//       };

//       fetchCalzadoData();
//   }, []);

//   const handleSearch = (query: string) => {
//       setSearchQuery(query);
//       const filtered = calzadoData.filter(item =>
//           item.nombre.toLowerCase().includes(query.toLowerCase())
//       );
//       setFilteredData(filtered);
//       setCurrentPage(1);
//   };

//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);

//   const currentData = filteredData.slice(
//       (currentPage - 1) * itemsPerPage,
//       currentPage * itemsPerPage
//   );

//   const handleNextPage = () => {
//       if (currentPage < totalPages) {
//           setCurrentPage((prevPage) => prevPage + 1);
//       }
//   };

//   const handlePreviousPage = () => {
//       if (currentPage > 1) {
//           setCurrentPage((prevPage) => prevPage - 1);
//       }
//   };

//   const handleDeleteSearch = () => {
//       setSearchQuery(""); // Esto borra el contenido del input
//       setFilteredData(calzadoData); // Restaurar los datos originales al borrar la búsqueda
//       setCurrentPage(1); // Reiniciar la página al borrar la búsqueda
//   };

//   const handleSaveChanges = async () => {
//     if (!selectedCalzado?._id) return;

//     try {
//       await axios.put(`http://192.168.34.53:8000/zapateria/calzado/update/${selectedCalzado._id}/`, editFormData);

//       // Actualizar la lista local
//       const updatedData = calzadoData.map(item => 
//         item._id === selectedCalzado._id ? { ...item, ...editFormData } : item
//       );
//       setCalzadoData(updatedData);
//       setFilteredData(updatedData);

//       setModalVisible(false);
//       // Opcional: Mostrar mensaje de éxito
//     } catch (error: any) {
//       console.error('Error updating calzado:', error.response ? error.response.data : error.message);
//       // Opcional: Mostrar mensaje de error
//     }
//   };


//   const handleDeleteCalzado = (item: Calzado) => {
//     setCalzadoToDelete(item);
//     setDeleteModalVisible(true);
//   };

//   const confirmDelete = async () => {
//     if (!calzadoToDelete?._id) return;

//     try {
//       await axios.delete(`http://192.168.34.53:8000/zapateria/calzado/delete/${calzadoToDelete._id}/`);

//       // Actualizar la lista local removiendo el item eliminado
//       const updatedData = calzadoData.filter(item => item._id !== calzadoToDelete._id);
//       setCalzadoData(updatedData);
//       setFilteredData(updatedData);

//       setDeleteModalVisible(false);
//       setCalzadoToDelete(null);

//       // Opcional: Podrías agregar una notificación de éxito aquí
//     } catch (error: any) {
//       console.error('Error deleting calzado:', error.response ? error.response.data : error.message);
//       // Opcional: Podrías mostrar un mensaje de error aquí
//     }
//   };

//   const handleIconPress = () => {
//       console.log("Otra pagina siuuu");
//   };

//   return (
//       <SafeAreaView style={tw`flex-1 px-4 pt-5 rounded-lg overflow-hidden`}>

// <Sheet
//         modal
//         open={modalVisible}
//         onOpenChange={setModalVisible}
//         snapPoints={[85]}
//         position={0}
//         dismissOnSnapToBottom
//       >
//         <Sheet.Overlay />
//         <Sheet.Frame>
//           <Sheet.ScrollView>
//             <View style={tw`bg-white rounded-2xl p-5 w-4/5`}>
//               <Text style={tw`text-2xl font-bold text-black mb-5 text-center`}>Editar Calzado</Text>
//               <Text>Nombre</Text>
//               <Input
//                 size="$4"
//                 style={tw`h-10 border border-gray-500 text-black rounded-lg px-2.5 mb-2.5 bg-white`}
//                 placeholder="Nombre"
//                 value={editFormData.nombre?.toString()}
//                 onChangeText={(text) => setEditFormData(prev => ({ ...prev, nombre: text }))}
//                 />

//             <Text>Código de Barras</Text>
//               <Input
//                 size="$4"
//                 style={tw`h-10 border border-gray-500 text-black rounded-lg px-2.5 mb-2.5 bg-white`}
//                 placeholder="Código de Barras"
//                 value={editFormData.codigoBarras?.toString()}
//                 onChangeText={(text) => setEditFormData(prev => ({ ...prev, codigoBarras: text }))}
//                 />

//             <Text>Proveedor</Text>
//               <Input
//                 size="$4"
//                 style={tw`h-10 border border-gray-500 text-black rounded-lg px-2.5 mb-2.5 bg-white`}
//                 placeholder="Proveedores"
//                 value={editFormData.proveedores?.toString()}
//                 onChangeText={(text) => setEditFormData(prev => ({ ...prev, proveedores: text }))}
//                 />

//             <Text>Inversionista</Text>
//               <Input
//                 size="$4"
//                 style={tw`h-10 border border-gray-500 text-black rounded-lg px-2.5 mb-2.5 bg-white`}
//                 placeholder="Inversionistas"
//                 value={editFormData.inversionistas?.toString()}
//                 onChangeText={(text) => setEditFormData(prev => ({ ...prev, inversionistas: Number(text) }))}
//                 keyboardType="numeric"
//               />
//               <Text>Cantidad</Text>
//               <Input
//                 size="$4"
//                 style={tw`h-10 border border-gray-500 text-black rounded-lg px-2.5 mb-2.5 bg-white`}
//                 placeholder="Cantidad"
//                 value={editFormData.cantidad?.toString()}
//                 onChangeText={(text) => setEditFormData(prev => ({ ...prev, cantidad: Number(text) }))}
//                 keyboardType="numeric"
//               />
//               <Text>Precio de Compra</Text>
//               <Input
//                 size="$4"
//                 style={tw`h-10 border border-gray-500 text-black rounded-lg px-2.5 mb-2.5 bg-white`}
//                 placeholder="Precio de Compra"
//                 value={editFormData.precioCompra?.toString()}
//                 onChangeText={(text) => setEditFormData(prev => ({ ...prev, precioCompra: Number(text) }))}
//                 keyboardType="numeric"
//               />
//               <Text>Precio de Venta</Text>
//               <Input
//                 size="$4"
//                 style={tw`h-10 border border-gray-500 text-black rounded-lg px-2.5 mb-2.5 bg-white`}
//                 placeholder="Precio de Venta"
//                 value={editFormData.precioVenta?.toString()}
//                 onChangeText={(text) => setEditFormData(prev => ({ ...prev, precioVenta: Number(text) }))}
//                 keyboardType="numeric"
//               />
//               <Text>Estado</Text>
//               <Input
//                 size="$4"
//                 style={tw`h-10 border border-gray-500 text-black rounded-lg px-2.5 mb-2.5 bg-white`}
//                 placeholder="Estado"
//                 value={editFormData.estado?.toString()}
//                 onChangeText={(text) => setEditFormData(prev => ({ ...prev, estado: text }))}
//               />

//               <View style={tw`flex-row justify-between mt-5`}>
//                 <Button
//                   variant="outlined"
//                   style={[tw`p-2.5 rounded-lg w-[45%] justify-center items-center`, tw`bg-red-500 h-[50px]`]}
//                   onPress={() => setModalVisible(false)}
//                 >
//                   Cancelar
//                 </Button>

//                 <Button
//                   variant="outlined"
//                   style={[tw`p-2.5 rounded-lg w-[45%] justify-center items-center`, tw`bg-blue-500 h-[50px]`]}
//                   onPress={handleSaveChanges}
//                 >
//                   Guardar
//                 </Button>
//               </View>
//             </View>
//           </Sheet.ScrollView>
//         </Sheet.Frame>
//       </Sheet>
//       <Sheet
//         modal
//         open={deleteModalVisible}
//         onOpenChange={setDeleteModalVisible}
//         snapPoints={[40]}
//         position={0}
//         dismissOnSnapToBottom
//       >
//         <Sheet.Overlay />
//         <Sheet.Frame padding="$4" justifyContent="center" alignItems="center">
//           <View style={tw`w-full items-center py-5`}>
//             <AlertTriangle color="red" size={50} style={tw`mb-4`} />

//             <Text style={tw`text-2xl font-bold text-white mb-2.5 text-center`}>¿Eliminar Calzado?</Text>

//             <Text style={tw`text-base text-gray-500 text-center mb-5 px-5`}>
//               ¿Estás seguro que deseas eliminar "{calzadoToDelete?.nombre}"? 
//               Esta acción no se puede deshacer.
//             </Text>

//             <View style={tw`flex-row justify-between w-full px-5 gap-4`}>
//               <Button
//                 size="$4"
//                 variant="outlined"
//                 style={tw`flex-1 bg-gray-500 h-[45px] border-0`}
//                 onPress={() => setDeleteModalVisible(false)}
//               >
//                 <Text style={tw`text-white text-base font-bold text-center`}>Cancelar</Text>
//               </Button>

//               <Button
//                 size="$4"
//                 variant="outlined"
//                 style={tw`flex-1 bg-red-500 h-[45px] border-0`}
//                 onPress={confirmDelete}
//               >
//                 <Text style={tw`text-white text-base font-bold text-center`}>Eliminar</Text>
//               </Button>
//             </View>
//           </View>
//         </Sheet.Frame>
//       </Sheet>
//           <Text style={tw`text-2xl font-bold text-black mb-2.5`}>Lista de Calzados</Text>



//           <View style={tw`flex-row items-center mb-5`}>
//               <Input
//                   style={tw`flex-1 h-10 border border-black rounded-lg px-2 text-black bg-white mr-2.5`}
//                   placeholder="Buscar por nombre"
//                   value={searchQuery}
//                   onChangeText={handleSearch}
//               />
//               {searchQuery.length > 0 && ( // Mostrar el botón solo si hay texto en el input
//                   <TouchableOpacity>
//                       <Button icon={<X/>} variant="outlined" size="$3" style={tw`text-white text-xl bg-red-500 mr-1.5`} onPress={handleDeleteSearch}/>
//                   </TouchableOpacity>
//               )}

//               <TouchableOpacity onPress={handleIconPress}>
//                   <Button icon={<Plus/>} variant="outlined" size="$3" style={tw`text-white text-xl bg-black`} />
//               </TouchableOpacity>
//           </View>


//           <View style={tw`flex-row justify-between items-center mt-5`}>
//               <TouchableOpacity
//                   style={tw`p-2.5 bg-black rounded`}
//                   onPress={handlePreviousPage}
//                   disabled={currentPage === 1}
//               >
//                   <Text style={tw`text-white font-bold`}>Anterior</Text>
//               </TouchableOpacity>
//               <Text style={tw`text-black text-base`}>
//                   Página {currentPage} de {totalPages}
//               </Text>
//               <TouchableOpacity
//                   style={tw`p-2.5 bg-black rounded`}
//                   onPress={handleNextPage}
//                   disabled={currentPage === totalPages}
//               >
//                   <Text style={tw`text-white font-bold`}>Siguiente</Text>
//               </TouchableOpacity>
//           </View>
//       </SafeAreaView>
//   );
// }

// export default Page


import React from 'react'
import CardCalzado from '~/components/calzado/card'
import { CartProvider } from '~/components/cart/CartIcon'

const Page = () => {
  return (
    <CartProvider>
      <CardCalzado />
    </CartProvider>
  )
}

export default Page