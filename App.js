import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import StartScreen from './src/StartScreen'; 
import PdfRead from './src/PdfRead'; 

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="StartScreen">
          <Stack.Screen 
            name="StartScreen" 
            component={StartScreen} 
            options={{ title: 'Welcome' }} 
          />
          <Stack.Screen 
            name="PdfRead" 
            component={PdfRead} 
            options={{ title: 'PDF Viewer' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
