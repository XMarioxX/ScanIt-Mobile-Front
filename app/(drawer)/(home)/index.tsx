import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Button, Input, Dialog, Sheet } from 'tamagui';
import { useNavigation, useRouter } from 'expo-router';
import axios from 'axios';
import { AlertTriangle, Pencil, Plus, Trash2, X } from 'lucide-react-native';

interface Calzado {
  _id: string;
  nombre: string;
  codigoBarras: string;
  proveedores: string;
  inversionistas: number;
  cantidad: number;
  precioCompra: number;
  precioVenta: number;
  estado: string;
  fechaCreate: string;
  fechaUpdate: string;
}

const Page = () => {
    const [calzadoData, setCalzadoData] = useState<Calzado[]>([]);
    const [filteredData, setFilteredData] = useState<Calzado[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCalzado, setSelectedCalzado] = useState<Calzado | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<Calzado>>({});
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [calzadoToDelete, setCalzadoToDelete] = useState<Calzado | null>(null);
    
    const itemsPerPage = 4;
    const router = useRouter();
  // const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
      const fetchCalzadoData = async () => {
          try {
              const response = await axios.get('http://192.168.0.117:8000/zapateria/calzado/all/');
              setCalzadoData(response.data);
              setFilteredData(response.data);
          } catch (error: any) {
              console.error('Error fetching data:', error.response ? error.response.data : error.message);
          }
      };

      fetchCalzadoData();
  }, []);

  const handleSearch = (query: string) => {
      setSearchQuery(query);
      const filtered = calzadoData.filter(item =>
          item.nombre.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(filtered);
      setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const currentData = filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const handleNextPage = () => {
      if (currentPage < totalPages) {
          setCurrentPage((prevPage) => prevPage + 1);
      }
  };

  const handlePreviousPage = () => {
      if (currentPage > 1) {
          setCurrentPage((prevPage) => prevPage - 1);
      }
  };

  const handleDeleteSearch = () => {
      setSearchQuery(""); // Esto borra el contenido del input
      setFilteredData(calzadoData); // Restaurar los datos originales al borrar la búsqueda
      setCurrentPage(1); // Reiniciar la página al borrar la búsqueda
  };

  const handleUpdateCalzado = (item: Calzado) => {
    
    setSelectedCalzado(item);
    setEditFormData({
      nombre: item.nombre,
      codigoBarras: item.codigoBarras,
      proveedores: item.proveedores,
      inversionistas: item.inversionistas,
      cantidad: item.cantidad,
      precioCompra: item.precioCompra,
      precioVenta: item.precioVenta,
      estado: item.estado,
    });
    setModalVisible(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedCalzado?._id) return;

    try {
      await axios.put(`http://192.168.0.117:8000/zapateria/calzado/update/${selectedCalzado._id}/`, editFormData);
      
      // Actualizar la lista local
      const updatedData = calzadoData.map(item => 
        item._id === selectedCalzado._id ? { ...item, ...editFormData } : item
      );
      setCalzadoData(updatedData);
      setFilteredData(updatedData);
      
      setModalVisible(false);
      // Opcional: Mostrar mensaje de éxito
    } catch (error: any) {
      console.error('Error updating calzado:', error.response ? error.response.data : error.message);
      // Opcional: Mostrar mensaje de error
    }
  };


  const handleDeleteCalzado = (item: Calzado) => {
    setCalzadoToDelete(item);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!calzadoToDelete?._id) return;

    try {
      await axios.delete(`http://192.168.0.117:8000/zapateria/calzado/delete/${calzadoToDelete._id}/`);
      
      // Actualizar la lista local removiendo el item eliminado
      const updatedData = calzadoData.filter(item => item._id !== calzadoToDelete._id);
      setCalzadoData(updatedData);
      setFilteredData(updatedData);
      
      setDeleteModalVisible(false);
      setCalzadoToDelete(null);
      
      // Opcional: Podrías agregar una notificación de éxito aquí
    } catch (error: any) {
      console.error('Error deleting calzado:', error.response ? error.response.data : error.message);
      // Opcional: Podrías mostrar un mensaje de error aquí
    }
  };

  const handleIconPress = () => {
      console.log("Otra pagina siuuu");
  };

  return (
      <SafeAreaView style={styles.container}>

<Sheet
        modal
        open={modalVisible}
        onOpenChange={setModalVisible}
        snapPoints={[85]}
        position={0}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame>
          <Sheet.ScrollView>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Calzado</Text>
              <Text>Nombre</Text>
              <Input
                size="$4"
                style={styles.input}
                placeholder="Nombre"
                value={editFormData.nombre?.toString()}
                onChangeText={(text) => setEditFormData(prev => ({ ...prev, nombre: text }))}
                />
              
            <Text>Código de Barras</Text>
              <Input
                size="$4"
                style={styles.input}
                placeholder="Código de Barras"
                value={editFormData.codigoBarras?.toString()}
                onChangeText={(text) => setEditFormData(prev => ({ ...prev, codigoBarras: text }))}
                />
              
            <Text>Proveedor</Text>
              <Input
                size="$4"
                style={styles.input}
                placeholder="Proveedores"
                value={editFormData.proveedores?.toString()}
                onChangeText={(text) => setEditFormData(prev => ({ ...prev, proveedores: text }))}
                />
              
            <Text>Inversionista</Text>
              <Input
                size="$4"
                style={styles.input}
                placeholder="Inversionistas"
                value={editFormData.inversionistas?.toString()}
                onChangeText={(text) => setEditFormData(prev => ({ ...prev, inversionistas: Number(text) }))}
                keyboardType="numeric"
              />
              <Text>Cantidad</Text>
              <Input
                size="$4"
                style={styles.input}
                placeholder="Cantidad"
                value={editFormData.cantidad?.toString()}
                onChangeText={(text) => setEditFormData(prev => ({ ...prev, cantidad: Number(text) }))}
                keyboardType="numeric"
              />
              <Text>Precio de Compra</Text>
              <Input
                size="$4"
                style={styles.input}
                placeholder="Precio de Compra"
                value={editFormData.precioCompra?.toString()}
                onChangeText={(text) => setEditFormData(prev => ({ ...prev, precioCompra: Number(text) }))}
                keyboardType="numeric"
              />
              <Text>Precio de Venta</Text>
              <Input
                size="$4"
                style={styles.input}
                placeholder="Precio de Venta"
                value={editFormData.precioVenta?.toString()}
                onChangeText={(text) => setEditFormData(prev => ({ ...prev, precioVenta: Number(text) }))}
                keyboardType="numeric"
              />
              <Text>Estado</Text>
              <Input
                size="$4"
                style={styles.input}
                placeholder="Estado"
                value={editFormData.estado?.toString()}
                onChangeText={(text) => setEditFormData(prev => ({ ...prev, estado: text }))}
              />
              
              <View style={styles.modalButtons}>
                <Button
                  variant="outlined"
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  Cancelar
                </Button>
                
                <Button
                  variant="outlined"
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveChanges}
                >
                  Guardar
                </Button>
              </View>
            </View>
          </Sheet.ScrollView>
        </Sheet.Frame>
      </Sheet>
      <Sheet
        modal
        open={deleteModalVisible}
        onOpenChange={setDeleteModalVisible}
        snapPoints={[40]}
        position={0}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$4" justifyContent="center" alignItems="center">
          <View style={styles.deleteModalContent}>
            <AlertTriangle color="red" size={50} style={styles.warningIcon} />
            
            <Text style={styles.deleteTitle}>¿Eliminar Calzado?</Text>
            
            <Text style={styles.deleteMessage}>
              ¿Estás seguro que deseas eliminar "{calzadoToDelete?.nombre}"? 
              Esta acción no se puede deshacer.
            </Text>

            <View style={styles.deleteButtons}>
              <Button
                size="$4"
                variant="outlined"
                style={styles.cancelDeleteButton}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Button>

              <Button
                size="$4"
                variant="outlined"
                style={styles.confirmDeleteButton}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </Button>
            </View>
          </View>
        </Sheet.Frame>
      </Sheet>
          <Text style={styles.headerText}>Lista de Calzados</Text>


          <View style={styles.searchContainer}>
              <Input
                  style={styles.searchInput}
                  placeholder="Buscar por nombre"
                  value={searchQuery}
                  onChangeText={handleSearch}
              />
              {searchQuery.length > 0 && ( // Mostrar el botón solo si hay texto en el input
                  <TouchableOpacity>
                      <Button icon={X} variant="outlined" size="$3" style={styles.btnTextDelete} onPress={handleDeleteSearch}/>
                  </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleIconPress}>
                  <Button icon={Plus} variant="outlined" size="$3" style={styles.btnText} />
              </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollViewContent}>
              {currentData.length === 0 ? (
                  <Text style={styles.noDataText}>Sin datos para mostrar</Text>
              ) : (
                  currentData.map((item) => (
                      <View key={item._id} style={styles.card}>
                          <View style={styles.cardRow}>
                              <Text style={styles.cardTitle}>{item.nombre}</Text>
                              <View style={styles.buttonGroup}>
                                  <TouchableOpacity>
                                      <Button icon={Pencil} variant="outlined" size="$3" style={styles.btnTextUpdate} onPress={()=>handleUpdateCalzado(item)}/>
                                  </TouchableOpacity>
                                  <TouchableOpacity>
                                      <Button icon={Trash2} variant="outlined" size="$3" style={styles.btnTextDelete} onPress={() => handleDeleteCalzado(item)}/>
                                  </TouchableOpacity>
                              </View>
                          </View>
                          <Text style={styles.cardText}>Código de Barras: {item.codigoBarras}</Text>
                          <Text style={styles.cardText}>Proveedor: {item.proveedores}</Text>
                          <Text style={styles.cardText}>Inversionistas: ${item.inversionistas}</Text>
                          <Text style={styles.cardText}>Cantidad: {item.cantidad}</Text>
                          <Text style={styles.cardText}>Precio de Compra: ${item.precioCompra}</Text>
                          <Text style={styles.cardText}>Precio de Venta: ${item.precioVenta}</Text>
                          <Text style={styles.cardText}>Estado: {item.estado}</Text>
                          <Text style={styles.cardText}>Fecha de Creación: {new Date(item.fechaCreate).toLocaleDateString()}</Text>
                          <Text style={styles.cardText}>Fecha de Actualización: {new Date(item.fechaUpdate).toLocaleDateString()}</Text>
                      </View>
                  ))
              )}
          </ScrollView>

          <View style={styles.pagination}>
              <TouchableOpacity
                  style={styles.pageButton}
                  onPress={handlePreviousPage}
                  disabled={currentPage === 1}
              >
                  <Text style={styles.pageButtonText}>Anterior</Text>
              </TouchableOpacity>
              <Text style={styles.pageText}>
                  Página {currentPage} de {totalPages}
              </Text>
              <TouchableOpacity
                  style={styles.pageButton}
                  onPress={handleNextPage}
                  disabled={currentPage === totalPages}
              >
                  <Text style={styles.pageButtonText}>Siguiente</Text>
              </TouchableOpacity>
          </View>
      </SafeAreaView>
  );
}

