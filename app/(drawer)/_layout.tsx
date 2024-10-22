import { StyleSheet, View } from 'react-native';
import React from 'react';
import Drawer from 'expo-router/drawer';

const Layout = () => {
  return (
    <Drawer>
      <Drawer.Screen name='(home)/index' options={{ title: 'Calzado' }} />
      <Drawer.Screen name='(favorites)/index' options={{ title: 'Proveedores' }} />
    </Drawer>
  );
}

export default Layout;
