import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Animated,
  TextInput,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  ArrowLeft,
  Check,
  Upload,
  Camera,
  FileText,
  User,
  Home,
  Briefcase,
  AlertCircle,
  CheckCircle,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/colors';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  level: number;
}

const verificationSteps: VerificationStep[] = [
  {
    id: '1',
    title: 'Personal Information',
    description: 'Basic details and contact information',
    status: 'completed',
    level: 1,
  },
  {
    id: '2',
    title: 'Identity Verification',
    description: 'National ID or Passport',
    status: 'completed',
    level: 1,
  },
  {
    id: '3',
    title: 'Address Proof',
    description: 'Utility bill or bank statement',
    status: 'current',
    level: 2,
  },
  {
    id: '4',
    title: 'Financial Information',
    description: 'Income source and bank details',
    status: 'pending',
    level: 2,
  },
  {
    id: '5',
    title: 'Business Details',
    description: 'Business registration (optional)',
    status: 'pending',
    level: 3,
  },
];

export default function VerificationScreen() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(2);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const currentStep = verificationSteps[currentStepIndex];
  const completedSteps = verificationSteps.filter(s => s.status === 'completed').length;
  const progressPercentage = (completedSteps / verificationSteps.length) * 100;

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progressPercentage,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  }, [progressPercentage, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

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

      <View style={styles.header}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Verification Progress</Text>
          <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
          </View>
        </View>
        <Text style={styles.progressSubtitle}>
          {completedSteps} of {verificationSteps.length} steps completed
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepsContainer}>
          {verificationSteps.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              index={index}
              isLast={index === verificationSteps.length - 1}
              onPress={() => {
                if (step.status === 'current' || step.status === 'completed') {
                  setCurrentStepIndex(index);
                }
              }}
            />
          ))}
        </View>

        {currentStep && (
          <View style={styles.currentStepSection}>
            <Card style={styles.currentStepCard}>
              <View style={styles.currentStepHeader}>
                <View style={styles.currentStepIcon}>
                  {currentStep.id === '1' && <User size={24} color={Colors.primary.blue} />}
                  {currentStep.id === '2' && <FileText size={24} color={Colors.primary.blue} />}
                  {currentStep.id === '3' && <Home size={24} color={Colors.primary.blue} />}
                  {currentStep.id === '4' && <Briefcase size={24} color={Colors.primary.blue} />}
                  {currentStep.id === '5' && <Briefcase size={24} color={Colors.primary.blue} />}
                </View>
                <View style={styles.currentStepTitles}>
                  <Text style={styles.currentStepTitle}>{currentStep.title}</Text>
                  <Text style={styles.currentStepDescription}>{currentStep.description}</Text>
                </View>
                <Badge 
                  text={`Level ${currentStep.level}`} 
                  variant={currentStep.level === 1 ? 'success' : currentStep.level === 2 ? 'info' : 'premium'} 
                />
              </View>

              {currentStep.status === 'current' && (
                <CurrentStepContent stepId={currentStep.id} />
              )}

              {currentStep.status === 'completed' && (
                <View style={styles.completedMessage}>
                  <CheckCircle size={20} color={Colors.status.verifiedGreen} />
                  <Text style={styles.completedMessageText}>
                    This step has been completed and verified
                  </Text>
                </View>
              )}

              {currentStep.status === 'pending' && (
                <View style={styles.pendingMessage}>
                  <AlertCircle size={20} color={Colors.neutral.gray700} />
                  <Text style={styles.pendingMessageText}>
                    Complete previous steps to unlock this verification level
                  </Text>
                </View>
              )}
            </Card>
          </View>
        )}

        <Card style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Verification Benefits</Text>
          <View style={styles.benefitsList}>
            <BenefitItem 
              level={1}
              title="Level 1 Benefits"
              benefits={['Basic transactions', 'Up to KES 50,000 daily limit', 'Join groups']}
              unlocked={completedSteps >= 2}
            />
            <BenefitItem 
              level={2}
              title="Level 2 Benefits"
              benefits={['Higher limits up to KES 150,000', 'Create groups', 'Advanced analytics']}
              unlocked={completedSteps >= 4}
            />
            <BenefitItem 
              level={3}
              title="Level 3 Benefits"
              benefits={['Unlimited transactions', 'Business features', 'Priority support']}
              unlocked={completedSteps >= 5}
            />
          </View>
        </Card>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

