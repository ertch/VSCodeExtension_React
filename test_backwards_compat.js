const { generateHTML } = require('./src/generator/CodeGenerator');

const testEntity = {
  type: 'Button',
  inputs: { name: 'btn1', class: 'primary' }
};

try {
  const result = generateHTML(testEntity);
  console.log('✓ generateHTML() works');
  console.log('✓ Result:', JSON.stringify(result, null, 2));
} catch (error) {
  console.log('✗ generateHTML() failed:', error.message);
}
