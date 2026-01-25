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
  Eye,
  EyeOff,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  User,
  MoreHorizontal,
  Lock,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/colors';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { SectionHeader } from '@/components/SectionHeader';
import { mockWallets, mockAccounts, mockTransactions } from '@/mocks/wallets';

export default function WalletsScreen() {
  const router = useRouter();
  const [selectedWallet, setSelectedWallet] = useState(mockWallets[0]);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const toggleBalanceVisibility = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setBalanceVisible(!balanceVisible);
  };

  const walletAccounts = mockAccounts.filter(acc => acc.walletId === selectedWallet.id);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'My Wallets',
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

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.walletSelector}
          contentContainerStyle={styles.walletSelectorContent}
        >
          {mockWallets.map((wallet) => (
            <TouchableOpacity
              key={wallet.id}
              style={[
                styles.walletTab,
                wallet.id === selectedWallet.id && styles.walletTabActive,
              ]}
              onPress={() => setSelectedWallet(wallet)}
              activeOpacity={0.7}
            >
              <Text 
                style={[
                  styles.walletTabText,
                  wallet.id === selectedWallet.id && styles.walletTabTextActive,
                ]}
              >
                {wallet.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Available Balance</Text>
          
          <View style={styles.balanceRow}>
            <Animated.Text style={[styles.balanceAmount, { opacity: fadeAnim }]}>
              {balanceVisible 
                ? `KES ${selectedWallet.totalBalance.toLocaleString()}` 
                : '••••••'
              }
            </Animated.Text>
            <TouchableOpacity 
              onPress={toggleBalanceVisibility}
              activeOpacity={0.7}
            >
              {balanceVisible ? (
                <Eye size={24} color={Colors.neutral.gray700} />
              ) : (
                <EyeOff size={24} color={Colors.neutral.gray700} />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.balanceBreakdown}>
            Book: KES {selectedWallet.bookBalance.toLocaleString()} • 
            Available: KES {selectedWallet.availableBalance.toLocaleString()}
          </Text>

          <Badge 
            text={selectedWallet.walletNumber} 
            variant="neutral" 
            style={styles.walletNumberBadge}
          />
        </Card>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <View style={[styles.actionIcon, { backgroundColor: '#D1FAE5' }]}>
              <ArrowDownLeft size={20} color={Colors.status.verifiedGreen} />
            </View>
            <Text style={styles.actionText}>Deposit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
              <ArrowUpRight size={20} color={Colors.status.securityBlue} />
            </View>
            <Text style={styles.actionText}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <View style={[styles.actionIcon, { backgroundColor: '#FED7AA' }]}>
              <DollarSign size={20} color={Colors.status.pendingOrange} />
            </View>
            <Text style={styles.actionText}>Withdraw</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.neutral.gray100 }]}>
              <Plus size={20} color={Colors.neutral.gray700} />
            </View>
            <Text style={styles.actionText}>More</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <SectionHeader 
            title={`Accounts (${walletAccounts.length})`} 
            actionText="See All"
            onActionPress={() => {}}
          />

          {walletAccounts.map((account, index) => (
            <AccountCard key={account.id} account={account} delay={index * 100} />
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader 
            title="Recent Transactions" 
            actionText="See All"
            onActionPress={() => {}}
          />

          {mockTransactions.map((transaction, index) => (
            <TransactionItem 
              key={transaction.id} 
              transaction={transaction} 
              delay={index * 100}
            />
          ))}
        </View>

        <Card style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockWallets.length}</Text>
              <Text style={styles.statLabel}>Total Wallets</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockAccounts.length}</Text>
              <Text style={styles.statLabel}>Accounts</Text>
            </View>
          </View>
          <View style={styles.statsRowDivider} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>KES</Text>
              <Text style={styles.statLabel}>Primary Currency</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.secureIcon}>
                <Lock size={16} color={Colors.status.verifiedGreen} />
              </View>
              <Text style={styles.statValue}>Secure</Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>
        </Card>

        <View style={styles.footer} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <Plus size={24} color={Colors.neutral.white} />
      </TouchableOpacity>
    </View>
  );
}

