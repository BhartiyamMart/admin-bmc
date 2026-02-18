'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Plus,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  Package,
  FolderOpen,
  Folder,
  Search,
  Filter,
  MoreVertical,
  Grid3x3,
  List,
  TrendingUp,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCategoriesData } from '@/apis/categories.api';
import { transformCategoriesToNodes } from '@/lib/data-transformers';

// Category Node Interface
interface CategoryNode {
  id: string;
  name: string;
  type: 'category' | 'subcategory' | 'product';
  children?: CategoryNode[];
  productCount?: number;
  status?: 'active' | 'inactive';
  color?: string;
  imageUrl?: string;
}

const Category = () => {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [stats, setStats] = useState({
    totalMain: 0,
    activeMain: 0,
    inactiveMain: 0,
    totalCategories: 0,
  });
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await getCategoriesData();
        const transformedData = transformCategoriesToNodes(response.payload);
        setCategories(transformedData);
        setStats(response.payload.stats);

        // Auto-expand first category
        if (transformedData.length > 0) {
          setExpandedNodes(new Set([transformedData[0].id]));
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle image error
  const handleImageError = (nodeId: string) => {
    setImageErrors((prev) => new Set(prev).add(nodeId));
  };

  // Toggle expand/collapse
  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Count total items in a node
  const countProducts = (node: CategoryNode): number => {
    if (!node.children || node.children.length === 0) return 0;
    return node.children.reduce((sum, child) => sum + countProducts(child) + 1, 0);
  };

  // Get color token for node type
  const getNodeColor = (node: CategoryNode, level: number) => {
    if (node.type === 'category') return 'bg-chart-1';
    if (node.type === 'subcategory') {
      const colors = ['bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5'];
      return colors[level % colors.length];
    }
    return 'bg-primary';
  };

  // Get border color for tokens
  const getNodeBorderColor = (node: CategoryNode, level: number) => {
    if (node.type === 'category') return 'border-chart-1/50';
    if (node.type === 'subcategory') {
      const colors = ['border-chart-2/50', 'border-chart-3/50', 'border-chart-4/50', 'border-chart-5/50'];
      return colors[level % colors.length];
    }
    return 'border-primary/50';
  };

  // Render tree node recursively
  const renderNode = (node: CategoryNode, level: number = 0, parentColor?: string, index: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode === node.id;
    const productCount = countProducts(node);
    const colorClass = getNodeColor(node, level);
    const borderColor = getNodeBorderColor(node, level);
    const hasImageError = imageErrors.has(node.id);

    // Icon/Image based on type with animation
    const getIcon = () => {
      // Always try to show imageUrl first for categories and subcategories
      if (node.imageUrl && !hasImageError) {
        return (
          <motion.div
            className="border-border relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-lg border shadow-md sm:h-8 sm:w-8"
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Image
              src={node.imageUrl}
              alt={node.name}
              fill
              className="object-cover"
              onError={() => handleImageError(node.id)}
              sizes="(max-width: 640px) 24px, 32px"
            />
          </motion.div>
        );
      }

      // Fallback to icons when no image or error
      if (node.type === 'product') {
        return (
          <motion.div
            className="bg-primary flex h-6 w-6 items-center justify-center rounded-lg shadow-md sm:h-8 sm:w-8"
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Package className="text-primary-foreground h-3 w-3 sm:h-4 sm:w-4" />
          </motion.div>
        );
      }

      // Fallback folder icon for categories/subcategories without valid image
      return (
        <motion.div
          className={`flex h-6 w-6 items-center justify-center rounded-lg sm:h-8 sm:w-8 ${colorClass} shadow-md`}
          animate={{ scale: isExpanded ? 1.1 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          whileHover={{ scale: 1.15 }}
        >
          {isExpanded ? (
            <FolderOpen className="dark:text-foreground h-3 w-3 text-white sm:h-4 sm:w-4" />
          ) : (
            <Folder className="dark:text-foreground h-3 w-3 text-white sm:h-4 sm:w-4" />
          )}
        </motion.div>
      );
    };

    return (
      <motion.div
        key={node.id}
        className="relative"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <motion.div
          className={`group relative mb-1.5 flex flex-wrap items-center gap-2 rounded-lg border px-2 py-2 sm:mb-2 sm:flex-nowrap sm:gap-3 sm:rounded-xl sm:px-4 sm:py-3 ${
            isSelected
              ? `${borderColor} bg-card shadow-lg`
              : 'border-border bg-card hover:border-border dark:hover:border-border'
          }`}
          style={{ marginLeft: `${level * 12}px`, paddingLeft: level > 0 ? '8px' : '12px' }}
          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          animate={{ boxShadow: isSelected ? '0 10px 25px rgba(0,0,0,0.1)' : '0 0px 0px rgba(0,0,0,0)' }}
          transition={{ duration: 0.2 }}
        >
          {/* Left Border Accent */}
          <motion.div
            className={`absolute top-0 left-0 h-full w-1 rounded-l-xl ${colorClass}`}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          />

          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <motion.button
              onClick={() => toggleNode(node.id)}
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg sm:h-6 sm:w-6 ${
                isExpanded ? `${colorClass} shadow-md` : 'bg-muted hover:bg-muted/80'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3, type: 'spring' }}>
                {isExpanded ? (
                  <ChevronDown className="dark:text-foreground h-3 w-3 text-white sm:h-4 sm:w-4" />
                ) : (
                  <ChevronRight className="text-muted-foreground h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </motion.div>
            </motion.button>
          ) : (
            <span className="w-5 flex-shrink-0 sm:w-6" />
          )}

          {/* Node Icon/Image */}
          {getIcon()}

          {/* Node Name & Type Badge */}
          <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
            <motion.button
              onClick={() => setSelectedNode(node.id)}
              className="text-foreground truncate text-left text-xs font-semibold sm:text-sm"
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              {node.name}
            </motion.button>
            <motion.span
              className={`flex-shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase sm:text-xs ${
                node.type === 'category'
                  ? 'bg-chart-1/20 text-chart-1 border-chart-1/30'
                  : node.type === 'subcategory'
                    ? 'bg-chart-2/20 text-chart-2 border-chart-2/30'
                    : 'bg-primary/20 text-primary border-primary/30'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 + 0.1 }}
            >
              {node.type === 'category' ? 'Cat' : node.type === 'subcategory' ? 'Sub' : 'Prod'}
            </motion.span>
          </div>

          {/* Badges Row - Wraps on mobile */}
          <div className="mt-2 flex w-full flex-wrap items-center gap-1.5 sm:mt-0 sm:w-auto sm:flex-nowrap sm:gap-2">
            {/* Product Count Badge */}
            <AnimatePresence>
              {node.type !== 'product' && productCount > 0 && (
                <motion.div
                  className="bg-accent flex items-center gap-1 rounded-full px-2 py-0.5 shadow-md sm:px-3 sm:py-1"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <TrendingUp className="text-accent-foreground h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </motion.div>
                  <span className="text-accent-foreground text-[10px] font-bold sm:text-xs">
                    {productCount} {productCount === 1 ? 'item' : 'items'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status Badge */}
            <motion.div
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 + 0.15 }}
            >
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold shadow-md sm:px-3 sm:py-1 sm:text-xs ${
                  node.status === 'active' ? 'bg-chart-4 text-white' : 'bg-destructive text-destructive-foreground'
                }`}
              >
                {node.status === 'active' ? '● Active' : '● Inactive'}
              </span>
              {node.status === 'active' && (
                <motion.span
                  className="bg-chart-4/40 absolute inset-0 rounded-full opacity-20"
                  animate={{ scale: [1, 1.5] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                />
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex items-center gap-1"
              //   initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                className="bg-background flex h-6 w-6 items-center justify-center rounded-lg shadow-md sm:h-8 sm:w-8"
                // whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Edit:', node.name);
                }}
              >
                <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </motion.button>
              <motion.button
                className="text-destructive flex h-6 w-6 items-center justify-center rounded-lg shadow-md sm:h-8 sm:w-8"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Delete:', node.name);
                }}
              >
                <Trash2 className="text-destructive-foreground h-3 w-3 sm:h-4 sm:w-4" />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Render Children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {node.children!.map((child, childIndex) => renderNode(child, level + 1, undefined, childIndex))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Calculate statistics from actual data
  const totalCategories = categories.length;
  const totalSubcategories = categories.reduce((sum, cat) => sum + countProducts(cat), 0);
  const activeCategories = categories.filter((c) => c.status === 'active').length;
  const inactiveCategories = categories.filter((c) => c.status === 'inactive').length;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground mt-4">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8vh)] p-2 sm:p-4 lg:p-6">
      <motion.div
        className="bg-muted flex h-full flex-col rounded-xl shadow-2xl sm:rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div
          className="bg-muted relative overflow-hidden rounded-t-xl p-3 sm:rounded-t-2xl sm:p-4 lg:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="text-primary absolute inset-0" />
          <div className="text-primary relative flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-lg font-semibold sm:text-xl lg:text-2xl">Categories</h1>
              <p className="text-primary mt-0.5 text-xs sm:mt-1 sm:text-sm">
                Organize and manage your product hierarchy
              </p>
            </motion.div>

            {/* Desktop Buttons */}
            <motion.div
              className="hidden gap-2 md:flex lg:gap-3"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button
                variant="outline"
                size="sm"
                className="border-primary/20 bg-primary-foreground/10 text-primary hover:bg-muted text-xs shadow-xl backdrop-blur-sm sm:text-sm"
                onClick={() => setExpandedNodes(new Set(getAllNodeIds(categories)))}
              >
                Expand All
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-primary/20 bg-primary-foreground/10 text-primary hover:bg-muted text-xs shadow-xl backdrop-blur-sm sm:text-sm"
                onClick={() => setExpandedNodes(new Set())}
              >
                Collapse All
              </Button>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs shadow-lg sm:text-sm">
                <Plus className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" /> Add Category
              </Button>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              className="bg-primary-foreground/10 text-primary absolute top-3 right-3 rounded-lg p-2 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.button>
          </div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                className="border-primary-foreground/20 mt-3 border-t pt-3 md:hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/20 bg-primary-foreground/10 text-primary hover:bg-muted mx-auto w-fit text-xs shadow-xl backdrop-blur-sm sm:text-sm"
                    onClick={() => {
                      setExpandedNodes(new Set(getAllNodeIds(categories)));
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Expand All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/20 bg-primary-foreground/10 text-primary hover:bg-muted mx-auto w-fit text-xs shadow-xl backdrop-blur-sm sm:text-sm"
                    onClick={() => {
                      setExpandedNodes(new Set());
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Collapse All
                  </Button>
                  <Button
                    className="bg-primary-foreground/10 text-primary hover:bg-muted mx-auto w-fit border text-xs shadow-xl backdrop-blur-sm sm:text-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Category
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 gap-2 p-3 sm:gap-3 sm:p-4 lg:grid-cols-4 lg:gap-4 lg:p-6">
          {[
            {
              label: 'Main Categories',
              value: stats.totalMain,
            },
            {
              label: 'Total Categories',
              value: stats.totalCategories,
            },
            {
              label: 'Active',
              value: stats.activeMain,
            },
            {
              label: 'Inactive',
              value: stats.inactiveMain,
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className={`group bg-card relative overflow-hidden rounded-lg border p-3 shadow-lg sm:rounded-xl sm:p-4`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            >
              <div className={`absolute inset-0 backdrop-blur-sm`} />
              <motion.div className="relative">
                <p className="text-muted-foreground text-[10px] font-medium sm:text-xs lg:text-sm">{stat.label}</p>
                <motion.p
                  className="text-foreground mt-0.5 text-xl font-bold sm:mt-1 sm:text-2xl lg:text-3xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                >
                  {stat.value}
                </motion.p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Filters & Search - Responsive */}
        <motion.div
          className="flex flex-col items-stretch gap-2 px-3 pb-3 sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:pb-4 lg:px-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-gray-400 sm:left-3 sm:h-5 sm:w-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-3 pl-9 text-xs focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none sm:rounded-xl sm:py-3 sm:pr-4 sm:pl-11 sm:text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
        </motion.div>

        {/* Tree View - Scrollable */}
        <motion.div
          className="flex-1 overflow-y-auto px-3 pb-3 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div
            className="space-y-1 sm:space-y-2"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
          >
            {categories.length > 0 ? (
              categories.map((category, index) => renderNode(category, 0, undefined, index))
            ) : (
              <div className="py-12 text-center">
                <p className="text-muted-foreground text-sm">No categories found</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Helper function to get all node IDs
const getAllNodeIds = (nodes: CategoryNode[]): string[] => {
  const ids: string[] = [];
  const traverse = (node: CategoryNode) => {
    ids.push(node.id);
    if (node.children) {
      node.children.forEach(traverse);
    }
  };
  nodes.forEach(traverse);
  return ids;
};

// Helper to get all products
const getAllProducts = (nodes: CategoryNode[]): CategoryNode[] => {
  const products: CategoryNode[] = [];
  const traverse = (node: CategoryNode) => {
    if (node.type === 'product') {
      products.push(node);
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  };
  nodes.forEach(traverse);
  return products;
};

export default Category;
