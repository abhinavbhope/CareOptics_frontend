"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Star, Search, SlidersHorizontal, ChevronLeft, ChevronRight, User } from 'lucide-react';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { Header } from '@/components/opticare/Header';
import { Footer } from '@/components/opticare/Footer';
import { AuthForm } from '@/components/opticare/AuthForm';
import { getProducts } from '@/lib/productApi';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from 'use-debounce';
import { addToCart } from '@/lib/cartApi';
import { ProductReviewModal } from '@/components/opticare/ProductReviewModal';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

const StarRating = ({ rating }) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />)}
      </div>
    );
};


export default function EyeframesPage() {
  const { toast } = useToast();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [headerKey, setHeaderKey] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const productsPerPage = 12;

  const handleLoginSuccess = () => {
    setShowAuth(false);
    setHeaderKey(prevKey => prevKey + 1);
  };

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [filters, setFilters] = useState({
    category: [],
    gender: [],
    specsType: [],
    tags: [],
    priceRange: [0, 25000],
    minRating: 0,
    inStock: false,
    sort: 'averageRating,desc'
  });

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        search: debouncedSearchTerm || null,
        category: filters.category.length > 0 ? filters.category.join(',') : null,
        gender: filters.gender.length > 0 ? filters.gender.join(',') : null,
        specsType: filters.specsType.length > 0 ? filters.specsType.join(',') : null,
        tags: filters.tags.length > 0 ? filters.tags.join(',') : null,
        minPrice: filters.priceRange[0],
        maxPrice: filters.priceRange[1],
        minRating: filters.minRating > 0 ? filters.minRating : null,
        inStock: filters.inStock,
        page: currentPage,
        size: productsPerPage,
        sort: filters.sort,
      };

      // Remove null or undefined params
      Object.keys(params).forEach(key => params[key] == null && delete params[key]);

      const response = await getProducts(params);
