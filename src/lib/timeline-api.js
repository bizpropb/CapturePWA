/**
 * Timeline API utilities for fetching moments chronologically
 */

import { prisma } from '@/lib/prisma';

/**
 * Get moments for timeline view with search and filters
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 20)
 * @param {string} options.searchQuery - Search term for descriptions/tags
 * @param {Object} options.filters - Filter options
 * @param {number[]} options.filters.tagIds - Filter by tag IDs
 * @param {number} options.filters.categoryId - Filter by category ID
 * @param {string} options.filters.mood - Filter by mood
 * @returns {Promise<Object>} Paginated moments with metadata
 */
export async function getTimelineMoments({
  page = 1,
  limit = 20,
  searchQuery = '',
  filters = {},
} = {}) {
  try {
    // Build where clause
    const where = {};

    // Search functionality (description or tag names)
    if (searchQuery) {
      where.OR = [
        {
          description: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
        {
          tags: {
            some: {
              name: {
                contains: searchQuery,
                mode: 'insensitive',
              },
            },
          },
        },
      ];
    }

    // Filter by category
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    // Filter by mood
    if (filters.mood) {
      where.mood = filters.mood;
    }

    // Filter by tags
    if (filters.tagIds && filters.tagIds.length > 0) {
      where.tags = {
        some: {
          id: { in: filters.tagIds },
        },
      };
    }

    // Fetch moments with pagination
    const skip = (page - 1) * limit;
    const [moments, totalCount] = await Promise.all([
      prisma.moment.findMany({
        where,
        orderBy: {
          createdAt: 'desc', // Chronological order (newest first)
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          tags: true,
          category: true,
        },
      }),
      prisma.moment.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return {
      moments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore,
      },
    };
  } catch (error) {
    console.error('Error fetching timeline moments:', error);
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
 * Get available filters for timeline
 * @returns {Promise<Object>} Available filters
 */
export async function getTimelineFilters() {
  try {
    const [tags, categories, moods] = await Promise.all([
      prisma.tag.findMany({
        orderBy: { name: 'asc' },
      }),
      prisma.category.findMany({
        orderBy: { name: 'asc' },
      }),
      // Get unique moods from moments
      prisma.moment.findMany({
        where: {
          mood: { not: null },
        },
        select: {
          mood: true,
        },
        distinct: ['mood'],
      }),
    ]);

    return {
      tags,
      categories,
      moods: moods.map((m) => m.mood).filter(Boolean),
    };
  } catch (error) {
    console.error('Error fetching timeline filters:', error);
    return {
      tags: [],
      categories: [],
      moods: [],
    };
  }
}
