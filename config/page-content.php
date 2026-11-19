<?php

/*
 * The pages whose texts the PCT team edits in Admin → Content → Pages. Each class describes
 * the sections and fields of one page, with the text the page shows by default. After adding
 * or changing one, run `php artisan page-content:types`. See docs/modernization/PAGE_CONTENT.md.
 */
return [
    'pages' => [
        App\Content\Pages\ContactPage::class,
        App\Content\Pages\AboutPage::class,
        App\Content\Pages\DatabasePages::class,
        App\Content\Pages\HomePage::class,
        App\Content\Pages\HelpPage::class,
        App\Content\Pages\NewsPage::class,
        App\Content\Pages\SiteChrome::class,
        App\Content\Pages\AuthPages::class,
        App\Content\Pages\WorkspacePages::class,
    ],
];