setProducts(response.content || []);
setTotalPages(response.totalPages || 0);
setTotalElements(response.totalElements || 0);

    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast({
        variant: "destructive",
        title: "Failed to load products",
        description: "There was an error fetching the eyeframes. Please try again later.",
      });
      setProducts([]); // Ensure products is an array on error
    } finally {
      setIsLoading(false);
    }
  }, [toast, debouncedSearchTerm, filters, currentPage]);


  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  // Reset page to 0 when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearchTerm, filters]);

  
  // Close modal on escape key press
  useEffect(() => {
    const handleEsc = (event) => {
       if (event.key === 'Escape') {
          setSelectedProduct(null);
       }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
       window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handleCheckboxChange = (filterType, item, checked) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked
        ? [...prev[filterType], item]
        : prev[filterType].filter(g => g !== item)
    }));
  };
  
  const handleAddToCart = async (item) => {
    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!userId || !token || userId === "null" || userId === "") {
        toast({
        variant: "destructive",
        title: "Please login to add to cart",
        description: "You must be logged in to add products to your cart.",
        });
        return;
    }
    try {
        await addToCart({
            productId: item.id,
            productName: item.name,
            imageUrl: item.imageUrl,
            price: item.price,
            quantity: 1,
        });
        toast({
        title: `${item.name} added to cart!`,
        description: `Price: ₹${item.price}`,
        });
    } catch (error) {
        toast({
        variant: "destructive",
        title: "Failed to add to cart",
        description: error?.message || "Something went wrong.",
        });
    }
  };

  return (
    <div className="flex min-h-dvh w-full flex-col bg-background text-foreground">
       <Header key={headerKey} onOpenAuth={() => setShowAuth(true)} />

      {showAuth && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowAuth(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <AuthForm onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedProduct && (
            <ProductReviewModal 
                product={selectedProduct} 
                onClose={() => setSelectedProduct(null)} 
            />
        )}
      </AnimatePresence>

      <main className="flex-1">
        <motion.div
          className="container mx-auto max-w-7xl px-4 md:px-6 py-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters Sidebar */}
            <motion.aside
              className={`w-full md:w-1/4 lg:w-1/5 space-y-8 p-6 bg-card rounded-lg transition-all duration-300 md:block ${isFilterOpen ? 'block' : 'hidden'}`}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-xl font-bold font-headline">Filters</h2>
              {/* Category Filter */}
              <div>
                <h3 className="font-semibold mb-3">Category</h3>
                <div className="space-y-2">
                  {['Classic', 'Fashion', 'Sport', 'Vintage', 'Minimalist'].map(cat => (
                    <div key={cat} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat_${cat.toLowerCase()}`}
                        checked={filters.category.includes(cat)}
                        onCheckedChange={(checked) => handleCheckboxChange('category', cat, checked)}
                      />
                      <label htmlFor={`cat_${cat.toLowerCase()}`} className="text-sm text-muted-foreground">{cat}</label>
                    </div>
                  ))}
                </div>
              </div>

               {/* Specs Type Filter */}
              <div>
                <h3 className="font-semibold mb-3">Specs Type</h3>
                <div className="space-y-2">
                  {['Eyeglasses', 'Sunglasses'].map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type_${type.toLowerCase()}`}
                         checked={filters.specsType.includes(type)}
                        onCheckedChange={(checked) => handleCheckboxChange('specsType', type, checked)}
                      />
                      <label htmlFor={`type_${type.toLowerCase()}`} className="text-sm text-muted-foreground">{type}</label>
                    </div>
                  ))}
                </div>
              </div>


              {/* Gender Filter */}
              <div>
                <h3 className="font-semibold mb-3">Gender</h3>
                <div className="space-y-2">
                  {['Men', 'Women', 'Unisex'].map(gender => (
                    <div key={gender} className="flex items-center space-x-2">
                      <Checkbox
                        id={`gender_${gender.toLowerCase()}`}
                        checked={filters.gender.includes(gender)}
                        onCheckedChange={(checked) => handleCheckboxChange('gender', gender, checked)}
                      />
                      <label htmlFor={`gender_${gender.toLowerCase()}`} className="text-sm text-muted-foreground">{gender}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <h3 className="font-semibold mb-3">Price Range</h3>
                <Slider
                  defaultValue={[0, 3000]}
                  max={3000}
                  step={100}
                  className="w-full"
                  onValueCommit={(value) => handleFilterChange('priceRange', value)}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>₹{filters.priceRange[0]}</span>
                  <span>₹{filters.priceRange[1]}</span>
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h3 className="font-semibold mb-3">Minimum Rating</h3>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 cursor-pointer transition-colors ${i < filters.minRating ? 'text-amber-400 fill-amber-400' : 'text-muted hover:text-amber-400'}`}
                      onClick={() => handleFilterChange('minRating', filters.minRating === i + 1 ? 0 : i + 1)}
                    />
                  ))}
                </div>
              </div>

               {/* In Stock Filter */}
                <div>
                    <div className="flex items-center space-x-2">
                        <Switch id="inStock"
                            checked={filters.inStock}
                            onCheckedChange={(checked) => handleFilterChange('inStock', checked)}
                        />
                        <label htmlFor="inStock" className="text-sm font-semibold">In Stock Only</label>
                    </div>
                </div>
            </motion.aside>

            {/* Products Grid */}
            <div className="w-full md:w-3/4 lg:w-4/5">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full sm:flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or description..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                        Showing {products.length} of {totalElements} results
                    </span>
                  <Button variant="outline" className="md:hidden" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                    <SlidersHorizontal className="h-5 w-5 mr-2" />
                    Filters
                  </Button>
                  <Select onValueChange={(value) => handleFilterChange('sort', value)} defaultValue={filters.sort}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="averageRating,desc">Best Rating</SelectItem>
                        <SelectItem value="price,asc">Price: Low to High</SelectItem>
                        <SelectItem value="price,desc">Price: High to Low</SelectItem>
                        <SelectItem value="createdAt,desc">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoading ? (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {[...Array(productsPerPage)].map((_, index) => (
                    <motion.div key={index} variants={itemVariants}>
                      <Card className="h-full overflow-hidden">
                        <CardContent className="p-0">
                          <Skeleton className="aspect-square w-full" />
                          <div className="p-4 space-y-3">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-8 w-full" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : products.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {products.map((item, index) => (
                    <motion.div key={item.id || index} variants={itemVariants}>
                      <Card className="h-full flex flex-col overflow-hidden bg-card/50 backdrop-blur-sm border-border/20 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
                        <CardContent className="flex-1 flex flex-col p-0">
                           <div className="relative aspect-square w-full cursor-pointer" onClick={() => setSelectedProduct(item)}>
                              <Image
                                src={item.imageUrl || 'https://placehold.co/400x400.png'}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                           </div>
                           <div className="p-4 space-y-3 flex flex-col flex-1 justify-between">
                             <div>
                                <div className="flex justify-between items-start">
                                    <div>
                                    <h3 className="font-bold font-headline">{item.name}</h3>
                                    <p className="text-xs text-muted-foreground">{item.specsType} - {item.gender}</p>
                                    </div>
                                    <p className="font-bold text-primary">₹{item.price}</p>
                                </div>
                                <StarRating rating={item.averageRating} />
                                <p className="text-sm text-muted-foreground h-10 overflow-hidden">{item.description}</p>
                             </div>
                            <div className="flex flex-col gap-2 mt-auto">
                                <Button
                                    className="w-full"
                                    onClick={() => handleAddToCart(item)}
                                >
                                Add to Cart
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() => setSelectedProduct(item)}
                                >
                                Write a Review
                                </Button>
                            </div>
                           </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center col-span-full py-12">
                  <h3 className="text-xl font-semibold">No Products Found</h3>
                  <p className="text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
                </div>
              )}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1 || isLoading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
