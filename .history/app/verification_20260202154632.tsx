/**
 * Verification Screen with Horizontal Navigation
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Alert,
  KeyboardAvoidingView,
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
  LucideIcon,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/colors';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';

// Import new verification components
import { VerificationStatus, VerificationStatusType, VerificationLevel } from '@/components/profile/verification/VerificationStatus';
import { VerificationForm, FormStep } from '@/components/profile/verification/VerificationForm';
import { DocumentUploader } from '@/components/profile/verification/DocumentUploader';

// Storage keys
const STORAGE_KEYS = {
  VERIFICATION_DATA: '@verification_data',
  CURRENT_STEP: '@current_step',
  AUTO_SAVE_TIMESTAMP: '@auto_save_timestamp',
};

// Updated verification steps interface
interface VerificationStepData {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  level: VerificationLevel;
  icon?: LucideIcon;
  order: number;
  required?: boolean;
  estimatedTime?: string;
}

// Sample verification steps data
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
  },
  {
    id: 'financial',
    title: 'Financial',
    description: 'Income & bank',
    status: 'pending',
    level: 2,
    icon: Briefcase,
    order: 4,
    required: true,
    estimatedTime: '3-5 min',
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
  },
];

// Benefits data - Fixed type to match VerificationStatus component
const benefitsData: { level: VerificationLevel; title: string; unlocked: boolean; icon: string }[] = [
  { level: 1, title: 'Basic Transactions', unlocked: true, icon: 'transaction' },
  { level: 1, title: 'KES 50,000 Daily Limit', unlocked: true, icon: 'limit' },
  { level: 2, title: 'KES 150,000 Daily Limit', unlocked: false, icon: 'limit' },
  { level: 2, title: 'Create Groups', unlocked: false, icon: 'group' },
  { level: 3, title: 'Unlimited Transactions', unlocked: false, icon: 'unlimited' },
];

// Helper function to convert string array to option objects
const createOptions = (options: string[]) => 
  options.map(option => ({
    label: option,
    value: option.toLowerCase().replace(/[^a-z0-9]/g, '_'),
  }));

// Form steps configuration
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

export default function VerificationScreen() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(2);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const stepScrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const currentStep = verificationSteps[currentStepIndex];
  const completedSteps = verificationSteps.filter(s => s.status === 'completed').length;
  const totalSteps = verificationSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;
  const nextLevelUnlockAt = 4;

  // Calculate current verification level
  const currentLevel: VerificationLevel = completedSteps >= 5 ? 3 : completedSteps >= 3 ? 2 : 1;
  
  // Determine overall verification status
  const getOverallStatus = (): VerificationStatusType => {
    if (completedSteps === totalSteps) return 'verified';
    if (completedSteps > 0) return 'in_progress';
    return 'not_started';
  };

  // Auto-save form data with useCallback to prevent recreation
  const autoSaveData = useCallback(async () => {
    try {
      const timestamp = Date.now();
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.VERIFICATION_DATA, JSON.stringify(formData)),
        AsyncStorage.setItem(STORAGE_KEYS.CURRENT_STEP, currentStepIndex.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.AUTO_SAVE_TIMESTAMP, timestamp.toString()),
      ]);
      
      setLastSaved(new Date(timestamp).toLocaleTimeString());
      setHasUnsavedChanges(false);
      
      console.log('Auto-saved at:', new Date(timestamp).toLocaleTimeString());
    } catch {
      // Silent fail for auto-save
    }
  }, [formData, currentStepIndex]);

  // Load saved data on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        setIsLoading(true);
        const [savedData, savedStep, savedTimestamp] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.VERIFICATION_DATA),
          AsyncStorage.getItem(STORAGE_KEYS.CURRENT_STEP),
          AsyncStorage.getItem(STORAGE_KEYS.AUTO_SAVE_TIMESTAMP),
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
        if (savedTimestamp) {
          setLastSaved(new Date(parseInt(savedTimestamp)).toLocaleTimeString());
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
      }, 2000); // Auto-save after 2 seconds of inactivity

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

    // Scroll to current step in horizontal scroller
    if (stepScrollRef.current) {
      stepScrollRef.current.scrollTo({
        x: currentStepIndex * 100,
        animated: true,
      });
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
    
    // Allow navigation to any completed or current step
    if (step.status !== 'pending') {
      setCurrentStepIndex(index);
      
      // Scroll to top when changing steps
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
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
      
      // Move to next step if available
      if (currentStepIndex < verificationSteps.length - 1) {
        const nextStepIndex = currentStepIndex + 1;
        updatedSteps[nextStepIndex] = {
          ...updatedSteps[nextStepIndex],
          status: 'current' as const,
        };
        setCurrentStepIndex(nextStepIndex);
      }
      
      // Save to storage
      await autoSaveData();
      
      return { success: true, message: 'Step completed successfully!' };
    } catch {
      return { success: false, message: 'Failed to submit. Please try again.' };
    }
  };

  // Handle draft save - returns void to match VerificationForm props
  const handleSaveDraft = async (data: Record<string, any>) => {
    try {
      const updatedData = { ...formData, ...data };
      setFormData(updatedData);
      await autoSaveData();
      // Return void to match VerificationForm props
    } catch {
      // Silent fail for draft save
    }
  };

  // Handle form data change
  const handleFormChange = (data: Record<string, any>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setHasUnsavedChanges(true);
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

  // Handle benefit press
  const handleBenefitPress = (benefit: { level: VerificationLevel; title: string; unlocked: boolean; icon: string }) => {
    console.log('Benefit pressed:', benefit);
  };

  // Render step indicator
  const renderStepIndicator = (step: VerificationStepData, index: number) => {
    const isActive = index === currentStepIndex;
    const isCompleted = step.status === 'completed';
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
        onPress={() => handleStepPress(index)}
        disabled={isPending}
        activeOpacity={0.7}
      >
        <View style={styles.stepIconContainer}>
          {step.icon ? (
            <step.icon 
              size={20} 
              color={
                isCompleted ? Colors.neutral.white :
                isActive ? Colors.primary.blue :
                Colors.neutral.gray400
              } 
            />
          ) : (
            <Text style={[
              styles.stepNumber,
              isCompleted && styles.stepNumberCompleted,
              isActive && styles.stepNumberActive,
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
        {isCompleted && (
          <CheckCircle size={16} color={Colors.status.verifiedGreen} style={styles.completedIcon} />
        )}
      </TouchableOpacity>
    );
  };

  // Filter benefits for current level
  const currentBenefits = benefitsData
    .filter(benefit => benefit.level <= currentLevel)
    .map(benefit => ({
      ...benefit,
      unlocked: benefit.level === currentLevel ? benefit.unlocked : true
    }));

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
            </View>
          ),
        }}
      />

      {/* Fixed Horizontal Steps Navigation */}
      <View style={styles.stepsHeader}>
        <ScrollView
          ref={stepScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.stepsScrollView}
          contentContainerStyle={styles.stepsContent}
        >
          {verificationSteps.map(renderStepIndicator)}
        </ScrollView>
        
        {/* Auto-save indicator */}
        {lastSaved && (
          <View style={styles.saveStatus}>
            <Text style={styles.saveStatusText}>
              Auto-saved {lastSaved}
            </Text>
          </View>
        )}
      </View>

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
            nextLevelUnlockAt={nextLevelUnlockAt}
            benefits={currentBenefits}
            onLevelPress={handleLevelPress}
            onBenefitPress={handleBenefitPress}
          />

          {/* Current Step Form */}
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

            {/* Current Step Form */}
            {currentStep.status !== 'pending' && (
              <VerificationForm
                steps={[formSteps[currentStepIndex]]}
                initialData={formData}
                onSubmit={handleFormSubmit}
                onSaveDraft={handleSaveDraft}
                onChange={handleFormChange}
                showProgress={false}
                autoSave={true}
              />
            )}

            {currentStep.status === 'pending' && (
              <View style={styles.pendingMessage}>
                <Award size={20} color={Colors.neutral.gray700} />
                <Text style={styles.pendingMessageText}>
                  Complete previous steps to unlock this verification level
                </Text>
              </View>
            )}
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

          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            {currentStepIndex > 0 && (
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => handleStepPress(currentStepIndex - 1)}
              >
                <ArrowLeft size={20} color={Colors.primary.blue} />
                <Text style={styles.navButtonText}>Previous Step</Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.navSpacer} />
            
            {currentStepIndex < verificationSteps.length - 1 && (
              <TouchableOpacity
                style={[styles.navButton, styles.nextButton]}
                onPress={() => handleStepPress(currentStepIndex + 1)}
              >
                <Text style={[styles.navButtonText, styles.nextButtonText]}>Next Step</Text>
                <ArrowLeft size={20} color={Colors.neutral.white} style={styles.nextIcon} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer} />
        </Animated.View>
      </ScrollView>
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
  stepsHeader: {
    backgroundColor: Colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  stepsScrollView: {
    height: 80,
  },
  stepsContent: {
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  saveStatus: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    alignItems: 'center',
  },
  saveStatusText: {
    ...Typography.caption,
    color: Colors.neutral.gray600,
    fontStyle: 'italic',
  },
  stepIndicator: {
    width: 100,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
    position: 'relative',
  },
  stepIndicatorActive: {
    backgroundColor: Colors.primary.blue + '10',
    borderWidth: 1,
    borderColor: Colors.primary.blue,
  },
  stepIndicatorCompleted: {
    backgroundColor: Colors.status.verifiedGreen + '10',
    borderWidth: 1,
    borderColor: Colors.status.verifiedGreen,
  },
  stepIndicatorPending: {
    opacity: 0.6,
  },
  stepIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.neutral.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  stepNumber: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray700,
    fontWeight: '600',
  },
  stepNumberCompleted: {
    color: Colors.neutral.white,
  },
  stepNumberActive: {
    color: Colors.primary.blue,
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
    bottom: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary.blue,
  },
  completedIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
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
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral.gray300,
    backgroundColor: Colors.neutral.white,
  },
  nextButton: {
    backgroundColor: Colors.primary.blue,
    borderColor: Colors.primary.blue,
  },
  navButtonText: {
    ...Typography.bodyMedium,
    color: Colors.primary.blue,
    fontWeight: '600',
  },
  nextButtonText: {
    color: Colors.neutral.white,
  },
  nextIcon: {
    transform: [{ rotate: '180deg' }],
  },
  navSpacer: {
    flex: 1,
  },
  footer: {
    height: Spacing.xl,
  },
});