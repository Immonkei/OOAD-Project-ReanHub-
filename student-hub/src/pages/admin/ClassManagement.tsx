import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Plus, Trash2, Users } from "lucide-react";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface Class {
  _id: string;
  name: string;
  subject: string;
  description: string;
  classCode: string;
  teacher: {
    _id: string;
    username: string;
    email: string;
  };
  students: any[];
  createdAt: string;
}

interface Teacher {
  _id: string;
  username: string;
  email: string;
}

export default function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newClass, setNewClass] = useState({
    name: "",
    subject: "",
    description: "",
    teacherId: "",
  });

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/classes");
      const data = response.data.data || response.data;
      setClasses(data.classes || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch classes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get("/admin/users", { params: { role: "teacher" } });
      const data = response.data.data || response.data;
      setTeachers(data.users || []);
    } catch (error: any) {
      console.error("Failed to fetch teachers:", error);
    }
  };

  const createClass = async () => {
    try {
      await api.post("/admin/classes", newClass);
      toast({ title: "Success", description: "Class created successfully" });
      setCreateDialogOpen(false);
      setNewClass({ name: "", subject: "", description: "", teacherId: "" });
      fetchClasses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create class",
        variant: "destructive",
      });
    }
  };

  const deleteClass = async (classId: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;

    try {
      await api.delete(`/admin/classes/${classId}`);
      toast({ title: "Success", description: "Class deleted successfully" });
      fetchClasses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete class",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Class Management</h1>
            <p className="text-muted-foreground mt-2">Manage all classes in the system</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Class</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Class Name</Label>
                  <Input
                    id="name"
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newClass.subject}
                    onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newClass.description}
                    onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="teacher">Assign Teacher</Label>
                  <Select value={newClass.teacherId} onValueChange={(value) => setNewClass({ ...newClass, teacherId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher._id} value={teacher._id}>
                          {teacher.username} ({teacher.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createClass} className="w-full">Create Class</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-24 bg-muted" />
                <CardContent className="h-32 bg-muted/50" />
              </Card>
            ))
          ) : (
            classes.map((classItem) => (
              <Card key={classItem._id} className="border-border hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      <CardTitle className="text-lg">{classItem.name}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteClass(classItem._id)}
                      className="text-primary-foreground hover:bg-white/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm opacity-90">{classItem.subject}</p>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <p className="text-sm text-muted-foreground">{classItem.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Teacher:</span>
                    <span className="font-medium">{classItem.teacher?.username || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Class Code:</span>
                    <span className="font-mono font-medium">{classItem.classCode}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {classItem.students?.length || 0} students enrolled
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
