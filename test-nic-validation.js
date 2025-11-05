/**
 * Test Suite for Sri Lankan NIC Validation
 * Run this file in browser console or Node.js to verify NIC validation
 */

// Import or paste the validateNIC function here for testing
const validateNIC = (nic) => {
    if (!nic || typeof nic !== 'string') {
        return { valid: false, message: 'NIC is required' };
    }

    const trimmedNIC = nic.trim();

    // Old NIC format: 9 digits + 1 letter (V or X) - Total 10 characters
    const oldNICPattern = /^[0-9]{9}[VXvx]$/;

    // New NIC format: 12 digits only - Total 12 characters
    const newNICPattern = /^[0-9]{12}$/;

    if (oldNICPattern.test(trimmedNIC)) {
        return { valid: true, type: 'old', message: 'Valid old NIC format' };
    } else if (newNICPattern.test(trimmedNIC)) {
        return { valid: true, type: 'new', message: 'Valid new NIC format' };
    } else {
        return {
            valid: false,
            message: 'Invalid NIC format. Use either old format (9 digits + V/X) or new format (12 digits)'
        };
    }
};

// Test Cases
console.log('🧪 Testing Sri Lankan NIC Validation\n');
console.log('='.repeat(60));

// Old NIC Format Tests
console.log('\n📋 OLD NIC FORMAT TESTS (9 digits + V/X)');
console.log('-'.repeat(60));

const oldNICTests = [
    { nic: '902541234V', expected: true, description: 'Valid old NIC with V' },
    { nic: '852341234X', expected: true, description: 'Valid old NIC with X' },
    { nic: '902541234v', expected: true, description: 'Valid old NIC with lowercase v' },
    { nic: '852341234x', expected: true, description: 'Valid old NIC with lowercase x' },
    { nic: '123456789V', expected: true, description: 'Valid old NIC different digits' },
    { nic: '90254123V', expected: false, description: 'Invalid - only 8 digits' },
    { nic: '9025412345', expected: false, description: 'Invalid - no V/X' },
    { nic: '902541234A', expected: false, description: 'Invalid - wrong letter (A)' },
    { nic: '902541234VV', expected: false, description: 'Invalid - extra V' },
    { nic: '90254123V4', expected: false, description: 'Invalid - digit after V' },
];

oldNICTests.forEach(({ nic, expected, description }) => {
    const result = validateNIC(nic);
    const status = result.valid === expected ? '✅' : '❌';
    console.log(`${status} ${description}`);
    console.log(`   Input: "${nic}"`);
    console.log(`   Result: ${result.valid ? 'VALID' : 'INVALID'} - ${result.message}`);
    console.log(`   Expected: ${expected ? 'VALID' : 'INVALID'}`);
    if (result.valid === expected) {
        console.log(`   ✅ TEST PASSED`);
    } else {
        console.log(`   ❌ TEST FAILED`);
    }
    console.log('');
});

// New NIC Format Tests
console.log('\n📋 NEW NIC FORMAT TESTS (12 digits)');
console.log('-'.repeat(60));

const newNICTests = [
    { nic: '200254123456', expected: true, description: 'Valid new NIC' },
    { nic: '199812345678', expected: true, description: 'Valid new NIC (1998)' },
    { nic: '200012345678', expected: true, description: 'Valid new NIC (2000)' },
    { nic: '202312345678', expected: true, description: 'Valid new NIC (2023)' },
    { nic: '20025412345', expected: false, description: 'Invalid - only 11 digits' },
    { nic: '2002541234567', expected: false, description: 'Invalid - 13 digits' },
    { nic: '200254123456V', expected: false, description: 'Invalid - has letter' },
    { nic: '20025412345X', expected: false, description: 'Invalid - has X' },
    { nic: '200254-123456', expected: false, description: 'Invalid - has dash' },
    { nic: '200 254 123456', expected: false, description: 'Invalid - has spaces' },
];

newNICTests.forEach(({ nic, expected, description }) => {
    const result = validateNIC(nic);
    const status = result.valid === expected ? '✅' : '❌';
    console.log(`${status} ${description}`);
    console.log(`   Input: "${nic}"`);
    console.log(`   Result: ${result.valid ? 'VALID' : 'INVALID'} - ${result.message}`);
    console.log(`   Expected: ${expected ? 'VALID' : 'INVALID'}`);
    if (result.valid === expected) {
        console.log(`   ✅ TEST PASSED`);
    } else {
        console.log(`   ❌ TEST FAILED`);
    }
    console.log('');
});

// Edge Cases
console.log('\n📋 EDGE CASES');
console.log('-'.repeat(60));

const edgeCases = [
    { nic: '', expected: false, description: 'Empty string' },
    { nic: null, expected: false, description: 'Null value' },
    { nic: undefined, expected: false, description: 'Undefined value' },
    { nic: '   902541234V   ', expected: true, description: 'Valid with spaces (should trim)' },
    { nic: 'ABCDEFGHIJV', expected: false, description: 'All letters except last V' },
    { nic: '000000000V', expected: true, description: 'All zeros with V' },
    { nic: '999999999V', expected: true, description: 'All nines with V' },
];

edgeCases.forEach(({ nic, expected, description }) => {
    const result = validateNIC(nic);
    const status = result.valid === expected ? '✅' : '❌';
    console.log(`${status} ${description}`);
    console.log(`   Input: "${nic}"`);
    console.log(`   Result: ${result.valid ? 'VALID' : 'INVALID'} - ${result.message}`);
    console.log(`   Expected: ${expected ? 'VALID' : 'INVALID'}`);
    if (result.valid === expected) {
        console.log(`   ✅ TEST PASSED`);
    } else {
        console.log(`   ❌ TEST FAILED`);
    }
    console.log('');
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(60));

const allTests = [...oldNICTests, ...newNICTests, ...edgeCases];
const passedTests = allTests.filter(({ nic, expected }) => {
    const result = validateNIC(nic);
    return result.valid === expected;
}).length;
const totalTests = allTests.length;

console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${totalTests - passedTests}`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);

if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! 🎉');
} else {
    console.log('\n⚠️  SOME TESTS FAILED');
}

console.log('='.repeat(60));
