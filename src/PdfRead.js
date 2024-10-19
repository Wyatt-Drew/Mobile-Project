import { View, StyleSheet, Dimensions, StatusBar, Platform, Animated, PanResponder } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import Pdf from '../libraries/react-native-pdf';

// Scrollbar component
const Scrollbar = ({ scrollPosition, totalHeight, visibleHeight, onScroll }) => {
  // Calculate scrollbar height based on total content height vs visible content
  const scrollbarHeight = totalHeight > visibleHeight
    ? (visibleHeight * (visibleHeight / totalHeight))
    : visibleHeight;

  // Create a pan animation to handle drag interaction
  const pan = useRef(new Animated.Value(0)).current;

  // PanResponder to handle dragging of the scrollbar
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      // Calculate the new scroll position based on scrollbar drag
      const newScrollPosition = Math.max(
        0,
        Math.min((gestureState.moveY / visibleHeight) * totalHeight, totalHeight - visibleHeight)
      );
      onScroll(newScrollPosition);  // Move the PDF based on scrollbar drag
    },
  });

  // Effect to update the scrollbar position when the PDF scrolls
  useEffect(() => {
    // Reverse the scrollPosition (since Y becomes negative as we scroll down)
    const clampedScrollPosition = Math.abs(scrollPosition);
    
    const scrollbarPosition = (clampedScrollPosition / totalHeight) * visibleHeight;

    if (!isNaN(scrollbarPosition)) {
      // Smoothly animate the scrollbar as the PDF is scrolled
      Animated.timing(pan, {
        toValue: scrollbarPosition,
        duration: 0,  // Set to 0 for instant response
        useNativeDriver: false,
      }).start();
    }
  }, [scrollPosition, totalHeight, visibleHeight]);

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

// Main PdfRead component
const PdfRead = ({ route }) => {
  const { pdfUri } = route.params;
  const pdfRef = useRef(null);
  const [numberOfPages, setNumberOfPages] = useState(0);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  const windowHeight = Dimensions.get('window').height;
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 20;
  const usableHeight = windowHeight - statusBarHeight;

  // Handle scroll position change in PDF
  const handleScroll = (x, y) => {
    console.log(`PDF scrolled to X: ${x}, Y: ${y}`);
    setScrollPosition({ x, y });
  };

  // Handle load completion to get number of pages in PDF
  const onLoadComplete = (numPages) => {
    setNumberOfPages(numPages);
    console.log(`PDF loaded with ${numPages} pages`);
  };

  // Handle scrollbar scrolling - move the PDF based on scrollbar drag
  const handleScrollbarScroll = (newPosition) => {
    if (pdfRef.current) {
      // Calculate which page to move to based on the scrollbar position
      const newPage = Math.ceil(newPosition / usableHeight) + 1;
      pdfRef.current.setPage(newPage);
    }
  };

  // Show PDF and Scrollbar only after PDF is loaded
  if (numberOfPages === 0) {
    return (
      <View style={styles.container}>
        <Pdf
          ref={pdfRef}
          source={{ uri: pdfUri, cache: true }}
          style={styles.pdf}
          onLoadComplete={onLoadComplete}
          onError={(error) => console.log(`PDF Error: ${error}`)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pdf
        ref={pdfRef}
        source={{ uri: pdfUri, cache: true }}
        style={styles.pdf}
        onLoadComplete={onLoadComplete}
        onError={(error) => console.log(`PDF Error: ${error}`)}
        onPageChanged={(page, numberOfPages) => console.log(`Page changed to ${page} of ${numberOfPages}`)}
        onScroll={(x, y) => handleScroll(x, y)}
      />
      <Scrollbar
        scrollPosition={scrollPosition.y} // Current Y scroll position of PDF
        totalHeight={numberOfPages * usableHeight} // Total height based on number of pages
        visibleHeight={usableHeight} // Height of the visible PDF area
        onScroll={handleScrollbarScroll} // Function to scroll PDF when scrollbar is dragged
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
