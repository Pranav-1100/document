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
}

module.exports = TagService;