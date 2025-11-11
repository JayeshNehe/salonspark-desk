import { useState } from 'react';
import { useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff } from '@/hooks/useStaff';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, User, Phone, Mail, Calendar, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Staff() {
  const { data: staff, isLoading } = useStaff();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
  
  const [newStaff, setNewStaff] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    specialization: [] as string[],
    hire_date: format(new Date(), 'yyyy-MM-dd'),
    salary: 0,
    commission_rate: 0,
    status: 'active' as 'active' | 'inactive' | 'on_leave'
  });

  const resetForm = () => {
    setNewStaff({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: '',
      specialization: [],
      hire_date: format(new Date(), 'yyyy-MM-dd'),
      salary: 0,
      commission_rate: 0,
      status: 'active'
    });
    setIsEditMode(false);
    setEditingStaffId(null);
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && editingStaffId) {
      await updateStaff.mutateAsync({ id: editingStaffId, data: newStaff });
    } else {
      await createStaff.mutateAsync(newStaff);
    }
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEditStaff = (member: any) => {
    setNewStaff({
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      specialization: member.specialization || [],
      hire_date: member.hire_date,
      salary: member.salary || 0,
      commission_rate: member.commission_rate || 0,
      status: member.status
    });
    setEditingStaffId(member.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setStaffToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (staffToDelete) {
      await deleteStaff.mutateAsync(staffToDelete);
      setDeleteConfirmOpen(false);
      setStaffToDelete(null);
    }
  };

  const handleSpecializationChange = (value: string) => {
    const specializations = value.split(',').map(s => s.trim()).filter(s => s);
    setNewStaff(prev => ({ ...prev, specialization: specializations }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'on_leave': return 'destructive';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Staff Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage staff profiles and schedules
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-muted"></CardHeader>
              <CardContent className="h-24 bg-muted"></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Staff Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage staff profiles and schedules
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={newStaff.first_name}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="John"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={newStaff.last_name}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 9876543210"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={newStaff.role}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="Hair Stylist, Beautician, etc."
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={newStaff.hire_date}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, hire_date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={newStaff.specialization.join(', ')}
                  onChange={(e) => handleSpecializationChange(e.target.value)}
                  placeholder="Hair Cutting, Color, Styling (comma-separated)"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salary">Monthly Salary (₹)</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={newStaff.salary}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, salary: parseFloat(e.target.value) }))}
                    min="0"
                    step="100"
                    placeholder="25000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    value={newStaff.commission_rate}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, commission_rate: parseFloat(e.target.value) }))}
                    min="0"
                    max="100"
                    step="0.5"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newStaff.status} 
                  onValueChange={(value: 'active' | 'inactive' | 'on_leave') => 
                    setNewStaff(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createStaff.isPending || updateStaff.isPending}>
                  {isEditMode 
                    ? (updateStaff.isPending ? 'Updating...' : 'Update Staff Member')
                    : (createStaff.isPending ? 'Creating...' : 'Create Staff Member')
                  }
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  resetForm();
                  setIsDialogOpen(false);
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {staff?.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {member.first_name} {member.last_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <Badge variant={getStatusColor(member.status) as any}>
                  {member.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Hired: {format(new Date(member.hire_date), 'MMM dd, yyyy')}</span>
                </div>
                {member.specialization && member.specialization.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-1">Specializations:</p>
                    <div className="flex flex-wrap gap-1">
                      {member.specialization.slice(0, 3).map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {member.specialization.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.specialization.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditStaff(member)}
                    className="flex-1"
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteClick(member.id)}
                    className="flex-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the staff member.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {staff?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No staff members found</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Staff Member
          </Button>
        </div>
      )}
    </div>
  );
}