import { useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Brain, Users, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();

  const studentStats = [
    { icon: BookOpen, label: "Enrolled Classes", value: "5", color: "text-primary" },
    { icon: FileText, label: "Pending Assignments", value: "3", color: "text-accent" },
    { icon: Brain, label: "Quizzes Available", value: "2", color: "text-secondary" },
    { icon: TrendingUp, label: "Average Score", value: "85%", color: "text-success" },
  ];

  const teacherStats = [
    { icon: BookOpen, label: "My Classes", value: "3", color: "text-primary" },
    { icon: Users, label: "Total Students", value: "47", color: "text-secondary" },
    { icon: FileText, label: "Active Assignments", value: "8", color: "text-accent" },
    { icon: Brain, label: "Active Quizzes", value: "5", color: "text-warning" },
  ];

  const stats = user?.role === "student" ? studentStats : teacherStats;

  const recentActivities = [
    { title: "Mathematics Quiz", description: "Due in 2 days", time: "2 hours ago", type: "quiz" },
    { title: "English Essay", description: "Submitted", time: "1 day ago", type: "assignment" },
    { title: "Physics Class", description: "New material posted", time: "3 hours ago", type: "class" },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="rounded-2xl bg-gradient-hero p-8 text-white shadow-lg">
          <h1 className="mb-2 text-3xl font-bold">Welcome back, {user?.username}!</h1>
          <p className="text-white/90">
            {user?.role === "student"
              ? "Ready to continue your learning journey?"
              : user?.role === "teacher"
              ? "Manage your classes and track student progress"
              : "System administration and oversight"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {user?.role === "student" ? (
                <>
                  <Link to="/classes">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <BookOpen className="h-4 w-4" />
                      View My Classes
                    </Button>
                  </Link>
                  <Link to="/assignments">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <FileText className="h-4 w-4" />
                      Check Assignments
                    </Button>
                  </Link>
                  <Link to="/quizzes">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Brain className="h-4 w-4" />
                      Take a Quiz
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/classes">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <BookOpen className="h-4 w-4" />
                      Manage Classes
                    </Button>
                  </Link>
                  <Link to="/assignments">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <FileText className="h-4 w-4" />
                      Create Assignment
                    </Button>
                  </Link>
                  <Link to="/quizzes">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Brain className="h-4 w-4" />
                      Create Quiz
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    {activity.type === "quiz" && <Brain className="h-5 w-5 text-primary" />}
                    {activity.type === "assignment" && <FileText className="h-5 w-5 text-accent" />}
                    {activity.type === "class" && <BookOpen className="h-5 w-5 text-secondary" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
