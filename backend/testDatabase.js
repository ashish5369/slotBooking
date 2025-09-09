const DatabaseService = require('./services/databaseService');

async function testDatabase() {
    console.log('🧪 Testing Database Service...\n');

    const db = new DatabaseService();

    try {
        // Test getting slots
        const slots = await db.getAllSlots();
        console.log(`✅ Found ${slots.length} slots`);
        console.log('First slot:', slots[0]);

        // Test getting candidates
        const candidates = await db.getAllCandidates();
        console.log(`\n✅ Found ${candidates.length} candidates`);
        console.log('Candidates:', candidates.map(c => `${c.name} (${c.email})`));

        // Test candidate validation
        const isValid = await db.validateCandidate('John Doe', 'john.doe@example.com');
        console.log(`\n✅ Candidate validation test: ${isValid ? 'PASSED' : 'FAILED'}`);

        // Test Excel export
        console.log('\n📊 Testing Excel export...');
        const exportPath = await db.exportToExcel();
        console.log(`✅ Excel exported to: ${exportPath}`);

        console.log('\n🎉 All tests passed!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        db.close();
    }
}

testDatabase();
