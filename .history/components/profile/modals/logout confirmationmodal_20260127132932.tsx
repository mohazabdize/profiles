// components/profile/modals/logout-confirmationmodal-premium.tsx
import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { X, AlertTriangle, Shield, LogOut, AlertCircle } from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const MODAL_WIDTH = Math.min(width - Spacing.xl * 4, 440);

export const PremiumConfirmationModal = ({
  visible,
  title = 'Secure Logout',
  message = 'You\'re about to sign out of your account. Please confirm this action.',
  confirmText = 'Confirm Logout',
  cancelText = 'Go Back',
  type = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmationModalProps) => {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (visible) {
      // Backdrop fade in
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();

      // Content animation sequence
      Animated.sequence([
        Animated.delay(100),
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 20,
            mass: 0.7,
          }),
          Animated.spring(slideUpAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 120,
            friction: 15,
          }),
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
        ]),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      backdropOpacity.setValue(0);
      contentOpacity.setValue(0);
      slideUpAnim.setValue(30);
    }
  }, [visible]);

  const getTypeColor = () => {
    switch (type) {
      case 'danger': return Colors.primary.red;
      case 'warning': return Colors.primary.yellow;
      case 'info': return Colors.primary.blue;
    }
  };

  const getTypeGradient = () => {
    switch (type) {
      case 'danger': return ['#FEE2E2', '#FEF2F2'];
      case 'warning': return ['#FEF3C7', '#FFFBEB'];
      case 'info': return ['#DBEAFE', '#EFF6FF'];
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger': return LogOut;
      case 'warning': return AlertTriangle;
      case 'info': return Shield;
    }
  };

  const Icon = getIcon();
  const gradientColors = getTypeGradient();
  const typeColor = getTypeColor();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      hardwareAccelerated
    >
      <Animated.View 
        style={[
          styles.backdrop, 
          { opacity: backdropOpacity }
        ]}
      >
        <TouchableOpacity 
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onCancel}
        />
        
        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: slideUpAnim },
              ],
              opacity: contentOpacity,
            },
          ]}
        >
          {/* Modal Header with Floating Effect */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.iconCircle}>
                <Icon size={36} color={typeColor} strokeWidth={2} />
              </View>
              
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>Security confirmation</Text>
              </View>
              
              <TouchableOpacity 
                onPress={onCancel}
                style={styles.floatingCloseButton}
                activeOpacity={0.7}
                hitSlop={12}
              >
                <View style={styles.closeButtonInner}>
                  <X size={20} color={Colors.neutral.gray700} />
                </View>
              </TouchableOpacity>
            </View>
            
            {/* Decorative border */}
            <View style={[styles.headerBorder, { backgroundColor: `${typeColor}30` }]} />
          </LinearGradient>

          {/* Content Area */}
          <View style={styles.content}>
            <View style={styles.messageCard}>
              <AlertCircle size={20} color={typeColor} style={styles.messageIcon} />
              <Text style={styles.message}>{message}</Text>
            </View>
            
            {/* Security Checklist */}
            <View style={styles.checklist}>
              <Text style={styles.checklistTitle}>What happens next:</Text>
              
              <View style={styles.checklistItem}>
                <View style={[styles.checklistIcon, { backgroundColor: `${typeColor}15` }]}>
                  <Text style={[styles.checklistNumber, { color: typeColor }]}>1</Text>
                </View>
                <Text style={styles.checklistText}>Session will be terminated immediately</Text>
              </View>
              
              <View style={styles.checklistItem}>
                <View style={[styles.checklistIcon, { backgroundColor: `${typeColor}15` }]}>
                  <Text style={[styles.checklistNumber, { color: typeColor }]}>2</Text>
                </View>
                <Text style={styles.checklistText}>You'll need to sign in again to access your account</Text>
              </View>
              
              <View style={styles.checklistItem}>
                <View style={[styles.checklistIcon, { backgroundColor: `${typeColor}15` }]}>
                  <Text style={[styles.checklistNumber, { color: typeColor }]}>3</Text>
                </View>
                <Text style={styles.checklistText}>All active sessions will be closed</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons - Floating Style */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={onCancel}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text style={styles.secondaryActionText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryAction, { backgroundColor: typeColor }]}
              onPress={onConfirm}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loading}>
                  <View style={styles.spinner} />
                  <Text style={styles.primaryActionText}>Securing...</Text>
                </View>
              ) : (
                <>
                  <LogOut size={18} color={Colors.neutral.white} />
                  <Text style={styles.primaryActionText}>{confirmText}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Footer Note */}
          <View style={styles.footer}>
            <Shield size={14} color={Colors.neutral.gray500} />
            <Text style={styles.footerText}>Protected by end-to-end encryption</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: MODAL_WIDTH,
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    ...Shadows.level3,
    overflow: 'hidden',
  },
  header: {
    padding: Spacing.xl,
    paddingBottom: Spacing.lg + 4,
    position: 'relative',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    zIndex: 2,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.level2,
    borderWidth: 2,
    borderColor: Colors.neutral.white,
  },
  titleContainer: {
    flex: 1,
    gap: 6,
  },
  title: {
    ...Typography.heading1,
    color: Colors.neutral.gray900,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.labelMedium,
    color: Colors.neutral.gray600,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  floatingCloseButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    ...Shadows.level1,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
  },
  closeButtonInner: {
    transform: [{ scale: 0.9 }],
  },
  headerBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  content: {
    padding: Spacing.xl,
  },
  messageCard: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.gray50,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  messageIcon: {
    marginTop: 2,
  },
  message: {
    ...Typography.bodyLarge,
    color: Colors.neutral.gray800,
    lineHeight: 26,
    flex: 1,
    fontWeight: '500',
  },
  checklist: {
    gap: Spacing.md,
  },
  checklistTitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray700,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  checklistIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checklistNumber: {
    ...Typography.labelMedium,
    fontWeight: '700',
    fontSize: 12,
  },
  checklistText: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray700,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: Colors.neutral.gray50,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray200,
  },
  secondaryAction: {
    flex: 1,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.neutral.white,
    borderWidth: 2,
    borderColor: Colors.neutral.gray300,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.xs,
  },
  primaryAction: {
    flex: 1.5,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.level2,
  },
  secondaryActionText: {
    ...Typography.bodyLarge,
    color: Colors.neutral.gray800,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  primaryActionText: {
    ...Typography.bodyLarge,
    color: Colors.neutral.white,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.lg,
    backgroundColor: Colors.neutral.gray50,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray200,
  },
  footerText: {
    ...Typography.labelSmall,
    color: Colors.neutral.gray600,
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  spinner: {
    width: 16,
    height: 16,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.neutral.white,
    borderTopColor: 'transparent',
  },
});