import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { getThemeColors } from "../../../constants/Colors";
import { nightModeStyle } from "../../../constants/mapStyles";
import { useAppSelector } from "../../../store/hooks";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type PointOfInterest = {
  id: string;
  title: string;
  description: string;
  coordinate: Coordinates;
  radius: number;
};

type MapLayerOption = {
  id: string;
  label: string;
  mapType: "standard" | "satellite" | "hybrid" | "terrain" | "mutedStandard";
  customStyle?: typeof nightModeStyle;
};

const MOCK_POIS: PointOfInterest[] = [
  {
    id: "studio-hq",
    title: "Studio HQ",
    description: "Main creative hub for live sessions.",
    coordinate: { latitude: 37.78825, longitude: -122.4324 },
    radius: 120,
  },
  {
    id: "vinyl-bar",
    title: "Vinyl Bar",
    description: "Pop-up listening bar collab.",
    coordinate: { latitude: 37.7865, longitude: -122.4358 },
    radius: 100,
  },
  {
    id: "park-stage",
    title: "Park Stage",
    description: "Outdoor acoustic showcase area.",
    coordinate: { latitude: 37.7906, longitude: -122.428 },
    radius: 140,
  },
];

const INITIAL_REGION: Region = {
  latitude: MOCK_POIS[0].coordinate.latitude,
  longitude: MOCK_POIS[0].coordinate.longitude,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const MAP_LAYERS: MapLayerOption[] = [
  { id: "default", label: "Default", mapType: "standard", customStyle: nightModeStyle },
  { id: "satellite", label: "Satellite", mapType: "satellite" },
  { id: "hybrid", label: "Hybrid", mapType: "hybrid" },
  { id: "terrain", label: "Terrain", mapType: "terrain" },
];

const MapScreen = () => {
  const mapRef = useRef<MapView | null>(null);
  const watchSubscription = useRef<Location.LocationSubscription | null>(null);
  const geofenceStatusRef = useRef<Record<string, boolean>>({});
  const navigation = useNavigation();

  const { mode, customTheme } = useAppSelector((state) => state.theme);
  const colors = getThemeColors(mode, customTheme);

  const [currentRegion, setCurrentRegion] = useState<Region>(INITIAL_REGION);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<MapLayerOption>(MAP_LAYERS[0]);

  const poiDescriptions = useMemo(() => {
    return MOCK_POIS.map((poi) => `${poi.title}: ${poi.description}`).join("\n");
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert("Location disabled", "Turn on location services to view the map.");
        return false;
      }

      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        if (canAskAgain) {
          Alert.alert(
            "Permission needed",
            "Allow location access to track nearby hotspots on the map."
          );
        }
        return false;
      }

      return true;
    } catch (error) {
      console.warn("Permission request error", error);
      return false;
    }
  }, []);

  const stopWatch = useCallback(() => {
    if (watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
    }
  }, []);

  const handleGeofencing = useCallback(
    (coords: Coordinates) => {
      MOCK_POIS.forEach((poi) => {
        const distance = getDistanceInMeters(coords, poi.coordinate);
        const isInside = distance <= poi.radius;
        const wasInside = geofenceStatusRef.current[poi.id];

        if (wasInside === undefined) {
          geofenceStatusRef.current[poi.id] = isInside;
          return;
        }

        if (isInside !== wasInside) {
          geofenceStatusRef.current[poi.id] = isInside;
          Alert.alert(
            isInside ? "You entered a hotspot" : "You left a hotspot",
            `${poi.title} • ${poi.description}`
          );
        }
      });
    },
    []
  );

  const startWatchingLocation = useCallback(async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      setPermissionError("Location permission is required to show the map.");
      return;
    }

    setPermissionError(null);

    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5,
          timeInterval: 5000,
          mayShowUserSettingsDialog: true,
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          const nextRegion: Region = {
            latitude,
            longitude,
            latitudeDelta: currentRegion.latitudeDelta,
            longitudeDelta: currentRegion.longitudeDelta,
          };

          setUserLocation({ latitude, longitude });
          setCurrentRegion(nextRegion);
          handleGeofencing({ latitude, longitude });
          mapRef.current?.animateToRegion(nextRegion, 250);
        }
      );

      watchSubscription.current = subscription;
    } catch (error) {
      console.warn("Location error", error);
      setPermissionError("Failed to start location services.");
    }
  }, [currentRegion.latitudeDelta, currentRegion.longitudeDelta, handleGeofencing, requestPermission]);

  useEffect(() => {
    startWatchingLocation();
    return () => stopWatch();
  }, [startWatchingLocation, stopWatch]);

  const handleZoom = useCallback(
    (direction: "in" | "out") => {
      setCurrentRegion((prev) => {
        const factor = direction === "in" ? 0.7 : 1.3;
        const latitudeDelta = Math.max(Math.min(prev.latitudeDelta * factor, 0.5), 0.002);
        const longitudeDelta = Math.max(Math.min(prev.longitudeDelta * factor, 0.5), 0.002);
        const region = { ...prev, latitudeDelta, longitudeDelta };
        mapRef.current?.animateToRegion(region, 200);
        return region;
      });
    },
    []
  );

  const recenterOnUser = useCallback(() => {
    if (userLocation) {
      const region = {
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setCurrentRegion(region);
      mapRef.current?.animateToRegion(region, 250);
    }
  }, [userLocation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Live Map</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track hotspots & listening parties in real time
          </Text>
        </View>
      </View>

      {permissionError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{permissionError}</Text>
        </View>
      )}

      <View style={[styles.layerRow, { borderColor: colors.textSecondary, backgroundColor: colors.surface }]}>
        {MAP_LAYERS.map((layer) => {
          const isActive = layer.id === activeLayer.id;
          return (
            <TouchableOpacity
              key={layer.id}
              style={[
                styles.layerChip,
                {
                  backgroundColor: isActive ? colors.primary : "transparent",
                  borderColor: colors.textSecondary,
                },
              ]}
              onPress={() => setActiveLayer(layer)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[
                  styles.layerChipText,
                  { color: isActive ? colors.background : colors.text },
                ]}
              >
                {layer.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <MapView
        ref={(ref) => { mapRef.current = ref; }}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        mapType={activeLayer.mapType}
        customMapStyle={activeLayer.customStyle}
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}
        onRegionChangeComplete={setCurrentRegion}
      >
        {MOCK_POIS.map((poi) => (
          <React.Fragment key={poi.id}>
            <Marker coordinate={poi.coordinate} title={poi.title} description={poi.description}>
              <View style={styles.markerContainer}>
                <View style={[styles.markerDot, { backgroundColor: colors.accent }]} />
                <Text style={[styles.markerLabel, { backgroundColor: colors.surface, color: colors.text }]}>
                  {poi.title}
                </Text>
              </View>
            </Marker>
            <Circle
              center={poi.coordinate}
              radius={poi.radius}
              strokeColor={`${colors.accent}90`}
              fillColor={`${colors.accent}22`}
            />
          </React.Fragment>
        ))}
      </MapView>

      <View style={[styles.mapControls, { backgroundColor: colors.surface }]}>
        <TouchableOpacity style={styles.controlButton} onPress={() => handleZoom("in")}>
          <Text style={[styles.controlText, { color: colors.text }]}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={() => handleZoom("out")}>
          <Text style={[styles.controlText, { color: colors.text }]}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={recenterOnUser}>
          <Text style={[styles.controlText, { color: colors.text }]}>◎</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.poiCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.poiTitle, { color: colors.text }]}>Featured spots</Text>
        <Text style={[styles.poiDescription, { color: colors.textSecondary }]}>{poiDescriptions}</Text>
      </View>
    </SafeAreaView>
  );
};

const getDistanceInMeters = (pointA: Coordinates, pointB: Coordinates) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6378137;

  const dLat = toRad(pointB.latitude - pointA.latitude);
  const dLon = toRad(pointB.longitude - pointA.longitude);

  const lat1 = toRad(pointA.latitude);
  const lat2 = toRad(pointB.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2b2b2b",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 2,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#4a4a4a",
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: "center",
  },
  markerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#fff",
  },
  markerLabel: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: "600",
  },
  mapControls: {
    position: "absolute",
    right: 16,
    top: 140,
    borderRadius: 16,
    padding: 8,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    gap: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  controlText: {
    fontSize: 20,
    fontWeight: "700",
  },
  layerRow: {
    flexDirection: "row",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
  },
  layerChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  layerChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  poiCard: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    padding: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  poiTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  poiDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  errorBanner: {
    position: "absolute",
    top: 80,
    left: 16,
    right: 16,
    backgroundColor: "#ff7676",
    padding: 12,
    borderRadius: 8,
    zIndex: 10,
  },
  errorText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});

export default MapScreen;