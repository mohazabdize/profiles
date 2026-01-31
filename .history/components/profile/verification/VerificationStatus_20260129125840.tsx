/**
 * VerificationStatus Component
 * 
 * Displays overall verification status with animated progress,
 * level indicators, and benefit previews.
 * 
 * Features:
 * - Animated circular progress indicator
 * - Real-time level progression
 * - Benefit unlocks display
 * - Status breakdown by level
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
  Star,
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
  const rotationAnim = useRef(new Animated.Value(0)).current;

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

  // Animate progress circle
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

    // Rotate animation for in-progress status
    if (status === 'in_progress') {
      Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [progressPercentage, status]);

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Calculate progress circle
  const radius = 60;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      {/* Status Header */}
      <View style={styles.header}>
        <View style={styles.statusBadge}>
          <Animated.View
            style={[
              styles.statusIconContainer,
              status === 'in_progress' && { transform: [{ rotate: rotation }] },
            ]}
          >
            <StatusIcon size={20} color={statusConfig[status].color} />
          </Animated.View>
          <Text style={[styles.statusText, { color: statusConfig[status].color }]}>
            {statusConfig[status].text}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View Details</Text>
          <ChevronRight size={16} color={Colors.primary.blue} />
        </TouchableOpacity>
      </View>

      {/* Progress Circle */}
      <View style={styles.progressSection}>
        <View style={styles.progressContainer}>
          <Animated.View style={styles.progressCircle}>
            {/* Background circle */}
            <View
              style={[
                styles.progressCircleBg,
                { width: radius * 2, height: radius * 2, borderRadius: radius },
              ]}
            />
            
            {/* Progress arc */}
            <Animated.View
              style={[
                styles.progressArc,
                {
                  width: radius * 2,
                  height: radius * 2,
                  borderRadius: radius,
                  borderColor: levelColors[currentLevel],
                  borderWidth: strokeWidth,
                  borderLeftColor: 'transparent',
                  borderBottomColor: 'transparent',
                  borderRightColor: 'transparent',
                  transform: [{ rotate: '-90deg' }],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.progressMask,
                  {
                    width: radius * 2,
                    height: radius * 2,
                    borderRadius: radius,
                    borderWidth: strokeWidth,
                    borderColor: levelColors[currentLevel],
                    transform: [{ rotate: '90deg' }],
                  },
                ]}
              />
            </Animated.View>

            {/* Center content */}
            <View style={styles.progressCenter}>
              <Text style={styles.progressPercentage}>
                {Math.round(progressPercentage)}%
              </Text>
              <Text style={styles.progressLabel}>Complete</Text>
            </View>
          </Animated.View>

          {/* Level indicators */}
          <View style={styles.levelIndicators}>
            {[1, 2, 3].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.levelIndicator,
                  {
                    backgroundColor:
                      level <= currentLevel
                        ? levelColors[level as VerificationLevel]
                        : Colors.neutral.gray200,
                    borderColor:
                      level === currentLevel
                        ? Colors.neutral.white
                        : 'transparent',
                  },
                ]}
                onPress={() => onLevelPress?.(level as VerificationLevel)}
                disabled={level > currentLevel}
              >
                {level <= currentLevel && level < 3 && (
                  <View style={styles.levelConnector} />
                )}
                <Text style={styles.levelNumber}>L{level}</Text>
                {level === currentLevel && (
                  <View style={styles.currentLevelDot} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Steps progress */}
        <View style={styles.stepsProgress}>
          <Text style={styles.stepsTitle}>Verification Progress</Text>
          <Text style={styles.stepsCount}>
            {completedSteps}/{totalSteps} steps completed
          </Text>
          <View style={styles.stepsBar}>
            <View style={styles.stepsBarBg}>
              <Animated.View
                style={[
                  styles.stepsBarFill,
                  {
                    width: `${(completedSteps / totalSteps) * 100}%`,
                    backgroundColor: levelColors[currentLevel],
                  },
                ]}
              />
            </View>
          </View>
          {currentLevel < 3 && (
            <Text style={styles.nextLevelText}>
              {nextLevelUnlockAt - completedSteps} more steps to unlock Level{' '}
              {currentLevel + 1}
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
  statusIconContainer: {
    padding: 4,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  progressContainer: {
    alignItems: 'center',
    marginRight: Spacing.xl,
  },
  progressCircle: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  progressCircleBg: {
    backgroundColor: Colors.neutral.gray100,
  },
  progressArc: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  progressMask: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  progressCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    ...Typography.heading1,
    color: Colors.neutral.gray900,
  },
  progressLabel: {
    ...Typography.caption,
    color: Colors.neutral.gray600,
  },
  levelIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  levelIndicator: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  levelConnector: {
    position: 'absolute',
    right: -4,
    width: 8,
    height: 2,
    backgroundColor: Colors.neutral.gray300,
  },
  levelNumber: {
    ...Typography.caption,
    color: Colors.neutral.white,
    fontWeight: '700',
  },
  currentLevelDot: {
    position: 'absolute',
    bottom: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.neutral.gray300,
  },
  stepsProgress: {
    flex: 1,
  },
  stepsTitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray900,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  stepsCount: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
    marginBottom: Spacing.sm,
  },
  stepsBar: {
    marginBottom: Spacing.xs,
  },
  stepsBarBg: {
    height: 6,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
  },
  stepsBarFill: {
    height: '100%',
    borderRadius: BorderRadius.xs,
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