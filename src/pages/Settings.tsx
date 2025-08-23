import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  CreditCard,
  Users,
  Calendar,
  Package,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();
  const [businessSettings, setBusinessSettings] = useState({
    name: 'Elite Salon & Spa',
    description: 'Premium beauty and wellness services',
    phone: '+91 9876543210',
    email: 'contact@elitesalon.com',
    address: '123 Beauty Street, Fashion District, City - 400001',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    language: 'en'
  });

  const [operationalSettings, setOperationalSettings] = useState({
    workingHours: {
      start: '09:00',
      end: '21:00'
    },
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    appointmentDuration: 60,
    bufferTime: 15,
    allowOnlineBooking: true,
    requireDeposit: false,
    depositAmount: 0
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    lowStockAlerts: true,
    dailyReports: false,
    marketingEmails: true
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordComplexity: true,
    auditLogging: true
  });

  const handleSaveBusinessSettings = () => {
    // Here you would save to your backend/Supabase
    toast({
      title: "Settings Saved",
      description: "Business settings have been updated successfully.",
    });
  };

  const handleSaveOperationalSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Operational settings have been updated successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Settings Saved", 
      description: "Notification preferences have been updated.",
    });
  };

  const handleSaveSecurity = () => {
    toast({
      title: "Settings Saved",
      description: "Security settings have been updated.",
    });
  };

  const handleDataExport = () => {
    toast({
      title: "Export Started",
      description: "Your data export has been initiated. You'll receive an email when ready.",
    });
  };

  const handleDataImport = () => {
    toast({
      title: "Import Started", 
      description: "Data import process has been initiated.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure your salon management system
        </p>
      </div>

      <Tabs defaultValue="business" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="business" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            Business
          </TabsTrigger>
          <TabsTrigger value="operational" className="gap-2">
            <Clock className="h-4 w-4" />
            Operations
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Package className="h-4 w-4" />
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessSettings.name}
                    onChange={(e) => setBusinessSettings(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={businessSettings.currency} 
                    onValueChange={(value) => setBusinessSettings(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={businessSettings.description}
                  onChange={(e) => setBusinessSettings(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your business"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={businessSettings.phone}
                    onChange={(e) => setBusinessSettings(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={businessSettings.email}
                    onChange={(e) => setBusinessSettings(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  value={businessSettings.address}
                  onChange={(e) => setBusinessSettings(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Complete business address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={businessSettings.timezone} 
                    onValueChange={(value) => setBusinessSettings(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={businessSettings.language} 
                    onValueChange={(value) => setBusinessSettings(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिन्दी</SelectItem>
                      <SelectItem value="mr">मराठी</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSaveBusinessSettings}>Save Business Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Operational Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Opening Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={operationalSettings.workingHours.start}
                    onChange={(e) => setOperationalSettings(prev => ({ 
                      ...prev, 
                      workingHours: { ...prev.workingHours, start: e.target.value }
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="endTime">Closing Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={operationalSettings.workingHours.end}
                    onChange={(e) => setOperationalSettings(prev => ({ 
                      ...prev, 
                      workingHours: { ...prev.workingHours, end: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div>
                <Label>Working Days</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                    <Badge 
                      key={day}
                      variant={operationalSettings.workingDays.includes(day) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        setOperationalSettings(prev => ({
                          ...prev,
                          workingDays: prev.workingDays.includes(day)
                            ? prev.workingDays.filter(d => d !== day)
                            : [...prev.workingDays, day]
                        }));
                      }}
                    >
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appointmentDuration">Default Appointment Duration (minutes)</Label>
                  <Input
                    id="appointmentDuration"
                    type="number"
                    value={operationalSettings.appointmentDuration}
                    onChange={(e) => setOperationalSettings(prev => ({ 
                      ...prev, 
                      appointmentDuration: parseInt(e.target.value) 
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="bufferTime">Buffer Time Between Appointments (minutes)</Label>
                  <Input
                    id="bufferTime"
                    type="number"
                    value={operationalSettings.bufferTime}
                    onChange={(e) => setOperationalSettings(prev => ({ 
                      ...prev, 
                      bufferTime: parseInt(e.target.value) 
                    }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="onlineBooking">Allow Online Booking</Label>
                    <p className="text-sm text-muted-foreground">Enable customers to book appointments online</p>
                  </div>
                  <Switch
                    id="onlineBooking"
                    checked={operationalSettings.allowOnlineBooking}
                    onCheckedChange={(checked) => setOperationalSettings(prev => ({ 
                      ...prev, 
                      allowOnlineBooking: checked 
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireDeposit">Require Deposit</Label>
                    <p className="text-sm text-muted-foreground">Require customers to pay a deposit when booking</p>
                  </div>
                  <Switch
                    id="requireDeposit"
                    checked={operationalSettings.requireDeposit}
                    onCheckedChange={(checked) => setOperationalSettings(prev => ({ 
                      ...prev, 
                      requireDeposit: checked 
                    }))}
                  />
                </div>

                {operationalSettings.requireDeposit && (
                  <div>
                    <Label htmlFor="depositAmount">Deposit Amount (₹)</Label>
                    <Input
                      id="depositAmount"
                      type="number"
                      value={operationalSettings.depositAmount}
                      onChange={(e) => setOperationalSettings(prev => ({ 
                        ...prev, 
                        depositAmount: parseFloat(e.target.value) 
                      }))}
                    />
                  </div>
                )}
              </div>

              <Button onClick={handleSaveOperationalSettings}>Save Operational Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={key}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {key === 'emailNotifications' && 'Receive general notifications via email'}
                      {key === 'smsNotifications' && 'Receive notifications via SMS'}
                      {key === 'appointmentReminders' && 'Send appointment reminders to customers'}
                      {key === 'lowStockAlerts' && 'Get alerted when products are running low'}
                      {key === 'dailyReports' && 'Receive daily business summary reports'}
                      {key === 'marketingEmails' && 'Receive marketing and promotional emails'}
                    </p>
                  </div>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => setNotifications(prev => ({ 
                      ...prev, 
                      [key]: checked 
                    }))}
                  />
                </div>
              ))}

              <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  checked={security.twoFactorAuth}
                  onCheckedChange={(checked) => setSecurity(prev => ({ 
                    ...prev, 
                    twoFactorAuth: checked 
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={security.sessionTimeout}
                  onChange={(e) => setSecurity(prev => ({ 
                    ...prev, 
                    sessionTimeout: parseInt(e.target.value) 
                  }))}
                  className="w-32"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="passwordComplexity">Enforce Password Complexity</Label>
                  <p className="text-sm text-muted-foreground">Require strong passwords for all users</p>
                </div>
                <Switch
                  id="passwordComplexity"
                  checked={security.passwordComplexity}
                  onCheckedChange={(checked) => setSecurity(prev => ({ 
                    ...prev, 
                    passwordComplexity: checked 
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auditLogging">Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">Keep detailed logs of all system activities</p>
                </div>
                <Switch
                  id="auditLogging"
                  checked={security.auditLogging}
                  onCheckedChange={(checked) => setSecurity(prev => ({ 
                    ...prev, 
                    auditLogging: checked 
                  }))}
                />
              </div>

              <Button onClick={handleSaveSecurity}>Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Export Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export your business data for backup or migration purposes.
                  </p>
                  <Button onClick={handleDataExport} variant="outline">
                    Export All Data
                  </Button>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Import Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Import data from external systems or restore from backup.
                  </p>
                  <Button onClick={handleDataImport} variant="outline">
                    Import Data
                  </Button>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2 text-destructive">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Irreversible and destructive actions.
                  </p>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}