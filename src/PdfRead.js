import { View, StyleSheet, Dimensions, Animated, PanResponder, StatusBar, Platform, TouchableOpacity } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import Pdf from 'react-native-pdf';
import { renderLandmark, LandmarkType } from './LandmarkRenderer';

const PdfRead = ({ route }) => {
  // Receive the PDF URI and Landmark Type from the StartScreen
  const { pdfUri, landmarkType } = route.params;

  const PdfResource = { uri: pdfUri, cache: true };
  const scrollY = useRef(new Animated.Value(0)).current;
  const windowHeight = Dimensions.get('window').height;
  const [numberOfPages, setNumberOfPages] = useState(0);
  const isUnmounted = useRef(false);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 20;
  const visualOffset = 0;
  const simulatedOffset = 50;
  const bottomPadding = 0;
  const usableHeight = windowHeight - statusBarHeight - visualOffset;

  // PanResponder for the draggable scrollbar
  const pan = useRef(new Animated.Value(0)).current;

  // Calculate the height of the custom scrollbar dynamically based on window height
  const scrollbarHeight = usableHeight;

  // Constrain the scroll position to prevent gaps at start and ensure scrolling to the bottom
  const constrainScrollbarPosition = (position) => {
    return Math.max(0, Math.min(position, usableHeight - scrollbarHeight));
  };

  // Handle when the user drags the scrollbar
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      let scrollPosition = ((gestureState.moveY + simulatedOffset) / usableHeight) * numberOfPages;
      scrollPosition = Math.max(0, Math.min(scrollPosition, numberOfPages - 1)); // Clamp between first and last page
      scrollY.setValue(scrollPosition);
    },
  });

  // Sync the custom scrollbar with the Pdf scroll
  scrollY.addListener(({ value }) => {
    let newPanPosition = ((value / numberOfPages) * usableHeight) - simulatedOffset;
    newPanPosition = constrainScrollbarPosition(newPanPosition);
    pan.setValue(newPanPosition);
  });

  // Function to handle the PDF scroll event
  const handleScroll = (x, y) => {
    console.log(`onScroll triggered - X: ${x}, Y: ${y}`);
    setScrollPosition({ x, y });
    scrollY.setValue(y); // Update the animated scrollY value
  };

  // Function to handle PDF load completion and set the number of pages
  const onLoadComplete = (numPages) => {
    if (!isUnmounted.current) {
      setNumberOfPages(numPages);
      console.log(`PDF loaded with ${numPages} pages`);
    }
  };

  const scrollToSection = (index) => {
    const targetScrollY = index * usableHeight;
    scrollY.setValue(targetScrollY);
  };

  useEffect(() => {
    return () => {
      isUnmounted.current = true;
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Pdf component for the PDF */}
      <Pdf
        trustAllCerts={false}
        source={PdfResource}
        style={styles.pdf} // No manual height setting, Pdf handles the pages
        onLoadComplete={onLoadComplete}
        onError={(error) => console.log(`PDF Error: ${error}`)}
        onPageChanged={(page, numberOfPages) => console.log(`Page changed to ${page} of ${numberOfPages}`)}
        onScroll={(x, y) => handleScroll(x, y)} // Use the new onScroll event
      />

      {/* Custom Scrollbar */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.scrollbar,
          {
            height: scrollbarHeight,
            transform: [{ translateY: pan }],
            top: statusBarHeight + visualOffset,
          },
        ]}
      />

      {/* Custom Landmarks */}
      <View style={[styles.iconContainer, { top: statusBarHeight + visualOffset }]}>
        {[...Array(10)].map((_, index) => (
          <TouchableOpacity key={index} onPress={() => scrollToSection(index)}>
            {renderLandmark(landmarkType, index, scrollY.interpolate({
              inputRange: [index - 0.5, index, index + 0.5],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            }))}
          </TouchableOpacity>
        ))}
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
    flex: 1, // Allow Pdf component to take up full space
    width: Dimensions.get('window').width,
    backgroundColor: '#f0f0f0',
  },
  scrollbar: {
    position: 'absolute',
    width: 15,
    right: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  iconContainer: {
    position: 'absolute',
    left: 10,
    justifyContent: 'space-between',
    height: Dimensions.get('window').height - 100,
  },
  landmarkText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  icon: {
    width: 30,
    height: 30,
    marginVertical: 10,
  },
});
