const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema(
	{
        comment :{type:String}
	},
	{ collection: 'comment' }
)

const model = mongoose.model('CommentSchema', CommentSchema)

module.exports = model