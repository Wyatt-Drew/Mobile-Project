import React, { useRef, useState } from 'react';
import { View, Animated, Dimensions, StyleSheet, Text } from 'react-native';
import Pdf from '../libraries/react-native-pdf'; // Assuming the modified library is local

const PdfRead = ({ route }) => {
  const { pdfUri } = route.params; // Assuming pdfUri is passed as a parameter
  const PdfResource = { uri: pdfUri, cache: true };

  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 }); // Track scroll position

  // Scroll event handler that listens to the scroll events and updates the state
  const handleScroll = (x, y) => {
    console.log(`onScroll triggered - X: ${x}, Y: ${y}`);
    setScrollPosition({ x, y });
  };
  
  return (
    <View style={styles.container}>
<Pdf
  source={PdfResource}
  onLoadComplete={(numberOfPages) => console.log(`PDF Loaded with ${numberOfPages} pages`)}
  onPageChanged={(page, numberOfPages) => console.log(`Page changed to ${page} of ${numberOfPages}`)}
  onError={(error) => console.log(`PDF Error: ${error}`)}
  onScroll={handleScroll}
  style={styles.pdf}
/>
      {/* Display the scroll position in the bottom-left corner */}
      <View style={styles.scrollPositionContainer}>
        <Text style={styles.scrollPositionText}>
          X: {scrollPosition.x.toFixed(2)}, Y: {scrollPosition.y.toFixed(2)}
        </Text>
      </View>
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
  scrollPositionContainer: {
    position: 'absolute', // Make sure it stays at the bottom-left
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background for visibility
    padding: 5,
    borderRadius: 5,
  },
  scrollPositionText: {
    color: 'white', // White text color for contrast
    fontSize: 14,
  },
});
