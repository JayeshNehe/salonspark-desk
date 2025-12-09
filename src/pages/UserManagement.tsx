import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, Copy, Check, Trash2, AlertCircle, UserCheck, Crown } from "lucide-react";
import { useUsersWithRoles, useCreateReceptionist, generatePassword, useDeleteUserRole, useSalonHasReceptionist } from "@/hooks/useUserManagement";
import { format } from "date-fns";

export default function UserManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });

  const [createdCredentials, setCreatedCredentials] = useState({
    email: "",
    password: "",
  });

  const { data: users, isLoading } = useUsersWithRoles();
  const { data: hasReceptionist, isLoading: isCheckingReceptionist } = useSalonHasReceptionist();
  const createReceptionist = useCreateReceptionist();
  const deleteUserRole = useDeleteUserRole();

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setFormData({ ...formData, password: newPassword });
  };

  const handleCreateReceptionist = async () => {
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.password) {
      return;
    }

    const result = await createReceptionist.mutateAsync(formData);
    
    setCreatedCredentials({
      email: result.email,
      password: result.password,
    });
    
    setCreateDialogOpen(false);
    setCredentialsDialogOpen(true);
    
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      password: "",
    });
  };

  const handleCopy = (text: string, type: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const handleDeleteRole = (roleId: string) => {
    setSelectedRoleId(roleId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedRoleId) {
      deleteUserRole.mutate(selectedRoleId);
      setDeleteDialogOpen(false);
      setSelectedRoleId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Salon Users
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage admin and receptionist accounts
            </p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)} 
            className="gap-2"
            disabled={hasReceptionist || isCheckingReceptionist}
          >
            <UserPlus className="w-4 h-4" />
            {hasReceptionist ? "Receptionist Exists" : "Add Receptionist"}
          </Button>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading users...</div>
            ) : users && users.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.role_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                            user.role === 'admin' 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-secondary text-secondary-foreground'
                          }`}>
                            {user.role === 'admin' ? (
                              <Crown className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </div>
                          <span className="font-medium">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? 'Admin' : 'Receptionist'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.role !== 'admin' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRole(user.role_id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Receptionist Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Receptionist Account</DialogTitle>
              <DialogDescription>
                Enter details to create a new receptionist login for your salon.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="receptionist@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="text"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <Button type="button" variant="outline" onClick={handleGeneratePassword}>
                    Generate
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReceptionist} disabled={createReceptionist.isPending}>
                {createReceptionist.isPending ? "Creating..." : "Create Account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Credentials Display Dialog */}
        <Dialog open={credentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Account Created
              </DialogTitle>
              <DialogDescription>
                Share these credentials with the receptionist. They won't be shown again.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <div className="flex items-center justify-between mt-1">
                    <code className="text-sm font-mono bg-background px-2 py-1 rounded">{createdCredentials.email}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(createdCredentials.email, 'email')}
                    >
                      {copiedEmail ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Password</Label>
                  <div className="flex items-center justify-between mt-1">
                    <code className="text-sm font-mono bg-background px-2 py-1 rounded">{createdCredentials.password}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(createdCredentials.password, 'password')}
                    >
                      {copiedPassword ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The receptionist should login at <strong>/auth</strong> and select "Receptionist" login.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button onClick={() => setCredentialsDialogOpen(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Receptionist Access</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the receptionist's access. They will no longer be able to login.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Remove Access
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
}
