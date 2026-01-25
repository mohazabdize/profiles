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
  Plus,
  Building2,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  FileText,
  Clock,
  DollarSign,
  Shield,
  Settings as SettingsIcon,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/colors';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { SectionHeader } from '@/components/SectionHeader';
import { 
  mockGroups, 
  mockGroupAccounts, 
  mockGroupActivities, 
  mockPendingActions,
  mockGroupMembers,
} from '@/mocks/groups';

type TabType = 'Overview' | 'Accounts' | 'Actions' | 'Members';

export default function GroupsScreen() {
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState(mockGroups[0]);
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const underlineAnim = useRef(new Animated.Value(0)).current;

  const handleTabChange = (tab: TabType, index: number) => {
    setActiveTab(tab);
    Animated.spring(underlineAnim, {
      toValue: index,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const tabs: TabType[] = ['Overview', 'Accounts', 'Actions', 'Members'];

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Group Accounts',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={Colors.neutral.gray900} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.headerButton}>
              <Plus size={24} color={Colors.primary.blue} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.content}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.groupSelector}
          contentContainerStyle={styles.groupSelectorContent}
        >
          {mockGroups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={[
                styles.groupImageContainer,
                group.id === selectedGroup.id && styles.groupImageContainerActive,
              ]}
              onPress={() => setSelectedGroup(group)}
              activeOpacity={0.7}
            >
              <View style={styles.groupImage}>
                <Text style={styles.groupImageText}>{group.image}</Text>
              </View>
              {group.isPending && <View style={styles.pendingBadge} />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.groupHeader}>
          <View style={styles.groupHeaderLeft}>
            <Building2 size={24} color={Colors.primary.blue} />
            <View style={styles.groupHeaderText}>
              <Text style={styles.groupName}>{selectedGroup.name}</Text>
              <Text style={styles.groupNumber}>{selectedGroup.groupNumber}</Text>
            </View>
          </View>
          <Badge 
            text={selectedGroup.role} 
            variant={selectedGroup.role === 'TREASURER' ? 'premium' : 'info'} 
          />
        </View>

        <View style={styles.tabContainer}>
          <View style={styles.tabs}>
            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={tab}
                style={styles.tab}
                onPress={() => handleTabChange(tab, index)}
                activeOpacity={0.7}
              >
                <Text 
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Animated.View 
            style={[
              styles.tabUnderline,
              {
                transform: [{
                  translateX: underlineAnim.interpolate({
                    inputRange: [0, 1, 2, 3],
                    outputRange: [0, 100, 200, 300],
                  }),
                }],
              },
            ]}
          />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'Overview' && <OverviewTab group={selectedGroup} />}
          {activeTab === 'Accounts' && <AccountsTab groupId={selectedGroup.id} />}
          {activeTab === 'Actions' && <ActionsTab />}
          {activeTab === 'Members' && <MembersTab />}
        </ScrollView>
      </View>

      {(selectedGroup.role === 'TREASURER' || selectedGroup.role === 'ADMIN') && (
        <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
          <SettingsIcon size={24} color={Colors.neutral.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function OverviewTab({ group }: { group: typeof mockGroups[0] }) {
  return (
    <View>
      <View style={styles.statsContainer}>
        <View style={styles.statColumn}>
          <Text style={styles.statValue}>KES {group.totalBalance.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Balance</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statColumn}>
          <Text style={styles.statValue}>{group.memberCount}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statColumn}>
          <Text style={styles.statValue}>KES {group.monthlyContribution.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Monthly</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <View style={[styles.actionIcon, { backgroundColor: '#D1FAE5' }]}>
            <ArrowDownLeft size={20} color={Colors.status.verifiedGreen} />
          </View>
          <Text style={styles.actionText}>Contribute</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <View style={[styles.actionIcon, { backgroundColor: '#FEE2E2' }]}>
            <ArrowUpRight size={20} color={Colors.primary.red} />
          </View>
          <Text style={styles.actionText}>Withdraw</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
            <Users size={20} color={Colors.status.securityBlue} />
          </View>
          <Text style={styles.actionText}>Invite</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.neutral.gray100 }]}>
            <FileText size={20} color={Colors.neutral.gray700} />
          </View>
          <Text style={styles.actionText}>Report</Text>
        </TouchableOpacity>
      </View>

      <SectionHeader title="Group Accounts" actionText="Manage" onActionPress={() => {}} />
      
      {mockGroupAccounts.slice(0, 2).map((account, index) => (
        <GroupAccountSummary key={account.id} account={account} delay={index * 100} />
      ))}

      <SectionHeader title="Recent Activity" actionText="View All" onActionPress={() => {}} />
      
      {mockGroupActivities.map((activity, index) => (
        <ActivityItem key={activity.id} activity={activity} delay={index * 100} />
      ))}
    </View>
  );
}

function AccountsTab({ groupId }: { groupId: string }) {
  const accounts = mockGroupAccounts.filter(acc => acc.groupId === groupId);

  return (
    <View style={styles.accountsGrid}>
      {accounts.map((account, index) => (
        <GroupAccountCard key={account.id} account={account} delay={index * 100} />
      ))}
    </View>
  );
}

function ActionsTab() {
  return (
    <View>
      {mockPendingActions.length === 0 ? (
        <Card style={styles.emptyState}>
          <Shield size={48} color={Colors.neutral.gray300} />
          <Text style={styles.emptyStateText}>No pending actions</Text>
        </Card>
      ) : (
        mockPendingActions.map((action, index) => (
          <PendingActionCard key={action.id} action={action} delay={index * 100} />
        ))
      )}
    </View>
  );
}

function MembersTab() {
  return (
    <View>
      {mockGroupMembers.map((member, index) => (
        <MemberCard key={member.id} member={member} delay={index * 50} />
      ))}

      <Card style={styles.groupStatsGrid}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Users size={20} color={Colors.primary.blue} style={styles.statIcon} />
            <Text style={styles.statItemValue}>{mockGroupMembers.length}</Text>
            <Text style={styles.statItemLabel}>Members</Text>
          </View>
          <View style={styles.statDividerVertical} />
          <View style={styles.statItem}>
            <DollarSign size={20} color={Colors.status.verifiedGreen} style={styles.statIcon} />
            <Text style={styles.statItemValue}>KES 1.25M</Text>
            <Text style={styles.statItemLabel}>Total Value</Text>
          </View>
        </View>
        <View style={styles.statDividerHorizontal} />
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Clock size={20} color={Colors.status.pendingOrange} style={styles.statIcon} />
            <Text style={styles.statItemValue}>Dec 25</Text>
            <Text style={styles.statItemLabel}>Next Contribution</Text>
          </View>
          <View style={styles.statDividerVertical} />
          <View style={styles.statItem}>
            <Shield size={20} color={Colors.status.premiumPurple} style={styles.statIcon} />
            <Text style={styles.statItemValue}>{mockPendingActions.length}</Text>
            <Text style={styles.statItemLabel}>Pending Actions</Text>
          </View>
        </View>
      </Card>
    </View>
  );
}

function GroupAccountSummary({ account, delay }: { account: typeof mockGroupAccounts[0]; delay: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay, fadeAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Card style={styles.accountSummary}>
        <View style={styles.accountSummaryHeader}>
          <Building2 size={20} color={Colors.primary.blue} />
          <View style={styles.accountSummaryInfo}>
            <Text style={styles.accountSummaryName}>{account.name}</Text>
            <Text style={styles.accountSummaryNumber}>{account.number}</Text>
          </View>
        </View>
        <View style={styles.accountSummaryFooter}>
          <Text style={styles.accountSummaryBalance}>KES {account.balance.toLocaleString()}</Text>
          <Badge text={account.type} variant="info" />
        </View>
      </Card>
    </Animated.View>
  );
}

function ActivityItem({ activity, delay }: { activity: typeof mockGroupActivities[0]; delay: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay, fadeAnim]);

  const isPositive = activity.amount > 0;
  const iconBg = isPositive ? '#D1FAE5' : '#FEE2E2';
  const IconComponent = isPositive ? ArrowDownLeft : ArrowUpRight;
  const iconColor = isPositive ? Colors.status.verifiedGreen : Colors.primary.red;

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity style={styles.activityItem} activeOpacity={0.7}>
        <View style={[styles.activityIcon, { backgroundColor: iconBg }]}>
          <IconComponent size={20} color={iconColor} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <Text style={styles.activityMember}>{activity.member} • {activity.date}</Text>
        </View>
        <Text style={[styles.activityAmount, { color: iconColor }]}>
          {isPositive ? '+' : ''}KES {Math.abs(activity.amount).toLocaleString()}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function GroupAccountCard({ account, delay }: { account: typeof mockGroupAccounts[0]; delay: number }) {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  }, [delay, fadeAnim, slideAnim]);

  return (
    <Animated.View 
      style={[
        styles.groupAccountCard,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <Card>
        <View style={styles.groupAccountCardHeader}>
          <Building2 size={20} color={Colors.primary.blue} />
        </View>
        <Text style={styles.groupAccountCardName}>{account.name}</Text>
        <Text style={styles.groupAccountCardNumber}>{account.number}</Text>
        <Text style={styles.groupAccountCardBalance}>KES {account.balance.toLocaleString()}</Text>
        <Badge text={account.type} variant="info" style={styles.groupAccountCardBadge} />
      </Card>
    </Animated.View>
  );
}

function PendingActionCard({ action, delay }: { action: typeof mockPendingActions[0]; delay: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay, fadeAnim]);

  const progress = (action.votesReceived / action.votesRequired) * 100;

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Card style={styles.pendingActionCard}>
        <View style={styles.pendingActionHeader}>
          <View style={styles.pendingActionIcon}>
            <Clock size={20} color={Colors.status.pendingOrange} />
          </View>
          <View style={styles.pendingActionInfo}>
            <Text style={styles.pendingActionTitle}>{action.title}</Text>
            <Text style={styles.pendingActionMember}>{action.member} • {action.date}</Text>
          </View>
        </View>
        
        <Text style={styles.pendingActionAmount}>KES {action.amount.toLocaleString()}</Text>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {action.votesReceived}/{action.votesRequired} votes
          </Text>
        </View>

        <TouchableOpacity style={styles.reviewButton} activeOpacity={0.8}>
          <Text style={styles.reviewButtonText}>Review</Text>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );
}

