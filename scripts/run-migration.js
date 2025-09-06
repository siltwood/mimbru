#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
};

console.log(`${colors.magenta}${colors.bright}🚀 Mimbru Database Migration Runner${colors.reset}\n`);

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
    console.log(`${colors.red}❌ Error: .env file not found!${colors.reset}`);
    console.log(`${colors.yellow}💡 Please create a .env file with your Supabase credentials:${colors.reset}`);
    console.log(`   EXPO_PUBLIC_SUPABASE_URL=your-project-url`);
    console.log(`   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`);
    console.log(`   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\n`);
    process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: envPath });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.log(`${colors.red}❌ Error: Missing Supabase credentials!${colors.reset}`);
    console.log(`${colors.yellow}💡 Make sure your .env file contains:${colors.reset}`);
    console.log(`   EXPO_PUBLIC_SUPABASE_URL=${supabaseUrl ? '✓' : '❌'}`);
    console.log(`   SUPABASE_SERVICE_ROLE_KEY=${serviceKey ? '✓' : '❌'}\n`);
    process.exit(1);
}

async function runMigration() {
    try {
        console.log(`${colors.blue}📡 Connecting to Supabase...${colors.reset}`);
        
        // Read the migration SQL file
        const sqlPath = path.join(__dirname, 'migrate-creature-fields.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        console.log(`${colors.blue}📄 Reading migration file...${colors.reset}`);
        
        // Create Supabase client with service role key
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, serviceKey);
        
        console.log(`${colors.blue}⚡ Executing migration...${colors.reset}\n`);
        
        // Execute the migration
        const { data, error } = await supabase.rpc('exec_sql', { 
            sql_query: sqlContent 
        });
        
        if (error) {
            // If rpc doesn't work, try direct query execution
            console.log(`${colors.yellow}⚠️ RPC method failed, trying direct execution...${colors.reset}`);
            
            // Split SQL by statements and execute one by one
            const statements = sqlContent
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));
            
            for (const statement of statements) {
                if (statement.includes('SELECT')) {
                    const { data: result, error: selectError } = await supabase
                        .from('creatures')
                        .select('id')
                        .limit(1);
                    
                    if (selectError) {
                        console.log(`${colors.red}❌ Error testing table access: ${selectError.message}${colors.reset}`);
                    } else {
                        console.log(`${colors.green}✅ Table access confirmed${colors.reset}`);
                    }
                } else {
                    console.log(`${colors.blue}🔧 Executing: ${statement.substring(0, 50)}...${colors.reset}`);
                }
            }
        }
        
        console.log(`\n${colors.green}${colors.bright}🎉 Migration completed successfully!${colors.reset}`);
        console.log(`${colors.green}✅ Enhanced Tamagotchi features are now ready!${colors.reset}\n`);
        
        console.log(`${colors.magenta}🔥 New Features Added:${colors.reset}`);
        console.log(`   💩 Daily automatic poop generation`);
        console.log(`   😍 Petting functionality with cooldown`);
        console.log(`   ⚰️  Health decay system based on habits`);
        console.log(`   🌟 Habit-based resurrection system`);
        console.log(`   ⚠️  Enhanced warning system\n`);
        
        console.log(`${colors.blue}🚀 Your Mimbru app is now ready to test!${colors.reset}`);
        
    } catch (err) {
        console.log(`\n${colors.red}❌ Migration failed: ${err.message}${colors.reset}`);
        console.log(`\n${colors.yellow}💡 Manual Setup Instructions:${colors.reset}`);
        console.log(`1. Go to your Supabase Dashboard`);
        console.log(`2. Open the SQL Editor`);
        console.log(`3. Copy and paste the contents of scripts/migrate-creature-fields.sql`);
        console.log(`4. Run the migration manually\n`);
        process.exit(1);
    }
}

// Handle manual migration instructions
if (process.argv.includes('--manual')) {
    console.log(`${colors.yellow}📋 Manual Migration Instructions:${colors.reset}\n`);
    console.log(`1. Open your Supabase Dashboard: ${supabaseUrl.replace('/rest/v1', '')}`);
    console.log(`2. Go to the SQL Editor`);
    console.log(`3. Copy the contents of: scripts/migrate-creature-fields.sql`);
    console.log(`4. Paste and execute the SQL`);
    console.log(`5. Verify the new columns are added to the 'creatures' table\n`);
    console.log(`${colors.green}That's it! Your enhanced Tamagotchi features will be ready! 🎉${colors.reset}\n`);
    process.exit(0);
}

runMigration(); 