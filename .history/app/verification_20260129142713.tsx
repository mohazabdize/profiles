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

import { VerificationStep, VerificationStepStatus } from '@/components/profile/verification/VerificationStep';
import { VerificationStatus, VerificationStatusType, VerificationLevel } from '@/components/profile/verification/VerificationStatus';
import { VerificationForm, FormStep } from '@/components/profile/verification/VerificationForm';
import { DocumentUploader } from '@/components/profile/verification/DocumentUploader';

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

const benefitsData: { level: VerificationLevel; title: string; unlocked: boolean; icon: string }[] = [
  { level: 1, title: 'Basic Transactions', unlocked: true, icon: 'transaction' },
  { level: 1, title: 'KES 50,000 Daily Limit', unlocked: true, icon: 'limit' },
  { level: 1, title: 'Join Groups', unlocked: true, icon: 'group' },
  { level: 2, title: 'KES 150,000 Daily Limit', unlocked: false, icon: 'limit' },
  { level: 2, title: 'Create Groups', unlocked: false, icon: 'group' },
  { level: 2, title: 'Advanced Analytics', unlocked: false, icon: 'analytics' },
  { level: 3, title: 'Unlimited Transactions', unlocked: false, icon: 'unlimited' },
  { level: 3, title: 'Business Features', unlocked: false, icon: 'business' },
  { level: 3, title: 'Priority Support', unlocked: false, icon: 'support' },
];

const formSteps: FormStep[] = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Enter your basic personal details',
    fields: [
      { id: 'firstName', label: 'First Name', type: 'text', required: true, validation: { minLength: 2, maxLength: 50 }, placeholder: 'Enter your first name' },
      { id: 'lastName', label: 'Last Name', type: 'text', required: true, validation: { minLength: 2, maxLength: 50 }, placeholder: 'Enter your last name' },
      { id: 'email', label: 'Email Address', type: 'email', required: true, validation: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }, placeholder: 'Enter your email address' },
      { id: 'phone', label: 'Phone Number', type: 'phone', required: true, validation: { minLength: 10, maxLength: 15 }, placeholder: 'Enter your phone number' },
      { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, placeholder: 'Select your date of birth' },
    ],
  },
  {
    id: 'identity',
    title: 'Identity Verification',
    description: 'Verify your identity with official documents',
    requiredDocuments: ['id_front', 'id_back', 'selfie'],
    fields: [
      { id: 'idType', label: 'ID Type', type: 'select', required: true, options: ['National ID', 'Passport', 'Driver\'s License'], placeholder: 'Select ID type' },
      { id: 'idNumber', label: 'ID Number', type: 'text', required: true, validation: { minLength: 5, maxLength: 20 }, placeholder: 'Enter your ID number' },
      { id: 'expiryDate', label: 'Expiry Date', type: 'date', required: false, placeholder: 'Select expiry date (if any)' },
    ],
  },
  {
    id: 'address',
    title: 'Address Proof',
    description: 'Provide proof of your current address',
    requiredDocuments: ['utility_bill', 'bank_statement'],
    fields: [
      { id: 'address', label: 'Full Address', type: 'textarea', required: true, validation: { minLength: 10, maxLength: 200 }, placeholder: 'Enter your full address' },
      { id: 'city', label: 'City/Town', type: 'text', required: true, validation: { minLength: 2, maxLength: 50 }, placeholder: 'Enter your city or town' },
      { id: 'postalCode', label: 'Postal Code', type: 'text', required: true, validation: { minLength: 3, maxLength: 10 }, placeholder: 'Enter your postal code' },
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

  const currentLevel: VerificationLevel = completedSteps >= 5 ? 3 : completedSteps >= 3 ? 2 : 1;
  
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

  const handleStepPress = (index: number) => {
    const step = verificationSteps[index];
    if (step.status !== 'pending') {
      setCurrentStepIndex(index);
    }
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    console.log('Form submitted:', data);
  };

  const handleSaveDraft = async (data: Record<string, any>) => {
    console.log('Draft saved:', data);
  };

  const handleDocumentUpload = () => {
    console.log('Document uploaded');
  };

  const handleLevelPress = (level: VerificationLevel) => {
    console.log('Level pressed:', level);
  };

  const handleBenefitPress = (benefit: { level: VerificationLevel; title: string; unlocked: boolean; icon: string }) => {
    console.log('Benefit pressed:', benefit);
  };

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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
    <View style={[styles.benefitCard, unlocked && styles.b