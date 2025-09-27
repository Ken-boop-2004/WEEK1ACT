import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getThemeColors } from '../../../constants/Colors';
import { useAppSelector } from '../../../store/hooks';

const { width, height } = Dimensions.get('window');

// Enhanced Slider Component with proper PanResponder
const EnhancedSlider = ({ 
  value, 
  onValueChange, 
  minimumValue = 0, 
  maximumValue = 1, 
  style, 
  minimumTrackTintColor, 
  maximumTrackTintColor, 
  thumbStyle 
}: any) => {
  const [isDragging, setIsDragging] = useState(false);
  const [sliderLayout, setSliderLayout] = useState({ x: 0, width: 280 });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
      },
      onPanResponderMove: (evt) => {
        const { pageX } = evt.nativeEvent;
        const relativeX = pageX - sliderLayout.x;
        const percentage = Math.max(0, Math.min(1, relativeX / sliderLayout.width));
        const newValue = percentage * (maximumValue - minimumValue) + minimumValue;
        onValueChange(newValue);
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
      },
    })
  ).current;

  const handleLayout = (event: any) => {
    const { x, width } = event.nativeEvent.layout;
    setSliderLayout({ x, width });
  };

  const currentPercentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;
  const safePercentage = isNaN(currentPercentage) ? 0 : Math.max(0, Math.min(100, currentPercentage));

  return (
    <View 
      style={[{ width: 280, height: 40, justifyContent: 'center' }, style]}
      onLayout={handleLayout}
      {...panResponder.panHandlers}
    >
      <View style={{ height: 6, backgroundColor: maximumTrackTintColor, borderRadius: 3 }}>
        <View 
          style={{ 
            height: 6, 
            width: `${safePercentage}%`, 
            backgroundColor: minimumTrackTintColor, 
            borderRadius: 3 
          }} 
        />
      </View>
      <View
        style={[
          {
            position: 'absolute',
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: minimumTrackTintColor,
            left: `${safePercentage}%`,
            marginLeft: -12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
            transform: isDragging ? [{ scale: 1.2 }] : [{ scale: 1 }],
          },
          thumbStyle
        ]}
      />
    </View>
  );
};

// Filter types
type FilterType = 'none' | 'grayscale' | 'sepia' | 'vintage' | 'vibrant';

// Simple filter processing simulation
const applyImageFilter = async (imageUri: string, filter: FilterType, intensity: number = 1.0) => {
  console.log(`Applying ${filter} filter with intensity ${intensity}`);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return imageUri;
};

