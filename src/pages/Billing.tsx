import { useState } from 'react';
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
  Receipt, 
  Plus, 
  Minus, 
  IndianRupee,
  Calculator,
  Clock,
  User
} from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useServices } from '@/hooks/useServices';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxRate, setTaxRate] = useState(18);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    setIsAddItemDialogOpen(false);
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
  const discountedAmount = subtotal - discountAmount;
  const taxAmount = (discountedAmount * taxRate) / 100;
  const total = discountedAmount + taxAmount;

  const handleProcessPayment = async () => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Please add items to the cart before processing payment.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Here you would create a sale in your Supabase database
      toast({
        title: "Payment Processed",
        description: `Payment of ${formatCurrency(total)} has been processed successfully.`,
      });
      
      // Reset the cart and form
      setCart([]);
      setSelectedCustomer('');
      setDiscountAmount(0);
      setPaymentMethod('cash');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredItems = [
    ...(services?.filter(service => 
      service.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(service => ({
      id: service.id,
      name: service.name,
      type: 'service' as const,
      price: service.price,
      category: 'Service'
    })) || []),
    ...(products?.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(product => ({
      id: product.id,
      name: product.name,
      type: 'product' as const,
      price: product.selling_price,
      category: 'Product'
    })) || [])
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Billing & POS
          </h1>
          <p className="text-muted-foreground mt-1">
            Process payments and manage invoices
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Receipt className="h-4 w-4" />
            View Invoices
          </Button>
        </div>
      </div>

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
            <CardContent>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name} - {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Shopping Cart ({cart.length} items)
                </div>
                <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Items to Cart</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Search services and products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      
                      <div className="max-h-96 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredItems.map((item) => (
                              <TableRow key={`${item.type}-${item.id}`}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>
                                  <Badge variant={item.type === 'service' ? 'default' : 'secondary'}>
                                    {item.category}
                                  </Badge>
                                </TableCell>
                                <TableCell>{formatCurrency(item.price)}</TableCell>
                                <TableCell>
                                  <Button size="sm" onClick={() => addToCart(item)}>
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

                <div className="flex justify-between items-center">
                  <Label htmlFor="tax">Tax ({taxRate}%):</Label>
                  <span>{formatCurrency(taxAmount)}</span>
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
              <Button variant="outline" className="w-full gap-2">
                <Receipt className="h-4 w-4" />
                Print Receipt
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Clock className="h-4 w-4" />
                Hold Transaction
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}