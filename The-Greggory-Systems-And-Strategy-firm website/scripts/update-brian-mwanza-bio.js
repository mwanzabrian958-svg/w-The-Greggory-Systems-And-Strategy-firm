/**
 * UPDATE: Improve Brian Mwanza's personnel article
 * This script updates the bio with a more professional and comprehensive article
 * 
 * Run with: node scripts/update-brian-mwanza-bio.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const newBio = `<p>Brian Mwanza is the visionary founder and strategic leader of The-Greggory-Systems-And-Strategy-firm. With six years of experience in systemic design and business strategy, he has built a practice centered on helping organizations move from complexity to clarity. His work is rooted in the belief that sustainable growth is not created by reacting to disruption, but by designing resilient systems that align people, process, and purpose.</p><p>His central vision is to help organizations operate with conviction, momentum, and long-term focus. Brian believes that strategy must be alive, adaptive, and deeply connected to the realities of the people inside the business. This philosophy led him to build a firm that turns vision into practical systems, sharper decisions, and stronger teams capable of delivering meaningful results.</p><p>Brian's relationship with clients is grounded in trust, clarity, and partnership. He does not approach engagements as a distant consultant delivering a one-time recommendation; he works alongside leadership teams as a strategic partner who listens carefully, identifies root causes, and co-creates transformation pathways that match each client's context. That collaborative model ensures clients feel supported, informed, and empowered rather than overwhelmed by complexity.</p><p>He oversees the strategic direction of the firm, including client advisory engagements, operational planning, transformation programs, and leadership-level decision support. His role is to ensure that every initiative the firm takes on is aligned with measurable business value, human impact, and sustainable execution. In practical terms, he controls the strategic levers that determine whether client work moves from ideas into lasting outcomes.</p><p>Brian also understands that business prosperity grows strongest when clients and the firm move forward together. He is committed to building long-term value, not short-term wins, and he measures success by how well a client's systems improve their capacity to serve, innovate, and thrive. This means the firm's prosperity is closely tied to the resilience, clarity, and momentum of the organizations it supports.</p><p>At the heart of his leadership is a belief that the firm's success is inseparable from the success of the people and businesses it serves. By combining strategic insight with human-centered systems thinking, Brian is building a company that stands beside clients as they navigate complexity, sharpen focus, and create lasting competitive advantage. His goal is not only to advise businesses, but to help them evolve into stronger, more coherent, and more prosperous organizations.</p>`;

async function updateBio() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

    console.log('✅ Connected to database');

    // Get current bio
    const [current] = await connection.query(
      'SELECT id, name, bio FROM company_personnel WHERE name = ?',
      ['Brian Mwanza']
    );

    if (current.length === 0) {
      console.log('❌ Brian Mwanza not found in database');
      return;
    }

    console.log(`\n📝 Current bio (${current[0].bio?.length || 0} chars):`);
    console.log(current[0].bio);

    // Update the bio
    const [result] = await connection.query(
      'UPDATE company_personnel SET bio = ? WHERE id = ?',
      [newBio, current[0].id]
    );

    if (result.affectedRows > 0) {
      console.log('\n✅ Bio updated successfully!');
      
      // Verify the update
      const [updated] = await connection.query(
        'SELECT id, name, bio FROM company_personnel WHERE id = ?',
        [current[0].id]
      );
      
      console.log(`\n📝 New bio (${updated[0].bio?.length || 0} chars):`);
      console.log(updated[0].bio);
    } else {
      console.log('❌ Failed to update bio');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

updateBio();
