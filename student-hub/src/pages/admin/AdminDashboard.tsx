import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, ClipboardList, FileText } from "lucide-react";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalAssignments: number;
  totalQuizzes: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/stats");
      setStats(response.data.data || response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Total Teachers",
      value: stats?.totalTeachers || 0,
      icon: GraduationCap,
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Total Classes",
      value: stats?.totalClasses || 0,
      icon: BookOpen,
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Total Assignments",
      value: stats?.totalAssignments || 0,
      icon: ClipboardList,
      gradient: "from-orange-500 to-orange-600",
    },
    {
      title: "Total Quizzes",
      value: stats?.totalQuizzes || 0,
      icon: FileText,
      gradient: "from-pink-500 to-pink-600",
    },
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">System overview and statistics</p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-20 bg-muted" />
                <CardContent className="h-24 bg-muted/50" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="overflow-hidden border-border hover:shadow-lg transition-shadow">
                  <CardHeader className={`bg-gradient-to-br ${stat.gradient} text-white pb-4`}>
                    <Icon className="h-8 w-8" />
                  </CardHeader>
                  <CardContent className="pt-6">
                    <CardTitle className="text-3xl font-bold text-foreground">{stat.value}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href="/admin/users" className="block p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">Manage Users</span>
                </div>
              </a>
              <a href="/admin/classes" className="block p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="font-medium">Manage Classes</span>
                </div>
              </a>
<a href="/admin/assignments" className="block p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
  <div className="flex items-center gap-3">
    <ClipboardList className="h-5 w-5 text-primary" />
    <span className="font-medium">Manage Assignments</span>
  </div>
</a>
              <a href="/admin/quizzes" className="block p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-medium">Quiz Analytics</span>
                </div>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">API Status</span>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <span className="text-sm font-medium text-green-600">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm font-medium text-foreground">{new Date().toLocaleTimeString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
