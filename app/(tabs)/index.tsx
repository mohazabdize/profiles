import React, { useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  Wallet,

  Settings,
  Bell,
  Shield,
  CreditCard,

  UserCheck,

  HelpCircle,
  FileText,
  Award,
  Trophy,
  LogOut,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/colors';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { SectionHeader } from '@/components/SectionHeader';
import { MenuItem } from '@/components/MenuItem';
import { StatCard } from '@/components/StatCard';
import { mockUser, mockStats, mockNotifications, mockPendingActions } from '@/mocks/user';

export default function ProfileScreen() {
  const router = useRouter();
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: mockUser.trustScore,
      duration: 1000,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, [progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Profile',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{mockUser.avatar}</Text>
            </View>
          </View>
          
          <View style={styles.nameRow}>
            <Text style={styles.name}>{mockUser.name}</Text>
            {mockUser.isVerified && (
              <View style={styles.verifiedBadge}>
                <UserCheck size={16} color={Colors.status.verifiedGreen} />
              </View>
            )}
          </View>
          
          <Text style={styles.email}>{mockUser.email}</Text>
          <Text style={styles.phone}>{mockUser.phone}</Text>
          
          <Badge 
            text={mockUser.accountType} 
            variant="info" 
            style={styles.accountTypeBadge}
          />
        </View>

        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <StatCard 
              value={`KES ${mockStats.totalBalance.toLocaleString()}`}
              label="Total Balance"
              delay={0}
            />
            <View style={styles.divider} />
            <StatCard 
              value={mockStats.walletsCount.toString()}
              label="Wallets"
              delay={100}
            />
            <View style={styles.divider} />
            <StatCard 
              value={mockStats.groupsCount.toString()}
              label="Groups"
              delay={200}
            />
          </View>
        </Card>

        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => router.push('/analytics')}
        >
          <Card style={styles.trustScoreCard}>
            <View style={styles.trustScoreHeader}>
              <Trophy size={24} color={Colors.primary.yellow} />
              <Text style={styles.trustScoreTitle}>Trust Score</Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <Animated.View 
                  style={[
                    styles.progressBarFill,
                    { width: progressWidth }
                  ]} 
                />
              </View>
            </View>
            
            <View style={styles.trustScoreFooter}>
              <Text style={styles.trustScoreValue}>{mockUser.trustScore}/100</Text>
              <Badge text={mockUser.tier} variant="premium" />
            </View>
            <Text style={styles.trustScoreTapHint}>Tap for detailed analytics</Text>
          </Card>
        </TouchableOpacity>

        <View style={styles.section}>
          <SectionHeader title="Financial Overview" />
          <MenuItem
            icon={Wallet}
            title="My Wallets"
            subtitle="Manage accounts"
            onPress={() => router.push('/wallets')}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Account Settings" />
          <MenuItem
            icon={Settings}
            title="Account Settings"
            subtitle="Personal information"
            onPress={() => router.push('/settings')}
          />
          <MenuItem
            icon={Bell}
            title="Notifications"
            subtitle="3 unread notifications"
            badge={{ text: mockNotifications.unread.toString(), variant: 'error' }}
            onPress={() => router.push('/notifications')}
          />
          <MenuItem
            icon={Shield}
            title="Security"
            subtitle="2FA, biometrics"
            onPress={() => router.push('/security')}
          />
          <MenuItem
            icon={CreditCard}
            title="Payment Methods"
            subtitle="M-Pesa, bank accounts"
            onPress={() => router.push('/payment-methods')}
          />
          <MenuItem
            icon={UserCheck}
            title="Verification Status"
            badge={{ text: 'Verified', variant: 'success' }}
            onPress={() => router.push('/verification')}
          />
        </View>



        <View style={styles.section}>
          <SectionHeader title="Support & Upgrade" />
          <MenuItem
            icon={HelpCircle}
            title="Help Center"
            subtitle="FAQs and guides"
            onPress={() => router.push('/help')}
          />
          <MenuItem
            icon={FileText}
            title="Terms & Privacy"
            onPress={() => router.push('/terms')}
          />
          <MenuItem
            icon={Award}
            title="Upgrade Plan"
            subtitle="Get premium features"
            onPress={() => router.push('/upgrade')}
          />
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={() => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Logout', 
                  style: 'destructive',
                  onPress: () => {
                    console.log('User logged out');
                    Alert.alert('Success', 'You have been logged out successfully');
                  }
                },
              ]
            );
          }}
        >
          <LogOut size={20} color={Colors.primary.red} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.gray50,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  editButton: {
    ...Typography.bodyMedium,
    color: Colors.primary.blue,
    fontWeight: '600',
    marginRight: Spacing.md,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.level2,
  },
  avatarText: {
    ...Typography.displayMedium,
    color: Colors.neutral.white,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    ...Typography.heading1,
    color: Colors.neutral.gray900,
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  email: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray700,
    marginTop: Spacing.xs,
  },
  phone: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray700,
    marginTop: 2,
  },
  accountTypeBadge: {
    marginTop: Spacing.sm,
  },
  statsCard: {
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.neutral.gray200,
  },
  trustScoreCard: {
    marginBottom: Spacing.lg,
  },
  trustScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  trustScoreTitle: {
    ...Typography.heading2,
    color: Colors.neutral.gray900,
  },
  progressBarContainer: {
    marginBottom: Spacing.md,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary.yellow,
    borderRadius: BorderRadius.xs,
  },
  trustScoreFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trustScoreValue: {
    ...Typography.heading1,
    color: Colors.neutral.gray900,
  },
  trustScoreTapHint: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: '#FEE2E2',
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  logoutText: {
    ...Typography.bodyLarge,
    color: Colors.primary.red,
    fontWeight: '600',
  },
  footer: {
    height: Spacing.lg,
  },
});
