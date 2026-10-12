// Product schema: the shape of a product in MongoDB, plus database-level validation
const mongoose = require('mongoose');
const { getNextSequence } = require('./counter.model');

const DEFAULT_IMAGE = 'images/placeholder.svg';

const productSchema = new mongoose.Schema(
  {
    // Simple numeric id (1, 2, 3...) used in URLs like /api/products/2 and product.html?id=2
    id: { type: Number, unique: true },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [120, 'Title must be at most 120 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0.01, 'Price must be greater than 0'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description must be at most 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      lowercase: true, // "Jewelry" and "jewelry" are the same category
      index: true,
    },
    image: { type: String, trim: true, default: DEFAULT_IMAGE },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
      validate: { validator: Number.isInteger, message: 'Stock must be a whole number' },
    },
    rating: {
      rate: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

// No two products may share a title (case-insensitive). The database enforces it too.
productSchema.index({ title: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
productSchema.index({ price: 1 });

// Give every new product the next numeric id
productSchema.pre('validate', async function () {
  if (this.isNew && this.id == null) {
    const last = await this.constructor.findOne().sort({ id: -1 }).select('id');
    this.id = await getNextSequence('product', last ? last.id : 0);
  }
});

// Hide the internal MongoDB fields (_id, __v) in API responses
productSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
module.exports.DEFAULT_IMAGE = DEFAULT_IMAGE;