function AccountCard({ account, delay }: { account: typeof mockAccounts[0]; delay: number }) {
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
        { 
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        }
      ]}
    >
      <Card style={styles.accountCard}>
        <View style={styles.accountHeader}>
          <View style={styles.accountIconContainer}>
            <User size={20} color={Colors.primary.blue} />
          </View>
          <TouchableOpacity>
            <MoreHorizontal size={20} color={Colors.neutral.gray700} />
          </TouchableOpacity>
        </View>

        <Text style={styles.accountName}>{account.name}</Text>
        <Text style={styles.accountNumber}>{account.number}</Text>

        <Text style={styles.accountBalanceLabel}>Available Balance</Text>
        <Text style={styles.accountBalance}>
          KES {account.availableBalance.toLocaleString()}
        </Text>

        <View style={styles.accountFooter}>
          <View style={styles.statusContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{account.status}</Text>
          </View>
          <Badge text={account.type} variant="neutral" />
        </View>
      </Card>
    </Animated.View>
  );
}

function TransactionItem({ 
  transaction, 
  delay 
}: { 
  transaction: typeof mockTransactions[0]; 
  delay: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay, fadeAnim]);

  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'deposit':
        return <ArrowDownLeft size={20} color={Colors.status.verifiedGreen} />;
      case 'transfer':
        return <ArrowUpRight size={20} color={Colors.primary.blue} />;
      case 'withdrawal':
        return <ArrowUpRight size={20} color={Colors.primary.red} />;
    }
  };

  const getIconBgColor = () => {
    switch (transaction.type) {
      case 'deposit':
        return '#D1FAE5';
      case 'transfer':
        return '#DBEAFE';
      case 'withdrawal':
        return '#FEE2E2';
    }
  };

  const isPositive = transaction.amount > 0;

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity style={styles.transactionItem} activeOpacity={0.7}>
        <View style={[styles.transactionIcon, { backgroundColor: getIconBgColor() }]}>
          {getTransactionIcon()}
        </View>

        <View style={styles.transactionContent}>
          <Text style={styles.transactionTitle}>{transaction.title}</Text>
          <Text style={styles.transactionReference}>{transaction.reference}</Text>
        </View>

        <View style={styles.transactionRight}>
          <Text 
            style={[
              styles.transactionAmount,
              { color: isPositive ? Colors.status.verifiedGreen : Colors.primary.red }
            ]}
          >
            {isPositive ? '+' : ''}KES {Math.abs(transaction.amount).toLocaleString()}
          </Text>
          <Text style={styles.transactionDate}>{transaction.date}</Text>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  walletSelector: {
    marginBottom: Spacing.md,
  },
  walletSelectorContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  walletTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral.gray100,
  },
  walletTabActive: {
    backgroundColor: Colors.primary.blue,
  },
  walletTabText: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray700,
    fontWeight: '600',
  },
  walletTabTextActive: {
    color: Colors.neutral.white,
  },
  balanceCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  balanceLabel: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
    marginBottom: Spacing.sm,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  balanceAmount: {
    ...Typography.displayLarge,
    color: Colors.neutral.gray900,
  },
  balanceBreakdown: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
    marginBottom: Spacing.sm,
  },
  walletNumberBadge: {
    alignSelf: 'flex-start',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
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
  section: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  accountCard: {
    marginBottom: Spacing.md,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  accountIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.neutral.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountName: {
    ...Typography.heading2,
    color: Colors.neutral.gray900,
    marginBottom: Spacing.xs,
  },
  accountNumber: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
    marginBottom: Spacing.md,
  },
  accountBalanceLabel: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
    marginBottom: Spacing.xs,
  },
  accountBalance: {
    ...Typography.heading1,
    color: Colors.neutral.gray900,
    marginBottom: Spacing.md,
  },
  accountFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.status.verifiedGreen,
  },
  statusText: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray900,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionReference: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    marginBottom: 2,
  },
  transactionDate: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
  },
  statsGrid: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsRowDivider: {
    height: 1,
    backgroundColor: Colors.neutral.gray200,
    marginVertical: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.neutral.gray200,
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
  secureIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
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
  footer: {
    height: Spacing.lg,
  },
});
