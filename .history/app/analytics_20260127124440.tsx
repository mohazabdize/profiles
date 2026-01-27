import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  DollarSign,
  Users,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Download,
  Share2,
  Lightbulb,
  ChevronRight,
  Target,
  Award,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  MoreVertical,
  Info,
  Shield,
  Globe,
  TrendingUp as Growth,
  Percent,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/colors';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { SectionHeader } from '@/components/SectionHeader';
import { LineChart } from '@/components/charts/LineChart';
import { ProgressRing } from '@/components/charts/ProgressRing';
import { ScoreGauge } from '@/components/charts/ScoreGauge';
import { ContributionMap } from '@/components/charts/ContributionMap';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const CHART_HEIGHT = isTablet ? 220 : 180;

// Enhanced data structures for international analytics
interface ScoreFactor {
  id: string;
  name: string;
  weight: number;
  score: number;
  maxScore: number;
  description: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  impact: number;
  benchmark: number;
  category: 'financial' | 'social' | 'behavioral' | 'reputation';
}

interface BenchmarkComparison {
  metric: string;
  userValue: number;
  groupAverage: number;
  topQuartile: number;
  difference: number;
  unit: string;
}

interface PredictiveInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timeframe: 'short' | 'medium' | 'long';
  action?: string;
}

const mockScoreFactors: ScoreFactor[] = [
  {
    id: '1',
    name: 'Contribution Consistency',
    weight: 30,
    score: 27,
    maxScore: 30,
    description: 'Regularity of contributions measured by coefficient of variation',
    status: 'good',
    trend: 'up',
    impact: 4.2,
    benchmark: 24,
    category: 'financial',
  },
  {
    id: '2',
    name: 'Payment Timeliness',
    weight: 25,
    score: 22,
    maxScore: 25,
    description: 'On-time payment history with 30-day rolling average',
    status: 'good',
    trend: 'stable',
    impact: 3.8,
    benchmark: 20,
    category: 'financial',
  },
  {
    id: '3',
    name: 'Group Participation Index',
    weight: 20,
    score: 16,
    maxScore: 20,
    description: 'Meeting attendance + engagement score + contribution to discussions',
    status: 'warning',
    trend: 'down',
    impact: 2.5,
    benchmark: 15,
    category: 'social',
  },
  {
    id: '4',
    name: 'Peer Feedback Score',
    weight: 15,
    score: 13,
    maxScore: 15,
    description: 'Weighted average of trust ratings from verified peers',
    status: 'good',
    trend: 'up',
    impact: 1.8,
    benchmark: 11,
    category: 'reputation',
  },
  {
    id: '5',
    name: 'Risk-Adjusted Compliance',
    weight: 10,
    score: 7,
    maxScore: 10,
    description: 'Penalties adjusted for tenure and group size',
    status: 'warning',
    trend: 'stable',
    impact: 1.2,
    benchmark: 8,
    category: 'behavioral',
  },
];

const mockHistoricalData = [
  { date: '2024-01', score: 72, contributions: 4, groupSize: 12 },
  { date: '2024-02', score: 74, contributions: 5, groupSize: 12 },
  { date: '2024-03', score: 71, contributions: 3, groupSize: 14 },
  { date: '2024-04', score: 76, contributions: 6, groupSize: 14 },
  { date: '2024-05', score: 78, contributions: 7, groupSize: 15 },
  { date: '2024-06', score: 81, contributions: 8, groupSize: 15 },
  { date: '2024-07', score: 85, contributions: 9, groupSize: 16 },
  { date: '2024-08', score: 88, contributions: 9, groupSize: 16 },
];

