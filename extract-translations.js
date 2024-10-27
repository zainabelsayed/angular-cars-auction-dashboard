const fs = require('fs');
const glob = require('glob');

// Specify output files for different languages
const outputFiles = {
    en: './src/assets/i18n/en.json',
    ar: './src/assets/i18n/ar.json',
    ur: './src/assets/i18n/ur.json',
    ku: './src/assets/i18n/ku.json',
    // Add more languages as needed
};

// Initialize translations for each language
const translations = {
    en: {},
    ar: {},
    ur: {},
    ku: {},
};

// Function to load existing translations from file
const loadExistingTranslations = () => {
    Object.keys(outputFiles).forEach((lang) => {
        if (fs.existsSync(outputFiles[lang])) {
            translations[lang] = JSON.parse(
                fs.readFileSync(outputFiles[lang], 'utf8')
            );
        } else {
            translations[lang] = {};
        }
    });
};

// Function to add a translation if it doesn't exist
const addTranslation = (key, lang) => {
    const parts = key.split('.'); // Split the key into parts
    let current = translations[lang]; // Start at the top level of the translations object

    parts.forEach((part, index) => {
        if (!current[part]) {
            if (index === parts.length - 1) {
                current[part] = ''; // Only set the value if it's the last part
            } else {
                current[part] = {}; // Create a nested object if it's not the last part
            }
        }
        current = current[part]; // Move deeper into the nested structure
    });
};

// Extract translations from HTML and TypeScript files
const extractTranslations = () => {
    const htmlFiles = glob.sync('./src/app/**/*.html');
    const tsFiles = glob.sync('./src/app/**/*.ts');

    // Extract translations from HTML files
    htmlFiles.forEach((file) => {
        const content = fs.readFileSync(file, 'utf8');
        const regex = /{{\s*'([^']+)'[^}]*\|\s*translate\s*}}/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            const key = match[1];
            Object.keys(outputFiles).forEach((lang) => {
                if (!hasTranslation(key, lang)) {
                    addTranslation(key, lang);
                }
            });
        }
    });

    // Extract translations from TypeScript files
    tsFiles.forEach((file) => {
        const content = fs.readFileSync(file, 'utf8');
        const regex = /this\.translate\.instant\('([^']+)'\)/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            const key = match[1];
            Object.keys(outputFiles).forEach((lang) => {
                if (!hasTranslation(key, lang)) {
                    addTranslation(key, lang);
                }
            });
        }
    });
};

// Function to check if a translation key exists for a specific language
const hasTranslation = (key, lang) => {
    const parts = key.split('.');
    let current = translations[lang];

    return parts.every((part) => {
        if (current && typeof current === 'object' && part in current) {
            current = current[part];
            return true;
        }
        return false;
    });
};

// Write translations to separate output files
const writeTranslations = () => {
    Object.keys(outputFiles).forEach((lang) => {
        fs.writeFileSync(
            outputFiles[lang],
            JSON.stringify(translations[lang], null, 2)
        );
    });
};

// Main function to load existing translations, extract new ones, and write to files
const main = () => {
    loadExistingTranslations();
    extractTranslations();
    writeTranslations();
};

main();
