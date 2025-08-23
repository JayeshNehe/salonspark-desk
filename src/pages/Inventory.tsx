import { useState } from 'react';
import { useProducts, useLowStockProducts, useCreateProduct } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Package, AlertTriangle, IndianRupee } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

export default function Inventory() {
  const { data: products, isLoading } = useProducts();
  const { data: lowStockProducts } = useLowStockProducts();
  const createProduct = useCreateProduct();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    brand: '',
    category: '',
    barcode: '',
    supplier: '',
    cost_price: 0,
    selling_price: 0,
    stock_quantity: 0,
    min_stock_level: 10
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProduct.mutateAsync(newProduct);
    setNewProduct({
      name: '',
      description: '',
      brand: '',
      category: '',
      barcode: '',
      supplier: '',
      cost_price: 0,
      selling_price: 0,
      stock_quantity: 0,
      min_stock_level: 10
    });
    setIsDialogOpen(false);
  };

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (current <= minimum) return { label: 'Low Stock', variant: 'destructive' as const };
    if (current <= minimum * 2) return { label: 'Warning', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Inventory
          </h1>
          <p className="text-muted-foreground mt-1">
            Track products and consumables
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
            Inventory
          </h1>
          <p className="text-muted-foreground mt-1">
            Track products and consumables
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Hair Oil, Face Cream"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="Brand name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Hair Care, Skin Care, etc."
                  />
                </div>
                
                <div>
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, barcode: e.target.value }))}
                    placeholder="Product barcode"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Product description..."
                />
              </div>

              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={newProduct.supplier}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, supplier: e.target.value }))}
                  placeholder="Supplier name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cost_price">Cost Price (₹)</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    value={newProduct.cost_price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, cost_price: parseFloat(e.target.value) }))}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="selling_price">Selling Price (₹)</Label>
                  <Input
                    id="selling_price"
                    type="number"
                    value={newProduct.selling_price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, selling_price: parseFloat(e.target.value) }))}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={newProduct.stock_quantity}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) }))}
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="min_stock_level">Minimum Stock Level</Label>
                  <Input
                    id="min_stock_level"
                    type="number"
                    value={newProduct.min_stock_level}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, min_stock_level: parseInt(e.target.value) }))}
                    min="1"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createProduct.isPending}>
                  {createProduct.isPending ? 'Creating...' : 'Create Product'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <Package className="h-4 w-4" />
            All Products ({products?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="low-stock" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Low Stock ({lowStockProducts?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products?.map((product) => {
              const stockStatus = getStockStatus(product.stock_quantity, product.min_stock_level);
              return (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        {product.brand && (
                          <p className="text-sm text-muted-foreground">{product.brand}</p>
                        )}
                      </div>
                      <Badge variant={stockStatus.variant}>
                        {stockStatus.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Stock:</span>
                        <span className="font-medium">
                          {product.stock_quantity} / {product.min_stock_level} min
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Cost:</span>
                        <span>{formatCurrency(product.cost_price)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Price:</span>
                        <span className="text-primary">{formatCurrency(product.selling_price)}</span>
                      </div>
                      {product.category && (
                        <p className="text-xs text-muted-foreground">
                          Category: {product.category}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="low-stock">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lowStockProducts?.map((product) => {
              const stockStatus = getStockStatus(product.stock_quantity, product.min_stock_level);
              return (
                <Card key={product.id} className="hover:shadow-md transition-shadow border-destructive">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        {product.brand && (
                          <p className="text-sm text-muted-foreground">{product.brand}</p>
                        )}
                      </div>
                      <Badge variant="destructive">
                        {stockStatus.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Stock:</span>
                        <span className="font-medium text-destructive">
                          {product.stock_quantity} / {product.min_stock_level} min
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Price:</span>
                        <span>{formatCurrency(product.selling_price)}</span>
                      </div>
                      {product.supplier && (
                        <p className="text-xs text-muted-foreground">
                          Supplier: {product.supplier}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
      
      {products?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No products found</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Product
          </Button>
        </div>
      )}
    </div>
  );
}