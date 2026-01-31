/**
 * VerificationForm Component
 * 
 * Comprehensive form for verification data collection with validation,
 * real-time feedback, and multi-step support.
 * 
 * Features:
 * - Multi-step form navigation
 * - Real-time field validation
 * - Auto-save functionality
 * - Form state management
 * - Progress tracking within form
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Save,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Upload,
  User,
  Home,
  Briefcase,
  Building,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/colors';
import { DocumentUploader, DocumentFile, DocumentType } from './DocumentUploader';

export type FormStep = {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  requiredDocuments?: DocumentType[];
};

export type FormField = {
  id: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'select' | 'textarea' | 'number';
  required?: boolean;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: string) => string | null;
  };
  options?: string[]; // For select fields
  value?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
};

export interface VerificationFormProps {
  steps: FormStep[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onSaveDraft?: (data: Record<string, any>) => Promise<void>;
  autoSaveInterval?: number; // in milliseconds
  showProgress?: boolean;
}

export function VerificationForm({
  steps,
  initialData = {},
  onSubmit,
  onSaveDraft,
  autoSaveInterval = 30000, // 30 seconds
  showProgress = true,
}: VerificationFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentFile[]>([]);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const currentStepData = steps[currentStep];
  const totalSteps = steps.length;
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  // Auto-save functionality
  useEffect(() => {
    if (!onSaveDraft) return;

    const saveInterval = setInterval(async () => {
      if (hasChanges()) {
        await handleSaveDraft();
      }
    }, autoSaveInterval);

    return () => clearInterval(saveInterval);
  }, [formData, uploadedDocuments]);

  // Progress animation
  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progressPercentage,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  }, [progressPercentage]);

  // Slide animation for step transitions
  useEffect(() => {
    slideAnim.setValue(currentStep > 0 ? -20 : 20);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [currentStep]);

  const hasChanges = () => {
    const currentState = { ...formData, documents: uploadedDocuments };
    return JSON.stringify(currentState) !== JSON.stringify(initialData);
  };

  const handleSaveDraft = async () => {
    if (!onSaveDraft || !hasChanges()) return;

    setIsSaving(true);
    try {
      await onSaveDraft({
        ...formData,
        documents: uploadedDocuments,
        lastStep: currentStep,
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const validateField = (field: FormField, value: string): string | null => {
    if (field.required && !value.trim()) {
      return 'This field is required';
    }

    if (field.validation) {
      const { pattern, minLength, maxLength, custom } = field.validation;

      if (pattern && !pattern.test(value)) {
        return 'Invalid format';
      }

      if (minLength && value.length < minLength) {
        return `Minimum ${minLength} characters required`;
      }

      if (maxLength && value.length > maxLength) {
        return `Maximum ${maxLength} characters allowed`;
      }

      if (custom) {
        return custom(value);
      }
    }

    return null;
  };

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    currentStepData.fields.forEach((field) => {
      const value = formData[field.id] || '';
      const error = validateField(field, value);

      if (error) {
        errors[field.id] = error;
        isValid = false;
      }
    });

    // Validate required documents
    if (currentStepData.requiredDocuments) {
      currentStepData.requiredDocuments.forEach((docType) => {
        const hasDoc = uploadedDocuments.some(
          (doc) => doc.documentType === docType && doc.status === 'success'
        );
        if (!hasDoc) {
          errors[`doc_${docType}`] = `Required document: ${docType} not uploaded`;
          isValid = false;
        }
      });
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    // Clear error for this field
    if (formErrors[fieldId]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleDocumentUpload = (file: DocumentFile) => {
    setUploadedDocuments((prev) => {
      const existingIndex = prev.findIndex((doc) => doc.documentType === file.documentType);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = file;
        return updated;
      }
      return [...prev, file];
    });
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleSubmit();
      }
    } else {
      // Scroll to first error
      // You can implement scroll to error logic here
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      Alert.alert('Validation Error', 'Please fix all errors before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        documents: uploadedDocuments,
        submittedAt: new Date().toISOString(),
      });
    } catch (error) {
      Alert.alert(
        'Submission Failed',
        error instanceof Error ? error.message : 'An error occurred'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldIcon = (fieldId: string) => {
    const icons: Record<string, any> = {
      name: User,
      email: User,
      phone: User,
      address: Home,
      city: Home,
      country: Home,
      occupation: Briefcase,
      company: Building,
      income: Briefcase,
    };

    const Icon = icons[fieldId];
    return Icon ? <Icon size={20} color={Colors.neutral.gray400} /> : null;
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Progress Bar */}
      {showProgress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>
              Step {currentStep + 1} of {totalSteps}
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          <Text style={styles.stepDescription}>{currentStepData.description}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.formContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          {/* Form Fields */}
          {currentStepData.fields.map((field) => (
            <View key={field.id} style={styles.fieldContainer}>
              <View style={styles.fieldHeader}>
                {renderFieldIcon(field.id)}
                <Text style={styles.fieldLabel}>
                  {field.label}
                  {field.required && <Text style={styles.requiredStar}> *</Text>}
                </Text>
              </View>

              <View
                style={[
                  styles.inputContainer,
                  formErrors[field.id] && styles.inputError,
                ]}
              >
                {field.prefix && (
                  <Text style={styles.prefix}>{field.prefix}</Text>
                )}
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  value={formData[field.id] || ''}
                  onChangeText={(value) => handleFieldChange(field.id, value)}
                  placeholderTextColor={Colors.neutral.gray400}
                  editable={!isSubmitting}
                  multiline={field.type === 'textarea'}
                  numberOfLines={field.type === 'textarea' ? 4 : 1}
                  keyboardType={
                    field.type === 'email'
                      ? 'email-address'
                      : field.type === 'phone'
                      ? 'phone-pad'
                      : field.type === 'number'
                      ? 'numeric'
                      : 'default'
                  }
                />
                {field.suffix && (
                  <Text style={styles.suffix}>{field.suffix}</Text>
                )}
              </View>

              {formErrors[field.id] && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={14} color={Colors.primary.red} />
                  <Text style={styles.errorText}>{formErrors[field.id]}</Text>
                </View>
              )}
            </View>
          ))}

          {/* Document Uploads for this step */}
          {currentStepData.requiredDocuments && (
            <View style={styles.documentsSection}>
              <Text style={styles.documentsTitle}>Required Documents</Text>
              <Text style={styles.documentsDescription}>
                Upload clear copies of the following documents
              </Text>

              {currentStepData.requiredDocuments.map((docType) => {
                const existingDoc = uploadedDocuments.find(
                  (doc) => doc.documentType === docType
                );

                return (
                  <DocumentUploader
                    key={docType}
                    title={docType.replace('_', ' ').toUpperCase()}
                    documentType={docType}
                    required
                    maxSizeMB={5}
                    onUploadComplete={handleDocumentUpload}
                    onUploadError={(error) => {
                      setFormErrors((prev) => ({
                        ...prev,
                        [`doc_${docType}`]: error,
                      }));
                    }}
                    initialDocument={existingDoc}
                  />
                );
              })}
            </View>
          )}

          {/* Form Errors Summary */}
          {Object.keys(formErrors).length > 0 && (
            <View style={styles.errorsSummary}>
              <AlertCircle size={20} color={Colors.primary.red} />
              <Text style={styles.errorsSummaryText}>
                Please fix {Object.keys(formErrors).length} error(s) before continuing
              </Text>
            </View>
          )}

          {/* Auto-save indicator */}
          {lastSaved && onSaveDraft && (
            <View style={styles.saveIndicator}>
              <CheckCircle size={14} color={Colors.status.verifiedGreen} />
              <Text style={styles.saveIndicatorText}>
                Draft saved {formatTimeSince(lastSaved)}
              </Text>
              {isSaving && (
                <Text style={styles.savingText}>Saving...</Text>
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.footer}>
        <View style={styles.navigationButtons}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handlePrevious}
              disabled={isSubmitting}
            >
              <ChevronLeft size={20} color={Colors.primary.blue} />
              <Text style={styles.secondaryButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <View style={styles.spacer} />

          {onSaveDraft && hasChanges() && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveDraft}
              disabled={isSaving || isSubmitting}
            >
              <Save size={20} color={Colors.neutral.white} />
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              isSubmitting && styles.primaryButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.primaryButtonText}>Submitting...</Text>
            ) : (
              <>
                <Text style={styles.primaryButtonText}>
                  {currentStep === totalSteps - 1 ? 'Submit Verification' : 'Continue'}
                </Text>
                <ChevronRight size={20} color={Colors.neutral.white} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Step indicators */}
        <View style={styles.stepIndicators}>
          {steps.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.stepIndicator,
                index === currentStep && styles.stepIndicatorActive,
                index < currentStep && styles.stepIndicatorCompleted,
              ]}
              onPress={() => {
                if (index <= currentStep) {
                  setCurrentStep(index);
                }
              }}
              disabled={index > currentStep}
            />
          ))}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function formatTimeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  progressContainer: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray200,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressTitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray700,
  },
  progressPercentage: {
    ...Typography.bodyMedium,
    color: Colors.primary.blue,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary.blue,
    borderRadius: BorderRadius.xs,
  },
  stepTitle: {
    ...Typography.heading2,
    color: Colors.neutral.gray900,
    marginBottom: Spacing.xs,
  },
  stepDescription: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  formContainer: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: Spacing.lg,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  fieldLabel: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray900,
    fontWeight: '500',
  },
  requiredStar: {
    color: Colors.primary.red,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.gray300,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral.gray50,
    overflow: 'hidden',
  },
  inputError: {
    borderColor: Colors.primary.red,
    backgroundColor: '#FEE2E220',
  },
  prefix: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray600,
    paddingHorizontal: Spacing.md,
  },
  suffix: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray600,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    padding: Spacing.md,
    ...Typography.bodyMedium,
    color: Colors.neutral.gray900,
    minHeight: 48,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.primary.red,
  },
  documentsSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray200,
  },
  documentsTitle: {
    ...Typography.bodyLarge,
    color: Colors.neutral.gray900,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  documentsDescription: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
    marginBottom: Spacing.md,
  },
  errorsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: '#FEE2E2',
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  errorsSummaryText: {
    ...Typography.bodySmall,
    color: Colors.primary.red,
    flex: 1,
  },
  saveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.neutral.gray50,
    borderRadius: BorderRadius.md,
  },
  saveIndicatorText: {
    ...Typography.caption,
    color: Colors.neutral.gray600,
  },
  savingText: {
    ...Typography.caption,
    color: Colors.primary.blue,
    marginLeft: 'auto',
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray200,
    backgroundColor: Colors.neutral.white,
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  spacer: {
    flex: 1,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral.gray300,
    borderRadius: BorderRadius.md,
  },
  secondaryButtonText: {
    ...Typography.bodyMedium,
    color: Colors.primary.blue,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.neutral.gray700,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  saveButtonText: {
    ...Typography.bodyMedium,
    color: Colors.neutral.white,
    fontWeight: '600',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary.blue,
    borderRadius: BorderRadius.md,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    ...Typography.bodyMedium,
    color: Colors.neutral.white,
    fontWeight: '600',
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  stepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral.gray300,
  },
  stepIndicatorActive: {
    backgroundColor: Colors.primary.blue,
    width: 16,
  },
  stepIndicatorCompleted: {
    backgroundColor: Colors.status.verifiedGreen,
  },
});