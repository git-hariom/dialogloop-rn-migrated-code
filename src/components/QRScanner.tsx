import React, { useEffect } from 'react';
import {
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

import { CodeScanner } from 'react-native-vision-camera-barcode-scanner';

type QRScannerProps = {
  onBarcodeScanned: (barcodes: any[]) => void;
  onClose: () => void;
  visible?: boolean;
};

const QRScanner = ({
  onBarcodeScanned,
  onClose,
  visible,
}: QRScannerProps) => {
  const {
    hasPermission,
    requestPermission,
  } = useCameraPermission();

  const device = useCameraDevice('back');

  const handleRequestPermission = async () => {
    try {
      const granted = await requestPermission();
      if (!granted) {
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('Permission request error:', error);
    }
  };

  if (!hasPermission) {
    return (
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}>
        <View style={styles.center}>
          <Text style={styles.message}>
            DialogLoop needs camera access to scan QR codes.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRequestPermission}>
            <Text style={styles.buttonText}>
              Allow Camera
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  if (!device) {
    return (
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}>
        <View style={styles.center}>
          <Text style={styles.message}>
            Initializing camera...
          </Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Scan QR Code to continue
          </Text>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>Close</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cameraContainer}>
          <CodeScanner
            style={StyleSheet.absoluteFill}
            isActive={visible}
            barcodeFormats={['qr-code']}
            onBarcodeScanned={onBarcodeScanned}
            onError={error => {
              console.error('QR Scanner Error:', error);
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },

  header: {
    height: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
  },

  close: {
    fontSize: 16,
  },

  cameraContainer: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },

  message: {
    fontSize: 16,
    textAlign: 'center',
  },

  button: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'black',
    borderRadius: 8,
  },

  buttonText: {
    color: 'white',
  },

  closeButton: {
    marginTop: 20,
    padding: 10,
  },
});

export default QRScanner;