import { SafeAreaView, StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useEffect, useState } from "react";
import { Plus, X, Pencil,Trash2 } from '@tamagui/lucide-icons';
import { useNavigation } from '@react-navigation/native';
import { TamaguiProvider } from 'tamagui';
import { PortalProvider } from 'tamagui';
import {config} from '@tamagui/config/v3'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useRouter } from 'expo-router';
import {
    Adapt,
    Button,
    Dialog,
    Fieldset,
    Input,
    Label,
    Paragraph,
    Sheet,
    TooltipSimple,
    Unspaced,
    XStack,
} from 'tamagui'
import {DialogAddCalzado} from "@/components/modalAddCalzado";

type RootStackParamList = {
    Home: undefined;
    calzadoCreate: undefined;
    calzadoUpdate: undefined; // Añade esta línea
};



type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

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

export default function HomeScreen() {
    const [calzadoData, setCalzadoData] = useState<Calzado[]>([]);
    const [filteredData, setFilteredData] = useState<Calzado[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const router = useRouter();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
        console.log("Editar Calzado");
        navigation.navigate('calzado/calzadoUpdate',{item});
    };
    const handleDeleteCalzado = () => {
        console.log("Borrar Calzado");
    };

    const handleIconPress = () => {
        console.log("Otra pagina siuuu");
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerText}>Lista de Calzados</Text>


            <View style={styles.searchContainer}>
                <TextInput
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
                                        <Button icon={Trash2} variant="outlined" size="$3" style={styles.btnTextDelete} onPress={handleDeleteCalzado}/>
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
        color: 'white',
        fontWeight: 'bold',
    },
    scrollViewContent: {
        paddingBottom: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
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
        borderColor: 'gray',
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
        borderColor: 'white',
        borderRadius: 10,
        padding: 16,
        shadowColor: '#000',
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
        color: 'white',
        marginBottom: 8,
    },
    cardText: {
        color: 'white',
        marginBottom: 4,
    },
    noDataText: {
        color: 'white',
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
        backgroundColor: 'white',
        borderRadius: 5,
    },
    pageButtonText: {
        color: 'black',
        fontWeight: 'bold',
    },
    pageText: {
        color: 'white',
        fontSize: 16,
    },
    btnText: {
        color: 'white',
        fontSize: 20,
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
});
