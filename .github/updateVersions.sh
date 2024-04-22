VERSION=$(node -p -e "require('./package.json').version")
NEW_VERSION=$(echo $VERSION | awk -F. -v OFS=. '{$NF++;print}')
node -e "const pkg = require('./package.json'); pkg.version = '$NEW_VERSION'; require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));"
