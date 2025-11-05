// Test script to verify Province dropdown implementation
const fs = require('fs');
const path = require('path');

console.log('🔍 PROVINCE DROPDOWN - VERIFICATION\n');
console.log('='.repeat(60));

let allChecksPass = true;

// Check 1: Frontend has dropdown with all provinces
console.log('\n✓ CHECK 1: Frontend Registration.jsx - Dropdown Implementation');
try {
    const registrationPath = path.join(__dirname, 'frontend', 'src', 'pages', 'Registration.jsx');
    const content = fs.readFileSync(registrationPath, 'utf8');

    const provinces = [
        'Western', 'Central', 'Southern', 'Eastern', 'Northern',
        'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
    ];

    const checks = {
        'Has select element': content.includes('<select') && content.includes('name="spaProvince"'),
        'Has default option': content.includes('Select Province'),
        'Changed from input to select': !content.match(/<input[^>]*name="spaProvince"[^>]*type="text"/),
    };

    // Check each province
    provinces.forEach(province => {
        checks[`Province: ${province}`] = content.includes(`<option value="${province}">`);
    });

    Object.entries(checks).forEach(([name, passed]) => {
        console.log(`  ${passed ? '✅' : '❌'} ${name}`);
        if (!passed) allChecksPass = false;
    });
} catch (error) {
    console.log('  ❌ Error reading file:', error.message);
    allChecksPass = false;
}

// Check 2: Backend still receives spaProvince
console.log('\n✓ CHECK 2: Backend Field Name Consistency');
try {
    const routePath = path.join(__dirname, 'backend', 'routes', 'enhancedRegistrationRoutes.js');
    const content = fs.readFileSync(routePath, 'utf8');

    const checks = {
        'Backend extracts spaProvince': content.includes('spaProvince'),
        'Used in fullAddress': content.includes('spaProvince') && content.includes('fullAddress')
    };

    Object.entries(checks).forEach(([name, passed]) => {
        console.log(`  ${passed ? '✅' : '❌'} ${name}`);
        if (!passed) allChecksPass = false;
    });
} catch (error) {
    console.log('  ❌ Error reading file:', error.message);
    allChecksPass = false;
}

// Final Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 VERIFICATION SUMMARY\n');

if (allChecksPass) {
    console.log('✅ ALL CHECKS PASSED!');
    console.log('\n🎉 Province dropdown is fully implemented!');
    console.log('\n📝 Quick Reference:');
    console.log('   • Field type: <select> dropdown');
    console.log('   • Field name: spaProvince (unchanged)');
    console.log('   • Province options: 9 provinces of Sri Lanka');
    console.log('   • Backend receives: spaProvince (same as before)');
    console.log('   • Database column: province (stored in fullAddress)');
    console.log('\n📋 Available Provinces:');
    console.log('   1. Western');
    console.log('   2. Central');
    console.log('   3. Southern');
    console.log('   4. Eastern');
    console.log('   5. Northern');
    console.log('   6. North Western');
    console.log('   7. North Central');
    console.log('   8. Uva');
    console.log('   9. Sabaragamuwa');
    console.log('\n🚀 Ready to test at: http://localhost:5173/registration');
} else {
    console.log('❌ SOME CHECKS FAILED');
    console.log('\nPlease review the failed checks above.');
}

console.log('\n' + '='.repeat(60));
