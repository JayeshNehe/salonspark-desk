import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ShoppingCart, 
  CreditCard, 
  Plus, 
  Minus, 
  IndianRupee,
  Calculator,
  Clock,
  User,
  Pause,
  Play
} from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useServices } from '@/hooks/useServices';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';
import { CustomerSearchCombobox } from '@/components/appointments/CustomerSearchCombobox';
import { useUserSalonId } from '@/hooks/useUserRoles';
import { usePendingBillings, useHeldTransactions, useHoldTransaction, useCompleteHeldTransaction, useDeleteHeldTransaction } from '@/hooks/useBilling';

interface CartItem {
  id: string;
  name: string;
  type: 'service' | 'product';
  price: number;
  quantity: number;
}

export default function Billing() {
  const { data: customers } = useCustomers();
  const { data: services } = useServices();  
  const { data: products } = useProducts();
  const { data: pendingBillings } = usePendingBillings();
  const { data: heldTransactions } = useHeldTransactions();
  const { toast } = useToast();
  const { data: salonId } = useUserSalonId();

  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('billing');
  
  const holdTransaction = useHoldTransaction();
  const completeHeldTransaction = useCompleteHeldTransaction();
  const deleteHeldTransaction = useDeleteHeldTransaction();

  // Load appointment service when customer is selected from pending billings
  useEffect(() => {
    if (selectedCustomer) {
      const pendingBilling = pendingBillings?.find(pb => pb.customer_id === selectedCustomer);
      if (pendingBilling && !cart.some(item => item.id === pendingBilling.service_id)) {
        setSelectedAppointmentId(pendingBilling.appointment_id);
        setCart([{
          id: pendingBilling.service_id,
          name: pendingBilling.service_name,
          type: 'service',
          price: pendingBilling.service_price,
          quantity: 1
        }]);
      }
    }
  }, [selectedCustomer, pendingBillings]);

  const addToCart = (item: { id: string; name: string; type: 'service' | 'product'; price: number }) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id && cartItem.type === item.type);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id && cartItem.type === item.type
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    setIsAddServiceDialogOpen(false);
    setIsAddProductDialogOpen(false);
  };

  const updateQuantity = (id: string, type: 'service' | 'product', newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => !(item.id === id && item.type === type)));
    } else {
      setCart(cart.map(item => 
        item.id === id && item.type === type 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const removeFromCart = (id: string, type: 'service' | 'product') => {
    setCart(cart.filter(item => !(item.id === id && item.type === type)));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal - discountAmount;

  const handleProcessPayment = async () => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Please add items to the cart before processing payment.",
        variant: "destructive",
      });
      return;
    }

    if (!salonId) {
      toast({
        title: "Error",
        description: "Salon information not found. Please ensure you have a salon profile.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Create the sale record
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          customer_id: selectedCustomer || null,
          salon_id: salonId,
          subtotal: subtotal,
          discount: discountAmount,
          tax: 0,
          total: total,
          payment_method: paymentMethod,
          payment_status: 'completed'
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItems = cart.map(item => ({
        sale_id: saleData.id,
        service_id: item.type === 'service' ? item.id : null,
        product_id: item.type === 'product' ? item.id : null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Update appointment status to billed if from appointment
      if (selectedAppointmentId) {
        await supabase
          .from('appointments')
          .update({ 
            status: 'completed'
          })
          .eq('id', selectedAppointmentId);
      }

      // Update product stock for products sold
      for (const item of cart.filter(i => i.type === 'product')) {
        const { data: currentProduct } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.id)
          .single();
          
        if (currentProduct) {
          await supabase
            .from('products')
            .update({ 
              stock_quantity: Math.max(0, currentProduct.stock_quantity - item.quantity)
            })
            .eq('id', item.id);
        }
      }
      
      toast({
        title: "Payment Processed",
        description: `Payment of ${formatCurrency(total)} has been processed successfully.`,
      });
      
      // Reset the cart and form
      setCart([]);
      setSelectedCustomer('');
      setSelectedAppointmentId('');
      setDiscountAmount(0);
      setPaymentMethod('cash');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleHoldTransaction = async () => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Please add items to the cart before holding transaction.",
        variant: "destructive",
      });
      return;
    }

    await holdTransaction.mutateAsync({
      customerId: selectedCustomer || null,
      cart,
      subtotal,
      discountAmount,
      paymentMethod
    });

    // Reset form
    setCart([]);
    setSelectedCustomer('');
    setSelectedAppointmentId('');
    setDiscountAmount(0);
    setActiveTab('held');
  };

  const handleResumeTransaction = async (transaction: any) => {
    // Delete the held transaction from database
    await deleteHeldTransaction.mutateAsync(transaction.id);
    
    // Load into cart
    setSelectedCustomer(transaction.customer_id || '');
    setCart(transaction.items);
    setDiscountAmount(transaction.discount_amount || 0);
    setPaymentMethod(transaction.payment_method || 'cash');
    setActiveTab('billing');
  };

  const handleCompleteHeldTransaction = async (transaction: any) => {
    await completeHeldTransaction.mutateAsync({
      saleId: transaction.id,
      paymentMethod: transaction.payment_method || 'cash',
      discountAmount: transaction.discount_amount || 0,
      appointmentId: undefined
    });
  };

  const filteredServices = services?.filter(service => 
    service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())
  ).map(service => ({
    id: service.id,
    name: service.name,
    type: 'service' as const,
    price: service.price,
    description: service.description,
    duration_minutes: service.duration_minutes
  })) || [];

  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
  ).map(product => ({
    id: product.id,
    name: product.name,
    type: 'product' as const,
    price: product.selling_price,
    category: product.category,
    stock_quantity: product.stock_quantity
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Billing & POS
          </h1>
          <p className="text-muted-foreground mt-1">
            Process payments and manage transactions
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="billing">New Billing</TabsTrigger>
          <TabsTrigger value="held">
            Held Transactions
            {heldTransactions && heldTransactions.length > 0 && (
              <Badge variant="secondary" className="ml-2">{heldTransactions.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="billing" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Cart and Customer Selection */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingBillings && pendingBillings.length > 0 && (
                    <div className="space-y-2">
                      <Label>Customers with Completed Appointments</Label>
                      <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer from completed appointments" />
                        </SelectTrigger>
                        <SelectContent>
                          {pendingBillings.map((billing) => (
                            <SelectItem key={billing.appointment_id} value={billing.customer_id}>
                              {billing.customer_name} - {billing.service_name} ({formatCurrency(billing.service_price)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Or Select Any Customer</Label>
                    <CustomerSearchCombobox
                      value={selectedCustomer}
                      onValueChange={setSelectedCustomer}
                    />
                  </div>
                </CardContent>
              </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Shopping Cart ({cart.length} items)
                </div>
                <div className="flex gap-2">
                  {/* Add Service Dialog */}
                  <Dialog open={isAddServiceDialogOpen} onOpenChange={setIsAddServiceDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add/Edit Service
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Service to Cart</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Search services..."
                          value={serviceSearchQuery}
                          onChange={(e) => setServiceSearchQuery(e.target.value)}
                        />
                        
                        <div className="max-h-96 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Service Name</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredServices.map((service) => (
                                <TableRow key={service.id}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{service.name}</div>
                                      {service.description && (
                                        <div className="text-sm text-muted-foreground">{service.description}</div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>{service.duration_minutes} min</TableCell>
                                  <TableCell>{formatCurrency(service.price)}</TableCell>
                                  <TableCell>
                                    <Button size="sm" onClick={() => addToCart(service)}>
                                      Add
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Add Product Dialog */}
                  <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Product to Cart</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Search products..."
                          value={productSearchQuery}
                          onChange={(e) => setProductSearchQuery(e.target.value)}
                        />
                        
                        <div className="max-h-96 overflow-y-auto">
                          <Table>
                            <TableHeader>
                               <TableRow>
                                <TableHead>Product Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredProducts.map((product) => (
                                 <TableRow key={product.id}>
                                  <TableCell className="font-medium">{product.name}</TableCell>
                                  <TableCell>{product.category || 'N/A'}</TableCell>
                                  <TableCell>
                                    <Badge variant={product.stock_quantity > 0 ? 'default' : 'destructive'}>
                                      {product.stock_quantity} units
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{formatCurrency(product.price)}</TableCell>
                                  <TableCell>
                                    <Button 
                                      size="sm" 
                                      onClick={() => addToCart(product)}
                                      disabled={product.stock_quantity === 0}
                                    >
                                      Add
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Your cart is empty</p>
                  <p className="text-sm">Add services or products to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item, index) => (
                      <TableRow key={`${item.type}-${item.id}-${index}`}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant={item.type === 'service' ? 'default' : 'secondary'}>
                            {item.type === 'service' ? 'Service' : 'Product'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(item.price * item.quantity)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => removeFromCart(item.id, item.type)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <Label htmlFor="discount">Discount:</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    className="w-24 text-right"
                    min="0"
                    max={subtotal}
                  />
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={handleProcessPayment}
                disabled={cart.length === 0}
              >
                <CreditCard className="h-4 w-4" />
                Process Payment
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full gap-2" onClick={handleHoldTransaction} disabled={cart.length === 0}>
                <Pause className="h-4 w-4" />
                Hold Transaction
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>

    <TabsContent value="held" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Held Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {heldTransactions && heldTransactions.length > 0 ? (
            <div className="space-y-4">
              {heldTransactions.map((transaction) => (
                <Card key={transaction.id} className="hover-lift">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">{transaction.customer_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge>{formatCurrency(transaction.subtotal - transaction.discount_amount)}</Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {transaction.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.name} x{item.quantity}</span>
                          <span>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 gap-2"
                        onClick={() => handleResumeTransaction(transaction)}
                      >
                        <Play className="h-4 w-4" />
                        Resume
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() => handleCompleteHeldTransaction(transaction)}
                      >
                        <CreditCard className="h-4 w-4" />
                        Complete Payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No held transactions</p>
              <p className="text-sm">Held transactions will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
    </div>
  );
}