const mockBenchmarks: BenchmarkComparison[] = [
  {
    metric: 'Avg Monthly Contribution',
    userValue: 450,
    groupAverage: 380,
    topQuartile: 520,
    difference: +18.4,
    unit: 'USD',
  },
  {
    metric: 'Response Time',
    userValue: 2.3,
    groupAverage: 4.1,
    topQuartile: 1.5,
    difference: -43.9,
    unit: 'hours',
  },
  {
    metric: 'Participation Rate',
    userValue: 85,
    groupAverage: 72,
    topQuartile: 94,
    difference: +18.1,
    unit: '%',
  },
  {
    metric: 'Trust Rating',
    userValue: 4.8,
    groupAverage: 4.2,
    topQuartile: 4.9,
    difference: +14.3,
    unit: '/5',
  },
];

const mockPredictiveInsights: PredictiveInsight[] = [
  {
    id: '1',
    type: 'optimization',
    title: 'Score projection: 92 in 90 days',
    description: 'Based on current trajectory and group expansion to 20 members',
    confidence: 85,
    impact: 'high',
    timeframe: 'medium',
    action: 'Maintain 95%+ attendance rate',
  },
  {
    id: '2',
    type: 'risk',
    title: 'Seasonal variation detected',
    description: 'Historical 5-7 point drop observed in Q4. Proactive planning recommended',
    confidence: 78,
    impact: 'medium',
    timeframe: 'long',
    action: 'Set up contribution buffer',
  },
  {
    id: '3',
    type: 'opportunity',
    title: 'Peer endorsement multiplier available',
    description: 'Complete 3 peer reviews this month to unlock 3-point bonus',
    confidence: 92,
    impact: 'low',
    timeframe: 'short',
  },
];

const mockKeyEvents = [
  { date: '2024-01-15', event: 'Joined Family Investment Group', score: 74, type: 'membership' },
  { date: '2024-04-22', event: 'Completed 6-month cycle with 100% record', score: 76, type: 'milestone' },
  { date: '2024-06-30', event: 'Peer endorsement from 3 senior members', score: 81, type: 'recognition' },
  { date: '2024-08-10', event: 'Group expanded to 16 members', score: 88, type: 'expansion' },
];

