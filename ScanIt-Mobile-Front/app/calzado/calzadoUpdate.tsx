import React from "react";
import { SafeAreaView, StyleSheet, Text } from "react-native";
import { useRoute, RouteProp } from '@react-navigation/native';

// Define una interfaz para los parámetros de la ruta
type RouteParams = {
    item: {
        nombre: string;
        codigoBarras: string;
        // Añade más propiedades si es necesario
    };
};

export default function CalzadoUpdate() {
    // Usa useRoute y define el tipo de los parámetros
    const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();

    // Asegúrate de que item exista
    const { item } = route.params;

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.text}>Nombre: {item.nombre}</Text>
            <Text style={styles.text}>Código de Barras: {item.codigoBarras}</Text>
            {/* Muestra más detalles de "item" si es necesario */}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    text: {
        color: 'white',
    },
});
