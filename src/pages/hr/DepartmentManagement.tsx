import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Plus, Users, Search, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DepartmentFormModal } from "@/components/hr/DepartmentFormModal";
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment, type Department } from "@/hooks/useDepartments";
import { toast } from "@/lib/toast-api";
import { SessionDebug } from "@/components/debug/SessionDebug";

const DepartmentManagement = () => {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | undefined>();
  const [deletingDepartment, setDeletingDepartment] = useState<Department | undefined>();

  const { data: departments = [], isLoading } = useDepartments(search);
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();

  const handleAddDepartment = () => {
    setEditingDepartment(undefined);
    setIsModalOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: { name: string; description?: string }) => {
    try {
      if (editingDepartment) {
        await updateDepartment.mutateAsync({
          id: editingDepartment.id,
          ...data,
        });
        toast.success("Department updated successfully");
      } else {
        await createDepartment.mutateAsync(data);
        toast.success("Department created successfully");
      }
      setIsModalOpen(false);
      setEditingDepartment(undefined);
    } catch (error: any) {
      toast.error(error.message || "Failed to save department");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDepartment) return;

    try {
      await deleteDepartment.mutateAsync(deletingDepartment.id);
      toast.success("Department deleted successfully");
      setDeletingDepartment(undefined);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete department");
    }
  };

  return (
    <div className="space-y-6">
      <SessionDebug />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Department Management</h1>
          <p className="text-muted-foreground">
            Manage departments, reporting lines, and team structures
          </p>
        </div>
        <Button onClick={handleAddDepartment} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : departments.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-muted">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-semibold">No departments found</h3>
            <p className="text-muted-foreground">
              {search
                ? "Try adjusting your search criteria"
                : "Get started by creating your first department"}
            </p>
            {!search && (
              <Button onClick={handleAddDepartment}>
                <Plus className="mr-2 h-4 w-4" />
                Add Department
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {departments.map((dept) => (
            <Card key={dept.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg truncate">{dept.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditDepartment(dept)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeletingDepartment(dept)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dept.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {dept.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-muted-foreground">Employees</span>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{dept.employee_count}</span>
                    </div>
                  </div>
                  {dept.manager && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Manager</span>
                      <span className="text-sm font-medium">{dept.manager.full_name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DepartmentFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDepartment(undefined);
        }}
        onSubmit={handleSubmit}
        department={editingDepartment}
        isLoading={createDepartment.isPending || updateDepartment.isPending}
      />

      <AlertDialog
        open={!!deletingDepartment}
        onOpenChange={(open) => !open && setDeletingDepartment(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingDepartment?.name}"? This action cannot be undone.
              {deletingDepartment && deletingDepartment.employee_count > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  Warning: This department has {deletingDepartment.employee_count} employee(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DepartmentManagement;
