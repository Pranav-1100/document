const { Client } = require('@elastic/elasticsearch');
const { Document } = require('../models');

const client = new Client({ node: 'http://localhost:9200' });

class SearchService {
  static async indexDocument(document) {
    await client.index({
      index: 'documents',
      id: document.id,
      body: {
        title: document.title,
        content: document.content,
        userId: document.userId,
        createdAt: document.createdAt
      }
    });
  }

  static async search(query, userId) {
    const result = await client.search({
      index: 'documents',
      body: {
        query: {
          bool: {
            must: [
              { multi_match: { query, fields: ['title', 'content'] } },
              { term: { userId } }
            ]
          }
        }
      }
    });

    const hits = result.body.hits.hits;
    const documentIds = hits.map(hit => hit._id);

    return await Document.findAll({
      where: { id: documentIds }
    });
  }
}

module.exports = SearchService;