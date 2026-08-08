import React from 'react';
import { SlidersHorizontal, ArrowUpDown, Check } from 'lucide-react';
import { ProductCategory, CategoryOption } from '../types';

interface CategoryFilterProps {
  selectedCategory: ProductCategory | 'all';
  onSelectCategory: (cat: ProductCategory | 'all') => void;
  sortOption: 'featured' | 'price_asc' | 'price_desc' | 'name';
  onSortChange: (sort: 'featured' | 'price_asc' | 'price_desc' | 'name') => void;
  onlyInStock: boolean;
  onToggleInStock: () => void;
  totalProducts: number;
  categoryOptions?: CategoryOption[];
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  sortOption,
  onSortChange,
  onlyInStock,
  onToggleInStock,
  totalProducts,
  categoryOptions
}) => {
  const defaultCategories: { id: ProductCategory | 'all'; label: string; icon: string }[] = [
    { id: 'all', label: 'Todos', icon: '✨' },
    { id: 'perfumes', label: 'Perfumes', icon: '💎' },
    { id: 'splash', label: 'Body Splash', icon: '🌸' },
    { id: 'cremas', label: 'Cremas', icon: '🧴' },
    { id: 'lociones', label: 'Lociones', icon: '🌿' }
  ];

  const categories = [
    { id: 'all' as ProductCategory | 'all', label: 'Todos', icon: '✨' },
    ...(categoryOptions && categoryOptions.length > 0
      ? categoryOptions.map(c => ({ id: c.id as ProductCategory | 'all', label: c.label, icon: c.icon || '🌸' }))
      : defaultCategories.slice(1))
  ];

  return (
    <div className="bg-white/80 border-b border-pink-200/80 sticky top-20 z-30 backdrop-blur-md py-3 px-4 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                selectedCategory === cat.id
                  ? 'bg-pink-500 text-white border-pink-500 font-bold shadow-sm shadow-pink-200'
                  : 'bg-pink-50/60 text-stone-700 border-pink-200/70 hover:bg-pink-100/60 hover:text-stone-900'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Filters and Sorting */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto text-xs text-stone-700">
          
          <span className="text-stone-500 font-medium">
            {totalProducts} {totalProducts === 1 ? 'producto' : 'productos'}
          </span>

          {/* Only In-Stock Checkbox */}
          <button
            onClick={onToggleInStock}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
              onlyInStock
                ? 'bg-pink-50 border-pink-300 text-pink-900 font-medium'
                : 'bg-white border-pink-200 text-stone-600 hover:text-stone-900'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
              onlyInStock ? 'bg-pink-500 border-pink-500 text-white' : 'border-stone-300'
            }`}>
              {onlyInStock && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span>En stock</span>
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex items-center gap-1.5 bg-white border border-pink-200 rounded-lg px-3 py-1.5 shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-pink-500 shrink-0" />
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="bg-transparent text-xs text-stone-800 focus:outline-none cursor-pointer"
            >
              <option value="featured" className="bg-white text-stone-800">Destacados</option>
              <option value="price_asc" className="bg-white text-stone-800">Precio: Menor a Mayor</option>
              <option value="price_desc" className="bg-white text-stone-800">Precio: Mayor a Menor</option>
              <option value="name" className="bg-white text-stone-800">Nombre (A-Z)</option>
            </select>
          </div>

        </div>

      </div>
    </div>
  );
};
