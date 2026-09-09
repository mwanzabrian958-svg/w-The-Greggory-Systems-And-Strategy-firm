/**
 * UPDATE: Improve Brian Mwanza's personnel article
 * This script updates the bio with a more professional and comprehensive article
 * 
 * Run with: node scripts/update-brian-mwanza-bio.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const newBio = `<p>Brian Mwanza is the visionary force behind The Greggory Systems & Strategy Firm. With over a decade of experience in systemic design and business strategy, he has guided some of the most ambitious organizations through complex digital and operational transformations.</p>

<p>As Founder & Managing Director, Brian has cultivated a leadership philosophy rooted in the belief that <em>"Strategy is not a document; it's a pulse."</em> This guiding principle has shaped the firm's evolution from a boutique advisory practice into a globally recognized architect of business resonance.</p>

<p>Under his stewardship, the firm has earned an uncompromising commitment to clarity and human-centric systems. Brian specializes in helping organizations navigate the intersection of technology and strategy, ensuring that every solution is not only technically sound but also deeply aligned with the people it serves.</p>

<p>His approach combines rigorous analytical frameworks with an intuitive understanding of organizational dynamics. Brian believes that the most powerful systems are those that empower people, streamline decision-making, and create sustainable momentum without burnout.</p>

<p>When he's not steering the firm's strategic direction, Brian is actively engaged in mentoring emerging leaders, contributing to thought leadership in systemic design, and exploring the frontiers of how technology can be harnessed to create more resilient and adaptive organizations.</p>

<p><strong>Core Expertise:</strong> Systemic Design • Digital Transformation • Business Strategy • Organizational Resonance • Leadership Development</p>`;

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
