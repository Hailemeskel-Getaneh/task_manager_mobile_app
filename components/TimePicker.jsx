import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { ChevronUp, ChevronDown } from 'lucide-react-native';

/**
 * Zero-dependency time picker with AM/PM support.
 * Replaces @react-native-community/datetimepicker entirely.
 */
export default function TimePicker({ visible, value, onChange, onClose }) {
  const initH = value ? value.getHours() % 12 || 12 : 9;
  const initM = value ? value.getMinutes() : 0;
  const initAmpm = value && value.getHours() >= 12 ? 'PM' : 'AM';

  const [hour, setHour] = useState(initH);
  const [minute, setMinute] = useState(initM);
  const [ampm, setAmpm] = useState(initAmpm);

  const confirm = () => {
    const d = new Date(value || new Date());
    let h = hour % 12;
    if (ampm === 'PM') h += 12;
    d.setHours(h, minute, 0, 0);
    
    if (typeof onChange === 'function') {
      onChange(d);
    }
    onClose();
  };

  const Step = ({ label, onInc, onDec, onLongInc, onLongDec, display }) => (
    <View style={{ alignItems: 'center', minWidth: 64 }}>
      <TouchableOpacity 
        onPress={onInc} 
        onLongPress={onLongInc}
        delayLongPress={300}
        style={{ padding: 12 }}
      >
        <ChevronUp size={28} color="white" />
      </TouchableOpacity>
      <Text style={{ color: 'white', fontSize: 36, fontWeight: '900', minWidth: 56, textAlign: 'center' }}>
        {display}
      </Text>
      <TouchableOpacity 
        onPress={onDec} 
        onLongPress={onLongDec}
        delayLongPress={300}
        style={{ padding: 12 }}
      >
        <ChevronDown size={28} color="white" />
      </TouchableOpacity>
      <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginTop: 4 }}>
        {label}
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <View style={{ backgroundColor: '#1e293b', borderRadius: 32, padding: 32, width: '100%' }}>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 32 }}>
            Select Time
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Step
              label="Hour"
              display={String(hour).padStart(2, '0')}
              onInc={() => setHour(h => h >= 12 ? 1 : h + 1)}
              onDec={() => setHour(h => h <= 1 ? 12 : h - 1)}
              onLongInc={() => setHour(h => (h + 2 > 12 ? (h + 2 - 12) : h + 2))}
              onLongDec={() => setHour(h => (h - 2 < 1 ? (12 + (h - 2)) : h - 2))}
            />
            <Text style={{ color: 'white', fontSize: 36, fontWeight: '900', marginBottom: 28 }}>:</Text>
            <Step
              label="Min"
              display={String(minute).padStart(2, '0')}
              onInc={() => setMinute(m => (m >= 59 ? 0 : m + 1))}
              onDec={() => setMinute(m => (m <= 0 ? 59 : m - 1))}
              onLongInc={() => setMinute(m => ((m + 15) % 60))}
              onLongDec={() => setMinute(m => (m - 15 < 0 ? (60 + (m - 15)) : m - 15))}
            />
            <View style={{ marginBottom: 28, marginLeft: 8 }}>
              <TouchableOpacity
                onPress={() => setAmpm('AM')}
                style={{ backgroundColor: ampm === 'AM' ? '#38bdf8' : 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 10, marginBottom: 6, minWidth: 48, alignItems: 'center' }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>AM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAmpm('PM')}
                style={{ backgroundColor: ampm === 'PM' ? '#38bdf8' : 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 10, minWidth: 48, alignItems: 'center' }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>PM</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
            <TouchableOpacity onPress={onClose} style={{ flex: 1, padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirm} style={{ flex: 1, padding: 16, borderRadius: 16, backgroundColor: '#38bdf8', alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
