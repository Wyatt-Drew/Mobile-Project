import { View, StyleSheet, Dimensions, StatusBar, Platform, Animated, PanResponder } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import Pdf from '../libraries/react-native-pdf';

// Scrollbar component
const Scrollbar = ({ scrollPosition, totalHeight, visibleHeight, onScroll }) => {
  // Ensure that the total height and visible height are non-zero
  const scrollbarHeight = totalHeight > visibleHeight ? (visibleHeight * (visibleHeight / totalHeight)) : visibleHeight;
  
  // Clamp the scroll position between 0 and the max scrollable position
  const clampedScrollPosition = Math.max(0, Math.min(scrollPosition, totalHeight - visibleHeight));

  // Create the pan animation
  const pan = useRef(new Animated.Value(0)).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      const newScrollPosition = Math.max(0, Math.min((gestureState.moveY / visibleHeight) * totalHeight, totalHeight - visibleHeight));
      onScroll(newScrollPosition);  // Move the PDF based on scrollbar drag
    },
  });

  // Update the pan value whenever the scroll position changes
  useEffect(() => {
    const scrollbarPosition = (clampedScrollPosition / totalHeight) * visibleHeight;
    if (!isNaN(scrollbarPosition)) {
      pan.setValue(scrollbarPosition);  // Safeguard against NaN values
    }
  }, [clampedScrollPosition, totalHeight, visibleHeight]);

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.scrollbar,
        { height: scrollbarHeight, transform: [{ translateY: pan }] }
      ]}
    />
  );
};


const PdfRead = ({ route }) => {
  // Receive the PDF URI from the route parameters
  const { pdfUri } = route.params;
  const pdfRef = useRef(null);  // Ref for the PDF component
  const [numberOfPages, setNumberOfPages] = useState(0);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const windowHeight = Dimensions.get('window').height;
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 20;
  const usableHeight = windowHeight - statusBarHeight;

  // Handle scroll position change
  const handleScroll = (x, y) => {
    setScrollPosition({ x, y });
  };

  // Function to handle PDF load completion and set the number of pages
  const onLoadComplete = (numPages) => {
    setNumberOfPages(numPages);
    console.log(`PDF loaded with ${numPages} pages`);
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
    };
  }, []);

  const handleScrollbarScroll = (newPosition) => {
    // Scroll the PDF to the corresponding position
    if (pdfRef.current) {
      pdfRef.current.setPage(Math.ceil(newPosition / usableHeight) + 1); // Adjust page according to position
    }
  };

  return (
    <View style={styles.container}>
      {/* Pdf component for rendering the PDF */}
      <Pdf
        ref={pdfRef}
        source={{ uri: pdfUri, cache: true }}
        style={styles.pdf}
        onLoadComplete={onLoadComplete}
        onError={(error) => console.log(`PDF Error: ${error}`)}
        onPageChanged={(page, numberOfPages) => console.log(`Page changed to ${page} of ${numberOfPages}`)}
        onScroll={(x, y) => handleScroll(x, y)}
      />
      {/* Scrollbar component */}
      <Scrollbar
        scrollPosition={scrollPosition.y}
        totalHeight={numberOfPages * usableHeight}
        visibleHeight={usableHeight}
        onScroll={handleScrollbarScroll}
      />
    </View>
  );
};

export default PdfRead;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width - 20,  // Leave space for the scrollbar
    backgroundColor: '#f0f0f0',
  },
  scrollbar: {
    width: 10,  // Width of the scrollbar
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 5,
    position: 'absolute',
    right: 0,
  },
});
