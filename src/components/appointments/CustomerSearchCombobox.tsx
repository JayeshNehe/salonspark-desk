import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCustomers } from "@/hooks/useCustomers";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewCustomerForm } from "./NewCustomerForm";

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
}

interface CustomerSearchComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function CustomerSearchCombobox({ value, onValueChange }: CustomerSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  
  const { data: customers } = useCustomers(searchQuery);
  
  const selectedCustomer = customers?.find(customer => customer.id === value);

  const handleNewCustomerCreated = (customerId: string) => {
    onValueChange(customerId);
    setIsNewCustomerDialogOpen(false);
    setOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedCustomer
              ? `${selectedCustomer.first_name} ${selectedCustomer.last_name} - ${selectedCustomer.phone}`
              : "Search customer..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search by name or phone..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty className="py-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    No customer found
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsNewCustomerDialogOpen(true)}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add New Customer
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {customers?.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={`${customer.first_name} ${customer.last_name} ${customer.phone}`}
                    onSelect={() => {
                      onValueChange(customer.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === customer.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {customer.first_name} {customer.last_name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {customer.phone} {customer.email && `• ${customer.email}`}
                      </span>
                    </div>
                  </CommandItem>
                ))}
                {customers && customers.length > 0 && (
                  <CommandItem
                    onSelect={() => setIsNewCustomerDialogOpen(true)}
                    className="justify-center border-t"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Customer
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={isNewCustomerDialogOpen} onOpenChange={setIsNewCustomerDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Create a new customer profile to book an appointment.
            </DialogDescription>
          </DialogHeader>
          <NewCustomerForm 
            onCustomerCreated={handleNewCustomerCreated}
            onCancel={() => setIsNewCustomerDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}