import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Search } from "lucide-react";

export default function Appointments() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Appointments
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your salon's appointments and schedule
          </p>
        </div>
        <Button className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary" />
            Appointments Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">Appointments module coming soon</h3>
            <p className="text-muted-foreground">
              Full appointment scheduling, calendar view, and status management will be implemented here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}