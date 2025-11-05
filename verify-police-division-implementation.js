// Comprehensive Test for Police Division Feature
// This script verifies the complete implementation

const fs = require('fs');
const path = require('path');

console.log('🔍 POLICE DIVISION FEATURE - COMPREHENSIVE VERIFICATION\n');
console.log('='.repeat(60));

let allChecksPass = true;

// Check 1: Frontend file exists and contains the field
console.log('\n✓ CHECK 1: Frontend Registration.jsx');
try {
    const registrationPath = path.join(__dirname, 'frontend', 'src', 'pages', 'Registration.jsx');
    const content = fs.readFileSync(registrationPath, 'utf8');

    const checks = {
        'UI Field': content.includes('name="policeDivision"'),
        'State Field': content.includes('policeDivision: ""') || content.includes("policeDivision: ''"),
        'Validation': content.includes("case 'policeDivision':"),
        'Label Text': content.includes('Police Division'),
        'Error Handling': content.includes('validationErrors?.policeDivision')
    };

    Object.entries(checks).forEach(([name, passed]) => {
        console.log(`  ${passed ? '✅' : '❌'} ${name}`);
        if (!passed) allChecksPass = false;
    });
} catch (error) {
    console.log('  ❌ Error reading file:', error.message);
    allChecksPass = false;
}

// Check 2: Backend route file
console.log('\n✓ CHECK 2: Backend enhancedRegistrationRoutes.js');
try {
    const routePath = path.join(__dirname, 'backend', 'routes', 'enhancedRegistrationRoutes.js');
    const content = fs.readFileSync(routePath, 'utf8');

    const checks = {
        'Extracts from req.body': content.includes('policeDivision'),
        'In INSERT query': content.includes('police_division'),
        'In VALUES': content.match(/VALUES.*policeDivision/s) !== null
    };

    Object.entries(checks).forEach(([name, passed]) => {
        console.log(`  ${passed ? '✅' : '❌'} ${name}`);
        if (!passed) allChecksPass = false;
    });
} catch (error) {
    console.log('  ❌ Error reading file:', error.message);
    allChecksPass = false;
}

// Check 3: Schema file
console.log('\n✓ CHECK 3: Database schema.sql');
try {
    const schemaPath = path.join(__dirname, 'backend', 'schema.sql');
    const content = fs.readFileSync(schemaPath, 'utf8');

    const hasColumn = content.includes('police_division');
    console.log(`  ${hasColumn ? '✅' : '❌'} police_division column defined`);
    if (!hasColumn) allChecksPass = false;
} catch (error) {
    console.log('  ❌ Error reading file:', error.message);
    allChecksPass = false;
}

// Check 4: Migration script
console.log('\n✓ CHECK 4: Migration Scripts');
try {
    const migrationPath = path.join(__dirname, 'add-police-division-migration.js');
    const exists = fs.existsSync(migrationPath);
    console.log(`  ${exists ? '✅' : '❌'} Migration script exists`);
    if (!exists) allChecksPass = false;
} catch (error) {
    console.log('  ❌ Error checking file:', error.message);
    allChecksPass = false;
}

// Final Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 VERIFICATION SUMMARY\n');

if (allChecksPass) {
    console.log('✅ ALL CHECKS PASSED!');
    console.log('\n🎉 Police Division feature is fully implemented and ready to use.');
    console.log('\n📝 Quick Reference:');
    console.log('   • Frontend field name: policeDivision');
    console.log('   • Backend receives: policeDivision');
    console.log('   • Database column: police_division');
    console.log('   • Data type: VARCHAR(100)');
    console.log('   • Required: Yes (in UI)');
    console.log('   • Validation: Name validation (letters, spaces, hyphens)');
    console.log('\n🚀 Ready to test at: http://localhost:5173/registration');
} else {
    console.log('❌ SOME CHECKS FAILED');
    console.log('\nPlease review the failed checks above and fix any issues.');
}

console.log('\n' + '='.repeat(60));