export default Page

const styles = StyleSheet.create({
  container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 20,
      borderRadius: 10,
      overflow: 'hidden',
  },
  clearButtonText: {
      color: 'black',
      fontWeight: 'bold',
  },
  scrollViewContent: {
      paddingBottom: 20,
  },
  headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'black',
      marginBottom: 10,
  },
  searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
  },
  searchInput: {
      flex: 1,
      height: 40,
      borderColor: 'black',
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 8,
      color: 'black',
      backgroundColor: 'white',
      marginRight: 10,
  },
  card: {
      marginTop: 20,
      borderWidth: 2,
      borderColor: 'black',
      borderRadius: 10,
      padding: 16,
      shadowColor: '#fff',
      shadowOffset: {
          width: 0,
          height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
  },
  cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'black',
      marginBottom: 8,
  },
  cardText: {
      color: 'black',
      marginBottom: 4,
  },
  noDataText: {
      color: 'black',
      textAlign: 'center',
      marginTop: 20,
      fontSize: 18,
  },
  pagination: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 20,
  },
  pageButton: {
      padding: 10,
      backgroundColor: 'black',
      borderRadius: 5,
  },
  pageButtonText: {
      color: 'white',
      fontWeight: 'bold',
  },
  pageText: {
      color: 'black',
      fontSize: 16,
  },
  btnText: {
      color: 'white',
      fontSize: 20,
      backgroundColor: 'black',
  },
  btnTextDelete: {
      color: 'white',
      fontSize: 20,
      backgroundColor: 'red',
      marginRight: 6,
  },
  btnTextUpdate: {
      color: 'white',
      fontSize: 20,
      backgroundColor: 'blue',
      marginRight: 6,
  },
  buttonGroup: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
  },
  modalContainer: {
    flex: 1,
    marginLeft:10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    color:'black',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    padding: 10,
    borderRadius: 8,
    width: '45%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: 'blue',
    height: 50,
  },
  cancelButton: {
    backgroundColor: 'red',
    height: 50,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  deleteModalContent: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  warningIcon: {
    marginBottom: 15,
  },
  deleteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  deleteMessage: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  deleteButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    gap: 15,
  },
  cancelDeleteButton: {
    flex: 1,
    backgroundColor: 'gray',
    height: 45,
    borderWidth: 0,
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: 'red',
    height: 45,
    borderWidth: 0,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});