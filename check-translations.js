var fs = require('fs');
const glob = require('glob');

const checkForEmptyString = (obj, keyName = '') => {
    if (obj?.constructor === Object) {
        const out = Object.keys(obj).reduce((acc, key) => {
            const check = checkForEmptyString(obj[key], `${keyName}.${key}`);

            if (Array.isArray(check)) {
                acc = [...acc, ...check];
            } else {
                if (check === '') {
                    acc = [...acc, `${keyName}.${key}`];
                }
            }

            return acc;
        }, []);
        return out;
    }

    return obj;
};

const paths = glob.sync('./src/assets/i18n/*.json');

const emptyKeys = {};

paths.forEach((path) => {
    var contents = fs.readFileSync(path);
    const obj = JSON.parse(contents);
    const checked = checkForEmptyString(obj);
    if (checked.length) {
        emptyKeys[path] = checked;
    }
});

if (Object.keys(emptyKeys).length) {
    console.info('emptyKeys', emptyKeys);
    throw new Error(
        `⚠️  Some keys are not yet translated (${Object.keys(emptyKeys).reduce(
            (acc, key) => acc + emptyKeys[key].length,
            0
        )}) keys`
    );
} else {
    console.info('✅ All keys are translated');
}
