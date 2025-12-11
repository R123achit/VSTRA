// Data validation and cleaning utilities

class DataValidator {
  // Validate product data
  static validateProduct(product) {
    const errors = [];

    // Required fields
    if (!product.title || product.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!product.price || product.price <= 0) {
      errors.push('Valid price is required');
    }

    if (!product.image || !this.isValidUrl(product.image)) {
      errors.push('Valid image URL is required');
    }

    if (!product.category) {
      errors.push('Category is required');
    }

    if (!product.productId) {
      errors.push('Product ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Clean product data
  static cleanProduct(product) {
    return {
      title: this.cleanText(product.title),
      price: this.cleanPrice(product.price),
      originalPrice: this.cleanPrice(product.originalPrice || product.price),
      discount: this.cleanDiscount(product.discount),
      image: this.cleanUrl(product.image),
      images: product.images ? product.images.map(img => this.cleanUrl(img)) : [this.cleanUrl(product.image)],
      rating: this.cleanRating(product.rating),
      reviewCount: this.cleanNumber(product.reviewCount),
      category: product.category,
      source: product.source || 'flipkart',
      sourceUrl: this.cleanUrl(product.sourceUrl),
      productId: product.productId.trim(),
      inStock: product.inStock !== false,
      sizes: product.sizes || [],
      colors: product.colors || [],
      brand: this.cleanText(product.brand || ''),
      description: this.cleanText(product.description || ''),
      lastScraped: new Date()
    };
  }

  // Clean text
  static cleanText(text) {
    if (!text) return '';
    return text.trim().replace(/\s+/g, ' ');
  }

  // Clean price
  static cleanPrice(price) {
    const cleaned = parseFloat(price);
    return isNaN(cleaned) || cleaned < 0 ? 0 : Math.round(cleaned * 100) / 100;
  }

  // Clean discount
  static cleanDiscount(discount) {
    const cleaned = parseInt(discount);
    return isNaN(cleaned) ? 0 : Math.min(Math.max(cleaned, 0), 100);
  }

  // Clean rating
  static cleanRating(rating) {
    const cleaned = parseFloat(rating);
    return isNaN(cleaned) ? 0 : Math.min(Math.max(cleaned, 0), 5);
  }

  // Clean number
  static cleanNumber(num) {
    const cleaned = parseInt(num);
    return isNaN(cleaned) || cleaned < 0 ? 0 : cleaned;
  }

  // Clean URL
  static cleanUrl(url) {
    if (!url) return '';
    return url.trim().replace(/\s+/g, '');
  }

  // Validate URL
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return url.startsWith('//') || url.startsWith('/');
    }
  }

  // Remove duplicates by productId
  static removeDuplicates(products) {
    const seen = new Set();
    return products.filter(product => {
      if (seen.has(product.productId)) {
        return false;
      }
      seen.add(product.productId);
      return true;
    });
  }

  // Filter valid products
  static filterValidProducts(products) {
    return products.filter(product => {
      const validation = this.validateProduct(product);
      if (!validation.isValid) {
        console.warn(`⚠️  Invalid product: ${validation.errors.join(', ')}`);
        return false;
      }
      return true;
    });
  }
}

module.exports = DataValidator;
