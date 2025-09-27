import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { getThemeColors } from '../constants/Colors';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateCustomThemeColor } from '../store/themeSlice';

interface ColorPickerProps {
  colorKey: 'primary' | 'secondary' | 'accent' | 'background' | 'surface' | 'text' | 'textSecondary';
  label: string;
}

const PRESET_COLORS = [
  '#0a7ea4', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
  '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3',
  '#ff9f43', '#10ac84', '#ee5a24', '#0984e3', '#6c5ce7',
  '#a29bfe', '#fd79a8', '#fdcb6e', '#e17055', '#74b9ff',
];

export default function ColorPicker({ colorKey, label }: ColorPickerProps) {
  const dispatch = useAppDispatch();
  const { mode, customTheme } = useAppSelector((state) => state.theme);
  const colors = getThemeColors(mode, customTheme);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [customColor, setCustomColor] = useState(customTheme[colorKey]);
  
  const scaleValue = useSharedValue(1);

  const handleColorSelect = (color: string) => {
    scaleValue.value = withSpring(0.95, { damping: 10 }, () => {
      scaleValue.value = withSpring(1, { damping: 10 });
    });

    dispatch(updateCustomThemeColor({ key: colorKey, value: color }));
    setCustomColor(color);
  };

  const handleCustomColorSubmit = () => {
    if (isValidHexColor(customColor)) {
      handleColorSelect(customColor);
      setModalVisible(false);
    } else {
      Alert.alert('Invalid Color', 'Please enter a valid hex color code (e.g., #ff0000)');
    }
  };

  const isValidHexColor = (color: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={[
            styles.colorButton,
            { backgroundColor: customTheme[colorKey], borderColor: colors.primary }
          ]}
          onPress={() => setModalVisible(true)}
        />
      </Animated.View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Choose {label} Color
            </Text>
            
            <ScrollView style={styles.presetColorsContainer}>
              <View style={styles.presetColorsGrid}>
                {PRESET_COLORS.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.presetColor,
                      { backgroundColor: color },
                      customTheme[colorKey] === color && styles.selectedColor
                    ]}
                    onPress={() => handleColorSelect(color)}
                  />
                ))}
              </View>
            </ScrollView>

            <View style={styles.customColorSection}>
              <Text style={[styles.customColorLabel, { color: colors.text }]}>
                Custom Color:
              </Text>
              <View style={styles.customColorInput}>
                <TextInput
                  style={[styles.textInput, { color: colors.text, borderColor: colors.primary }]}
                  value={customColor}
                  onChangeText={setCustomColor}
                  placeholder="#000000"
                  placeholderTextColor={colors.textSecondary}
                />
                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: colors.primary }]}
                  onPress={handleCustomColorSubmit}
                >
                  <Text style={[styles.submitButtonText, { color: colors.background }]}>
                    Apply
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.secondary }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: colors.background }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  presetColorsContainer: {
    maxHeight: 200,
    marginBottom: 20,
  },
  presetColorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#000',
    borderWidth: 3,
  },
  customColorSection: {
    marginBottom: 20,
  },
  customColorLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  customColorInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 16,
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
