/// <reference types="node" />
import { main } from './cv-creator';

// Run the test
main()
    .then(() => {
        console.log('\n🎉 CV generation test passed!');
    })
    .catch((error) => {
        console.error('\n❌ CV generation test failed:', error);
        process.exit(1);
    });
