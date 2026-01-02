/**
 * Master Test Runner - Run All Offline Mode Tests
 *
 * This script runs all individual workflow tests in sequence:
 * 1. Customer Contact Unlock
 * 2. Promoter Property Submission
 * 3. Admin Approval & Rejection
 * 4. Complete MVP End-to-End
 *
 * Use this to verify the entire offline MVP in one command.
 */

import { execSync } from 'child_process';

const tests = [
  {
    name: 'Customer Contact Unlock',
    script: 'scripts/test_offline_customer_unlock.ts',
    description: 'Tests FREE contact unlock workflow'
  },
  {
    name: 'Promoter Property Submission',
    script: 'scripts/test_offline_promoter_submit.ts',
    description: 'Tests property submission and PENDING status'
  },
  {
    name: 'Admin Approval & Rejection',
    script: 'scripts/test_offline_admin_approval.ts',
    description: 'Tests admin review workflow (approve/reject)'
  },
  {
    name: 'Complete MVP End-to-End',
    script: 'scripts/test_offline_complete_mvp.ts',
    description: 'Tests full workflow from submission to unlock'
  },
];

let passedTests = 0;
let failedTests = 0;

console.log('='.repeat(70));
console.log('HOULND REALTY OFFLINE MVP - MASTER TEST SUITE');
console.log('='.repeat(70));
console.log();

for (const test of tests) {
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`Running: ${test.name}`);
  console.log(`Description: ${test.description}`);
  console.log('─'.repeat(70));
  console.log();

  try {
    execSync(`npx tsx ${test.script}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    passedTests++;
    console.log(`\n✅ ${test.name} - PASSED\n`);
  } catch (error) {
    failedTests++;
    console.error(`\n❌ ${test.name} - FAILED\n`);
  }
}

console.log('\n' + '='.repeat(70));
console.log('TEST SUITE SUMMARY');
console.log('='.repeat(70));
console.log(`Total Tests: ${tests.length}`);
console.log(`Passed: ${passedTests} ✅`);
console.log(`Failed: ${failedTests} ❌`);
console.log('='.repeat(70));

if (failedTests === 0) {
  console.log('\n🎉 ALL TESTS PASSED! MVP IS COMPLETE AND VERIFIED! 🎉\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Review the output above. ⚠️\n');
  process.exit(1);
}