function StepCard({ 
  step, 
  index, 
  isLast,
  onPress 
}: { 
  step: VerificationStep; 
  index: number; 
  isLast: boolean;
  onPress: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, [index, fadeAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={styles.stepCardContainer}>
        <View style={styles.stepIndicator}>
          <View style={[
            styles.stepCircle,
            step.status === 'completed' && styles.stepCircleCompleted,
            step.status === 'current' && styles.stepCircleCurrent,
          ]}>
            {step.status === 'completed' && (
              <Check size={16} color={Colors.neutral.white} />
            )}
            {step.status === 'current' && (
              <View style={styles.currentDot} />
            )}
            {step.status === 'pending' && (
              <Text style={styles.stepNumber}>{index + 1}</Text>
            )}
          </View>
          {!isLast && (
            <View style={[
              styles.stepLine,
              step.status === 'completed' && styles.stepLineCompleted,
            ]} />
          )}
        </View>

        <TouchableOpacity 
          style={styles.stepContent}
          onPress={onPress}
          disabled={step.status === 'pending'}
          activeOpacity={0.7}
        >
          <Card style={[
            styles.stepCard,
            step.status === 'current' && styles.stepCardCurrent,
            step.status === 'pending' && styles.stepCardPending,
          ]}>
            <View style={styles.stepCardHeader}>
              <Text style={[
                styles.stepTitle,
                step.status === 'pending' && styles.stepTitlePending,
              ]}>
                {step.title}
              </Text>
              {step.status === 'completed' && (
                <Badge text="Verified" variant="success" />
              )}
              {step.status === 'current' && (
                <Badge text="In Progress" variant="warning" />
              )}
            </View>
            <Text style={[
              styles.stepDescription,
              step.status === 'pending' && styles.stepDescriptionPending,
            ]}>
              {step.description}
            </Text>
          </Card>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

function CurrentStepContent({ stepId }: { stepId: string }) {
  if (stepId === '3') {
    return (
      <View style={styles.stepFormContainer}>
        <Text style={styles.stepFormTitle}>Upload Address Proof</Text>
        <Text style={styles.stepFormDescription}>
          Please upload a recent utility bill or bank statement (not older than 3 months)
        </Text>

        <View style={styles.uploadButtons}>
          <TouchableOpacity style={styles.uploadButton} activeOpacity={0.7}>
            <Upload size={24} color={Colors.primary.blue} />
            <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadButton} activeOpacity={0.7}>
            <Camera size={24} color={Colors.primary.blue} />
            <Text style={styles.uploadButtonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.requirementsList}>
          <Text style={styles.requirementsTitle}>Requirements:</Text>
          <Text style={styles.requirementItem}>• Document must be in PDF or image format</Text>
          <Text style={styles.requirementItem}>• File size should not exceed 5MB</Text>
          <Text style={styles.requirementItem}>• Document must clearly show your name and address</Text>
          <Text style={styles.requirementItem}>• Date should be within the last 3 months</Text>
        </View>

        <TouchableOpacity style={styles.submitButton} activeOpacity={0.8}>
          <Text style={styles.submitButtonText}>Submit for Verification</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

function BenefitItem({ 
  level, 
  title, 
  benefits, 
  unlocked 
}: { 
  level: number; 
  title: string; 
  benefits: string[]; 
  unlocked: boolean;
}) {
  return (
    <View style={[styles.benefitItem, unlocked && styles.benefitItemUnlocked]}>
      <View style={styles.benefitHeader}>
        <View style={[
          styles.benefitLevelBadge,
          unlocked && styles.benefitLevelBadgeUnlocked,
        ]}>
          <Text style={[
            styles.benefitLevelText,
            unlocked && styles.benefitLevelTextUnlocked,
          ]}>
            L{level}
          </Text>
        </View>
        <Text style={[
          styles.benefitTitle,
          !unlocked && styles.benefitTitleLocked,
        ]}>
          {title}
        </Text>
        {unlocked && <CheckCircle size={20} color={Colors.status.verifiedGreen} />}
      </View>
      {benefits.map((benefit, index) => (
        <Text key={index} style={[
          styles.benefitText,
          !unlocked && styles.benefitTextLocked,
        ]}>
          • {benefit}
        </Text>
      ))}
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
  header: {
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
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
    ...Typography.bodyLarge,
    color: Colors.neutral.gray900,
    fontWeight: '600',
  },
  progressPercentage: {
    ...Typography.heading2,
    color: Colors.primary.blue,
  },
  progressBarContainer: {
    marginBottom: Spacing.sm,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary.blue,
    borderRadius: BorderRadius.xs,
  },
  progressSubtitle: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  stepsContainer: {
    marginBottom: Spacing.xl,
  },
  stepCardContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  stepCircleCompleted: {
    backgroundColor: Colors.status.verifiedGreen,
  },
  stepCircleCurrent: {
    backgroundColor: Colors.primary.blue,
    borderWidth: 3,
    borderColor: Colors.neutral.white,
    ...Shadows.level2,
  },
  currentDot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral.white,
  },
  stepNumber: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
    fontWeight: '600',
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.neutral.gray200,
    marginVertical: Spacing.xs,
  },
  stepLineCompleted: {
    backgroundColor: Colors.status.verifiedGreen,
  },
  stepContent: {
    flex: 1,
  },
  stepCard: {
    marginBottom: 0,
  },
  stepCardCurrent: {
    borderWidth: 2,
    borderColor: Colors.primary.blue,
    ...Shadows.level2,
  },
  stepCardPending: {
    opacity: 0.6,
  },
  stepCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  stepTitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray900,
    fontWeight: '600',
    flex: 1,
  },
  stepTitlePending: {
    color: Colors.neutral.gray700,
  },
  stepDescription: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
  },
  stepDescriptionPending: {
    color: Colors.neutral.gray700,
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
  stepFormContainer: {
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray200,
  },
  stepFormTitle: {
    ...Typography.bodyLarge,
    color: Colors.neutral.gray900,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  stepFormDescription: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
    marginBottom: Spacing.lg,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.neutral.gray50,
    borderWidth: 2,
    borderColor: Colors.primary.blue,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
  },
  uploadButtonText: {
    ...Typography.bodyMedium,
    color: Colors.primary.blue,
    fontWeight: '600',
  },
  requirementsList: {
    backgroundColor: Colors.neutral.gray50,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  requirementsTitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray900,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  requirementItem: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
    marginBottom: 2,
  },
  submitButton: {
    padding: Spacing.md,
    backgroundColor: Colors.primary.blue,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  submitButtonText: {
    ...Typography.bodyLarge,
    color: Colors.neutral.white,
    fontWeight: '600',
  },
  completedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: '#D1FAE5',
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.lg,
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
    marginTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray200,
  },
  pendingMessageText: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
    flex: 1,
  },
  benefitsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  benefitsTitle: {
    ...Typography.heading2,
    color: Colors.neutral.gray900,
    marginBottom: Spacing.lg,
  },
  benefitsList: {
    gap: Spacing.md,
  },
  benefitItem: {
    padding: Spacing.md,
    backgroundColor: Colors.neutral.gray50,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
  },
  benefitItemUnlocked: {
    backgroundColor: '#D1FAE5',
    borderColor: Colors.status.verifiedGreen,
  },
  benefitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  benefitLevelBadge: {
    width: 28,
    height: 28,
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
    fontWeight: '600',
  },
  benefitLevelTextUnlocked: {
    color: Colors.neutral.white,
  },
  benefitTitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray900,
    fontWeight: '600',
    flex: 1,
  },
  benefitTitleLocked: {
    color: Colors.neutral.gray700,
  },
  benefitText: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray900,
    marginBottom: 2,
  },
  benefitTextLocked: {
    color: Colors.neutral.gray700,
  },
  footer: {
    height: Spacing.lg,
  },
});
