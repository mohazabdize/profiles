/**
 * DocumentUploader Component
 * 
 * Handles document uploads for verification with multiple upload methods,
 * progress tracking, and validation.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Upload,
  Camera,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/colors';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
export type DocumentType = 'id_front' | 'id_back' | 'selfie' | 'utility_bill' | 'bank_statement' | 'other';

export interface DocumentFile {
  id: string;
  uri: string;
  name: string;
  type: string;
  size: number;
  documentType: DocumentType;
  uploadedAt?: Date;
  status: UploadStatus;
  progress?: number;
  error?: string;
}

export interface DocumentUploaderProps {
  title: string;
  description?: string;
  documentType: DocumentType;
  required?: boolean;
  maxSizeMB?: number;
  allowedTypes?: string[];
  onUploadComplete?: (file: DocumentFile) => void;
  onUploadError?: (error: string) => void;
  initialDocument?: DocumentFile;
  multiple?: boolean;
}

export function DocumentUploader({
  title,
  description,
  documentType,
  required = true,
  maxSizeMB = 5,
  allowedTypes = ['image/*'],
  onUploadComplete,
  onUploadError,
  initialDocument,
  multiple = false,
}: DocumentUploaderProps) {
  const [document, setDocument] = useState<DocumentFile | null>(initialDocument || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Document type display names
  const documentTypeNames = {
    id_front: 'ID Front',
    id_back: 'ID Back',
    selfie: 'Selfie',
    utility_bill: 'Utility Bill',
    bank_statement: 'Bank Statement',
    other: 'Document',
  };

  // Simulate upload progress
  const simulateUpload = async (file: Omit<DocumentFile, 'id' | 'status'>) => {
    setIsUploading(true);
    setUploadProgress(0);

    const uploadDocument: DocumentFile = {
      ...file,
      id: Date.now().toString(),
      status: 'uploading' as UploadStatus,
      progress: 0,
    };

    setDocument(uploadDocument);

    // Simulate progress updates
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 10;
        Animated.timing(progressAnim, {
          toValue: newProgress / 100,
          duration: 200,
          useNativeDriver: false,
        }).start();

        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Mark as successful after delay
          setTimeout(() => {
            const completedDoc: DocumentFile = {
              ...uploadDocument,
              status: 'success',
              uploadedAt: new Date(),
            };
            setDocument(completedDoc);
            setIsUploading(false);
            onUploadComplete?.(completedDoc);
          }, 500);
        }
        return newProgress;
      });
    }, 300);

    return () => clearInterval(interval);
  };

  const handleImagePicker = async (useCamera: boolean) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Camera access is required to take photos.');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Gallery access is required to select images.');
          return;
        }
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
          });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Estimate file size (expo-image-picker doesn't provide exact size)
        // For JPEG images, estimate: quality 0.8 = ~200KB, adjust as needed
        const estimatedSize = 200 * 1024; // 200KB as default
        
        await handleFileSelection({
          uri: asset.uri,
          name: asset.fileName || `document_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
          size: estimatedSize,
        });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      onUploadError?.('Failed to pick image');
    }
  };

  const handleFileSelection = async (file: {
    uri: string;
    name: string;
    type: string;
    size: number;
  }) => {
    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      Alert.alert(
        'File too large',
        `File size should not exceed ${maxSizeMB}MB. Please choose a smaller file.`
      );
      return;
    }

    // Validate file type
    const isAllowedType = allowedTypes.some(type => {
      if (type === 'image/*') {
        return file.type.startsWith('image/');
      }
      return file.type === type;
    });

    if (!isAllowedType) {
      Alert.alert(
        'Invalid file type',
        `Please select a file of type: ${allowedTypes.join(', ')}`
      );
      return;
    }

    await simulateUpload({
      uri: file.uri,
      name: file.name,
      type: file.type,
      size: file.size,
      documentType,
    });
  };

  const handleRetry = () => {
    if (document) {
      simulateUpload(document);
    }
  };

  const handleRemove = () => {
    setDocument(null);
    setUploadProgress(0);
    progressAnim.setValue(0);
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Shake animation for errors
  const startShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // Trigger shake animation on error
  React.useEffect(() => {
    if (document?.status === 'error') {
      startShake();
    }
  }, [document?.status]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {required && <Text style={styles.required}>Required</Text>}
      </View>
      
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}

      {/* Upload area */}
      {!document ? (
        <View style={styles.uploadArea}>
          <Upload size={48} color={Colors.primary.blue} style={styles.uploadIcon} />
          <Text style={styles.uploadTitle}>Upload {documentTypeNames[documentType]}</Text>
          <Text style={styles.uploadSubtitle}>
            Max size: {maxSizeMB}MB • Images only
          </Text>

          <View style={styles.uploadButtons}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => handleImagePicker(false)}
              disabled={isUploading}
            >
              <FileText size={20} color={Colors.primary.blue} />
              <Text style={styles.uploadButtonText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => handleImagePicker(true)}
              disabled={isUploading}
            >
              <Camera size={20} color={Colors.primary.blue} />
              <Text style={styles.uploadButtonText}>Camera</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Animated.View
          style={[
            styles.documentCard,
            {
              transform: [{ translateX: shakeAnim }],
              borderColor: document.status === 'error' ? Colors.primary.red : Colors.neutral.gray200,
            },
          ]}
        >
          {/* Document preview/info */}
          <View style={styles.documentInfo}>
            <FileText
              size={32}
              color={
                document.status === 'success'
                  ? Colors.status.verifiedGreen
                  : document.status === 'error'
                  ? Colors.primary.red
                  : Colors.primary.blue
              }
            />
            <View style={styles.documentDetails}>
              <Text style={styles.documentName} numberOfLines={1}>
                {document.name}
              </Text>
              <Text style={styles.documentSize}>
                {(document.size / (1024 * 1024)).toFixed(2)} MB •{' '}
                {document.uploadedAt ? document.uploadedAt.toLocaleDateString() : new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Status indicator */}
          <View style={styles.statusContainer}>
            {document.status === 'uploading' && (
              <>
                <Text style={styles.uploadingText}>
                  Uploading... {uploadProgress}%
                </Text>
                <View style={styles.progressBarBg}>
                  <Animated.View
                    style={[styles.progressBarFill, { width: progressWidth }]}
                  />
                </View>
              </>
            )}

            {document.status === 'success' && (
              <View style={styles.successContainer}>
                <CheckCircle size={20} color={Colors.status.verifiedGreen} />
                <Text style={styles.successText}>Uploaded</Text>
              </View>
            )}

            {document.status === 'error' && (
              <View style={styles.errorContainer}>
                <AlertCircle size={20} color={Colors.primary.red} />
                <Text style={styles.errorText}>{document.error || 'Failed to upload'}</Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionButtons}>
            {document.status === 'error' && (
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <RefreshCw size={16} color={Colors.neutral.white} />
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
              <X size={16} color={Colors.primary.red} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Requirements list */}
      <View style={styles.requirements}>
        <Text style={styles.requirementsTitle}>Requirements:</Text>
        <Text style={styles.requirement}>• File must be clear and readable</Text>
        <Text style={styles.requirement}>• All corners must be visible</Text>
        <Text style={styles.requirement}>• No glare or reflections</Text>
        <Text style={styles.requirement}>• Document must be valid (not expired)</Text>
        <Text style={styles.requirement}>• File format: JPG, PNG, JPEG</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.bodyLarge,
    color: Colors.neutral.gray900,
    fontWeight: '600',
    marginRight: Spacing.sm,
  },
  required: {
    ...Typography.caption,
    color: Colors.primary.red,
    fontStyle: 'italic',
  },
  description: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  uploadArea: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.neutral.gray50,
    borderWidth: 2,
    borderColor: Colors.neutral.gray200,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  uploadIcon: {
    marginBottom: Spacing.md,
  },
  uploadTitle: {
    ...Typography.bodyLarge,
    color: Colors.neutral.gray900,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  uploadSubtitle: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray600,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.neutral.gray300,
    borderRadius: BorderRadius.sm,
    minWidth: 120,
  },
  uploadButtonText: {
    ...Typography.bodySmall,
    color: Colors.primary.blue,
    fontWeight: '500',
  },
  documentCard: {
    padding: Spacing.md,
    backgroundColor: Colors.neutral.gray50,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  documentDetails: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  documentName: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray900,
    fontWeight: '500',
    marginBottom: 2,
  },
  documentSize: {
    ...Typography.caption,
    color: Colors.neutral.gray600,
  },
  statusContainer: {
    marginBottom: Spacing.md,
  },
  uploadingText: {
    ...Typography.bodySmall,
    color: Colors.primary.blue,
    marginBottom: Spacing.xs,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary.blue,
    borderRadius: BorderRadius.xs,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  successText: {
    ...Typography.bodySmall,
    color: Colors.status.verifiedGreen,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.primary.red,
    fontWeight: '500',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary.blue,
    borderRadius: BorderRadius.sm,
  },
  retryButtonText: {
    ...Typography.caption,
    color: Colors.neutral.white,
    fontWeight: '500',
  },
  removeButton: {
    padding: Spacing.xs,
  },
  requirements: {
    padding: Spacing.md,
    backgroundColor: Colors.neutral.gray50,
    borderRadius: BorderRadius.sm,
  },
  requirementsTitle: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray900,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  requirement: {
    ...Typography.caption,
    color: Colors.neutral.gray700,
    marginBottom: 2,
  },
});