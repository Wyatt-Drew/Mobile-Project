import React, { useRef, useState, useEffect } from 'react';
import { View, ScrollView, Animated, PanResponder, StatusBar, Platform, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import Pdf from 'react-native-pdf';
import { renderLandmark, LandmarkType } from './LandmarkRenderer'; // Import from the new file

const PdfRead = ({ route }) => {
  const { pdfUri, landmarkType } = route.params;
  const PdfResource = { uri: pdfUri, cache: true };
  const scrollY = useRef(new Animated.Value(0)).current;
  const [pdfHeight, setPdfHeight] = useState(Dimensions.get('window').height);
  const scrollViewRef = useRef();
  const windowHeight = Dimensions.get('window').height;
  const isUnmounted = useRef(false);

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 20;
  const visualOffset = 0;
  const simulatedOffset = 50;
  const bottomPadding = 0;
  const usableHeight = windowHeight - statusBarHeight - visualOffset;

  const pan = useRef(new Animated.Value(0)).current;

  const scrollbarHeight = pdfHeight > usableHeight
    ? (usableHeight * (usableHeight / pdfHeight))
    : usableHeight;

  const constrainScrollPosition = (position) => {
    return Math.max(0, Math.min(position, pdfHeight - usableHeight));
  };

  const constrainScrollbarPosition = (position) => {
    return Math.max(0, Math.min(position, usableHeight - scrollbarHeight));
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      let scrollPosition = ((gestureState.moveY + simulatedOffset) / usableHeight) * pdfHeight;
      scrollPosition = constrainScrollPosition(scrollPosition);
      scrollY.setValue(scrollPosition);

      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: scrollPosition, animated: false });
      }
    },
  });

  scrollY.addListener(({ value }) => {
    let newPanPosition = ((value / pdfHeight) * usableHeight) - simulatedOffset;
    newPanPosition = constrainScrollbarPosition(newPanPosition);
    pan.setValue(newPanPosition);
  });

  const sectionHeight = pdfHeight / 10;

  const getActiveSection = () => {
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
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        onLayout={() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: false });
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
            }
          }}
          onError={(error) => console.log('Error loading PDF', error)}
        />
      </ScrollView>

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
