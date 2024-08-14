const fs = require('fs');
const path = require('path');
const { File } = require('../models');

class FileService {
  static async uploadFile(userId, file) {
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(__dirname, '../uploads', fileName);

    await fs.promises.writeFile(filePath, file.buffer);

    return await File.create({
      name: file.originalname,
      path: filePath,
      mimeType: file.mimetype,
      size: file.size,
      userId
    });
  }

  static async getFileById(fileId) {
    return await File.findByPk(fileId);
  }

  static async deleteFile(fileId) {
    const file = await File.findByPk(fileId);
    if (file) {
      await fs.promises.unlink(file.path);
      await file.destroy();
    }
    return { message: 'File deleted successfully' };
  }
}

module.exports = FileService;