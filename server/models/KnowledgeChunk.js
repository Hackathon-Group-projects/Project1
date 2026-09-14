const mongoose = require('mongoose');
const { Schema } = mongoose;

const KnowledgeChunkSchema = new Schema({
  content: { type: String, required: true },
  embedding: { 
    type: [Number], 
    required: true,
    validate: [v => v.length === 768, 'Embedding must be exactly 768 dimensions']
  },
  source: { type: String, required: true },
  category: {
    type: String,
    enum: ['ssl', 'headers', 'cve', 'nuclei', 'tech', 'general'],
    required: true
  },
  tags: [{ type: String }]
});

module.exports = mongoose.model('KnowledgeChunk', KnowledgeChunkSchema);