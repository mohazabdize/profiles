/**
 * VerificationStatus Component
 * 
 * Displays overall verification status with horizontal progress bar,
 * level indicators, and benefit previews.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import {
  Shield,
  CheckCircle,
  Lock,
  ChevronRight,
  Award,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/colors';

export type VerificationLevel = 1 | 2 | 3;
export type VerificationStatusType = 'not_started' | 'in_progress' | 'verified' | 'suspended';

export interface VerificationStatusProps {
  currentLevel: VerificationLevel;
  progressPercentage: number;
  status: VerificationStatusType;
  completedSteps: number;
  totalSteps: number;
  nextLevelUnlockAt: number; // Steps needed for next level
  benefits?: {
    level: VerificationLevel;
    title: string;
    unlocked: boolean;
    icon: string;
  }[];
  onLevelPress?: (level: VerificationLevel) => void;
  onBenefitPress?: (benefit: any) => void;
}

export function VerificationStatus({
  currentLevel,
  progressPercentage,
  status,
  completedSteps,
  totalSteps,
  nextLevelUnlockAt,
  benefits = [],
  onLevelPress,
  onBenefitPress,
}: VerificationStatusProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const statusConfig = {
    not_started: {
      color: Colors.neutral.gray400,
      text: 'Not Started',
      icon: Lock,
    },
    in_progress: {
      color: Colors.primary.blue,
      text: 'In Progress',
      icon: Shield,
    },
    verified: {
      color: Colors.status.verifiedGreen,
      text: 'Verified',
      icon: CheckCircle,
    },
    suspended: {
      color: Colors.primary.red,
      text: 'Suspended',
      icon: Lock,
    },
  };

  const levelColors = {
    1: Colors.status.verifiedGreen,
    2: Colors.primary.blue,
    3: Colors.status.premiumPurple,
  };

  const StatusIcon = statusConfig[status].icon;

  // Animate progress bar
  useEffect(() => {
    Animated.parallel([
      Animated.spring(progressAnim, {
        toValue: progressPercentage,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  }, [progressPercentage, progressAnim, scaleAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      {/* Status Header */}
      <View style={styles.header}>
        <View style={styles.statusBadge}>
          <StatusIcon size={20} color={statusConfig[status].color} />
          <Text style={[styles.statusText, { color: statusConfig[status].color }]}>
            {statusConfig[status].text}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View Details</Text>
          <ChevronRight size={16} color={Colors.primary.blue} />
        </TouchableOpacity>
      </View>

      {/* Horizontal Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Verification Progress</Text>
          <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
        </View>
        
        {/* Horizontal Progress Bar */}
        <View style={styles.horizontalProgressContainer}>
          <View style={styles.horizontalProgressBarBg}>
            <Animated.View
              style={[
                styles.horizontalProgressBarFill,
                { 
                  width: progressWidth,
                  backgroundColor: levelColors[currentLevel],
                },
              ]}
            />
          </View>
          
          {/* Level Indicators */}
          <View style={styles.levelIndicatorsHorizontal}>
            {[1, 2, 3].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.levelIndicatorHorizontal,
                  {
                    backgroundColor:
                      level <= currentLevel
                        ? levelColors[level as VerificationLevel]
                        : Colors.neutral.gray200,
                  },
                ]}
                onPress={() => onLevelPress?.(level as VerificationLevel)}
                disabled={level > currentLevel}
              >
                <Text style={styles.levelNumberHorizontal}>L{level}</Text>
                {level === currentLevel && (
                  <View style={styles.currentLevelDotHorizontal} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Steps progress */}
        <View style={styles.stepsProgress}>
          <Text style={styles.stepsCount}>
            {completedSteps}/{totalSteps} steps completed
          </Text>
          {currentLevel < 3 && (
            <Text style={styles.nextLevelText}>
              {nextLevelUnlockAt - completedSteps} more steps to unlock Level {currentLevel + 1}
            </Text>
          )}
        </View>
      </View>

      {/* Benefits Preview */}
      {benefits.length > 0 && (
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Current Benefits</Text>
          <View style={styles.benefitsGrid}>
            {benefits
              .filter(b => b.unlocked)
              .slice(0, 3)
              .map((benefit, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.benefitCard}
                  onPress={() => onBenefitPress?.(benefit)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.benefitIcon,
                      { backgroundColor: levelColors[benefit.level] + '20' },
                    ]}
                  >
                    <Award size={20} color={levelColors[benefit.level]} />
                  </View>
                  <Text style={styles.benefitName} numberOfLines={2}>
                    {benefit.title}
                  </Text>
                  <View
                    style={[
                      styles.benefitLevelBadge,
                      { backgroundColor: levelColors[benefit.level] },
                    ]}
                  >
                    <Text style={styles.benefitLevelText}>L{benefit.level}</Text>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
          {benefits.filter(b => !b.unlocked).length > 0 && (
            <TouchableOpacity style={styles.moreBenefitsButton}>
              <Text style={styles.moreBenefitsText}>
                +{benefits.filter(b => !b.unlocked).length} more benefits locked
              </Text>
              <ChevronRight size={16} color={Colors.neutral.gray500} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.level2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusText: {
    ...Typography.bodyMedium,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    ...Typography.bodySmall,
    color: Colors.primary.blue,
    fontWeight: '500',
  },
  progressSection: {
    marginBottom: Spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressTitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray900,
    fontWeight: '600',
  },
  progressPercentage: {
    ...Typography.bodyMedium,
    color: Colors.primary.blue,
    fontWeight: '600',
  },
  horizontalProgressContainer: {
    marginBottom: Spacing.md,
  },
  horizontalProgressBarBg: {
    height: 8,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  horizontalProgressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.xs,
  },
  levelIndicatorsHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  levelIndicatorHorizontal: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  levelNumberHorizontal: {
    ...Typography.bodySmall,
    color: Colors.neutral.white,
    fontWeight: '700',
  },
  currentLevelDotHorizontal: {
    position: 'absolute',
    bottom: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.neutral.white,
    borderWidth: 2,
    borderColor: Colors.neutral.gray300,
  },
  stepsProgress: {
    gap: Spacing.xs,
  },
  stepsCount: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
  },
  nextLevelText: {
    ...Typography.caption,
    color: Colors.neutral.gray600,
    fontStyle: 'italic',
  },
  benefitsSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray200,
    paddingTop: Spacing.lg,
  },
  benefitsTitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray900,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  benefitsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  benefitCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.neutral.gray50,
    borderRadius: BorderRadius.md,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  benefitName: {
    ...Typography.caption,
    color: Colors.neutral.gray900,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    minHeight: 32,
  },
  benefitLevelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  benefitLevelText: {
    ...Typography.caption,
    fontSize: 8,
    color: Colors.neutral.white,
    fontWeight: '700',
  },
  moreBenefitsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: Spacing.sm,
  },
  moreBenefitsText: {
    ...Typography.caption,
    color: Colors.neutral.gray500,
  },
});