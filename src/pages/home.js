import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Script, RehearsalSession } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Upload,
  BookOpen,
  Mic,
  TrendingUp,
  Clock,
  Target,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [stats, setStats] = useState({
    totalScripts: 0,
    totalSessions: 0,
    averageAccuracy: 0,
    recentSessions: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const scripts = await Script.list();
      const sessions = await RehearsalSession.list("-session_date", 5);

      const averageAccuracy =
        sessions.length > 0
          ? sessions.reduce(
              (sum, session) => sum + (session.accuracy_percentage || 0),
              0
            ) / sessions.length
          : 0;

      setStats({
        totalScripts: scripts.length,
        totalSessions: sessions.length,
        averageAccuracy: Math.round(averageAccuracy),
        recentSessions: sessions,
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Upload New Script",
      description: "Start with a photo of your script",
      icon: Upload,
      link: createPageUrl("Upload"),
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Browse Scripts",
      description: "View your script library",
      icon: BookOpen,
      link: createPageUrl("Scripts"),
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "View Performance",
      description: "Check your rehearsal progress",
      icon: TrendingUp,
      link: createPageUrl("Performance"),
      color: "from-green-500 to-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-red-700 to-amber-600 bg-clip-text text-transparent">
              LineCoach
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your personal rehearsal studio. Upload scripts, practice lines, and
            perfect your performance with AI-powered coaching.
          </p>
          <Link to={createPageUrl("Upload")}>
            <Button className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Upload className="w-5 h-5 mr-2" />
              Start Rehearsing
            </Button>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Scripts
              </CardTitle>
              <BookOpen className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalScripts}
              </div>
              <p className="text-xs text-gray-500">Total uploaded</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Sessions
              </CardTitle>
              <Mic className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalSessions}
              </div>
              <p className="text-xs text-gray-500">Practice sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Accuracy
              </CardTitle>
              <Target className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.averageAccuracy}%
              </div>
              <p className="text-xs text-gray-500">Average score</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Link to={action.link}>
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-6">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {action.title}
                      </h3>
                      <p className="text-gray-600">{action.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        {stats.recentSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recent Practice Sessions
            </h2>
            <div className="space-y-4">
              {stats.recentSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Mic className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {session.character_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {session.correct_lines}/{session.total_lines} lines
                            correct
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-green-600 font-semibold">
                          <Star className="w-4 h-4" />
                          {session.accuracy_percentage}%
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(session.session_date).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
