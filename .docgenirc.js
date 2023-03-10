/**
 * @type {import('@docgeni/core').DocgeniConfig}
 */
module.exports = {
  mode: "full",
  title: "ngx-signals",
  description: "",
  docsDir: "docs",
  navs: [
    null,
    {
      title: "Components",
      path: "components",
      lib: "ngx-signals",
      locales: {},
    },
  ],
  libs: [
    {
      name: "ngx-signals",
      rootDir: "src",
      include: ["src", "src/lib"],
      categories: [],
    },
  ],
};
