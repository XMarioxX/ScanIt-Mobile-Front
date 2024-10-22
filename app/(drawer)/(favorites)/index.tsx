import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Button, Input } from 'tamagui';
import { Pencil, Plus, Trash2, X } from 'lucide-react-native';
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
  const itemsPerPage = 4;


  useEffect(() => {
    const fetchCalzadoData = async () => {
      try {
        const response = await axios.get('http://192.168.0.117:8000/zapateria/proveedor/all/');
        setProveedorData(response.data);
        setFilteredData(response.data);
      } catch (error: any) {
        console.error('Error fetching data:', error.response ? error.response.data : error.message);
      }
    };

    fetchCalzadoData();
  }, []);

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

  const handleIconPress = () => {
    console.log("Otra pagina siuuu");
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Lista de Proveedores</Text>

      <View style={styles.searchContainer}>
        <Input
          style={styles.searchInput}
          placeholder="Buscar por nombre"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && ( // Mostrar el botón solo si hay texto en el input
          <TouchableOpacity>
            <Button icon={X} variant="outlined" size="$3" style={styles.btnTextDelete} onPress={handleDeleteSearch} />
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
                    <Button icon={Pencil} variant="outlined" size="$3" style={styles.btnTextUpdate}/>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Button icon={Trash2} variant="outlined" size="$3" style={styles.btnTextDelete}/>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.cardText}>Teléfono: {item.telefono}</Text>
              <Text style={styles.cardText}>Dirección: {item.direccion}</Text>
              <Text style={styles.cardText}>Fecha de Creación: {new Date(item.fechaCreate).toLocaleDateString()}</Text>
              <Text style={styles.cardText}>Fecha de Actualización: {new Date(item.fechaUpdate).toLocaleDateString()}</Text>
              <Text style={styles.cardText}>Estado: {item.tipo}</Text>
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
    marginTop: 30,
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
    backgroundColor: 'black'
  },
  btnTextDelete: {
    color: 'white',
    fontSize: 20,
    backgroundColor: 'red',
    marginRight: 6,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnTextUpdate: {
    color: 'white',
    fontSize: 20,
    backgroundColor: 'blue',
    marginRight: 6,
  },
});