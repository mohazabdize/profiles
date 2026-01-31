/**
 * Verification Screen - Fully Scrollable Version
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
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
  Shield,
  CheckCircle,
  LucideIcon,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/colors';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';

// Import new verification components
import { VerificationStep, VerificationStepStatus } from '@/components/profile/verification/VerificationStep';
import { VerificationStatus, VerificationStatusType, VerificationLevel } from '@/components/profile/verification/VerificationStatus';
import { VerificationForm, FormStep } from '@/components/profile/verification/VerificationForm';
import { DocumentUploader } from '@/components/profile/verification/DocumentUploader';

// Updated verification steps interface
interface VerificationStepData {
  id: string;
  title: string;
  description: string;
  status: VerificationStepStatus;
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
    title: 'Personal Information',
    description: 'Basic details and contact information',
    status: 'completed',
    level: 1,
    icon: User,
    order: 1,
    required: true,
    estimatedTime: '2-3 minutes',
  },
  {
    id: 'identity',
    title: 'Identity Verification',
    description: 'National ID or Passport',
    status: 'completed',
    level: 1,
    icon: FileText,
    order: 2,
    required: true,
    estimatedTime: '5-10 minutes',
  },
  {
    id: 'address',
    title: 'Address Proof',
    description: 'Utility bill or bank statement',
    status: 'current',
    level: 2,
    icon: Home,
    order: 3,
    required: true,
    estimatedTime: '5-7 minutes',
  },
  {
    id: 'financial',
    title: 'Financial Information',
    description: 'Income source and bank details',
    status: 'pending',
    level: 2,
    icon: Briefcase,
    order: 4,
    required: true,
    estimatedTime: '3-5 minutes',
  },
  {
    id: 'business',
    title: 'Business Details',
    description: 'Business registration (optional)',
    status: 'pending',
    level: 3,
    icon: Building,
    order: 5,
    required: false,
    estimatedTime: '10-15 minutes',
  },
];

// Benefits data - Fixed type
const benefitsData: { level: VerificationLevel; title: string; unlocked: boolean; icon: string }[] = [
  {
    level: 1,
    title: 'Basic Transactions',
    unlocked: true,
    icon: 'transaction',
  },
  {
    level: 1,
    title: 'KES 50,000 Daily Limit',
    unlocked: true,
    icon: 'limit',
  },
  {
    level: 1,
    title: 'Join Groups',
    unlocked: true,
    icon: 'group',
  },
  {
    level: 2,
    title: 'KES 150,000 Daily Limit',
    unlocked: false,
    icon: 'limit',
  },
  {
    level: 2,
    title: 'Create Groups',
    unlocked: false,
    icon: 'group',
  },
  {
    level: 2,
    title: 'Advanced Analytics',
    unlocked: false,
    icon: 'analytics',
  },
  {
    level: 3,
    title: 'Unlimited Transactions',
    unlocked: false,
    icon: 'unlimited',
  },
  {
    level: 3,
    title: 'Business Features',
    unlocked: false,
    icon: 'business',
  },
  {
    level: 3,
    title: 'Priority Support',
    unlocked: false,
    icon: 'support',
  },
];

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
        validation: {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
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
        options: ['National ID', 'Passport', 'Driver\'s License'],
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
        options: ['Employment', 'Business', 'Investments', 'Other'],
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
        options: ['Sole Proprietorship', 'Partnership', 'Limited Company', 'Other'],
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
  const [formData] = useState<Record<string, any>>({});
  const progressAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progressPercentage,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  }, [progressPercentage, progressAnim]);

  // Handle step press
  const handleStepPress = (index: number) => {
    const step = verificationSteps[index];
    if (step.status !== 'pending') {
      setCurrentStepIndex(index);
    }
  };

  // Handle form submission
  const handleFormSubmit = async (data: Record<string, any>) => {
    console.log('Form submitted:', data);
  };

  // Handle draft save
  const handleSaveDraft = async (data: Record<string, any>) => {
    console.log('Draft saved:', data);
  };

  // Handle document upload
  const handleDocumentUpload = () => {
    console.log('Document uploaded');
  };

  // Handle level press
  const handleLevelPress = (level: VerificationLevel) => {
    console.log('Level pressed:', level);
  };

  // Handle benefit press
  const handleBenefitPress = (benefit: { level: VerificationLevel; title: string; unlocked: boolean; icon: string }) => {
    console.log('Benefit pressed:', benefit);
  };

  // Render current step content
  const renderCurrentStepContent = () => {
    if (currentStep.status === 'completed') {
      return (
        <View style={styles.completedMessage}>
          <CheckCircle size={20} color={Colors.status.verifiedGreen} />
          <Text style={styles.completedMessageText}>
            This step has been completed and verified
          </Text>
        </View>
      );
    }

    if (currentStep.status === 'pending') {
      return (
        <View style={styles.pendingMessage}>
          <Award size={20} color={Colors.neutral.gray700} />
          <Text style={styles.pendingMessageText}>
            Complete previous steps to unlock this verification level
          </Text>
        </View>
      );
    }

    // For current step, show the form for that step
    const stepFormConfig = formSteps.find(step => step.id === currentStep.id);
    if (stepFormConfig) {
      return (
        <VerificationForm
          steps={[stepFormConfig]}
          initialData={formData}
          onSubmit={handleFormSubmit}
          onSaveDraft={handleSaveDraft}
          showProgress={false}
        />
      );
    }

    return null;
  };

  // Filter benefits for current level
  const currentBenefits = benefitsData
    .filter(benefit => benefit.level <= currentLevel)
    .map(benefit => ({
      ...benefit,
      unlocked: benefit.level === currentLevel ? benefit.unlocked : true
    }));

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Verification',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={Colors.neutral.gray900} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Main ScrollView containing everything */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Verification Status Overview - Now inside ScrollView */}
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

        {/* Verification Steps Timeline */}
        <View style={styles.stepsContainer}>
          {verificationSteps.map((step, index) => (
            <VerificationStep
              key={step.id}
              id={step.id}
              title={step.title}
              description={step.description}
              status={step.status}
              icon={step.icon}
              level={step.level}
              order={step.order}
              isLast={index === verificationSteps.length - 1}
              onPress={() => handleStepPress(index)}
              required={step.required}
              estimatedTime={step.estimatedTime}
            />
          ))}
        </View>

        {/* Current Step Details */}
        {currentStep && (
          <View style={styles.currentStepSection}>
            <Card style={styles.currentStepCard}>
              <View style={styles.currentStepHeader}>
                <View style={styles.currentStepIcon}>
                  {currentStep.icon && (
                    <currentStep.icon size={24} color={Colors.primary.blue} />
                  )}
                </View>
                <View style={styles.currentStepTitles}>
                  <Text style={styles.currentStepTitle}>{currentStep.title}</Text>
                  <Text style={styles.currentStepDescription}>
                    {currentStep.description}
                  </Text>
                </View>
                <Badge
                  text={`Level ${currentStep.level}`}
                  variant={currentStep.level === 1 ? 'success' : currentStep.level === 2 ? 'info' : 'premium'}
                />
              </View>

              {renderCurrentStepContent()}
            </Card>
          </View>
        )}

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
              onUploadError={(error) => console.error('Upload error:', error)}
            />
            <DocumentUploader
              title="Bank Statement"
              description="Recent bank statement showing your address"
              documentType="bank_statement"
              required={true}
              maxSizeMB={5}
              onUploadComplete={handleDocumentUpload}
              onUploadError={(error) => console.error('Upload error:', error)}
            />
          </View>
        )}

        {/* Benefits Overview */}
        <Card style={styles.benefitsCard}>
          <View style={styles.benefitsHeader}>
            <Shield size={24} color={Colors.primary.blue} />
            <Text style={styles.benefitsTitle}>Verification Benefits</Text>
          </View>
          
          <View style={styles.benefitsGrid}>
            <BenefitCard
              level={1}
              title="Basic Tier"
              description="KES 50,000 daily limit"
              unlocked={completedSteps >= 2}
              isCurrent={currentLevel === 1}
            />
            <BenefitCard
              level={2}
              title="Advanced Tier"
              description="KES 150,000 daily limit"
              unlocked={completedSteps >= 4}
              isCurrent={currentLevel === 2}
            />
            <BenefitCard
              level={3}
              title="Premium Tier"
              description="Unlimited transactions"
              unlocked={completedSteps >= 5}
              isCurrent={currentLevel === 3}
            />
          </View>

          <TouchableOpacity style={styles.viewAllBenefitsButton}>
            <Text style={styles.viewAllBenefitsText}>View All Benefits</Text>
            <ArrowLeft size={16} color={Colors.primary.blue} style={styles.arrowIcon} />
          </TouchableOpacity>
        </Card>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

