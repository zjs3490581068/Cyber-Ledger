const fs = require('fs');
const files = [
    'src/pages/Home.jsx',
    'src/pages/Transactions.jsx',
    'src/pages/Stats.jsx',
    'src/pages/Settings.jsx',
    'src/pages/Accounts.jsx',
    'src/components/TransactionForm.jsx',
    'src/components/ConfigManagers.jsx'
];

files.forEach(f => {
    if (!fs.existsSync(f)) return;
    let content = fs.readFileSync(f, 'utf8');

    // Handle UI imports
    const utilsRegex = /import\s+\{([^}]+)\}\s+from\s+['\"](\.\.\/utils)['\"]/;
    if (utilsRegex.test(content)) {
        content = content.replace(utilsRegex, (match, p1, p2) => {
            let imports = p1.split(',').map(s => s.trim()).filter(Boolean);
            if (!imports.includes('formatLocalDate')) imports.push('formatLocalDate');
            if (!imports.includes('formatLocalTime')) imports.push('formatLocalTime');
            return `import { ${imports.join(', ')} } from '${p2}'`;
        });
    } else {
        // inject import dynamically if it doesn't exist
        const importPath = f.startsWith('src/pages') ? '../utils' : '../utils';
        const importStmt = `\nimport { formatLocalDate, formatLocalTime } from '${importPath}';\n`;
        // insert after first import
        content = content.replace(/(import.*?;)/, `$1${importStmt}`);
    }

    // Handle replacements
    content = content.replace(/new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]/g, 'formatLocalDate()');
    content = content.replace(/currentPayDate\.toISOString\(\)\.split\('T'\)\[0\]/g, 'formatLocalDate(currentPayDate)');
    content = content.replace(/new Date\(\)\.toISOString\(\)/g, 'formatLocalTime()');

    fs.writeFileSync(f, content);
});
console.log('done replacing');
