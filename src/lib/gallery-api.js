/**
 * Gallery API utilities for fetching moments with media
 */

import { prisma } from '@/lib/prisma';

/**
 * Get all moments that have media (images, audio, or video)
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 20)
 * @param {string} options.mediaType - Filter by media type: 'image', 'audio', 'video', or 'all'
 * @param {string} options.sortBy - Sort by: 'newest', 'oldest', 'mostViewed'
 * @param {Date} options.dateFrom - Filter from date
 * @param {Date} options.dateTo - Filter to date
 * @param {number[]} options.tagIds - Filter by tag IDs
 * @param {number} options.categoryId - Filter by category ID
 * @returns {Promise<Object>} Paginated moments with metadata
 */
export async function getAllMomentsWithMedia({
  page = 1,
  limit = 20,
  mediaType = 'all',
  sortBy = 'newest',
  dateFrom = null,
  dateTo = null,
  tagIds = [],
  categoryId = null,
} = {}) {
  try {
    // Build where clause
    const where = {
      OR: [
        { imageUrl: { not: null } },
        { audioUrl: { not: null } },
        { videoUrl: { not: null } },
      ],
    };

    // Media type filter
    if (mediaType !== 'all') {
      delete where.OR;
      if (mediaType === 'image') {
        where.imageUrl = { not: null };
      } else if (mediaType === 'audio') {
        where.audioUrl = { not: null };
      } else if (mediaType === 'video') {
        where.videoUrl = { not: null };
      }
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Tag filter - query the join table properly
    if (tagIds.length > 0) {
      where.tags = {
        some: {
          tag: {
            id: { in: tagIds },
          },
        },
      };
    }

    // Sort order
    const orderBy = {};
    if (sortBy === 'newest') {
      orderBy.createdAt = 'desc';
    } else if (sortBy === 'oldest') {
      orderBy.createdAt = 'asc';
    } else if (sortBy === 'mostViewed') {
      orderBy.viewCount = 'desc';
    }

    // Fetch moments with pagination
    const skip = (page - 1) * limit;
    const [moments, totalCount] = await Promise.all([
      prisma.moment.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          category: true,
        },
      }),
      prisma.moment.count({ where }),
    ]);

    // Format tags to flatten the nested structure
    const formattedMoments = moments.map(moment => ({
      ...moment,
      tags: moment.tags.map(mt => mt.tag),
    }));

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return {
      moments: formattedMoments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore,
      },
    };
  } catch (error) {
    console.error('Error fetching moments with media:', error);
    return {
      moments: [],
      pagination: {
        page: 1,
        limit,
        totalCount: 0,
        totalPages: 0,
        hasMore: false,
      },
    };
  }
}

/**
 * Get available filters (tags, categories) for gallery
 * @returns {Promise<Object>} Available filters
 */
export async function getGalleryFilters() {
  try {
    const [tags, categories] = await Promise.all([
      prisma.tag.findMany({
        orderBy: { name: 'asc' },
      }),
      prisma.category.findMany({
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      tags,
      categories,
    };
  } catch (error) {
    console.error('Error fetching gallery filters:', error);
    return {
      tags: [],
      categories: [],
    };
  }
}