// Enhanced crop overlay component with resize functionality
const CropOverlay = ({ cropArea, onCropChange, colors }: any) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [initialState, setInitialState] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Main crop area pan responder (for moving)
  const mainPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => !isResizing,
      onStartShouldSetPanResponder: () => !isResizing,
      onPanResponderGrant: (evt) => {
        setIsDragging(true);
        setInitialState({
          x: cropArea.x - evt.nativeEvent.pageX,
          y: cropArea.y - evt.nativeEvent.pageY,
          width: cropArea.width,
          height: cropArea.height,
        });
      },
      onPanResponderMove: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        const newX = Math.max(20, Math.min(width - cropArea.width - 20, pageX + initialState.x));
        const newY = Math.max(100, Math.min(height - cropArea.height - 200, pageY + initialState.y));
        
        onCropChange({
          ...cropArea,
          x: newX,
          y: newY,
        });
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
      },
    })
  ).current;

  // Create resize pan responder for corner handles
  const createResizePanResponder = (handleType: string) => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setIsResizing(true);
        setResizeHandle(handleType);
        setInitialState({
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
          width: cropArea.width,
          height: cropArea.height,
        });
      },
      onPanResponderMove: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        const deltaX = pageX - initialState.x;
        const deltaY = pageY - initialState.y;
        
        let newCropArea = { ...cropArea };
        const minSize = 50; // Minimum crop size
        const maxWidth = width - 40; // Screen width minus padding
        const maxHeight = height - 300; // Screen height minus top/bottom areas
        
        switch (handleType) {
          case 'topLeft':
            newCropArea.width = Math.max(minSize, Math.min(maxWidth, initialState.width - deltaX));
            newCropArea.height = Math.max(minSize, Math.min(maxHeight, initialState.height - deltaY));
            newCropArea.x = Math.max(20, Math.min(width - newCropArea.width - 20, cropArea.x + deltaX));
            newCropArea.y = Math.max(100, Math.min(height - newCropArea.height - 200, cropArea.y + deltaY));
            break;
            
          case 'topRight':
            newCropArea.width = Math.max(minSize, Math.min(maxWidth - cropArea.x + 20, initialState.width + deltaX));
            newCropArea.height = Math.max(minSize, Math.min(maxHeight, initialState.height - deltaY));
            newCropArea.y = Math.max(100, Math.min(height - newCropArea.height - 200, cropArea.y + deltaY));
            break;
            
          case 'bottomLeft':
            newCropArea.width = Math.max(minSize, Math.min(maxWidth, initialState.width - deltaX));
            newCropArea.height = Math.max(minSize, Math.min(maxHeight - cropArea.y + 100, initialState.height + deltaY));
            newCropArea.x = Math.max(20, Math.min(width - newCropArea.width - 20, cropArea.x + deltaX));
            break;
            
          case 'bottomRight':
            newCropArea.width = Math.max(minSize, Math.min(maxWidth - cropArea.x + 20, initialState.width + deltaX));
            newCropArea.height = Math.max(minSize, Math.min(maxHeight - cropArea.y + 100, initialState.height + deltaY));
            break;
        }
        
        onCropChange(newCropArea);
      },
      onPanResponderRelease: () => {
        setIsResizing(false);
        setResizeHandle(null);
      },
    });
  };

  // Create pan responders for each corner
  const topLeftPanResponder = useRef(createResizePanResponder('topLeft')).current;
  const topRightPanResponder = useRef(createResizePanResponder('topRight')).current;
  const bottomLeftPanResponder = useRef(createResizePanResponder('bottomLeft')).current;
  const bottomRightPanResponder = useRef(createResizePanResponder('bottomRight')).current;

  return (
    <View
      style={{
        position: 'absolute',
        left: cropArea.x,
        top: cropArea.y,
        width: cropArea.width,
        height: cropArea.height,
        borderWidth: 2,
        borderColor: '#fff',
        borderStyle: 'dashed',
        opacity: isDragging || isResizing ? 0.8 : 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
      }}
    >
      {/* Main draggable area */}
      <View
        {...mainPanResponder.panHandlers}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          right: 20,
          bottom: 20,
          backgroundColor: 'transparent',
        }}
      >
        <Text style={styles.cropLabel}>
          {isDragging ? 'Moving...' : isResizing ? `Resizing ${resizeHandle}` : 'Drag to move crop area'}
        </Text>
      </View>

      {/* Corner resize handles */}
      <View
        {...topLeftPanResponder.panHandlers}
        style={[
          styles.cropHandle,
          { 
            left: -8, 
            top: -8,
            backgroundColor: resizeHandle === 'topLeft' ? colors.primary : '#fff',
            transform: resizeHandle === 'topLeft' ? [{ scale: 1.2 }] : [{ scale: 1 }],
          }
        ]}
      />
      
      <View
        {...topRightPanResponder.panHandlers}
        style={[
          styles.cropHandle,
          { 
            right: -8, 
            top: -8,
            backgroundColor: resizeHandle === 'topRight' ? colors.primary : '#fff',
            transform: resizeHandle === 'topRight' ? [{ scale: 1.2 }] : [{ scale: 1 }],
          }
        ]}
      />
      
      <View
        {...bottomLeftPanResponder.panHandlers}
        style={[
          styles.cropHandle,
          { 
            left: -8, 
            bottom: -8,
            backgroundColor: resizeHandle === 'bottomLeft' ? colors.primary : '#fff',
            transform: resizeHandle === 'bottomLeft' ? [{ scale: 1.2 }] : [{ scale: 1 }],
          }
        ]}
      />
      
      <View
        {...bottomRightPanResponder.panHandlers}
        style={[
          styles.cropHandle,
          { 
            right: -8, 
            bottom: -8,
            backgroundColor: resizeHandle === 'bottomRight' ? colors.primary : '#fff',
            transform: resizeHandle === 'bottomRight' ? [{ scale: 1.2 }] : [{ scale: 1 }],
          }
        ]}
      />

      {/* Side handles for visual indication */}
      <View
        style={[
          styles.sideHandle,
          { 
            top: '50%', 
            left: -8, 
            marginTop: -8,
            backgroundColor: '#fff',
          }
        ]}
      />
      
      <View
        style={[
          styles.sideHandle,
          { 
            top: '50%', 
            right: -8, 
            marginTop: -8,
            backgroundColor: '#fff',
          }
        ]}
      />
      
      <View
        style={[
          styles.sideHandle,
          { 
            left: '50%', 
            top: -8, 
            marginLeft: -8,
            backgroundColor: '#fff',
          }
        ]}
      />
      
      <View
        style={[
          styles.sideHandle,
          { 
            left: '50%', 
            bottom: -8, 
            marginLeft: -8,
            backgroundColor: '#fff',
          }
        ]}
      />
    </View>
  );
};

