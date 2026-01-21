/**
 * Search and Filter Utilities
 * Provides reusable functions for searching and filtering data
 */

/**
 * Search items by multiple fields
 * @param {Array} items - Items to search
 * @param {string} searchTerm - Search query
 * @param {Array} searchFields - Fields to search in
 * @returns {Array} Filtered items
 */
export const searchItems = (items, searchTerm, searchFields = []) => {
  if (!searchTerm.trim()) return items;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return items.filter(item => {
    return searchFields.some(field => {
      const value = item[field];
      if (value === null || value === undefined) return false;
      return value.toString().toLowerCase().includes(lowerSearchTerm);
    });
  });
};

/**
 * Filter items by a specific field value
 * @param {Array} items - Items to filter
 * @param {string} field - Field to filter by
 * @param {*} value - Value to match
 * @returns {Array} Filtered items
 */
export const filterByField = (items, field, value) => {
  if (!value) return items;
  return items.filter(item => item[field] === value);
};

/**
 * Filter items by multiple criteria
 * @param {Array} items - Items to filter
 * @param {Object} filters - Filter criteria {field: value}
 * @returns {Array} Filtered items
 */
export const filterByMultiple = (items, filters) => {
  return items.filter(item => {
    return Object.entries(filters).every(([field, value]) => {
      if (!value) return true;
      return item[field] === value;
    });
  });
};

/**
 * Get unique values from items for a specific field
 * @param {Array} items - Items to extract from
 * @param {string} field - Field to get unique values from
 * @returns {Array} Unique values
 */
export const getUniqueValues = (items, field) => {
  return [...new Set(items.map(item => item[field]).filter(Boolean))].sort();
};

/**
 * Sort items by a field
 * @param {Array} items - Items to sort
 * @param {string} field - Field to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted items
 */
export const sortItems = (items, field, order = 'asc') => {
  const sorted = [...items].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (typeof aVal === 'string') {
      return order === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    return order === 'asc' ? aVal - bVal : bVal - aVal;
  });
  
  return sorted;
};

/**
 * Combine search and filter operations
 * @param {Array} items - Items to process
 * @param {string} searchTerm - Search query
 * @param {Array} searchFields - Fields to search in
 * @param {Object} filters - Filter criteria
 * @param {string} sortField - Field to sort by
 * @param {string} sortOrder - Sort order
 * @returns {Array} Processed items
 */
export const processData = (
  items,
  searchTerm,
  searchFields,
  filters = {},
  sortField = null,
  sortOrder = 'asc'
) => {
  let result = items;
  
  // Apply search
  if (searchTerm) {
    result = searchItems(result, searchTerm, searchFields);
  }
  
  // Apply filters
  if (Object.keys(filters).length > 0) {
    result = filterByMultiple(result, filters);
  }
  
  // Apply sort
  if (sortField) {
    result = sortItems(result, sortField, sortOrder);
  }
  
  return result;
};
