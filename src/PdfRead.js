import React, { useRef, useState } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import Pdf from 'react-native-pdf';

const PdfRead = ({ route }) => {
  const { pdfUri } = route.params; // Assuming pdfUri is passed as a parameter
  const PdfResource = { uri: pdfUri, cache: true };

  const windowHeight = Dimensions.get('window').height;
  const scrollY = useRef(new Animated.Value(0)).current; // Track the scroll position
  const [totalPages, setTotalPages] = useState(0); // Track total number of pages

  // Scroll event listener that can be added to react-native-pdf library
  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    scrollY.setValue(scrollPosition);
    console.log(`Scroll position: ${scrollPosition}`);
  };

  return (
    <View style={styles.container}>
      <Pdf
        source={PdfResource}
        onLoadComplete={(numberOfPages) => setTotalPages(numberOfPages)} // Capture total pages on load
        onError={(error) => console.log('Error loading PDF:', error)}
        style={styles.pdf} // Set PDF view styles
        onScroll={handleScroll} // Custom scroll handler (modify library to add this)
      />
      {/* Add any additional scroll-related UI or tracking elements here */}
    </View>
  );
};

export default PdfRead;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pdf: {
    flex: 1, // Ensure the PDF takes the full screen space
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
