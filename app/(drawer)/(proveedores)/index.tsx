import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Button, Input, Sheet } from 'tamagui';
import tw from 'twrnc';
import { AlertTriangle, Pencil, Plus, Trash2, X } from 'lucide-react-native';
import axios from 'axios';

interface Proveedor {
  _id: string;
  nombre: string;
  telefono: string;
  direccion: string;
  fechaCreate: string;
  fechaUpdate: string;
  tipo: string;
}

const Page = () => {
  const [proveedorData, setProveedorData] = useState<Proveedor[]>([]);
  const [filteredData, setFilteredData] = useState<Proveedor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Proveedor>>({});
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [proveedorToDelete, setProveedorToDelete] = useState<Proveedor | null>(null);
  const [createFormData, setCreateFormData] = useState<Partial<Proveedor>>({
    nombre: '',
    telefono: '',
    direccion: '',
    tipo: ''
  });

  const itemsPerPage = 4;


  useEffect(() => {
    const fetchCalzadoData = async () => {
      try {
        const response = await axios.get('http://192.168.34.53:8000/zapateria/proveedor/all/');
        setProveedorData(response.data);
        setFilteredData(response.data);
      } catch (error: any) {
        console.error('Error fetching data:', error.response ? error.response.data : error.message);
      }
    };

    fetchCalzadoData();
  }, []);

  const handleUpdateProveedor = (item: Proveedor) => {
    setSelectedProveedor(item);
    setEditFormData({
      nombre: item.nombre,
      telefono: item.telefono,
      direccion: item.direccion,
      tipo: item.tipo
    });
    setEditModalVisible(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedProveedor?._id) return;

    try {
      const response = await axios.put(
        `http://192.168.34.53:8000/zapateria/proveedor/update/${selectedProveedor._id}/`,
        editFormData
      );

      // Actualizar la lista local
      const updatedData = proveedorData.map(item =>
        item._id === selectedProveedor._id ? { ...item, ...editFormData } : item
      );
      setProveedorData(updatedData);
      setFilteredData(updatedData);

      setEditModalVisible(false);
    } catch (error: any) {
      console.error('Error updating proveedor:', error.response ? error.response.data : error.message);
    }
  };

  const handleDeleteProveedor = (item: Proveedor) => {
    setProveedorToDelete(item);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!proveedorToDelete?._id) return;

    try {
      await axios.delete(`http://192.168.34.53:8000/zapateria/proveedor/delete/${proveedorToDelete._id}/`);

      const updatedData = proveedorData.filter(item => item._id !== proveedorToDelete._id);
      setProveedorData(updatedData);
      setFilteredData(updatedData);

      setDeleteModalVisible(false);
      setProveedorToDelete(null);
    } catch (error: any) {
      console.error('Error deleting proveedor:', error.response ? error.response.data : error.message);
    }
  };

  const handleCreateProveedor = async () => {
    // Validar que todos los campos requeridos estén llenos
    if (!createFormData.nombre || !createFormData.telefono || !createFormData.direccion || !createFormData.tipo) {
      console.error('Todos los campos son requeridos');
      return;
    }

    try {
      const response = await axios.post(
        'http://192.168.34.53:8000/zapateria/proveedor/add/',
        createFormData
      );

      // Verificar que la respuesta tenga datos válidos
      if (response.data) {
        const refreshResponse = await axios.get('http://192.168.34.53:8000/zapateria/proveedor/all/');
        setProveedorData(refreshResponse.data);
        setFilteredData(refreshResponse.data);

        // Limpiar el formulario y cerrar el modal
        setCreateFormData({
          nombre: '',
          telefono: '',
          direccion: '',
          tipo: ''
        });
        setCreateModalVisible(false);
      } else {
        console.error('La respuesta del servidor no incluye un ID válido');
      }
    } catch (error: any) {
      console.error('Error creating proveedor:', error.response ? error.response.data : error.message);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = proveedorData.filter(item =>
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
    setFilteredData(proveedorData); // Restaurar los datos originales al borrar la búsqueda
    setCurrentPage(1); // Reiniciar la página al borrar la búsqueda
  };

  const handleCreatePress = () => {
    setCreateModalVisible(true);
  };

  return (
    <SafeAreaView style={tw`flex-1 mt-8 px-4 pt-5 rounded-lg overflow-hidden`}>
      <Sheet
        modal
        open={editModalVisible}
        onOpenChange={setEditModalVisible}
        snapPoints={[60]}
        position={0}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$4">
          <View style={tw`p-5`}>
            <Text style={tw`text-2xl font-bold text-white mb-5 text-center`}>Editar Proveedor</Text>
            <Text style={tw`text-white`}>Nombre</Text>
            <Input
              size="$4"
              style={tw`mb-2.5 text-black bg-white`}
              placeholder="Nombre"
              value={editFormData.nombre}
              onChangeText={(text) => setEditFormData(prev => ({ ...prev, nombre: text }))}
            />

            <Text style={tw`text-white`}>Teléfono</Text>
            <Input
              size="$4"
              style={tw`mb-2.5 text-black bg-white`}
              placeholder="Teléfono"
              value={editFormData.telefono}
              onChangeText={(text) => setEditFormData(prev => ({ ...prev, telefono: text }))}
              keyboardType="phone-pad"
            />

            <Text style={tw`text-white`}>Dirección</Text>
            <Input
              size="$4"
              style={tw`mb-2.5 text-black bg-white`}
              placeholder="Dirección"
              value={editFormData.direccion}
              onChangeText={(text) => setEditFormData(prev => ({ ...prev, direccion: text }))}
            />

            <Text style={tw`text-white`}>Tipo</Text>
            <Input
              size="$4"
              style={tw`mb-2.5 text-black bg-white`}
              placeholder="Tipo"
              value={editFormData.tipo}
              onChangeText={(text) => setEditFormData(prev => ({ ...prev, tipo: text }))}
            />

            <View style={tw`flex-row justify-between mt-5 px-2.5 gap-4`}>
              <Button
                size="$4"
                variant="outlined"
                style={tw` flex-1 bg-red-500 h-[45px] border-0`}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={tw` text-white text-base font-bold text-center`}>Cancelar</Text>
              </Button>

              <Button
                size="$4"
                variant="outlined"
                style={tw` flex-1 bg-blue-500 h-[45px] border-0`}
                onPress={handleSaveChanges}
              >
                <Text style={tw` text-white text-base font-bold text-center`}>Guardar</Text>
              </Button>
            </View>
          </View>
        </Sheet.Frame>
      </Sheet>
      <Sheet
        modal
        open={deleteModalVisible}
        onOpenChange={setDeleteModalVisible}
        snapPoints={[30]}
        position={0}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$4">
          <View style={tw`p-5 items-center h-[120px]`}>
            <View style={tw`mb-4`}>
              <AlertTriangle color="red" size={50} />
            </View>

            <Text style={tw`text-2xl font-bold text-white mb-4 text-center`}>Confirmar Eliminación</Text>

            <Text style={tw`text-xs text-gray-500 text-center mb-5 px-2.5`}>
              ¿Estás seguro que deseas eliminar al proveedor "{proveedorToDelete?.nombre}"?
              Esta acción no se puede deshacer.
            </Text>

            <View style={tw`flex-row justify-between w-full px-2.5 gap-4`}>
              <Button
                size="$4"
                variant="outlined"
                style={tw` flex-1 bg-red-500 h-[45px] border-0`}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={tw` text-white text-base font-bold text-center`}>Cancelar</Text>
              </Button>

              <Button
                size="$4"
                variant="outlined"
                style={tw`flex-1 bg-red-500 h-[45px] border-0`}
                onPress={confirmDelete}
              >
                <Text style={tw` text-white text-base font-bold text-center`}>Eliminar</Text>
              </Button>
            </View>
          </View>
        </Sheet.Frame>
      </Sheet>
      <Sheet
        modal
        open={createModalVisible}
        onOpenChange={setCreateModalVisible}
        snapPoints={[60]}
        position={0}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$4">
          <View style={tw`p-5`}>
            <Text style={tw`text-2xl font-bold text-white mb-5 text-center`}>Agregar Nuevo Proveedor</Text>

            <Text style={tw`text-white`}>Nombre</Text>
            <Input
              size="$4"
              style={tw`mb-2.5 text-black bg-white`}
              placeholder="Nombre"
              value={createFormData.nombre}
              onChangeText={(text) => setCreateFormData(prev => ({ ...prev, nombre: text }))}
            />

            <Text style={tw`text-white`}>Teléfono</Text>
            <Input
              size="$4"
              style={tw`mb-2.5 text-black bg-white`}
              placeholder="Teléfono"
              value={createFormData.telefono}
              onChangeText={(text) => setCreateFormData(prev => ({ ...prev, telefono: text }))}
              keyboardType="phone-pad"
            />

            <Text style={tw`text-white`}>Dirección</Text>
            <Input
              size="$4"
              style={tw`mb-2.5 text-black bg-white`}
              placeholder="Dirección"
              value={createFormData.direccion}
              onChangeText={(text) => setCreateFormData(prev => ({ ...prev, direccion: text }))}
            />

            <Text style={tw`text-white`}>Estado</Text>
            <Input
              size="$4"
              style={tw`mb-2.5 text-black bg-white`}
              placeholder="Estado"
              value={createFormData.tipo}
              onChangeText={(text) => setCreateFormData(prev => ({ ...prev, tipo: text }))}
            />

            <View style={tw`flex-row justify-between mt-5 px-2.5 gap-4`}>
              <Button
                size="$4"
                variant="outlined"
                style={tw` flex-1 bg-red-500 h-[45px] border-0`}
                onPress={() => {
                  setCreateModalVisible(false);
                  setCreateFormData({
                    nombre: '',
                    telefono: '',
                    direccion: '',
                    tipo: ''
                  });
                }}
              >
                <Text style={tw` text-white text-base font-bold text-center`}>Cancelar</Text>
              </Button>

              <Button
                size="$4"
                variant="outlined"
                style={tw` flex-1 bg-blue-500 h-[45px] border-0`}
                onPress={handleCreateProveedor}
              >
                <Text style={tw` text-white text-base font-bold text-center`}>Crear</Text>
              </Button>
            </View>
          </View>
        </Sheet.Frame>
      </Sheet>

      <Text style={tw`text-2xl font-bold text-black mb-2.5`}>Lista de Proveedores</Text>

      <View style={tw`flex-row items-center mb-5`}>
        <Input
          style={tw`flex-1 h-10 border border-black rounded-lg px-2 text-black bg-white mr-2.5`}
          placeholder="Buscar por nombre"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <Button
            icon={<X color="white" />}
            variant="outlined"
            size="$3"
            style={tw`text-white text-xl bg-red-500 mr-1.5`}
            onPress={handleDeleteSearch}
          />
        )}

        <Button
          icon={<Plus color="white" />}
          variant="outlined"
          size="$3"
          style={tw`text-white text-xl bg-black`}
          onPress={handleCreatePress}
        />
      </View>

      <ScrollView contentContainerStyle={tw`pb-5`}>
        {currentData.length === 0 ? (
          <Text style={tw`text-black text-center mt-5 text-lg`}>Sin datos para mostrar</Text>
        ) : (
          currentData.map((item) => (
            <View key={item._id} style={tw`mt-5 border-2 border-black rounded-lg p-4 shadow-lg`}>
              <View style={tw`flex-row items-center justify-between`}>
                <Text style={tw`text-lg font-bold text-black mb-2`}>{item.nombre}</Text>
                <View style={tw`flex-row items-center`}>
                  <TouchableOpacity>
                    <Button icon={<Pencil/>} variant="outlined" size="$3" style={tw`text-white text-xl bg-blue-500 mr-1.5`} onPress={() => handleUpdateProveedor(item)} />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Button icon={<Trash2/>} variant="outlined" size="$3" style={tw`text-white text-xl bg-red-500 mr-1.5`} onPress={() => handleDeleteProveedor(item)} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={tw`text-black mb-4`}>Teléfono: {item.telefono}</Text>
              <Text style={tw`text-black mb-4`}>Dirección: {item.direccion}</Text>
              <Text style={tw`text-black mb-4`}>Fecha de Creación: {new Date(item.fechaCreate).toLocaleDateString()}</Text>
              <Text style={tw`text-black mb-4`}>Fecha de Actualización: {new Date(item.fechaUpdate).toLocaleDateString()}</Text>
              <Text style={tw`text-black mb-4`}>Estado: {item.tipo}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={tw`flex-row justify-between items-center mt-5`}>
        <TouchableOpacity
          style={tw`p-2.5 bg-black rounded-md`}
          onPress={handlePreviousPage}
          disabled={currentPage === 1}
        >
          <Text style={tw`text-white font-bold`}>Anterior</Text>
        </TouchableOpacity>
        <Text style={tw`text-black text-base`}>
          Página {currentPage} de {totalPages}
        </Text>
        <TouchableOpacity
          style={tw`p-2.5 bg-black rounded-md`}
          onPress={handleNextPage}
          disabled={currentPage === totalPages}
        >
          <Text style={tw`text-white font-bold`}>Siguiente</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default Page
