const mongoose = require('mongoose');

export const isValidObjectId = mongoose.Types.ObjectId.isValid;
