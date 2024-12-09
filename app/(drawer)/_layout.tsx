import { StyleSheet, View } from 'react-native';
import React from 'react';
import Drawer from 'expo-router/drawer';

const Layout = () => {
  return (
    <Drawer>
      <Drawer.Screen name='(calzado)/index' options={{ title: 'Calzado' }} />
      <Drawer.Screen name='(proveedores)/index' options={{ title: 'Proveedores' }} />
      {/* <Drawer.Screen name='(ventas)/index' options={{ title: 'Ventas' }} /> */}
    </Drawer>
  );
}

export default Layout;
