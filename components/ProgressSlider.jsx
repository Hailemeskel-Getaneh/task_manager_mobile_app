import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

/**
 * A zero-dependency draggable slider for choosing 0-100% progress.
 */
export default function ProgressSlider({ value, onChange, theme }) {
  const [sliderWidth, setSliderWidth] = useState(0);
  const containerRef = useRef(null);

  const calculateValue = (evt) => {
    const touchX = evt.nativeEvent.locationX;
    if (sliderWidth <= 0) return;
    
    let newValue = (touchX / sliderWidth) * 100;
    newValue = Math.max(0, Math.min(100, Math.round(newValue)));
    if (onChange) onChange(newValue);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>PROGRESS STATUS</Text>
        <Text style={[styles.valueText, { color: theme.primary }]}>{value}%</Text>
      </View>

      <View
        ref={containerRef}
        onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={calculateValue}
        onResponderMove={calculateValue}
        style={styles.sliderTrack}
      >
        {/* Background Bar */}
        <View style={[styles.inactiveTrack, { backgroundColor: theme.border }]} />
        
        {/* Active Fill */}
        <View 
          style={[
            styles.activeTrack, 
            { width: `${value}%`, backgroundColor: theme.primary }
          ]} 
        />
        
        {/* Thumb */}
        <View 
          style={[
            styles.thumb, 
            { left: `${value}%`, backgroundColor: 'white', borderColor: theme.primary }
          ]} 
        />
      </View>

      <View style={styles.hintRow}>
        <Text style={[styles.hintText, { color: theme.textSecondary + '80' }]}>Drag to update</Text>
        <Text style={[styles.hintText, { color: theme.textSecondary + '80' }]}>Target: 100%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  valueText: {
    fontSize: 18,
    fontWeight: '900',
  },
  sliderTrack: {
    height: 48,
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 2, // Extra space to prevent thumb cutoff
  },
  inactiveTrack: {
    height: 10,
    width: '100%',
    borderRadius: 99,
  },
  activeTrack: {
    height: 10,
    borderRadius: 99,
    position: 'absolute',
    left: 0,
  },
  thumb: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 5,
    marginLeft: -16, // Center thumb over the line
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  hintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  hintText: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
