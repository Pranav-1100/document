const { Tag, Document, Op } = require('../models');

class TagService {
  static async createTag(name) {
    try {
      return await Tag.create({ name });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('A tag with this name already exists');
      }
      throw error;
    }
  }

  static async getAllTags() {
    return await Tag.findAll({
      order: [['name', 'ASC']]
    });
  }

  static async getTagById(id) {
    const tag = await Tag.findByPk(id);
    if (!tag) {
      throw new Error('Tag not found');
    }
    return tag;
  }

  static async updateTag(id, name) {
    const tag = await this.getTagById(id);
    try {
      return await tag.update({ name });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('A tag with this name already exists');
      }
      throw error;
    }
  }

  static async deleteTag(id) {
    const tag = await this.getTagById(id);
    await tag.destroy();
    return { message: 'Tag deleted successfully' };
  }

  static async addTagToDocument(documentId, tagId) {
    const document = await Document.findByPk(documentId);
    const tag = await this.getTagById(tagId);

    if (!document) {
      throw new Error('Document not found');
    }

    await document.addTag(tag);
    return { message: 'Tag added to document successfully' };
  }

  static async removeTagFromDocument(documentId, tagId) {
    const document = await Document.findByPk(documentId);
    const tag = await this.getTagById(tagId);

    if (!document) {
      throw new Error('Document not found');
    }

    await document.removeTag(tag);
    return { message: 'Tag removed from document successfully' };
  }

  static async getDocumentsByTag(tagId) {
    const tag = await this.getTagById(tagId);
    return await tag.getDocuments({
      order: [['createdAt', 'DESC']]
    });
  }

  static async searchTags(query) {
    return await Tag.findAll({
      where: {
        name: { [Op.iLike]: `%${query}%` }
      },
      order: [['name', 'ASC']]
    });
  }

  static async getTagStats() {
    const stats = await Tag.findAll({
      attributes: [
        'id',
        'name',
        [sequelize.fn('COUNT', sequelize.col('Documents.id')), 'documentCount']
      ],
      include: [{
        model: Document,
        attributes: [],
        through: { attributes: [] }
      }],
      group: ['Tag.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('Documents.id')), 'DESC']]
    });

    return stats.map(stat => ({
      id: stat.id,
      name: stat.name,
      documentCount: parseInt(stat.get('documentCount'))
    }));
  }

  static async bulkCreateTags(tagsData) {
    try {
      return await Tag.bulkCreate(tagsData, { validate: true });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('One or more tag names already exist');
      }
      throw error;
    }
  }

  static async getOrCreateTag(name) {
    const [tag, created] = await Tag.findOrCreate({
      where: { name }
    });
    return { tag, created };
  }
  static async getTagsWithPagination(page = 1, limit = 20, userId = null) {
    const offset = (page - 1) * limit;
    const whereClause = userId ? { userId } : {};

    const { rows: tags, count } = await Tag.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['name', 'ASC']],
      include: [{ model: TagCategory, attributes: ['id', 'name'] }]
    });

    return {
      tags,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalCount: count
    };
  }

  static async createTagCategory(name, description) {
    return await TagCategory.create({ name, description });
  }

  static async assignTagToCategory(tagId, categoryId) {
    const tag = await this.getTagById(tagId);
    const category = await TagCategory.findByPk(categoryId);
    if (!category) throw new Error('Tag category not found');
    
    await tag.setTagCategory(category);
    return tag;
  }

  static async mergeTags(sourceTagId, targetTagId) {
    const sourceTag = await this.getTagById(sourceTagId);
    const targetTag = await this.getTagById(targetTagId);

    const documents = await sourceTag.getDocuments();
    await targetTag.addDocuments(documents);
    await sourceTag.destroy();

    return { message: 'Tags merged successfully' };
  }

  static async getTagUsageAnalytics(startDate, endDate) {
    return await Tag.findAll({
      attributes: [
        'id',
        'name',
        [sequelize.fn('COUNT', sequelize.col('Documents.id')), 'usageCount']
      ],
      include: [{
        model: Document,
        attributes: [],
        through: { attributes: [] },
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        }
      }],
      group: ['Tag.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('Documents.id')), 'DESC']]
    });
  }

  static async addFavoriteTag(userId, tagId) {
    const user = await User.findByPk(userId);
    const tag = await this.getTagById(tagId);
    await user.addFavoriteTag(tag);
    return { message: 'Tag added to favorites' };
  }

  static async removeFavoriteTag(userId, tagId) {
    const user = await User.findByPk(userId);
    const tag = await this.getTagById(tagId);
    await user.removeFavoriteTag(tag);
    return { message: 'Tag removed from favorites' };
  }

  static async getFavoriteTags(userId) {
    const user = await User.findByPk(userId, {
      include: [{ model: Tag, as: 'favoriteTags' }]
    });
    return user.favoriteTags;
  }

  static async suggestTagsForDocument(documentId) {
    const document = await Document.findByPk(documentId);
    if (!document) throw new Error('Document not found');

    // Use OpenAI to suggest tags based on document content
    const suggestedTags = await OpenAIService.suggestTags(document.content);
    return suggestedTags;
  }

  static async exportTags() {
    const tags = await Tag.findAll({
      include: [{ model: TagCategory, attributes: ['name'] }]
    });
    return tags.map(tag => ({
      name: tag.name,
      category: tag.TagCategory ? tag.TagCategory.name : null
    }));
  }

  static async importTags(tagsData) {
    const importedTags = [];
    for (const tagData of tagsData) {
      const [tag, created] = await Tag.findOrCreate({
        where: { name: tagData.name },
        defaults: tagData
      });
      if (tagData.category) {
        const [category] = await TagCategory.findOrCreate({
          where: { name: tagData.category }
        });
        await tag.setTagCategory(category);
      }
      importedTags.push({ tag, created });
    }
    return importedTags;
  }
}

module.exports = TagService;