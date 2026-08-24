const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
const Project = mongoose.model('Project', new mongoose.Schema({}, { strict: false }));
const Document = mongoose.model('Document', new mongoose.Schema({}, { strict: false }));
const Message = mongoose.model('Message', new mongoose.Schema({}, { strict: false }));
const WebsiteContent = mongoose.model('WebsiteContent', new mongoose.Schema({}, { strict: false }));
const Finance = mongoose.model('Finance', new mongoose.Schema({}, { strict: false }));
const Company = mongoose.model('Company', new mongoose.Schema({}, { strict: false }));
const BlogArticle = mongoose.model('BlogArticle', new mongoose.Schema({}, { strict: false }));
const CaseStudy = mongoose.model('CaseStudy', new mongoose.Schema({}, { strict: false }));
const Video = mongoose.model('Video', new mongoose.Schema({}, { strict: false }));
const ContactForm = mongoose.model('ContactForm', new mongoose.Schema({}, { strict: false }));
const Transaction = mongoose.model('Transaction', new mongoose.Schema({}, { strict: false }));
const ActivityLog = mongoose.model('ActivityLog', new mongoose.Schema({}, { strict: false }));

module.exports = {
  User, Project, Document, Message, WebsiteContent,
  Finance, Company, BlogArticle, CaseStudy, Video,
  ContactForm, Transaction, ActivityLog
};
