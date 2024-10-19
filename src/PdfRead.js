import { View, StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import Pdf from 'react-native-pdf';

const PdfRead = ({ route }) => {
  // Receive the PDF URI from the route parameters
  const { pdfUri } = route.params;

  const PdfResource = { uri: pdfUri, cache: true };
  const [numberOfPages, setNumberOfPages] = useState(0);
  const isUnmounted = useRef(false);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  const windowHeight = Dimensions.get('window').height;
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 20;
  const usableHeight = windowHeight - statusBarHeight;

  // Function to handle the PDF scroll event
  const handleScroll = (x, y) => {
    console.log(`onScroll triggered - X: ${x}, Y: ${y}`);
    setScrollPosition({ x, y });
  };

  // Function to handle PDF load completion and set the number of pages
  const onLoadComplete = (numPages) => {
    if (!isUnmounted.current) {
      setNumberOfPages(numPages);
      console.log(`PDF loaded with ${numPages} pages`);
    }
  };

  useEffect(() => {
    return () => {
      isUnmounted.current = true;
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Pdf component for rendering the PDF */}
      <Pdf
        trustAllCerts={false}
        source={PdfResource}
        style={styles.pdf} // Allow Pdf component to take up full space
        onLoadComplete={onLoadComplete}
        onError={(error) => console.log(`PDF Error: ${error}`)}
        onPageChanged={(page, numberOfPages) => console.log(`Page changed to ${page} of ${numberOfPages}`)}
        onScroll={(x, y) => handleScroll(x, y)} // Use the onScroll event to track scrolling
      />
    </View>
  );
};

export default PdfRead;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pdf: {
    flex: 1, // Allow Pdf component to take up full space
    width: Dimensions.get('window').width,
    backgroundColor: '#f0f0f0',
  },
});
