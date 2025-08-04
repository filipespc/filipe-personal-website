import { Client } from 'pg';

const neonClient = new Client({
  connectionString: 'postgresql://neondb_owner:npg_yKSvmrV06joU@ep-lingering-paper-a58awc3r.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

const railwayClient = new Client({
  connectionString: process.env.DATABASE_URL
});

async function migrateData() {
  try {
    console.log('Connecting to databases...');
    await neonClient.connect();
    await railwayClient.connect();

    // Migrate profile data
    console.log('Migrating profile data...');
    const profileResult = await neonClient.query('SELECT * FROM profile LIMIT 1');
    if (profileResult.rows.length > 0) {
      const profile = profileResult.rows[0];
      await railwayClient.query(`
        INSERT INTO profile (
          name, brief_intro, education_categories, tools_order, industries_order, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          brief_intro = EXCLUDED.brief_intro,
          education_categories = EXCLUDED.education_categories,
          tools_order = EXCLUDED.tools_order,
          industries_order = EXCLUDED.industries_order,
          updated_at = EXCLUDED.updated_at
      `, [
        profile.name,
        profile.brief_intro,
        profile.education_categories,
        profile.tools_order,
        profile.industries_order,
        profile.updated_at
      ]);
      console.log('Profile data migrated successfully');
    }

    // Migrate experiences data
    console.log('Migrating experiences data...');
    const experiencesResult = await neonClient.query('SELECT * FROM experiences ORDER BY start_date DESC');
    
    // Clear existing experiences first
    await railwayClient.query('DELETE FROM experiences');
    
    for (const exp of experiencesResult.rows) {
      await railwayClient.query(`
        INSERT INTO experiences (
          job_title, company, industry, start_date, end_date, is_current_job,
          description, accomplishments, tools
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        exp.job_title,
        exp.company,
        exp.industry,
        exp.start_date,
        exp.end_date,
        exp.is_current_job,
        exp.description,
        exp.accomplishments,
        exp.tools || []
      ]);
    }
    console.log(`Migrated ${experiencesResult.rows.length} experiences`);

    // Migrate education data
    console.log('Migrating education data...');
    const educationResult = await neonClient.query('SELECT * FROM education ORDER BY date DESC');
    
    // Clear existing education first
    await railwayClient.query('DELETE FROM education');
    
    for (const edu of educationResult.rows) {
      await railwayClient.query(`
        INSERT INTO education (
          name, category, link, date, sort_order
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        edu.name,
        edu.category,
        edu.link,
        edu.date,
        edu.sort_order || 0
      ]);
    }
    console.log(`Migrated ${educationResult.rows.length} education records`);

    // Migrate case studies data
    console.log('Migrating case studies data...');
    const caseStudiesResult = await neonClient.query('SELECT * FROM case_studies ORDER BY created_at DESC');
    
    // Clear existing case studies first
    await railwayClient.query('DELETE FROM case_studies');
    
    for (const cs of caseStudiesResult.rows) {
      await railwayClient.query(`
        INSERT INTO case_studies (
          title, slug, description, content, featured_image, tags,
          is_published, is_featured, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        cs.title,
        cs.slug,
        cs.description,
        cs.content,
        cs.featured_image,
        cs.tags,
        cs.is_published,
        cs.is_featured,
        cs.created_at,
        cs.updated_at
      ]);
    }
    console.log(`Migrated ${caseStudiesResult.rows.length} case studies`);

    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await neonClient.end();
    await railwayClient.end();
  }
}

migrateData();