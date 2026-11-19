<?php

namespace App\Content;

/**
 * The editable texts of one page: its sections and fields, with the text the page shows by
 * default. The layout stays in the React page; only these values come from the admin.
 * Register a schema in config/page-content.php. See docs/modernization/PAGE_CONTENT.md.
 */
abstract class PageSchema
{
    /** The key the page and the admin use, e.g. 'contact'. Never change it once stored. */
    public string $key;

    /** The name in the admin list, e.g. 'Contact'. */
    public string $title;

    /** Where the page is on the site, for "View page"; null for parts shown on every page (footer). */
    public ?string $url = null;

    /** Shown on every page: shared with every Inertia response as `siteContent.<key>`. */
    public bool $shared = false;

    /** One line in the admin under the title. */
    public ?string $description = null;

    /** @return list<Section> */
    abstract public function sections(): array;
}
