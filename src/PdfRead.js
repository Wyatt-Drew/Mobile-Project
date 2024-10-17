import { View, Text, StyleSheet, Dimensions, Animated, ScrollView, PanResponder, StatusBar, Platform, TouchableOpacity, Image } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import Pdf from 'react-native-pdf';

// List of default icons
const customIcons = [
  require('../assets/icons/boat.png'),
  require('../assets/icons/diamond.png'),
  require('../assets/icons/clock.png'),
  require('../assets/icons/heart.png'),
  require('../assets/icons/crown.png'),
  require('../assets/icons/liberty.png'),
  require('../assets/icons/rook.png'),
  require('../assets/icons/dolphin.png'),
  require('../assets/icons/idea.png'),
  require('../assets/icons/graduate.png'),
];

// List of color icons
const customIconsColor = [
  require('../assets/icons/boat-color.png'),
  require('../assets/icons/diamond-color.png'),
  require('../assets/icons/clock-color.png'),
  require('../assets/icons/heart-color.png'),
  require('../assets/icons/crown-color.png'),
  require('../assets/icons/liberty-color.png'),
  require('../assets/icons/rook-color.png'),
  require('../assets/icons/dolphin-color.png'),
  require('../assets/icons/idea-color.png'),
  require('../assets/icons/graduate-color.png'),
];

const LandmarkType = {
  NUMBERS: 'Numbers',
  LETTERS: 'Letters',
  ICONS: 'Icons',
  COLOR_ICONS: 'ColorIcons',
  NONE: 'None',
};

// Function to render a landmark based on type and index, with dynamic opacity
const renderLandmark = (type, index, opacity) => {
  switch (type) {
    case LandmarkType.NUMBERS:
      return <Animated.Text style={[styles.landmarkText, { opacity }]}>{index + 1}</Animated.Text>; // Numbers (1-10)
    case LandmarkType.LETTERS:
      return <Animated.Text style={[styles.landmarkText, { opacity }]}>{String.fromCharCode(65 + index)}</Animated.Text>; // Letters (A-J)
    case LandmarkType.ICONS:
      return <Animated.Image source={customIcons[index]} style={[styles.icon, { opacity }]} />; // Default Icons
    case LandmarkType.COLOR_ICONS:
      return <Animated.Image source={customIconsColor[index]} style={[styles.icon, { opacity }]} />; // Color Icons
    case LandmarkType.NONE:
      return null; // No icons
    default:
      return null;
  }
};

const PdfRead = ({ route }) => {
  // Receive the PDF URI and Landmark Type from the StartScreen
  const { pdfUri, landmarkType } = route.params;

  const PdfResource = { uri: pdfUri, cache: true };
  const scrollY = useRef(new Animated.Value(0)).current; 
  const [pdfHeight, setPdfHeight] = useState(Dimensions.get('window').height); 
  const scrollViewRef = useRef();
  const windowHeight = Dimensions.get('window').height;
  const isUnmounted = useRef(false); 

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 20;
  //These may or may not be used.  Gives full control of scrollbar appearance.
  const visualOffset = 0; 
  const simulatedOffset = 50; 
  const bottomPadding = 0; 
  const usableHeight = windowHeight - statusBarHeight - visualOffset; 

  // PanResponder for the draggable scrollbar
  const pan = useRef(new Animated.Value(0)).current;

  // Calculate the height of the custom scrollbar dynamically
  const scrollbarHeight = pdfHeight > usableHeight
    ? (usableHeight * (usableHeight / pdfHeight))
    : usableHeight;

  // Constrain the scroll position to prevent gaps at start and ensure scrolling to the bottom
  const constrainScrollPosition = (position) => {
    return Math.max(0, Math.min(position, pdfHeight - usableHeight));
  };

  const constrainScrollbarPosition = (position) => {
    return Math.max(0, Math.min(position, usableHeight - scrollbarHeight));
  };

  // Handle when the user drags the scrollbar
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      // Ensure the scroll position calculation allows for the full range of movement
      let scrollPosition = ((gestureState.moveY + simulatedOffset) / usableHeight) * pdfHeight;
      scrollPosition = constrainScrollPosition(scrollPosition); // Constrain the scroll position
      scrollY.setValue(scrollPosition);

      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: scrollPosition, animated: false });
      }
    },
  });

  // Sync the custom scrollbar with the ScrollView scrolling
  scrollY.addListener(({ value }) => {
    // Apply the simulated offset to the scrollbar's translation
    let newPanPosition = ((value / pdfHeight) * usableHeight) - simulatedOffset;
    newPanPosition = constrainScrollbarPosition(newPanPosition); // Constrain the scrollbar's movement within bounds
    pan.setValue(newPanPosition); // Move the custom scrollbar based on the ScrollView scroll position
  });

  // Calculate section height and which section is currently active
  const sectionHeight = pdfHeight / 10;

  const getActiveSection = () => {
    // Calculate the current section based on scroll position
    return scrollY.interpolate({
      inputRange: Array.from({ length: 11 }, (_, i) => i * sectionHeight),
      outputRange: Array.from({ length: 11 }, (_, i) => i),
      extrapolate: 'clamp',
    });
  };

  const activeSection = getActiveSection();

  const getIconOpacity = (index) => {
    return activeSection.interpolate({
      inputRange: [index - 0.5, index, index + 0.5],
      // Bright when current section, otherwise dim
      outputRange: [0.3, 1, 0.3], 
      extrapolate: 'clamp',
    });
  };

  const scrollToSection = (index) => {
    const targetScrollY = index * sectionHeight;
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: targetScrollY, animated: true });
    }
  };

  useEffect(() => {
    return () => {
      isUnmounted.current = true;
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* ScrollView for the PDF */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPadding }} // Add bottom padding
        onLayout={() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: false }); // Ensure it starts at the top
          }
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Pdf
          trustAllCerts={false}
          source={PdfResource}
          style={[styles.pdf, { height: pdfHeight + bottomPadding }]}
          onLoadComplete={(numberOfPages) => {
            if (!isUnmounted.current) {
              const dynamicHeight = usableHeight * numberOfPages;
              setPdfHeight(dynamicHeight);
              console.log(`Number of pages: ${numberOfPages}, Dynamic height: ${dynamicHeight}`);
            }
          }}
          onError={(error) => console.log('Error loading PDF', error)}
        />
      </ScrollView>

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
            {renderLandmark(landmarkType, index, getIconOpacity(index))}
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
  title: {
    fontSize: 25,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pdf: {
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
    height: Dimensions.get('window').height - 100, // Adjusted height for the icons
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
