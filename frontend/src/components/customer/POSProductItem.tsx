import React, { useState } from 'react';
import type { Product } from '../../types';

interface POSProductItemProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
}

const POSProductItem: React.FC<POSProductItemProps> = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (quantity > 0) {
      onAddToCart(product, quantity);
      setQuantity(1); // Reset quantity after adding
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
      {/* Product Image */}
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 text-sm truncate mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">
          {product.description}
        </p>

        {/* Price */}
        <div className="mb-3">
          <p className="text-lg font-bold text-green-600">
            Rs. {product.price.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Stock: {product.stock}
          </p>
        </div>

        {/* Quantity Input and Add Button */}
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={handleQuantityChange}
            disabled={isOutOfStock}
            className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm text-center disabled:bg-gray-100"
          />
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-1.5 px-2 rounded text-sm transition-colors"
          >
            {isOutOfStock ? 'Out of Stock' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSProductItem;