function MemberCard({ member, delay }: { member: typeof mockGroupMembers[0]; delay: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay, fadeAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity style={styles.memberCard} activeOpacity={0.7}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberAvatarText}>{member.avatar}</Text>
        </View>
        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text style={styles.memberName}>{member.name}</Text>
            {member.role === 'TREASURER' && (
              <Badge text={member.role} variant="premium" />
            )}
            {member.role === 'ADMIN' && (
              <Badge text={member.role} variant="info" />
            )}
          </View>
          <Text style={styles.memberStatus}>{member.status} Member</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.gray50,
  },
  content: {
    flex: 1,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  groupSelector: {
    marginBottom: Spacing.md,
  },
  groupSelectorContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  groupImageContainer: {
    position: 'relative',
  },
  groupImageContainerActive: {
    borderWidth: 3,
    borderColor: Colors.primary.blue,
    borderRadius: BorderRadius.full,
  },
  groupImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.level2,
  },
  groupImageText: {
    ...Typography.heading1,
    color: Colors.neutral.white,
  },
  pendingBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary.red,
    borderWidth: 3,
    borderColor: Colors.neutral.gray50,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  groupHeaderText: {
    flex: 1,
  },
  groupName: {
    ...Typography.heading2,
    color: Colors.neutral.gray900,
  },
  groupNumber: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
  },
  tabContainer: {
    marginBottom: Spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
  },
  tab: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  tabText: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray700,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.primary.blue,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: Spacing.md,
    width: 100,
    height: 3,
    backgroundColor: Colors.primary.blue,
    borderRadius: BorderRadius.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.level2,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.heading2,
    color: Colors.neutral.gray900,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.neutral.gray200,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionText: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray900,
    fontWeight: '600',
  },
  accountSummary: {
    marginBottom: Spacing.md,
  },
  accountSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  accountSummaryInfo: {
    flex: 1,
  },
  accountSummaryName: {
    ...Typography.bodyLarge,
    color: Colors.neutral.gray900,
    fontWeight: '600',
    marginBottom: 2,
  },
  accountSummaryNumber: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
  },
  accountSummaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountSummaryBalance: {
    ...Typography.heading1,
    color: Colors.neutral.gray900,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray900,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityMember: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
  },
  activityAmount: {
    ...Typography.bodyMedium,
    fontWeight: '700',
  },
  accountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  groupAccountCard: {
    width: '48%',
  },
  groupAccountCardHeader: {
    marginBottom: Spacing.md,
  },
  groupAccountCardName: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray900,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  groupAccountCardNumber: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
    marginBottom: Spacing.md,
  },
  groupAccountCardBalance: {
    ...Typography.heading2,
    color: Colors.neutral.gray900,
    marginBottom: Spacing.sm,
  },
  groupAccountCardBadge: {
    alignSelf: 'flex-start',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyStateText: {
    ...Typography.bodyLarge,
    color: Colors.neutral.gray700,
    marginTop: Spacing.md,
  },
  pendingActionCard: {
    marginBottom: Spacing.md,
  },
  pendingActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  pendingActionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#FED7AA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  pendingActionInfo: {
    flex: 1,
  },
  pendingActionTitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray900,
    fontWeight: '600',
    marginBottom: 2,
  },
  pendingActionMember: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
  },
  pendingActionAmount: {
    ...Typography.heading2,
    color: Colors.neutral.gray900,
    marginBottom: Spacing.md,
  },
  progressBarContainer: {
    marginBottom: Spacing.md,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.status.pendingOrange,
    borderRadius: BorderRadius.xs,
  },
  progressText: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
  },
  reviewButton: {
    backgroundColor: Colors.primary.blue,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  reviewButtonText: {
    ...Typography.bodyMedium,
    color: Colors.neutral.white,
    fontWeight: '600',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  memberAvatarText: {
    ...Typography.bodyMedium,
    color: Colors.neutral.white,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  memberName: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray900,
    fontWeight: '600',
  },
  memberStatus: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
  },
  groupStatsGrid: {
    marginTop: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDividerHorizontal: {
    height: 1,
    backgroundColor: Colors.neutral.gray200,
    marginVertical: Spacing.md,
  },
  statDividerVertical: {
    width: 1,
    height: 60,
    backgroundColor: Colors.neutral.gray200,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  statIcon: {
    marginBottom: Spacing.xs,
  },
  statItemValue: {
    ...Typography.bodyLarge,
    color: Colors.neutral.gray900,
    fontWeight: '700',
    marginBottom: 2,
  },
  statItemLabel: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.level3,
  },
});
