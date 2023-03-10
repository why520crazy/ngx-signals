module.exports = {
    allowBranch: ['master', 'v0.*'],
    bumpFiles: ['package.json', 'package-lock.json', 'src/package.json', 'src/signals/version.ts'],
    commitAll: true,
    header: 'Changelog\nAll notable changes to ngx-signals will be documented in this file.\n',
    hooks: {
        prepublish: 'npm run build',
        postreleaseBranch: 'git add .'
    }
};
