const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'lsa_spa_management'
};

async function createAnnualPaymentTestData() {
    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('🔗 Connected to database');

        // Create some annual payment test data
        const annualPayments = [
            {
                spa_id: 1,
                reference_number: 'ANN2025001',
                payment_type: 'annual',
                payment_method: 'bank_transfer',
                amount: 45000.00,
                payment_status: 'pending_approval',
                bank_slip_path: 'uploads/payment-slips/transfer-slip-1760706425271-718665642.jpg',
                created_at: '2025-01-15'
            },
            {
                spa_id: 2,
                reference_number: 'ANN2025002',
                payment_type: 'annual',
                payment_method: 'card',
                amount: 45000.00,
                payment_status: 'completed',
                bank_slip_path: null,
                created_at: '2025-02-20'
            },
            {
                spa_id: 3,
                reference_number: 'ANN2025003',
                payment_type: 'annual',
                payment_method: 'bank_transfer',
                amount: 45000.00,
                payment_status: 'completed',
                bank_slip_path: 'uploads/payment-slips/sample-slip-123.jpg',
                created_at: '2025-03-10'
            },
            {
                spa_id: 4,
                reference_number: 'ANN2025004',
                payment_type: 'annual',
                payment_method: 'bank_transfer',
                amount: 45000.00,
                payment_status: 'pending_approval',
                bank_slip_path: 'uploads/payment-slips/sample-slip-456.jpg',
                created_at: '2025-04-05'
            }
        ];

        // Delete existing test data if any
        await connection.execute("DELETE FROM payments WHERE reference_number LIKE 'ANN2025%'");
        console.log('🗑️ Cleared existing test data');

        // Insert new test data
        for (const payment of annualPayments) {
            await connection.execute(`
                INSERT INTO payments (
                    spa_id, reference_number, payment_type, payment_method, amount, 
                    payment_status, bank_slip_path, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                payment.spa_id,
                payment.reference_number,
                payment.payment_type,
                payment.payment_method,
                payment.amount,
                payment.payment_status,
                payment.bank_slip_path,
                payment.created_at
            ]);
        }

        console.log('✅ Created annual payment test data successfully');

        // Verify the data
        const [results] = await connection.execute(`
            SELECT * FROM payments WHERE payment_type = 'annual' ORDER BY created_at DESC LIMIT 10
        `);

        console.log(`\n📊 Found ${results.length} annual payments:`);
        results.forEach((payment, index) => {
            console.log(`${index + 1}. ${payment.reference_number} - ${payment.payment_status} - LKR ${payment.amount}`);
        });

    } catch (error) {
        console.error('❌ Error creating test data:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('📤 Database connection closed');
        }
    }
}

createAnnualPaymentTestData();