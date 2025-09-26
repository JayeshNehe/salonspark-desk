import { useState } from 'react';
import { useServices, useCreateService, useUpdateService, useDeleteService } from '@/hooks/useServices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, IndianRupee, Edit, Power, PowerOff } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

export default function Services() {
  const { data: services, isLoading } = useServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    duration_minutes: 60,
    price: 0,
    status: 'active' as 'active' | 'inactive'
  });

  const [durationHours, setDurationHours] = useState(1);
  const [durationMinutes, setDurationMinutes] = useState(0);

  // Convert minutes to hours and minutes for display
  const minutesToHoursAndMinutes = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
  };

  // Convert hours and minutes to total minutes
  const hoursAndMinutesToMinutes = (hours: number, minutes: number) => {
    return (hours * 60) + minutes;
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalMinutes = hoursAndMinutesToMinutes(durationHours, durationMinutes);
    await createService.mutateAsync({
      ...newService,
      duration_minutes: totalMinutes
    });
    setNewService({
      name: '',
      description: '',
      duration_minutes: 60,
      price: 0,
      status: 'active'
    });
    setDurationHours(1);
    setDurationMinutes(0);
    setIsDialogOpen(false);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    const { hours, minutes } = minutesToHoursAndMinutes(service.duration_minutes);
    setDurationHours(hours);
    setDurationMinutes(minutes);
    setNewService({
      name: service.name,
      description: service.description || '',
      duration_minutes: service.duration_minutes,
      price: service.price,
      status: service.status
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    
    const totalMinutes = hoursAndMinutesToMinutes(durationHours, durationMinutes);
    await updateService.mutateAsync({
      id: editingService.id,
      data: {
        ...newService,
        duration_minutes: totalMinutes
      }
    });
    
    setNewService({
      name: '',
      description: '',
      duration_minutes: 60,
      price: 0,
      status: 'active'
    });
    setDurationHours(1);
    setDurationMinutes(0);
    setEditingService(null);
    setIsEditDialogOpen(false);
  };

  const toggleServiceStatus = async (service) => {
    const newStatus = service.status === 'active' ? 'inactive' : 'active';
    await updateService.mutateAsync({
      id: service.id,
      data: { status: newStatus }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Services
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your service catalog and pricing
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-muted"></CardHeader>
              <CardContent className="h-16 bg-muted"></CardContent>
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
            Services
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your service catalog and pricing
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  value={newService.name}
                  onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Hair Cut, Facial, Massage"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newService.description}
                  onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Service description..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="duration_hours" className="text-xs text-muted-foreground">Hours</Label>
                      <Input
                        id="duration_hours"
                        type="number"
                        value={durationHours}
                        onChange={(e) => setDurationHours(parseInt(e.target.value) || 0)}
                        min="0"
                        max="12"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration_minutes" className="text-xs text-muted-foreground">Minutes</Label>
                      <Input
                        id="duration_minutes"
                        type="number"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                        min="0"
                        max="59"
                        step="15"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newService.status} 
                  onValueChange={(value: 'active' | 'inactive') => 
                    setNewService(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createService.isPending}>
                  {createService.isPending ? 'Creating...' : 'Create Service'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services?.map((service) => (
          <Card key={service.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                  {service.status}
                </Badge>
              </div>
              {service.description && (
                <p className="text-sm text-muted-foreground">{service.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {(() => {
                      const { hours, minutes } = minutesToHoursAndMinutes(service.duration_minutes);
                      if (hours > 0 && minutes > 0) {
                        return `${hours}h ${minutes}m`;
                      } else if (hours > 0) {
                        return `${hours}h`;
                      } else {
                        return `${minutes}m`;
                      }
                    })()}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-semibold">
                  <IndianRupee className="h-4 w-4" />
                  <span>{formatCurrency(service.price)}</span>
                </div>
              </div>
              {service.service_categories && (
                <p className="text-xs text-muted-foreground mt-2">
                  Category: {service.service_categories.name}
                </p>
              )}
            </CardContent>
            <div className="p-4 pt-0 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleEditService(service)}
                className="flex-1"
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Button 
                variant={service.status === 'active' ? 'destructive' : 'default'}
                size="sm" 
                onClick={() => toggleServiceStatus(service)}
                className="flex-1"
              >
                {service.status === 'active' ? (
                  <>
                    <PowerOff className="w-3 h-3 mr-1" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Power className="w-3 h-3 mr-1" />
                    Activate
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateService} className="space-y-4">
            <div>
              <Label htmlFor="edit_name">Service Name</Label>
              <Input
                id="edit_name"
                value={newService.name}
                onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Hair Cut, Facial, Massage"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={newService.description}
                onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Service description..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="edit_duration_hours" className="text-xs text-muted-foreground">Hours</Label>
                    <Input
                      id="edit_duration_hours"
                      type="number"
                      value={durationHours}
                      onChange={(e) => setDurationHours(parseInt(e.target.value) || 0)}
                      min="0"
                      max="12"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_duration_minutes" className="text-xs text-muted-foreground">Minutes</Label>
                    <Input
                      id="edit_duration_minutes"
                      type="number"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                      min="0"
                      max="59"
                      step="15"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit_price">Price (₹)</Label>
                <Input
                  id="edit_price"
                  type="number"
                  value={newService.price}
                  onChange={(e) => setNewService(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit_status">Status</Label>
              <Select 
                value={newService.status} 
                onValueChange={(value: 'active' | 'inactive') => 
                  setNewService(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={updateService.isPending}>
                {updateService.isPending ? 'Updating...' : 'Update Service'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {services?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No services found</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Service
          </Button>
        </div>
      )}
    </div>
  );
}