export default function CameraScreen() {
  const { mode, customTheme } = useAppSelector((state) => state.theme);
  const colors = getThemeColors(mode, customTheme);
  
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [filteredImage, setFilteredImage] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('none');
  const [filterIntensity, setFilterIntensity] = useState(1.0);
  const [showFilters, setShowFilters] = useState(false);
  const [showEditTools, setShowEditTools] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [cropMode, setCropMode] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 50, y: 100, width: 200, height: 200 });
  const [imageSize, setImageSize] = useState({ width: width, height: height });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const cameraRef = useRef<CameraView>(null);

  // Apply filter when filter or intensity changes
  useEffect(() => {
    if (capturedImage) {
      applyFilterToImage();
    }
  }, [currentFilter, filterIntensity, capturedImage]);

  const applyFilterToImage = async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    try {
      const filtered = await applyImageFilter(capturedImage, currentFilter, filterIntensity);
      setFilteredImage(filtered);
    } catch (error) {
      console.error('Error applying filter:', error);
      setFilteredImage(capturedImage);
    }
    setIsProcessing(false);
  };

  const toggleCameraType = () => {
    setCameraType(current => 
      current === 'back' ? 'front' : 'back'
    );
  };

  const capturePhoto = async () => {
    if (cameraRef.current && !isCapturing) {
      setIsCapturing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.9,
          base64: false,
        });
        
        setCapturedImage(photo.uri);
        setFilteredImage(photo.uri);
        setShowEditTools(true);
        
        // Get image dimensions and set up initial crop area
        Image.getSize(photo.uri, (w, h) => {
          setImageSize({ width: w, height: h });
          // Set initial crop area to screen-relative coordinates
          setCropArea({
            x: width * 0.1,
            y: height * 0.2,
            width: width * 0.8,
            height: width * 0.8, // Square crop area
          });
        });
        
      } catch (error) {
        Alert.alert('Error', 'Failed to capture photo');
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const savePhoto = async () => {
    if (!filteredImage) return;

    try {
      setIsProcessing(true);
      
      // Simulate image processing and saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Photo Captured!', 
        'Your photo has been processed with the selected filters and edits. In a production app, this would be saved to your gallery.',
        [{ text: 'OK', onPress: () => resetPhoto() }]
      );
      
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to process photo');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetPhoto = () => {
    setCapturedImage(null);
    setFilteredImage(null);
    setShowEditTools(false);
    setCurrentFilter('none');
    setFilterIntensity(1.0);
    setRotation(0);
    setCropMode(false);
    setShowFilters(false);
  };

  const rotatePhoto = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const applyFilter = (filter: FilterType) => {
    setCurrentFilter(filter);
    setFilterIntensity(filter === 'none' ? 0 : 1.0);
  };

  const renderFilterButton = (filter: FilterType, label: string, icon: string) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        { 
          backgroundColor: currentFilter === filter ? colors.primary : colors.surface,
          borderColor: currentFilter === filter ? colors.primary : colors.textSecondary,
        }
      ]}
      onPress={() => applyFilter(filter)}
    >
      <Ionicons 
        name={icon as any} 
        size={24} 
        color={currentFilter === filter ? colors.background : colors.text} 
      />
      <Text style={[
        styles.filterLabel,
        { color: currentFilter === filter ? colors.background : colors.text }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.message, { color: colors.text }]}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.message, { color: colors.text }]}>Camera access is required to take photos</Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: colors.primary }]}
            onPress={requestPermission}
          >
            <Text style={[styles.permissionButtonText, { color: colors.background }]}>
              Grant Camera Permission
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {!capturedImage ? (
        // Camera View
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={cameraType}
          />
          
          {/* Camera Controls Overlay */}
          <View style={styles.cameraControlsOverlay}>
            {/* Top Controls */}
            <View style={styles.topControls}>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: colors.surface }]}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Ionicons name="color-filter" size={24} color={colors.text} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: colors.surface }]}
                onPress={toggleCameraType}
              >
                <Ionicons name="camera-reverse" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <TouchableOpacity
                style={[
                  styles.captureButton,
                  { 
                    backgroundColor: isCapturing ? colors.textSecondary : colors.primary,
                    borderColor: colors.background,
                  }
                ]}
                onPress={capturePhoto}
                disabled={isCapturing}
              >
                <View style={[styles.captureInner, { backgroundColor: colors.background }]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Preview Panel */}
          {showFilters && (
            <View style={[styles.filterPanel, { backgroundColor: colors.surface }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterContainer}>
                  {renderFilterButton('none', 'Original', 'image')}
                  {renderFilterButton('grayscale', 'B&W', 'contrast')}
                  {renderFilterButton('sepia', 'Sepia', 'color-palette')}
                  {renderFilterButton('vintage', 'Vintage', 'camera')}
                  {renderFilterButton('vibrant', 'Vibrant', 'color-fill')}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      ) : (
        // Photo Preview and Edit Tools
        <View style={styles.previewContainer}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: isProcessing ? capturedImage : (filteredImage || capturedImage) }}
              style={[
                styles.previewImage,
                { 
                  transform: [{ rotate: `${rotation}deg` }],
                  opacity: isProcessing ? 0.7 : 1
                }
              ]}
              resizeMode="contain"
            />
            
            {/* Processing Indicator */}
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <Text style={[styles.processingText, { color: colors.background }]}>Processing...</Text>
              </View>
            )}

            {/* Crop Overlay */}
            {cropMode && (
              <CropOverlay
                cropArea={cropArea}
                onCropChange={setCropArea}
                colors={colors}
              />
            )}
          </View>

          {/* Filter Panel for Preview */}
          {showFilters && (
            <View style={[styles.filterPanel, { backgroundColor: colors.surface }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterContainer}>
                  {renderFilterButton('none', 'Original', 'image')}
                  {renderFilterButton('grayscale', 'B&W', 'contrast')}
                  {renderFilterButton('sepia', 'Sepia', 'color-palette')}
                  {renderFilterButton('vintage', 'Vintage', 'camera')}
                  {renderFilterButton('vibrant', 'Vibrant', 'color-fill')}
                </View>
              </ScrollView>
              
              {currentFilter !== 'none' && (
                <View style={styles.intensityContainer}>
                  <Text style={[styles.intensityLabel, { color: colors.text }]}>
                    Intensity: {Math.round((filterIntensity || 0) * 100)}%
                  </Text>
                  <EnhancedSlider
                    style={styles.intensitySlider}
                    minimumValue={0}
                    maximumValue={1}
                    value={filterIntensity}
                    onValueChange={setFilterIntensity}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.textSecondary}
                    thumbStyle={{ backgroundColor: colors.primary }}
                  />
                </View>
              )}
            </View>
          )}

          {/* Edit Tools */}
          {showEditTools && !showFilters && (
            <View style={[styles.editTools, { backgroundColor: colors.surface }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.editToolsContainer}>
                  <TouchableOpacity
                    style={[styles.editButton, { backgroundColor: colors.primary }]}
                    onPress={rotatePhoto}
                  >
                    <Ionicons name="refresh" size={24} color={colors.background} />
                    <Text style={[styles.editButtonText, { color: colors.background }]}>Rotate</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.editButton, 
                      { backgroundColor: cropMode ? colors.accent : colors.secondary }
                    ]}
                    onPress={() => setCropMode(!cropMode)}
                  >
                    <Ionicons name="crop" size={24} color={colors.background} />
                    <Text style={[styles.editButtonText, { color: colors.background }]}>
                      {cropMode ? 'Done' : 'Crop'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.editButton, 
                      { backgroundColor: showFilters ? colors.accent : colors.primary }
                    ]}
                    onPress={() => setShowFilters(!showFilters)}
                  >
                    <Ionicons name="color-filter" size={24} color={colors.background} />
                    <Text style={[styles.editButtonText, { color: colors.background }]}>Filters</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.textSecondary }]}
              onPress={resetPhoto}
              disabled={isProcessing}
            >
              <Ionicons name="close" size={24} color={colors.background} />
              <Text style={[styles.actionButtonText, { color: colors.background }]}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton, 
                { 
                  backgroundColor: isProcessing ? colors.textSecondary : colors.primary,
                  opacity: isProcessing ? 0.6 : 1 
                }
              ]}
              onPress={savePhoto}
              disabled={isProcessing}
            >
              <Ionicons 
                name={isProcessing ? "hourglass" : "checkmark"} 
                size={24} 
                color={colors.background} 
              />
              <Text style={[styles.actionButtonText, { color: colors.background }]}>
                {isProcessing ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraControlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    pointerEvents: 'box-none',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  filterPanel: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  filterButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 2,
    minWidth: 80,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 5,
  },
  intensityContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    alignItems: 'center',
  },
  intensityLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  intensitySlider: {
    width: '100%',
    height: 40,
  },
  previewContainer: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    flex: 1,
    width: '100%',
  },
  processingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -25 }],
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  cropHandle: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  sideHandle: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  cropLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  editTools: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    paddingVertical: 15,
  },
  editToolsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  editButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    minWidth: 80,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 5,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 100,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});