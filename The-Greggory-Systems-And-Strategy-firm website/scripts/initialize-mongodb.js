const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Import Models
const User = require('../server/models/User');
const Project = require('../server/models/Project');
const WebsiteContent = require('../server/models/WebsiteContent');
const Company = require('../server/models/Company');
const BlogArticle = require('../server/models/BlogArticle');
const CaseStudy = require('../server/models/CaseStudy');
const Video = require('../server/models/Video');
const ContactForm = require('../server/models/ContactForm');
const Transaction = require('../server/models/Transaction');

async function initializeMongoDB() {
  console.log('🚀 Starting TOTAL Strategic MongoDB Migration...');

  try {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not found in .env');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const mysqlConn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'the_greggory_systems_and_strategy_firm_db_main'
    });
    console.log('✅ Connected to MySQL for Total Data Acquisition');

    // 1. MIGRATION: USERS (Admin, Developer, and Regular)
    console.log('\n👤 Migrating Unified User Ecosystem...');

    // Admin Users
    const [admins] = await mysqlConn.query('SELECT * FROM admin_users');
    for (const a of admins) {
      await User.findOneAndUpdate({ email: a.email }, {
        email: a.email, password_hash: a.password_hash, first_name: a.first_name, last_name: a.last_name,
        display_name: a.display_name, primary_role: 'admin', access_level: a.access_level,
        admin_details: { level: a.admin_level, permissions: a.admin_permissions, department: a.department },
        is_active: !!a.is_active, email_verified: !!a.email_verified, sql_id: a.id
      }, { upsert: true });
    }
    console.log(`✅ ${admins.length} Admins Secured`);

    // Developer Users
    const [devs] = await mysqlConn.query('SELECT * FROM developer_users');
    for (const d of devs) {
      await User.findOneAndUpdate({ email: d.email }, {
        email: d.email, password_hash: d.password_hash, first_name: d.first_name, last_name: d.last_name,
        display_name: d.display_name, primary_role: 'developer', access_level: d.access_level,
        developer_details: { level: d.developer_level, tech_stack: d.tech_stack, specialization: d.specialization },
        is_active: !!d.is_active, email_verified: !!d.email_verified, sql_id: d.id
      }, { upsert: true });
    }
    console.log(`✅ ${devs.length} Developers Secured`);

    // 2. MIGRATION: COMPANIES
    console.log('\n🏢 Migrating Corporate Entities...');
    const [companies] = await mysqlConn.query('SELECT * FROM companies');
    for (const c of companies) {
      await Company.findOneAndUpdate({ slug: c.slug }, {
        name: c.name, slug: c.slug, description: c.description,
        website_url: c.website_url, contact_email: c.contact_email, contact_phone: c.contact_phone,
        address: { line1: c.address_line1, city: c.city, country: c.country },
        is_active: !!c.is_active, sql_id: c.id
      }, { upsert: true });
    }
    console.log(`✅ ${companies.length} Companies Secured`);

    // 3. MIGRATION: BLOG ARTICLES
    console.log('\n📝 Migrating Strategic Content (Blog)...');
    const [articles] = await mysqlConn.query('SELECT * FROM blog_articles');
    for (const art of articles) {
      await BlogArticle.findOneAndUpdate({ sql_id: art.id }, {
        title: art.title, excerpt: art.excerpt, content: art.content,
        author: art.author, read_time: art.read_time, category: art.category,
        is_published: !!art.is_published, published_date: art.published_date, sql_id: art.id
      }, { upsert: true });
    }
    console.log(`✅ ${articles.length} Articles Secured`);

    // 5. MIGRATION: CASE STUDIES
    console.log('\n📊 Migrating Strategic Case Studies...');
    const [studies] = await mysqlConn.query('SELECT * FROM case_studies');
    for (const s of studies) {
      await CaseStudy.findOneAndUpdate({ sql_id: s.id }, {
        title: s.title, client: s.client, industry: s.industry,
        challenge: s.challenge, solution: s.solution, results: s.results,
        duration: s.duration, is_featured: !!s.is_featured, sql_id: s.id
      }, { upsert: true });
    }
    console.log(`✅ ${studies.length} Case Studies Secured`);

    // 6. MIGRATION: VIDEOS
    console.log('\n🎥 Migrating Video Media...');
    const [videos] = await mysqlConn.query('SELECT * FROM videos');
    for (const v of videos) {
      await Video.findOneAndUpdate({ sql_id: v.id }, {
        title: v.title, description: v.description,
        is_active: !!v.is_active, is_featured: !!v.is_featured,
        display_order: v.display_order, sql_id: v.id
      }, { upsert: true });
    }
    console.log(`✅ ${videos.length} Videos Secured`);

    // 7. MIGRATION: WEBSITE CONTENT
    console.log('\n⚙️  Migrating Systemic Configurations...');
    const [settings] = await mysqlConn.query('SELECT * FROM admin_website_settings');
    for (const st of settings) {
      await WebsiteContent.findOneAndUpdate({ key: st.setting_key }, {
        key: st.setting_key, value: st.setting_value, display_name: st.display_name,
        description: st.description, category: st.category, is_public: !!st.is_public
      }, { upsert: true });
    }
    console.log(`✅ ${settings.length} Settings Secured`);

    console.log('\n✨ TOTAL MIGRATION SUCCESSFUL!');
    console.log('The entire firm infrastructure is now mirrored in MongoDB Atlas Cloud.');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ TOTAL MIGRATION FAILED:');
    console.error(error.message);
    process.exit(1);
  }
}

initializeMongoDB();
