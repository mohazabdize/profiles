/**
 * Enhanced Verification Screen with Complete Form Management
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  ArrowLeft,
  User,
  Home,
  Briefcase,
  Building,
  FileText,
  Award,
  CheckCircle,
  Save,
  AlertCircle,
  Edit,
  Eye,
  Shield,
  CreditCard,
  BarChart,
  Globe,
  LucideIcon,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/colors';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';

// Import verification components
import { VerificationStatus, VerificationStatusType, VerificationLevel } from '@/components/profile/verification/VerificationStatus';
import { VerificationForm, FormStep } from '@/components/profile/verification/VerificationForm';
import { DocumentUploader } from '@/components/profile/verification/DocumentUploader';

// Storage keys
const STORAGE_KEYS = {
  VERIFICATION_DATA: '@verification_data',
  CURRENT_STEP: '@current_step',
  AUTO_SAVE_TIMESTAMP: '@auto_save_timestamp',
  SUBMISSION_STATUS: '@submission_status',
};

// Verification steps with enhanced data
interface VerificationStepData {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending' | 'verified';
  level: VerificationLevel;
  icon?: LucideIcon;
  order: number;
  required?: boolean;
  estimatedTime?: string;
  formFields?: string[];
}

const verificationSteps: VerificationStepData[] = [
  {
    id: 'personal',
    title: 'Personal',
    description: 'Basic details',
    status: 'completed',
    level: 1,
    icon: User,
    order: 1,
    required: true,
    estimatedTime: '2-3 min',
    formFields: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth']
  },
  {
    id: 'identity',
    title: 'Identity',
    description: 'ID Verification',
    status: 'completed',
    level: 1,
    icon: FileText,
    order: 2,
    required: true,
    estimatedTime: '5-10 min',
    formFields: ['idType', 'idNumber', 'expiryDate']
  },
  {
    id: 'address',
    title: 'Address',
    description: 'Proof of address',
    status: 'current',
    level: 2,
    icon: Home,
    order: 3,
    required: true,
    estimatedTime: '5-7 min',
    formFields: ['address', 'city', 'postalCode']
  },
  {
    id: 'financial',
    title: 'Financial',
    description: 'Income & bank',
    status: 'pending',
    level: 2,
    icon: CreditCard,
    order: 4,
    required: true,
    estimatedTime: '3-5 min',
    formFields: ['occupation', 'monthlyIncome', 'incomeSource', 'bankName', 'accountNumber']
  },
  {
    id: 'business',
    title: 'Business',
    description: 'Optional details',
    status: 'pending',
    level: 3,
    icon: Building,
    order: 5,
    required: false,
    estimatedTime: '10-15 min',
    formFields: ['businessName', 'businessType', 'registrationNumber', 'businessAddress']
  },
];

// Enhanced benefits with icons
const benefitsData = [
  { level: 1, title: 'Basic Transactions', unlocked: true, icon: 'Shield' },
  { level: 1, title: 'KES 50,000 Daily Limit', unlocked: true, icon: 'CreditCard' },
  { level: 2, title: 'KES 150,000 Daily Limit', unlocked: false, icon: 'BarChart' },
  { level: 2, title: 'Create Groups', unlocked: false, icon: 'Globe' },
  { level: 3, title: 'Unlimited Transactions', unlocked: false, icon: 'Award' },
];

// Helper function to convert string array to option objects
const createOptions = (options: string[]) => 
  options.map(option => ({
    label: option,
    value: option.toLowerCase().replace(/[^a-z0-9]/g, '_'),
  }));

// Complete form steps configuration with all fields
const formSteps: FormStep[] = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Enter your basic personal details',
    fields: [
      {
        id: 'firstName',
        label: 'First Name',
        type: 'text',
        required: true,
        validation: { minLength: 2, maxLength: 50 },
        placeholder: 'Enter your first name',
      },
      {
        id: 'lastName',
        label: 'Last Name',
        type: 'text',
        required: true,
        validation: { minLength: 2, maxLength: 50 },
        placeholder: 'Enter your last name',
      },
      {
        id: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        validation: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        placeholder: 'Enter your email address',
      },
      {
        id: 'phone',
        label: 'Phone Number',
        type: 'phone',
        required: true,
        validation: { minLength: 10, maxLength: 15 },
        placeholder: 'Enter your phone number',
      },
      {
        id: 'dateOfBirth',
        label: 'Date of Birth',
        type: 'date',
        required: true,
        placeholder: 'Select your date of birth',
      },
    ],
  },
  {
    id: 'identity',
    title: 'Identity Verification',
    description: 'Verify your identity with official documents',
    requiredDocuments: ['id_front', 'id_back', 'selfie'],
    fields: [
      {
        id: 'idType',
        label: 'ID Type',
        type: 'select',
        required: true,
        options: createOptions(['National ID', 'Passport', 'Driver\'s License']),
        placeholder: 'Select ID type',
      },
      {
        id: 'idNumber',
        label: 'ID Number',
        type: 'text',
        required: true,
        validation: { minLength: 5, maxLength: 20 },
        placeholder: 'Enter your ID number',
      },
      {
        id: 'expiryDate',
        label: 'Expiry Date',
        type: 'date',
        required: false,
        placeholder: 'Select expiry date (if any)',
      },
    ],
  },
  {
    id: 'address',
    title: 'Address Proof',
    description: 'Provide proof of your current address',
    requiredDocuments: ['utility_bill', 'bank_statement'],
    fields: [
      {
        id: 'address',
        label: 'Full Address',
        type: 'textarea',
        required: true,
        validation: { minLength: 10, maxLength: 200 },
        placeholder: 'Enter your full address',
      },
      {
        id: 'city',
        label: 'City/Town',
        type: 'text',
        required: true,
        validation: { minLength: 2, maxLength: 50 },
        placeholder: 'Enter your city or town',
      },
      {
        id: 'postalCode',
        label: 'Postal Code',
        type: 'text',
        required: true,
        validation: { minLength: 3, maxLength: 10 },
        placeholder: 'Enter your postal code',
      },
    ],
  },
  {
    id: 'financial',
    title: 'Financial Information',
    description: 'Provide your income and bank details',
    fields: [
      {
        id: 'occupation',
        label: 'Occupation',
        type: 'text',
        required: true,
        validation: { minLength: 2, maxLength: 50 },
        placeholder: 'Enter your occupation',
      },
      {
        id: 'monthlyIncome',
        label: 'Monthly Income (KES)',
        type: 'number',
        required: true,
        placeholder: 'Enter your monthly income',
        prefix: 'KES ',
      },
      {
        id: 'incomeSource',
        label: 'Source of Income',
        type: 'select',
        required: true,
        options: createOptions(['Employment', 'Business', 'Investments', 'Other']),
        placeholder: 'Select income source',
      },
      {
        id: 'bankName',
        label: 'Bank Name',
        type: 'text',
        required: true,
        validation: { minLength: 2, maxLength: 50 },
        placeholder: 'Enter your bank name',
      },
      {
        id: 'accountNumber',
        label: 'Account Number',
        type: 'text',
        required: true,
        validation: { minLength: 5, maxLength: 20 },
        placeholder: 'Enter your account number',
      },
    ],
  },
  {
    id: 'business',
    title: 'Business Details',
    description: 'Business registration information (Optional)',
    fields: [
      {
        id: 'businessName',
        label: 'Business Name',
        type: 'text',
        required: false,
        validation: { maxLength: 100 },
        placeholder: 'Enter business name',
      },
      {
        id: 'businessType',
        label: 'Business Type',
        type: 'select',
        required: false,
        options: createOptions(['Sole Proprietorship', 'Partnership', 'Limited Company', 'Other']),
        placeholder: 'Select business type',
      },
      {
        id: 'registrationNumber',
        label: 'Registration Number',
        type: 'text',
        required: false,
        validation: { maxLength: 20 },
        placeholder: 'Enter registration number',
      },
      {
        id: 'businessAddress',
        label: 'Business Address',
        type: 'textarea',
        required: false,
        validation: { maxLength: 200 },
        placeholder: 'Enter business address',
      },
    ],
  },
];

// Custom VerificationForm with enhanced features
interface CustomVerificationFormProps {
  steps: FormStep[];
  initialData: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<{ success: boolean; message: string; }>;
  onSaveDraft: (data: Record<string, any>) => Promise<void>;
  verificationSteps: VerificationStepData[];
  currentStepIndex: number;
  onStepPress: (index: number) => void;
  onComplete: () => void;
}

const CustomVerificationForm: React.FC<CustomVerificationFormProps> = ({
  steps,
  initialData,
  onSubmit,
  onSaveDraft,
  verificationSteps,
  currentStepIndex,
  onStepPress,
  onComplete,
}) => {
  const [formData, setFormData] = useState(initialData);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [showAllFields, setShowAllFields] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const currentStep = steps[0]; // Single step form
  const totalFields = currentStep.fields.length;
  const isLastField = currentFieldIndex === totalFields - 1;
  const isLastStep = currentStepIndex === verificationSteps.length - 1;

  // Check if current field is valid
  const isCurrentFieldValid = () => {
    const field = currentStep.fields[currentFieldIndex];
    const value = formData[field.id];
    
    if (field.required && (value === undefined || value === null || value === '')) {
      return false;
    }
    
    if (field.validation) {
      if (field.validation.minLength && String(value).length < field.validation.minLength) return false;
      if (field.validation.maxLength && String(value).length > field.validation.maxLength) return false;
      if (field.validation.pattern && !field.validation.pattern.test(String(value))) return false;
    }
    
    return true;
  };

  // Check if all required fields in step are completed
  const isStepComplete = () => {
    const requiredFields = currentStep.fields.filter(field => field.required);
    
    return requiredFields.every(field => {
      const value = formData[field.id];
      if (value === undefined || value === null || value === '') return false;
      
      if (field.validation) {
        if (field.validation.minLength && String(value).length < field.validation.minLength) return false;
        if (field.validation.maxLength && String(value).length > field.validation.maxLength) return false;
        if (field.validation.pattern && !field.validation.pattern.test(String(value))) return false;
      }
      
      return true;
    });
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // Auto-save draft
    setTimeout(() => onSaveDraft({ ...formData, [fieldId]: value }), 500);
  };

  const handleNextField = () => {
    if (currentFieldIndex < totalFields - 1) {
      setCurrentFieldIndex(prev => prev + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (!isLastStep) {
      // Move to next step
      onStepPress(currentStepIndex + 1);
    }
  };

  const handlePreviousField = () => {
    if (currentFieldIndex > 0) {
      setCurrentFieldIndex(prev => prev - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (currentStepIndex > 0) {
      // Move to previous step
      onStepPress(currentStepIndex - 1);
    }
  };

  const handleSubmitStep = async () => {
    const result = await onSubmit(formData);
    if (result.success) {
      if (isLastStep) {
        onComplete();
      } else {
        onStepPress(currentStepIndex + 1);
      }
    }
    return result;
  };

  const renderStepIndicator = (step: VerificationStepData, index: number) => {
    const isActive = index === currentStepIndex;
    const isCompleted = step.status === 'completed' || step.status === 'verified';
    const isPending = step.status === 'pending';
    
    return (
      <TouchableOpacity
        key={step.id}
        style={[
          styles.stepIndicator,
          isActive && styles.stepIndicatorActive,
          isCompleted && styles.stepIndicatorCompleted,
          isPending && styles.stepIndicatorPending,
        ]}
        onPress={() => index <= currentStepIndex && onStepPress(index)}
        disabled={isPending || index > currentStepIndex}
        activeOpacity={0.7}
      >
        <View style={[
          styles.stepIconContainer,
          isActive && styles.stepIconContainerActive,
          isCompleted && styles.stepIconContainerCompleted,
        ]}>
          {isCompleted ? (
            <CheckCircle size={20} color={Colors.neutral.white} />
          ) : step.icon ? (
            <step.icon 
              size={20} 
              color={
                isActive ? Colors.primary.blue :
                isCompleted ? Colors.neutral.white :
                Colors.neutral.gray400
              } 
            />
          ) : (
            <Text style={[
              styles.stepNumber,
              isActive && styles.stepNumberActive,
              isCompleted && styles.stepNumberCompleted,
            ]}>
              {step.order}
            </Text>
          )}
        </View>
        
        <View style={styles.stepTextContainer}>
          <Text style={[
            styles.stepTitle,
            isActive && styles.stepTitleActive,
            isCompleted && styles.stepTitleCompleted,
            isPending && styles.stepTitlePending,
          ]}>
            {step.title}
          </Text>
          <Text style={[
            styles.stepDescription,
            isPending && styles.stepDescriptionPending,
          ]}>
            {step.description}
          </Text>
        </View>
        
        {isActive && (
          <View style={styles.activeIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  // Render single field at a time (or all if showAllFields is true)
  const renderFields = () => {
    if (showAllFields) {
      return (
        <View style={styles.allFieldsContainer}>
          {currentStep.fields.map((field, index) => (
            <View key={field.id} style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{field.label}{field.required && ' *'}</Text>
              {/* Simplified field rendering - in practice you'd use your form components */}
              <View style={styles.fieldValueContainer}>
                <Text style={styles.fieldValue}>
                  {formData[field.id] || 'Not provided'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      );
    }

    const field = currentStep.fields[currentFieldIndex];
    return (
      <View style={styles.singleFieldContainer}>
        <View style={styles.fieldHeader}>
          <Text style={styles.fieldNumber}>
            Field {currentFieldIndex + 1} of {totalFields}
          </Text>
          <TouchableOpacity onPress={() => setShowAllFields(true)} style={styles.viewAllButton}>
            <Eye size={16} color={Colors.primary.blue} />
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.fieldContent}>
          <Text style={styles.fieldLabel}>{field.label}{field.required && ' *'}</Text>
          <Text style={styles.fieldDescription}>{field.placeholder}</Text>
          
          {/* Simplified field input - in practice you'd use your form components */}
          <View style={styles.fieldInputContainer}>
            <Text style={styles.fieldInput}>
              {formData[field.id] || 'Tap to enter...'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.formContainer}>
      {/* Enhanced Horizontal Steps */}
      <View style={styles.stepsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.stepsScrollView}
          contentContainerStyle={styles.stepsContent}
        >
          {verificationSteps.map(renderStepIndicator)}
        </ScrollView>
        
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: `${((currentStepIndex + 1) / verificationSteps.length) * 100}%`,
                },
              ]}
            />
          </View>
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressText}>
              Level {verificationSteps[currentStepIndex].level} • Step {currentStepIndex + 1}/{verificationSteps.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Form Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.formContent}
        showsVerticalScrollIndicator={false}
      >
        {renderFields()}
      </ScrollView>

      {/* Navigation Buttons - Fixed at bottom of form */}
      <View style={styles.navigationContainer}>
        <View style={styles.navButtonsRow}>
          {(currentFieldIndex > 0 || currentStepIndex > 0) && (
            <TouchableOpacity
              style={styles.navButton}
              onPress={handlePreviousField}
            >
              <ArrowLeft size={20} color={Colors.primary.blue} />
              <Text style={styles.navButtonText}>
                {currentFieldIndex > 0 ? 'Previous Field' : 'Previous Step'}
              </Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.navSpacer} />
          
          {!showAllFields && (
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.nextButton,
                !isCurrentFieldValid() && styles.nextButtonDisabled
              ]}
              onPress={isLastField && isLastStep ? handleSubmitStep : handleNextField}
              disabled={!isCurrentFieldValid()}
            >
              <Text style={[styles.navButtonText, styles.nextButtonText]}>
                {isLastField && isLastStep ? 'Complete Verification' : 'Next'}
              </Text>
              {!(isLastField && isLastStep) && (
                <ArrowLeft size={20} color={Colors.neutral.white} style={styles.nextIcon} />
              )}
            </TouchableOpacity>
          )}
          
          {showAllFields && (
            <TouchableOpacity
              style={[styles.navButton, styles.nextButton]}
              onPress={() => setShowAllFields(false)}
            >
              <Text style={[styles.navButtonText, styles.nextButtonText]}>
                Back to Field View
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {showAllFields && isStepComplete() && (
          <TouchableOpacity
            style={[styles.navButton, styles.completeButton]}
            onPress={handleSubmitStep}
          >
            <CheckCircle size={20} color={Colors.neutral.white} />
            <Text style={[styles.navButtonText, styles.completeButtonText]}>
              {isLastStep ? 'Submit All Information' : 'Complete This Step'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// View Details Modal Component
interface ViewDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  formData: Record<string, any>;
  verificationSteps: VerificationStepData[];
  onEdit: (stepId: string) => void;
}

const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({
  visible,
  onClose,
  formData,
  verificationSteps,
  onEdit,
}) => {
  const getStepFields = (stepId: string) => {
    const step = formSteps.find(s => s.id === stepId);
    return step?.fields || [];
  };

  const renderStepDetails = (step: VerificationStepData) => {
    const fields = getStepFields(step.id);
    
    return (
      <View key={step.id} style={styles.stepDetailsCard}>
        <View style={styles.stepDetailsHeader}>
          <View style={styles.stepDetailsIcon}>
            {step.icon && <step.icon size={24} color={Colors.primary.blue} />}
          </View>
          <View style={styles.stepDetailsTitles}>
            <Text style={styles.stepDetailsTitle}>{step.title}</Text>
            <Text style={styles.stepDetailsDescription}>{step.description}</Text>
          </View>
          <View style={styles.stepStatusBadge}>
            {step.status === 'verified' && (
              <>
                <CheckCircle size={16} color={Colors.status.verifiedGreen} />
                <Text style={styles.verifiedText}>Verified</Text>
              </>
            )}
            {step.status === 'completed' && (
              <Text style={styles.completedText}>Completed</Text>
            )}
          </View>
        </View>
        
        <View style={styles.stepFieldsContainer}>
          {fields.map(field => (
            <View key={field.id} style={styles.detailField}>
              <Text style={styles.detailFieldLabel}>{field.label}:</Text>
              <Text style={styles.detailFieldValue}>
                {formData[field.id] || 'Not provided'}
              </Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEdit(step.id)}
        >
          <Edit size={16} color={Colors.primary.blue} />
          <Text style={styles.editButtonText}>Edit Information</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Verification Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <ArrowLeft size={24} color={Colors.neutral.gray900} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              All submitted information for verification
            </Text>
            
            {verificationSteps.map(renderStepDetails)}
            
            <View style={styles.modalFooter}>
              <Text style={styles.modalFooterText}>
                For security and integrity, verification information can only be updated periodically.
                Changes may require re-verification.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default function VerificationScreen() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(2);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isVerificationComplete, setIsVerificationComplete] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const currentStep = verificationSteps[currentStepIndex];
  const completedSteps = verificationSteps.filter(s => s.status === 'completed' || s.status === 'verified').length;
  const totalSteps = verificationSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  // Calculate current verification level
  const currentLevel: VerificationLevel = completedSteps >= 5 ? 3 : completedSteps >= 3 ? 2 : 1;
  
  // Determine overall verification status
  const getOverallStatus = (): VerificationStatusType => {
    if (isVerificationComplete) return 'verified';
    if (completedSteps === totalSteps) return 'verified';
    if (completedSteps > 0) return 'in_progress';
    return 'not_started';
  };

  // Auto-save form data
  const autoSaveData = useCallback(async () => {
    try {
      const timestamp = Date.now();
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.VERIFICATION_DATA, JSON.stringify(formData)),
        AsyncStorage.setItem(STORAGE_KEYS.CURRENT_STEP, currentStepIndex.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.AUTO_SAVE_TIMESTAMP, timestamp.toString()),
      ]);
      
      setHasUnsavedChanges(false);
    } catch {
      // Silent fail for auto-save
    }
  }, [formData, currentStepIndex]);

  // Load saved data
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        setIsLoading(true);
        const [savedData, savedStep, submissionStatus] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.VERIFICATION_DATA),
          AsyncStorage.getItem(STORAGE_KEYS.CURRENT_STEP),
          AsyncStorage.getItem(STORAGE_KEYS.SUBMISSION_STATUS),
        ]);

        if (savedData) {
          setFormData(JSON.parse(savedData));
        }
        if (savedStep) {
          const stepIndex = parseInt(savedStep);
          if (!isNaN(stepIndex) && stepIndex < verificationSteps.length) {
            setCurrentStepIndex(stepIndex);
          }
        }
        if (submissionStatus === 'complete') {
          setIsVerificationComplete(true);
        }
      } catch {
        // Silent fail for loading
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedData();
  }, []);

  // Auto-save when form data changes
  useEffect(() => {
    if (!isLoading && Object.keys(formData).length > 0) {
      const timer = setTimeout(() => {
        autoSaveData();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [formData, isLoading, autoSaveData]);

  // Animate on step change
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Scroll to top when changing steps
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [currentStepIndex, fadeAnim, slideAnim]);

  // Manual save
  const handleManualSave = async () => {
    try {
      await autoSaveData();
      Alert.alert('Success', 'Your progress has been saved!');
    } catch {
      Alert.alert('Error', 'Failed to save progress. Please try again.');
    }
  };

  // Handle step navigation
  const handleStepPress = (index: number) => {
    const step = verificationSteps[index];
    
    // Allow navigation to completed or current steps
    if (step.status !== 'pending' || index === currentStepIndex) {
      setCurrentStepIndex(index);
    }
  };

  // Handle form submission
  const handleFormSubmit = async (data: Record<string, any>) => {
    try {
      const updatedData = { ...formData, ...data };
      setFormData(updatedData);
      
      // Mark step as completed
      const updatedSteps = [...verificationSteps];
      updatedSteps[currentStepIndex] = {
        ...updatedSteps[currentStepIndex],
        status: 'completed' as const,
      };
      
      // If this is the last step, mark as verified
      if (currentStepIndex === verificationSteps.length - 1) {
        updatedSteps[currentStepIndex].status = 'verified';
        setIsVerificationComplete(true);
        await AsyncStorage.setItem(STORAGE_KEYS.SUBMISSION_STATUS, 'complete');
      } else {
        // Move to next step
        const nextStepIndex = currentStepIndex + 1;
        updatedSteps[nextStepIndex] = {
          ...updatedSteps[nextStepIndex],
          status: 'current' as const,
        };
      }
      
      // Save to storage
      await autoSaveData();
      
      return { success: true, message: 'Step completed successfully!' };
    } catch {
      return { success: false, message: 'Failed to submit. Please try again.' };
    }
  };

  // Handle draft save
  const handleSaveDraft = async (data: Record<string, any>) => {
    try {
      const updatedData = { ...formData, ...data };
      setFormData(updatedData);
      await autoSaveData();
    } catch {
      // Silent fail for draft save
    }
  };

  // Handle edit from details modal
  const handleEditStep = (stepId: string) => {
    const stepIndex = verificationSteps.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      setCurrentStepIndex(stepIndex);
      setShowDetailsModal(false);
    }
  };

  // Handle verification completion
  const handleVerificationComplete = () => {
    Alert.alert(
      'Verification Complete!',
      'Your verification has been submitted successfully. Our team will review your information shortly.',
      [
        {
          text: 'View Details',
          onPress: () => setShowDetailsModal(true)
        },
        {
          text: 'OK',
          style: 'default'
        }
      ]
    );
  };

  // Handle document upload
  const handleDocumentUpload = () => {
    console.log('Document uploaded');
    setHasUnsavedChanges(true);
  };

  // Handle level press
  const handleLevelPress = (level: VerificationLevel) => {
    console.log('Level pressed:', level);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your verification progress...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Verification',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={Colors.neutral.gray900} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              {hasUnsavedChanges && (
                <View style={styles.unsavedBadge}>
                  <AlertCircle size={12} color={Colors.primary.red} />
                </View>
              )}
              <TouchableOpacity onPress={handleManualSave} style={styles.saveButton}>
                <Save size={20} color={Colors.primary.blue} />
              </TouchableOpacity>
              {(isVerificationComplete || completedSteps > 0) && (
                <TouchableOpacity 
                  onPress={() => setShowDetailsModal(true)} 
                  style={styles.viewDetailsButton}
                >
                  <Eye size={20} color={Colors.primary.blue} />
                </TouchableOpacity>
              )}
            </View>
          ),
        }}
      />

      {/* Main Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Verification Status Overview */}
          <VerificationStatus
            currentLevel={currentLevel}
            progressPercentage={progressPercentage}
            status={getOverallStatus()}
            completedSteps={completedSteps}
            totalSteps={totalSteps}
            nextLevelUnlockAt={4}
            onLevelPress={handleLevelPress}
          />

          {/* Current Step Form with Enhanced Navigation */}
          <Card style={styles.currentStepCard}>
            <View style={styles.currentStepHeader}>
              <View style={styles.currentStepIcon}>
                {currentStep.icon && (
                  <currentStep.icon size={24} color={Colors.primary.blue} />
                )}
              </View>
              <View style={styles.currentStepTitles}>
                <Text style={styles.currentStepTitle}>
                  {verificationSteps[currentStepIndex].title}
                </Text>
                <Text style={styles.currentStepDescription}>
                  {verificationSteps[currentStepIndex].description}
                </Text>
              </View>
              <Badge
                text={`Level ${currentStep.level}`}
                variant={currentStep.level === 1 ? 'success' : currentStep.level === 2 ? 'info' : 'premium'}
              />
            </View>

            {/* Enhanced Form with Field-by-Field Navigation */}
            <CustomVerificationForm
              steps={[formSteps[currentStepIndex]]}
              initialData={formData}
              onSubmit={handleFormSubmit}
              onSaveDraft={handleSaveDraft}
              verificationSteps={verificationSteps}
              currentStepIndex={currentStepIndex}
              onStepPress={handleStepPress}
              onComplete={handleVerificationComplete}
            />
          </Card>

          {/* Document Uploader Section (for address step) */}
          {currentStep.id === 'address' && currentStep.status === 'current' && (
            <View style={styles.documentUploaderSection}>
              <Text style={styles.sectionTitle}>Upload Required Documents</Text>
              <DocumentUploader
                title="Utility Bill"
                description="Recent utility bill (electricity, water, gas)"
                documentType="utility_bill"
                required={true}
                maxSizeMB={5}
                onUploadComplete={handleDocumentUpload}
                onUploadError={() => console.error('Upload error')}
              />
              <DocumentUploader
                title="Bank Statement"
                description="Recent bank statement showing your address"
                documentType="bank_statement"
                required={true}
                maxSizeMB={5}
                onUploadComplete={handleDocumentUpload}
                onUploadError={() => console.error('Upload error')}
              />
            </View>
          )}

          {/* Benefits Section */}
          <Card style={styles.benefitsCard}>
            <View style={styles.benefitsHeader}>
              <Award size={24} color={Colors.primary.blue} />
              <Text style={styles.benefitsTitle}>Verification Benefits</Text>
            </View>
            
            <View style={styles.benefitsGrid}>
              <View style={styles.benefitItem}>
                <View style={[styles.benefitLevelBadge, { backgroundColor: Colors.status.verifiedGreen }]}>
                  <Text style={styles.benefitLevelText}>L1</Text>
                </View>
                <Text style={styles.benefitItemText}>KES 50,000 daily limit</Text>
                <CheckCircle size={16} color={Colors.status.verifiedGreen} />
              </View>
              
              <View style={styles.benefitItem}>
                <View style={[styles.benefitLevelBadge, { backgroundColor: Colors.primary.blue }]}>
                  <Text style={styles.benefitLevelText}>L2</Text>
                </View>
                <Text style={styles.benefitItemText}>KES 150,000 daily limit</Text>
                {currentLevel >= 2 ? (
                  <CheckCircle size={16} color={Colors.status.verifiedGreen} />
                ) : (
                  <Text style={styles.benefitLockedText}>Locked</Text>
                )}
              </View>
              
              <View style={styles.benefitItem}>
                <View style={[styles.benefitLevelBadge, { backgroundColor: Colors.status.premiumPurple }]}>
                  <Text style={styles.benefitLevelText}>L3</Text>
                </View>
                <Text style={styles.benefitItemText}>Unlimited transactions</Text>
                {currentLevel >= 3 ? (
                  <CheckCircle size={16} color={Colors.status.verifiedGreen} />
                ) : (
                  <Text style={styles.benefitLockedText}>Locked</Text>
                )}
              </View>
            </View>
          </Card>

          <View style={styles.footer} />
        </Animated.View>
      </ScrollView>

      {/* View Details Modal */}
      <ViewDetailsModal
        visible={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        formData={formData}
        verificationSteps={verificationSteps}
        onEdit={handleEditStep}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.gray50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral.gray50,
  },
  loadingText: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray700,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginRight: Spacing.sm,
  },
  unsavedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary.red + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    padding: Spacing.xs,
  },
  viewDetailsButton: {
    padding: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  currentStepCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    ...Shadows.level2,
  },
  currentStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  currentStepIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  currentStepTitles: {
    flex: 1,
  },
  currentStepTitle: {
    ...Typography.heading2,
    color: Colors.neutral.gray900,
    marginBottom: 2,
  },
  currentStepDescription: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
  },
  // Form Container
  formContainer: {
    minHeight: 400,
  },
  stepsContainer: {
    marginBottom: Spacing.lg,
  },
  stepsScrollView: {
    height: 90,
  },
  stepsContent: {
    paddingBottom: Spacing.sm,
    alignItems: 'center',
  },
  stepIndicator: {
    width: 85,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
    position: 'relative',
    backgroundColor: Colors.neutral.gray50,
    borderWidth: 2,
    borderColor: Colors.neutral.gray200,
  },
  stepIndicatorActive: {
    backgroundColor: Colors.primary.blue + '10',
    borderColor: Colors.primary.blue,
    ...Shadows.level1,
  },
  stepIndicatorCompleted: {
    backgroundColor: Colors.status.verifiedGreen + '10',
    borderColor: Colors.status.verifiedGreen,
    ...Shadows.level1,
  },
  stepIndicatorPending: {
    opacity: 0.5,
    backgroundColor: Colors.neutral.gray100,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    borderWidth: 2,
    borderColor: Colors.neutral.gray200,
  },
  stepIconContainerActive: {
    backgroundColor: Colors.primary.blue,
    borderColor: Colors.primary.blue,
  },
  stepIconContainerCompleted: {
    backgroundColor: Colors.status.verifiedGreen,
    borderColor: Colors.status.verifiedGreen,
  },
  stepNumber: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray700,
    fontWeight: '700',
  },
  stepNumberActive: {
    color: Colors.neutral.white,
  },
  stepNumberCompleted: {
    color: Colors.neutral.white,
  },
  stepTextContainer: {
    alignItems: 'center',
  },
  stepTitle: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray900,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  stepTitleActive: {
    color: Colors.primary.blue,
  },
  stepTitleCompleted: {
    color: Colors.status.verifiedGreen,
  },
  stepTitlePending: {
    color: Colors.neutral.gray500,
  },
  stepDescription: {
    ...Typography.caption,
    color: Colors.neutral.gray700,
    textAlign: 'center',
    fontSize: 10,
  },
  stepDescriptionPending: {
    color: Colors.neutral.gray500,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary.blue,
    borderWidth: 2,
    borderColor: Colors.neutral.white,
  },
  progressContainer: {
    marginTop: Spacing.md,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary.blue,
    borderRadius: BorderRadius.xs,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    ...Typography.caption,
    color: Colors.neutral.gray700,
    fontWeight: '500',
  },
  formContent: {
    flex: 1,
    marginBottom: Spacing.lg,
  },
  singleFieldContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    ...Shadows.level1,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  fieldNumber: {
    ...Typography.bodySmall,
    color: Colors.primary.blue,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  viewAllText: {
    ...Typography.caption,
    color: Colors.primary.blue,
    fontWeight: '500',
  },
  fieldContent: {
    gap: Spacing.md,
  },
  fieldLabel: {
    ...Typography.heading3,
    color: Colors.neutral.gray900,
    fontWeight: '600',
  },
  fieldDescription: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
    marginBottom: Spacing.md,
  },
  fieldInputContainer: {
    backgroundColor: Colors.neutral.gray50,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
    minHeight: 100,
  },
  fieldInput: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray800,
  },
  allFieldsContainer: {
    gap: Spacing.lg,
  },
  fieldContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadows.level1,
  },
  fieldValueContainer: {
    backgroundColor: Colors.neutral.gray50,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  fieldValue: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray800,
  },
  navigationContainer: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  navButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.primary.blue,
    backgroundColor: Colors.neutral.white,
    minWidth: 140,
    justifyContent: 'center',
  },
  nextButton: {
    backgroundColor: Colors.primary.blue,
    borderColor: Colors.primary.blue,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.neutral.gray300,
    borderColor: Colors.neutral.gray300,
    opacity: 0.6,
  },
  completeButton: {
    backgroundColor: Colors.status.verifiedGreen,
    borderColor: Colors.status.verifiedGreen,
    width: '100%',
  },
  navButtonText: {
    ...Typography.bodyMedium,
    color: Colors.primary.blue,
    fontWeight: '600',
  },
  nextButtonText: {
    color: Colors.neutral.white,
  },
  completeButtonText: {
    color: Colors.neutral.white,
  },
  nextIcon: {
    transform: [{ rotate: '180deg' }],
  },
  navSpacer: {
    flex: 1,
  },
  pendingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.neutral.gray100,
    borderRadius: BorderRadius.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray200,
  },
  pendingMessageText: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
    flex: 1,
  },
  documentUploaderSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.heading2,
    color: Colors.neutral.gray900,
    marginBottom: Spacing.md,
  },
  // Benefits Section
  benefitsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.level2,
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  benefitsTitle: {
    ...Typography.heading2,
    color: Colors.neutral.gray900,
  },
  benefitsGrid: {
    gap: Spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.neutral.gray50,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
  },
  benefitLevelBadge: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitLevelText: {
    ...Typography.bodySmall,
    color: Colors.neutral.white,
    fontWeight: '700',
  },
  benefitItemText: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray900,
    flex: 1,
  },
  benefitLockedText: {
    ...Typography.caption,
    color: Colors.neutral.gray500,
    fontStyle: 'italic',
  },
  footer: {
    height: Spacing.xl,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray200,
  },
  modalTitle: {
    ...Typography.heading1,
    color: Colors.neutral.gray900,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  modalContent: {
    padding: Spacing.lg,
  },
  modalSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray700,
    marginBottom: Spacing.lg,
  },
  stepDetailsCard: {
    backgroundColor: Colors.neutral.gray50,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
  },
  stepDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  stepDetailsIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
  },
  stepDetailsTitles: {
    flex: 1,
  },
  stepDetailsTitle: {
    ...Typography.heading3,
    color: Colors.neutral.gray900,
    marginBottom: 2,
  },
  stepDetailsDescription: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
  },
  stepStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.status.verifiedGreen + '20',
    borderRadius: BorderRadius.sm,
  },
  verifiedText: {
    ...Typography.caption,
    color: Colors.status.verifiedGreen,
    fontWeight: '600',
  },
  completedText: {
    ...Typography.caption,
    color: Colors.primary.blue,
    fontWeight: '600',
  },
  stepFieldsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  detailField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray200,
  },
  detailFieldLabel: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray700,
    fontWeight: '500',
    flex: 1,
  },
  detailFieldValue: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray900,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary.blue,
  },
  editButtonText: {
    ...Typography.bodySmall,
    color: Colors.primary.blue,
    fontWeight: '600',
  },
  modalFooter: {
    padding: Spacing.lg,
    backgroundColor: Colors.neutral.gray50,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  modalFooterText: {
    ...Typography.caption,
    color: Colors.neutral.gray600,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});