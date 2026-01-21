'use client';

import React, { useState, useEffect } from 'react';
import { Switch } from '@radix-ui/react-switch';
import { Check, ChevronLeft, ChevronsUpDown, X, Plus, Package, ChevronDown, CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { format } from 'date-fns/format';
import { Calendar } from '@/components/ui/calendar';

interface Customer {
  id: string;
  phoneNumber: string;
  name: string;
  address: string;
  status: string;
  referrals: number;
  membershipPlanId?: string;
  failedLoginCount: number;
  successLoginCount: number;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductVariant {
  id: string;
  name: string;
  price: string;
  stock?: number;
}

interface Product {
  value: string;
  label: string;
  price: string;
  variants?: ProductVariant[];
}

interface SelectedProduct extends Product {
  quantity: number;
  totalPrice: number;
  selectedVariant?: ProductVariant;
}

interface Offer {
  id: string;
  title: string;
  discountValue: number;
  discountUnit: string;
  minPurchaseAmount: number;
  status: string;
  type: string;
}

interface Coupon {
  id: string;
  title: string;
  discountValue: number;
  discountUnit: string;
  minPurchaseAmount: number;
  status: string;
  type: string;
}

export default function CreateOrder() {
  const [form, setForm] = useState({
    phone: '',
    name: '',
    address: '',
    paymentMethod: '',
    is_express: true,
    timeSlot: '',
    date: '',
    coupons: '',
    instructions: '',
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const formatINR = (amount: number) => `₹${amount.toFixed(2)}`;
  const formatAmount = (value: number) => value.toFixed(2);

  // Product selection states
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [openProductDropdown, setOpenProductDropdown] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<Product | null>(null);
  const [openVariantDropdown, setOpenVariantDropdown] = useState(false);

  // Offers and Coupons from localStorage
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [search, setSearch] = useState('');
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const [openCouponDropdown, setOpenCouponDropdown] = useState(false);

  const [isTimeSlotOpen, setIsTimeSlotOpen] = useState(false);
  const TIME_SLOTS = [
    { label: '10:00 AM - 12:00 PM', value: '10:00-12:00' },
    { label: '12:00 PM - 2:00 PM', value: '12:00-14:00' },
    { label: '2:00 PM - 4:00 PM', value: '14:00-16:00' },
    { label: '4:00 PM - 6:00 PM', value: '16:00-18:00' },
  ];

  const frameworks: Product[] = [
    {
      value: 'dove-soap',
      label: 'Dove Soap - Personal Care',
      price: '45',
      variants: [
        { id: 'dove-soap-75g', name: '75g Bar', price: '45' },
        { id: 'dove-soap-100g', name: '100g Bar', price: '65' },
        { id: 'dove-soap-125g', name: '125g Bar', price: '85' },
      ],
    },
    {
      value: 'colgate-toothpaste',
      label: 'Colgate Toothpaste - Oral Care',
      price: '65',
      variants: [
        { id: 'colgate-50g', name: '50g Tube', price: '45' },
        { id: 'colgate-100g', name: '100g Tube', price: '65' },
        { id: 'colgate-200g', name: '200g Tube', price: '120' },
      ],
    },
    {
      value: 'surf-excel-detergent',
      label: 'Surf Excel Detergent - Household Care',
      price: '120',
      variants: [
        { id: 'surf-excel-500g', name: '500g Pack', price: '120' },
        { id: 'surf-excel-1kg', name: '1kg Pack', price: '220' },
        { id: 'surf-excel-2kg', name: '2kg Pack', price: '420' },
      ],
    },
    { value: 'parle-g-biscuits', label: 'Parle-G Biscuits - Snacks', price: '10' },
    {
      value: 'tata-salt',
      label: 'Tata Salt - Grocery',
      price: '25',
      variants: [
        { id: 'tata-salt-1kg', name: '1kg Pack', price: '25' },
        { id: 'tata-salt-5kg', name: '5kg Pack', price: '120' },
        { id: 'tata-salt-10kg', name: '10kg Pack', price: '240' },
      ],
    },
    {
      value: 'maggi-noodles',
      label: 'Maggi Noodles - Instant Food',
      price: '14',
      variants: [
        { id: 'maggi-single', name: 'Single Pack', price: '14' },
        { id: 'maggi-4pack', name: '4 Pack Bundle', price: '52' },
        { id: 'maggi-12pack', name: '12 Pack Family', price: '150' },
      ],
    },
    {
      value: 'bru-coffee',
      label: 'Bru Coffee - Beverages',
      price: '85',
      variants: [
        { id: 'bru-50g', name: '50g Jar', price: '85' },
        { id: 'bru-100g', name: '100g Jar', price: '160' },
        { id: 'bru-200g', name: '200g Jar', price: '310' },
      ],
    },
    { value: 'amul-butter', label: 'Amul Butter - Dairy', price: '55' },
    {
      value: 'red-label-tea',
      label: 'Red Label Tea - Beverages',
      price: '160',
      variants: [
        { id: 'red-label-250g', name: '250g Pack', price: '160' },
        { id: 'red-label-500g', name: '500g Pack', price: '310' },
        { id: 'red-label-1kg', name: '1kg Pack', price: '600' },
      ],
    },
    {
      value: 'clinic-plus-shampoo',
      label: 'Clinic Plus Shampoo - Personal Care',
      price: '120',
      variants: [
        { id: 'clinic-plus-175ml', name: '175ml Bottle', price: '120' },
        { id: 'clinic-plus-340ml', name: '340ml Bottle', price: '220' },
        { id: 'clinic-plus-650ml', name: '650ml Bottle', price: '420' },
      ],
    },
    { value: 'fortune-refined-oil', label: 'Fortune Refined Oil - Grocery', price: '180' },
    { value: 'dettol-handwash', label: 'Dettol Handwash - Personal Hygiene', price: '75' },
    {
      value: 'lays-chips',
      label: 'Lays Chips - Snacks',
      price: '20',
      variants: [
        { id: 'lays-classic-small', name: 'Classic - 52g', price: '20' },
        { id: 'lays-classic-large', name: 'Classic - 90g', price: '40' },
        { id: 'lays-magic-masala', name: 'Magic Masala - 52g', price: '20' },
        { id: 'lays-american-style', name: 'American Style - 52g', price: '22' },
      ],
    },
    { value: 'nescafe-coffee', label: 'Nescafe Coffee - Beverages', price: '150' },
    { value: 'kissan-jam', label: 'Kissan Jam - Spreads', price: '95' },
    { value: 'harpic-toilet-cleaner', label: 'Harpic Toilet Cleaner - Household Care', price: '90' },
    { value: 'britannia-cake', label: 'Britannia Cake - Snacks', price: '25' },
    { value: 'pepsodent-toothpaste', label: 'Pepsodent Toothpaste - Oral Care', price: '60' },
    { value: 'vim-dishwash-liquid', label: 'Vim Dishwash Liquid - Household Care', price: '110' },
    { value: 'amul-milk-1l', label: 'Amul Milk 1L - Dairy', price: '65' },
  ];

  // Calculate base total (before discounts)
  const calculateBaseTotal = () => {
    return selectedProducts.reduce((total, product) => {
      const price = product.selectedVariant ? parseInt(product.selectedVariant.price) : parseInt(product.price);
      return total + price * product.quantity;
    }, 0);
  };

  // Calculate discount amount
  const calculateDiscountAmount = () => {
    const baseTotal = calculateBaseTotal();
    let totalDiscount = 0;

    // Apply coupon discount
    if (selectedCoupon) {
      if (baseTotal >= selectedCoupon.minPurchaseAmount) {
        if (selectedCoupon.discountUnit === 'PERCENTAGE') {
          totalDiscount += (baseTotal * selectedCoupon.discountValue) / 100;
        } else {
          totalDiscount += selectedCoupon.discountValue;
        }
      }
    }

    return Math.min(totalDiscount, baseTotal); // Discount cannot exceed total
  };

  // Calculate final total (after discounts)
  const calculateFinalTotal = () => {
    const baseTotal = calculateBaseTotal();
    const discountAmount = calculateDiscountAmount();
    return Math.max(0, baseTotal - discountAmount);
  };

  // Handle product selection (with variants)
  const handleProductSelect = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      setSelectedProductForVariant(product);
      setOpenProductDropdown(false);
      setOpenVariantDropdown(true);
    } else {
      addProduct(product);
    }
  };

  // Handle variant selection
  const handleVariantSelect = (variant: ProductVariant) => {
    if (selectedProductForVariant) {
      addProduct(selectedProductForVariant, variant);
    }
    setOpenVariantDropdown(false);
    setSelectedProductForVariant(null);
  };

  // Add product to selected products
  const addProduct = (product: Product, variant?: ProductVariant) => {
    const existingProductIndex = selectedProducts.findIndex((p) =>
      variant
        ? p.value === product.value && p.selectedVariant?.id === variant.id
        : p.value === product.value && !p.selectedVariant
    );

    const price = variant ? parseInt(variant.price) : parseInt(product.price);

    if (existingProductIndex !== -1) {
      const updatedProducts = [...selectedProducts];
      updatedProducts[existingProductIndex].quantity += 1;
      updatedProducts[existingProductIndex].totalPrice = updatedProducts[existingProductIndex].quantity * price;
      setSelectedProducts(updatedProducts);
    } else {
      const newProduct: SelectedProduct = {
        ...product,
        quantity: 1,
        totalPrice: price,
        selectedVariant: variant,
      };
      setSelectedProducts([...selectedProducts, newProduct]);
    }

    const productName = variant ? `${product.label.split(' - ')[0]} (${variant.name})` : product.label.split(' - ')[0];

    toast.success(`${productName} added to order`);
  };

  // Update product quantity
  const updateProductQuantity = (productValue: string, variantId: string | undefined, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeProduct(productValue, variantId);
      return;
    }

    const updatedProducts = selectedProducts.map((product) => {
      const isMatch = variantId
        ? product.value === productValue && product.selectedVariant?.id === variantId
        : product.value === productValue && !product.selectedVariant;

      if (isMatch) {
        const price = product.selectedVariant ? parseInt(product.selectedVariant.price) : parseInt(product.price);
        return {
          ...product,
          quantity: newQuantity,
          totalPrice: newQuantity * price,
        };
      }
      return product;
    });
    setSelectedProducts(updatedProducts);
  };

  // Remove product from selected products
  const removeProduct = (productValue: string, variantId?: string) => {
    const updatedProducts = selectedProducts.filter((p) => {
      if (variantId) {
        return !(p.value === productValue && p.selectedVariant?.id === variantId);
      }
      return !(p.value === productValue && !p.selectedVariant);
    });
    setSelectedProducts(updatedProducts);
    toast.success('Product removed from order');
  };

  const today = new Date();
  const minDate = form.is_express ? new Date(today.setDate(today.getDate() + 1)) : new Date();

  // Load data from localStorage
  useEffect(() => {
    const initializeData = () => {
      try {
        // Initialize customers
        const existingCustomersString = localStorage.getItem('customers');
        let existingCustomers: Customer[] = [];

        if (existingCustomersString) {
          existingCustomers = JSON.parse(existingCustomersString);
        }

        if (existingCustomers.length === 0) {
          const sampleCustomers: Customer[] = [
            {
              id: '1',
              phoneNumber: '9876543210',
              name: 'John Doe',
              address: '123 Main Street, Downtown, City - 12345',
              status: 'ACTIVE',
              referrals: 0,
              failedLoginCount: 0,
              successLoginCount: 5,
              lastLogin: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: '2',
              phoneNumber: '9123456789',
              name: 'Jane Smith',
              address: '456 Oak Avenue, Suburb, City - 67890',
              status: 'ACTIVE',
              referrals: 2,
              failedLoginCount: 1,
              successLoginCount: 12,
              lastLogin: new Date(Date.now() - 86400000).toISOString(),
              createdAt: new Date(Date.now() - 2592000000).toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: '3',
              phoneNumber: '9998887777',
              name: 'Mike Johnson',
              address: '789 Pine Street, Hillside, City - 54321',
              status: 'ACTIVE',
              referrals: 1,
              failedLoginCount: 0,
              successLoginCount: 8,
              lastLogin: new Date(Date.now() - 172800000).toISOString(),
              createdAt: new Date(Date.now() - 1296000000).toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];

          localStorage.setItem('customers', JSON.stringify(sampleCustomers));
          setCustomers(sampleCustomers);
        } else {
          setCustomers(existingCustomers);
        }

        // For demo purposes, create sample coupons (you can store these in localStorage too)
        const sampleCoupons: Coupon[] = [
          {
            id: '1',
            title: 'SAVE10 - 10% Off',
            discountValue: 10,
            discountUnit: 'PERCENTAGE',
            minPurchaseAmount: 100,
            status: 'ACTIVE',
            type: 'COUPON',
          },
          {
            id: '2',
            title: 'FLAT50 - ₹50 Off',
            discountValue: 50,
            discountUnit: 'FIXED',
            minPurchaseAmount: 200,
            status: 'ACTIVE',
            type: 'COUPON',
          },
          {
            id: '3',
            title: 'BIGDEAL - 20% Off',
            discountValue: 20,
            discountUnit: 'PERCENTAGE',
            minPurchaseAmount: 500,
            status: 'ACTIVE',
            type: 'COUPON',
          },
        ];
        setCoupons(sampleCoupons);
      } catch (error) {
        console.error('Error initializing data:', error);
        toast.error('Failed to load data');
      }
    };

    initializeData();
  }, []);

  // Handle phone number change and auto-fill customer data
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove everything except digits 0–9
    const phone = e.target.value.replace(/[^0-9]/g, '');

    // Limit to 10 digits
    if (phone.length > 10) return;

    setForm((prev) => ({ ...prev, phone }));

    if (phone.length === 10) {
      const customer = customers.find((c) => c.phoneNumber === phone);

      if (customer) {
        setExistingCustomer(customer);
        setForm((prev) => ({
          ...prev,
          name: customer.name,
          address: customer.address,
        }));
        toast.success(`Customer found: ${customer.name}`);
      } else {
        setExistingCustomer(null);
      }
    } else {
      setExistingCustomer(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle coupon selection
  const handleCouponSelect = (couponId: string) => {
    const coupon = coupons.find((c) => c.id === couponId);
    setSelectedCoupon(coupon || null);
    setOpenCouponDropdown(false);

    if (coupon) {
      const baseTotal = calculateBaseTotal();
      if (baseTotal < coupon.minPurchaseAmount) {
        toast.error(`Minimum purchase of ₹${coupon.minPurchaseAmount} required for this coupon`);
      } else {
        toast.success(`${coupon.title} applied successfully!`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.phone || !form.name || !form.address || !form.paymentMethod) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    // Express delivery validation
    if (!form.is_express && !form.timeSlot) {
      toast.error('Please select a time slot for express delivery');
      return;
    }

    try {
      // Handle customer creation/update
      let customerId = existingCustomer?.id;

      if (!existingCustomer) {
        const newCustomer: Customer = {
          id: Date.now().toString(),
          phoneNumber: form.phone,
          name: form.name,
          address: form.address,
          status: 'ACTIVE',
          referrals: 0,
          failedLoginCount: 0,
          successLoginCount: 1,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const updatedCustomers = [...customers, newCustomer];
        setCustomers(updatedCustomers);
        localStorage.setItem('customers', JSON.stringify(updatedCustomers));
        customerId = newCustomer.id;

        toast.success('New customer created');
      } else {
        const updatedCustomers = customers.map((c) =>
          c.id === existingCustomer.id
            ? { ...c, lastLogin: new Date().toISOString(), updatedAt: new Date().toISOString() }
            : c
        );
        setCustomers(updatedCustomers);
        localStorage.setItem('customers', JSON.stringify(updatedCustomers));
      }

      const baseTotal = calculateBaseTotal();
      const discountAmount = calculateDiscountAmount();
      const finalTotal = calculateFinalTotal();

      // Create order with selected products
      const newOrder = {
        id: Date.now().toString(),
        customerId: customerId,
        customerName: form.name,
        customerPhone: form.phone,
        customerAddress: form.address,
        paymentMethod: form.paymentMethod,
        isExpress: form.is_express,
        timeSlot: form.timeSlot || null,
        estimatedDeliveryDate: form.date,
        products: selectedProducts,
        selectedCoupon: selectedCoupon,
        instructions: form.instructions || null,
        status: 'PENDING',
        baseTotal: baseTotal,
        discountAmount: discountAmount,
        finalTotal: finalTotal,
        totalItems: selectedProducts.reduce((total, product) => total + product.quantity, 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Get existing orders from localStorage
      const existingOrdersString = localStorage.getItem('orders') || '[]';
      const existingOrders = JSON.parse(existingOrdersString);

      // Add new order
      const updatedOrders = [...existingOrders, newOrder];
      localStorage.setItem('orders', JSON.stringify(updatedOrders));

      console.log('Created new order:', newOrder);

      toast.success(`Order created successfully! Final Total: ₹${finalTotal}`);

      // Reset form
      setForm({
        phone: '',
        name: '',
        address: '',
        paymentMethod: '',
        is_express: false,
        timeSlot: '',
        date: '',
        coupons: '',
        instructions: '',
      });
      setSelectedProducts([]);
      setSelectedCoupon(null);
      setExistingCustomer(null);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    }
  };

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="bg-sidebar w-full overflow-y-auto rounded p-4 shadow-lg">
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Create Order</p>
          <Link
            href="/orders/order-list"
            className="bg-primary text-background flex cursor-pointer rounded px-3 py-2 text-sm transition"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-sidebar grid w-full grid-cols-1 gap-4 border px-6 py-6 shadow-sm md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handlePhoneChange}
                required
                maxLength={10}
                pattern="[0-9]*"
                className={`mt-1 w-full rounded border px-3 py-2 ${
                  existingCustomer ? 'border-green-300 bg-green-50' : 'bg-sidebar'
                }`}
                placeholder="Enter phone number...."
              />
              {existingCustomer && <p className="mt-1 text-xs text-green-600">✓ Existing customer found</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className={`mt-1 w-full rounded border px-3 py-2 ${
                  existingCustomer ? 'border-green-300 bg-green-50' : 'bg-sidebar'
                }`}
                placeholder="Customer name"
              />
            </div>

            <div>
              <label className="bg-sidebar block text-sm font-medium">
                Payment Method <span className="text-red-500">*</span>
              </label>

              <Popover open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="bg-sidebar flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2 text-left text-sm"
                  >
                    <span>
                      {form.paymentMethod
                        ? form.paymentMethod === 'netbanking'
                          ? 'Netbanking'
                          : form.paymentMethod === 'razorpay'
                            ? 'Razorpay'
                            : 'Cash on Delivery'
                        : 'Select payment method'}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  side="bottom"
                  sideOffset={0}
                  className="bg-sidebar w-(--radix-popover-trigger-width) rounded border border-t-0 p-2"
                >
                  {[
                    { label: 'Netbanking', value: 'netbanking' },
                    { label: 'Razorpay', value: 'razorpay' },
                    { label: 'Cash on Delivery', value: 'cod' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          paymentMethod: option.value,
                        }));
                        setIsPaymentOpen(false); // ✅ auto-close
                      }}
                      className="w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-gray-200"
                    >
                      {option.label}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>

            <div className="cursor-pointer">
              <label className="block text-sm font-medium">
                Time Slot {form.is_express && <span className="text-red-500">*</span>}
              </label>
              <Popover open={isTimeSlotOpen} onOpenChange={setIsTimeSlotOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    disabled={!form.is_express}
                    className={`bg-sidebar flex w-full items-center justify-between rounded border px-3 py-2 text-sm ${
                      !form.is_express ? 'cursor-not-allowed bg-gray-100 text-gray-400' : 'cursor-pointer'
                    }`}
                  >
                    <span>
                      {form.timeSlot
                        ? TIME_SLOTS.find((s) => s.value === form.timeSlot)?.label
                        : form.is_express
                          ? 'Select time slot'
                          : 'Enable express delivery'}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 opacity-60" />
                  </button>
                </PopoverTrigger>

                {form.is_express && (
                  <PopoverContent
                    align="start"
                    side="bottom"
                    sideOffset={0}
                    className="bg-sidebar w-(--radix-popover-trigger-width) rounded border border-t p-2"
                  >
                    <Command>
                      <CommandInput placeholder="Search time slot..." />
                      <CommandList>
                        <CommandEmpty>No time slot found.</CommandEmpty>

                        <CommandGroup>
                          {TIME_SLOTS.map((slot) => (
                            <CommandItem
                              key={slot.value}
                              value={slot.label}
                              onSelect={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  timeSlot: slot.value,
                                }));
                                setIsTimeSlotOpen(false); // auto-close
                              }}
                              className="flex items-center justify-between"
                            >
                              <span>{slot.label}</span>
                              {form.timeSlot === slot.value && <Check className="text-primary h-4 w-4" />}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                )}
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium">Estimated Delivery Date</label>

              <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    disabled={form.is_express}
                    className={`mt-1 flex w-full items-center justify-between rounded border px-3 py-2 text-left text-sm ${
                      form.is_express ? 'bg-sidebar cursor-not-allowed text-gray-400' : 'cursor-pointer bg-white'
                    }`}
                  >
                    <span>{form.date ? format(new Date(form.date), 'dd MMM yyyy') : 'Select delivery date'}</span>
                    <CalendarIcon className="h-4 w-4 opacity-60" />
                  </button>
                </PopoverTrigger>

                {!form.is_express && (
                  <PopoverContent align="start" side="bottom" sideOffset={4} className="p-0">
                    <Calendar
                      mode="single"
                      selected={form.date ? new Date(form.date) : undefined}
                      onSelect={(date) => {
                        if (!date) return;

                        setForm((prev) => ({
                          ...prev,
                          date: format(date, 'yyyy-MM-dd'),
                        }));

                        setIsDateOpen(false); // ✅ auto-close calendar
                      }}
                      disabled={(date) => date < minDate}
                      initialFocus
                    />
                  </PopoverContent>
                )}
              </Popover>
            </div>
          </div>

          <div className="bg-sidebar dark:shadow-dark-card mt-4 grid w-full grid-cols-1 gap-4 border-gray-200 px-6 py-6 shadow-sm md:grid-cols-2">
            {/* Coupons Dropdown */}
            <div>
              <label className="block text-sm font-medium">Coupons</label>
              <Popover open={openCouponDropdown} onOpenChange={setOpenCouponDropdown}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCouponDropdown}
                    className="w-full cursor-pointer justify-between py-2"
                  >
                    {selectedCoupon ? selectedCoupon.title : 'Select Coupons'}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="bg-sidebar w-(--radix-popover-trigger-width) rounded border border-t p-2">
                  <Command>
                    <CommandInput placeholder="Search coupons..." className="h-10" />
                    <CommandList>
                      <CommandEmpty>No coupon found.</CommandEmpty>

                      <CommandGroup>
                        {coupons.map((coupon) => (
                          <CommandItem
                            key={coupon.id}
                            value={coupon.title}
                            onSelect={() => handleCouponSelect(coupon.id)}
                            className="flex cursor-pointer flex-col items-start gap-1 p-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{coupon.title}</span>
                              <Check
                                className={cn(
                                  'ml-auto',
                                  selectedCoupon?.id === coupon.id ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                            </div>

                            <span className="text-sm text-gray-500">
                              {coupon.discountUnit === 'PERCENTAGE'
                                ? `${coupon.discountValue}% off`
                                : `₹${coupon.discountValue} off`}
                              {' • '}Min: ₹{coupon.minPurchaseAmount}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedCoupon && <div className="mt-1 text-xs text-blue-600">✓ {selectedCoupon.title} applied</div>}
            </div>

            <div>
              <label className="block text-sm font-medium">Instructions</label>
              <input
                type="text"
                name="instructions"
                value={form.instructions}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2"
                placeholder="Special delivery instructions"
              />
            </div>

            {/* Products Section */}
            <div>
              <label className="block text-sm font-medium">
                Products <span className="text-red-500">*</span>
              </label>

              {/* Product and Variant Selection Row */}
              <div className="mb-4 flex items-center gap-4">
                {/* Add Product Dropdown */}
                <div className="w-full lg:flex-1">
                  <Popover open={openProductDropdown} onOpenChange={setOpenProductDropdown}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openProductDropdown}
                        className="w-full cursor-pointer justify-between py-2"
                      >
                        <span className="flex items-center truncate">
                          <Plus className="mr-2 h-4 w-4 shrink-0" />
                          Add Product
                        </span>
                        <ChevronsUpDown className="ml-2 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-full p-2 sm:w-(--radix-popover-trigger-width)">
                      <Command>
                        <CommandInput placeholder="Search products..." className="h-10" />
                        <CommandList>
                          <CommandEmpty>No product found.</CommandEmpty>
                          <CommandGroup>
                            {frameworks.map((product) => (
                              <CommandItem
                                key={product.value}
                                value={product.value}
                                onSelect={() => handleProductSelect(product)}
                                className="flex cursor-pointer items-center justify-between"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className="truncate">{product.label.split(' - ')[0]}</span>
                                  {product.variants && <Package className="h-3 w-3 shrink-0 text-blue-500" />}
                                </div>
                                <span className="shrink-0 font-medium text-green-600">₹{product.price}+</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Variant Selection Dropdown  */}
                {selectedProductForVariant && (
                  <div className="flex-1">
                    <Popover open={openVariantDropdown} onOpenChange={setOpenVariantDropdown}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openVariantDropdown}
                          className="w-full min-w-0 flex-1 justify-start truncate text-left"
                        >
                          <span className="flex items-center">
                            <Package className="mr-2 h-4 w-4" />
                            Select {selectedProductForVariant.label.split(' - ')[0]} Variant
                          </span>
                          <ChevronsUpDown className="ml-auto shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
                        <Command>
                          <CommandInput placeholder="Search variants..." className="h-10" />
                          <CommandList>
                            <CommandEmpty>No variant found.</CommandEmpty>
                            <CommandGroup>
                              {selectedProductForVariant.variants?.map((variant) => (
                                <CommandItem
                                  key={variant.id}
                                  value={variant.id}
                                  onSelect={() => handleVariantSelect(variant)}
                                  className="flex cursor-pointer items-center justify-between"
                                >
                                  <span>{variant.name}</span>
                                  <span className="font-medium text-green-600">₹{variant.price}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {/* Cancel Button  */}
                {selectedProductForVariant && (
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setOpenVariantDropdown(false);
                        setSelectedProductForVariant(null);
                      }}
                      className="cursor-pointer rounded border px-3 py-2 text-sm text-red-500 hover:border-red-500 hover:text-red-600"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>

              {/* Selected Products Display */}
              {selectedProducts.length > 0 && (
                <div className="w-full rounded border p-4">
                  <h4 className="mb-3 font-medium">Selected Products:</h4>
                  <div className="space-y-2">
                    {selectedProducts.map((product, index) => {
                      const displayPrice = product.selectedVariant ? product.selectedVariant.price : product.price;
                      const productKey = product.selectedVariant
                        ? `${product.value}-${product.selectedVariant.id}`
                        : product.value;

                      return (
                        <div
                          key={`${productKey}-${index}`}
                          className="bg-sidebar flex items-center justify-between rounded border p-3"
                        >
                          <div className="flex-1">
                            <span className="font-medium">{product.label.split(' - ')[0]}</span>
                            {product.selectedVariant && (
                              <span className="ml-2 text-sm text-blue-600">({product.selectedVariant.name})</span>
                            )}
                            <span className="ml-2 text-sm text-gray-500">₹{displayPrice} each</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  updateProductQuantity(
                                    product.value,
                                    product.selectedVariant?.id,
                                    product.quantity - 1
                                  )
                                }
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded border"
                              >
                                -
                              </button>
                              <span className="w-8 text-center">{product.quantity}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateProductQuantity(
                                    product.value,
                                    product.selectedVariant?.id,
                                    product.quantity + 1
                                  )
                                }
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded border"
                              >
                                +
                              </button>
                            </div>
                            <span className="min-w-[60px] text-right font-medium text-green-600">
                              ₹{product.quantity * parseInt(displayPrice)}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeProduct(product.value, product.selectedVariant?.id)}
                              className="cursor-pointer text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-4 space-y-2 border px-2 pt-3 pb-2">
                    <div className="flex justify-between">
                      <span>Items ({selectedProducts.reduce((total, product) => total + product.quantity, 0)}):</span>
                      <span>₹{calculateBaseTotal()}</span>
                    </div>

                    {selectedCoupon && (
                      <div className="flex justify-between text-blue-600">
                        <span>Coupon ({selectedCoupon.title}):</span>
                        <span>-{formatINR(calculateDiscountAmount())}</span>
                      </div>
                    )}

                    <div className="flex justify-between border px-2 pt-2 text-lg font-bold">
                      <span>Final Total:</span>
                      <span className="text-green-600">₹{formatAmount(calculateFinalTotal())}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-sidebar mt-4 w-full border px-6 py-6 shadow-sm">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className={`h-20 w-full rounded border px-3 py-2 ${
                  existingCustomer ? 'border-green-300 bg-green-50' : 'bg-sidebar'
                }`}
                placeholder="Delivery address"
              />
            </div>

            <div className="md:col-span-3">
              <div className="flex items-center justify-between rounded border p-4">
                <div>
                  <label htmlFor="isactive" className="block text-sm font-medium">
                    Express Delivery
                  </label>
                  <p className={`text-xs ${form.is_express ? 'text-orange-500' : 'text-gray-400'}`}>
                    {form.is_express
                      ? 'Express delivery enables same-day delivery with time slot selection'
                      : 'Express delivery is disabled.'}
                  </p>
                </div>
                <Switch
                  id="is_express"
                  checked={form.is_express}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({
                      ...prev,
                      is_express: checked,
                      timeSlot: checked ? prev.timeSlot : '', // clear when disabled
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors ${
                    form.is_express ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      form.is_express ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </Switch>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              className="bg-primary text-background mt-5 cursor-pointer rounded px-20 py-2 transition"
            >
              Create Order
              {selectedProducts.length > 0 && <span className="ml-2">₹{Number(calculateFinalTotal()).toFixed(2)}</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