export default function AnalyticsScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'breakdown' | 'insights' | 'benchmarks'>('overview');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('90d');
  const [expandedFactors, setExpandedFactors] = useState<Set<string>>(new Set());
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  const scrollAnim = useRef(new Animated.Value(0)).current;

  const currentScore = 85;
  const previousScore = 81;
  const scoreTrend = currentScore > previousScore ? 'up' : currentScore < previousScore ? 'down' : 'stable';

  // Calculate derived metrics
  const derivedMetrics = useMemo(() => ({
    consistencyScore: Math.round((mockScoreFactors[0].score / mockScoreFactors[0].maxScore) * 100),
    growthRate: ((currentScore - mockHistoricalData[0].score) / mockHistoricalData[0].score * 100).toFixed(1),
    percentile: 87,
    volatility: 4.2,
  }), []);

  useEffect(() => {
    const position = 
      selectedTab === 'overview' ? 0 : 
      selectedTab === 'breakdown' ? 1 : 
      selectedTab === 'benchmarks' ? 2 : 3;
    
    Animated.spring(tabIndicatorAnim, {
      toValue: position,
      useNativeDriver: true,
      tension: 90,
      friction: 12,
    }).start();
  }, [selectedTab, tabIndicatorAnim]);

  const tabIndicatorTranslate = tabIndicatorAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0, screenWidth / 4, (screenWidth / 4) * 2, (screenWidth / 4) * 3],
  });

  const toggleFactorExpansion = (id: string) => {
    const newSet = new Set(expandedFactors);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedFactors(newSet);
  };

  const getStatusColor = (status: ScoreFactor['status']) => {
    switch (status) {
      case 'good': return Colors.status.verifiedGreen;
      case 'warning': return Colors.primary.yellow;
      case 'critical': return Colors.primary.red;
    }
  };

  const getTrendIcon = (trend: ScoreFactor['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp size={16} color={Colors.status.verifiedGreen} />;
      case 'down': return <TrendingDown size={16} color={Colors.primary.red} />;
      case 'stable': return <Minus size={16} color={Colors.neutral.gray700} />;
    }
  };

  const renderScoreOverview = () => (
    <Card style={styles.scoreOverviewCard}>
      <View style={styles.scoreHeader}>
        <View>
          <Text style={styles.scoreLabel}>TRUST SCORE</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreValue}>{currentScore}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
          <View style={styles.scoreTrendBadge}>
            {scoreTrend === 'up' && <TrendingUp size={14} color={Colors.status.verifiedGreen} />}
            <Text style={[styles.scoreTrendText, scoreTrend === 'up' ? styles.scoreTrendUp : styles.scoreTrendDown]}>
              {scoreTrend === 'up' ? '+' : ''}{currentScore - previousScore} points
            </Text>
          </View>
        </View>
        <ScoreGauge score={currentScore} size={isTablet ? 140 : 100} />
      </View>

      <View style={styles.tierBadgeContainer}>
        <Badge 
          text="PREMIUM TIER" 
          variant="premium" 
          icon={<Award size={14} />}
        />
        <View style={styles.tierMetrics}>
          <Text style={styles.tierMetric}>
            <Shield size={12} color={Colors.neutral.gray700} /> Top {derivedMetrics.percentile}%
          </Text>
          <Text style={styles.tierMetric}>
            <Growth size={12} color={Colors.neutral.gray700} /> {derivedMetrics.growthRate}% growth
          </Text>
          <Text style={styles.tierMetric}>
            <Percent size={12} color={Colors.neutral.gray700} /> {derivedMetrics.volatility} volatility
          </Text>
        </View>
      </View>

      <View style={styles.derivedMetrics}>
        <View style={styles.derivedMetric}>
          <Text style={styles.derivedMetricValue}>{derivedMetrics.consistencyScore}%</Text>
          <Text style={styles.derivedMetricLabel}>Consistency</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.derivedMetric}>
          <Text style={styles.derivedMetricValue}>{mockHistoricalData.length}</Text>
          <Text style={styles.derivedMetricLabel}>Months Tracked</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.derivedMetric}>
          <Text style={styles.derivedMetricValue}>16</Text>
          <Text style={styles.derivedMetricLabel}>Group Size</Text>
        </View>
      </View>
    </Card>
  );

  const renderHistoricalChart = () => (
    <Card style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <SectionHeader title="Performance Timeline" />
        <View style={styles.timeframeSelector}>
          {(['7d', '30d', '90d', '1y'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setTimeframe(period)}
              style={[styles.timeframeButton, timeframe === period && styles.timeframeButtonActive]}
            >
              <Text style={[styles.timeframeText, timeframe === period && styles.timeframeTextActive]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <LineChart 
        data={mockHistoricalData}
        height={CHART_HEIGHT}
        xKey="date"
        yKey="score"
        showGrid
        showPoints
        lineColor={Colors.primary.blue}
        areaColor={`${Colors.primary.blue}20`}
      />
      
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary.blue }]} />
          <Text style={styles.legendText}>Trust Score</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.status.verifiedGreen }]} />
          <Text style={styles.legendText}>Contributions</Text>
        </View>
      </View>
    </Card>
  );

  const renderScoreBreakdown = () => (
    <>
      <View style={styles.section}>
        <SectionHeader 
          title="Score Composition Analysis" 
          subtitle="Weighted components with performance indicators"
          action={
            <TouchableOpacity style={styles.infoButton}>
              <Info size={16} color={Colors.neutral.gray600} />
            </TouchableOpacity>
          }
        />
        
        {mockScoreFactors.map((factor) => (
          <ScoreFactorCard 
            key={factor.id}
            factor={factor}
            isExpanded={expandedFactors.has(factor.id)}
            onToggle={() => toggleFactorExpansion(factor.id)}
          />
        ))}
      </View>

      <Card style={styles.compositionCard}>
        <View style={styles.compositionHeader}>
          <PieChart size={20} color={Colors.neutral.gray700} />
          <Text style={styles.compositionTitle}>Score Composition</Text>
        </View>
        <View style={styles.compositionGrid}>
          {mockScoreFactors.map((factor) => (
            <View key={factor.id} style={styles.compositionItem}>
              <View style={[styles.compositionColor, { backgroundColor: getStatusColor(factor.status) }]} />
              <Text style={styles.compositionName}>{factor.name}</Text>
              <Text style={styles.compositionWeight}>{factor.weight}%</Text>
            </View>
          ))}
        </View>
      </Card>
    </>
  );

  const renderBenchmarks = () => (
    <>
      <View style={styles.section}>
        <SectionHeader 
          title="Comparative Analytics" 
          subtitle="Performance relative to group metrics"
        />
        
        <Card style={styles.benchmarkCard}>
          <View style={styles.benchmarkHeader}>
            <Globe size={20} color={Colors.neutral.gray700} />
            <Text style={styles.benchmarkTitle}>Group Benchmarks</Text>
            <Text style={styles.benchmarkSubtitle}>Regional average: 16 members</Text>
          </View>
          
          {mockBenchmarks.map((benchmark) => (
            <View key={benchmark.metric} style={styles.benchmarkRow}>
              <View style={styles.benchmarkInfo}>
                <Text style={styles.benchmarkMetric}>{benchmark.metric}</Text>
                <Text style={styles.benchmarkComparison}>
                  {benchmark.difference > 0 ? '+' : ''}{benchmark.difference.toFixed(1)}% vs avg
                </Text>
              </View>
              <View style={styles.benchmarkValues}>
                <View style={styles.benchmarkValue}>
                  <Text style={styles.benchmarkNumber}>{benchmark.userValue}</Text>
                  <Text style={styles.benchmarkUnit}>{benchmark.unit}</Text>
                </View>
                <ChevronRight size={16} color={Colors.neutral.gray400} />
                <View style={styles.benchmarkValue}>
                  <Text style={[styles.benchmarkNumber, styles.benchmarkAverage]}>
                    {benchmark.groupAverage}
                  </Text>
                  <Text style={styles.benchmarkUnit}>avg</Text>
                </View>
                <View style={styles.benchmarkValue}>
                  <Text style={[styles.benchmarkNumber, styles.benchmarkTop]}>
                    {benchmark.topQuartile}
                  </Text>
                  <Text style={styles.benchmarkUnit}>top 25%</Text>
                </View>
              </View>
            </View>
          ))}
        </Card>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Advanced Analytics Dashboard',
          headerStyle: {
            backgroundColor: Colors.neutral.white,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: Colors.neutral.gray200,
          },
          headerTitleStyle: {
            ...Typography.heading3,
            color: Colors.neutral.gray900,
            fontWeight: '600',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={Colors.neutral.gray700} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.headerAction}>
              <Download size={20} color={Colors.primary.blue} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.tabContainer}>
        <View style={styles.tabRow}>
          {(['overview', 'breakdown', 'benchmarks', 'insights'] as const).map((tab) => (
            <TouchableOpacity 
              key={tab}
              style={styles.tab}
              onPress={() => setSelectedTab(tab)}
              activeOpacity={0.6}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {selectedTab === tab && (
                <View style={styles.activeTabIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {selectedTab === 'overview' && (
          <>
            {renderScoreOverview()}
            {renderHistoricalChart()}
            
            <View style={styles.section}>
              <SectionHeader 
                title="Key Performance Indicators" 
                subtitle="Real-time metrics dashboard"
              />
              <View style={styles.kpiGrid}>
                <Card style={styles.kpiCard}>
                  <View style={styles.kpiHeader}>
                    <Clock size={20} color={Colors.primary.blue} />
                    <Text style={styles.kpiTitle}>Active Duration</Text>
                  </View>
                  <Text style={styles.kpiValue}>12 months</Text>
                  <Text style={styles.kpiTrend}>+100% consistency</Text>
                </Card>
                
                <Card style={styles.kpiCard}>
                  <View style={styles.kpiHeader}>
                    <DollarSign size={20} color={Colors.status.verifiedGreen} />
                    <Text style={styles.kpiTitle}>Payment Rate</Text>
                  </View>
                  <Text style={styles.kpiValue}>98.7%</Text>
                  <Text style={styles.kpiTrend}>Top 15% percentile</Text>
                </Card>
                
                <Card style={styles.kpiCard}>
                  <View style={styles.kpiHeader}>
                    <Users size={20} color={Colors.status.premiumPurple} />
                    <Text style={styles.kpiTitle}>Network Quality</Text>
                  </View>
                  <Text style={styles.kpiValue}>9.2/10</Text>
                  <Text style={styles.kpiTrend}>+3 verified peers</Text>
                </Card>
                
                <Card style={styles.kpiCard}>
                  <View style={styles.kpiHeader}>
                    <BarChart3 size={20} color={Colors.primary.yellow} />
                    <Text style={styles.kpiTitle}>Growth Rate</Text>
                  </View>
                  <Text style={styles.kpiValue}>+18.1%</Text>
                  <Text style={styles.kpiTrend}>YoY improvement</Text>
                </Card>
              </View>
            </View>
          </>
        )}

        {selectedTab === 'breakdown' && renderScoreBreakdown()}
        {selectedTab === 'benchmarks' && renderBenchmarks()}

        {selectedTab === 'insights' && (
          <>
            <View style={styles.section}>
              <SectionHeader 
                title="Predictive Insights" 
                subtitle="AI-powered recommendations and projections"
              />
              
              {mockPredictiveInsights.map((insight) => (
                <PredictiveInsightCard key={insight.id} insight={insight} />
              ))}
            </View>

            <View style={styles.section}>
              <SectionHeader title="Actionable Recommendations" />
              <Card>
                {[
                  { icon: CheckCircle, title: 'Maintain current contribution pattern', impact: 'High' },
                  { icon: Users, title: 'Increase participation in Q4 planning', impact: 'Medium' },
                  { icon: Target, title: 'Aim for 90+ score by year end', impact: 'High' },
                ].map((rec, index) => (
                  <View key={index} style={styles.recommendationRow}>
                    <View style={styles.recommendationIcon}>
                      <rec.icon size={20} color={Colors.primary.blue} />
                    </View>
                    <View style={styles.recommendationContent}>
                      <Text style={styles.recommendationTitle}>{rec.title}</Text>
                      <Text style={styles.recommendationImpact}>Impact: {rec.impact}</Text>
                    </View>
                    <ChevronRight size={16} color={Colors.neutral.gray400} />
                  </View>
                ))}
              </Card>
            </View>

            <View style={styles.section}>
              <SectionHeader title="Data Export & Sharing" />
              <Card>
                <TouchableOpacity style={styles.exportButton}>
                  <View style={styles.exportIcon}>
                    <Download size={20} color={Colors.neutral.white} />
                  </View>
                  <View style={styles.exportContent}>
                    <Text style={styles.exportTitle}>Comprehensive Report</Text>
                    <Text style={styles.exportSubtitle}>PDF with detailed analytics</Text>
                  </View>
                  <Text style={styles.exportSize}>2.4 MB</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.exportButton}>
                  <View style={[styles.exportIcon, { backgroundColor: Colors.status.verifiedGreen }]}>
                    <Share2 size={20} color={Colors.neutral.white} />
                  </View>
                  <View style={styles.exportContent}>
                    <Text style={styles.exportTitle}>Share Scorecard</Text>
                    <Text style={styles.exportSubtitle}>Secure link with selected metrics</Text>
                  </View>
                  <Text style={styles.exportSize}>Link</Text>
                </TouchableOpacity>
              </Card>
            </View>
          </>
        )}

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

// Enhanced Score Factor Component with expandable details
function ScoreFactorCard({ 
  factor, 
  isExpanded, 
  onToggle 
}: { 
  factor: ScoreFactor; 
  isExpanded: boolean; 
  onToggle: () => void;
}) {
  const percentage = (factor.score / factor.maxScore) * 100;
  const statusColor = getStatusColor(factor.status);

  return (
    <Card style={styles.factorCard}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
        <View style={styles.factorHeader}>
          <View style={styles.factorInfo}>
            <View style={styles.factorTitleRow}>
              <Text style={styles.factorName}>{factor.name}</Text>
              <Badge 
                text={factor.category.toUpperCase()} 
                variant="outline" 
                size="small"
              />
            </View>
            <Text style={styles.factorDescription}>{factor.description}</Text>
          </View>
          
          <View style={styles.factorScore}>
            <Text style={styles.factorScoreValue}>{factor.score}</Text>
            <Text style={styles.factorScoreMax}>/{factor.maxScore}</Text>
            {getTrendIcon(factor.trend)}
          </View>
        </View>

        <View style={styles.factorProgressContainer}>
          <View style={styles.factorProgressInfo}>
            <Text style={styles.factorWeight}>Weight: {factor.weight}%</Text>
            <Text style={styles.factorImpact}>Impact: {factor.impact} pts</Text>
          </View>
          <View style={styles.factorProgressBar}>
            <View 
              style={[
                styles.factorProgressFill, 
                { 
                  width: `${percentage}%`,
                  backgroundColor: statusColor,
                }
              ]} 
            />
            <View 
              style={[
                styles.benchmarkMarker,
                { left: `${(factor.benchmark / factor.maxScore) * 100}%` }
              ]} 
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>0</Text>
            <Text style={styles.progressLabel}>{factor.maxScore}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.factorDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Benchmark:</Text>
            <Text style={styles.detailValue}>{factor.benchmark}/{factor.maxScore}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Trend:</Text>
            <View style={styles.detailValue}>
              {getTrendIcon(factor.trend)}
              <Text style={styles.trendText}>
                {factor.trend === 'up' ? 'Improving' : 
                 factor.trend === 'down' ? 'Declining' : 'Stable'}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Potential Gain:</Text>
            <Text style={[styles.detailValue, styles.potentialGain]}>
              +{factor.maxScore - factor.score} points
            </Text>
          </View>
        </View>
      )}
    </Card>
  );
}

function PredictiveInsightCard({ insight }: { insight: PredictiveInsight }) {
  const getTypeColor = () => {
    switch (insight.type) {
      case 'opportunity': return Colors.status.verifiedGreen;
      case 'risk': return Colors.primary.red;
      case 'optimization': return Colors.primary.blue;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return Colors.status.verifiedGreen;
    if (confidence >= 60) return Colors.primary.yellow;
    return Colors.primary.red;
  };

  return (
    <Card style={styles.insightCard}>
      <View style={[styles.insightTypeIndicator, { backgroundColor: getTypeColor() }]} />
      
      <View style={styles.insightContent}>
        <View style={styles.insightHeader}>
          <Text style={styles.insightTitle}>{insight.title}</Text>
          <View style={styles.confidenceBadge}>
            <Text style={[styles.confidenceText, { color: getConfidenceColor(insight.confidence) }]}>
              {insight.confidence}% confidence
            </Text>
          </View>
        </View>
        
        <Text style={styles.insightDescription}>{insight.description}</Text>
        
        <View style={styles.insightFooter}>
          <View style={styles.insightMeta}>
            <View style={[styles.impactBadge, { backgroundColor: `${getTypeColor()}20` }]}>
              <Text style={[styles.impactText, { color: getTypeColor() }]}>
                {insight.impact.toUpperCase()} IMPACT
              </Text>
            </View>
            <Text style={styles.timeframeText}>{insight.timeframe.toUpperCase()} TERM</Text>
          </View>
          
          {insight.action && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>{insight.action}</Text>
              <ChevronRight size={14} color={getTypeColor()} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.gray50,
  },
  headerButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.xs,
  },
  headerAction: {
    padding: Spacing.sm,
    marginRight: Spacing.xs,
  },
  tabContainer: {
    backgroundColor: Colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray200,
    ...Shadows.sm,
  },
  tabRow: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray600,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: Colors.primary.blue,
    fontWeight: '600',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '40%',
    backgroundColor: Colors.primary.blue,
    borderRadius: BorderRadius.xs,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: isTablet ? Spacing.xl : Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  // Score Overview
  scoreOverviewCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
    ...Shadows.md,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  scoreLabel: {
    ...Typography.labelSmall,
    color: Colors.neutral.gray600,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.xs,
  },
  scoreValue: {
    ...Typography.displayLarge,
    color: Colors.neutral.gray900,
    fontSize: isTablet ? 64 : 48,
    lineHeight: isTablet ? 72 : 56,
  },
  scoreMax: {
    ...Typography.heading2,
    color: Colors.neutral.gray600,
    marginLeft: 2,
  },
  scoreTrendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreTrendText: {
    ...Typography.labelSmall,
    fontWeight: '600',
  },
  scoreTrendUp: {
    color: Colors.status.verifiedGreen,
  },
  scoreTrendDown: {
    color: Colors.primary.red,
  },
  tierBadgeContainer: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray200,
  },
  tierMetrics: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  tierMetric: {
    ...Typography.labelSmall,
    color: Colors.neutral.gray700,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  derivedMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray200,
  },
  derivedMetric: {
    alignItems: 'center',
  },
  derivedMetricValue: {
    ...Typography.displayMedium,
    color: Colors.neutral.gray900,
    marginBottom: 2,
  },
  derivedMetricLabel: {
    ...Typography.labelSmall,
    color: Colors.neutral.gray600,
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: Colors.neutral.gray300,
    alignSelf: 'center',
  },
  // Chart Section
  chartCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.gray100,
    borderRadius: BorderRadius.sm,
    padding: 2,
  },
  timeframeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  timeframeButtonActive: {
    backgroundColor: Colors.neutral.white,
    ...Shadows.xs,
  },
  timeframeText: {
    ...Typography.labelSmall,
    color: Colors.neutral.gray600,
    fontWeight: '500',
  },
  timeframeTextActive: {
    color: Colors.primary.blue,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray200,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
  },
  legendText: {
    ...Typography.labelSmall,
    color: Colors.neutral.gray700,
  },
  // KPI Grid
  section: {
    marginBottom: Spacing.xl,
  },
  infoButton: {
    padding: Spacing.xs,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  kpiCard: {
    width: isTablet ? '48%' : '100%',
    padding: Spacing.lg,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  kpiTitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray700,
    fontWeight: '500',
  },
  kpiValue: {
    ...Typography.displayMedium,
    color: Colors.neutral.gray900,
    marginBottom: 4,
  },
  kpiTrend: {
    ...Typography.labelSmall,
    color: Colors.neutral.gray600,
  },
  // Score Factor Cards
  factorCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  factorInfo: {
    flex: 1,
    marginRight: Spacing.lg,
  },
  factorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  factorName: {
    ...Typography.bodyLarge,
    color: Colors.neutral.gray900,
    fontWeight: '600',
    flex: 1,
  },
  factorDescription: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
    lineHeight: 20,
  },
  factorScore: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 2,
  },
  factorScoreValue: {
    ...Typography.heading1,
    color: Colors.neutral.gray900,
  },
  factorScoreMax: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray600,
  },
  factorProgressContainer: {
    marginTop: Spacing.md,
  },
  factorProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  factorWeight: {
    ...Typography.labelSmall,
    color: Colors.neutral.gray700,
    fontWeight: '600',
  },
  factorImpact: {
    ...Typography.labelSmall,
    color: Colors.primary.blue,
    fontWeight: '600',
  },
  factorProgressBar: {
    height: 8,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: 4,
  },
  factorProgressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  benchmarkMarker: {
    position: 'absolute',
    top: -4,
    width: 2,
    height: 16,
    backgroundColor: Colors.neutral.gray900,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    ...Typography.labelXSmall,
    color: Colors.neutral.gray600,
  },
  factorDetails: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray200,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  detailLabel: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray600,
  },
  detailValue: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray900,
    fontWeight: '500',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    color: Colors.neutral.gray700,
  },
  potentialGain: {
    color: Colors.status.verifiedGreen,
  },
  // Composition Card
  compositionCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  compositionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  compositionTitle: {
    ...Typography.bodyLarge,
    color: Colors.neutral.gray900,
    fontWeight: '600',
  },
  compositionGrid: {
    gap: Spacing.sm,
  },
  compositionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  compositionColor: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.xs,
    marginRight: Spacing.md,
  },
  compositionName: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray700,
    flex: 1,
  },
  compositionWeight: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray900,
    fontWeight: '600',
  },
  // Benchmark Card
  benchmarkCard: {
    padding: Spacing.lg,
  },
  benchmarkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  benchmarkTitle: {
    ...Typography.bodyLarge,
    color: Colors.neutral.gray900,
    fontWeight: '600',
    flex: 1,
  },
  benchmarkSubtitle: {
    ...Typography.labelSmall,
    color: Colors.neutral.gray600,
  },
  benchmarkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray200,
  },
  benchmarkInfo: {
    flex: 1,
  },
  benchmarkMetric: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray900,
    fontWeight: '500',
    marginBottom: 2,
  },
  benchmarkComparison: {
    ...Typography.labelSmall,
    color: Colors.status.verifiedGreen,
  },
  benchmarkValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  benchmarkValue: {
    alignItems: 'center',
    minWidth: 60,
  },
  benchmarkNumber: {
    ...Typography.heading3,
    color: Colors.neutral.gray900,
  },
  benchmarkAverage: {
    color: Colors.neutral.gray600,
  },
  benchmarkTop: {
    color: Colors.status.premiumPurple,
  },
  benchmarkUnit: {
    ...Typography.labelXSmall,
    color: Colors.neutral.gray600,
    marginTop: 2,
  },
  // Insight Cards
  insightCard: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  insightTypeIndicator: {
    width: 4,
  },
  insightContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  insightTitle: {
    ...Typography.bodyLarge,
    color: Colors.neutral.gray900,
    fontWeight: '600',
    flex: 1,
  },
  confidenceBadge: {
    backgroundColor: Colors.neutral.gray100,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  confidenceText: {
    ...Typography.labelXSmall,
    fontWeight: '600',
  },
  insightDescription: {
    ...Typography.bodySmall,
    color: Colors.neutral.gray700,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  insightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  impactBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  impactText: {
    ...Typography.labelXSmall,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timeframeText: {
    ...Typography.labelXSmall,
    color: Colors.neutral.gray600,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionText: {
    ...Typography.labelSmall,
    color: Colors.primary.blue,
    fontWeight: '600',
  },
  // Recommendations
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray200,
  },
  recommendationIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary.blue + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray900,
    fontWeight: '500',
    marginBottom: 2,
  },
  recommendationImpact: {
    ...Typography.labelSmall,
    color: Colors.neutral.gray600,
  },
  // Export Section
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray200,
  },
  exportIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  exportContent: {
    flex: 1,
  },
  exportTitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral.gray900,
    fontWeight: '600',
    marginBottom: 2,
  },
  exportSubtitle: {
    ...Typography.labelSmall,
    color: Colors.neutral.gray600,
  },
  exportSize: {
    ...Typography.labelSmall,
    color: Colors.neutral.gray600,
    marginLeft: Spacing.sm,
  },
  footer: {
    height: Spacing.xxl,
  },
});