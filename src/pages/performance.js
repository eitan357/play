import React, { useState, useEffect } from "react";
import { RehearsalSession, Script } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Calendar,
  Target,
  Clock,
  Star,
  Award,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Performance() {
  const [sessions, setSessions] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    averageAccuracy: 0,
    totalCharacters: 0,
    improvementTrend: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    try {
      const [sessionList, scriptList] = await Promise.all([
        RehearsalSession.list("-session_date"),
        Script.list(),
      ]);

      setSessions(sessionList);
      setScripts(scriptList);

      // Calculate stats
      const totalSessions = sessionList.length;
      const averageAccuracy =
        totalSessions > 0
          ? sessionList.reduce(
              (sum, session) => sum + (session.accuracy_percentage || 0),
              0
            ) / totalSessions
          : 0;

      const uniqueCharacters = new Set(sessionList.map((s) => s.character_name))
        .size;

      // Calculate improvement trend (last 5 vs previous 5 sessions)
      const recentSessions = sessionList.slice(0, 5);
      const previousSessions = sessionList.slice(5, 10);
      const recentAvg =
        recentSessions.length > 0
          ? recentSessions.reduce((sum, s) => sum + s.accuracy_percentage, 0) /
            recentSessions.length
          : 0;
      const previousAvg =
        previousSessions.length > 0
          ? previousSessions.reduce(
              (sum, s) => sum + s.accuracy_percentage,
              0
            ) / previousSessions.length
          : 0;
      const improvementTrend = recentAvg - previousAvg;

      setStats({
        totalSessions,
        averageAccuracy: Math.round(averageAccuracy),
        totalCharacters: uniqueCharacters,
        improvementTrend: Math.round(improvementTrend),
      });
    } catch (error) {
      console.error("Error loading performance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getChartData = () => {
    return sessions
      .slice(-10) // Last 10 sessions
      .reverse()
      .map((session, index) => ({
        session: index + 1,
        accuracy: session.accuracy_percentage,
        date: new Date(session.session_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }));
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return "text-green-600 bg-green-100";
    if (accuracy >= 75) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
            </div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Performance Analytics
          </h1>
          <p className="text-lg text-gray-600">
            Track your rehearsal progress and improvement over time
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Sessions
              </CardTitle>
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalSessions}
              </div>
              <p className="text-xs text-gray-500">
                Practice sessions completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Average Score
              </CardTitle>
              <Target className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.averageAccuracy}%
              </div>
              <p className="text-xs text-gray-500">Overall accuracy</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Characters
              </CardTitle>
              <Award className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalCharacters}
              </div>
              <p className="text-xs text-gray-500">Different roles practiced</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Improvement
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  stats.improvementTrend >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stats.improvementTrend >= 0 ? "+" : ""}
                {stats.improvementTrend}%
              </div>
              <p className="text-xs text-gray-500">Recent trend</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Chart */}
        {sessions.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  Accuracy Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Accuracy"]}
                        labelFormatter={(label) => `Session: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ fill: "#3B82F6", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Clock className="w-6 h-6 text-purple-600" />
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Sessions Yet
                  </h3>
                  <p className="text-gray-500">
                    Start rehearsing to see your performance analytics here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.slice(0, 10).map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {session.character_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {session.correct_lines}/{session.total_lines} lines
                            correct
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(session.session_date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={`${getAccuracyColor(
                            session.accuracy_percentage
                          )} border-0`}
                        >
                          {session.accuracy_percentage}%
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {session.duration_minutes} min
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