// Benefit Card Component
function BenefitCard({
  level,
  title,
  description,
  unlocked,
  isCurrent,
}: {
  level: number;
  title: string;
  description: string;
  unlocked: boolean;
  isCurrent: boolean;
}) {
  return (
    <View style={[styles.benefitCard, unlocked && styles.benefitCardUnlocked]}>
      <View style={styles.benefitHeader}>
        <View style={[styles.benefitLevelBadge, unlocked && styles.benefitLevelBadgeUnlocked]}>
          <Text style={[styles.benefitLevelText, unlocked && styles.benefitLevelTextUnlocked]}>
            L{level}
          </Text>
        </View>
        {unlocked && <CheckCircle size={16} color={Colors.status.verifiedGreen} />}
      </View>
      <Text style={[styles.benefitCardTitle, !unlocked && styles.benefitCardTitleLocked]}>
        {title}
      </Text>
      <Text style={[styles.benefitCardDescription, !unlocked && styles.benefitCardDescriptionLocked]}>
        {description}
      </Text>
      {isCurrent && (
        <View style={styles.currentBadge}>
          <Text style={styles.currentBadgeText}>Current</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.gray50,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  stepsContainer: {
    marginBottom: Spacing.xl,
  },
  currentStepSection: {
    marginBottom: Spacing.xl,
  },
  currentStepCard: {
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
  completedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: '#D1FAE5',
    borderRadius: BorderRadius.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray200,
  },
  completedMessageText: {
    ...Typography.bodySmall,
    color: Colors.status.verifiedGreen,
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
  benefitsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
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
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  benefitCard: {
    flex: 1,
    padding: Spacing.md,
    backgroundColor: Colors.neutral.gray50,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
    position: 'relative',
  },
  benefitCardUnlocked: {
    backgroundColor: '#D1FAE5',
    borderColor: Colors.status.verifiedGreen,
  },
  benefitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  benefitLevelBadge: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.neutral.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitLevelBadgeUnlocked: {
    backgroundColor: Colors.status.verifiedGreen,
  },
  benefitLevelText: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
    fontWeight: '700',
  },
  benefitLevelTextUnlocked: {
    color: Colors.neutral.white,
  },
  benefitCardTitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray900,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  benefitCardTitleLocked: {
    color: Colors.neutral.gray700,
  },
  benefitCardDescription: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
  },
  benefitCardDescriptionLocked: {
    color: Colors.neutral.gray600,
  },
  currentBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.primary.blue,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  currentBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.neutral.white,
    fontWeight: '600',
  },
  viewAllBenefitsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
  },
  viewAllBenefitsText: {
    ...Typography.bodyMedium,
    color: Colors.primary.blue,
    fontWeight: '600',
  },
  arrowIcon: {
    transform: [{ rotate: '180deg' }],
  },
  footer: {
    height: Spacing.lg,
  },
});