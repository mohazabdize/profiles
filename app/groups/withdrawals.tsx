import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { Colors, Spacing, Typography } from '@/constants/colors';
import { SectionHeader } from '@/components/SectionHeader';
import { Card } from '@/components/Card';

export default function GroupWithdrawalsScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Withdrawal Requests' }} />
      <View style={styles.content}>
        <SectionHeader title="Pending Requests" />
        <Card>
          <Text style={styles.placeholderText}>Review withdrawal requests here.</Text>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.gray50,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  placeholderText: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray700,
  },
});
