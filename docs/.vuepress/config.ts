import { defineUserConfig } from "vuepress";
import { defaultTheme } from "@vuepress/theme-default";
import { viteBundler } from "@vuepress/bundler-vite";

export default defineUserConfig({
  base: "/plasmabot-docs/",
  lang: "ru-RU",
  title: "Плазмобот",
  description:
    "Руководство пользователя: плазменный ЧПУ-станок с рукой SCARA - от распаковки до реза металла",

  bundler: viteBundler(),

  theme: defaultTheme({
    contributors: false,
    lastUpdatedText: "Обновлено",
    notFound: ["Страница не найдена"],
    backToHome: "На главную",
    toggleColorMode: "Тема",
    toggleSidebar: "Меню",

    navbar: [
      { text: "Станок", link: "/machine/intro.html" },
      { text: "Редактор", link: "/editor/ui-overview.html" },
      { text: "Рез", link: "/cut/cut-settings.html" },
      { text: "CAM-ядро", link: "/cam/" },
      { text: "Лог", link: "/log/" },
    ],

    sidebar: {
      "/machine/": [
        {
          text: "Станок и подключение",
          children: [
            "/machine/intro.md",
            "/machine/safety.md",
            "/machine/unboxing.md",
            "/machine/network.md",
            "/machine/first-connect.md",
            "/machine/config-page.md",
          ],
        },
      ],
      "/editor/": [
        {
          text: "Редактор",
          children: [
            "/editor/ui-overview.md",
            "/editor/toolbar.md",
            "/editor/panels.md",
            "/editor/scene-editing.md",
            "/editor/dimensions.md",
            "/editor/import.md",
          ],
        },
      ],
      "/cut/": [
        {
          text: "Рез: настройка и превью",
          children: [
            "/cut/cut-settings.md",
            "/cut/scara-arm.md",
            "/cut/preview-gcode.md",
          ],
        },
        {
          text: "Резка металла",
          children: [
            "/cut/prepare-cut.md",
            "/cut/cutting.md",
            "/cut/console.md",
            "/cut/troubleshooting.md",
          ],
        },
      ],
      "/cam/": [
        {
          text: "CAM-ядро",
          children: ["/cam/README.md"],
        },
      ],
      "/log/": "heading",
    },
  }),
});
